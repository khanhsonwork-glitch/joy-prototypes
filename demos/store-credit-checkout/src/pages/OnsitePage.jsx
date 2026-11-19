// On-site content → Checkout page → Quick Redeem card. Store credit at checkout (PRD §I) is added to this
// EXISTING card, not a new settings page: a toggle + a per-order cap field, directly below the card's own
// description/actions — same block merchants already open to configure Quick Redeem.
// Real screen: avada/master packages/assets/src/pages/Onsite/Onsite.js (Checkout page tab, `checkoutBlock`
// array, `CHECKOUT_PAGE_TAB_EMBED_CONTENT`) + CardIntroduction.js for the card shell. See REFERENCE.md.
import React, {useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Layout, Page, Tabs, Text, TextField, Tooltip,
} from '@shopify/polaris';
import {LockIcon, RefreshIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useOnsite} from '../state/onsite.jsx';
import {LoadingView} from '../kit/StateView.jsx';

const TABS = ['Widget', 'Product page', 'Cart page', 'Checkout page', 'Thank you page'];

function CheckoutBlockCard({title, description, learnMoreUrl, badge, recommended, children}) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="start">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h3" variant="headingSm">{title}</Text>
            {recommended ? <Badge tone="success">Recommended</Badge> : null}
            {badge ? <Badge tone="info">{badge}</Badge> : null}
          </InlineStack>
        </InlineStack>
        <Text as="p" tone="subdued">
          {description}{' '}
          {learnMoreUrl ? <Button variant="plain" url={learnMoreUrl} target="_blank">Learn more</Button> : null}
        </Text>
        {children}
        <InlineStack gap="200">
          <Button variant="primary">Edit in Theme Editor</Button>
          <Button>Preview</Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

/** Store credit at checkout: toggle + per-order cap, appended to the Quick Redeem card (PRD §I). */
function StoreCreditSettings() {
  const {notify} = useShell();
  const onsite = useOnsite();
  const {settings, saving, saveError, shopIsPlus, hasWritePermission, showPlusRecommendation, dismissPlusRecommendation, toggle, setCap, worst} = onsite;
  const [capTouched, setCapTouched] = useState(false);
  const capInvalid = capTouched && settings.cap !== '' && (Number.isNaN(Number(settings.cap)) || Number(settings.cap) < 0);

  const body = (
    <BlockStack gap="300">
      <InlineStack align="space-between" blockAlign="start" gap="200">
        <BlockStack gap="050">
          <InlineStack gap="150" blockAlign="center">
            <Text as="h4" variant="headingXs">Allow customers to use store credit at checkout</Text>
            {!shopIsPlus ? <Badge>Requires Shopify Plus</Badge> : null}
          </InlineStack>
          <Text as="p" tone="subdued" variant="bodySm">
            Customers pick how much store credit to apply, up to their balance. It's deducted as a discount
            code when the order is placed. Off by default — turn it on when you're ready.
          </Text>
        </BlockStack>
        <Tooltip active={!shopIsPlus ? undefined : false} content="Requires Shopify Plus" preferredPosition="above">
          <span aria-disabled={!shopIsPlus || !hasWritePermission}>
            <button
              type="button"
              role="switch"
              aria-checked={settings.enabled}
              aria-label="Allow customers to use store credit at checkout"
              className="scc-switch"
              disabled={!shopIsPlus || !hasWritePermission || saving}
              onClick={() => toggle(!settings.enabled)}
            >
              <span />
            </button>
          </span>
        </Tooltip>
      </InlineStack>

      {saveError ? (
        <Banner tone="critical" title="Couldn't save this setting" action={{content: 'Try again', onAction: () => toggle(!settings.enabled)}}>
          <Text as="p">The change wasn't saved. Your checkout still uses the previous setting.</Text>
        </Banner>
      ) : null}

      {!hasWritePermission ? (
        <Banner tone="warning" title="Joy needs permission to write store credit for this shop" icon={LockIcon}>
          <BlockStack gap="150">
            <Text as="p">
              Store credit at checkout stays off until Joy can create store credit transactions on your behalf.
            </Text>
            <InlineStack>
              <Button icon={RefreshIcon}>Reconnect permissions</Button>
            </InlineStack>
          </BlockStack>
        </Banner>
      ) : null}

      {settings.enabled && hasWritePermission ? (
        <BlockStack gap="300">
          <Box maxWidth="280px">
            <TextField
              label="Per-order cap"
              type="number"
              autoComplete="off"
              prefix="$"
              placeholder="No cap"
              value={settings.cap}
              error={capInvalid ? 'Enter a positive amount, or leave blank for no cap' : undefined}
              helpText="Leave blank for no cap. In the store's currency."
              onChange={(value) => setCap(value)}
              onBlur={() => setCapTouched(true)}
            />
          </Box>

          {showPlusRecommendation ? (
            <Banner
              tone="info"
              title="Turn off Shopify's own store credit button"
              onDismiss={dismissPlusRecommendation}
            >
              <BlockStack gap="150">
                <Text as="p">
                  Shopify's native store credit button spends the same balance. With both on, a customer could
                  apply credit twice and the order is short the difference. We recommend turning off Shopify's
                  button in <Button variant="plain" url="https://admin.shopify.com/settings/customer_accounts" target="_blank">Settings → Customer accounts</Button>.
                </Text>
              </BlockStack>
            </Banner>
          ) : null}

          <Text as="p" tone="subdued" variant="bodySm">
            Tax note: because credit is applied as a discount, tax may be calculated on the amount after credit —
            different from Shopify's own store credit payment method. Confirm with your accountant before turning
            this on if you collect VAT.
          </Text>

          {worst ? (
            <Banner tone="critical" title="Sync failed">
              <Text as="p">The last save to Shopify didn't go through. Retry, or this cap may be out of date.</Text>
            </Banner>
          ) : null}
        </BlockStack>
      ) : null}
    </BlockStack>
  );

  if (!shopIsPlus) {
    return (
      <Box opacity={0.5} aria-disabled="true">
        {body}
      </Box>
    );
  }
  return body;
}

