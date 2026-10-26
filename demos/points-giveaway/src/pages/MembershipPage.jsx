// #/membership: the live Membership page (refs/membership-real.png) with the Points Giveaway card next to Member-exclusive deal.
import React from 'react';
import {BlockStack, Badge, Box, Button, Card, InlineStack, Page, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useStore} from '../state/store.jsx';

function ProgramCard({title, badge, description, status, actionLabel, actionUrl, onAction, onLearn, learnUrl}) {
  return (
    <Card>
      <BlockStack gap="500">
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="headingSm">
              {title}
            </Text>
            {badge}
          </InlineStack>
          <Text as="p" variant="bodyMd">
            {description}
          </Text>
          {status ? (
            <Text as="p" variant="bodyMd" tone="subdued">
              {status}
            </Text>
          ) : null}
        </BlockStack>
        <InlineStack gap="200" blockAlign="center">
          <Button url={actionUrl} onClick={onAction}>
            {actionLabel}
          </Button>
          <Button variant="plain" onClick={onLearn} url={learnUrl} external={Boolean(learnUrl)}>
            Learn more
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function Section({title, children}) {
  return (
    <BlockStack gap="200">
      <Box paddingInline={{xs: '400', sm: '0'}}>
        <Text as="h2" variant="headingSm">
          {title}
        </Text>
      </Box>
      <BlockStack gap="300">{children}</BlockStack>
    </BlockStack>
  );
}

export default function MembershipPage() {
  const {notYet} = useShell();
  const {giveaways} = useStore();
  const active = giveaways.filter((g) => g.status === 'active' || g.status === 'giving').length;
  const scheduled = giveaways.filter((g) => g.status === 'scheduled').length;
  const status = giveaways.length
    ? [active ? `${active} active` : null, scheduled ? `${scheduled} scheduled` : null, `${giveaways.length} giveaway${giveaways.length === 1 ? '' : 's'} in total`].filter(Boolean).join(' · ')
    : null;

  return (
    <Page title="Membership" subtitle="Create a multi-level VIP system, configure member-exclusive deals, or run a premium paid membership program">
      <BlockStack gap="600">
        <Section title="DTC programs">
          <ProgramCard
            title="VIP Tiers"
            badge={<Badge tone="success">Active</Badge>}
            description="Tiers based on spending, points, or order count. Welcome new tier members with entry rewards — and unlock real perks: automatic discounts, free shipping, and exclusive access"
            actionLabel="Set up"
            onAction={notYet}
            onLearn={notYet}
          />
          <ProgramCard
            title="Member-exclusive deal"
            description="Drive urgency with time-limited deals only loyalty members can access — boost repeat purchases and reward engagement"
            actionLabel="Set up"
            onAction={notYet}
            onLearn={notYet}
          />
          <ProgramCard
            title="Points Giveaway"
            badge={active ? <Badge tone="success">Active</Badge> : giveaways.length ? null : <Badge tone="new">New</Badge>}
            description="Give a group of members points — Joy adds them, emails members and shows the orders that used them"
            status={status}
            actionLabel={giveaways.length ? 'Manage' : 'Set up'}
            actionUrl="/points-giveaway"
            onLearn={notYet}
          />
          <ProgramCard
            title="Subscription membership"
            description="Generate recurring revenue with paid memberships — unlock exclusive perks, VIP benefits, and premium access for subscribers"
            actionLabel="Set up"
            onAction={notYet}
            onLearn={notYet}
          />
        </Section>

        <Section title="B2B programs">
          <ProgramCard
            title="Partner tier"
            badge={<Badge>Inactive</Badge>}
            description="Incentivize higher wholesale orders with tiered pricing, volume discounts, and exclusive partner perks"
            actionLabel="Set up"
            onAction={notYet}
            onLearn={notYet}
          />
        </Section>
      </BlockStack>
    </Page>
  );
}
