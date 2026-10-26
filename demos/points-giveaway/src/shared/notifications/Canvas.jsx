// The canvas (spec 2.3): grey desk, artboard 880 / 375 with the inbox header (sender, subject, preview text: click to jump to the
// field), then the email. Every block is a NodeShell: hover outline + tab, selection outline + name badge + floating toolbar,
// drag and drop between blocks.
import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Icon} from '@shopify/polaris';
import {ArrowDownIcon, ArrowUpIcon, CodeAddIcon, DeleteIcon, DragHandleIcon, DuplicateIcon, EmailIcon} from '@shopify/polaris-icons';
import {find, isContainer, moveSmart, nodeLabel} from './blocks.js';
import {drag, endDrag, positionIn, startDrag, targetFor} from './dnd.js';
import {conditionMatches} from './conditions.js';
import {EmailDocument} from './render.jsx';
import {RichEditable, insertTagAtCaret} from './richText.jsx';
import {VariablePopover} from './VariablePicker.jsx';
import {initials} from './variables.js';

const CanvasCtx = createContext(null);
const cx = (...p) => p.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ block shell (chrome) */

function FloatingToolbar({node}) {
  const c = useContext(CanvasCtx);
  const hit = find(c.blocks, node.id);
  const canUp = hit && hit.index > 0;
  const canDown = hit && hit.index < hit.siblings.length - 1;
  const isText = node.type === 'text' || node.type === 'callout';
  return (
    <div className="ee-ftb" role="toolbar" aria-label="Block actions" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.preventDefault()}>
      {isText ? (
        <VariablePopover
          emailId={c.emailId}
          values={c.values}
          onPick={(tag) => insertTagAtCaret(tag)}
          activator={(toggle) => (
            <button type="button" className="ee-ftb__btn ee-ftb__var" title="Insert variable into text" aria-label="Insert variable into text" onClick={toggle}>
              <Icon source={CodeAddIcon} />
            </button>
          )}
        />
      ) : null}
      <span className="ee-ftb__group">
        <button type="button" className="ee-ftb__btn" title="Move block up" aria-label="Move block up" disabled={!canUp} onClick={() => c.actions.move(node.id, -1)}>
          <Icon source={ArrowUpIcon} />
        </button>
        <button type="button" className="ee-ftb__btn" title="Move block down" aria-label="Move block down" disabled={!canDown} onClick={() => c.actions.move(node.id, 1)}>
          <Icon source={ArrowDownIcon} />
        </button>
        <button type="button" className="ee-ftb__btn" title="Duplicate block" aria-label="Duplicate block" onClick={() => c.actions.duplicate(node.id)}>
          <Icon source={DuplicateIcon} />
        </button>
        <button type="button" className="ee-ftb__btn ee-ftb__btn--danger" title="Delete block" aria-label="Delete block" onClick={() => c.actions.remove(node.id)}>
          <Icon source={DeleteIcon} />
        </button>
      </span>
    </div>
  );
}

