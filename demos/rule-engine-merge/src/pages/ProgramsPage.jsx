// Reward programs › Earning programs. No "Upgrade to Rule engine" entry anymore; the plan decides what can be added.
import React, {useState} from 'react';
import {Badge, Banner, BlockStack, Box, Button, Card, Divider, InlineStack, Modal, Page, ResourceItem, ResourceList, Tabs, Text} from '@shopify/polaris';
import {EditIcon} from '@shopify/polaris-icons';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {hasPlan, useProto} from '../state/proto.jsx';
import {LockTag, useUpgrade} from './shared.jsx';

const PROGRAM_TABS = ['Earning programs', 'Redeeming programs', 'Referrals', 'Milestones', 'Point expiration', 'Subscription and Membership'];

const ADDABLE = [
  {event: 'place_order', title: 'Place an order'},
  {event: 'sign_up', title: 'Sign up'},
  {event: 'birthday', title: 'Celebrate a birthday', needs: 'essential', single: true},
  {event: 'review', title: 'Write a review', needs: 'essential', single: true},
  {event: 'social', title: 'Follow on social', single: true},
];

const LONG = 'Double points every weekend on all skincare sets and travel minis for Gold and Platinum members';

export const editUrl = (p) => (p.event === 'place_order' ? `/demo/place-order/${p.id}` : p.event === 'birthday' ? '/demo/birthday' : null);

export function ProgramsPage() {
  const {state, setState} = useScenario();
  const {notify, notYet} = useShell();
  const navigate = useNavigate();
  const upgrade = useUpgrade();
  const {plan, oldVersion, programs, placeOrders, addProgram} = useProto();
  const [adding, setAdding] = useState(false);
  const [onlyOff, setOnlyOff] = useState(false);
  const belowAdvanced = !hasPlan(plan, 'advanced');
  const offByPlan = programs.filter((p) => p.offByPlan);
  const noPermission = state === 'disabled';

  let rows = state === 'empty' ? [] : programs;
  if (state === 'overflow' || state === 'worst') rows = rows.map((p, i) => (i === 0 ? {...p, title: LONG} : p));
  if (onlyOff) rows = rows.filter((p) => p.offByPlan);

  const page = {
    title: 'Reward programs',
    primaryAction: oldVersion ? undefined : {content: 'Add program', onAction: () => setAdding(true), disabled: noPermission || state === 'loading' || state === 'error'},
  };
  const tabs = <Tabs tabs={PROGRAM_TABS.map((t, i) => ({id: `t${i}`, content: t}))} selected={0} onSelect={(i) => (i ? notYet() : null)} />;

  if (state === 'loading') return <Page {...page}><Card padding="0">{tabs}<LoadingView rows={6} /></Card></Page>;
  if (state === 'error') return <Page {...page}><Card padding="0">{tabs}<ErrorView title="Couldn't load your programs" onRetry={() => setState('default')}>Your programs keep running. Nothing was changed.</ErrorView></Card></Page>;

  const pick = (item) => {
    const isPlaceOrder = item.event === 'place_order';
    const lock = lockFor(item);
    if (lock) {
      setAdding(false);
      return upgrade(lock);
    }
    if (item.single && programs.some((p) => p.event === item.event)) {
      setAdding(false);
      return item.event === 'birthday' ? navigate('/demo/birthday') : notYet();
    }
    setAdding(false);
    if (isPlaceOrder) {
      const id = `po${Date.now()}`;
      addProgram({id, event: 'place_order', title: 'Place an order', summary: 'Earn 1 point for every $1 spent', on: false, priority: placeOrders.length + 1});
      notify('Program created');
      return navigate(`/demo/place-order/${id}`);
    }
    return notYet();
  };
  const lockFor = (item) => {
    if (item.needs && !hasPlan(plan, item.needs)) return item.needs;
    if (item.event === 'place_order' && placeOrders.length >= 1 && belowAdvanced) return 'advanced';
    return null;
  };

  return (
    <Page {...page}>
      <BlockStack gap="400">
        {noPermission ? (
          <Banner tone="warning" title="Only staff with the Reward programs permission can change programs">
            <p>Ask the store owner to give you access. Your programs keep running.</p>
          </Banner>
        ) : null}
        {offByPlan.length && belowAdvanced ? (
          <Banner tone="warning" title={`${offByPlan.length} programs were turned off because they need the Advanced plan.`} action={{content: 'Upgrade', onAction: () => upgrade('advanced')}}>
            <p>Customers keep earning from the programs that are still on.</p>
          </Banner>
        ) : null}
        {offByPlan.length && !belowAdvanced ? (
          <Banner tone="info" title={`${offByPlan.length} programs were turned off when your plan changed. Turn them back on?`} action={{content: onlyOff ? 'Show all programs' : 'Show these programs', onAction: () => setOnlyOff((v) => !v)}}>
            <p>They stay off until you turn them on, so no one earns points you didn't expect.</p>
          </Banner>
        ) : null}
        <Card padding="0">
          {tabs}
          <Divider />
          {rows.length ? (
            <ResourceList
              resourceName={{singular: 'program', plural: 'programs'}}
              items={rows}
              renderItem={(p) => {
                const url = editUrl(p);
                const lockedOff = p.offByPlan && belowAdvanced && p.event === 'place_order';
                const planTag = p.needs ? p.needs : lockedOff ? 'advanced' : null;
                return (
                  <ResourceItem id={p.id} onClick={() => (url ? navigate(url) : notYet())} accessibilityLabel={`Edit ${p.title}`}>
                    <InlineStack align="space-between" blockAlign="center" gap="300" wrap={false}>
                      <BlockStack gap="100">
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="span" variant="bodyMd" fontWeight="semibold" breakWord>{p.title}</Text>
                          {planTag ? <LockTag plan={planTag} /> : null}
                        </InlineStack>
                        <Text as="p" tone="subdued" breakWord>{p.summary}</Text>
                      </BlockStack>
                      <InlineStack gap="300" blockAlign="center" wrap={false}>
                        <Badge tone={p.on ? 'success' : undefined}>{p.on ? 'Active' : 'Off'}</Badge>
                        <Button icon={EditIcon} variant="plain" accessibilityLabel={`Edit ${p.title}`} onClick={() => (url ? navigate(url) : notYet())} />
                      </InlineStack>
                    </InlineStack>
                  </ResourceItem>
                );
              }}
            />
          ) : (
            <Box padding="400">
              <EmptyView heading="No earning programs yet" action={oldVersion ? undefined : {content: 'Add program', onAction: () => setAdding(true)}}>
                Add a program so customers earn points when they order, sign up or celebrate a birthday.
              </EmptyView>
            </Box>
          )}
        </Card>
      </BlockStack>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add program" secondaryActions={[{content: 'Close', onAction: () => setAdding(false)}]}>
        <Modal.Section flush>
          <ResourceList
            items={ADDABLE}
            renderItem={(item) => {
              const lock = lockFor(item);
              return (
                <ResourceItem id={item.event} onClick={() => pick(item)} accessibilityLabel={`Add ${item.title}`}>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="span" tone={lock ? 'subdued' : undefined}>{item.title}</Text>
                    {lock ? <LockTag plan={lock} /> : null}
                  </InlineStack>
                </ResourceItem>
              );
            }}
          />
        </Modal.Section>
      </Modal>
    </Page>
  );
}
