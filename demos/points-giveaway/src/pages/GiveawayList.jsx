// #/points-giveaway: every giveaway with its status, who, points, dates and how many used them. Empty shop: Joy's empty state.
import React from 'react';
import {BlockStack, Card, EmptyState, IndexTable, Link, Page, Text} from '@shopify/polaris';
import {num, pctLabel} from '../data/index.js';
import {isGiven, recipientsOf, resultsOf, useBy} from '../data/giveaways.js';
import {dateTime, weekday} from '../data/time.js';
import {useNavigate} from '../shell/router.jsx';
import {useStore} from '../state/store.jsx';
import {StatusBadge} from '../components/bits.jsx';
import {whoLine} from './giveawayParts.jsx';

function starts(g) {
  if (g.givenAt) return dateTime(g.givenAt);
  if (g.start?.mode === 'schedule' && g.start?.at) return dateTime(g.start.at);
  return '—';
}

export default function GiveawayList() {
  const navigate = useNavigate();
  const {giveaways, deleted, ledger} = useStore();
  const create = () => navigate('/points-giveaway/new');

  if (giveaways.length === 0) {
    return (
      <Page title="Points Giveaway" backAction={{content: 'Membership', url: '/membership'}}>
        <Card>
          <EmptyState
            heading="No giveaways yet"
            action={{content: 'Create giveaway', onAction: create}}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Give a group of members points. Joy adds them and emails each member.</p>
          </EmptyState>
        </Card>
      </Page>
    );
  }

  const rows = giveaways.map((g, i) => {
    const given = isGiven(g);
    const count = given ? recipientsOf(g).length : recipientsOf(g, deleted, ledger.balance).length;
    const r = given ? resultsOf(g, ledger.usage(g.id)) : null;
    const end = useBy(g);
    return (
      <IndexTable.Row id={g.id} key={g.id} position={i} onClick={() => navigate(`/points-giveaway/${g.id}`)}>
        <IndexTable.Cell>
          <BlockStack gap="050">
            <Link removeUnderline monochrome url={`/points-giveaway/${g.id}`} dataPrimaryLink>
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {g.name}
              </Text>
            </Link>
            <Text as="span" variant="bodySm" tone="subdued">
              {whoLine(g)}
            </Text>
          </BlockStack>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <StatusBadge status={g.status} />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric tone={!given && count === 0 ? 'critical' : undefined}>
            {num(count)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {num(g.points)}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{starts(g)}</IndexTable.Cell>
        <IndexTable.Cell>{!end ? 'Never expire' : given || g.start?.mode === 'schedule' ? weekday(end) : `${g.expiry.days} days after start`}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {r ? pctLabel(r.used, r.members) : '—'}
          </Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    );
  });

  return (
    <Page title="Points Giveaway" backAction={{content: 'Membership', url: '/membership'}} primaryAction={{content: 'Create giveaway', onAction: create}}>
      <Card padding="0">
        <IndexTable
          resourceName={{singular: 'giveaway', plural: 'giveaways'}}
          itemCount={giveaways.length}
          selectable={false}
          headings={[
            {title: 'Giveaway'},
            {title: 'Status'},
            {title: 'Members', alignment: 'end'},
            {title: 'Points each', alignment: 'end'},
            {title: 'Starts'},
            {title: 'Use by'},
            {title: 'Used', alignment: 'end'},
          ]}
        >
          {rows}
        </IndexTable>
      </Card>
    </Page>
  );
}
