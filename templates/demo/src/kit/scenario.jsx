// Screen states a reviewer can switch with the Prototype panel or ?state= in the URL (#/demo?state=empty).
// Hover and focus are the other two of the nine states: they come from the mouse and the keyboard.
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {useRoute} from '../shell/router.jsx';

export const STATES = [
  {value: 'default', label: 'Default', help: 'Normal data'},
  {value: 'empty', label: 'Empty', help: 'Nothing created yet'},
  {value: 'loading', label: 'Loading', help: 'Data on its way'},
  {value: 'error', label: 'Error', help: 'Loading failed'},
  {value: 'disabled', label: 'Disabled', help: 'Plan or permission blocks editing'},
  {value: 'overflow', label: 'Overflow', help: 'Longest names, biggest numbers'},
  {value: 'worst', label: 'Worst case', help: 'Overflow, many rows and a failed sync'},
];
const VALID = new Set(STATES.map((s) => s.value));

const ScenarioContext = createContext({state: 'default', setState: () => {}});

export function ScenarioProvider({children}) {
  const {query} = useRoute();
  const initial = query.get('state');
  const [state, setStateRaw] = useState(VALID.has(initial) ? initial : 'default');
  const setState = useCallback((next) => {
    if (!VALID.has(next)) return;
    setStateRaw(next);
    // Keep the URL shareable: the current route plus ?state=<next> (default = no query).
    const [path] = window.location.hash.replace(/^#/, '').split('?');
    window.history.replaceState(null, '', `${window.location.search}#${path || '/demo'}${next === 'default' ? '' : `?state=${next}`}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);
