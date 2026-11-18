import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Toast} from '@shopify/polaris';

const ShellContext = createContext({notify: () => {}, notYet: () => {}, saveBar: null, setSaveBar: () => {}});

/** Must render inside Polaris <Frame>: Toast needs the Frame. */
export function ShellProvider({children}) {
  const [toast, setToast] = useState(null);
  // The admin's contextual save bar (Unsaved changes · Discard · Save), drawn by AdminChrome over the title bar.
  const [saveBar, setSaveBar] = useState(null);

  /** notify('Giveaway saved') or notify('Something failed', {error: true}) */
  const notify = useCallback((content, {error = false, duration = 3000} = {}) => {
    setToast({content, error, duration, key: `${Date.now()}-${Math.random()}`});
  }, []);
  const notYet = useCallback(() => notify('Open this page from your Shopify admin.'), [notify]);

  const value = useMemo(() => ({notify, notYet, saveBar, setSaveBar}), [notify, notYet, saveBar]);
  return (
    <ShellContext.Provider value={value}>
      {children}
      {toast ? <Toast key={toast.key} content={toast.content} error={toast.error} duration={toast.duration} onDismiss={() => setToast(null)} /> : null}
    </ShellContext.Provider>
  );
}

export const useShell = () => useContext(ShellContext);

/**
 * Show the save bar while `dirty`. Handlers are read through a ref so a re-render never re-registers the bar
 * (which would re-render the page and loop).
 */
export function useSaveBar({dirty, saving = false, disabled = false, onSave, onDiscard}) {
  const {setSaveBar} = useShell();
  const handlers = useRef({onSave, onDiscard});
  handlers.current = {onSave, onDiscard};
  useEffect(() => {
    setSaveBar(dirty ? {saving, disabled, onSave: () => handlers.current.onSave(), onDiscard: () => handlers.current.onDiscard()} : null);
  }, [dirty, saving, disabled, setSaveBar]);
  useEffect(() => () => setSaveBar(null), [setSaveBar]);
}
