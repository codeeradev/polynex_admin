import '../../styles/ui.css';

const VARIANT_CLASS = {
  primary: 'ui-btn-primary',
  secondary: 'ui-btn-secondary',
  text: 'ui-btn-text',
  danger: 'ui-btn-danger',
};

/**
 * The single button implementation for the admin app. Centralizing
 * variants here means a visual change (spacing, radius, a rebrand)
 * touches one file instead of every screen with a hand-rolled <button>.
 *
 * @param {'primary'|'secondary'|'text'|'danger'} variant
 * @param {'sm'|'md'} size
 * @param {boolean} loading - shows a spinner and disables the button
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'ui-btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === 'sm' ? 'ui-btn-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="ui-btn-spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
