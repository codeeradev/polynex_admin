import '../../styles/ui.css';

/**
 * Standard content container: optional header (title + right-aligned
 * actions) and a body. Used for every page-level panel so spacing and
 * elevation stay consistent across the app.
 */
export default function Card({ title, actions, children, className = '' }) {
  return (
    <section className={`ui-card ${className}`}>
      {(title || actions) && (
        <header className="ui-card-header">
          {title && <h1 className="ui-card-title">{title}</h1>}
          {actions && <div className="ui-card-actions">{actions}</div>}
        </header>
      )}
      <div className="ui-card-body">{children}</div>
    </section>
  );
}
