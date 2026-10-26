// Editor state: the document with undo/redo (edits within 300 ms of the same kind are one step), the settings that sit
// outside the document (sender name, reply-to, custom CSS, applied voice), the selection, and the dirty flag.
// Dirty = the document or the settings differ from the last loaded/saved snapshot, OR a force-dirty latch is set
// (Reset to default and applying a template do not save: they load a document and raise the save bar).
import {useCallback, useMemo, useReducer, useRef} from 'react';
import {find} from './blocks.js';

const clone = (v) => JSON.parse(JSON.stringify(v));
const snapshot = (doc, meta) => JSON.stringify({doc, meta});
const LIMIT = 100;

function reducer(state, action) {
  switch (action.type) {
    case 'edit': {
      const next = action.fn(state.doc);
      if (next === state.doc) return state;
      const now = Date.now();
      const merge = action.key && action.key === state.key && now - state.at < 300;
      const sel = state.selectedId && !find(next.blocks, state.selectedId) ? null : state.selectedId;
      return {...state, doc: next, past: merge ? state.past : [...state.past, state.doc].slice(-LIMIT), future: [], key: action.key || null, at: now, selectedId: sel};
    }
    case 'undo': {
      if (!state.past.length) return state;
      const doc = state.past[state.past.length - 1];
      const sel = state.selectedId && !find(doc.blocks, state.selectedId) ? null : state.selectedId;
      return {...state, doc, past: state.past.slice(0, -1), future: [state.doc, ...state.future], key: null, selectedId: sel};
    }
    case 'redo': {
      if (!state.future.length) return state;
      const doc = state.future[0];
      const sel = state.selectedId && !find(doc.blocks, state.selectedId) ? null : state.selectedId;
      return {...state, doc, past: [...state.past, state.doc], future: state.future.slice(1), key: null, selectedId: sel};
    }
    case 'meta':
      return {...state, meta: {...state.meta, ...action.patch}};
    case 'select':
      return state.selectedId === action.id ? state : {...state, selectedId: action.id};
    case 'load':
      // Reset to default / apply a template: replaces the live document, forgets history, raises the save bar
      return {...state, doc: action.doc, meta: action.meta ? {...state.meta, ...action.meta} : state.meta, past: [], future: [], key: null, selectedId: null, force: true};
    case 'restore':
      return {...state, doc: clone(action.doc), meta: {...action.meta}, past: [], future: [], key: null, selectedId: null, force: false};
    case 'clean':
      return {...state, force: false};
    default:
      return state;
  }
}

/**
 * useEditorState(initialDoc, initialMeta) ->
 *   {doc, meta, selectedId, dirty, canUndo, canRedo, edit(fn, key), undo, redo, select, setMeta, load(doc, meta), discard(), markSaved()}
 */
export default function useEditorState(initialDoc, initialMeta) {
  const base = useRef(null);
  if (!base.current) base.current = {doc: clone(initialDoc), meta: {...initialMeta}, snap: snapshot(initialDoc, initialMeta)};
  const [state, dispatch] = useReducer(reducer, null, () => ({doc: clone(initialDoc), meta: {...initialMeta}, past: [], future: [], key: null, at: 0, selectedId: null, force: false}));

  const dirty = state.force || snapshot(state.doc, state.meta) !== base.current.snap;

  const edit = useCallback((fn, key) => dispatch({type: 'edit', fn, key}), []);
  const undo = useCallback(() => dispatch({type: 'undo'}), []);
  const redo = useCallback(() => dispatch({type: 'redo'}), []);
  const select = useCallback((id) => dispatch({type: 'select', id}), []);
  const setMeta = useCallback((patch) => dispatch({type: 'meta', patch}), []);
  const load = useCallback((doc, meta) => dispatch({type: 'load', doc, meta}), []);
  const discard = useCallback(() => dispatch({type: 'restore', doc: base.current.doc, meta: base.current.meta}), []);
  // After a save the live state becomes the new baseline (the ref is read at the next render, so pass the values in)
  const markSaved = useCallback((doc, meta) => {
    base.current = {doc: clone(doc), meta: {...meta}, snap: snapshot(doc, meta)};
    dispatch({type: 'clean'});
  }, []);

  return useMemo(
    () => ({doc: state.doc, meta: state.meta, selectedId: state.selectedId, dirty, canUndo: state.past.length > 0, canRedo: state.future.length > 0, edit, undo, redo, select, setMeta, load, discard, markSaved}),
    [state, dirty, edit, undo, redo, select, setMeta, load, discard, markSaved],
  );
}

