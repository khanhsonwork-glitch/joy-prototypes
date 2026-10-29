// Birthday edit. New version = latest multi-reward Birthday (points + discount + free gift together); gifts per VIP
// tier carry the Advanced tag below Advanced. Old version = one reward for everyone + the switch banner.
import React, {useState} from 'react';
import {Banner, BlockStack, Card, Checkbox, ChoiceList, InlineStack, Layout, Page, Select, Text, TextField} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {hasPlan, useProto} from '../state/proto.jsx';
import {SwitchBanner, lockedLabel, useUpgrade} from './shared.jsx';
import {NewPlaceOrderForm} from './PlaceOrderEdit.jsx';

const REWARDS = [
  {key: 'points', label: 'Points', detail: '100 points'},
  {key: 'discount', label: 'Discount code', detail: '10% off the next order, expires after 30 days'},
  {key: 'gift', label: 'Free gift', detail: 'Pomelo travel tote, with any order'},
];

function Limitation() {
  const [limit, setLimit] = useState('year');
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="span" variant="headingMd">Limitation</Text>
        <ChoiceList title="Customers can get this reward" titleHidden choices={[{label: 'Once per year', value: 'year'}, {label: 'Once in a lifetime', value: 'life'}]} selected={[limit]} onChange={([v]) => setLimit(v)} />
      </BlockStack>
    </Card>
  );
}

/** Latest Birthday form. `perTierBroken` = after a downgrade, the program only had gifts per VIP tier. */
export function NewBirthdayForm({plan, perTierBroken = false}) {
  const belowAdvanced = !hasPlan(plan, 'advanced');
  const [forWho, setForWho] = useState(perTierBroken && !belowAdvanced ? 'tier' : 'all');
  const [picked, setPicked] = useState(perTierBroken ? [] : ['points', 'discount', 'gift']);
  const [multi, setMulti] = useState(true);
  return (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="span" variant="headingMd">Program information</Text>
              <TextField label="Program name" value="Celebrate a birthday" onChange={() => {}} autoComplete="off" />
              <Select label="Date format" options={['MM/DD/YYYY', 'DD/MM/YYYY']} value="MM/DD/YYYY" onChange={() => {}} />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="span" variant="headingMd">Birthday rewards</Text>
              <ChoiceList
                title="Rewards for"
                choices={[
                  {label: 'All members', value: 'all'},
                  {label: lockedLabel('Different rewards for each VIP tier', belowAdvanced ? 'advanced' : null), value: 'tier', disabled: belowAdvanced},
                ]}
                selected={[forWho]}
                onChange={([v]) => setForWho(v)}
              />
              <ChoiceList
                allowMultiple
                title="Reward"
                choices={REWARDS.map((r) => ({label: r.label, value: r.key, helpText: r.detail}))}
                selected={picked}
                onChange={setPicked}
                error={picked.length ? undefined : 'Choose at least one reward for all members'}
              />
              <Checkbox label="Allow users to receive multiple rewards simultaneously" checked={multi} onChange={setMulti} />
            </BlockStack>
          </Card>
          <Limitation />
        </BlockStack>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <Card>
          <BlockStack gap="200">
            <Text as="span" variant="headingSm">Preview</Text>
            <Card background="bg-surface-secondary">
              <BlockStack gap="100">
                <Text as="span" fontWeight="semibold">Celebrate a birthday</Text>
                <Text as="span" tone="subdued">{picked.length ? REWARDS.filter((r) => picked.includes(r.key)).map((r) => r.detail.split(',')[0]).join(' + ') : 'No reward set'}</Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

function OldBirthdayForm() {
  const [type, setType] = useState('points');
  return (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="span" variant="headingMd">Program information</Text>
              <TextField label="Set your program name here" value="Celebrate a birthday" onChange={() => {}} autoComplete="off" />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="span" variant="headingMd">Reward settings</Text>
              <ChoiceList title="Reward type" choices={[{label: 'Points', value: 'points'}, {label: 'Discount code', value: 'discount'}, {label: 'Store credit', value: 'credit'}]} selected={[type]} onChange={([v]) => setType(v)} />
              <div className="re-narrow"><TextField label="Value" type="number" value="50" suffix="points" onChange={() => {}} autoComplete="off" /></div>
            </BlockStack>
          </Card>
          <Limitation />
        </BlockStack>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <Card>
          <BlockStack gap="200">
            <Text as="span" variant="headingSm">Preview</Text>
            <Card background="bg-surface-secondary">
              <BlockStack gap="100">
                <Text as="span" fontWeight="semibold">Celebrate a birthday</Text>
                <Text as="span" tone="subdued">Earn 50 points</Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

export function BirthdayEdit() {
  const {state, setState} = useScenario();
  const {notify} = useShell();
  const upgrade = useUpgrade();
  const {plan, shop, oldVersion} = useProto();
  const starter = !hasPlan(plan, 'essential');
  const perTierBroken = shop === 'downgraded';
  const offNow = perTierBroken && !hasPlan(plan, 'advanced');
  const page = {
    backAction: {content: 'Reward programs', url: '/demo'},
    title: state === 'overflow' || state === 'worst' ? 'Celebrate a birthday with points, a discount and a free gift from Pomelo Park' : 'Celebrate a birthday',
    subtitle: 'Rewards for each of your customer birthday',
    primaryAction: {content: 'Save', onAction: () => notify('Saved program successfully'), disabled: starter || state === 'disabled' || state === 'loading' || state === 'error'},
    // Starter: the whole page is locked, so there is no on/off button at all.
    secondaryActions: oldVersion || starter ? [] : [{content: offNow ? 'Turn on' : 'Turn off', disabled: offNow || state === 'disabled', onAction: () => notify('Program turned off')}],
  };
  if (state === 'loading') return <Page {...page}><LoadingView rows={8} /></Page>;
  if (state === 'error') return <Page {...page}><ErrorView title="Couldn't load the Birthday program" onRetry={() => setState('default')}>Customers keep getting their birthday rewards.</ErrorView></Page>;

  return (
    <Page {...page}>
      <BlockStack gap="400">
        {state === 'disabled' ? <Banner tone="warning" title="Only staff with the Reward programs permission can edit programs" /> : null}
        {starter ? (
          <Banner tone="warning" title="Birthday rewards are available on the Essential plan." action={{content: 'Upgrade', onAction: () => upgrade('essential')}}>
            <p>Customers on your current plan don't get birthday rewards.</p>
          </Banner>
        ) : null}
        {offNow && !starter ? (
          <Banner tone="warning" title="Birthday rewards per VIP tier need the Advanced plan.">
            <p>Set one reward set for all members to turn this program back on.</p>
          </Banner>
        ) : null}
        {oldVersion && !starter ? (
          <SwitchBanner
            kind="birthday"
            renderPreview={(k) => (k === 'birthday'
              ? <NewBirthdayForm plan={plan} />
              : <NewPlaceOrderForm plan={plan} program={{title: 'Place an order', summary: 'Earn 1 point for every $1 spent', priority: 1}} />)}
          />
        ) : null}
        <div className={starter ? 're-locked' : undefined}>
          {oldVersion ? <OldBirthdayForm /> : <NewBirthdayForm plan={plan} perTierBroken={perTierBroken} />}
        </div>
      </BlockStack>
    </Page>
  );
}
