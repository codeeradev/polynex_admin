import Card from '../ui/Card';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_ICON = {
  survey_submitted: '📝',
  login: '🔑',
  worker_added: '👤',
};

/** `activity` is the array returned by GET /dashboard/activity. */
export default function ActivityFeed({ activity, loading }) {
  return (
    <Card title="Recent Activity">
      {loading && <p>Loading…</p>}

      {!loading && activity.length === 0 && (
        <p className="ui-card-subtitle">No recent activity for this election.</p>
      )}

      {!loading && activity.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 320, overflowY: 'auto' }}>
          {activity.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>
                <span style={{ marginRight: 'var(--space-2)' }}>{TYPE_ICON[item.type] || '•'}</span>
                <strong>{item.actor}</strong> — {item.description}
              </span>
              <span style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {timeAgo(item.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
