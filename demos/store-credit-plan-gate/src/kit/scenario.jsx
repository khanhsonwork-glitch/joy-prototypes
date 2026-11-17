// Screen states a reviewer can switch with the Prototype panel or ?state= in the URL (#/redeem-add?state=free-old).
// The first three are the shops this feature compares; the rest are the usual screen states, shown for the
// default shop (Free plan, installed after release). Hover and focus come from the mouse and the keyboard.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const DEFAULT_STATE = 'free-new';

export const STATES = [
  {value: 'free-new', group: 'shop', label: 'Free · installed after release', help: 'Store credit needs Essential: badge shows'},
  {value: 'free-old', group: 'shop', label: 'Free · installed before release', help: 'Same as today: store credit selectable'},
  {value: 'essential', group: 'shop', label: 'Essential plan', help: 'Any paid plan or trial: no badge'},
  {value: 'empty', group: 'screen', label: 'Empty', help: 'No programs created yet'},
  {value: 'loading', group: 'screen', label: 'Loading', help: 'Data on its way'},
  {value: 'error', group: 'screen', label: 'Error', help: 'Loading failed'},
  {value: 'overflow', group: 'screen', label: 'Overflow', help: 'Longest names, biggest numbers'},
  {value: 'worst', group: 'screen', label: 'Worst case', help: 'Overflow and many rows'},
];
const VALID = new Set(STATES.map((s) => s.value));
function readState() {
  const query = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  const value = query.get('state') || new URLSearchParams(window.location.search).get('state');
  return VALID.has(value) ? value : DEFAULT_STATE;
}

const ScenarioContext = createContext({state: DEFAULT_STATE, setState: () => {}});

export function ScenarioProvider({children}) {
  // Accept ?state= after the # (what the panel writes) and before it (what people type by hand).
  const [state, setStateRaw] = useState(readState);
  useEffect(() => {
    const sync = () => setStateRaw(readState());
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);
  const setState = useCallback((next) => {
    if (!VALID.has(next)) return;
    setStateRaw(next);
    // Keep the URL shareable: the current route plus ?state=<next> (the default shop = no query).
    const [path] = window.location.hash.replace(/^#/, '').split('?');
    const search = new URLSearchParams(window.location.search);
    search.delete('state');
    const rest = search.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#${path || '/redeem-add'}${next === DEFAULT_STATE ? '' : `?state=${next}`}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);

/**
 * The shop behind the current state. Screen states (empty, loading, error, overflow, worst) use the default shop.
 * storeCreditLocked is the rule being prototyped: Free plan AND installed after the release date.
 */
export function useShop() {
  const {state} = useScenario();
  const plan = state === 'essential' ? 'essential' : 'free';
  const installedAfterRelease = state !== 'free-old';
  return {
    state,
    plan,
    isPremium: plan !== 'free',
    installedAfterRelease,
    storeCreditLocked: plan === 'free' && installedAfterRelease,
    long: state === 'overflow' || state === 'worst',
  };
}
