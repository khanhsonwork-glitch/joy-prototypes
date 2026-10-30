// Reward programs › Milestones › edit (MilestoneV3Program in the Joy admin). The widget, Loyalty page and customer
// account page show ONE Shop now button per milestone program, so the new link lives in "Milestone information".
import React, {useEffect, useMemo, useState} from 'react';
import {BlockStack, Button, Card, Icon, InlineGrid, InlineStack, Layout, Page, Text, TextField} from '@shopify/polaris';
import {ChevronDownIcon, DragHandleIcon, DuplicateIcon, DeleteIcon, PlusIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {MILESTONES} from '../data/index.js';
import {linkError, shopNowTarget, useLinks} from '../state/links.jsx';
import {ShopNowLinkField, SummaryCard} from './shared.jsx';

const initialForm = (state) => ({
  title: 'Spend more, earn more',
  shopNowLink: state === 'own' ? '/collections/night-notes' : state === 'worst'
    ? 'https://pomelopark.com/collections/night-notes?utm_source=loyalty&utm_medium=milestone&utm_campaign=winter-skincare-favourites-2026'
    : '',
});

export function MilestoneEdit() {
  const {notify, notYet} = useShell();
  const navigate = useNavigate();
  const {state} = useScenario();
  const {saved} = useLinks();
  const today = state === 'today';
  const initial = useMemo(() => initialForm(state), [state]);
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  const set = (key) => (value) => setForm((f) => ({...f, [key]: value}));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const target = {ownLink: form.shopNowLink, giftType: 'none', defaultLink: state === 'blank' ? '' : saved.defaultLink,
    fallbackWhy: 'your homepage (/collections/all on the loyalty page), because the shopping link in Settings is blank'};

  const onSave = () => {
    if (!today && linkError(form.shopNowLink)) {
      notify('1 field needs attention', {error: true});
      document.querySelector('#shop-now-link')?.focus();
      return;
    }
    notify('Program saved');
  };

  let body;
  if (state === 'loading') body = <Card><LoadingView /></Card>;
  else if (state === 'error') body = <ErrorView onRetry={() => notify('Program loaded')}>We couldn’t load this milestone. Nothing you saved is lost.</ErrorView>;
  else body = (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">Milestone information</Text>
              <TextField label="Milestone name" value={form.title} onChange={set('title')} autoComplete="off" />
              <InlineGrid columns={2} gap="300">
                <TextField label="Start date" type="date" value="2026-10-01" onChange={() => {}} autoComplete="off" />
                <TextField label="End date" type="date" value="" onChange={() => {}} autoComplete="off" />
              </InlineGrid>
              {today ? null : (
                <div className="sl-new">
                  <ShopNowLinkField
                    value={form.shopNowLink}
                    onChange={set('shopNowLink')}
                    target={target}
                    help="Where the Shop now button of this milestone takes customers, in the widget, on the loyalty page and in the customer account page. Leave blank to use the shopping link in Settings."
                  />
                </div>
              )}
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <BlockStack gap="100">
                <Text as="h2" variant="headingMd">Milestone</Text>
                <Text as="p" tone="subdued">Earn points, gifts, discounts when reaching a milestone order</Text>
              </BlockStack>
              {MILESTONES.map((m, i) => (
                <div key={m.id} className="sl-acc">
                  <span className="sl-acc__drag"><Icon source={DragHandleIcon} tone="subdued" /></span>
                  <BlockStack gap="050">
                    <Text as="p" fontWeight="semibold">{`Milestone #${i + 1}`}</Text>
                    <Text as="p" tone="subdued">{`$${m.threshold}.00 spent | ${m.rewards}`}</Text>
                  </BlockStack>
                  <InlineStack gap="100">
                    <Button variant="tertiary" icon={DuplicateIcon} accessibilityLabel="Duplicate" onClick={notYet} />
                    <Button variant="tertiary" icon={DeleteIcon} accessibilityLabel="Delete" onClick={notYet} />
                    <Button variant="tertiary" icon={ChevronDownIcon} accessibilityLabel="Expand" onClick={notYet} />
                  </InlineStack>
                </div>
              ))}
              <InlineStack><Button icon={PlusIcon} onClick={notYet}>Add milestone</Button></InlineStack>
            </BlockStack>
          </Card>
        </BlockStack>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <div className="sl-sticky">
          <SummaryCard
            title={form.title || 'Amount spent'}
            lines={[
              'Milestones overview: 3 milestones',
              ...MILESTONES.map((m) => `$${m.threshold}.00 spent: ${m.rewards}`),
              ...(today ? [] : [`Shop now: ${shopNowTarget(target).url}`]),
            ]}
          />
        </div>
      </Layout.Section>
    </Layout>
  );

  return (
    <Page
      backAction={{content: 'Milestones', onAction: () => navigate('/programs?type=milestone')}}
      title="Amount spent"
      actionGroups={[{title: 'Status: Active', actions: [{content: 'Active'}, {content: 'Inactive', onAction: notYet}]}]}
      secondaryActions={[{content: 'Delete', destructive: true, onAction: notYet}]}
      primaryAction={{content: 'Save', onAction: onSave, disabled: !dirty || state === 'loading' || state === 'error'}}
    >
      {body}
    </Page>
  );
}
