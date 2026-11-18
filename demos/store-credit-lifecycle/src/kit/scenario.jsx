// Screen states a reviewer can switch with the Prototype panel or ?state= in the URL (#/demo?state=empty).
// Hover and focus are the other two of the nine states: they come from the mouse and the keyboard.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const STATES = [
  {value: 'default', label: 'Expiring credit', help: 'CA$8.00 left of a CA$20.00 credit that expires 31/12/2026'},
  {value: 'no-expiry', label: 'No expiring credit', help: 'Balance only from credit with no expiry date: no expiry line'},
  {value: 'masked', label: 'Balance hidden', help: 'Hide balance on: the expiry line stays hidden until the eye is tapped'},
  {value: 'empty', label: 'Empty', help: 'No store credit yet · Klaviyo: no trigger picked yet'},
  {value: 'loading', label: 'Loading', help: 'Data on its way'},
  {value: 'error', label: 'Error', help: 'Loading failed'},
  {value: 'disabled', label: 'Disabled', help: 'Klaviyo not connected yet: triggers can not be picked'},
  {value: 'overflow', label: 'Overflow', help: 'Biggest amounts, longest labels'},
  {value: 'worst', label: 'Worst case', help: 'Three wallets, many rows and a failed save'},
];
const VALID = new Set(STATES.map((s) => s.value));
function readState() {
  const query = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  const value = query.get('state') || new URLSearchParams(window.location.search).get('state');
  return VALID.has(value) ? value : 'default';
}

const ScenarioContext = createContext({state: 'default', setState: () => {}});

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
    // Keep the URL shareable: the current route plus ?state=<next> (default = no query).
    const [path] = window.location.hash.replace(/^#/, '').split('?');
    const search = new URLSearchParams(window.location.search);
    search.delete('state');
    const rest = search.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#${path || '/widget'}${next === 'default' ? '' : `?state=${next}`}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);
