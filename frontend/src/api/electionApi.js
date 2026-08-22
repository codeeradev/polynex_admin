import axiosClient from './axiosClient';

/**
 * Thin wrapper around the /elections endpoints. Components/store call
 * these instead of hitting axiosClient directly, so the request shape
 * lives in one place (same pattern as authApi.js and adminApi.js).
 */
export const electionApi = {
  list: () => axiosClient.get('/elections').then((res) => res.data),

  get: (id) => axiosClient.get(`/elections/${id}`).then((res) => res.data),

  create: (payload) =>
    // payload: { name, startDate, endDate, regionScope }
    axiosClient.post('/elections', payload).then((res) => res.data),

  update: (id, payload) => axiosClient.patch(`/elections/${id}`, payload).then((res) => res.data),

  archive: (id) => axiosClient.patch(`/elections/${id}/archive`).then((res) => res.data),

  activate: (id) => axiosClient.patch(`/elections/${id}/activate`).then((res) => res.data),
};
