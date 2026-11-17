// The widget design being edited: Body sections (custom blocks + built-in), what is saved, and the preview customer.
// Lives in memory until the page reloads, like every hub demo. Dirty = differs from the last Save.
import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {BLOCK_DEFAULTS, EARN_PROGRAMS, initialSections} from '../data/widget.js';

const EditorContext = createContext(null);
const VIEWER_VALUES = ['guest', 'signed-in', 'member'];

const snapshot = (value) => JSON.stringify(value);

function fresh(preset, viewer) {
  const sections = initialSections(preset);
  return {
    sections,
    membership: true,
    programs: EARN_PROGRAMS.map((p) => ({...p})),
    // The earn panel keeps a few more saved fields; "Show to guests" lives on the section itself.
    saved: snapshot({sections, membership: true, programs: EARN_PROGRAMS}),
    viewer,
  };
}

/** `preset` = what the deep link opens with; `viewer` = the preview customer it starts on. */
export function EditorProvider({children}) {
  const [model, setModel] = useState(() => fresh('default', 'member'));
  const [device, setDevice] = useState('desktop');
  const [inspect, setInspect] = useState(false);
  // Set right before an in-editor route change so the frame does not mistake it for leaving the editor.
  const internalNav = useRef(false);
  // The deep link / review state the model was last built for, so reopening the editor keeps what was saved.
  const applied = useRef(null);

  const dirty = snapshot({sections: model.sections, membership: model.membership, programs: model.programs}) !== model.saved;

  const reset = useCallback((preset, viewerParam) => {
    const viewer = VIEWER_VALUES.includes(viewerParam) ? viewerParam : preset === 'members-only-existing' ? 'guest' : 'member';
    setModel(fresh(preset, viewer));
  }, []);

  const patch = useCallback((id, values) => {
    setModel((m) => ({...m, sections: m.sections.map((s) => (s.id === id ? {...s, ...values} : s))}));
  }, []);
  const toggle = useCallback((id) => {
    if (id === 'membership-card') setModel((m) => ({...m, membership: !m.membership}));
    else setModel((m) => ({...m, sections: m.sections.map((s) => (s.id === id ? {...s, enabled: s.enabled === false} : s))}));
  }, []);
  const remove = useCallback((id) => {
    setModel((m) => ({...m, sections: m.sections.filter((s) => s.id !== id)}));
  }, []);
  const add = useCallback((type) => {
    const id = `${type}_${Date.now()}`;
    setModel((m) => ({
      ...m,
      sections: [...m.sections, {id, type, enabled: true, audience: 'everyone', ...BLOCK_DEFAULTS[type]}],
    }));
    return id;
  }, []);
  const move = useCallback((fromId, toId) => {
    setModel((m) => {
      const from = m.sections.findIndex((s) => s.id === fromId);
      const to = m.sections.findIndex((s) => s.id === toId);
      if (from < 0 || to < 0 || from === to) return m;
      const next = [...m.sections];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return {...m, sections: next};
    });
  }, []);
  const patchProgram = useCallback((id, values) => {
    setModel((m) => ({...m, programs: m.programs.map((p) => (p.id === id ? {...p, ...values} : p))}));
  }, []);
  const moveProgram = useCallback((fromId, toId) => {
    setModel((m) => {
      const from = m.programs.findIndex((p) => p.id === fromId);
      const to = m.programs.findIndex((p) => p.id === toId);
      if (from < 0 || to < 0 || from === to) return m;
      const next = [...m.programs];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return {...m, programs: next};
    });
  }, []);
  const setViewer = useCallback((viewer) => setModel((m) => ({...m, viewer})), []);
  const save = useCallback(() => {
    setModel((m) => ({...m, saved: snapshot({sections: m.sections, membership: m.membership, programs: m.programs})}));
  }, []);
  const discard = useCallback(() => {
    setModel((m) => {
      const saved = JSON.parse(m.saved);
      return {...m, ...saved};
    });
  }, []);

  const value = useMemo(
    () => ({
      ...model,
      dirty,
      device,
      setDevice,
      inspect,
      setInspect,
      internalNav,
      applied,
      reset,
      patch,
      toggle,
      remove,
      add,
      move,
      patchProgram,
      moveProgram,
      setViewer,
      save,
      discard,
    }),
    [model, dirty, device, inspect, reset, patch, toggle, remove, add, move, patchProgram, moveProgram, setViewer, save, discard]
  );
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export const useEditor = () => useContext(EditorContext);
