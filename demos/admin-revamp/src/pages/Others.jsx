// Referrals and Customers in the revamp: same building blocks, shown so the new menu is clickable end to end.
import React from 'react';
import {Badge, BlockStack, Button, IndexTable, InlineStack, Page, Tabs, Text} from '@shopify/polaris';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {Row, Section} from '../components/parts.jsx';
import {MEMBERS} from '../data/index.js';
import {PHOTOS} from '../assets/index.js';
import {TIERS, num, tierById} from '../data/program.js';

export function Referrals() {
  const navigate = useNavigate();
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const header = {title: 'Loyalty program', titleMetadata: <Badge tone="success">Live</Badge>};
  if (state === 'loading') return <Page {...header}><LoadingView rows={8} /></Page>;
  if (state === 'error') return <Page {...header}><ErrorView title="Couldn't load referrals" onRetry={() => setState('default')}>Nothing was changed. Try again in a moment.</ErrorView></Page>;
  const open = what => notify(`${what} opens in a side panel in the next step of this prototype`);
  return (
    <Page {...header}>
      <div className="rv-wrap">
        <div className="rv-topline"><div className="rv-tabs"><Tabs tabs={[{id: 'points', content: 'Points & tiers'}, {id: 'referrals', content: 'Referrals'}]} selected={1} onSelect={i => i === 0 && navigate('/program')} /></div></div>
        <div className="rv-cols">
          <div className="rv-main">
            <Section title="Both people get a reward" id="ref-both">
              <Row icon="discount" label="Friend gets" value="$10 off their first order" onClick={() => open('Friend reward')} />
              <Row icon="gift" label="Customer who shared gets" value="500 points" hint="After the friend's order is paid" onClick={() => open('Referrer reward')} />
            </Section>
            <Section title="Rules" id="ref-rules">
              <Row label="Friend's minimum order" value="$40" onClick={() => open('Minimum order')} />
              <Row label="Rewards per customer" value="Up to 10 a month" onClick={() => open('Limit')} />
              <Row label="Block self-referrals" value="On" onClick={() => open('Fraud check')} />
            </Section>
          </div>
          <aside className="rv-side">
            <div className="rv-card rv-refimg">
              <img src={PHOTOS.referral} alt="Referral banner made by Joy AI: two friends sharing a gift" />
              <span className="rv-ai-tag">Made with Joy AI</span>
            </div>
            <div className="rv-card rv-pad">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">Last 30 days</Text>
                <Text as="p"><strong>{num(126)}</strong> friends ordered · <strong>$9,870</strong> in first orders</Text>
                <Button onClick={() => notify('Referral report opens here')}>View report</Button>
              </BlockStack>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}

export function Customers() {
  const {query} = useRoute();
  const tierId = query.get('tier');
  const rows = MEMBERS.map((m, i) => ({...m, tierId: TIERS[Math.min(i + 1, TIERS.length - 1)].id}));
  const list = tierId ? rows.filter(r => r.tierId === tierId) : rows;
  return (
    <Page title="Customers" subtitle={tierId ? `${tierById(tierId).name} members` : 'Everyone in your program'} backAction={tierId ? {content: 'Program', url: `/program?tier=${tierId}`} : undefined}>
      <div className="rv-card">
        <IndexTable resourceName={{singular: 'customer', plural: 'customers'}} itemCount={list.length} selectable={false}
          headings={[{title: 'Customer'}, {title: 'Tier'}, {title: 'Points', alignment: 'end'}]}>
          {list.map((m, i) => (
            <IndexTable.Row id={m.id} key={m.id} position={i}>
              <IndexTable.Cell><BlockStack gap="050"><Text as="span" fontWeight="medium">{m.name}</Text><Text as="span" tone="subdued">{m.email}</Text></BlockStack></IndexTable.Cell>
              <IndexTable.Cell><Badge>{tierById(m.tierId).name}</Badge></IndexTable.Cell>
              <IndexTable.Cell><InlineStack align="end"><Text as="span" numeric>{num(m.points)}</Text></InlineStack></IndexTable.Cell>
            </IndexTable.Row>
          ))}
        </IndexTable>
      </div>
    </Page>
  );
}
