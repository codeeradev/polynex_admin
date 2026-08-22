import Card from '../ui/Card';
import Badge from '../ui/Badge';

// ASSUMPTION: Badge supports 'warning'/'danger' tones in addition to the
// 'success'/'neutral' tones seen in ElectionsPage.jsx. If Badge.jsx only
// defines success/neutral, either add these two tones there or swap the
// tone values below to whatever it actually supports.
const SEVERITY_TONE = {
  warning: 'warning',
  critical: 'danger',
};

/** `alerts` is the array returned by GET /dashboard/alerts. */
export default function AlertsPanel({ alerts, loading }) {
  return (
    <Card title="Alerts">
      {loading && <p>Loading…</p>}

      {!loading && alerts.length === 0 && (
        <p className="ui-card-subtitle">No alerts — everything looks healthy.</p>
      )}

      {!loading && alerts.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {alerts.map((alert) => (
            <li
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Badge tone={SEVERITY_TONE[alert.severity] || 'neutral'}>{alert.severity}</Badge>
              <span>{alert.message}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
