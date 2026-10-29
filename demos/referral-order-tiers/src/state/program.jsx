// In-memory referral program: seeded from the screen state, edited by the admin screens, read by the storefront.
// No backend, no storage: a reload starts over.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {BASE_PROGRAM, CALC_AMOUNT, CALC_RATE, FRIEND_TIER_VALUES, REFERRER_TIERS, WORST_TIERS} from '../data/index.js';
import {useScenario} from '../kit/scenario.jsx';

// ?calc=rate | ?calc=amount (after the #) opens "Points based on order value" with that way of calculating picked.
function calcFromUrl() {
  const c = new URLSearchParams(window.location.hash.split('?').slice(1).join('?')).get('calc');
  return c === CALC_RATE || c === CALC_AMOUNT ? c : CALC_AMOUNT;
}

export function seedFor(state) {
  const release1 = {...BASE_PROGRAM, referrerMethod: 'point_order_value', referrerCalc: calcFromUrl(), referrerTiers: REFERRER_TIERS};
  if (state === 'today') return {...BASE_PROGRAM};
  if (state === 'release2') return {...release1, friendTiersOn: true, friendTierValues: FRIEND_TIER_VALUES};
  if (state === 'worst') return {...release1, referrerTiers: WORST_TIERS};
  return release1;
}

const ProgramContext = createContext(null);

export function ProgramProvider({children}) {
  const {state} = useScenario();
  const [program, setProgram] = useState(() => seedFor(state));
  useEffect(() => setProgram(seedFor(state)), [state]);
  const save = useCallback((next) => setProgram(next), []);
  const value = useMemo(() => ({program, save}), [program, save]);
  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>;
}

/** {program, save(program)} */
export const useProgram = () => useContext(ProgramContext);
