import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

// NOTE: these routes (/workers/new, /surveys/new, /announcements/new)
// don't exist in AppRoutes.jsx yet — they land in later phases. Buttons
// are wired now so QuickActions doesn't need touching again once those
// routes exist; they'll 404 until then.
const ACTIONS = [
  { label: '+ Add Worker', path: '/workers/new' },
  { label: '+ Create Survey', path: '/surveys/new' },
  { label: '+ Send Announcement', path: '/announcements/new' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {ACTIONS.map((action) => (
        <Button key={action.path} variant="secondary" onClick={() => navigate(action.path)}>
          {action.label}
        </Button>
      ))}
    </div>
  );
}
