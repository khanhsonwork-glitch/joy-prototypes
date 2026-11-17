// In-memory data of the fictional shop, per shop state: what the three screens read and change. Lives until reload.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

/** Joy's default partner tiers (defaultTiersB2B): Standard at $0, Premium at $200, Elite at $500 spent. */
export const DEFAULT_TIERS = [
  {id: 't1', name: 'Standard Partner', target: 0, standard: true},
  {id: 't2', name: 'Premium Partner', target: 200},
  {id: 't3', name: 'Elite Partner', target: 500},
];

/** Settings › General › Membership enrollment: the merchant picked Auto-enroll and ticked Exclude B2B customers. */
export const DEFAULT_ENROLLMENT = {mode: 'auto_enroll', excludeB2B: true};

const StoreContext = createContext(null);

/** shopKey: switching shop in the Prototype panel starts that shop from its own saved data (launch, tiers, settings). */
export function StoreProvider({shopKey, children}) {
  const [partnerActive, setPartnerActive] = useState(false);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [enrollment, setEnrollment] = useState(DEFAULT_ENROLLMENT);
  useEffect(() => {
    setPartnerActive(false);
    setTiers(DEFAULT_TIERS);
    setEnrollment(DEFAULT_ENROLLMENT);
  }, [shopKey]);
  const saveEnrollment = useCallback((next) => setEnrollment(next), []);
  const value = useMemo(
    () => ({partnerActive, setPartnerActive, tiers, setTiers, enrollment, saveEnrollment}),
    [partnerActive, tiers, enrollment, saveEnrollment]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
