// One store for the whole revamp prototype, so every screen reads and writes the same sample shop.
// Edits persist in localStorage, so a saved change survives a reload ("work như thật"); the Prototype
// panel can reset to the seed. Each module owns its seed slice in src/data/seed/<module>.js.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useReducer} from 'react';
import {SEED} from '../data/seed/index.js';

const KEY = 'joy-admin-revamp-opus-v2'; // v2 = shop renamed to North Bloom (18/11)
const clone = value => JSON.parse(JSON.stringify(value));

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return clone(SEED);
    const saved = JSON.parse(raw);
    // A slice added to the seed after the last save appears without wiping the merchant's edits.
    return {...clone(SEED), ...saved};
  } catch {
    return clone(SEED);
  }
}

function setIn(obj, path, value) {
  if (!path.length) return value;
  const [head, ...rest] = path;
  const base = Array.isArray(obj) ? [...obj] : {...(obj ?? {})};
  base[head] = setIn(base[head], rest, value);
  return base;
}

let counter = 0;
export const newId = prefix => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

function reducer(db, action) {
  switch (action.type) {
    case 'set':
      return setIn(db, action.path, action.value);
    case 'merge':
      return setIn(db, action.path, {...(action.path.reduce((o, k) => o?.[k], db) ?? {}), ...action.value});
    case 'upsert': {
      const list = db[action.coll] ?? [];
      const exists = list.some(item => item.id === action.item.id);
      const next = exists
        ? list.map(item => (item.id === action.item.id ? {...item, ...action.item} : item))
        : [action.atStart ? action.item : null, ...list, action.atStart ? null : action.item].filter(Boolean);
      return {...db, [action.coll]: next};
    }
    case 'remove':
      return {...db, [action.coll]: (db[action.coll] ?? []).filter(item => !action.ids.includes(item.id))};
    case 'reorder':
      return {...db, [action.coll]: action.ids.map(id => db[action.coll].find(item => item.id === id)).filter(Boolean)};
    case 'reset':
      return clone(SEED);
    default:
      return db;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({children}) {
  const [db, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {window.localStorage.setItem(KEY, JSON.stringify(db));} catch {/* private mode: keep in memory */}
    }, 150);
    return () => window.clearTimeout(handle);
  }, [db]);

  const api = useMemo(() => ({
    /** set(['settings', 'general', 'prefix'], 'JOY-') */
    set: (path, value) => dispatch({type: 'set', path, value}),
    /** merge(['program'], {status: 'live'}) */
    merge: (path, value) => dispatch({type: 'merge', path, value}),
    /** upsert('earn', item) — adds when the id is new */
    upsert: (coll, item, {atStart = false} = {}) => dispatch({type: 'upsert', coll, item, atStart}),
    remove: (coll, ids) => dispatch({type: 'remove', coll, ids: Array.isArray(ids) ? ids : [ids]}),
    reorder: (coll, ids) => dispatch({type: 'reorder', coll, ids}),
    reset: () => {
      try {window.localStorage.removeItem(KEY);} catch {/* ignore */}
      dispatch({type: 'reset'});
    },
  }), []);

  const value = useMemo(() => ({db, ...api}), [db, api]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** {db, set, merge, upsert, remove, reorder, reset} */
export const useStore = () => useContext(StoreContext);

/** [items, {get, upsert, remove, toggle}] for one collection. */
export function useCollection(coll) {
  const {db, upsert, remove} = useStore();
  const items = db[coll] ?? [];
  const get = useCallback(id => items.find(item => item.id === id), [items]);
  const toggle = useCallback((id, field = 'status', on = 'active', off = 'inactive') => {
    const item = items.find(i => i.id === id);
    if (item) upsert(coll, {...item, [field]: item[field] === on ? off : on});
  }, [items, coll, upsert]);
  return [items, {get, upsert: item => upsert(coll, item), remove: ids => remove(coll, ids), toggle}];
}
