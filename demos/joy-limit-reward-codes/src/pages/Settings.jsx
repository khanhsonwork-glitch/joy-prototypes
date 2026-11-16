// Settings (Setting.js in the Joy admin): left list of sections, the chosen section on the right.
// · ?type=additional-features (default in this prototype, so deep links land on the change): Details/AdditionalFeatures.js,
//   with the new "Limit Joy reward codes per order" card right after "Limit customer earning" (id limit-reward-codes).
// · ?type=general: Details/General.js, unchanged; ?scroll=prefix-discount scrolls to "Default discount code prefix" like
//   the real page does, which is where "Change prefix" sends the merchant.
// Both sections save with the page's "Unsaved changes" bar.
import React, {useEffect, useState} from 'react';
import {
  ActionList, Badge, Banner, BlockStack, Card, ChoiceList, ContextualSaveBar, Layout, Page, RadioButton, Select,
  Text, TextField,
} from '@shopify/polaris';
import {
  AppExtensionIcon, ClockIcon, CodeIcon, ColorIcon, EmailNewsletterIcon, LanguageTranslateIcon, NotificationIcon,
  OrderDraftIcon, PaymentIcon, PlusCircleIcon, SearchIcon,
} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useLimit} from '../state/limit.jsx';
import {CodeLimit} from './CodeLimit.jsx';
import {SettingToggle} from './SettingToggle.jsx';

const SECTIONS = [
  {content: 'General', icon: AppExtensionIcon, type: 'general'},
  {content: 'Brand', icon: ColorIcon},
  {content: 'Email', icon: EmailNewsletterIcon},
  {content: 'Notifications', icon: NotificationIcon},
  {content: 'Pre-launch', icon: ClockIcon},
  {content: 'Order', icon: OrderDraftIcon},
  {content: 'Translations', icon: LanguageTranslateIcon},
  {content: 'Subscription', icon: PaymentIcon},
  {content: 'Developers', icon: CodeIcon},
  {content: 'Additional features', icon: PlusCircleIcon, type: 'additional-features'},
];

/** Which settings section the hash asks for. The prototype opens Additional features unless General is asked for. */
export const settingsType = (query) => (query.get('type') === 'general' ? 'general' : 'additional-features');

const heading = (text) => <Text as="h3" variant="headingSm">{text}</Text>;

/* ---------------------------------------------------------------- General (unchanged screen) */

