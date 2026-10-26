// In-memory data for the prototype: starts from the sample set of the current screen state,
// keeps creates/edits/deletes until the page reloads or the state changes. No backend, no storage.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {OVERFLOW_REWARDS, REWARDS, WORST_REWARDS} from '../data/index.js';
import {useScenario} from '../kit/scenario.jsx';

const seedFor = (state) => (state === 'empty' ? [] : state === 'overflow' ? OVERFLOW_REWARDS : state === 'worst' ? WORST_REWARDS : REWARDS);
const RewardsContext = createContext(null);

export function RewardsProvider({children}) {
  const {state} = useScenario();
  const [rewards, setRewards] = useState(() => seedFor(state));
  useEffect(() => setRewards(seedFor(state)), [state]);

  const save = useCallback((reward) => {
    const today = new Date().toISOString().slice(0, 10);
    const id = reward.id || `n${Date.now()}`;
    setRewards((list) => (list.some((r) => r.id === id)
      ? list.map((r) => (r.id === id ? {...r, ...reward, updated: today} : r))
      : [{...reward, id, redemptions: 0, activity: [], updated: today}, ...list]));
    return id;
  }, []);
  const remove = useCallback((id) => setRewards((list) => list.filter((r) => r.id !== id)), []);

  const value = useMemo(() => ({rewards, save, remove, find: (id) => rewards.find((r) => r.id === id)}), [rewards, save, remove]);
  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>;
}

/** {rewards, find(id), save(reward) → id, remove(id)} */
export const useRewards = () => useContext(RewardsContext);
