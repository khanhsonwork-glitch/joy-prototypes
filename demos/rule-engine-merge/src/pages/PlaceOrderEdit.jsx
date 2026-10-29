// Place order edit. New version = the form Advanced shops with the old switch already use (one program per page);
// the plan locks parts of it with a plan tag. Old version = today's single-program form with its rules + the switch banner.
import React, {useState} from 'react';
import {Banner, BlockStack, Card, Checkbox, ChoiceList, InlineGrid, InlineStack, Layout, Page, Select, Text, TextField} from '@shopify/polaris';
import {useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {hasPlan, useProto} from '../state/proto.jsx';
import {LockTag, SwitchBanner, lockedLabel, useUpgrade} from './shared.jsx';
import {NewBirthdayForm} from './BirthdayEdit.jsx';

const METHODS = [
  {value: 'order', label: 'Each time your customer makes a purchase'},
  {value: 'price', label: 'The amount your customer has spent'},
  {value: 'quantity', label: 'Give X points for every Y items purchased', advanced: true},
  {value: 'fixed', label: 'Give X points once when spending reaches', advanced: true},
];

/** Right column: the storefront card and the summary, as the app shows them. */
function Summary({program}) {
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="200">
          <Text as="span" variant="headingSm">Preview</Text>
          <Card background="bg-surface-secondary">
            <BlockStack gap="100">
              <Text as="span" fontWeight="semibold" breakWord>{program.title}</Text>
              <Text as="span" tone="subdued">{program.summary}</Text>
            </BlockStack>
          </Card>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="200">
          <Text as="span" variant="headingSm" breakWord>{program.title}</Text>
          <Text as="p" tone="subdued">Period: Nov 1, 2026 – No end date</Text>
          <Text as="span" fontWeight="semibold">Basic info</Text>
          <Text as="p">For: Registered customers only · Earning: {program.summary.replace(/^Earn /, '')}</Text>
          <Text as="span" fontWeight="semibold">Conditions</Text>
          <Text as="p">Purchase locations: Online store and POS · Product eligibility: All products · Exclusions: No exclusions</Text>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

/** The new Place order form. `program` drives title/summary; `locks` comes from the plan (or none in preview). */
export function NewPlaceOrderForm({program, plan}) {
  const starter = !hasPlan(plan, 'essential');
  const belowAdvanced = !hasPlan(plan, 'advanced');
  const ess = starter ? 'essential' : null;
  const [method, setMethod] = useState('price');
  const [typeEarn, setTypeEarn] = useState('point');
  const [applyFor, setApplyFor] = useState('members');
  const [value, setValue] = useState('1');
  const [stop, setStop] = useState(false);
  const priorityLock = belowAdvanced ? 'advanced' : null; // one rule for new and switched shops

  return (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="span" variant="headingMd">Program information</Text>
              <TextField label="Program name" value={program.title} onChange={() => {}} autoComplete="off" />
              <TextField label="Description" value="Give {{earning_point_raw}} {{loyalty_point}} for every {{amount_spent}} spent" onChange={() => {}} autoComplete="off" />
              <InlineGrid columns={2} gap="300">
                <TextField label="Start date" type="date" value="2026-11-01" onChange={() => {}} autoComplete="off" />
                <TextField label="End date" type="date" value="" onChange={() => {}} autoComplete="off" />
              </InlineGrid>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="span" variant="headingMd">Reward settings</Text>
              <ChoiceList
                title="Apply for"
                choices={[
                  {label: 'All loyalty members', value: 'members', helpText: 'All customers who joined the loyalty program can earn points'},
                  {label: lockedLabel('VIP Tier only', belowAdvanced ? 'advanced' : null), value: 'vip', disabled: belowAdvanced},
                  {label: 'All customers', value: 'all'},
                ]}
                selected={[applyFor]}
                onChange={([v]) => setApplyFor(v)}
              />
              <ChoiceList
                title="Reward type"
                choices={[
                  {label: 'Loyalty Points', value: 'point'},
                  {label: 'Store Credit', value: 'credit'},
                ]}
                selected={[typeEarn]}
                onChange={([v]) => setTypeEarn(v)}
              />
              <ChoiceList
                title="Rewarding method"
                choices={METHODS.map((m) => {
                  const lock = m.advanced && belowAdvanced ? 'advanced' : null;
                  return {label: lockedLabel(m.label, lock), value: m.value, disabled: Boolean(lock)};
                })}
                selected={[method]}
                onChange={([v]) => setMethod(v)}
              />
              <InlineStack gap="300" blockAlign="end">
                <div className="re-narrow"><TextField label="Rewarding value" type="number" value={value} onChange={setValue} suffix={typeEarn === 'credit' ? 'USD' : 'point(s)'} autoComplete="off" error={Number(value) > 0 ? undefined : 'Enter a number greater than 0'} /></div>
                {method === 'price' ? <div className="re-narrow"><TextField label="for every" type="number" value="1" prefix="$" onChange={() => {}} autoComplete="off" /></div> : null}
              </InlineStack>
              <Checkbox label={lockedLabel('Earn points from tax', ess)} checked={false} onChange={() => {}} disabled={starter} />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="headingMd">Reward conditions</Text>
                {ess ? <LockTag plan={ess} /> : null}
              </InlineStack>
              <Select label="Customers earn when" options={[{label: 'All conditions are met', value: 'all'}, {label: 'Any condition is met', value: 'any'}]} value="all" onChange={() => {}} disabled={starter} />
              <InlineGrid columns={{xs: 1, sm: 3}} gap="200">
                <Select label="Field" options={['Order subtotal', 'Customer tag', 'Purchase location']} value="Order subtotal" onChange={() => {}} disabled={starter} />
                <Select label="Operator" options={['is at least', 'is less than']} value="is at least" onChange={() => {}} disabled={starter} />
                <TextField label="Value" prefix="$" value="50" onChange={() => {}} disabled={starter} autoComplete="off" />
              </InlineGrid>
              <Text as="span" fontWeight="semibold">Exclusions</Text>
              <Checkbox label="Don't reward products on sale" checked={false} onChange={() => {}} disabled={starter} />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="headingMd">Rounding & priority</Text>
                {priorityLock ? <LockTag plan={priorityLock} /> : null}
              </InlineStack>
              <InlineGrid columns={2} gap="300">
                <Select label="Rounding" options={['Round down', 'Round up', 'Round to nearest']} value="Round down" onChange={() => {}} />
                <Select label="Priority" options={['1', '2', '3']} value={String(program.priority || 1)} onChange={() => {}} disabled={Boolean(priorityLock)} helpText={priorityLock ? 'Matters when more than one Place order program runs' : undefined} />
              </InlineGrid>
              <Checkbox label="Stop processing lower-priority programs when this one rewards" checked={stop} onChange={setStop} disabled={Boolean(priorityLock)} />
            </BlockStack>
          </Card>
        </BlockStack>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <Summary program={program} />
      </Layout.Section>
    </Layout>
  );
}

/** Today's old Place order form: one program, rules inside it, two earning methods locked. */
function OldPlaceOrderForm({plan}) {
  const [method, setMethod] = useState('price');
  return (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="300">
              <Text as="span" variant="headingMd">Program information</Text>
              <TextField label="Program name" value="One-time purchase" onChange={() => {}} autoComplete="off" />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="span" variant="headingMd">Earning type</Text>
              <ChoiceList
                title="Earning type"
                titleHidden
                choices={METHODS.map((m) => ({label: lockedLabel(m.label, m.advanced ? 'advanced' : null), value: m.value, disabled: m.advanced}))}
                selected={[method]}
                onChange={([v]) => setMethod(v)}
              />
              <Checkbox label={lockedLabel('Earn points from tax', hasPlan(plan, 'essential') ? null : 'essential')} checked={false} onChange={() => {}} disabled={!hasPlan(plan, 'essential')} />
            </BlockStack>
          </Card>
        </BlockStack>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <Summary program={{title: 'One-time purchase', summary: 'Earn 1 point for every $1 spent'}} />
      </Layout.Section>
    </Layout>
  );
}

export function PlaceOrderEdit() {
  const {segments} = useRoute();
  const {state, setState} = useScenario();
  const {notify} = useShell();
  const upgrade = useUpgrade();
  const {plan, oldVersion, placeOrders} = useProto();
  const program = placeOrders.find((p) => p.id === segments[2]) || placeOrders[0];
  const belowAdvanced = !hasPlan(plan, 'advanced');
  const lockedOff = program?.offByPlan && belowAdvanced;
  const title = oldVersion ? 'One-time purchase' : program.title;
  const page = {
    backAction: {content: 'Reward programs', url: '/demo'},
    title: state === 'overflow' || state === 'worst' ? 'Double points every weekend on all skincare sets and travel minis for Gold and Platinum members' : title,
    subtitle: 'Reward points on each purchase',
    primaryAction: {content: 'Save', onAction: () => notify('Saved program successfully'), disabled: state === 'disabled' || state === 'loading' || state === 'error'},
    secondaryActions: oldVersion ? [] : [{content: program.on ? 'Turn off' : 'Turn on', disabled: lockedOff || state === 'disabled', onAction: () => notify(program.on ? 'Program turned off' : 'Program turned on')}],
  };

  if (state === 'loading') return <Page {...page}><LoadingView rows={10} /></Page>;
  if (state === 'error') return <Page {...page}><ErrorView title="Couldn't load this program" onRetry={() => setState('default')}>The program keeps running with its saved settings.</ErrorView></Page>;

  return (
    <Page {...page}>
      <BlockStack gap="400">
        {state === 'disabled' ? <Banner tone="warning" title="Only staff with the Reward programs permission can edit programs" /> : null}
        {lockedOff ? (
          <Banner tone="warning" title="This program is off because running more than one Place order program needs the Advanced plan." action={{content: 'Upgrade', onAction: () => upgrade('advanced')}}>
            <p>Your other Place order program keeps rewarding orders.</p>
          </Banner>
        ) : null}
        {oldVersion ? (
          <SwitchBanner
            kind="placeOrder"
            renderPreview={(k) => (k === 'birthday'
              ? <NewBirthdayForm plan={plan} />
              : <NewPlaceOrderForm plan={plan} program={{title: 'Place an order', summary: 'Earn 1 point for every $1 spent', priority: 1}} />)}
          />
        ) : null}
        {oldVersion ? <OldPlaceOrderForm plan={plan} /> : <NewPlaceOrderForm plan={plan} program={program} />}
      </BlockStack>
    </Page>
  );
}
