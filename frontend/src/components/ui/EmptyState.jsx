import '../../styles/ui.css';

/**
 * Placeholder for an empty list/table: an icon, a title, an optional
 * description, and an optional call-to-action. Treats "nothing here
 * yet" as an invitation to act rather than a dead end.
 */
export default function EmptyState({ icon = '🗂️', title, description, action }) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="ui-empty-title">{title}</h3>
      {description && <p className="ui-empty-description">{description}</p>}
      {action}
    </div>
  );
}
