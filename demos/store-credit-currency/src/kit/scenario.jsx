// Screen states a reviewer can switch with the Prototype panel or ?state= in the URL (#/customer?state=browsed).
// Hover and focus are the other two of the nine states: they come from the mouse and the keyboard.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const STATES = [
  {value: 'default', label: 'Most orders in SGD', help: '$20 USD credit, empty SGD account · suggestion from orders'},
  {value: 'same', label: 'Pays in shop currency', help: 'Orders in USD · $20 USD credit'},
  {value: 'browsed', label: 'Browsed in EUR', help: 'No orders · last visited the store in EUR'},
  {value: 'address', label: 'Address in Singapore', help: 'No orders, never browsed · default address in Singapore'},
  {value: 'noorders', label: 'Nothing to go on', help: 'No orders, no visits, no default address'},
  {value: 'single', label: 'Shop sells only USD', help: 'One currency · Currency field locked'},
  {value: 'error', label: 'Suggestion failed', help: "Couldn't work out the customer's currency"},
  {value: 'loading', label: 'Working out the suggestion', help: 'Suggested currency not known yet'},
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
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#${path || '/customer'}${next === 'default' ? '' : `?state=${next}`}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);
