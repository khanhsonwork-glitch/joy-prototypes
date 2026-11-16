// Screen states a reviewer can switch with the Prototype panel or ?state= in the URL (#/settings?state=conflict).
// Hover and focus are the other two of the nine states: they come from the mouse and the keyboard.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const STATES = [
  {value: 'default', label: 'Off (default)', help: 'Limit not turned on yet'},
  {value: 'on', label: 'On', help: '1 Joy code per order, no clash with own codes'},
  {value: 'conflict', label: 'Own codes match', help: '2 shop codes look like Joy codes'},
  {value: 'test', label: 'Is this a Joy code?', help: 'Results for a shop code and a Joy code'},
  {value: 'empty-prefix', label: 'Reward with no prefix', help: 'Warning before turning on'},
  {value: 'limit-error', label: 'Shopify discount limit', help: 'Turning on fails, stays off'},
  {value: 'auto-off', label: 'Turned off by Joy', help: 'Its discount was deactivated or deleted in Shopify'},
  {value: 'save-error', label: 'Save failed', help: 'Update failed, switch keeps its saved value'},
  {value: 'checkout', label: 'Checkout', help: 'Second Joy code removed at checkout'},
  {value: 'empty', label: 'Empty', help: 'Joy has not issued a code yet'},
  {value: 'loading', label: 'Loading', help: 'Data on its way'},
  {value: 'error', label: 'Error', help: 'Loading failed'},
  {value: 'disabled', label: 'Disabled', help: 'Staff without Settings permission'},
  {value: 'overflow', label: 'Overflow', help: 'Longest prefix, most formats, biggest numbers'},
  {value: 'worst', label: 'Worst case', help: 'Overflow and the check against own codes failing'},
];
// ?state=off is the same screen as Default (the limit starts off); ?state=check is the old name's twin of test.
const ALIASES = {off: 'default', check: 'test'};
const VALID = new Set(STATES.map((s) => s.value));
function readState() {
  const query = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  const raw = query.get('state') || new URLSearchParams(window.location.search).get('state');
  const value = ALIASES[raw] || raw;
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
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#${path || '/settings'}${next === 'default' ? '' : `?state=${next}`}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);
