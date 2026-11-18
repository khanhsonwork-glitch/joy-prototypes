// Joy › Integrations › Klaviyo (pages/Integration/Details/Klaviyo.js + components/IntegrationDetail/DetailPageLayout.js on avada/master).
// Only change: three store credit options in the "Step 3: Set up automation triggers" modal (WcChoiceList allowMultiple),
// unticked by default. Kept minimal on purpose: the shared admin frame gets re-skinned separately.
import React, {useEffect, useRef, useState} from 'react';
import {Badge, BlockStack, Box, Button, Card, InlineStack, Layout, Link, List, Modal, Page, SkeletonBodyText, Text} from '@shopify/polaris';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView} from '../kit/StateView.jsx';
import {DEFAULT_SELECTED, KLAVIYO_TRIGGERS} from '../data/klaviyoTriggers.js';

function TriggerChoice({choice, checked, onChange}) {
  const id = `trigger-${choice.value}`;
  return (
    <li className={`scl-choice${choice.isNew ? ' scl-choice--new' : ''}`} data-trigger={choice.value}>
      <input id={id} type="checkbox" className="scl-choice__box" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={`${id}-help`} />
      <label htmlFor={id} className="scl-choice__label">
        <span>{choice.name}</span>
        {choice.isNew ? <span className="scl-new-tag">New</span> : null}
      </label>
      <p id={`${id}-help`} className="scl-choice__help">{choice.help}</p>
    </li>
  );
}

