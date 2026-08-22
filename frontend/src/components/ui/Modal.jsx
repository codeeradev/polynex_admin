import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/ui.css';

/**
 * Minimal accessible dialog: focuses itself on open, closes on Escape
 * or a backdrop click, and restores focus to whatever triggered it on
 * close. Rendered through a portal so stacking order never depends on
 * where the modal happens to be mounted in the tree.
 */
export default function Modal({ open, onClose, title, children, footer }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused.current?.focus) previouslyFocused.current.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="ui-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-modal-title"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="ui-modal-header">
          <h2 id="ui-modal-title" className="ui-modal-title">
            {title}
          </h2>
          <button type="button" className="ui-modal-close" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
        {footer && <footer className="ui-modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
