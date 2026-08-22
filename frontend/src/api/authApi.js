import axiosClient from './axiosClient';

/**
 * Thin wrapper around the /auth endpoints. Components/store call these
 * instead of hitting axiosClient directly, so the request shape lives
 * in one place.
 */
export const authApi = {
  // `role` is the role the user picked on the login dropdown. The
  // backend must verify this matches the account's actual `role` field
  // in Admin.js and reject the login (401/403) if it doesn't — the
  // dropdown is a UX convenience, not the source of truth for access.
  login: (email, password, role) =>
    axiosClient.post('/auth/login', { email, password, role }).then((res) => res.data),

  setPassword: (token, password) =>
    axiosClient.post('/auth/set-password', { token, password }).then((res) => res.data),

  me: () => axiosClient.get('/auth/me').then((res) => res.data),

  logout: () => axiosClient.post('/auth/logout').then((res) => res.data),
};
