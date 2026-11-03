// Reviewer settings that are not product UI: which shop is looking, whether Black Friday is still running,
// and whether the shop is offered annual billing. They live in the URL search (?shop=…&campaign=…&annual=1)
// so a link opens on exactly the case being reviewed, and they survive moving between screens.
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {CAMPAIGN, SHOPS} from '../data/plans.js';

const read = () => {
  const q = new URLSearchParams(window.location.search);
  const shop = SHOPS.some((s) => s.value === q.get('shop')) ? q.get('shop') : 'starter';
  const campaign = CAMPAIGN.some((c) => c.value === q.get('campaign')) ? q.get('campaign') : 'running';
  return {shop, campaign, annual: q.get('annual') === '1'};
};

const ProtoContext = createContext({shop: 'starter', campaign: 'running', annual: false, set: () => {}});

export function ProtoProvider({children}) {
  const [value, setValue] = useState(read);
  const set = useCallback((patch) => {
    setValue((prev) => {
      const next = {...prev, ...patch};
      const q = new URLSearchParams(window.location.search);
      q.delete('shop');
      q.delete('campaign');
      q.delete('annual');
      if (next.shop !== 'starter') q.set('shop', next.shop);
      if (next.campaign !== 'running') q.set('campaign', next.campaign);
      if (next.annual) q.set('annual', '1');
      const search = q.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`);
      return next;
    });
  }, []);
  const ctx = useMemo(() => ({...value, set}), [value, set]);
  return <ProtoContext.Provider value={ctx}>{children}</ProtoContext.Provider>;
}

export const useProto = () => useContext(ProtoContext);
