// Settings › General, scrolled to the "Redemption behavior" card (CustomerBehaviorSettings in the Joy admin).
// The free-shipping "Continue shopping URL" becomes the shop's shopping link for every Shop now button: new heading,
// label and help text, plus a one-time notice for shops that had already filled it.
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActionList, Badge, Banner, BlockStack, Card, Checkbox, ChoiceList, Divider, Layout, Page, RadioButton, Select, Text, TextField,
} from '@shopify/polaris';
import {
  AppsIcon, CodeIcon, ColorIcon, EmailIcon, GlobeIcon, NotificationIcon, OrderIcon, PlusCircleIcon, RefreshIcon, SearchIcon, ClockIcon,
} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {LINK_PLACEHOLDER} from '../data/index.js';
import {linkError, useLinks} from '../state/links.jsx';

const SECTIONS = [
  {content: 'General', icon: AppsIcon, active: true},
  {content: 'Brand', icon: ColorIcon},
  {content: 'Email', icon: EmailIcon},
  {content: 'Notifications', icon: NotificationIcon},
  {content: 'Pre-launch', icon: ClockIcon},
  {content: 'Order', icon: OrderIcon},
  {content: 'Translations', icon: GlobeIcon},
  {content: 'Subscription', icon: RefreshIcon},
  {content: 'Developers', icon: CodeIcon},
  {content: 'Additional features', icon: PlusCircleIcon},
];

function initialLink(state, saved) {
  if (state === 'blank' || state === 'today') return state === 'today' ? saved.defaultLink : '';
  if (state === 'worst') return 'pomelopark.com/collections/winter-skincare-favourites-for-dry-and-sensitive-skin-gift-sets-under-50';
  return saved.defaultLink;
}

