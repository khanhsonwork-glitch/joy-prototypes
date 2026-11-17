// The Joy widget editor, opened full screen over the admin like the real one (an App Bridge max modal):
// title bar with the Save bar swap, left menu (Body list), settings panel, live widget preview.
// Deep links: #/rich-text · #/image-with-text · #/off · #/members-only-existing · #/section-help
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, Icon, Modal, Text} from '@shopify/polaris';
import {ChevronLeftIcon, ChevronRightIcon, XIcon} from '@shopify/polaris-icons';
import {PRESET_ROUTES, idFromSegments, pathFor} from '../data/widget.js';
import {useEditor} from '../state/editor.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {Panel} from '../editor/Panels.jsx';
import {Preview} from '../editor/Preview.jsx';
import {Sidebar} from '../editor/Sidebar.jsx';
import {cx} from '../editor/bits.jsx';
import '../editor/editor.css';

export const EDITOR_SEGMENTS = [...PRESET_ROUTES, 'section', 'block'];

const presetOf = (slug, state) => (state === 'overflow' || state === 'empty' ? state : slug === 'off' || slug === 'members-only-existing' ? slug : 'default');

export function WidgetEditor() {
  const ed = useEditor();
  const route = useRoute();
  const navigate = useNavigate();
  const {state, setState} = useScenario();
  const {notify} = useShell();
  const [leave, setLeave] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const selectedId = idFromSegments(route.segments);
  const section = ed.sections.find((s) => s.id === selectedId);

  // An outside link (first load, a pasted deep link, a new review state) starts from that link's saved state.
  // Picking rows inside the editor only changes the selection and never resets what the merchant did.
  const preset = presetOf(route.segments[0], state);
  const viewerParam = route.query.get('viewer');
  useLayoutEffect(() => {
    if (ed.internalNav.current) {
      ed.internalNav.current = false;
      return;
    }
    if (ed.applied.current !== preset) {
      ed.applied.current = preset;
      ed.reset(preset, viewerParam);
    } else if (viewerParam) {
      ed.setViewer(viewerParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, route.path, viewerParam]);

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // A link to a block that no longer exists (reload after adding one) falls back to the first block.
  useEffect(() => {
    if (!section && state !== 'empty' && state !== 'loading' && state !== 'error' && ['block', 'section'].includes(route.segments[0])) {
      navigate('/rich-text', {replace: true});
    }
  }, [section, state, route.segments, navigate]);

  const dirtyRef = useRef(ed.dirty);
  dirtyRef.current = ed.dirty;
  const closeEditor = () => navigate('/on-site');
  const requestClose = () => (ed.dirty ? setLeave(() => closeEditor) : closeEditor());

  useEffect(() => {
    const before = (event) => {
      if (ed.internalNav.current) return;
      const target = (event.detail.path || '').replace(/^\//, '').split('/')[0];
      if (EDITOR_SEGMENTS.includes(target) || !dirtyRef.current) return;
      event.preventDefault();
      setLeave(() => event.detail.proceed);
    };
    const unload = (event) => {
      if (dirtyRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('prototype:before-navigate', before);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('prototype:before-navigate', before);
      window.removeEventListener('beforeunload', unload);
    };
  }, [ed.internalNav]);

  const select = (id) => {
    if (id === 'membership-card') {
      notify("Membership card isn't part of this prototype.");
      return;
    }
    const path = pathFor(id, route.path);
    if (path === route.path) return;
    ed.internalNav.current = true;
    navigate(path, {replace: true});
  };
  const add = (type) => select(ed.add(type));
  const remove = (id) => {
    const index = ed.sections.findIndex((s) => s.id === id);
    const rest = ed.sections.filter((s) => s.id !== id);
    ed.remove(id);
    if (selectedId === id) {
      const next = rest[Math.max(0, index - 1)] || rest[0];
      if (next) select(next.id);
      else navigate('/rich-text', {replace: true});
    }
  };

  const loading = state === 'loading';
  const failed = state === 'error';

  return (
    <div className="we" role="region" aria-label="Widget design" data-polaris-layer>
      <header className="we-titlebar">
        <Text as="h1" variant="headingMd">
          {ed.dirty ? 'Unsaved changes' : 'Widget design'}
        </Text>
        <div className="we-titlebar__actions">
          {ed.dirty ? (
            <>
              <Button onClick={ed.discard}>Discard</Button>
              <Button
                variant="primary"
                onClick={() => {
                  ed.save();
                  notify('Settings saved');
                }}
              >
                Save
              </Button>
            </>
          ) : (
            <Button onClick={() => notify("The guide video isn't part of this prototype.")}>Watch guide</Button>
          )}
          <Button variant="tertiary" icon={XIcon} accessibilityLabel="Close editor" onClick={requestClose} />
        </div>
      </header>

      {loading ? (
        <div className="we-state">
          <LoadingView rows={6} />
        </div>
      ) : failed ? (
        <div className="we-state">
          <ErrorView title="Couldn't load the widget design" onRetry={() => setState('default')}>
            Your saved settings are safe. Try again in a moment.
          </ErrorView>
        </div>
      ) : (
        <div className="we-body">
          <div className="we-settings">
            {collapsed ? null : <Sidebar selectedId={selectedId} onSelect={select} onAdd={add} onRemove={remove} />}
            <button type="button" className="we-collapse" aria-label={collapsed ? 'Show menu' : 'Hide menu'} onClick={() => setCollapsed((v) => !v)}>
              <Icon source={collapsed ? ChevronRightIcon : ChevronLeftIcon} />
            </button>
            <div className={cx('we-content')}>
              <Panel section={section} />
            </div>
          </div>
          <Preview onInspect={select} />
        </div>
      )}

      <Modal
        open={!!leave}
        onClose={() => setLeave(null)}
        title="Leave page with unsaved changes?"
        primaryAction={{
          content: 'Leave page',
          destructive: true,
          onAction: () => {
            dirtyRef.current = false;
            ed.discard();
            const action = leave;
            setLeave(null);
            action();
          },
        }}
        secondaryActions={[{content: 'Stay', onAction: () => setLeave(null)}]}
      >
        <Modal.Section>Leaving this page will delete all unsaved changes.</Modal.Section>
      </Modal>
    </div>
  );
}