export function OnsitePage() {
  const onsite = useOnsite();
  const [selected, setSelected] = useState(3);
  const tabs = TABS.map((label, index) => ({id: `tab-${index}`, content: label}));

  if (onsite.loadingPage) return <LoadingView rows={6} />;

  return (
    <Page title="On-site content" subtitle="Widgets and blocks customers see on your storefront, cart, checkout and thank-you page.">
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
              <Box padding="400">
                {selected === 3 ? (
                  <BlockStack gap="400">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="h2" variant="headingMd">Checkout page</Text>
                      {!onsite.shopIsPlus ? <Badge>Shopify Plus only</Badge> : null}
                    </InlineStack>
                    {!onsite.shopIsPlus ? (
                      <Banner tone="info">
                        <Text as="p">Checkout blocks need Shopify Plus. Everything below is visible so you know what's available, but settings stay off until you upgrade.</Text>
                      </Banner>
                    ) : null}
                    <CheckoutBlockCard
                      title="Quick Redeem"
                      description="Enable customers to instantly redeem points for rewards during checkout, creating a seamless experience."
                      learnMoreUrl="https://help.joy.so/on-site-content/checkout-page/quick-redeem"
                      recommended
                    >
                      <Divider />
                      <StoreCreditSettings />
                    </CheckoutBlockCard>
                    <CheckoutBlockCard
                      title="Available Rewards"
                      description="Show Joy-issued coupons on checkout, helping customers use available rewards at the moment of purchase."
                      learnMoreUrl="https://help.joy.so/on-site-content/checkout-page/available-rewards"
                    />
                    <CheckoutBlockCard
                      title="Referral at Checkout"
                      description="Let customers enter a referral link or code during checkout to instantly receive a reward and apply the coupon automatically."
                      learnMoreUrl="https://help.joy.so/on-site-content/checkout-page/referral-at-checkout-page"
                    />
                  </BlockStack>
                ) : (
                  <Box padding="400">
                    <Text as="p" tone="subdued">Open this prototype on the Checkout page tab — use the Prototype panel link, or switch the tab above.</Text>
                  </Box>
                )}
              </Box>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
