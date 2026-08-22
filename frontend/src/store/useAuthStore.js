// import axios from 'axios';

// const TOKEN_KEY = 'polynexai_admin_token';

// const axiosClient = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
//   headers: { 'Content-Type': 'application/json' },
// });

// // ---- Active election scoping -------------------------------------------
// // Kept as a plain module-level variable (not React/Zustand state) so it
// // can be read synchronously inside the request interceptor below.
// // useElectionStore calls setActiveElectionId() whenever the selection
// // changes; every outgoing request then picks up whatever is current at
// // request time. We deliberately do NOT import useElectionStore into this
// // file — useElectionStore -> electionApi -> axiosClient already forms a
// // chain, and importing the store back here would create the same kind
// // of circular import the 401 handler below avoids for auth.
// let activeElectionId = null;

// export function setActiveElectionId(electionId) {
//   activeElectionId = electionId;
// }

// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem(TOKEN_KEY);
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   // Backend contract: any endpoint whose data is election-scoped
//   // (workers, leadership, surveys, responses, booths) reads this header
//   // to filter/attach electionId. Endpoints that ignore it (auth, admin
//   // management) are unaffected.
//   if (activeElectionId) {
//     config.headers['X-Election-Id'] = activeElectionId;
//   }
//   return config;
// });

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // Token missing/expired/invalid. Broadcast rather than importing
//       // useAuthStore directly here — that would create a circular
//       // import (store -> authApi -> axiosClient -> store). App.jsx
//       // listens for this and clears the session / redirects to /login,
//       // which is the "auto-logout on token expiry" behavior.
//       localStorage.removeItem(TOKEN_KEY);
//       window.dispatchEvent(new CustomEvent('polynexai:unauthorized'));
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosClient;

import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { setActiveElectionId } from '../api/axiosClient';

// Must match the TOKEN_KEY constant in api/axiosClient.js exactly — that
// file reads this same localStorage key on every outgoing request.
const TOKEN_KEY = 'polynexai_admin_token';

/**
 * Auth/session state. Mirrors the pattern in useAdminStore/useElectionStore:
 * components/pages call these actions instead of hitting authApi directly.
 *
 * isHydrating starts true so ProtectedRoute can show a loading state
 * instead of bouncing straight to /login while we still don't know if a
 * stored token is valid.
 */
const useAuthStore = create((set, get) => ({
  user: null, // safe shape from Admin.toSafeJSON(): { id, name, email, role, assignedRegion, status, lastLoginAt }
  isAuthenticated: false,
  isHydrating: true,
  error: null,

  clearError: () => set({ error: null }),

  /**
   * Runs once on app mount (see App.jsx). If a token is already in
   * localStorage, verify it's still valid via /auth/me and restore the
   * session; otherwise leave the user logged out. Always ends by
   * clearing isHydrating so ProtectedRoute can make its redirect decision.
   */
  hydrate: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ isHydrating: false });
      return;
    }

    try {
      const result = await authApi.me();
      const user = result.user || result.admin || result;
      set({ user, isAuthenticated: true, isHydrating: false });
    } catch (err) {
      // Invalid/expired token — same cleanup as a 401 mid-session.
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, isAuthenticated: false, isHydrating: false });
    }
  },

  login: async (email, password, role) => {
    set({ error: null });
    try {
      const result = await authApi.login(email, password, role);
      const user = result.user || result.admin;
      const token = result.token;

      if (token) localStorage.setItem(TOKEN_KEY, token);
      set({ user, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      set({ error: message });
      return { success: false, message };
    }
  },

  setPassword: async (token, password) => {
    set({ error: null });
    try {
      const result = await authApi.setPassword(token, password);
      const user = result.user || result.admin;
      const authToken = result.token;

      // Setting the password also signs the admin in, same as login —
      // SetPassword.jsx navigates to '/' right after a successful result.
      if (authToken) localStorage.setItem(TOKEN_KEY, authToken);
      if (user) set({ user, isAuthenticated: true });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to set password.';
      set({ error: message });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Best-effort — clear the local session either way.
    }
    get().clearSession();
  },

  /**
   * Wipes the local session without calling the API. Used by:
   * - App.jsx's 'polynexai:unauthorized' listener (axiosClient's 401
   *   interceptor already invalidated the token server-side by definition)
   * - logout() above, after the API call settles
   */
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    setActiveElectionId(null); // don't leak the previous session's election scope
    set({ user: null, isAuthenticated: false, error: null });
  },
}));

export default useAuthStore;
