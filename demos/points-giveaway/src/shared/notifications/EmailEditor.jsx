// EmailEditor: the replica of Joy's Email editor V2 (approved in the Paid membership prototype) for a giveaway's two emails,
// in a fullscreen frame.
//   <EmailEditor emailId="gift" email={stored} host={{giveaway, members, stats}} onSave={(patch) => ...} onToggle={(on) => ...} onBack={() => ...} />
// Title bar: Reset to default + Turn on / Turn off (its own save, like Joy). Save bar when dirty. Toolbar band, left pane
// (Settings | Layers), canvas, right pane (Add block | Properties); under 900 px both panes become drawers.
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Banner, Button, Modal, Toast} from '@shopify/polaris';
import {XIcon} from '@shopify/polaris-icons';
import {STORE} from '../../data/index.js';
import {useShell} from '../../shell/ShellContext.jsx';
import BlockLibrary from './BlockLibrary.jsx';
import Canvas from './Canvas.jsx';
import ColumnLayoutModal from './ColumnLayoutModal.jsx';
import EditorFrame from './EditorFrame.jsx';
import Inspector from './Inspector.jsx';
import Layers from './Layers.jsx';
import PreviewTestModal, {HtmlModal} from './PreviewModal.jsx';
import SettingsTab, {replyError} from './SettingsTab.jsx';
import TemplateGallery from './TemplateGallery.jsx';
import Toolbar from './Toolbar.jsx';
import {addTargetFor, cloneNode, find, insertAt, insertSmart, makeForPalette, makeRow, mapNode, moveSibling, moveSmart, removeNode, setRowLayout} from './blocks.js';
import {FROM_ADDRESS, emailDef, emailWithDefaults} from './emailState.js';
import {EmailHostProvider} from './host.js';
import {buildDoc, defaultDoc} from './templates.js';
import useEditorState from './useEditorState.js';
import usePreviewBase from './usePreviewBase.js';
import {lintDoc} from './variables.js';
import './notifications.css';

const clone = (v) => JSON.parse(JSON.stringify(v));

