// Side sheet for secondary detail (activity, filters, help). Polaris has no drawer, so this one follows
// the Polaris Modal contract: role=dialog, focus moves in, Tab stays inside, Esc and the scrim close it,
// focus returns to the control that opened it.
import React, {useEffect, useId, useRef} from 'react';
import {createPortal} from 'react-dom';
import {Button, Icon, Text} from '@shopify/polaris';
import {XIcon} from '@shopify/polaris-icons';

// Polaris page actions can drop focus on click (the button blurs before the drawer opens), so remember the last
// control the user pressed or focused and treat it as the opener when focus is already back on <body>.
let lastControl = null;
if (typeof document !== 'undefined') {
  const remember = (event) => {
    const control = event.target?.closest?.('button, a[href], [tabindex]');
    if (control) lastControl = control;
  };
  document.addEventListener('pointerdown', remember, true);
  document.addEventListener('focusin', remember, true);
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Drawer({open, onClose, title, children, primaryAction}) {
  const titleId = useId();
  const panel = useRef(null);
  const opener = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    opener.current = document.activeElement && document.activeElement !== document.body ? document.activeElement : lastControl;
    const first = panel.current?.querySelector(FOCUSABLE);
    (first || panel.current)?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        close.current();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (!items.length) return;
      const [head, tail] = [items[0], items[items.length - 1]];
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault();
        head.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    const {overflow} = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
      // Polaris may re-render the page actions while the drawer is open (the scroll lock changes the width),
      // so return focus to the same control even if its node was replaced.
      const target = opener.current;
      const label = target?.textContent?.trim();
      requestAnimationFrame(() => {
        const same = target?.isConnected ? target
          : [...document.querySelectorAll('button, a')].find((el) => el.textContent.trim() === label && el.offsetParent !== null && !el.closest('[aria-hidden="true"], [class*="Measurer"]'));
        same?.focus?.();
      });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="kit-drawer">
      <div className="kit-drawer__scrim" onClick={onClose} aria-hidden="true" />
      <section ref={panel} className="kit-drawer__panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="kit-drawer__header">
          <Text as="h2" variant="headingMd" id={titleId}>{title}</Text>
          <button type="button" className="kit-drawer__close" aria-label="Close" onClick={onClose}>
            <Icon source={XIcon} />
          </button>
        </header>
        <div className="kit-drawer__body">{children}</div>
        {primaryAction ? (
          <footer className="kit-drawer__footer">
            <Button onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={primaryAction.onAction}>{primaryAction.content}</Button>
          </footer>
        ) : null}
      </section>
    </div>,
    document.body
  );
}
