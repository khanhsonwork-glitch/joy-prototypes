// Joy admin › On-site content › Widget design › Wishlist. The existing "Wishlist layout" choice stays as it is;
// the new "Product names" choice appears under it only when List is picked. Live preview on the right.
import React, {useState} from 'react';
import {Badge, Banner, BlockStack, Box, Button, ButtonGroup, Card, ChoiceList, InlineStack, Layout, Page, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useSettings} from '../state/settings.jsx';
import {SHOPS} from '../data/wishlist.js';
import {WishlistWidget} from '../widget/WishlistWidget.jsx';
import {useWishlistItems} from '../widget/useWishlistItems.js';

const LAYOUTS = [
  {label: 'Carousel', value: 'carousel'},
  {label: 'Grid', value: 'grid'},
  {label: 'List', value: 'list'},
];

const ROW_STYLES = [
  {
    label: 'One line',
    value: 'one-line',
    helpText: 'Names stay on one line. When a name is cut, an arrow next to it shows the full name. Add and remove stay on the right.',
  },
  {
    label: 'Up to two lines',
    value: 'two-lines',
    helpText: 'Names wrap to two lines, so shoppers read more without tapping. Remove moves to the corner and Add sits next to the price.',
  },
];

function Preview({rowStyle, layout, disabled}) {
  const {notify} = useShell();
  const {state} = useScenario();
  const [device, setDevice] = useState('desktop');
  const [shopId, setShopId] = useState('moto');
  const {items, status, remove, reset} = useWishlistItems(shopId, state);
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" gap="200" wrap>
          <Text as="h2" variant="headingSm">Preview</Text>
          <InlineStack gap="200" wrap>
            <ButtonGroup variant="segmented">
              <Button pressed={shopId === 'moto'} onClick={() => setShopId('moto')}>Long names</Button>
              <Button pressed={shopId === 'pomelo'} onClick={() => setShopId('pomelo')}>Short names</Button>
            </ButtonGroup>
            <ButtonGroup variant="segmented">
              <Button pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Desktop</Button>
              <Button pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Mobile</Button>
            </ButtonGroup>
          </InlineStack>
        </InlineStack>
        {layout !== 'list' ? (
          <div className="fx-note" role="note">
            Prototype note: Carousel and Grid cards are not part of this change. Pick List to preview the product-name setting.
          </div>
        ) : (
          <div className={`fx-preview fx-preview--${device}`}>
            <div className={device === 'mobile' ? 'fx-phone' : 'fx-popup'}>
              <WishlistWidget
                key={`${shopId}-${rowStyle}-${device}`}
                shop={SHOPS[shopId]}
                items={items}
                status={status}
                rowStyle={rowStyle}
                device={device}
                onNotify={(t) => notify(t)}
                onRetry={reset}
                onRemove={remove}
              />
            </div>
          </div>
        )}
        {disabled ? null : (
          <Text as="p" variant="bodySm" tone="subdued">
            Tap a name or photo in the preview: on the shop it opens the product page in a new tab.
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}

export function WidgetDesign() {
  const {notify} = useShell();
  const {state} = useScenario();
  const {settings, save} = useSettings();
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);
  const dirty = draft.layout !== settings.layout || draft.rowStyle !== settings.rowStyle;
  const disabled = state === 'disabled';

  const onSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      save(draft);
      setSaving(false);
      notify('Wishlist settings saved');
    }, 500);
  };

  const page = (children) => (
    <Page
      backAction={{content: 'Widget design', onAction: () => notify('Back to Widget design')}}
      title="Wishlist"
      titleMetadata={<Badge tone="success">On</Badge>}
      subtitle="The Wishlist tab of your storefront widget"
      primaryAction={{content: 'Save', disabled: !dirty || disabled || state === 'loading' || state === 'error', loading: saving, onAction: onSave}}
      secondaryActions={[{content: 'Open storefront view', url: '/demo/storefront'}]}
    >
      {children}
    </Page>
  );

  if (state === 'loading') return page(<Card><LoadingView rows={4} /></Card>);
  if (state === 'error') {
    return page(
      <Card>
        <ErrorView title="Couldn’t load Wishlist settings" onRetry={() => notify('Trying again…')}>
          Your saved settings are safe and your storefront keeps showing them. Try again in a moment.
        </ErrorView>
      </Card>,
    );
  }

  return page(
    <Layout>
      <Layout.Section variant="oneThird">
        <BlockStack gap="400">
          {disabled ? (
            <Banner tone="warning" title="Install Joy Wishlist to change these settings">
              <p>The Wishlist tab needs the Joy Wishlist app. Your current choices are kept and apply once it is installed.</p>
            </Banner>
          ) : null}
          <Card>
            <BlockStack gap="400">
              <ChoiceList
                title="Wishlist layout"
                choices={LAYOUTS}
                selected={[draft.layout]}
                disabled={disabled}
                onChange={([value]) => setDraft((d) => ({...d, layout: value}))}
              />
              {draft.layout === 'list' ? (
                <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
                  <ChoiceList
                    title="Product names"
                    choices={ROW_STYLES}
                    selected={[draft.rowStyle]}
                    disabled={disabled}
                    onChange={([value]) => setDraft((d) => ({...d, rowStyle: value}))}
                  />
                </Box>
              ) : null}
            </BlockStack>
          </Card>
        </BlockStack>
      </Layout.Section>
      <Layout.Section>
        <Preview rowStyle={draft.rowStyle} layout={draft.layout} disabled={disabled} />
      </Layout.Section>
    </Layout>,
  );
}
