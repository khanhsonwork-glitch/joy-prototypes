// Shop states a reviewer can switch with the Prototype panel or ?state= in the URL (#/membership?state=has-company).
// Only the two shops this change compares (the panel holds just the states the review needs).
// Both shops are on the Advanced plan, on a Shopify plan with B2B, and have already granted Joy the company scopes,
// so Joy has counted their Shopify B2B companies: 0 in the first, some in the second.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {DEFAULT_PATH} from '../shell/router.jsx';

export const DEFAULT_STATE = 'no-company';

export const STATES = [
  {value: 'no-company', label: 'No B2B companies in Shopify', help: 'Joy counted 0 companies: card stays, warnings show'},
  {value: 'has-company', label: 'Has B2B companies', help: 'Same screens as today: no warning'},
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
    window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}#${path || DEFAULT_PATH}${next === DEFAULT_STATE ? '' : `?state=${next}`}`);
  }, []);
  const value = useMemo(() => ({state, setState}), [state, setState]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, setState}: state is one of STATES[].value. */
export const useScenario = () => useContext(ScenarioContext);

/** The shop behind the current state. hasB2bCompanies mirrors shop.hasB2bCompanies in Joy (false = Joy counted 0). */
export function useShop() {
  const {state} = useScenario();
  return {state, hasB2bCompanies: state === 'has-company'};
}
