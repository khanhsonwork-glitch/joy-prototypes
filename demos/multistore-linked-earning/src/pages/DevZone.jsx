// Developer Zone › Control Panel › Dev Tools, as on avada/master (DevZone.js + MultiShopToggle.js).
// New: one staff-only switch under Multi-Shop (Beta) on a main shop: "Linked-store orders earn here".
import React, {useState} from 'react';
import {Badge, BlockStack, Box, Button, FormLayout, InlineStack, LegacyCard, LegacyStack, Page, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useMultiShop} from '../state/multishop.jsx';

export function Switch({checked, onChange, label, disabled}) {
  return (
    <button
      type="button"
      className="ms-switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

// Neighbour rows copied from the real Dev Tools card so the new row sits among what staff see today.
const NEIGHBOURS_BEFORE = [
  'Stop sync bulk metafield and tag',
  'Disable skip duplicate order hook (delay 3s via cloud task)',
  '[VNM] Referral whitelist',
  'Birthday advanced conditions (tag/segment)',
];

function ToggleRow({label}) {
  const {notYet} = useShell();
  return (
    <LegacyStack alignment="center">
      <Text variant="bodyMd" as="span" fontWeight="semibold">{label}</Text>
      <Switch checked={false} onChange={notYet} label={label} />
    </LegacyStack>
  );
}

function ClosedCard({title}) {
  const {notYet} = useShell();
  return (
    <LegacyCard>
      <LegacyCard.Header title={title}>
        <Button variant="primary" onClick={notYet}>Open</Button>
      </LegacyCard.Header>
      <br />
    </LegacyCard>
  );
}

function MultiShopBlock() {
  const {multiShop, setMultiShop, linkedEarn, setLinkedEarn} = useMultiShop();
  const {notify} = useShell();
  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="center">
        <BlockStack gap="100">
          <InlineStack gap="200" align="center">
            <Text variant="headingMd" as="h3">Multi-Shop (Beta)</Text>
            <Badge tone={multiShop ? 'success' : undefined}>{multiShop ? 'Enabled' : 'Disabled'}</Badge>
          </InlineStack>
          <Text variant="bodyMd" as="p" tone="subdued">
            Link multiple Shopify shops under one loyalty program with unified customer accounts
          </Text>
        </BlockStack>
        <Switch checked={multiShop} onChange={(on) => { setMultiShop(on); notify('Saved'); }} label="Multi-Shop (Beta)" />
      </InlineStack>
      {multiShop && (
        <>
          <InlineStack align="start">
            <Button url="/multi-shop/shops">Manage Shops</Button>
          </InlineStack>
          <div className="ms-subrow" data-testid="linked-earn-row">
            <InlineStack align="space-between" blockAlign="center" wrap={false} gap="400">
              <BlockStack gap="100">
                <Text variant="bodyMd" as="span" fontWeight="semibold">Linked-store orders earn here</Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Orders, refunds and cancellations in linked sub shops add points and tier progress to the customer in
                  this main shop. Off by default. Turn on only for shops that asked for it.
                </Text>
              </BlockStack>
              <Switch
                checked={linkedEarn}
                onChange={(on) => { setLinkedEarn(on); notify('Saved'); }}
                label="Linked-store orders earn here"
              />
            </InlineStack>
          </div>
        </>
      )}
    </BlockStack>
  );
}

export function DevZone() {
  const {state} = useScenario();
  const [open, setOpen] = useState(true);
  const page = {title: 'Control Panel', fullWidth: true};
  if (state === 'loading') return <Page {...page}><LoadingView rows={10} /></Page>;
  if (state === 'error') {
    return (
      <Page {...page}>
        <ErrorView title="Couldn't load the Control Panel" onRetry={() => window.location.reload()}>
          Settings weren't changed. Try again.
        </ErrorView>
      </Page>
    );
  }
  return (
    <Page {...page}>
      <BlockStack gap="400">
        <ClosedCard title="CS support tools" />
        <ClosedCard title="Testing tools" />
        <LegacyCard>
          <LegacyCard.Header title="Dev Tools">
            <Button {...(!open ? {variant: 'primary'} : {})} onClick={() => setOpen((v) => !v)} ariaExpanded={open}>
              {open ? 'Close' : 'Open'}
            </Button>
          </LegacyCard.Header>
          <br />
          {open && (
            <LegacyCard.Section>
              <FormLayout>
                {NEIGHBOURS_BEFORE.map((label) => <ToggleRow key={label} label={label} />)}
                <Box paddingBlock="100"><MultiShopBlock /></Box>
                <ToggleRow label="Enable Joy SDK access (bypass Ultimate plan)" />
              </FormLayout>
            </LegacyCard.Section>
          )}
        </LegacyCard>
      </BlockStack>
    </Page>
  );
}