export function NodeShell({node, style, children}) {
  const c = useContext(CanvasCtx);
  const selected = c.selectedId === node.id;
  const hovered = c.hoverId === node.id;
  const container = isContainer(node.type);
  const drop = c.drop && c.drop.id === node.id ? c.drop : null;
  const mobileHidden = c.device === 'mobile' && node.props.hideOnMobile;
  const label = nodeLabel(node);
  const conditional = !!node.props.condition?.rules?.length;
  const conditionShown = node.props.conditionPreview === 'shown' || (node.props.conditionPreview !== 'hidden' && conditionMatches(node.props.condition, c.values));
  // a Column fills its Row edge to edge, so the Row's "Edit layout" is offered on the Column's tab too (when the Row has columns to arrange)
  const rowOfColumn = node.type === 'column' ? (() => { const hit = find(c.blocks, node.id); return hit && hit.parent && hit.parent.type === 'row' && hit.parent.children.length > 1 ? hit.parent : null; })() : null;
  return (
    <div
      className={cx(
        'ee-node',
        `ee-node--${node.type}`,
        container && 'ee-node--container',
        selected && 'is-selected',
        hovered && !selected && 'is-hover',
        (node.hidden || mobileHidden || !conditionShown) && 'is-hidden',
        drop && `is-drop-${drop.pos}`,
        drop && !drop.valid && 'is-drop-invalid',
      )}
      style={style}
      data-node-id={node.id}
      data-type={node.type}
      data-condition-result={conditional ? conditionShown ? 'shown' : 'hidden' : undefined}
      aria-label={`${label} block`}
      onClick={(e) => {
        e.stopPropagation();
        window.__eeClick = {x: e.clientX, y: e.clientY, t: Date.now()};
        c.select(node.id);
      }}
      onMouseOver={(e) => {
        e.stopPropagation();
        c.setHover(node.id);
      }}
      onDragOver={(e) => c.dragOver(e, node)}
      onDrop={(e) => c.dropOn(e, node)}
    >
      {children}
      {selected ? (
        <>
          <span
            className="ee-badge"
            draggable
            onDragStart={(e) => startDrag(e, {kind: 'move', id: node.id, type: node.type}, label)}
            onDragEnd={endDrag}
            title="Drag to move"
          >
            <span className="ee-badge__grip" aria-hidden="true">
              <Icon source={DragHandleIcon} />
            </span>
            {label}
          </span>
          <FloatingToolbar node={node} />
        </>
      ) : null}
      {hovered && !selected && container ? (
        <span className="ee-tab" onClick={(e) => e.stopPropagation()}>
          <span>{label}</span>
          {node.type === 'row' || rowOfColumn ? (
            <button type="button" className="ee-tab__btn" onClick={() => c.actions.editLayout(node.type === 'row' ? node.id : rowOfColumn.id)}>
              Edit layout
            </button>
          ) : null}
          <button type="button" className="ee-tab__btn ee-tab__plus" aria-label={`Add a block inside ${label}`} onClick={() => c.actions.addInside(node.id)}>
            +
          </button>
        </span>
      ) : null}
      {conditional && <span className="ee-flag">Conditional · Preview: {conditionShown ? 'shown' : 'hidden'}</span>}
      {node.hidden ? <span className="ee-flag">Hidden from email</span> : mobileHidden ? <span className="ee-flag">Hidden on mobile</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ inbox header */

function InboxHeader({device, senderName, address, subject, preheader, onJump}) {
  const name = senderName || 'Sender';
  const subjectEl = (
    <button type="button" className="ee-inbox__subject" onClick={() => onJump('subject')} title="Edit subject">
      {subject || '(No subject)'}
    </button>
  );
  const pre = preheader ? (
    <button type="button" className="ee-inbox__pre" onClick={() => onJump('preheader')} title="Edit preview text">
      {`\u00a0\u00a0-\u00a0\u00a0${preheader}`}
    </button>
  ) : null;
  if (device === 'mobile') {
    return (
      <div className="ee-inbox ee-inbox--mobile">
        <span className="ee-inbox__avatar">{initials(name)}</span>
        <div className="ee-inbox__lines">
          <div className="ee-inbox__sender">{name}</div>
          <div className="ee-inbox__line">{subjectEl}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="ee-inbox">
      <div className="ee-inbox__window" aria-hidden="true">
        <i style={{background: '#ff5f57'}} />
        <i style={{background: '#febc2e'}} />
        <i style={{background: '#28c840'}} />
      </div>
      <div className="ee-inbox__row">
        <span className="ee-inbox__avatar">{initials(name)}</span>
        <div className="ee-inbox__lines">
          <div className="ee-inbox__sender">
            <b>{name}</b>
            <button type="button" className="ee-inbox__addr" onClick={() => onJump('reply')} title="Edit reply-to email">
              {`<${address}>`}
            </button>
            <span className="ee-inbox__time">9:41 AM</span>
            <span className="ee-inbox__glyph" aria-hidden="true">☆</span>
          </div>
          <div className="ee-inbox__line">
            {subjectEl}
            {pre}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ canvas */

export default function Canvas({ed, device, base, sender, hoverId, setHover, actions, onJump, scrollReq}) {
  const {doc, selectedId} = ed;
  const [drop, setDropState] = useState(null);
  const deskRef = useRef(null);
  const edRef = useRef(ed);
  edRef.current = ed;

  const setDrop = (next) =>
    setDropState((prev) => (prev && next && prev.id === next.id && prev.pos === next.pos && prev.valid === next.valid ? prev : prev === null && next === null ? prev : next));

  const dragOver = (event, node) => {
    const d = drag.current;
    if (!d) return;
    event.preventDefault();
    event.stopPropagation();
    const pos = positionIn(event, event.currentTarget, isContainer(node.type));
    const target = targetFor(doc.blocks, node, pos);
    const valid = d.kind === 'new' ? true : moveSmart(doc.blocks, d.id, target) !== null;
    event.dataTransfer.dropEffect = d.kind === 'new' ? 'copy' : 'move';
    setDrop({id: node.id, pos, valid});
  };
  const dropOn = (event, node) => {
    const d = drag.current;
    if (!d) return;
    event.preventDefault();
    event.stopPropagation();
    const pos = positionIn(event, event.currentTarget, isContainer(node.type));
    const target = targetFor(doc.blocks, node, pos);
    setDrop(null);
    endDrag();
    actions.dropPayload(d, target);
  };
  const dropOnDesk = (event) => {
    const d = drag.current;
    if (!d) return;
    event.preventDefault();
    setDrop(null);
    endDrag();
    actions.dropPayload(d, {parentId: null, index: doc.blocks.length});
  };

  // key shortcuts (spec 2.2 popover): Delete, duplicate, undo, redo. Never while typing.
  useEffect(() => {
    const onKey = (event) => {
      const t = event.target;
      const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (document.querySelector('.Polaris-Modal-Dialog')) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) actions.redo();
        else actions.undo();
        return;
      }
      if (typing) return;
      const sel = edRef.current.selectedId;
      if (mod && event.key.toLowerCase() === 'd' && sel) {
        event.preventDefault();
        actions.duplicate(sel);
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && sel) {
        event.preventDefault();
        actions.remove(sel);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions]);

  // scroll a block into view after it was added or picked in Layers
  useEffect(() => {
    if (!scrollReq || !scrollReq.id) return;
    const el = deskRef.current && deskRef.current.querySelector(`[data-node-id="${scrollReq.id}"]`);
    if (el) el.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }, [scrollReq]);

  const ctx = useMemo(
    () => ({
      ...base,
      device,
      canvas: true,
      hint: true,
      Shell: NodeShell,
      richText: (node) =>
        node.id === edRef.current.selectedId && (node.type === 'text' || node.type === 'callout') ? (
          <RichEditable html={node.props.html} onChange={(html) => actions.setProps(node.id, {html}, `text:${node.id}`)} onUndo={actions.undo} onRedo={actions.redo} />
        ) : null,
    }),
    [base, device, actions],
  );
  // richText reads the selection from a ref, so the memo above must rebuild when it changes
  const ctxWithSelection = useMemo(() => ({...ctx, selectedId}), [ctx, selectedId]);

  const canvasValue = useMemo(
    () => ({selectedId, hoverId, drop, device, blocks: doc.blocks, actions, select: ed.select, setHover, dragOver, dropOn, emailId: base.emailId, values: base.values}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedId, hoverId, drop, device, doc.blocks, actions, ed.select, base],
  );

  const empty = doc.blocks.length === 0;

  return (
    <CanvasCtx.Provider value={canvasValue}>
      <div
        className="ee-desk"
        ref={deskRef}
        onClick={() => ed.select(null)}
        onMouseLeave={() => setHover(null)}
        onDragOver={(e) => drag.current && e.preventDefault()}
        onDrop={dropOnDesk}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDrop(null);
        }}
        data-testid="ee-canvas"
      >
        <div className={`ee-artboard ee-artboard--${device}`} style={{background: doc.pageBg || '#e8e9eb'}} onClick={(e) => e.stopPropagation()}>
          <InboxHeader device={device} senderName={sender.name} address={sender.address} subject={base.resolve(doc.subject)} preheader={base.resolve(doc.preheader)} onJump={onJump} />
          <div className="ee-strip" onClick={() => ed.select(null)} />
          {empty ? (
            <div className="ee-empty">
              <Icon source={EmailIcon} tone="subdued" />
              <b>Empty email</b>
              <span>Drag a block from the right, or click a block to add</span>
            </div>
          ) : (
            <EmailDocument doc={doc} ctx={ctxWithSelection} bare />
          )}
          <div className="ee-strip" onClick={() => ed.select(null)} />
        </div>
      </div>
    </CanvasCtx.Provider>
  );
}

