import { useEffect } from 'react';
import useDashboardStore from '../store/useDashboardStore';
import useElectionStore from '../store/useElectionStore';
import KpiCards from '../components/dashboard/KpiCards';
import RegionProgressTable from '../components/dashboard/RegionProgressTable';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import QuickActions from '../components/dashboard/QuickActions';

export default function DashboardPage() {
  const { kpis, regionProgress, activity, alerts, loading, error, fetchDashboard } = useDashboardStore();
  const activeElection = useElectionStore((s) => s.activeElection);

  // Refetch whenever the top-nav election switcher changes — dashboard
  // data is scoped by the X-Election-Id header, which axiosClient reads
  // from useElectionStore's module-level variable at request time. We
  // still need this effect because the store doesn't push updates on
  // its own; without activeElection?.id in the deps, switching elections
  // wouldn't reload the numbers below.
  useEffect(() => {
    if (activeElection?.id) fetchDashboard();
  }, [activeElection?.id, fetchDashboard]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <QuickActions />
      </div>

      {error && <p className="ui-form-error">{error}</p>}

      <KpiCards kpis={kpis} loading={loading} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 'var(--space-4)',
        }}
      >
        <RegionProgressTable regions={regionProgress} loading={loading} />
        <AlertsPanel alerts={alerts} loading={loading} />
      </div>

      <ActivityFeed activity={activity} loading={loading} />
    </div>
  );
}
