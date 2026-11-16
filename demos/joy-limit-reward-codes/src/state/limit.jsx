// The saved "Limit Joy reward codes per order" setting, shared by Settings and the checkout preview.
// Lives in memory until reload; the reviewer's screen state picks the starting values.
import React, {createContext, useContext, useMemo, useState, useEffect} from 'react';
import {useScenario} from '../kit/scenario.jsx';
import {DEFAULT_MESSAGE} from '../data/codes.js';

const LONG_MESSAGE = '{code} can’t be used with the reward code that is already in your cart. Only {max} reward code(s) can be used per order. Remove one, then try again.';

export function initialLimit(state) {
  const on = !['default', 'empty-prefix', 'limit-error'].includes(state);
  const long = state === 'overflow' || state === 'worst';
  return {enabled: on, max: '1', message: long ? LONG_MESSAGE : DEFAULT_MESSAGE, excluded: [], prefix: 'NB-'};
}

const LimitContext = createContext({saved: initialLimit('default'), save: () => {}});

export function LimitProvider({children}) {
  const {state} = useScenario();
  const [saved, setSaved] = useState(() => initialLimit(state));
  useEffect(() => setSaved(initialLimit(state)), [state]);
  const value = useMemo(() => ({saved, save: (next) => setSaved((s) => ({...s, ...next}))}), [saved]);
  return <LimitContext.Provider value={value}>{children}</LimitContext.Provider>;
}

export const useLimit = () => useContext(LimitContext);
