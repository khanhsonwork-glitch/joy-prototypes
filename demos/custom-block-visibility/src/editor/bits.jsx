import React, {useState} from 'react';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

/** The on/off switch of the Body list and the program rows (the real editor's s-switch: dark when on). */
export function Switch({checked, onChange, label}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="we-switch"
      onClick={(event) => {
        event.stopPropagation();
        onChange(!checked);
      }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <span className="we-switch__knob" />
    </button>
  );
}

/** Drag-to-reorder for a list of rows: spread `rowProps(id)` on each row. Native drag and drop, no dependency. */
export function useSortable(onMove) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  return (id) => ({
    draggable: true,
    onDragStart: (event) => {
      setDrag(id);
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
    },
    onDragOver: (event) => {
      if (!drag) return;
      event.preventDefault();
      setOver(id);
    },
    onDrop: (event) => {
      event.preventDefault();
      if (drag && drag !== id) onMove(drag, id);
      setDrag(null);
      setOver(null);
    },
    onDragEnd: () => {
      setDrag(null);
      setOver(null);
    },
    'data-dragging': drag === id ? 'true' : undefined,
    'data-over': over === id && drag !== id ? 'true' : undefined,
  });
}
