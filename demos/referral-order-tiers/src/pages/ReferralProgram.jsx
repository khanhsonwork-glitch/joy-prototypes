// Reward programs → Referrals tab, as the Joy admin draws it (pages/Program/SubMenu/Referral.js): the program card and
// the rewards card. Tiers are set inside each Edit page; this page only shows their one-line summary.
import React, {useState} from 'react';
import {Badge, BlockStack, Box, Button, Card, Checkbox, Divider, InlineStack, Link, Page, Tabs, Text, TextField} from '@shopify/polaris';
import {EditIcon} from '@shopify/polaris-icons';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useProgram} from '../state/program.jsx';
import {friendSummary, referrerSummary} from '../state/logic.js';

// Reward programs tabs, as the Joy admin shows them.
const PROGRAM_TABS = [
  {id: 'earning', label: 'Earning programs'},
  {id: 'redeem', label: 'Redeeming programs'},
  {id: 'referral', label: 'Referrals'},
  {id: 'milestone', label: 'Milestones'},
  {id: 'point_expiration', label: 'Point expiration'},
  {id: 'joySubscription', label: 'Subscription and Membership'},
];

function RewardRow({title, summary, redeemed, url, locked}) {
  return (
    <InlineStack align="space-between" blockAlign="center" gap="300" wrap={false}>
      <BlockStack gap="100">
        <Text variant="bodyMd" as="span" fontWeight="semibold">{title}</Text>
        <Text as="p" breakWord>{summary}</Text>
        <span><Badge>{`${redeemed} redeemed`}</Badge></span>
      </BlockStack>
      <Button icon={EditIcon} variant="plain" url={url} disabled={locked} accessibilityLabel={`Edit ${title.toLowerCase()}`} />
    </InlineStack>
  );
}

export function ReferralProgram() {
  const {notYet} = useShell();
  const {state, setState} = useScenario();
  const navigate = useNavigate();
  const {query} = useRoute();
  const tab = PROGRAM_TABS.some((t) => t.id === query.get('type')) ? query.get('type') : 'referral';
  const [programOn, setProgramOn] = useState(true);
  const tabs = (
    <Tabs
      tabs={PROGRAM_TABS.map((t) => ({id: t.id, content: t.label}))}
      selected={PROGRAM_TABS.findIndex((t) => t.id === tab)}
      onSelect={(i) => navigate(`/demo?type=${PROGRAM_TABS[i].id}`)}
    />
  );
  const {program} = useProgram();
  const locked = state === 'disabled';

  // The app shows no Save here (edits go through the contextual save bar); storefront preview sits under More actions.
  const page = {
    title: 'Reward programs',
    actionGroups: [{title: 'More actions', actions: [{content: 'Preview on storefront', url: '/demo/storefront'}]}],
  };
  const status = (
    <Card>
      <InlineStack align="space-between" blockAlign="center" gap="300">
        <BlockStack gap="100">
          <Text as="h2" variant="headingSm">Rewards program status</Text>
          <Text as="p">Live mode - all customers can earn and redeem rewards.</Text>
          <Link onClick={notYet}>Watch video guide</Link>
        </BlockStack>
        <Badge tone="success">Live mode</Badge>
      </InlineStack>
    </Card>
  );

  if (tab !== 'referral') {
    return (
      <Page {...page}>
        <BlockStack gap="400">
          {status}
          {tabs}
          <div className="rt-proto-note" role="note">
            <p>Prototype · this prototype covers the Referrals tab only.</p>
            <Button onClick={() => navigate('/demo?type=referral')}>Open Referrals</Button>
          </div>
        </BlockStack>
      </Page>
    );
  }
  if (state === 'loading') return <Page {...page}><BlockStack gap="400">{status}{tabs}<LoadingView rows={12} /></BlockStack></Page>;
  if (state === 'error') {
    return (
      <Page {...page}>
        {status}
        {tabs}
        <ErrorView title="Couldn't load your reward programs" onRetry={() => setState('default')}>
          Nothing was changed. Your referral program keeps running while this page reloads.
        </ErrorView>
      </Page>
    );
  }

  return (
    <Page {...page}>
      <BlockStack gap="400">
        {status}
        {tabs}
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between" blockAlign="start" gap="300" wrap={false}>
              <BlockStack gap="100">
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text as="span" variant="headingMd">Referral program</Text>
                  <Badge tone={programOn ? 'success' : undefined}>{programOn ? 'On' : 'Off'}</Badge>
                </InlineStack>
                <Text as="p">Expand your customer network and reward loyal customers for referring friends. <Link onClick={notYet}>Learn more</Link></Text>
              </BlockStack>
              <Button onClick={() => setProgramOn((v) => !v)} disabled={locked}>{programOn ? 'Turn off' : 'Turn on'}</Button>
            </InlineStack>
            <TextField label="Program name" value="Referral Program" onChange={notYet} autoComplete="off" disabled={locked} />
            <Checkbox
              label="Enable multiple region rewards"
              helpText="A single coupon works across all regions. At checkout, the discount value and requirements are automatically applied based on the customer's currency. If a region is configured, its exact values are used. Otherwise, the default values are converted using Shopify's exchange rate."
              checked={false}
              onChange={notYet}
              disabled={locked}
            />
            <Box borderWidth="025" borderColor="border" borderRadius="200" padding="400">
              <BlockStack gap="300">
                <Text as="p">
                  Referral rewards follow your Order status setting. They're granted when the referred order is Paid or Fulfilled — change it under <Link onClick={notYet}>Settings → Order.</Link>
                </Text>
                <RewardRow title="Rewards for referrers" summary={referrerSummary(program)} redeemed={128} url="/demo/referrer" locked={false} />
                <Divider />
                <RewardRow title="Rewards for referees" summary={friendSummary(program)} redeemed={341} url="/demo/referee" locked={false} />
              </BlockStack>
            </Box>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

