import { create } from 'zustand';
import { dashboardApi } from '../api/dashboardApi';

/**
 * Dashboard data is election-scoped (backend reads the X-Election-Id
 * header). DashboardPage must call fetchDashboard() whenever the active
 * election changes, not just on mount — see its useEffect deps.
 */
const useDashboardStore = create((set) => ({
  kpis: null,
  regionProgress: [],
  activity: [],
  alerts: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const [kpis, regionProgress, activity, alerts] = await Promise.all([
        dashboardApi.getKpis(),
        dashboardApi.getRegionProgress(),
        dashboardApi.getActivity(),
        dashboardApi.getAlerts(),
      ]);
      set({ kpis, regionProgress, activity, alerts, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load dashboard.',
        loading: false,
      });
    }
  },

  reset: () => set({ kpis: null, regionProgress: [], activity: [], alerts: [], error: null }),
}));

export default useDashboardStore;
