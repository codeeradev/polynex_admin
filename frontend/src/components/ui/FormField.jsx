import '../../styles/ui.css';

/**
 * Label + input + inline error — the shape nearly every form field in
 * the app needs. Pass `as="select"` (with <option> children) or
 * `as="textarea"` for those variants; everything else (id, value,
 * onChange, placeholder, required, ...) forwards straight through to
 * the underlying element.
 */
export default function FormField({ id, label, error, as = 'input', children, className = '', ...rest }) {
  const Tag = as;

  return (
    <div className={`ui-field ${className}`}>
      <label className="ui-field-label" htmlFor={id}>
        {label}
      </label>
      {as === 'select' ? (
        <select id={id} className="ui-field-input" {...rest}>
          {children}
        </select>
      ) : (
        <Tag id={id} className="ui-field-input" {...rest} />
      )}
      {error && <p className="ui-field-error">{error}</p>}
    </div>
  );
}
