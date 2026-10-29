// In-memory referral program: seeded from the screen state, edited by the admin screens, read by the storefront.
// No backend, no storage: a reload starts over.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {BASE_PROGRAM, CONFIGURED_TIERS, OVERFLOW_TIERS, WORST_TIERS} from '../data/index.js';
import {useScenario} from '../kit/scenario.jsx';

export function seedFor(state) {
  if (state === 'default' || state === 'loading' || state === 'error') return {...BASE_PROGRAM, tiersOn: true, tiers: CONFIGURED_TIERS};
  if (state === 'empty') return {...BASE_PROGRAM, tiersOn: true, tiers: []};
  if (state === 'overflow') return {...BASE_PROGRAM, tiersOn: true, tiers: OVERFLOW_TIERS};
  if (state === 'worst') return {...BASE_PROGRAM, tiersOn: true, tiers: WORST_TIERS};
  return {...BASE_PROGRAM};
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