export function KlaviyoPage() {
  const {state} = useScenario();
  const {query} = useRoute();
  const navigate = useNavigate();
  const {notify} = useShell();
  const connected = state !== 'disabled';
  const [saved, setSaved] = useState(state === 'empty' ? [] : DEFAULT_SELECTED);
  const [draft, setDraft] = useState(saved);
  const wantOpen = query.get('triggers') === 'open';
  const [open, setOpen] = useState(wantOpen);
  const [saving, setSaving] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {setSaved(state === 'empty' ? [] : DEFAULT_SELECTED);}, [state]);
  useEffect(() => {setOpen(wantOpen);}, [wantOpen]);
  // Deep link opens the modal scrolled to the new store credit options.
  useEffect(() => {
    if (!open) return undefined;
    setDraft(saved);
    const t = setTimeout(() => {
      document.querySelector('[data-trigger="store_credit_issued"]')?.scrollIntoView({block: 'center'});
    }, 250);
    return () => clearTimeout(t);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false);
    if (wantOpen) navigate('/integrations/klaviyo' + (state !== 'default' ? `?state=${state}` : ''));
  };
  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (state === 'worst') {notify('Couldn’t save triggers. Try again.', {error: true}); return;}
      setSaved(draft);
      close();
      notify('Triggers saved');
    }, 500);
  };
  const toggle = (value, on) => setDraft((d) => (on ? [...d, value] : d.filter((v) => v !== value)));
  const selected = KLAVIYO_TRIGGERS.filter((t) => saved.includes(t.value));
  const loading = state === 'loading';

  return (
    <div className="scl-admin">
      <Page
        backAction={{content: 'Integrations', onAction: () => notify('Integrations list is unchanged in this feature')}}
        title="Klaviyo"
        titleMetadata={connected ? <Badge tone="success">Connected</Badge> : <Badge>Not connected</Badge>}
      >
        {state === 'error' ? (
          <Card><ErrorView title="Couldn’t load the Klaviyo settings" onRetry={() => notify('Trying again…')}>Your triggers are still saved. Reload to try again.</ErrorView></Card>
        ) : (
          <Layout>
            <Layout.Section>
              <BlockStack gap="400">
                <Card>
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingSm">Introduction</Text>
                    <List type="bullet">
                      <List.Item>Klaviyo is an Email & SMS marketing platform with intuitive segmentation tool.</List.Item>
                      <List.Item>This integration allows you to sync all member information with Klaviyo account</List.Item>
                      <List.Item>Segment contacts to send campaigns based on reward program information</List.Item>
                      <List.Item>Include reward program data in your email templates</List.Item>
                    </List>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingSm">Step 1: Connect to Klaviyo API</Text>
                    {loading ? <SkeletonBodyText lines={2} /> : (
                      <>
                        <Text as="p">{connected ? 'Disconnect to stop the integration between two apps' : 'Click to connect, then review the information and allow the integration between two apps'}</Text>
                        <Box><Button onClick={() => notify(connected ? 'Disconnect is unchanged in this feature' : 'Connect is unchanged in this feature')}>{connected ? 'Disconnect' : 'Connect'}</Button></Box>
                      </>
                    )}
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h2" variant="headingSm">Step 2: Sync data</Text>
                      {connected && !loading ? <Badge tone="success">99% Synced</Badge> : null}
                    </InlineStack>
                    {loading ? <SkeletonBodyText lines={3} /> : connected ? (
                      <>
                        <Text as="p" fontWeight="semibold">Synced 4,862/4,903 customers</Text>
                        <Text as="p">The following properties are auto-synced to Klaviyo</Text>
                        <List type="bullet">
                          <List.Item>Customer birthday</List.Item>
                          <List.Item>Loyalty points</List.Item>
                          <List.Item>Referral URLs</List.Item>
                          <List.Item>Vip tier</List.Item>
                          <List.Item>Joy membership</List.Item>
                        </List>
                        <Box><Button onClick={() => notify('Sync is unchanged in this feature')}>Sync again</Button></Box>
                      </>
                    ) : <Text as="p">You need to connect Klaviyo successfully in step 1 first.</Text>}
                  </BlockStack>
                </Card>
                {connected ? (
                  <Card>
                    <BlockStack gap="300">
                      <Text as="h2" variant="headingSm">Step 3: Set up automation triggers</Text>
                      <Text as="p">Select which events you want to trigger in Klaviyo. These events will be used to create automation workflows in Klaviyo.</Text>
                      {!loading && selected.length ? (
                        <BlockStack gap="100">
                          <Text as="h3" variant="headingSm">Selected triggers:</Text>
                          <List type="bullet">{selected.map((t) => <List.Item key={t.value}>{t.name}</List.Item>)}</List>
                        </BlockStack>
                      ) : null}
                      <Box><Button disabled={loading} onClick={() => navigate('/integrations/klaviyo?triggers=open' + (state !== 'default' ? `&state=${state}` : ''))}>Select triggers</Button></Box>
                    </BlockStack>
                  </Card>
                ) : (
                  <div className="scl-disabled-note"><Text as="p" tone="subdued">Step 3: Set up automation triggers appears after Klaviyo is connected (prototype state: Disabled).</Text></div>
                )}
              </BlockStack>
            </Layout.Section>
            <Layout.Section variant="oneThird">
              <BlockStack gap="400">
                <Button variant="primary" fullWidth onClick={() => notify('Opens klaviyo.com in a new tab')}>Go to App</Button>
                <Card>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingSm">Guide</Text>
                      <List type="bullet">
                        <List.Item><Link onClick={() => notify('Opens the help center')}>Integrate Joy with Klaviyo</Link></List.Item>
                        <List.Item><Link onClick={() => notify('Opens the help center')}>How to add customer&apos;s reward information to emails</Link></List.Item>
                      </List>
                    </BlockStack>
                    <BlockStack gap="200">
                      <Text as="h2" variant="headingSm">Category</Text>
                      <InlineStack><Badge>Email Marketing</Badge></InlineStack>
                    </BlockStack>
                  </BlockStack>
                </Card>
              </BlockStack>
            </Layout.Section>
          </Layout>
        )}
      </Page>
      <Modal
        open={open}
        onClose={close}
        title="Step 3: Set up automation triggers"
        primaryAction={{content: 'Confirm', onAction: save, loading: saving}}
        secondaryActions={[{content: 'Cancel', onAction: close}]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">Select which events you want to trigger in Klaviyo. These events will be used to create automation workflows in Klaviyo.</Text>
            <fieldset className="scl-choices">
              <legend className="scl-visually-hidden">Step 3: Set up automation triggers</legend>
              <ul ref={listRef}>
                {KLAVIYO_TRIGGERS.map((t) => <TriggerChoice key={t.value} choice={t} checked={draft.includes(t.value)} onChange={(on) => toggle(t.value, on)} />)}
              </ul>
            </fieldset>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
}
