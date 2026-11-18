// Screen states a reviewer can switch with the Prototype panel or ?state= in the URL (#/demo?state=empty).
// Hover and focus are the other two of the nine states: they come from the mouse and the keyboard.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const STATES = [
  {value: 'default', label: 'Default', help: 'Follow each language (today)'},
  {value: 'same', label: 'Same format', help: "Same format for all languages, 1'125 picked"},
  {value: 'per-language', label: 'Per language', help: 'Set per language in Translations'},
  {value: 'empty', label: 'Empty', help: 'New shop, no detected languages yet'},
  {value: 'loading', label: 'Loading', help: 'Data on its way'},
  {value: 'error', label: 'Error', help: 'Loading failed'},
  {value: 'disabled', label: 'Disabled', help: 'Staff account without edit access'},
  {value: 'overflow', label: 'Overflow', help: 'Longest point label, biggest numbers'},
  {value: 'worst', label: 'Worst case', help: 'Overflow, many languages and a failed sync'},
];
const VALID = new Set(STATES.map((s) => s.value));
// ?mode=follow|same|translation is a readable alias for the three Number format choices (#/settings?mode=same).
const MODE_ALIAS = {follow: 'default', same: 'same', translation: 'per-language', 'per-language': 'per-language'};
function readState() {
  const query = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  const search = new URLSearchParams(window.location.search);
  const value = query.get('state') || search.get('state') || MODE_ALIAS[query.get('mode') || search.get('mode')];
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
    const [path, hashQuery = ''] = window.location.hash.replace(/^#/, '').split('?');
    const keep = new URLSearchParams(hashQuery);
    keep.delete('state');
    keep.delete('mode');
    if (next !== 'default') keep.set('state', next);
    const search = new URLSearchParams(window.location.search);
    search.delete('state');
    search.delete('mode');
    const rest = search.toString();
    const hashRest = keep.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#${path || '/settings'}${hashRest ? `?${hashRest}` : ''}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);
