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
  // Both sides by order amount, as the merchant asked: friend $5 / $10 off, referrer 100 / 200 points.
  const calc = calcFromUrl();
  const byAmount = {
    ...BASE_PROGRAM, referrerMethod: 'point_order_value', referrerCalc: calc, referrerTiers: REFERRER_TIERS,
    friendTiersOn: true, friendTierValues: FRIEND_TIER_VALUES,
  };
  // Referrer on "Points for every $1 spent": the friend keeps the same amounts as its own table.
  if (calc === CALC_RATE) {
    Object.assign(byAmount, {friendSameAmounts: false, friendTiers: REFERRER_TIERS.map((t) => ({id: `f${t.id}`, min: t.min, value: FRIEND_TIER_VALUES[t.id]}))});
  }
  if (state === 'today') return {...BASE_PROGRAM};
  if (state === 'worst') return {...byAmount, referrerTiers: WORST_TIERS};
  return byAmount;
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
