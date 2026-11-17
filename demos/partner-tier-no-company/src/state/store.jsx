// In-memory data of the fictional shop: what the three screens read and change. Lives until reload.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

/** Joy's default partner tiers (defaultTiersB2B): Standard at $0, Premium at $200, Elite at $500 spent. */
export const DEFAULT_TIERS = [
  {id: 't1', name: 'Standard Partner', target: 0, standard: true},
  {id: 't2', name: 'Premium Partner', target: 200},
  {id: 't3', name: 'Elite Partner', target: 500},
];

/**
 * Settings › General › Membership enrollment as saved, per plan shop (useShop().planKey): Auto-enroll, and
 * "Exclude B2B customers" ticked on the Advanced shop and on the Essential shop that ticked it before the release.
 */
export const defaultEnrollment = (planKey) => ({mode: 'auto_enroll', excludeB2B: planKey !== 'essential'});

const StoreContext = createContext(null);

/** shopKey: switching companies in the Prototype panel starts that shop's Partner tier program from scratch. */
export function StoreProvider({shopKey, children}) {
  const [partnerActive, setPartnerActive] = useState(false);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [enrollments, setEnrollments] = useState({});
  useEffect(() => {
    setPartnerActive(false);
    setTiers(DEFAULT_TIERS);
  }, [shopKey]);
  const enrollmentFor = useCallback((planKey) => enrollments[planKey] ?? defaultEnrollment(planKey), [enrollments]);
  const saveEnrollment = useCallback((planKey, next) => setEnrollments((all) => ({...all, [planKey]: next})), []);
  const value = useMemo(
    () => ({partnerActive, setPartnerActive, tiers, setTiers, enrollmentFor, saveEnrollment}),
    [partnerActive, tiers, enrollmentFor, saveEnrollment]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
