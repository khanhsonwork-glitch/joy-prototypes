// Store credit at checkout: settings that live inside the existing Quick Redeem card
// (On-site content › Checkout page). No separate settings page — see PRD §I.
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {useScenario} from '../kit/scenario.jsx';

const OnsiteContext = createContext(null);

const INITIAL = {
  enabled: false,
  cap: '',
};

export function OnsiteProvider({children}) {
  const {state} = useScenario();
  const [settings, setSettings] = useState(() => (state === 'enabled' || state === 'worst' ? {enabled: true, cap: '50'} : INITIAL));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showPlusRecommendation, setShowPlusRecommendation] = useState(false);

  // Shop context the card reads, same shape the real admin derives from `shop` + billing state.
  const shopIsPlus = state !== 'disabled';
  const hasWritePermission = state !== 'no-permission';
  const forcedCap = state === 'overflow' || state === 'worst' ? '999999999.99' : null;

  const toggle = useCallback((next) => {
    if (!shopIsPlus || !hasWritePermission) return;
    if (state === 'error') {
      setSaving(true);
      setSaveError(false);
      setTimeout(() => {
        setSaving(false);
        setSaveError(true);
      }, 600);
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSettings((s) => ({...s, enabled: next}));
      if (next) setShowPlusRecommendation(true);
    }, 500);
  }, [shopIsPlus, hasWritePermission, state]);

  const setCap = useCallback((value) => {
    setSettings((s) => ({...s, cap: value}));
  }, []);

  const value = useMemo(() => ({
    settings: {...settings, cap: forcedCap ?? settings.cap},
    saving,
    saveError,
    shopIsPlus,
    hasWritePermission,
    showPlusRecommendation,
    dismissPlusRecommendation: () => setShowPlusRecommendation(false),
    toggle,
    setCap,
    worst: state === 'worst',
  }), [settings, saving, saveError, shopIsPlus, hasWritePermission, showPlusRecommendation, toggle, setCap, forcedCap, state]);

  return <OnsiteContext.Provider value={value}>{children}</OnsiteContext.Provider>;
}

export const useOnsite = () => useContext(OnsiteContext);
