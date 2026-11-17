// Reward programs, as the Joy admin draws it (pages/Program/Program.js): header with Live mode, tabs, a search card,
// then the tab's blocks. Redeeming = RedeemProgram.js + RenderListPrograms.js; its "Add more" on Discount program
// opens "Add new redeem program" (ModalContent). Earning = TablePrograms blocks. Referrals = Referral.js.
import React, {useMemo, useState} from 'react';
import {
  Badge, BlockStack, Box, Button, Card, Divider, Icon, IndexTable, InlineStack, Link, Modal, Page, Tabs, Text, TextField, useBreakpoints,
} from '@shopify/polaris';
import {
  CashDollarIcon, DiscountIcon, EditIcon, EmailIcon, GiftCardIcon, InfoIcon, MenuHorizontalIcon, NatureIcon, OrderIcon, PersonAddIcon,
  ProductIcon, SearchIcon,
} from '@shopify/polaris-icons';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario, useShop} from '../kit/scenario.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {PlanBadge} from '../components/PlanBadge.jsx';
import {useUpgrade} from '../components/UpgradeDialog.jsx';
import {useStore} from '../state/store.jsx';
import {FRIEND_METHODS, REDEEM_OPTIONS, REFERRER_METHODS, earningData, methodLabel, redeemData} from '../data/programs.js';

// Tabs of Reward programs (const/option.js optionPrograms). This prototype builds Earning, Redeeming and Referrals.
const TABS = [
  {id: 'earning', label: 'Earning programs', path: '/earning'},
  {id: 'redeem', label: 'Redeeming programs', path: '/redeem'},
  {id: 'referral', label: 'Referrals', path: '/referral'},
  {id: 'milestone', label: 'Milestones', path: '/milestones', other: true},
  {id: 'quest', label: 'Quizzes', path: '/quizzes', other: true},
  {id: 'point_expiration', label: 'Point expiration', path: '/point-expiration', other: true},
  {id: 'joySubscription', label: 'Subscription and Membership', path: '/subscription-membership', other: true},
];
const TAB_BY_ROUTE = Object.fromEntries(TABS.map((t) => [t.path.slice(1), t.id]));

const ICONS = {money: CashDollarIcon, percent: DiscountIcon, product: ProductIcon, 'gift-card': GiftCardIcon, leaf: NatureIcon, order: OrderIcon, person: PersonAddIcon, email: EmailIcon};

export function ProgramIcon({name}) {
  return <span className="scg-icon-box" aria-hidden="true"><Icon source={ICONS[name] || CashDollarIcon} tone="base" /></span>;
}

function StatusBadge({status}) {
  if (status === 'active') return <Badge tone="success">Active</Badge>;
  if (status === 'draft') return <Badge tone="info">Draft</Badge>;
  return <Badge>Inactive</Badge>;
}

/** Page frame shared by every tab: title, Live mode switch, subtitle, More actions, tabs. */
function ProgramsFrame({tab, children}) {
  const {notYet} = useShell();
  const navigate = useNavigate();
  const [live, setLive] = useState(true);
  return (
    <Page
      title="Reward programs"
      titleMetadata={(
        <InlineStack gap="200" blockAlign="center" wrap={false}>
          <button type="button" className="scg-switch" role="switch" aria-checked={live} aria-label="Live mode" onClick={() => setLive((v) => !v)}><span /></button>
          <Badge tone={live ? 'success' : undefined}>{live ? 'Live mode' : 'Test mode'}</Badge>
        </InlineStack>
      )}
      subtitle="Turn buyers into loyal customers with automatic rewards. Engage instantly with creative earning and spending rules."
      actionGroups={[{title: 'More actions', actions: [{content: 'Preview on storefront', onAction: notYet}]}]}
    >
      <BlockStack gap="400">
        <Tabs
          tabs={TABS.map((t) => ({id: `tab-${t.id}`, content: t.label}))}
          selected={Math.max(0, TABS.findIndex((t) => t.id === tab))}
          onSelect={(i) => navigate(TABS[i].path)}
        />
        {children}
      </BlockStack>
    </Page>
  );
}

function SearchCard({value, onChange}) {
  return (
    <Card>
      <TextField
        label="Search program"
        value={value}
        onChange={onChange}
        placeholder="Enter program ID or title to search"
        prefix={<Icon source={SearchIcon} tone="subdued" />}
        autoComplete="off"
        clearButton
        onClearButtonClick={() => onChange('')}
      />
    </Card>
  );
}

