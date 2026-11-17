// What the merchant saved on the edit pages, kept in memory until reload. App.jsx keys the provider by the
// shop state, so each shop (Free new, Free old, Essential) starts from its own saved programs.
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';

export const INITIAL = {
  placeOrder: {title: 'Place an order', dateRange: 'static', start: '2026-11-20', who: 'all', typeEarn: 'point', earnBy: 'price', value: '1', every: '1'},
  signUp: {title: 'Sign Up', start: '2026-11-20', typeEarn: 'point', value: '100'},
  newsletter: {title: 'Sign up for newsletter', start: '2026-11-20', typeEarn: 'point', value: '50'},
  referrer: {method: 'fixed_amount', value: '10'},
  friend: {method: 'percentage', value: '10'},
};

const LONG = 'Place an order and earn double points on the Glow Getter Set, the Overnight Glow Mask and every refill';

const StoreContext = createContext({data: INITIAL, save: () => {}});

export function StoreProvider({long = false, children}) {
  const [data, setData] = useState(() => (long ? {...INITIAL, placeOrder: {...INITIAL.placeOrder, title: LONG, value: '98765'}} : INITIAL));
  const save = useCallback((key, value) => setData((d) => ({...d, [key]: value})), []);
  const value = useMemo(() => ({data, save}), [data, save]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** {data, save(key, value)} */
export const useStore = () => useContext(StoreContext);