function General({form, set, prefixNote, onDismissNote, disabled}) {
  const {notYet} = useShell();
  const {saved} = useLimit();
  const [behavior, setBehavior] = useState({apply: 'open_cart_drawer', selector: 'cart-drawer', widget: 'auto_apply', freeGift: 'auto_drawer', calc: 'go_to_login'});
  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <BlockStack gap="100">
            {heading('Membership enrollment')}
            <Text as="p" tone="subdued">How do customers become loyalty members?</Text>
          </BlockStack>
          <RadioButton label="Auto-enroll" helpText="Once customers create a Shopify customer account, they are synced to Joy and automatically enrolled as loyalty members." checked id="enroll-auto" name="enroll" onChange={() => {}} />
          <RadioButton label="Customer opt-in" helpText="Customers must click “Join Program” on your storefront to become members." checked={false} id="enroll-optin" name="enroll" onChange={notYet} />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="200">
          {heading('In-app language')}
          <Text as="p" tone="subdued">Choose the language for the app’s user interface. This setting will not change the language used in your online store.</Text>
          <Select label="In-app language" labelHidden options={['English (uk)']} value="English (uk)" onChange={() => {}} />
        </BlockStack>
      </Card>
      <div id="prefix-discount" className="lc-anchor">
        <Card>
          <BlockStack gap="200">
            {heading('Default discount code prefix')}
            <Text as="p" tone="subdued">Default prefix for discount rewards (can be overridden in each reward program)</Text>
            {prefixNote ? (
              <Banner tone="info" onDismiss={onDismissNote}>
                <p>New Joy codes will start with the new prefix. Codes Joy already issued with {saved.prefix} stay valid and still count as Joy codes until they’re used, so choose Don’t count as Joy code (Settings › Additional features) for your own codes that should never count.</p>
              </Banner>
            ) : null}
            <TextField
              id="default-prefix"
              label="Default discount code prefix"
              labelHidden
              autoComplete="off"
              placeholder="E.g: JOY-"
              value={form.prefix}
              onChange={(v) => set({prefix: v})}
              disabled={disabled}
              helpText="Remove spaces and special characters for seamless discount code copying by customers"
            />
          </BlockStack>
        </Card>
      </div>
      <div id="customer-behavior-settings">
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingSm">Redemption behavior</Text>
              <Text as="p" tone="subdued">Control what happens when customers apply discounts or redeem free gifts.</Text>
            </BlockStack>
            <ChoiceList
              title={heading('Trigger: Apply discount')}
              choices={[
                {label: 'Stay on current page', value: 'stay', helpText: 'Customer remain on the same page after applying discount'},
                {label: 'Go to cart page', value: 'go_to_cart', helpText: 'The discount is applied and the customer is redirected to the cart page.'},
                {
                  label: 'Open cart drawer',
                  value: 'open_cart_drawer',
                  helpText: 'The discount is applied and the cart drawer opens to display the updated cart.',
                  renderChildren: (selected) => selected && (
                    <TextField
                      label={<Text as="span" variant="headingSm">Cart drawer button selector</Text>}
                      autoComplete="off"
                      value={behavior.selector}
                      onChange={(v) => setBehavior((b) => ({...b, selector: v}))}
                      helpText="Enter the CSS selector that your theme uses for the cart button."
                    />
                  ),
                },
              ]}
              selected={[behavior.apply]}
              onChange={(v) => setBehavior((b) => ({...b, apply: v[0]}))}
            />
            <ChoiceList
              title={heading('Trigger: After customer redeems a reward in the widget')}
              choices={[
                {label: 'Add the coupon to cart automatically', value: 'auto_apply', helpText: 'The reward coupon goes straight into the cart, so the customer can check out right away.'},
                {label: 'Let the customer apply it later', value: 'later', helpText: 'The coupon is saved to the customer’s rewards. They apply it themselves when they’re ready to buy.'},
              ]}
              selected={[behavior.widget]}
              onChange={(v) => setBehavior((b) => ({...b, widget: v[0]}))}
            />
            <ChoiceList
              title={heading('Trigger: After customer redeem free gift')}
              choices={[
                {label: 'Customer manually adds to cart', value: 'manual', helpText: 'Customer needs to manually add the free gift to their cart'},
                {label: 'Auto add to cart', value: 'auto', helpText: 'The free gift is automatically added to the customer cart and a confirmation modal is shown'},
                {label: 'Auto add to cart and immediately open cart drawer', value: 'auto_drawer', helpText: 'The free gift is automatically added to the customer cart and the cart drawer opens automatically', renderChildren: () => <Badge tone="info">Recommended</Badge>},
              ]}
              selected={[behavior.freeGift]}
              onChange={(v) => setBehavior((b) => ({...b, freeGift: v[0]}))}
            />
            <BlockStack gap="200">
              {heading('Trigger: After customer redeems free shipping')}
              <TextField
                label="Continue shopping URL"
                labelHidden
                autoComplete="url"
                placeholder="/ or https://yourshop.com/collections/spring"
                value=""
                onChange={() => {}}
                helpText="Destination URL when the customer clicks Continue shopping after redeeming a free shipping reward. Leave blank to use the default /collections/all."
              />
            </BlockStack>
            <ChoiceList
              title={(
                <BlockStack gap="200">
                  {heading('Trigger: Point Calculator link (non-login customers)')}
                  <Banner tone="info">When a non-logged-in customer clicks the ‘Join Reward Program’ link on the points calculator, this setting controls what happens.</Banner>
                </BlockStack>
              )}
              choices={[
                {label: 'Open loyalty widget', value: 'open_widget', helpText: 'The loyalty widget opens so the customer can sign up or log in without leaving the page.'},
                {label: 'Redirect to login page', value: 'go_to_login', helpText: 'Customer is redirected to your store’s login page.'},
              ]}
              selected={[behavior.calc]}
              onChange={(v) => setBehavior((b) => ({...b, calc: v[0]}))}
            />
          </BlockStack>
        </Card>
      </div>
      <Card>
        <BlockStack gap="200">
          {heading('Points exchange rate')}
          <Text as="p" tone="subdued">Set the conversion rate between loyalty points and monetary value. This rate will be used throughout the app to display monetary equivalents of points.</Text>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

/* ---------------------------------------------------------------- Additional features (new card after Limit customer earning) */

function AdditionalFeatures({limitProps}) {
  const [cards, setCards] = useState({revoke: true, preLogin: false, earning: false, freeProduct: false, orderEmail: false});
  const flip = (key) => (on) => setCards((c) => ({...c, [key]: on}));
  const [freeCount, setFreeCount] = useState('1');
  return (
    <BlockStack gap="400">
      <div id="revoke-coupon">
        <Card>
          <BlockStack gap="100">
            <SettingToggle title="Enable customer self-revoke coupon" status={cards.revoke} onToggle={flip('revoke')} />
            <Text as="p" tone="subdued">Allow customers to revoke their own unused coupons if they redeem by mistake or change their mind. This improves flexibility and customer satisfaction.</Text>
          </BlockStack>
        </Card>
      </div>
      <div id="login-signup-urls">
        <Card>
          <BlockStack gap="100">
            <SettingToggle title="Pre-login URLs" status={cards.preLogin} onToggle={flip('preLogin')} button />
            <Text as="p" tone="subdued">By default, customers will be directed to Shopify’s Login and Sign-up pages. If you want them to go to a different page, you can enter custom URLs below.</Text>
          </BlockStack>
        </Card>
      </div>
      <div id="limit-earning">
        <Card>
          <BlockStack gap="100">
            <SettingToggle title="Limit customer earning" status={cards.earning} onToggle={flip('earning')} />
            <Text as="p" tone="subdued">Set a maximum number of points a customer can earn within a specific time period. This helps control program costs and prevent point abuse.</Text>
          </BlockStack>
        </Card>
      </div>
      <CodeLimit {...limitProps} />
      <div id="free-product-coupon">
        <Card>
          <BlockStack gap="200">
            <BlockStack gap="100">
              <SettingToggle title="Show free product coupon" status={cards.freeProduct} onToggle={flip('freeProduct')} />
              <Text as="p" tone="subdued">Display redeemed free products in the cart drawer to encourage customers to use their free product coupon.</Text>
            </BlockStack>
            <TextField label={<Text as="span" variant="headingSm">The number of free products shown in the cart</Text>} type="number" min={1} autoComplete="off" value={freeCount} onChange={setFreeCount} />
          </BlockStack>
        </Card>
      </div>
      <div id="points-in-order-email">
        <Card>
          <BlockStack gap="100">
            <SettingToggle title="Show points earned in the order confirmation email" status={cards.orderEmail} onToggle={flip('orderEmail')} />
            <Text as="p" tone="subdued">Joy adds the points a customer is set to earn to the order as an attribute, so you can show it in Shopify’s own order confirmation email.</Text>
          </BlockStack>
        </Card>
      </div>
    </BlockStack>
  );
}

/* ---------------------------------------------------------------- page */

export function Settings() {
  const {notify, notYet} = useShell();
  const {state, setState} = useScenario();
  const {query} = useRoute();
  const navigate = useNavigate();
  const type = settingsType(query);
  const scrollTo = query.get('scroll');
  const {saved, save} = useLimit();
  const [form, setForm] = useState(saved);
  const [failed, setFailed] = useState(state === 'limit-error');
  const [saveFailed, setSaveFailed] = useState(state === 'save-error');
  const [prefixNote, setPrefixNote] = useState(scrollTo === 'prefix-discount');
  useEffect(() => {
    setForm(saved);
  }, [saved]);
  useEffect(() => {
    setFailed(state === 'limit-error');
    setSaveFailed(state === 'save-error');
  }, [state]);
  useEffect(() => {
    setPrefixNote(scrollTo === 'prefix-discount');
  }, [scrollTo]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (patch) => setForm((f) => ({...f, ...patch}));
  const messageError = form.enabled && !form.message.trim() ? 'Enter a message, or turn the limit off.' : undefined;

  // Deep links land on the new card; General with ?scroll=prefix-discount lands on the prefix card (as in General.js).
  useEffect(() => {
    if (state === 'loading' || state === 'error') return undefined;
    // conflict / test land on the block they show; every other state on the card itself.
    const cardTarget = {conflict: 'own-code-check', test: 'test-a-code'}[state] || 'limit-reward-codes';
    const target = type === 'additional-features' ? cardTarget : scrollTo === 'prefix-discount' ? 'prefix-discount' : null;
    if (!target) return undefined;
    const t = window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({block: 'start'});
      if (target === 'prefix-discount') document.getElementById('default-prefix')?.focus({preventScroll: true});
    }, 80);
    return () => window.clearTimeout(t);
  }, [state, type, scrollTo]);

  const onSave = () => {
    if (messageError) {
      notify('1 field needs attention', {error: true});
      if (type === 'additional-features') document.getElementById('code-limit-message')?.focus();
      else {
        navigate('/settings?type=additional-features');
        window.setTimeout(() => document.getElementById('code-limit-message')?.focus(), 120);
      }
      return;
    }
    // Turning the limit on creates Joy's automatic discount in Shopify; a shop at Shopify's cap of 25 gets an error.
    if (state === 'limit-error' && form.enabled && !saved.enabled) {
      setForm((f) => ({...f, enabled: false}));
      setFailed(true);
      notify('Couldn’t turn on the limit', {error: true});
      return;
    }
    // Any other failure creating or updating Joy's discount (spec E): the switch keeps its value from before Save.
    if (state === 'save-error') {
      setForm((f) => ({...f, enabled: saved.enabled}));
      setSaveFailed(true);
      notify('Couldn’t save', {error: true});
      return;
    }
    save(form);
    setFailed(false);
    setSaveFailed(false);
    notify('Settings saved');
  };

  // Change prefix opens the prefix of the program that issues that format: NB- is the default prefix on
  // Settings › General; a tier or program prefix lives on that program's own page.
  const goToPrefix = (code = '') => {
    if (code && !code.startsWith(saved.prefix)) {
      notify('Opens the reward program that issues this prefix, at its Discount code prefix field.');
      return;
    }
    navigate('/settings?type=general&scroll=prefix-discount');
  };

  const limitProps = {form, set, saved, failed, onDismissFailed: () => setFailed(false), saveFailed, onDismissSaveFailed: () => setSaveFailed(false), messageError, onChangePrefix: goToPrefix};
  let right;
  if (state === 'loading') right = <LoadingView rows={8} />;
  else if (state === 'error') {
    right = (
      <ErrorView title="Couldn’t load your settings" onRetry={() => setState('default')}>
        Something went wrong on our side. Nothing you saved is lost.
      </ErrorView>
    );
  } else if (type === 'general') {
    right = <General form={form} set={set} prefixNote={prefixNote} onDismissNote={() => setPrefixNote(false)} disabled={state === 'disabled'} />;
  } else {
    right = <AdditionalFeatures limitProps={limitProps} />;
  }

  return (
    <Page>
      {dirty ? (
        <ContextualSaveBar
          message="Unsaved changes"
          saveAction={{onAction: onSave, content: 'Save'}}
          discardAction={{onAction: () => setForm(saved), content: 'Discard'}}
        />
      ) : null}
      <h1 className="lc-sr">{type === 'general' ? 'General' : 'Additional features'}</h1>
      <div className="lc-page">
        <Layout>
          <Layout.Section variant="oneThird">
            <div className="lc-sticky">
              <Card padding="0">
                <div className="lc-search">
                  <TextField label="Search settings" labelHidden placeholder="Search settings..." prefix={<span className="lc-ico"><SearchIcon /></span>} autoComplete="off" value="" onChange={() => {}} />
                </div>
                <ActionList
                  items={SECTIONS.map(({type: t, ...s}) => ({
                    ...s,
                    active: t === type,
                    onAction: t ? () => navigate(`/settings?type=${t}`) : notYet,
                  }))}
                />
              </Card>
            </div>
          </Layout.Section>
          <Layout.Section>{right}</Layout.Section>
        </Layout>
      </div>
    </Page>
  );
}