// ---------------------------------------------------------------- Redeeming programs

/** One program row of a redeem block: icon, title (type) status, description, then info / more / Turn on-off. */
function RedeemRow({row}) {
  const {notYet} = useShell();
  const [status, setStatus] = useState(row.status);
  const on = status === 'active';
  return (
    <div className="scg-redeem-row">
      <ProgramIcon name={row.icon} />
      <div className="scg-redeem-row__text">
        <div className="scg-redeem-row__title">
          <Text as="span" fontWeight="semibold" breakWord>{row.title}</Text>
          <Text as="span" tone="subdued">{`(${row.type})`}</Text>
          <StatusBadge status={status} />
        </div>
        <Text as="p" breakWord>{row.desc}</Text>
      </div>
      <div className="scg-redeem-row__actions">
        <Button variant="tertiary" icon={InfoIcon} accessibilityLabel={`About ${row.title}`} onClick={notYet} />
        <Button icon={MenuHorizontalIcon} accessibilityLabel={`More actions for ${row.title}`} onClick={notYet} />
        <Button onClick={() => setStatus(on ? 'inactive' : 'active')}>{on ? 'Turn off' : 'Turn on'}</Button>
      </div>
    </div>
  );
}

/** A redeem block (RenderListPrograms): heading (+ plan badge when gated), help text, rows, Add more (disabled when gated). */
function RedeemBlock({heading, help, rows = [], gated, learnMore = false, onAddMore}) {
  const {notYet} = useShell();
  return (
    <Card>
      <BlockStack gap="200">
        <BlockStack gap="100">
          <div className="scg-label-row">
            <Text as="h2" variant="headingSm">{heading}</Text>
            {gated ? <PlanBadge /> : null}
          </div>
          <Text as="p" tone="subdued">{help}{learnMore ? <>{help.endsWith('.') ? ' ' : '. '}<Link onClick={notYet}>Learn more</Link></> : null}</Text>
        </BlockStack>
        {rows.map((row, i) => (
          <React.Fragment key={row.id}>
            {i > 0 ? <Divider /> : null}
            <Box paddingBlock="200"><RedeemRow row={row} /></Box>
          </React.Fragment>
        ))}
        <Box paddingBlockStart="200">
          <Button onClick={onAddMore} disabled={gated}>Add more</Button>
        </Box>
      </BlockStack>
    </Card>
  );
}

/** "Add new redeem program": one clickable row per option; a gated row closes this modal and opens the upgrade dialog
 * (ModalContent: closeModal() then openPricingModal()). */
