import '../../styles/ui.css';

const TONE_CLASS = {
  success: 'ui-badge-success',
  neutral: 'ui-badge-neutral',
  danger: 'ui-badge-danger',
  info: 'ui-badge-info',
};

/**
 * Small status pill. `tone` maps to a fixed semantic palette so every
 * status indicator in the app (election, admin account, worker, ...)
 * reads consistently instead of each screen picking its own color.
 *
 * @param {'success'|'neutral'|'danger'|'info'} tone
 */
export default function Badge({ tone = 'neutral', children }) {
  return <span className={`ui-badge ${TONE_CLASS[tone] || TONE_CLASS.neutral}`}>{children}</span>;
}