export function Settings() {
  const {notify, notYet} = useShell();
  const {state} = useScenario();
  const {saved, save} = useLinks();
  const today = state === 'today';
  const initial = useMemo(() => ({
    link: initialLink(state, saved),
    apply: 'go_to_cart', freeGift: 'manual', calc: 'go_to_login',
  }), [state, saved]);
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  const set = (key) => (value) => setForm((f) => ({...f, [key]: value}));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const error = linkError(form.link);
  // A shop that had already filled the free-shipping URL sees a one-time notice that it now drives Shop now too.
  const hadLink = state === 'default' || state === 'own';
  const [noticeClosed, setNoticeClosed] = useState(false);

  // The real page scrolls to #customer-behavior-settings when opened from a deep link.
  useEffect(() => {
    if (state === 'loading' || state === 'error') return;
    // After the shell has reset the scroll for the new route.
    const t = window.setTimeout(() => (document.getElementById('shopping-link') || document.getElementById('customer-behavior-settings'))?.scrollIntoView({block: 'center'}), 50);
    return () => window.clearTimeout(t);
  }, [state]);

  const onSave = () => {
    if (error) {
      notify('1 field needs attention', {error: true});
      document.querySelector('#shopping-link')?.focus();
      return;
    }
    save({defaultLink: form.link.trim()});
    notify('Settings saved');
  };

  const nowLine = form.link.trim() && !error
    ? `Now: these buttons open ${form.link.trim()}.`
    : 'Now (blank): Continue shopping, No orders yet and loyalty page Milestones open /collections/all; the other Shop now buttons open your homepage.';

  let right;
  if (state === 'loading') right = <LoadingView />;
  else if (state === 'error') right = <ErrorView onRetry={() => notify('Settings loaded')}>We couldn’t load your settings. Nothing you saved is lost.</ErrorView>;
  else right = (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingSm">Membership enrollment</Text>
            <Text as="p" tone="subdued">How do customers become loyalty members?</Text>
          </BlockStack>
          <RadioButton label="Auto-enroll" helpText="Once customers create a Shopify customer account, they are synced to Joy and automatically enrolled as loyalty members." checked id="enroll-auto" name="enroll" onChange={() => {}} />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingSm">In-app language</Text>
          <Select label="In-app language" labelHidden options={['English (uk)']} value="English (uk)" onChange={() => {}} />
        </BlockStack>
      </Card>
      <div id="customer-behavior-settings" className="sl-anchor">
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingSm">Redemption behavior</Text>
              <Text as="p" tone="subdued">
                {today
                  ? 'Control what happens when customers apply discounts or redeem free gifts.'
                  : 'Control what happens when customers apply discounts, redeem rewards or click Shop now.'}
              </Text>
            </BlockStack>
            <ChoiceList
              title="Trigger: Apply discount"
              choices={[
                {label: 'Stay on current page', value: 'stay', helpText: 'Customer remain on the same page after applying discount'},
                {label: 'Go to cart page', value: 'go_to_cart', helpText: 'The discount is applied and the customer is redirected to the cart page.'},
                {label: 'Open cart drawer', value: 'open_cart_drawer', helpText: 'The discount is applied and the cart drawer opens to display the updated cart.'},
              ]}
              selected={[form.apply]}
              onChange={(v) => set('apply')(v[0])}
            />
            <ChoiceList
              title="Trigger: After customer redeem free gift"
              choices={[
                {label: 'Customer manually adds to cart', value: 'manual', helpText: 'Customer needs to manually add the free gift to their cart'},
                {label: 'Auto add to cart', value: 'auto', helpText: 'The free gift is automatically added to the customer cart and a confirmation modal is shown'},
                {label: <span>Auto add to cart and immediately open cart drawer <Badge tone="success">Recommended</Badge></span>, value: 'auto_drawer', helpText: 'The free gift is automatically added to the customer cart and the cart drawer opens automatically'},
              ]}
              selected={[form.freeGift]}
              onChange={(v) => set('freeGift')(v[0])}
            />
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">{today ? 'Trigger: After customer redeems free shipping' : 'Trigger: Customer clicks Continue shopping or Shop now'}</Text>
              {!today && hadLink && !noticeClosed ? (
              <Banner tone="info" title="Your Continue shopping URL now sets Shop now buttons too" onDismiss={() => setNoticeClosed(true)}>
                <p>{`Shop now buttons that don't lead to one product or collection now open ${saved.defaultLink}, the link you set for free shipping. Change or clear it below if that's not where you want customers to go.`}</p>
              </Banner>
            ) : null}
              <TextField
                id="shopping-link"
                label={today ? 'Continue shopping URL' : 'Shopping link'}
                labelHidden
                autoComplete="url"
                placeholder={LINK_PLACEHOLDER}
                value={form.link}
                onChange={set('link')}
                error={today ? undefined : error}
                helpText={today
                  ? 'Destination URL when the customer clicks Continue shopping after redeeming a free shipping reward. Leave blank to use the default /collections/all.'
                  : (
                    <BlockStack gap="100">
                      <span>Where customers go when they click Continue shopping after redeeming free shipping, and Shop now after redeeming a reward, in My coupons, on Milestones, on Place order or with no orders yet. A reward for one product or one collection opens that page instead.</span>
                      <span className="sl-now">{nowLine}</span>
                    </BlockStack>
                  )}
              />
            </BlockStack>
            <ChoiceList
              title={(
                <BlockStack gap="200">
                  <span>Trigger: Point Calculator link (non-login customers)</span>
                  <Banner tone="info">When a non-logged-in customer clicks the 'Join Reward Program' link on the points calculator, this setting controls what happens.</Banner>
                </BlockStack>
              )}
              choices={[
                {label: 'Open loyalty widget', value: 'open_widget', helpText: 'The loyalty widget opens so the customer can sign up or log in without leaving the page.'},
                {label: 'Redirect to login page', value: 'go_to_login', helpText: "Customer is redirected to your store's login page."},
              ]}
              selected={[form.calc]}
              onChange={(v) => set('calc')(v[0])}
            />
          </BlockStack>
        </Card>
      </div>
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingSm">Points exchange rate</Text>
          <Checkbox label="Show the money value of points to customers" checked={false} onChange={() => {}} />
        </BlockStack>
      </Card>
    </BlockStack>
  );

  return (
    <Page
      backAction={{content: 'Joy', onAction: notYet}}
      title="General"
      subtitle="Manage your store's core loyalty program settings, customer eligibility, data sync, and default preferences."
      primaryAction={{content: 'Save', onAction: onSave, disabled: !dirty || state === 'loading' || state === 'error'}}
      secondaryActions={dirty ? [{content: 'Discard', onAction: () => setForm(initial)}] : []}
    >
      <Layout>
        <Layout.Section variant="oneThird">
          <Card padding="0">
            <div className="sl-search">
              <TextField label="Search settings" labelHidden placeholder="Search settings..." prefix={<span className="sl-ico"><SearchIcon /></span>} autoComplete="off" value="" onChange={() => {}} />
            </div>
            <ActionList items={SECTIONS.map((s) => ({...s, onAction: s.active ? undefined : notYet}))} />
          </Card>
        </Layout.Section>
        <Layout.Section>{right}</Layout.Section>
      </Layout>
    </Page>
  );
}
