// What every edit page here shares: form state from the in-memory store, validation on Save with focus on the
// first wrong field, the loading/error bodies, and the unsaved-changes prompt Joy shows when leaving a page.
import React, {useEffect, useState} from 'react';
import {Badge, Banner, Layout, Modal, Page, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useStore} from '../state/store.jsx';

export function useEditForm(key, validate) {
  const {data, save} = useStore();
  const {notify} = useShell();
  const saved = data[key];
  const [form, setForm] = useState(saved);
  const [touched, setTouched] = useState(false);
  const [focusError, setFocusError] = useState(0);
  useEffect(() => setForm(saved), [saved]);
  useEffect(() => {
    if (focusError) document.querySelector('.Polaris-Page [aria-invalid="true"]')?.focus();
  }, [focusError]);
  const errors = validate(form);
  const count = Object.keys(errors).length;
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (field) => (value) => setForm((f) => ({...f, [field]: value}));
  const show = (field) => (touched ? errors[field] : undefined);
  const onSave = () => {
    setTouched(true);
    if (count) {
      notify(`${count} ${count === 1 ? 'field needs' : 'fields need'} attention`, {error: true});
      setFocusError((n) => n + 1);
      return;
    }
    save(key, form);
    setTouched(false);
    notify('Saved program successfully');
  };
  return {form, setForm, set, show, dirty, count, touched, onSave};
}

/** Joy asks before leaving a page with unsaved edits (same words as the app's leave prompt). */
function useLeaveGuard(dirty) {
  const [pending, setPending] = useState(null);
  useEffect(() => {
    if (!dirty) return undefined;
    const onBefore = (event) => {
      event.preventDefault();
      setPending(() => event.detail.proceed);
    };
    window.addEventListener('prototype:before-navigate', onBefore);
    return () => window.removeEventListener('prototype:before-navigate', onBefore);
  }, [dirty]);
  return (
    <Modal
      open={Boolean(pending)}
      onClose={() => setPending(null)}
      title="Discard all unsaved changes"
      primaryAction={{content: 'Leave page', destructive: true, onAction: () => {const go = pending; setPending(null); go?.();}}}
      secondaryActions={[{content: 'Cancel', onAction: () => setPending(null)}]}
    >
      <Modal.Section>
        <Text as="p">If you discard changes, you'll delete any edits made since your last save.</Text>
      </Modal.Section>
    </Modal>
  );
}

/** Page shell of an edit screen: back to the tab, title with status, one primary Save, screen states. */
export function EditFrame({title, backUrl, backLabel, status, editor, what, children}) {
  const {state, setState} = useScenario();
  const guard = useLeaveGuard(editor.dirty);
  const page = {
    backAction: {content: backLabel, url: backUrl},
    title,
    titleMetadata: status ? <Badge tone={status === 'active' ? 'success' : undefined}>{status === 'active' ? 'Active' : 'Inactive'}</Badge> : undefined,
    primaryAction: {content: 'Save', onAction: editor.onSave, disabled: !editor.dirty || state === 'loading' || state === 'error'},
  };
  if (state === 'loading') return <Page {...page}><LoadingView rows={8} /></Page>;
  if (state === 'error') {
    return (
      <Page {...page}>
        <ErrorView title={`Couldn't load ${what}`} onRetry={() => setState('free-new')}>Nothing was changed. The program keeps running while this page reloads.</ErrorView>
      </Page>
    );
  }
  return (
    <Page {...page}>
      <Layout>
        {editor.touched && editor.count ? (
          <Layout.Section><Banner tone="critical" title={`${editor.count} ${editor.count === 1 ? 'field needs' : 'fields need'} attention before you save`} /></Layout.Section>
        ) : null}
        <Layout.Section>{children}</Layout.Section>
      </Layout>
      {guard}
    </Page>
  );
}

export const positive = (v, message = 'Number needs to be greater than 0') => (Number(v) > 0 ? undefined : message);
