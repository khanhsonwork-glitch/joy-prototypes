// One store for giveaways and the shop's state, shared by the list, the giveaway page and the Membership card.
// A giveaway that is giving keeps running here, whichever page is open, and what the merchant creates or changes
// survives a reload (browser storage, this browser only).
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {TRIAL_EMAILS_LEFT, seedGiveaways, recipientsOf} from '../data/giveaways.js';
import {clockNow, makeLedger} from '../data/ledger.js';
import {newVisit} from '../data/people.js';

const StoreContext = createContext(null);
const KEY = 'pg:v4';
// what the followed customers did in the store (redeemed, ordered): kept across pages, so the admin sees it too
const VISITS_KEY = 'pg:visits';
const DATE_KEYS = new Set(['at', 'givenAt', 'createdAt', 'updatedAt', 'sentUseBy', 'reminderSentAt', 'reminderUseBy']);

function readFlag(key, fallback) {
  try {
    const v = window.localStorage.getItem(`pg:${key}`);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}
function writeFlag(key, value) {
  try {
    window.localStorage.setItem(`pg:${key}`, value ? '1' : '0');
  } catch {
    /* private window: the flag lives for this tab only */
  }
}

const reviver = (k, v) => (DATE_KEYS.has(k) && typeof v === 'string' ? new Date(v) : v);

/** Saved changes on top of the seeded giveaways: records the merchant created, plus changes to seeded ones. */
function loadSaved() {
  let saved = {created: [], patches: {}};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) saved = {...saved, ...JSON.parse(raw, reviver)};
  } catch {
    /* blocked storage: start from the seeded shop */
  }
  return saved;
}
function loadVisits() {
  try {
    const raw = window.localStorage.getItem(VISITS_KEY);
    return raw ? JSON.parse(raw, reviver) : {};
  } catch {
    return {};
  }
}
function saveVisits(visits) {
  try {
    window.localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
  } catch {
    /* storage full or blocked: the visit lasts until reload */
  }
}
function save(saved) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    /* storage full or blocked: changes last until reload */
  }
}

function build(fresh, saved) {
  const seeded = fresh ? [] : seedGiveaways().map((g) => (saved.patches[g.id] ? {...g, ...saved.patches[g.id]} : g));
  return [...saved.created, ...seeded].filter((g) => !g.removed);
}

export function StoreProvider({children}) {
  const [fresh, setFreshState] = useState(() => readFlag('fresh', false));
  const [trial, setTrialState] = useState(() => readFlag('trial', false));
  const [segmentGone, setSegmentGoneState] = useState(() => readFlag('segment-gone', false));
  const [saved, setSaved] = useState(loadSaved);
  const [visits, setVisits] = useState(loadVisits);
  const setVisit = useCallback(
    (who, fn) =>
      setVisits((prev) => {
        const next = {...prev, [who]: fn(prev[who] || newVisit())};
        saveVisits(next);
        return next;
      }),
    []
  );
  const giveaways = useMemo(() => build(fresh, saved), [fresh, saved]);

  const commit = useCallback((fn) => {
    setSaved((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const setFresh = useCallback(
    (value) => {
      writeFlag('fresh', value);
      setFreshState(value);
      commit(() => ({created: [], patches: {}}));
      saveVisits({});
      setVisits({});
    },
    [commit]
  );
  const setTrial = useCallback((value) => {
    writeFlag('trial', value);
    setTrialState(value);
  }, []);
  const setSegmentGone = useCallback((value) => {
    writeFlag('segment-gone', value);
    setSegmentGoneState(value);
  }, []);

  const isSeeded = (id) => !id.startsWith('g-u');
  const upsert = useCallback(
    (g) =>
      commit((prev) => {
        if (isSeeded(g.id)) return {...prev, patches: {...prev.patches, [g.id]: {...(prev.patches[g.id] || {}), ...g}}};
        const i = prev.created.findIndex((x) => x.id === g.id);
        const created = i === -1 ? [g, ...prev.created] : prev.created.map((x) => (x.id === g.id ? {...x, ...g} : x));
        return {...prev, created};
      }),
    [commit]
  );
  const patch = useCallback((id, changes) => upsert({id, ...changes}), [upsert]);
  const remove = useCallback((id) => patch(id, {removed: true}), [patch]);

  // Background run: every giving giveaway advances here, on any page, and finishes once.
  const latest = useRef(giveaways);
  latest.current = giveaways;
  useEffect(() => {
    const t = setInterval(() => {
      latest.current
        .filter((g) => g.status === 'giving')
        .forEach((g) => {
          const total = g.recipientIds ? g.recipientIds.length : recipientsOf(g).length || 1;
          const done = Math.min(total, (g.progress || 0) + Math.max(1, Math.ceil(total / 20)));
          if (done >= total) patch(g.id, {progress: total, status: g.expiry?.mode === 'after' ? 'active' : 'completed'});
          else patch(g.id, {progress: done});
        });
    }, 250);
    return () => clearInterval(t);
  }, [patch]);

  // "Segment deleted in Shopify": Joy's segment-delete webhook sends a scheduled giveaway that used it back to Draft.
  const deleted = useMemo(() => (segmentGone ? ['s-lapsed'] : []), [segmentGone]);
  const shown = useMemo(
    () =>
      giveaways.map((g) =>
        g.status === 'scheduled' && g.audience === 'segments' && g.segmentIds.some((id) => deleted.includes(id)) ? {...g, status: 'draft', segmentDeleted: true} : g
      ),
    [giveaways, deleted]
  );

  // One ledger: grants given in this session add to members' balances everywhere (lists, customer page, storefront).
  const ledger = useMemo(() => makeLedger(giveaways, visits), [giveaways, visits]);
  // the shop's clock today: moves on with what's been done in the admin and the store
  const clock = useMemo(() => clockNow(giveaways, visits), [giveaways, visits]);
  // Trial: one email allowance for the shop, used by every giveaway's emails.
  const emailsLeft = useMemo(() => Math.max(0, TRIAL_EMAILS_LEFT - giveaways.filter((g) => !g.seed && g.trialSends).reduce((s, g) => s + g.trialSends, 0)), [giveaways]);
  const value = useMemo(
    () => ({giveaways: shown, upsert, patch, remove, fresh, setFresh, trial, setTrial, segmentGone, setSegmentGone, deleted, ledger, emailsLeft, visits, setVisit, clock}),
    [shown, upsert, patch, remove, fresh, setFresh, trial, setTrial, segmentGone, setSegmentGone, deleted, ledger, emailsLeft, visits, setVisit, clock]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
