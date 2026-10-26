// Drag and drop between the Add block palette, the canvas and the Layers tree (HTML5 DnD).
// dataTransfer values cannot be read during dragover, so the payload lives here.
//   {kind: 'new', type: 'text'}  from a palette tile
//   {kind: 'move', id, type}     from a canvas badge or a Layers row
import {find} from './blocks.js';

export const drag = {current: null};

export function startDrag(event, payload, label = 'block') {
  drag.current = payload;
  event.dataTransfer.effectAllowed = 'copyMove';
  try {
    event.dataTransfer.setData('text/plain', label);
  } catch (e) {
    /* some browsers refuse; the module payload is what the drop reads */
  }
}

export const endDrag = () => {
  drag.current = null;
};

/** Where a drop at (node, position) lands: {parentId, index}. position: 'before' | 'after' | 'inside'. */
export function targetFor(blocks, node, position) {
  if (position === 'inside') return {parentId: node.id, index: (node.children || []).length};
  const hit = find(blocks, node.id);
  return {parentId: hit && hit.parent ? hit.parent.id : null, index: (hit ? hit.index : 0) + (position === 'after' ? 1 : 0)};
}

/** Pointer position inside an element -> 'before' | 'after' | 'inside'. Containers get a middle band that means "into". */
export function positionIn(event, element, isContainerNode) {
  const rect = element.getBoundingClientRect();
  const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
  if (isContainerNode) {
    if (ratio < 0.22) return 'before';
    if (ratio > 0.78) return 'after';
    return 'inside';
  }
  return ratio < 0.5 ? 'before' : 'after';
}
