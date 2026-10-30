// One in-memory store for both screens: the Developer Zone switch and the Shop Management table read the same values,
// so turning the switch on in Developer Zone changes Shop Management straight away.
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {useScenario} from '../kit/scenario.jsx';
import {MAIN_SHOP, SUB_SHOP} from '../data/index.js';

function seed(state) {
  return {
    multiShop: true,
    linkedEarn: state !== 'today',
    rates: state === 'rate-missing' || state === 'today' ? {} : {[SUB_SHOP.id]: '18.00'},
  };
}

const MultiShopContext = createContext(null);

export function MultiShopProvider({children}) {
  const {state} = useScenario();
  const [value, setValue] = useState(() => seed(state));
  // A new review state starts from its own data, like opening the link fresh.
  useEffect(() => setValue(seed(state)), [state]);

  const api = useMemo(
    () => ({
      ...value,
      shops: [MAIN_SHOP, SUB_SHOP],
      setMultiShop: (on) => setValue((v) => ({...v, multiShop: on})),
      setLinkedEarn: (on) => setValue((v) => ({...v, linkedEarn: on})),
      setRate: (shopId, rate) => setValue((v) => ({...v, rates: {...v.rates, [shopId]: rate}})),
    }),
    [value]
  );
  return <MultiShopContext.Provider value={api}>{children}</MultiShopContext.Provider>;
}

export const useMultiShop = () => useContext(MultiShopContext);

/** "1,800.00" style amounts for the live help text. */
export function money(symbol, amount) {
  return `${symbol}${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

/** Returns an error string or '' for a typed rate. */
export function rateError(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return 'Enter a rate';
  if (!/^\d*\.?\d+$/.test(text) || Number(text) <= 0) return 'Enter a number greater than 0';
  if ((text.split('.')[1] || '').length > 4) return 'Use up to 4 decimal places';
  return '';
}