function useSize(ref) {
  const [size, setSize] = useState('wide');
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const apply = (w) => setSize(w >= 1280 ? 'wide' : w >= 900 ? 'medium' : 'narrow');
    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => apply(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

function Segment({options, value, onChange, label}) {
  return (
    <div className="ee-segment" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={value === o.id} className={value === o.id ? 'is-active' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Editor({emailId, def, email, onBack, onSave, onToggle}) {
  const {notify} = useShell();
  const rootRef = useRef(null);
  const size = useSize(rootRef);
  const narrow = size === 'narrow';

  const init = useMemo(
    () => ({
      doc: email.doc ? clone(email.doc) : defaultDoc(emailId),
      meta: {senderName: email.senderName, replyTo: email.replyTo, cssOn: email.cssOn, css: email.css, voice: email.voice},
    }),
    // the editor opens on the saved email once; saving moves the baseline inside useEditorState
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const ed = useEditorState(init.doc, init.meta);
  const {doc, meta} = ed;

  const [device, setDevice] = useState(() => window.innerWidth < 600 ? 'mobile' : 'desktop');
  const [customer, setCustomer] = useState(null);
  const [leftTab, setLeftTab] = useState('settings');
  const [rightTab, setRightTab] = useState('add');
  const [drawer, setDrawer] = useState(null);
  const [hoverId, setHover] = useState(null);
  const [focusReq, setFocusReq] = useState(null);
  const [scrollReq, setScrollReq] = useState(null);
  const [lint, setLint] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // 'gallery' | 'preview' | 'html' | 'reset'
  const [layoutModal, setLayoutModal] = useState(null); // {mode, rowId?, target?, initial}

  const base = usePreviewBase(emailId, customer);
  const customCss = meta.cssOn ? meta.css : '';
  const canvasBase = useMemo(() => ({emailId, values: base.values, resolve: base.resolve, customCss}), [emailId, base, customCss]);
  const sender = useMemo(() => ({name: meta.senderName || STORE.name, address: FROM_ADDRESS}), [meta.senderName]);

  // selecting a block (canvas, Layers, adding) opens Properties
  useEffect(() => {
    if (ed.selectedId) setRightTab('properties');
  }, [ed.selectedId]);

  const R = useRef(null);
  R.current = {ed, device, meta, narrow, leftTab, base};

  const showToast = useCallback((content, withUndo) => setToast({content, undo: !!withUndo, key: `${Date.now()}`}), []);

  const select = useCallback((id, {scroll = true} = {}) => {
    R.current.ed.select(id);
    if (id && scroll) setScrollReq({id, n: Date.now()});
  }, []);

  const actions = useMemo(() => {
    const doEdit = (blocks, key) => R.current.ed.edit((d) => ({...d, blocks}), key);
    // a new Footer takes the surface of the band above it, and its text colour comes from the template
    const paletteNode = (type) => {
      const r = R.current;
      const blocks = r.ed.doc.blocks;
      const last = [...blocks].reverse().find((b) => !b.props.bgImage);
      return makeForPalette(type, {emailId, style: {...r.ed.doc.style, bg: last ? last.props.bgColor : '', fullWidth: last ? last.props.fullWidth : false}});
    };
    const placed = (out, node) => {
      doEdit(out.blocks);
      select(node.id);
      setRightTab('properties');
      if (R.current.narrow) setDrawer(null);
    };
    return {
      undo: () => R.current.ed.undo(),
      redo: () => R.current.ed.redo(),
      select,
      setProps: (id, patch, key) =>
        R.current.ed.edit((d) => ({...d, blocks: mapNode(d.blocks, id, (n) => ({...n, props: {...n.props, ...patch}}))}), key),
      addBlock: (type) => {
        const r = R.current;
        if (type === 'row') {
          setLayoutModal({mode: 'add', target: null, initial: [50, 50]});
          return;
        }
        const node = paletteNode(type);
        if (!node) return;
        const out = insertSmart(r.ed.doc.blocks, node, addTargetFor(r.ed.doc.blocks, r.ed.selectedId, node));
        if (out) placed(out, node);
      },
      addInside: (containerId) => {
        const r = R.current;
        const node = makeForPalette('text', {emailId});
        const host = find(r.ed.doc.blocks, containerId);
        if (!host) return;
        let target = {parentId: containerId, index: (host.node.children || []).length};
        if (host.node.type === 'row') {
          const last = host.node.children[host.node.children.length - 1];
          target = {parentId: last.id, index: (last.children || []).length};
        }
        const out = insertSmart(r.ed.doc.blocks, node, target);
        if (out) placed(out, node);
      },
      remove: (id) => {
        const r = R.current;
        const next = removeNode(r.ed.doc.blocks, id);
        if (next === r.ed.doc.blocks) return;
        doEdit(next);
        showToast('Block deleted', true);
      },
      duplicate: (id) => {
        const r = R.current;
        const hit = find(r.ed.doc.blocks, id);
        if (!hit) return;
        const copy = cloneNode(hit.node);
        doEdit(insertAt(r.ed.doc.blocks, hit.parent ? hit.parent.id : null, hit.index + 1, copy));
        select(copy.id);
        showToast('Block duplicated', true);
      },
      move: (id, dir) => doEdit(moveSibling(R.current.ed.doc.blocks, id, dir)),
      toggleHidden: (id) => doEdit(mapNode(R.current.ed.doc.blocks, id, (n) => ({...n, hidden: !n.hidden}))),
      editLayout: (rowId) => {
        const hit = find(R.current.ed.doc.blocks, rowId);
        if (hit) setLayoutModal({mode: 'edit', rowId, initial: hit.node.props.layout || [100]});
      },
      dropPayload: (d, target) => {
        const r = R.current;
        if (d.kind === 'new') {
          if (d.type === 'row') {
            setLayoutModal({mode: 'add', target, initial: [50, 50]});
            return;
          }
          const node = paletteNode(d.type);
          const out = insertSmart(r.ed.doc.blocks, node, target);
          if (out) placed(out, node);
        } else {
          const next = moveSmart(r.ed.doc.blocks, d.id, target);
          if (next) {
            doEdit(next);
            select(d.id, {scroll: false});
          }
        }
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId]);

  const submitLayout = (layout) => {
    const m = layoutModal;
    setLayoutModal(null);
    if (!m) return;
    if (m.mode === 'edit') {
      ed.edit((d) => ({...d, blocks: setRowLayout(d.blocks, m.rowId, layout)}));
      return;
    }
    const node = makeRow(layout);
    const target = m.target || addTargetFor(doc.blocks, ed.selectedId, node);
    const out = insertSmart(doc.blocks, node, target);
    if (out) {
      ed.edit((d) => ({...d, blocks: out.blocks}));
      select(node.id);
      setRightTab('properties');
      if (narrow) setDrawer(null);
    }
  };

  const jump = (field) => {
    setLeftTab('settings');
    if (R.current.narrow) setDrawer('left');
    setFocusReq({field, n: Date.now()});
  };

  const save = () => {
    if (replyError(meta.replyTo)) {
      setLeftTab('settings');
      if (narrow) setDrawer('left');
      setFocusReq({field: 'reply', n: Date.now()});
      return;
    }
    const findings = lintDoc(doc, emailId);
    onSave({doc: clone(doc), replyTo: meta.replyTo, senderName: meta.senderName, cssOn: meta.cssOn, css: meta.css, voice: meta.voice, editedAt: Date.now()});
    ed.markSaved(doc, meta);
    setLint(findings.length ? findings : null);
    notify('Saved');
  };
  const discard = () => {
    ed.discard();
    setLint(null);
  };

  const sendTest = (address) => notify(`Test email sent to ${address}`);

  const selectedNode = ed.selectedId ? find(doc.blocks, ed.selectedId)?.node || null : null;
  const richActive = !!selectedNode && (selectedNode.type === 'text' || selectedNode.type === 'callout');

  const headerActions = (
    <>
      <Button onClick={() => setModal('reset')}>Reset to default</Button>
      <Button
        variant="primary"
        onClick={() => {
          // the host returns false when it already said why the change won't take effect
          if (onToggle(!email.enabled) !== false) notify('Updated status successfully');
        }}
      >
        {email.enabled ? 'Turn off' : 'Turn on'}
      </Button>
    </>
  );

  const leftPane = (
    <aside className={`ee-left${narrow ? ' ee-drawer ee-drawer--left' : ''}${narrow && drawer === 'left' ? ' is-open' : ''}`} aria-label="Settings and layers">
      {narrow ? (
        <div className="ee-drawer__head">
          <b>Structure</b>
          <Button variant="tertiary" icon={XIcon} accessibilityLabel="Close" onClick={() => setDrawer(null)} />
        </div>
      ) : null}
      <Segment label="Left pane" value={leftTab} onChange={setLeftTab} options={[{id: 'settings', label: 'Settings'}, {id: 'layers', label: 'Layers'}]} />
      <div className="ee-pane__body" hidden={leftTab !== 'settings'}>
        <SettingsTab ed={ed} emailId={emailId} enabled={email.enabled} values={base.values} resolve={base.resolve} focusReq={focusReq} />
      </div>
      <div className="ee-pane__body" hidden={leftTab !== 'layers'}>
        <Layers ed={ed} hoverId={hoverId} setHover={setHover} actions={actions} />
      </div>
    </aside>
  );

  const rightPane = (
    <aside className={`ee-right${narrow ? ' ee-drawer ee-drawer--right' : ''}${narrow && drawer === 'right' ? ' is-open' : ''}`} aria-label="Blocks and properties">
      {narrow ? (
        <div className="ee-drawer__head">
          <b>Blocks &amp; properties</b>
          <Button variant="tertiary" icon={XIcon} accessibilityLabel="Close" onClick={() => setDrawer(null)} />
        </div>
      ) : null}
      <Segment label="Right pane" value={rightTab} onChange={setRightTab} options={[{id: 'add', label: 'Add block'}, {id: 'properties', label: 'Properties'}]} />
      <div className="ee-pane__body ee-pane__body--right" hidden={rightTab !== 'add'}>
        <BlockLibrary onAdd={actions.addBlock} emailId={emailId} values={base.values} />
      </div>
      <div className="ee-pane__body ee-pane__body--right" hidden={rightTab !== 'properties'}>
        <Inspector node={selectedNode} actions={actions} emailId={emailId} values={base.values} resolve={base.resolve} />
      </div>
    </aside>
  );

  return (
    <EditorFrame
      title={def.name}
      dirty={ed.dirty}
      onSave={save}
      onDiscard={discard}
      onBack={onBack}
      actions={headerActions}
      onEscape={() => {
        if (R.current.ed.selectedId) {
          R.current.ed.select(null);
          return true;
        }
        return false;
      }}
    >
      <div className="ee-root" ref={rootRef} data-size={size} data-device={device}>
        {lint ? (
          <div className="ee-banners">
            <Banner tone="warning" title="This email has merge-tag warnings" onDismiss={() => setLint(null)}>
              <ul>
                {lint.map((f) => (
                  <li key={`${f.kind}-${f.tag}`}>{f.message}</li>
                ))}
              </ul>
            </Banner>
          </div>
        ) : null}
        <Toolbar
          size={size}
          rich={richActive}
          ed={ed}
          device={device}
          setDevice={setDevice}
          customer={customer}
          setCustomer={setCustomer}
          emailId={emailId}
          values={base.values}
          onTemplate={() => setModal('gallery')}
          onHtml={() => setModal('html')}
          onPreview={() => setModal('preview')}
          onOpenLeft={() => setDrawer('left')}
          onOpenRight={() => setDrawer('right')}
        />
        <div className="ee-panes">
          {leftPane}
          <main className="ee-center">
            <Canvas ed={ed} device={device} base={canvasBase} sender={sender} hoverId={hoverId} setHover={setHover} actions={actions} onJump={jump} scrollReq={scrollReq} />
          </main>
          {rightPane}
          {narrow && drawer ? <div className="ee-backdrop" onClick={() => setDrawer(null)} aria-hidden="true" /> : null}
        </div>
      </div>

      <Modal
        open={modal === 'reset'}
        onClose={() => setModal(null)}
        title="Reset to default"
        primaryAction={{
          content: 'Reset to default',
          onAction: () => {
            ed.load(defaultDoc(emailId), {voice: null});
            setLint(null);
            setModal(null);
          },
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setModal(null)}]}
      >
        <Modal.Section>
          Are you sure you want to reset the email content to default? This will replace your current subject, heading, content, action text, button link, and the visual email design with the default values.
        </Modal.Section>
      </Modal>
      <TemplateGallery
        open={modal === 'gallery'}
        onClose={() => setModal(null)}
        emailId={emailId}
        base={canvasBase}
        onApply={(voice) => {
          ed.load(buildDoc(emailId, voice), {voice});
          setLint(null);
          setModal(null);
        }}
      />
      <PreviewTestModal open={modal === 'preview'} onClose={() => setModal(null)} doc={doc} base={canvasBase} customer={customer} emailId={emailId} customCss={customCss} senderName={sender.name} onSend={sendTest} />
      <HtmlModal open={modal === 'html'} onClose={() => setModal(null)} doc={doc} base={canvasBase} customCss={customCss} />
      <ColumnLayoutModal open={!!layoutModal} mode={layoutModal?.mode} initial={layoutModal?.initial || [50, 50]} onClose={() => setLayoutModal(null)} onSubmit={submitLayout} />
      {toast ? (
        <Toast
          key={toast.key}
          content={toast.content}
          duration={4500}
          action={
            toast.undo
              ? {
                  content: 'Undo',
                  onAction: () => {
                    ed.undo();
                    setToast(null);
                  },
                }
              : undefined
          }
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </EditorFrame>
  );
}

export default function EmailEditor({emailId, email: stored, host, onBack, onSave, onToggle}) {
  const def = emailDef(emailId);
  if (!def) {
    // eslint-disable-next-line no-console
    console.error(`[EmailEditor] unknown emailId "${emailId}". Allowed: gift, reminder`);
    return null;
  }
  return (
    <EmailHostProvider value={host}>
      <Editor key={emailId} emailId={emailId} def={def} email={emailWithDefaults(stored)} onBack={onBack} onSave={onSave} onToggle={onToggle} />
    </EmailHostProvider>
  );
}
