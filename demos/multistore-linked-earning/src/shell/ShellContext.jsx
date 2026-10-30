import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {Toast} from '@shopify/polaris';

const ShellContext = createContext({notify: () => {}, notYet: () => {}});

/** Must render inside Polaris <Frame>: Toast needs the Frame. */
export function ShellProvider({children}) {
  const [toast, setToast] = useState(null);

  /** notify('Giveaway saved') or notify('Something failed', {error: true}) */
  const notify = useCallback((content, {error = false, duration = 3000} = {}) => {
    setToast({content, error, duration, key: `${Date.now()}-${Math.random()}`});
  }, []);
  const notYet = useCallback(() => notify('Open this page from your Shopify admin.'), [notify]);

  const value = useMemo(() => ({notify, notYet}), [notify, notYet]);
  return (
    <ShellContext.Provider value={value}>
      {children}
      {toast ? <Toast key={toast.key} content={toast.content} error={toast.error} duration={toast.duration} onDismiss={() => setToast(null)} /> : null}
    </ShellContext.Provider>
  );
}

export const useShell = () => useContext(ShellContext);
