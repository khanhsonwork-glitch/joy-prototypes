// Shop Management (/multi-shop/shops) on the main shop, as on avada/master (ShopManagement.js).
// New, only while "Linked-store orders earn here" is on: an Exchange rate column, an Edit rate modal with a live
// worked example, and a warning when a sub shop in another currency has no rate yet.
import React, {useRef, useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, ButtonGroup, Card, DataTable, InlineStack, Layout, Modal, Page, Text, TextField,
} from '@shopify/polaris';
import {DuplicateIcon, PlusCircleIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {MAIN_SHOP} from '../data/index.js';
import {money, rateError, useMultiShop} from '../state/multishop.jsx';

function RateModal({shop, initial, onClose, onSave}) {
  const [value, setValue] = useState(initial || '');
  const [error, setError] = useState('');
  const field = useRef(null);
  const ok = !rateError(value);
  const help = ok
    ? `A ${money(shop.symbol, 100)} order counts as ${money(MAIN_SHOP.symbol, 100 * Number(value))} for points and tier progress.`
    : `Enter how many ${MAIN_SHOP.currency} one ${shop.currency} is worth.`;
  const save = () => {
    const problem = rateError(value);
    if (problem) {
      setError(problem);
      field.current?.querySelector('input')?.focus();
      return;
    }
    onSave(Number(value).toFixed(Math.max(2, (String(value).split('.')[1] || '').length)));
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={`Exchange rate · ${shop.name}`}
      primaryAction={{content: 'Save', onAction: save}}
      secondaryActions={[{content: 'Cancel', onAction: onClose}]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <div ref={field}>
            <TextField
              label={`1 ${shop.currency} equals`}
              type="number"
              value={value}
              onChange={(v) => { setValue(v); setError(''); }}
              suffix={MAIN_SHOP.currency}
              placeholder="18.00"
              autoComplete="off"
              helpText={help}
              error={error || undefined}
              autoFocus
            />
          </div>
          <Text as="p" tone="subdued">The rate stays fixed until you change it. A new rate applies from the moment you save it.</Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export function ShopManagement() {
  const {state} = useScenario();
  const {notify, notYet} = useShell();
  const {multiShop, linkedEarn, rates, setRate, shops} = useMultiShop();
  const [editing, setEditing] = useState(null);
  const [unlink, setUnlink] = useState(null);
  const subShops = shops.filter((s) => s.type === 'sub');
  const linkedCount = subShops.length;

  const page = {
    title: 'Shop Management',
    subtitle: `Manage ${linkedCount} linked shop${linkedCount !== 1 ? 's' : ''}`,
    primaryAction: {content: 'Link Sub Shop', icon: PlusCircleIcon, onAction: notYet},
  };
  if (state === 'loading') return <Page title="Shop Management"><LoadingView rows={6} /></Page>;
  if (state === 'error') {
    return (
      <Page title="Shop Management">
        <ErrorView title="Couldn't load linked shops" onRetry={() => window.location.reload()}>
          Nothing was changed. Try again.
        </ErrorView>
      </Page>
    );
  }
  if (!multiShop) {
    return (
      <Page title="Shop Management">
        <Banner tone="warning">
          <BlockStack gap="200">
            <Text variant="bodyMd" as="p" fontWeight="semibold">Multi-Shop feature is not enabled</Text>
            <Text variant="bodyMd" as="p">Please enable the Multi-Shop feature from Developer Zone to access store management.</Text>
            <InlineStack gap="200"><Button url="/dev-zone" variant="primary">Go to Developer Zone</Button></InlineStack>
          </BlockStack>
        </Banner>
      </Page>
    );
  }

  const needsRate = (s) => s.type === 'sub' && s.currency !== MAIN_SHOP.currency;
  const missing = linkedEarn ? subShops.filter((s) => needsRate(s) && !rates[s.id]) : [];

  const rateCell = (s) => {
    if (s.type === 'main') return <Text as="span" tone="subdued">-</Text>;
    if (!needsRate(s)) return <Text as="span" tone="subdued">Same currency</Text>;
    if (!rates[s.id]) return <Badge tone="critical">Rate needed</Badge>;
    return <Text as="span">{`1 ${s.currency} = ${rates[s.id]} ${MAIN_SHOP.currency}`}</Text>;
  };

  const rows = shops.map((s) => {
    const row = [
      <Text key="n" variant="bodyMd" fontWeight="semibold" as="span">{s.name}</Text>,
      <Badge key="t" tone={s.type === 'main' ? 'success' : 'info'}>{s.type === 'main' ? 'Main Shop' : 'Sub Shop'}</Badge>,
      <Badge key="s" tone={s.installed ? 'success' : 'critical'}>{s.installed ? 'Active' : 'Inactive'}</Badge>,
    ];
    if (linkedEarn) row.push(<span key="r">{rateCell(s)}</span>);
    row.push(
      s.type !== 'main' ? (
        <ButtonGroup key="a">
          {linkedEarn && needsRate(s) ? <Button size="slim" onClick={() => setEditing(s)}>Edit rate</Button> : null}
          <Button size="slim" onClick={notYet}>View</Button>
          <Button size="slim" tone="critical" onClick={() => setUnlink(s)}>Unlink</Button>
        </ButtonGroup>
      ) : (
        <Text key="a" variant="bodyMd" tone="subdued" as="span">-</Text>
      )
    );
    return row;
  });
  const headings = linkedEarn
    ? ['Store Name', 'Type', 'Status', 'Exchange rate', 'Actions']
    : ['Store Name', 'Type', 'Status', 'Actions'];

  return (
    <Page {...page}>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">Multi-Shop Settings</Text>
                <Text variant="bodyMd" as="p" tone="subdued">Configure this store as a primary store to manage multiple locations</Text>
              </BlockStack>
              <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center" wrap={false} gap="400">
                    <BlockStack gap="100">
                      <Text variant="bodyMd" fontWeight="semibold" as="span">Primary Store</Text>
                      <Text variant="bodySm" as="p" tone="subdued">Enable this to make this shop the main shop that manages sub shops</Text>
                    </BlockStack>
                    <button type="button" className="ms-switch" role="switch" aria-checked="true" aria-label="Primary Store" disabled><span /></button>
                  </InlineStack>
                  <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
                    <BlockStack gap="200">
                      <Text variant="bodyMd" fontWeight="semibold" as="span">Your Store ID</Text>
                      <Text variant="bodySm" as="p" tone="subdued">Share this ID with your sub shops to link them to this main shop</Text>
                      <Box maxWidth="300px" width="100%">
                        <TextField
                          label="Your Store ID"
                          labelHidden
                          value="pmx7Qa2LwR9tK4sVb1Nc"
                          readOnly
                          autoComplete="off"
                          connectedRight={<Button icon={DuplicateIcon} accessibilityLabel="Copy" onClick={() => notify('Copied')} />}
                        />
                      </Box>
                    </BlockStack>
                  </Box>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Banner tone="info">
            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">Link multiple Shopify stores under one loyalty program. All stores share the same customers, programs, and rewards.</Text>
              <Text variant="bodyMd" as="p">Sub shops can customize their branding and UI, but loyalty logic is managed by the main shop.</Text>
            </BlockStack>
          </Banner>
        </Layout.Section>
        {missing.map((s) => (
          <Layout.Section key={s.id}>
            <Banner
              tone="warning"
              title={`Orders from ${s.name} aren't earning points yet`}
              action={{content: 'Add rate', onAction: () => setEditing(s)}}
            >
              <Text as="p">{`Add a ${s.currency} exchange rate so orders from this store earn points and tier progress here.`}</Text>
            </Banner>
          </Layout.Section>
        ))}
        <Layout.Section>
          <Card padding="0">
            <div className="ms-table">
              <DataTable columnContentTypes={headings.map(() => 'text')} headings={headings} rows={rows} />
            </div>
          </Card>
        </Layout.Section>
      </Layout>

      {editing ? (
        <RateModal
          shop={editing}
          initial={rates[editing.id]}
          onClose={() => setEditing(null)}
          onSave={(rate) => { setRate(editing.id, rate); setEditing(null); notify('Exchange rate saved'); }}
        />
      ) : null}

      <Modal
        open={!!unlink}
        onClose={() => setUnlink(null)}
        title="Unlink Sub Shop"
        primaryAction={{content: 'Unlink', destructive: true, onAction: () => { setUnlink(null); notYet(); }}}
        secondaryActions={[{content: 'Cancel', onAction: () => setUnlink(null)}]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p">Are you sure you want to unlink <Text as="span" fontWeight="bold">{unlink?.name}</Text>?</Text>
            <Text as="p" tone="subdued">This shop will no longer share customers, programs, and rewards with the main shop.</Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
