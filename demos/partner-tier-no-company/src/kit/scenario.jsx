// Review states, read from the URL (after the #, or before it when typed by hand) and switched in the Prototype panel.
//   ?state=no-company (default) | has-company   Joy counted 0 Shopify B2B companies, or some. Every screen.
//   ?plan=essential [&excluded=1]               Settings › General only: a shop below Advanced, where "Exclude B2B
//                                                customers" is locked; excluded=1 = it was ticked before the release.
// Without plan the shop is on Advanced, on a Shopify plan with B2B, and has granted Joy the company scopes.
// `state` follows in-app links (router carryState); plan/excluded belong to the Settings review and stay on that page.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {DEFAULT_PATH, useRoute} from '../shell/router.jsx';

export const DEFAULT_STATE = 'no-company';

export const STATES = [
  {value: 'no-company', label: 'No B2B companies in Shopify', help: 'Joy counted 0 companies: card stays, warnings show'},
  {value: 'has-company', label: 'Has B2B companies', help: 'Same screens as today: no warning'},
];
const VALID = new Set(STATES.map((s) => s.value));

/** Plan choices for Settings › General (value = plan + excluded flag). */
export const PLANS = [
  {value: 'advanced', plan: 'advanced', excluded: false, label: 'Advanced plan', help: 'Exclude B2B customers can be ticked'},
  {value: 'essential', plan: 'essential', excluded: false, label: 'Essential · not ticked', help: 'Checkbox locked, "Available on Advanced"'},
  {value: 'essential-excluded', plan: 'essential', excluded: true, label: 'Essential · ticked before release', help: 'Kept ticked; locks once unticked'},
];

function params() {
  const hashQuery = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  const search = new URLSearchParams(window.location.search);
  return (key) => hashQuery.get(key) ?? search.get(key);
}

function readScenario() {
  const get = params();
  const state = VALID.has(get('state')) ? get('state') : DEFAULT_STATE;
  const plan = get('plan') === 'essential' ? 'essential' : 'advanced';
  const excluded = plan === 'essential' && get('excluded') === '1';
  return {state, plan, excluded};
}

/** Set or drop (null) params after the #, keep the route and the rest of the URL. No history entry. */
function writeParams(updates) {
  const [path, ...rest] = window.location.hash.replace(/^#/, '').split('?');
  const query = new URLSearchParams(rest.join('?'));
  const search = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(updates)) {
    search.delete(key);
    if (value == null) query.delete(key);
    else query.set(key, value);
  }
  const pre = search.toString();
  const post = query.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${pre ? `?${pre}` : ''}#${path || DEFAULT_PATH}${post ? `?${post}` : ''}`);
}

const ScenarioContext = createContext({...readScenario(), setState: () => {}, setPlan: () => {}});

export function ScenarioProvider({children}) {
  useRoute(); // re-read the URL on every in-app navigation
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener('hashchange', bump);
    window.addEventListener('popstate', bump);
    return () => {
      window.removeEventListener('hashchange', bump);
      window.removeEventListener('popstate', bump);
    };
  }, []);
  const {state, plan, excluded} = readScenario();
  const setState = useCallback((next) => {
    if (!VALID.has(next)) return;
    writeParams({state: next === DEFAULT_STATE ? null : next});
    setTick((n) => n + 1);
  }, []);
  const setPlan = useCallback((value) => {
    const choice = PLANS.find((p) => p.value === value);
    if (!choice) return;
    writeParams({plan: choice.plan === 'advanced' ? null : choice.plan, excluded: choice.excluded ? '1' : null});
    setTick((n) => n + 1);
  }, []);
  const value = useMemo(() => ({state, plan, excluded, setState, setPlan}), [state, plan, excluded, setState, setPlan]);
  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/** {state, plan, excluded, setState, setPlan} */
export const useScenario = () => useContext(ScenarioContext);

/**
 * The shop behind the URL. hasB2bCompanies mirrors shop.hasB2bCompanies in Joy (false = Joy counted 0).
 * planKey names the Settings shop (plan + whether Exclude B2B was ticked before the release).
 */
export function useShop() {
  const {state, plan, excluded} = useScenario();
  return {
    state,
    hasB2bCompanies: state === 'has-company',
    plan,
    isAdvanced: plan === 'advanced',
    excludedBeforeRelease: excluded,
    planKey: plan === 'advanced' ? 'advanced' : excluded ? 'essential-excluded' : 'essential',
  };
}
