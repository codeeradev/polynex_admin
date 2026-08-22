import axios from 'axios';

const TOKEN_KEY = 'polynexai_admin_token';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ---- Active election scoping -------------------------------------------
// Kept as a plain module-level variable (not React/Zustand state) so it
// can be read synchronously inside the request interceptor below.
// useElectionStore calls setActiveElectionId() whenever the selection
// changes; every outgoing request then picks up whatever is current at
// request time. We deliberately do NOT import useElectionStore into this
// file — useElectionStore -> electionApi -> axiosClient already forms a
// chain, and importing the store back here would create the same kind
// of circular import the 401 handler below avoids for auth.
let activeElectionId = null;

export function setActiveElectionId(electionId) {
  activeElectionId = electionId;
}

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Backend contract: any endpoint whose data is election-scoped
  // (workers, leadership, surveys, responses, booths) reads this header
  // to filter/attach electionId. Endpoints that ignore it (auth, admin
  // management) are unaffected.
  if (activeElectionId) {
    config.headers['X-Election-Id'] = activeElectionId;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing/expired/invalid. Broadcast rather than importing
      // useAuthStore directly here — that would create a circular
      // import (store -> authApi -> axiosClient -> store). App.jsx
      // listens for this and clears the session / redirects to /login,
      // which is the "auto-logout on token expiry" behavior.
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new CustomEvent('polynexai:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
