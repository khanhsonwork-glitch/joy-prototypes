// #/customer — Joy › Customers › a customer (real: pages/Customer/Edit.js on avada/master).
// Left: stats, Overview, Referrals, Activities. Right: Points | Store credit card, Tags, Notes.
// Only the Store credit tab and the Adjust store credit modal change; the rest is the page as it is today.
import React, {useEffect, useState} from 'react';
import {
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Icon,
  InlineGrid,
  InlineStack,
  Layout,
  LegacyCard,
  LegacyTabs,
  Page,
  SkeletonBodyText,
  Tag,
  Text,
  TextField,
  Tooltip,
} from '@shopify/polaris';
import {EditIcon, InfoIcon, PersonFilledIcon, RefreshIcon} from '@shopify/polaris-icons';
import {CUSTOMERS, STORE} from '../data/index.js';
import {shopMoney} from '../data/currency.js';
import {useScenario} from '../kit/scenario.jsx';
import {useRoute} from '../shell/router.jsx';
import {useAppTitle, useShell} from '../shell/ShellContext.jsx';
import {BalanceCard} from './BalanceCard.jsx';

const clone = (o) => JSON.parse(JSON.stringify(o));
const hashQuery = () => new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));

/** Keep ?modal=adjust in the address bar while the modal is open, so the link can be shared on that state. */
function writeModalParam(open) {
  const [path, ...rest] = window.location.hash.replace(/^#/, '').split('?');
  const query = new URLSearchParams(rest.join('?'));
  if (open) query.set('modal', 'adjust');
  else query.delete('modal');
  const q = query.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${path || '/customer'}${q ? `?${q}` : ''}`);
}

/** Hand-drawn crown for "Membership details" (Joy uses its own icon there; Polaris has none). */
function CrownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M3 6.5l3.6 3L10 4l3.4 5.5L17 6.5 15.6 14H4.4L3 6.5z" fill="var(--p-color-icon)" />
      <rect x="4.4" y="15" width="11.2" height="1.6" rx="0.8" fill="var(--p-color-icon)" />
    </svg>
  );
}

function StatsSummary({customer, loading}) {
  const items = [
    ['Average order value', shopMoney(customer?.stats.aov, STORE.currency)],
    ['Lifetime value', shopMoney(customer?.stats.ltv, STORE.currency)],
    ['Orders', String(customer?.stats.orders ?? '')],
    ['RFM group', customer?.stats.rfm || ''],
  ];
  return (
    <Card padding="0">
      {loading ? (
        <Box padding="400">
          <SkeletonBodyText lines={3} />
        </Box>
      ) : (
        <div className="cd-stats">
          {items.map(([label, value]) => (
            <div key={label} className="cd-stats__item">
              <BlockStack gap="100">
                <InlineStack align="start">
                  <span className="cd-stats__label">
                    <Text as="h2" variant="headingSm">
                      {label}
                    </Text>
                  </span>
                </InlineStack>
                <Text as="p" variant="bodyMd" fontWeight="bold">
                  {value}
                </Text>
              </BlockStack>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Row({label, children}) {
  return (
    <InlineStack align="space-between" blockAlign="center" gap="200">
      <Text as="span">{label}:</Text>
      {typeof children === 'string' ? <Text as="span">{children}</Text> : children}
    </InlineStack>
  );
}

function Overview({customer, loading}) {
  const {notYet} = useShell();
  return (
    <LegacyCard sectioned>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingSm">
            Overview
          </Text>
          <Button onClick={notYet} variant="monochromePlain" icon={EditIcon} accessibilityLabel="Edit overview" />
        </InlineStack>
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <span className="cd-icon">
              <Icon source={PersonFilledIcon} />
            </span>
            <Text as="p">Personal information</Text>
          </InlineStack>
          {loading ? (
            <SkeletonBodyText lines={5} />
          ) : (
            <BlockStack gap="200">
              <Row label="Email">{customer.email}</Row>
              <Row label="Name">{customer.name}</Row>
              <Row label="Phone number">{customer.phone}</Row>
              <Row label="Birthday">{''}</Row>
              <Row label="Last order date">{customer.lastOrder}</Row>
              <Row label="Marketing">
                <InlineStack gap="100">
                  <Badge tone="success">Email</Badge>
                  <Badge>SMS</Badge>
                </InlineStack>
              </Row>
              <Row label="Locale">{customer.locale}</Row>
            </BlockStack>
          )}
        </BlockStack>
        <BlockStack gap="200">
          <InlineStack gap="200" blockAlign="center">
            <CrownIcon />
            <Text as="p">Membership details</Text>
          </InlineStack>
          {loading ? (
            <SkeletonBodyText lines={5} />
          ) : (
            <BlockStack gap="200">
              <Row label="Type">
                <Badge tone="success">Member</Badge>
              </Row>
              <Row label="Customer since">{customer.since}</Row>
              <Row label="Default country">
                <InlineStack gap="100" blockAlign="center">
                  <Text as="span">{customer.country}</Text>
                  <Tooltip width="wide" content="The customer's country, detected from their default address (or storefront region on visit). Used to prefix their referral link with the matching market, e.g. /fr — so referred friends land on the right regional storefront.">
                    <Icon source={InfoIcon} tone="subdued" />
                  </Tooltip>
                </InlineStack>
              </Row>
            </BlockStack>
          )}
        </BlockStack>
      </BlockStack>
    </LegacyCard>
  );
}

function Referrals({loading}) {
  const {notYet} = useShell();
  if (loading) {
    return (
      <LegacyCard title="Referrals" sectioned>
        <SkeletonBodyText lines={3} />
      </LegacyCard>
    );
  }
  const boxes = [
    ['Pending referrals', '0'],
    ['Completed referrals', '0'],
    ['Conversion rate', '0%'],
  ];
  return (
    <LegacyCard title="Referrals" sectioned actions={[{content: 'Get Link', onAction: notYet}]}>
      <BlockStack gap="200">
        <TextField label="Referral link" value="" readOnly autoComplete="off" placeholder="No referral links found" />
        <InlineGrid columns={{md: 3, sm: 1}} gap="300">
          {boxes.map(([label, value]) => (
            <Box key={label} background="bg-surface-active" padding="400" borderRadius="200">
              <BlockStack gap="100">
                <Text as="p" fontWeight="medium" variant="bodySm">
                  {label}
                </Text>
                <Text as="h3" variant="headingLg">
                  {value}
                </Text>
              </BlockStack>
            </Box>
          ))}
        </InlineGrid>
      </BlockStack>
    </LegacyCard>
  );
}

const ACTIVITY_TABS = ['All', 'Point activities', 'VIP tier changes', 'Order activities', 'Referral', 'Point earned', 'Point redeemed', 'Point refunded'].map(
  (content, i) => ({id: `activity-${i}`, content})
);

function Activities({customer, loading}) {
  const {notYet} = useShell();
  const [selected, setSelected] = useState(0);
  return (
    <LegacyCard
      title={
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            Activities
          </Text>
          <Button icon={RefreshIcon} onClick={notYet} variant="monochromePlain" accessibilityLabel="Reload activities" />
        </InlineStack>
      }
    >
      <LegacyTabs tabs={ACTIVITY_TABS} selected={selected} onSelect={setSelected} />
      <div className="cd-timeline">
        {loading ? (
          <SkeletonBodyText lines={4} />
        ) : selected !== 0 ? (
          <Text as="p" tone="subdued" alignment="center">
            No activities found
          </Text>
        ) : (
          customer.activities.map((group) => (
            <div key={group.day} className="cd-timeline__group">
              <Text tone="subdued" as="h3">
                {group.day}
              </Text>
              {group.rows.map((row, i) => (
                <div key={i} className="cd-timeline__row">
                  <Text as="span">{row.text}</Text>
                  <Text variant="bodyMd" as="span" tone="subdued">
                    {row.time}
                  </Text>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </LegacyCard>
  );
}

function Tags({customer}) {
  const [tags, setTags] = useState(customer.tags);
  const [draft, setDraft] = useState('');
  const {notify} = useShell();
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (tags.includes(t)) {
      notify('Tag already exists', {error: true});
      return;
    }
    setTags([...tags, t]);
    setDraft('');
    notify('Tag added successfully');
  };
  return (
    <Card>
      <BlockStack gap="300">
        <Text variant="headingSm" as="h2">
          Tags
        </Text>
        <InlineStack gap="200" blockAlign="end" wrap={false}>
          <div style={{flex: 1}} onKeyDown={(e) => e.key === 'Enter' && add()}>
            <TextField label="Add a tag" labelHidden value={draft} onChange={setDraft} placeholder="Add a tag" autoComplete="off" />
          </div>
          <Button onClick={add} disabled={!draft.trim()}>
            Add
          </Button>
        </InlineStack>
        {tags.length > 0 ? (
          <InlineStack gap="200" wrap>
            {tags.map((tag) => (
              <Tag key={tag} onRemove={() => setTags(tags.filter((x) => x !== tag))}>
                {tag}
              </Tag>
            ))}
          </InlineStack>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function Notes() {
  const {notYet} = useShell();
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingSm" as="h2">
            Notes
          </Text>
          <Button variant="plain" icon={EditIcon} onClick={notYet} accessibilityLabel="Edit note" />
        </InlineStack>
        <Text as="p" tone="subdued">
          Add a note about this customer...
        </Text>
      </BlockStack>
    </Card>
  );
}

export function CustomerDetail() {
  const {state} = useScenario();
  const route = useRoute();
  const {setTitle} = useAppTitle();
  const loading = state === 'loading';
  const scenario = CUSTOMERS[state] ? state : 'default';
  // In-memory customer: Confirm in the modal changes its accounts until the page reloads.
  const [customer, setCustomer] = useState(() => clone(CUSTOMERS[scenario]));
  const [modalOpen, setModalOpen] = useState(() => !loading && hashQuery().get('modal') === 'adjust');
  const [bannerOpen, setBannerOpen] = useState(true);
  const {notYet} = useShell();

  useEffect(() => {
    setTitle(loading ? '' : customer.name);
  }, [loading, customer.name, setTitle]);

  // The Prototype panel link (#/customer?modal=adjust) opens the modal on a page that is already showing.
  useEffect(() => {
    if (!loading && route.query.get('modal') === 'adjust') setModalOpen(true);
  }, [route.query, loading]);

  const openModal = () => {
    setModalOpen(true);
    writeModalParam(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    writeModalParam(false);
  };

  const onAdjusted = ({code, signed, type, amount}) => {
    setCustomer((prev) => {
      const next = clone(prev);
      const account = next.accounts.find((a) => a.currencyCode === code);
      if (account) account.amount = Math.round((Number(account.amount) + signed) * 100) / 100;
      else next.accounts.push({currencyCode: code, amount: signed});
      const stats = next.statsByCurrency[code] || {totalAdded: 0, totalDeducted: 0};
      if (type === 'credit') stats.totalAdded += amount;
      else stats.totalDeducted += amount;
      next.statsByCurrency[code] = stats;
      const verb = type === 'credit' ? 'credited' : 'debited';
      next.activities = [
        {day: 'Today', rows: [{text: `Admin ${verb} ${amount.toFixed(2)} ${code} store credit`, time: 'Just now'}]},
        ...next.activities.filter((g) => g.day !== 'Today'),
      ];
      return next;
    });
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <StatsSummary customer={customer} loading={loading} />
        </Layout.Section>
        {bannerOpen ? (
          <Layout.Section>
            <Banner tone="info" action={{content: 'Learn how to add the block', onAction: notYet}} onDismiss={() => setBannerOpen(false)}>
              <Text as="p" variant="bodyMd">
                <strong>Manage loyalty directly in Shopify Admin</strong>
              </Text>
              <Text as="p" variant="bodyMd">
                Add the Joy block to your Shopify customer pages to update point balance, redeem coupons, and view VIP tier info without leaving Shopify.
              </Text>
            </Banner>
          </Layout.Section>
        ) : null}
        <Layout.Section>
          <BlockStack gap="400">
            <Overview customer={customer} loading={loading} />
            <Referrals loading={loading} />
            <Activities customer={customer} loading={loading} />
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            {loading ? (
              <LegacyCard sectioned title="Balance">
                <SkeletonBodyText lines={4} />
              </LegacyCard>
            ) : (
              <BalanceCard
                customer={customer}
                shopCurrency={STORE.currency}
                modalOpen={modalOpen}
                onOpenModal={openModal}
                onCloseModal={closeModal}
                onAdjusted={onAdjusted}
              />
            )}
            {!loading ? <Tags customer={customer} /> : null}
            <Notes />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
