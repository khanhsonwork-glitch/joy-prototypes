// Live program state shared by every screen (Program, overview, simulator, Home): editing a rate or a threshold,
// pausing the program or picking a preset changes all of them at once (review r1 #6–#9).
import React, {createContext, useContext, useMemo, useState} from 'react';
import {BASE_RATE, PROGRAM, TIERS} from '../data/program.js';

const ProgramContext = createContext(null);

const PRESET_POINTS = {3: 3, 5: 5, 8: 8}; // rewards rate % → Member points per $1 (100 points = $1)

export function ProgramProvider({children}) {
  const [tiers, setTiers] = useState(TIERS);
  const [base, setBase] = useState(BASE_RATE);
  const [rule, setRule] = useState('money'); // one level-up rule for the whole program: money | points | orders
  const [status, setStatus] = useState(PROGRAM.status);
  const [preset, setPreset] = useState(5);
  const [saved, setSaved] = useState(null);

  const value = useMemo(() => {
    const snapshot = JSON.stringify({tiers, base, rule});
    return {
      tiers, base, rule, status, preset,
      dirty: saved !== null && saved !== snapshot,
      setPreset,
      updateTier: (id, patch) => {
        if (saved === null) setSaved(snapshot);
        setTiers(list => list.map(t => (t.id === id ? {...t, ...patch} : t)));
      },
      setBase: next => {
        if (saved === null) setSaved(snapshot);
        setBase(next);
      },
      setRule: next => {
        if (saved === null) setSaved(snapshot);
        setRule(next);
      },
      save: () => setSaved(null),
      togglePause: () => setStatus(s => (s === 'live' ? 'paused' : 'live')),
      createFromPreset: rate => {
        setBase({points: PRESET_POINTS[rate] ?? 5, per: 1});
        setSaved(null);
      },
    };
  }, [tiers, base, rule, status, preset, saved]);
  return <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>;
}

export const useProgram = () => useContext(ProgramContext);
