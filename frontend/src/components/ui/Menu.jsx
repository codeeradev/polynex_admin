import { useRef, useState, useId } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import '../../styles/ui.css';

/**
 * Anchored dropdown. `trigger` is a render-prop receiving
 * { open, toggle } for the button/element that opens the panel;
 * `children` is a render-prop receiving { close } so panel content
 * can dismiss itself after an action (e.g. selecting a menu item).
 *
 * Positioning is intentionally simple — anchored under the trigger,
 * aligned per the `align` prop — since every current consumer fits
 * that layout. Revisit with a proper floating-position library if
 * that stops being true.
 */
export default function Menu({ trigger, children, align = 'left', width = 280 }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();

  useClickOutside([rootRef], () => setOpen(false), open);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div className="ui-menu-root" ref={rootRef} onKeyDown={handleKeyDown}>
      {trigger({ open, toggle: () => setOpen((v) => !v), menuId })}
      {open && (
        <div id={menuId} role="menu" className="ui-menu-panel" style={{ [align]: 0, width }}>
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}
