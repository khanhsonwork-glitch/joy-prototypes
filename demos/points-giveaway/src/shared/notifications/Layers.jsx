// The Layers tab (spec 2.3): the block tree. Row = grip + chevron + icon + name + eye + trash (controls show on hover / focus).
// Drag a row to reorder or drop it into a container; drop a palette tile on a row to add there. Hover is shared with the canvas.
import React, {useState} from 'react';
import {Icon, Text} from '@shopify/polaris';
import {ChevronDownIcon, ChevronRightIcon, DeleteIcon, DragHandleIcon, HideIcon, ViewIcon} from '@shopify/polaris-icons';
import {BLOCK_TYPES, isContainer, layerName, moveSmart} from './blocks.js';
import {drag, endDrag, positionIn, startDrag, targetFor} from './dnd.js';

const cx = (...p) => p.filter(Boolean).join(' ');

function Row({node, depth, ed, hoverId, setHover, actions, collapsed, toggle, drop, setDrop}) {
  const selected = ed.selectedId === node.id;
  const kids = node.children || [];
  const open = !collapsed[node.id];
  const meta = BLOCK_TYPES[node.type];
  const dropHere = drop && drop.id === node.id ? drop : null;

  const over = (e) => {
    const d = drag.current;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = positionIn(e, e.currentTarget, isContainer(node.type));
    const target = targetFor(ed.doc.blocks, node, pos);
    const valid = d.kind === 'new' ? true : moveSmart(ed.doc.blocks, d.id, target) !== null;
    setDrop({id: node.id, pos, valid});
  };
  const dropOn = (e) => {
    const d = drag.current;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = positionIn(e, e.currentTarget, isContainer(node.type));
    const target = targetFor(ed.doc.blocks, node, pos);
    setDrop(null);
    endDrag();
    actions.dropPayload(d, target);
  };

  return (
    <>
      <div
        className={cx('ee-lrow', selected && 'is-selected', hoverId === node.id && 'is-hover', node.hidden && 'is-hidden', dropHere && `is-drop-${dropHere.pos}`, dropHere && !dropHere.valid && 'is-drop-invalid')}
        style={{paddingLeft: 6 + depth * 14}}
        data-layer={node.id}
        data-type={node.type}
        draggable
        onDragStart={(e) => startDrag(e, {kind: 'move', id: node.id, type: node.type}, layerName(node))}
        onDragEnd={endDrag}
        onDragOver={over}
        onDrop={dropOn}
        onClick={() => actions.select(node.id)}
        onMouseEnter={() => setHover(node.id)}
        onMouseLeave={() => setHover(null)}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={kids.length ? open : undefined}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') actions.select(node.id);
        }}
      >
        <span className="ee-lrow__grip" title="Drag to reorder" aria-label="Drag to reorder">
          <Icon source={DragHandleIcon} tone="subdued" />
        </span>
        {kids.length ? (
          <button
            type="button"
            className="ee-lrow__chev"
            aria-label={open ? 'Collapse' : 'Expand'}
            onClick={(e) => {
              e.stopPropagation();
              toggle(node.id);
            }}
          >
            <Icon source={open ? ChevronDownIcon : ChevronRightIcon} tone="subdued" />
          </button>
        ) : (
          <span className="ee-lrow__chev" />
        )}
        <span className="ee-lrow__icon">
          <Icon source={meta?.icon} tone="subdued" />
        </span>
        <span className="ee-lrow__name">{layerName(node)}</span>
        <span className="ee-lrow__ctl">
          <button
            type="button"
            className="ee-lrow__btn"
            aria-label={node.hidden ? 'Show in email' : 'Hide from email'}
            title={node.hidden ? 'Show in email' : 'Hide from email'}
            onClick={(e) => {
              e.stopPropagation();
              actions.toggleHidden(node.id);
            }}
          >
            <Icon source={node.hidden ? HideIcon : ViewIcon} tone="subdued" />
          </button>
          <button
            type="button"
            className="ee-lrow__btn ee-lrow__btn--danger"
            aria-label="Delete block"
            title="Delete block"
            onClick={(e) => {
              e.stopPropagation();
              actions.remove(node.id);
            }}
          >
            <Icon source={DeleteIcon} tone="critical" />
          </button>
        </span>
      </div>
      {kids.length && open
        ? kids.map((child) => (
            <Row key={child.id} node={child} depth={depth + 1} ed={ed} hoverId={hoverId} setHover={setHover} actions={actions} collapsed={collapsed} toggle={toggle} drop={drop} setDrop={setDrop} />
          ))
        : null}
    </>
  );
}

export default function Layers({ed, hoverId, setHover, actions}) {
  const [collapsed, setCollapsed] = useState({});
  const [drop, setDrop] = useState(null);
  const toggle = (id) => setCollapsed((c) => ({...c, [id]: !c[id]}));
  return (
    <div
      className="ee-layers"
      role="tree"
      aria-label="Block tree"
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDrop(null);
      }}
      onDragOver={(e) => drag.current && e.preventDefault()}
      onDrop={(e) => {
        const d = drag.current;
        if (!d) return;
        e.preventDefault();
        setDrop(null);
        endDrag();
        actions.dropPayload(d, {parentId: null, index: ed.doc.blocks.length});
      }}
    >
      <div className="ee-layers__root">
        <Text as="span" variant="headingXs" tone="subdued">
          Email
        </Text>
      </div>
      {ed.doc.blocks.map((node) => (
        <Row key={node.id} node={node} depth={0} ed={ed} hoverId={hoverId} setHover={setHover} actions={actions} collapsed={collapsed} toggle={toggle} drop={drop} setDrop={setDrop} />
      ))}
      {ed.doc.blocks.length === 0 ? (
        <Text as="p" variant="bodySm" tone="subdued">
          No blocks yet.
        </Text>
      ) : null}
    </div>
  );
}