function AddRedeemModal({open, onClose}) {
  const navigate = useNavigate();
  const {openUpgrade} = useUpgrade();
  const shop = useShop();
  const gated = (o) => (o.proPlan && !shop.isPremium) || (o.storeCredit && shop.storeCreditLocked);
  return (
    <Modal open={open} onClose={onClose} title="Add new redeem program">
      <div className="scg-option-list" role="list">
        {REDEEM_OPTIONS.map((o, i) => (
          <React.Fragment key={o.slug}>
            {i > 0 ? <Divider /> : null}
            <div role="listitem">
              <button
                type="button"
                className="scg-option"
                data-option={o.slug}
                aria-label={gated(o) ? `${o.title}. Available on Essential. Upgrade` : o.title}
                onClick={() => {
                  if (!gated(o)) {navigate(`/redeem-new/${o.slug}`); return;}
                  onClose();
                  openUpgrade();
                }}
              >
                <ProgramIcon name={o.icon} />
                <span className="scg-option__text">
                  <span className="scg-label-row">
                    <Text as="span" fontWeight="semibold">{o.title}</Text>
                    {gated(o) ? <PlanBadge decorative /> : null}
                  </span>
                  <Text as="span">{o.subtitle}</Text>
                </span>
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </Modal>
  );
}

function RedeemTab({modalOpen}) {
  const navigate = useNavigate();
  const shop = useShop();
  const {setState} = useScenario();
  const [query, setQuery] = useState('');
  const data = useMemo(() => redeemData(shop), [shop.state]);
  const match = (rows) => rows.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()) || r.id === query);
  const paidGate = !shop.isPremium;

  if (shop.state === 'loading') return <><LoadingView rows={6} /><LoadingView rows={3} /></>;
  if (shop.state === 'error') {
    return (
      <ErrorView title="Couldn't load your redeem programs" onRetry={() => setState('free-new')}>
        Nothing was changed. Customers can still redeem points while this page reloads.
      </ErrorView>
    );
  }
  return (
    <>
      <SearchCard value={query} onChange={setQuery} />
      <RedeemBlock
        heading="Discount program"
        help="Create programs that allow customers to redeem points for discounts"
        rows={match(data.discount)}
        learnMore
        onAddMore={() => navigate('/redeem-add')}
      />
      {/* Store credit program: Add more skips the plan check today. New Free shops get the paid-block treatment. */}
      <RedeemBlock
        heading="Store credit program"
        help="Let customers redeem points for store credit they can spend on any order."
        rows={match(data.storeCredit)}
        gated={shop.storeCreditLocked}
        onAddMore={() => navigate('/redeem-new/store-credit')}
      />
      <RedeemBlock heading="Environmental impact program" help="Let customers redeem points to fund environmental impact projects" gated={paidGate} onAddMore={() => navigate('/redeem-new/environmental-impact')} />
      <RedeemBlock heading="Free gift program" help="Create programs that allow customers to redeem points for free products" gated={paidGate} learnMore onAddMore={() => navigate('/redeem-new/free-product')} />
      <RedeemBlock heading="Free shipping program" help="Create programs that allow customers to redeem points for free shipping" gated={paidGate} learnMore onAddMore={() => navigate('/redeem-new/free-shipping')} />
      <RedeemBlock heading="Gift card program" help="Create programs that allow customers to redeem points for a Shopify gift card." gated={paidGate} learnMore onAddMore={() => navigate('/redeem-new/gift-card')} />
      <AddRedeemModal open={modalOpen} onClose={() => navigate('/redeem')} />
    </>
  );
}

// ---------------------------------------------------------------- Earning programs

function EarningBlock({heading, rows, priority}) {
  const {smDown} = useBreakpoints();
  const headings = [{title: 'Program name'}, {title: 'Event'}, {title: 'Reward'}, ...(priority ? [{title: 'Priority'}] : []), {title: 'Start date'}, {title: 'End date'}, {title: 'Status'}];
  const name = (r) => (
    <InlineStack gap="300" blockAlign="center" wrap={false}>
      <ProgramIcon name={r.icon} />
      <span className="kit-wrap"><Link dataPrimaryLink url={r.route} monochrome removeUnderline><Text as="span" fontWeight="semibold">{r.title}</Text></Link></span>
    </InlineStack>
  );
  return (
    <Card padding="0">
      <Box padding="400" paddingBlockEnd="200"><Text as="h2" variant="headingSm">{heading}</Text></Box>
      {rows.length === 0 ? (
        <EmptyView heading={`No ${heading.toLowerCase()} yet`}>Programs you create show here.</EmptyView>
      ) : (
        <IndexTable
          resourceName={{singular: 'program', plural: 'programs'}}
          itemCount={rows.length}
          selectable={false}
          condensed={smDown}
          headings={headings}
        >
          {rows.map((r, index) => (smDown ? (
            <IndexTable.Row id={r.id} key={r.id} position={index}>
              <div className="kit-row-stack">
                {name(r)}
                <Text as="span" tone="subdued">{`${r.event} · ${r.reward}`}</Text>
                <span><StatusBadge status={r.status} /></span>
              </div>
            </IndexTable.Row>
          ) : (
            <IndexTable.Row id={r.id} key={r.id} position={index}>
              <IndexTable.Cell>{name(r)}</IndexTable.Cell>
              <IndexTable.Cell>{r.event}</IndexTable.Cell>
              <IndexTable.Cell><span className="kit-wrap">{r.reward}</span></IndexTable.Cell>
              {priority ? <IndexTable.Cell>{r.priority}</IndexTable.Cell> : null}
              <IndexTable.Cell>{r.start}</IndexTable.Cell>
              <IndexTable.Cell>{r.end}</IndexTable.Cell>
              <IndexTable.Cell><StatusBadge status={r.status} /></IndexTable.Cell>
            </IndexTable.Row>
          )))}
        </IndexTable>
      )}
    </Card>
  );
}

function EarningTab() {
  const shop = useShop();
  const {setState} = useScenario();
  const [query, setQuery] = useState('');
  const data = useMemo(() => earningData(shop), [shop.state]);
  const match = (rows) => rows.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()));
  if (shop.state === 'loading') return <><LoadingView rows={5} /><LoadingView rows={5} /></>;
  if (shop.state === 'error') {
    return (
      <ErrorView title="Couldn't load your earning programs" onRetry={() => setState('free-new')}>
        Nothing was changed. Customers keep earning while this page reloads.
      </ErrorView>
    );
  }
  return (
    <>
      <SearchCard value={query} onChange={setQuery} />
      <EarningBlock heading="Purchase rewards" rows={match(data.purchase)} priority />
      <EarningBlock heading="Engagement rewards" rows={match(data.engagement)} />
    </>
  );
}

