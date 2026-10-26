// List screen: page header, banner, tabs, search, table, pagination, and all screen states.
// Replace "rewards" with the feature you are prototyping; keep the structure.
import React, {useMemo, useState} from 'react';
import {Badge, Banner, BlockStack, Card, EmptySearchResult, IndexTable, InlineStack, Link, Page, Tabs, Text, TextField, useBreakpoints} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useRewards} from '../state/rewards.jsx';
import {dateLabel, num, pointsLabel, typeLabel} from '../data/index.js';

const PAGE_SIZE = 10;
const TABS = [
  {id: 'all', content: 'All'},
  {id: 'active', content: 'Active'},
  {id: 'draft', content: 'Draft'},
];

export function StatusBadge({status}) {
  return status === 'active' ? <Badge tone="success">Active</Badge> : <Badge>Draft</Badge>;
}

export function RewardsList() {
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const {rewards} = useRewards();
  const {smDown} = useBreakpoints();
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [tipOpen, setTipOpen] = useState(true);
  const locked = state === 'disabled';

  const counts = useMemo(() => ({
    all: rewards.length,
    active: rewards.filter((r) => r.status === 'active').length,
    draft: rewards.filter((r) => r.status === 'draft').length,
  }), [rewards]);
  const filtered = useMemo(() => {
    const status = TABS[tab].id;
    const needle = query.trim().toLowerCase();
    return rewards.filter((r) => (status === 'all' || r.status === status) && (!needle || r.name.toLowerCase().includes(needle)));
  }, [rewards, tab, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const header = {
    title: 'Rewards',
    subtitle: 'What members can spend their points on',
    // A disabled action must not stay a live link.
    primaryAction: {content: 'Create reward', url: locked || state === 'loading' ? undefined : '/demo/new', disabled: locked || state === 'loading'},
    secondaryActions: [{
      content: 'Export',
      disabled: locked || state === 'loading' || state === 'error' || !rewards.length,
      onAction: () => notify(`Exported ${num(filtered.length)} rewards to CSV`),
    }],
  };

  if (state === 'loading') {
    return <Page {...header}><LoadingView rows={8} /></Page>;
  }
  if (state === 'error') {
    return (
      <Page {...header}>
        <ErrorView title="Couldn't load rewards" onRetry={() => setState('default')}>
          Joy couldn't reach your rewards just now. Nothing was changed. Try again in a moment.
        </ErrorView>
      </Page>
    );
  }
  if (!rewards.length) {
    return (
      <Page {...header}>
        <Card>
          <EmptyView
            heading="Create your first reward"
            action={{content: 'Create reward', url: locked ? undefined : '/demo/new', disabled: locked}}
          >
            Rewards turn points into discounts, free shipping or free products. Members see them in the loyalty widget.
          </EmptyView>
        </Card>
      </Page>
    );
  }

  // Phones get one stacked cell per row (Polaris condensed mode), desktops get the columns.
  const rows = smDown ? visible.map((r, index) => (
    <IndexTable.Row id={r.id} key={r.id} position={index}>
      <div className="kit-row-stack">
        <span className="kit-wrap"><Link dataPrimaryLink url={`/demo/${r.id}`} monochrome removeUnderline><Text as="span" fontWeight="semibold">{r.name}</Text></Link></span>
        <InlineStack gap="200" blockAlign="center" wrap>
          <StatusBadge status={r.status} />
          <Text as="span" tone="subdued">{typeLabel(r.type)} · {pointsLabel(r.points)} · {num(r.redemptions)} redeemed</Text>
        </InlineStack>
      </div>
    </IndexTable.Row>
  )) : visible.map((r, index) => (
    <IndexTable.Row id={r.id} key={r.id} position={index}>
      <IndexTable.Cell>
        {/* The row opens through this link, so keyboard users reach every row with Tab. */}
        <span className="kit-wrap"><Link dataPrimaryLink url={`/demo/${r.id}`} monochrome removeUnderline><Text as="span" fontWeight="semibold">{r.name}</Text></Link></span>
      </IndexTable.Cell>
      <IndexTable.Cell>{typeLabel(r.type)}</IndexTable.Cell>
      <IndexTable.Cell><Text as="span" alignment="end" numeric>{num(r.points)}</Text></IndexTable.Cell>
      <IndexTable.Cell><Text as="span" alignment="end" numeric>{num(r.redemptions)}</Text></IndexTable.Cell>
      <IndexTable.Cell><StatusBadge status={r.status} /></IndexTable.Cell>
      <IndexTable.Cell>{dateLabel(r.updated)}</IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page {...header}>
      <BlockStack gap="400">
        {state === 'worst' ? (
          <Banner tone="critical" title="2 rewards failed to sync to Shopify discounts">
            <p>Members can't redeem them until the sync works. Joy retries every 15 minutes.</p>
          </Banner>
        ) : null}
        {locked ? (
          <Banner tone="warning" title="Editing rewards needs the Advanced plan" action={{content: 'Upgrade plan', onAction: () => notify('Prototype: Advanced plan selected. No billing changes were made.')}}>
            <p>You can still see every reward and its redemptions.</p>
          </Banner>
        ) : null}
        {tipOpen && state === 'default' ? (
          <Banner tone="info" onDismiss={() => setTipOpen(false)}>
            <p>Only active rewards appear in the loyalty widget. Drafts stay hidden until you activate them.</p>
          </Banner>
        ) : null}
        <Card padding="0">
          <Tabs
            tabs={TABS.map((t) => ({...t, content: `${t.content} (${num(counts[t.id])})`, accessibilityLabel: `${t.content} rewards`}))}
            selected={tab}
            onSelect={(next) => {
              setTab(next);
              setPage(0);
            }}
          />
          <div className="kit-search">
            <TextField
              label="Search rewards"
              labelHidden
              placeholder="Search by reward name"
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(0);
              }}
              clearButton
              onClearButtonClick={() => setQuery('')}
              autoComplete="off"
            />
          </div>
          <IndexTable
            condensed={smDown}
            resourceName={{singular: 'reward', plural: 'rewards'}}
            itemCount={visible.length}
            selectable={false}
            emptyState={
              <EmptySearchResult title="No rewards match" description="Try another name, or clear the search to see every reward." withIllustration={false} />
            }
            headings={[
              {title: 'Reward'},
              {title: 'Type'},
              {title: 'Points', alignment: 'end'},
              {title: 'Redemptions', alignment: 'end'},
              {title: 'Status'},
              {title: 'Updated'},
            ]}
            pagination={pages > 1 ? {
              hasPrevious: current > 0,
              hasNext: current < pages - 1,
              onPrevious: () => setPage(current - 1),
              onNext: () => setPage(current + 1),
              label: `${num(current * PAGE_SIZE + 1)}–${num(current * PAGE_SIZE + visible.length)} of ${num(filtered.length)}`,
            } : undefined}
          >
            {rows}
          </IndexTable>
        </Card>
      </BlockStack>
    </Page>
  );
}
