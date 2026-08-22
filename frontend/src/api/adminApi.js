import axiosClient from './axiosClient';

/**
 * Thin wrapper around the /admins endpoints (SuperAdmin-only management
 * of other admin accounts: invite, role/region changes, disable).
 * Mirrors the pattern in authApi.js — components/store call these
 * instead of hitting axiosClient directly.
 */
export const adminApi = {
  list: () => axiosClient.get('/admins').then((res) => res.data),

  invite: (payload) =>
    // payload: { name, email, role, assignedRegion? }
    axiosClient.post('/admins/invite', payload).then((res) => res.data),

  update: (id, payload) =>
    // payload: partial update, e.g. { role, assignedRegion }
    axiosClient.patch(`/admins/${id}`, payload).then((res) => res.data),

  disable: (id) => axiosClient.patch(`/admins/${id}/disable`).then((res) => res.data),

  enable: (id) => axiosClient.patch(`/admins/${id}/enable`).then((res) => res.data),
};
