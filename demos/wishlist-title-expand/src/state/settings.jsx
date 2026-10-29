// The Wishlist extension settings the admin screen saves and the storefront view reads.
// Lives in memory until reload, like every prototype. Shops that never open the setting keep 'one-line'.
import React, {createContext, useContext, useMemo, useState} from 'react';

export const DEFAULT_SETTINGS = {layout: 'list', rowStyle: 'one-line'};

const SettingsContext = createContext({settings: DEFAULT_SETTINGS, save: () => {}});

export function SettingsProvider({children}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const value = useMemo(() => ({settings, save: (next) => setSettings({...next})}), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
