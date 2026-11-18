import React from 'react';
import {BlockStack, Button, Card, InlineGrid, InlineStack, Text} from '@shopify/polaris';
import {TIER_ART, MKT_ART} from '../../assets/index.js';
import {useStore} from '../../state/store.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {StatusBadge, num} from '../../ui/kit.jsx';
import {Question, useVipState} from './common.jsx';

export function VipHome() {
  const {db} = useStore();
  const {empty, overflow} = useVipState();
  const cards = [
    {name: 'VIP tiers', description: 'Reward customers as they shop more.', count: (db.tiers || []).reduce((n, t) => n + (t.members || 0), 0), unit: 'members across tiers', status: db.tierSettings?.enabled ? 'active' : 'inactive', url: '/vip/tiers', art: TIER_ART.gold, setup: (db.tiers || []).length > 1},
    {name: 'Member deals', description: 'Give members discounts they cannot get elsewhere.', count: (db.deals || []).filter(x => x.status === 'active').length, unit: 'active deals', status: (db.deals || []).some(x => x.status === 'active') ? 'active' : 'inactive', url: '/vip/deals', art: MKT_ART.banner, setup: (db.deals || []).length > 0},
    {name: 'Paid membership', description: 'Offer a paid plan with ongoing benefits.', count: (db.paidPlans || []).reduce((n, p) => n + (p.subscribers || 0), 0), unit: 'subscribers', status: (db.paidPlans || []).some(x => x.status === 'active') ? 'active' : 'inactive', url: '/vip/paid', art: MKT_ART.credit, setup: (db.paidPlans || []).length > 0},
    ...(db.shop?.b2b ? [{name: 'Partner tiers', description: 'Give companies wholesale benefits based on their tier.', count: (db.companies || []).length, unit: 'companies', status: (db.partnerTiers || []).some(x => x.status === 'active') ? 'active' : 'inactive', url: '/vip/partners', art: TIER_ART.silver, setup: (db.partnerTiers || []).length > 0}] : []),
  ];
  return <PageFrame title="VIP & membership" backUrl="/programs">
    <BlockStack gap="500">
      <Question detail="VIP is optional. Start with the benefit that fits your shop, then grow the program when you are ready.">What extra do my loyal customers get?</Question>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="400">
        {cards.map(card => {
          const setup = card.setup && !empty;
          return <Card key={card.name}>
            <BlockStack gap="400">
              {!setup && <img className="rv-vip-home-art" src={card.art} alt=""/>}
              <InlineStack align="space-between" blockAlign="center"><Text as="h2" variant="headingSm">{card.name}</Text><StatusBadge status={setup ? card.status : 'inactive'} label={setup ? undefined : 'Not set up'}/></InlineStack>
              <Text as="p" tone="subdued">{card.description}</Text>
              <Text as="p" variant="bodySm" fontWeight="semibold">{setup ? num(overflow ? 123456789 : card.count) : '0'} {card.unit}</Text>
              <div><Button url={card.url}>{setup ? 'Manage' : 'Set up'}</Button></div>
            </BlockStack>
          </Card>;
        })}
      </InlineGrid>
    </BlockStack>
  </PageFrame>;
}
