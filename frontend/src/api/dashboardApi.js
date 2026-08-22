import axiosClient from './axiosClient';

/**
 * Thin wrapper around /dashboard endpoints. Same pattern as
 * electionApi.js/adminApi.js/authApi.js.
 */
export const dashboardApi = {
  getKpis: () => axiosClient.get('/dashboard/kpis').then((res) => res.data),
  getRegionProgress: () => axiosClient.get('/dashboard/region-progress').then((res) => res.data),
  getActivity: (limit = 20) =>
    axiosClient.get('/dashboard/activity', { params: { limit } }).then((res) => res.data),
  getAlerts: () => axiosClient.get('/dashboard/alerts').then((res) => res.data),
};
