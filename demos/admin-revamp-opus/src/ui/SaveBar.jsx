// Draft + save bar shared by every edit screen. A form edits a draft; the app title bar turns into
// Polaris 2's contextual save bar ("Unsaved changes · Discard · Save") while the draft differs from the store,
// and leaving the page asks first. One pattern for every module, so Save always behaves the same.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Button, InlineStack, Modal, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';

const SaveBarContext = createContext({active: null, register: () => () => {}});

export function SaveBarProvider({children}) {
  const [active, setActive] = useState(null);
  const [pending, setPending] = useState(null);
  const ref = useRef(null);
  ref.current = active;

  const register = useCallback(entry => {
    setActive(entry);
    return () => setActive(current => (current?.id === entry.id ? null : current));
  }, []);

  // Leaving with unsaved changes: the router asks first (cancelable 'prototype:before-navigate').
  useEffect(() => {
    const onNavigate = event => {
      if (!ref.current?.dirty) return;
      event.preventDefault();
      setPending(() => event.detail.proceed);
    };
    window.addEventListener('prototype:before-navigate', onNavigate);
    const onUnload = event => {
      if (ref.current?.dirty) {event.preventDefault(); event.returnValue = '';}
    };
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('prototype:before-navigate', onNavigate);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  const value = useMemo(() => ({active, register}), [active, register]);
  return (
    <SaveBarContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title="Leave without saving?"
        primaryAction={{content: 'Leave page', destructive: true, onAction: () => {
          const go = pending;
          ref.current?.discard();
          setPending(null);
          window.setTimeout(() => go?.(), 0);
        }}}
        secondaryActions={[{content: 'Keep editing', onAction: () => setPending(null)}]}
      >
        <Modal.Section><Text as="p">Your changes on this page will be lost.</Text></Modal.Section>
      </Modal>
    </SaveBarContext.Provider>
  );
}

/** True while the current form has unsaved changes. */
export const useUnsaved = () => Boolean(useContext(SaveBarContext).active?.dirty);

/** Rendered by the admin title bar: shows Discard / Save while the current form has changes. */
export function SaveBarSlot() {
  const {active} = useContext(SaveBarContext);
  if (!active?.dirty) return null;
  return (
    <div className="rv-savebar" role="region" aria-label="Unsaved changes">
      <Text as="span" variant="bodySm" fontWeight="medium">Unsaved changes</Text>
      <InlineStack gap="200" wrap={false}>
        <Button size="slim" onClick={active.discard}>Discard</Button>
        <Button size="slim" variant="primary" onClick={active.save} disabled={Boolean(active.error)}>Save</Button>
      </InlineStack>
    </div>
  );
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * const {draft, set, field, dirty, save, discard, errors} = useDraft(source, {onSave, validate, message})
 * - set('name', 'VIP') or set(d => ({...d, name: 'VIP'}))
 * - field('name') → {value, onChange, error} to spread on a Polaris TextField/Select
 * - validate(draft) → {name: 'Enter a name'}; Save stays off while errors exist
 */
export function useDraft(source, {onSave, validate, message = 'Saved', locked = false} = {}) {
  const {notify} = useShell();
  const {register} = useContext(SaveBarContext);
  const [draft, setDraft] = useState(source);
  const [touched, setTouched] = useState(false);
  const base = useRef(source);
  const id = useRef(`draft-${Math.random().toString(36).slice(2)}`);
  // Screens pass onSave inline; keep it in a ref so `save` stays stable and registering doesn't loop.
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // When the stored record changes underneath (another screen saved, or reset), follow it if not editing.
  useEffect(() => {
    if (!same(source, base.current)) {
      base.current = source;
      if (!touched) setDraft(source);
    }
  }, [source, touched]);

  const errors = useMemo(() => (validate ? validate(draft) ?? {} : {}), [draft, validate]);
  const firstError = Object.values(errors).find(Boolean) ?? null;
  const dirty = !locked && !same(draft, base.current);

  const set = useCallback((key, value) => {
    setTouched(true);
    setDraft(current => (typeof key === 'function' ? key(current) : {...current, [key]: value}));
  }, []);
  const discard = useCallback(() => {setDraft(base.current); setTouched(false);}, []);
  const save = useCallback(() => {
    if (firstError) {notify(firstError, {error: true}); return false;}
    onSaveRef.current?.(draft);
    base.current = draft;
    setTouched(false);
    notify(message);
    return true;
  }, [draft, firstError, message, notify]);

  useEffect(() => register({id: id.current, dirty, save, discard, error: firstError}), [register, dirty, save, discard, firstError]);

  const field = useCallback((key, {number = false} = {}) => ({
    value: draft?.[key] == null ? '' : String(draft[key]),
    onChange: value => set(key, number ? (value === '' ? '' : Number(value)) : value),
    error: touched || dirty ? errors[key] : undefined,
  }), [draft, set, errors, touched, dirty]);

  return {draft, set, field, dirty, save, discard, errors};
}
