// Reward programs › Redeeming programs › Free product (FreeGiftProgram in the Joy admin), card for card.
// New: "Shop now link (optional)" at the end of the Setup rewards card, with a live line saying where Shop now goes.
import React, {useEffect, useMemo, useState} from 'react';
import {
  BlockStack, Button, Card, ChoiceList, Checkbox, InlineGrid, InlineStack, Layout, Modal, Page, ResourceItem, ResourceList, Text, TextField, Thumbnail,
} from '@shopify/polaris';
import {ImageIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {COLLECTIONS, PRODUCTS} from '../data/index.js';
import {linkError, shopNowTarget, useLinks} from '../state/links.jsx';
import {ShopNowLinkField, SummaryCard} from './shared.jsx';

function initialForm(state) {
  return {
    name: 'Free Pomelo Cloud Cream mini',
    points: '1500',
    mode: 'one',
    giftType: 'products',
    products: ['p1'],
    collections: ['c1'],
    newTab: true,
    shopNowLink: state === 'own' ? '/pages/holiday-gift-guide' : state === 'worst' ? 'pages/holiday-gift-guide' : '',
  };
}

export function RewardEdit() {
  const {notify, notYet} = useShell();
  const navigate = useNavigate();
  const {state} = useScenario();
  const {saved} = useLinks();
  const today = state === 'today';
  const initial = useMemo(() => initialForm(state), [state]);
  const [form, setForm] = useState(initial);
  const [picker, setPicker] = useState(null);
  const [pick, setPick] = useState([]);
  useEffect(() => setForm(initial), [initial]);
  const set = (key) => (value) => setForm((f) => ({...f, [key]: value}));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const defaultLink = state === 'blank' ? '' : saved.defaultLink;

  const products = PRODUCTS.filter((p) => form.products.includes(p.id));
  const collections = COLLECTIONS.filter((c) => form.collections.includes(c.id));
  const target = {ownLink: form.shopNowLink, products, collections, giftType: form.giftType, defaultLink};

  const onSave = () => {
    if (!today && linkError(form.shopNowLink)) {
      notify('1 field needs attention', {error: true});
      document.querySelector('#shop-now-link')?.focus();
      return;
    }
    notify('Program saved');
  };

  const openPicker = (kind) => {setPick(kind === 'products' ? form.products : form.collections); setPicker(kind);};
  const closePicker = (apply) => {
    if (apply) setForm((f) => ({...f, [picker]: pick}));
    setPicker(null);
  };
  const items = picker === 'collections' ? COLLECTIONS : PRODUCTS;

  let body;
  if (state === 'loading') body = <Card><LoadingView /></Card>;
  else if (state === 'error') body = <ErrorView onRetry={() => notify('Program loaded')}>We couldn’t load this program. Nothing you saved is lost.</ErrorView>;
  else body = (
    <Layout>
      <Layout.Section>
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingSm">Setup rewards</Text>
              <TextField label="Set your program name here" value={form.name} onChange={set('name')} autoComplete="off" placeholder="Reward Program" />
              <InlineGrid columns={2} gap="300">
                <TextField label="Start date" type="date" value="2026-10-01" onChange={() => {}} autoComplete="off" />
                <TextField label="End date" type="date" value="" onChange={() => {}} autoComplete="off" />
              </InlineGrid>
              <Text as="p" tone="subdued">Set when this reward is available to customers. Codes already issued stay valid until their own expiry.</Text>
              <TextField label="Description" value="" placeholder="Get a free Pomelo Cloud Cream mini" onChange={() => {}} autoComplete="off" helpText="Leave blank to use the default description." />
              <TextField label="Detail description" multiline={3} value="" onChange={() => {}} autoComplete="off" helpText="Shown when customer clicks into the program detail." />
              {today ? null : (
                <div className="sl-new">
                  <ShopNowLinkField
                    value={form.shopNowLink}
                    onChange={set('shopNowLink')}
                    newTab={form.newTab}
                    onNewTab={set('newTab')}
                    target={target}
                    help="Where Shop now takes customers after they redeem this reward or open its coupon. Leave blank and Joy picks: the product or collection page when the reward is for only one, otherwise the shopping link in Settings."
                  />
                </div>
              )}
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Redeemed value</Text>
              <TextField label="Customer redeems" type="number" suffix="points" value={form.points} onChange={set('points')} autoComplete="off" />
              <ChoiceList title="Free products" titleHidden choices={[{label: 'Free one product from selection', value: 'one'}, {label: 'Free all products in selection', value: 'all'}]} selected={[form.mode]} onChange={(v) => set('mode')(v[0])} />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Free gift options</Text>
              <ChoiceList
                title="Choose free gift type"
                choices={[{label: 'Specific products', value: 'products'}, {label: 'Specific collections', value: 'collections'}, {label: 'All products except selected collection', value: 'except'}]}
                selected={[form.giftType]}
                onChange={(v) => set('giftType')(v[0])}
              />
              {form.giftType === 'products' ? (
                <BlockStack gap="200">
                  <Text as="p" fontWeight="medium">Rewarded product(s)</Text>
                  <InlineStack><Button onClick={() => openPicker('products')}>{products.length ? `${products.length} product${products.length > 1 ? 's' : ''}` : 'Browse products'}</Button></InlineStack>
                  {products.map((p) => (
                    <InlineStack key={p.id} gap="300" blockAlign="center">
                      <Thumbnail source={ImageIcon} size="small" alt="" />
                      <Text as="span">{p.title}</Text>
                      <Text as="span" tone="subdued">Quantity: 1 item(s)</Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : (
                <BlockStack gap="200">
                  <Text as="p" fontWeight="medium">Collections</Text>
                  <InlineStack><Button onClick={() => openPicker('collections')}>{collections.length ? `${collections.length} collection${collections.length > 1 ? 's' : ''}` : 'Browse collections'}</Button></InlineStack>
                  {collections.map((c) => <Text as="p" key={c.id}>{c.title}</Text>)}
                  <TextField label="Total free product quantity" type="number" value="1" onChange={() => {}} autoComplete="off" helpText="Total quantity across all collections" />
                </BlockStack>
              )}
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Member eligibility</Text>
              <ChoiceList title="Member eligibility" titleHidden choices={[{label: 'All members', value: 'all', helpText: 'This program will be available for all members'}, {label: 'Specific tiers', value: 'tiers'}]} selected={['all']} onChange={() => {}} />
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingSm">Coupon validity</Text>
              <ChoiceList title="Coupon validity" titleHidden choices={[{label: 'Never expire', value: 'never'}, {label: 'Expire after a set duration', value: 'duration'}, {label: 'Set a specific date and time', value: 'date'}]} selected={['duration']} onChange={() => {}} />
              <Checkbox label="Limit to one use per customer" checked onChange={() => {}} />
            </BlockStack>
          </Card>
        </BlockStack>
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <div className="sl-sticky">
          <SummaryCard
            title={form.name || 'Free product'}
            lines={[
              `Customer redeems ${Number(form.points || 0).toLocaleString('en-US')} points for ${form.giftType === 'products' ? (products.map((p) => p.title).join(', ') || 'a free product') : `a product from ${collections.map((c) => c.title).join(', ') || 'a collection'}`}`,
              ...(today ? [] : [`Shop now: ${shopNowTarget(target).url}`]),
            ]}
          />
        </div>
      </Layout.Section>
    </Layout>
  );

  return (
    <Page
      backAction={{content: 'Redeeming programs', onAction: () => navigate('/programs?type=redeem')}}
      title="Free product"
      actionGroups={[{title: 'Status: Active', actions: [{content: 'Active'}, {content: 'Inactive', onAction: notYet}]}]}
      secondaryActions={[{content: 'Delete', destructive: true, onAction: notYet}]}
      primaryAction={{content: 'Save', onAction: onSave, disabled: !dirty || state === 'loading' || state === 'error'}}
    >
      {body}
      <Modal
        open={!!picker}
        onClose={() => closePicker(false)}
        title={picker === 'collections' ? 'All collections' : 'All products'}
        primaryAction={{content: 'Add', onAction: () => closePicker(true)}}
        secondaryActions={[{content: 'Cancel', onAction: () => closePicker(false)}]}
      >
        <ResourceList
          items={items}
          selectedItems={pick}
          onSelectionChange={setPick}
          selectable
          renderItem={(item) => (
            <ResourceItem id={item.id} accessibilityLabel={item.title} onClick={() => setPick((p) => (p.includes(item.id) ? p.filter((x) => x !== item.id) : [...p, item.id]))}>
              <Text as="span">{item.title}</Text>
            </ResourceItem>
          )}
        />
      </Modal>
    </Page>
  );
}
