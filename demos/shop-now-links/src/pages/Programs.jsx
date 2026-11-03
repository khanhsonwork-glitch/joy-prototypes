// Reward programs: the tab bar of the Joy admin with the two tabs this demo touches.
import React from 'react';
import {BlockStack, Button, Card, Icon, InlineStack, Page, Tabs, Text, Badge} from '@shopify/polaris';
import {GiftCardIcon, TargetIcon} from '@shopify/polaris-icons';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';

const TABS = [
  {id: 'earn', content: 'Earning programs'},
  {id: 'redeem', content: 'Redeeming programs'},
  {id: 'referral', content: 'Referrals'},
  {id: 'milestone', content: 'Milestones'},
  {id: 'expiry', content: 'Point expiration'},
  {id: 'subscription', content: 'Subscription'},
];

function Row({icon, title, sub, onEdit}) {
  return (
    <div className="sl-row">
      <span className="sl-row__icon"><Icon source={icon} /></span>
      <BlockStack gap="050">
        <InlineStack gap="200" blockAlign="center"><Text as="span" fontWeight="semibold">{title}</Text><Badge tone="success">Active</Badge></InlineStack>
        <Text as="span" tone="subdued">{sub}</Text>
      </BlockStack>
      <Button onClick={onEdit}>Edit</Button>
    </div>
  );
}

export function Programs() {
  const navigate = useNavigate();
  const {notYet} = useShell();
  const {query} = useRoute();
  const type = query?.get?.('type') || 'redeem';
  const selected = Math.max(0, TABS.findIndex((t) => t.id === type));
  return (
    <Page title="Reward programs">
      <BlockStack gap="400">
        <Tabs tabs={TABS} selected={selected} onSelect={(i) => (['redeem', 'milestone'].includes(TABS[i].id) ? navigate(`/programs?type=${TABS[i].id}`) : notYet())} />
        {TABS[selected].id === 'milestone' ? (
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Milestones</Text>
              <Row icon={TargetIcon} title="Spend more, earn more" sub="Amount spent · 3 milestones" onEdit={() => navigate('/milestone')} />
            </BlockStack>
          </Card>
        ) : (
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Free gift program</Text>
              <Row icon={GiftCardIcon} title="Free Pomelo Cloud Cream mini" sub="Free product for 1,500 points" onEdit={() => navigate('/reward')} />
            </BlockStack>
          </Card>
        )}
      </BlockStack>
    </Page>
  );
}
