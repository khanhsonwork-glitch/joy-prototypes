// #/customers and #/customers/maya-chen: where the merchant sees the giveaway line in a member's points activity.
import React from 'react';
import {Badge, BlockStack, Card, IndexTable, Layout, Link, Page, Text} from '@shopify/polaris';
import {MEMBERS} from '../data/members.js';
import {num} from '../data/index.js';
import {PEOPLE} from '../data/people.js';
import {useBy} from '../data/giveaways.js';
import {clock, day} from '../data/time.js';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useStore} from '../state/store.jsx';

function CustomerList() {
  const navigate = useNavigate();
  const {ledger} = useStore();
  const list = MEMBERS.slice(0, 12);
  return (
    <Page title="Customers" subtitle="Members of your loyalty program">
      <Card padding="0">
        <IndexTable
          resourceName={{singular: 'customer', plural: 'customers'}}
          itemCount={list.length}
          selectable={false}
          headings={[{title: 'Customer'}, {title: 'VIP tier'}, {title: 'Points', alignment: 'end'}]}
        >
          {list.map((m, i) => (
            <IndexTable.Row id={m.id} key={m.id} position={i} onClick={i === 0 ? () => navigate('/customers/maya-chen') : undefined}>
              <IndexTable.Cell>
                <BlockStack gap="050">
                  {i === 0 ? (
                    <Link url="/customers/maya-chen" removeUnderline monochrome dataPrimaryLink>
                      <Text as="span" fontWeight="semibold">
                        {m.name}
                      </Text>
                    </Link>
                  ) : (
                    <Text as="span" fontWeight="semibold">
                      {m.name}
                    </Text>
                  )}
                  <Text as="span" variant="bodySm" tone="subdued">
                    {m.email}
                  </Text>
                </BlockStack>
              </IndexTable.Cell>
              <IndexTable.Cell>{m.tier}</IndexTable.Cell>
              <IndexTable.Cell>
                <Text as="span" alignment="end" numeric>
                  {num(ledger.balance(m))}
                </Text>
              </IndexTable.Cell>
            </IndexTable.Row>
          ))}
        </IndexTable>
      </Card>
    </Page>
  );
}

function MayaPage() {
  const {ledger} = useStore();
  const p = PEOPLE.maya;
  // the same replay as her storefront: giveaways that reached her, what she redeemed and ordered today, then her own history
  const {lots, state} = ledger.person('maya');
  const rows = [...state.history, ...p.history];
  const balance = state.balance;
  const soonest = lots
    .filter((l) => l.end && (state.left[l.id] || 0) > 0)
    .sort((a, b) => a.end - b.end)
    .map((l) => ({points: state.left[l.id], expires: useBy(l.g)}))[0];
  return (
    <Page title={p.name} subtitle={p.email} backAction={{content: 'Customers', url: '/customers'}}>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <div className="pg-card-head">
              <Text as="h2" variant="headingMd">
                Points activity
              </Text>
            </div>
            <IndexTable
              resourceName={{singular: 'activity', plural: 'activities'}}
              itemCount={rows.length}
              selectable={false}
              headings={[{title: 'Activity'}, {title: 'Date (ET)'}, {title: 'Expires on'}, {title: 'Points', alignment: 'end'}]}
            >
              {rows.map((h, i) => (
                <IndexTable.Row id={`h${i}`} key={`${h.label}-${i}`} position={i}>
                  <IndexTable.Cell>{h.label}</IndexTable.Cell>
                  <IndexTable.Cell>{`${day(h.at)}, ${clock(h.at)}`}</IndexTable.Cell>
                  <IndexTable.Cell>
                    {/* the amber badge only while some of those points are still there to expire */}
                    {!h.expires ? (
                      <Text as="span" tone="subdued">
                        —
                      </Text>
                    ) : (state.left[h.lotId] || 0) > 0 ? (
                      <Badge tone="attention">{day(h.expires)}</Badge>
                    ) : (
                      <Text as="span" tone="subdued">
                        {day(h.expires)}
                      </Text>
                    )}
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    <Text as="span" alignment="end" numeric tone={h.points > 0 ? 'success' : undefined}>
                      {h.points > 0 ? `+${num(h.points)}` : `−${num(-h.points)}`}
                    </Text>
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Points balance
              </Text>
              <Text as="p" variant="heading2xl">
                {num(balance)}
              </Text>
              {soonest ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  {`${num(soonest.points)} points expire on ${day(soonest.expires)}`}
                </Text>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default function CustomersPage() {
  const route = useRoute();
  return route.segments[1] === 'maya-chen' ? <MayaPage /> : <CustomerList />;
}
