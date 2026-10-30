// The Wishlist extension settings the admin screen saves and the storefront view reads.
// Saved in this browser only, so Save → reload → storefront can be checked. Shops that never save keep 'one-line'.
import React, {createContext, useContext, useMemo, useState} from 'react';

export const DEFAULT_SETTINGS = {layout: 'list', rowStyle: 'one-line'};
const KEY = 'joy-proto.wishlist-title-expand.settings';

function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    if (saved && ['carousel', 'grid', 'list'].includes(saved.layout) && ['one-line', 'two-lines'].includes(saved.rowStyle)) return saved;
  } catch {
    /* storage blocked or corrupt: fall back to the default */
  }
  return DEFAULT_SETTINGS;
}

const SettingsContext = createContext({settings: DEFAULT_SETTINGS, save: () => {}});

export function SettingsProvider({children}) {
  const [settings, setSettings] = useState(load);
  const value = useMemo(
    () => ({
      settings,
      save: (next) => {
        setSettings({...next});
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* storage blocked: the choice still holds until reload */
        }
      },
    }),
    [settings],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