// ---------------------------------------------------------------- Referrals

function RewardRow({title, summary, redeemed, url}) {
  return (
    <InlineStack align="space-between" blockAlign="center" gap="300" wrap={false}>
      <BlockStack gap="100">
        <Text variant="bodyMd" as="span" fontWeight="semibold">{title}</Text>
        <Text as="p" breakWord>{summary}</Text>
        <span><Badge>{`${redeemed} redeemed`}</Badge></span>
      </BlockStack>
      <Button icon={EditIcon} variant="plain" url={url} accessibilityLabel={`Edit ${title.toLowerCase()}`} />
    </InlineStack>
  );
}

const summary = (list, method, value) => {
  const label = methodLabel(list, method);
  if (method === 'percentage') return `${label}: ${value}% off`;
  if (method === 'fixed_amount') return `${label}: $${value} off`;
  if (method === 'store_credit_fixed') return `${label}: $${value}`;
  if (method === 'store_credit_order_value') return `${label.replace(' (Recommend)', '')}: ${value}% of the first order`;
  if (method === 'point_order_value') return `${label}: ${value} points per $1`;
  return `${label}: ${value} points`;
};

function ReferralTab() {
  const {notYet} = useShell();
  const shop = useShop();
  const {setState} = useScenario();
  const {data} = useStore();
  const [on, setOn] = useState(true);
  if (shop.state === 'loading') return <LoadingView rows={8} />;
  if (shop.state === 'error') {
    return (
      <ErrorView title="Couldn't load your referral program" onRetry={() => setState('free-new')}>
        Nothing was changed. Your referral program keeps running while this page reloads.
      </ErrorView>
    );
  }
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="start" gap="300" wrap={false}>
          <BlockStack gap="100">
            <InlineStack gap="200" align="start" blockAlign="center">
              <Text as="h2" variant="headingMd">Referral program</Text>
              <Badge tone={on ? 'success' : undefined}>{on ? 'On' : 'Off'}</Badge>
            </InlineStack>
            <Text as="p">Expand your customer network and reward loyal customers for referring friends. <Link onClick={notYet}>Learn more</Link></Text>
          </BlockStack>
          <Button onClick={() => setOn((v) => !v)}>{on ? 'Turn off' : 'Turn on'}</Button>
        </InlineStack>
        <Box borderWidth="025" borderColor="border" borderRadius="200" padding="400">
          <BlockStack gap="300">
            <RewardRow title="Rewards for referrers" summary={summary(REFERRER_METHODS, data.referrer.method, data.referrer.value)} redeemed={128} url="/referral-reward" />
            <Divider />
            <RewardRow title="Rewards for referees" summary={summary(FRIEND_METHODS, data.friend.method, data.friend.value)} redeemed={341} url="/referral-friend-reward" />
          </BlockStack>
        </Box>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------- page

/** Tabs this prototype does not redraw: say so instead of a dead tab, and name the store credit choices there. */
function OtherTab({tab}) {
  const navigate = useNavigate();
  const label = TABS.find((t) => t.id === tab).label;
  const note = tab === 'milestone'
    ? 'Milestone rewards can pay store credit too; on a new Free shop that choice gets the same “Available on Essential” badge as the earning and referral pages. This tab is not redrawn in the prototype.'
    : `The ${label} tab does not change with this feature and is not redrawn in the prototype.`;
  return (
    <div className="scg-proto-note" role="note">
      <p>{`Prototype · ${note}`}</p>
      <Button onClick={() => navigate('/redeem')}>Open Redeeming programs</Button>
    </div>
  );
}

export function ProgramsPage() {
  const {segments} = useRoute();
  const route = segments[0];
  const tab = route === 'redeem-add' ? 'redeem' : TAB_BY_ROUTE[route];
  const other = TABS.find((t) => t.id === tab)?.other;
  return (
    <ProgramsFrame tab={tab}>
      {tab === 'earning' ? <EarningTab /> : null}
      {tab === 'redeem' ? <RedeemTab modalOpen={route === 'redeem-add'} /> : null}
      {tab === 'referral' ? <ReferralTab /> : null}
      {other ? <OtherTab tab={tab} /> : null}
    </ProgramsFrame>
  );
}
