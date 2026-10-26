import {useEffect, useRef} from 'react';

const visible = el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const lastVisible = selector => [...document.querySelectorAll(selector)].filter(visible).at(-1);
const topOverlay = () => lastVisible('.Polaris-Popover') || lastVisible('.Polaris-Modal-Dialog') || lastVisible('.fs-preview [role="dialog"], .ee-drawer.is-open');
const focusables = root => [...root.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]')].filter(el => el.tabIndex >= 0 && visible(el));

// One Escape press has one owner, sampled before Polaris handles keyup.
// Portalled Polaris overlays keep their own focus trap; the editor traps its base layer.
export default function useEditorKeyboard({onClose, onEscape}) {
  const root = useRef(null);
  const latest = useRef({onClose, onEscape});
  latest.current = {onClose, onEscape};
  useEffect(() => {
    const previous = document.activeElement;
    const frame = requestAnimationFrame(() => root.current?.focus());
    let escapeOwner = null;
    const down = event => {
      if (event.key === 'Escape') escapeOwner = topOverlay();
      const overlay = topOverlay();
      if (event.key !== 'Tab' || overlay?.matches('.Polaris-Popover, .Polaris-Modal-Dialog') || !root.current) return;
      const scope = overlay || root.current;
      const list = focusables(scope);
      const index = list.indexOf(document.activeElement);
      if (!list.length) {
        event.preventDefault(); root.current.focus();
      } else if (index < 0 || (!event.shiftKey && index === list.length - 1) || (event.shiftKey && index === 0)) {
        event.preventDefault(); (event.shiftKey ? list.at(-1) : list[0]).focus();
      }
    };
    const up = event => {
      if (event.key !== 'Escape') return;
      const overlay = escapeOwner || topOverlay();
      escapeOwner = null;
      if (overlay) {
        if (!overlay.isConnected) return;
        const content = overlay.querySelector('.Polaris-Popover__Content');
        const activator = content && [...document.querySelectorAll('[aria-controls]')].find(el => el.getAttribute('aria-controls') === content.id);
        const close = activator || overlay.querySelector('.Polaris-Modal-CloseButton, .pp-overlay-close, button[aria-label="Close"]');
        if (close) {
          event.preventDefault(); event.stopImmediatePropagation(); close.click();
          if (activator) activator.focus();
        }
        return;
      }
      event.preventDefault(); event.stopImmediatePropagation();
      if (!latest.current.onEscape?.()) latest.current.onClose();
    };
    const focus = event => {
      const overlay = topOverlay();
      if (!root.current || overlay?.matches('.Polaris-Popover, .Polaris-Modal-Dialog')) return;
      const scope = overlay || root.current;
      if (!scope.contains(event.target)) (focusables(scope)[0] || root.current).focus();
    };
    window.addEventListener('keydown', down, true);
    window.addEventListener('keyup', up, true);
    document.addEventListener('focusin', focus);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', down, true);
      window.removeEventListener('keyup', up, true);
      document.removeEventListener('focusin', focus);
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return root;
}
