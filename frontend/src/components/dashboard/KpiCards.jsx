const KPI_CONFIG = [
  { key: 'totalWorkers', label: 'Total Workers' },
  { key: 'surveysCompletedToday', label: 'Surveys Completed Today' },
  { key: 'completionPercent', label: 'Completion %', suffix: '%' },
  { key: 'activeBooths', label: 'Active Booths' },
  { key: 'pendingApprovals', label: 'Pending Approvals' },
];

/**
 * Renders a grid of KPI metric cards. `kpis` is the object returned by
 * GET /dashboard/kpis, or null while loading.
 */
export default function KpiCards({ kpis, loading }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 'var(--space-3)',
      }}
    >
      {KPI_CONFIG.map(({ key, label, suffix }) => (
        <div
          key={key}
          className="card"
          style={{ padding: 'var(--space-4)' }}
        >
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 'var(--space-1)' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>
            {loading || !kpis ? '—' : `${kpis[key] ?? 0}${suffix || ''}`}
          </div>
        </div>
      ))}
    </div>
  );
}
