// Settings › General (Setting.js + Details/General.js in the Joy admin), scrolled to the "Redemption behavior" card
// (Details/CustomerBehaviorSettings.js). New: "Limit Joy reward codes per order" at the end of that card, with the
// formats Joy counts as Joy codes, a check against the shop's own codes and a code tester. Saved with the page save bar.
import React, {useEffect, useRef, useState} from 'react';
import {
  ActionList, Badge, Banner, BlockStack, Card, Checkbox, ChoiceList, ContextualSaveBar, Divider,
  Layout, Page, RadioButton, Select, Text, TextField,
} from '@shopify/polaris';
import {
  AppExtensionIcon, ClockIcon, CodeIcon, ColorIcon, EmailNewsletterIcon, LanguageTranslateIcon, NotificationIcon,
  OrderDraftIcon, PaymentIcon, PlusCircleIcon, SearchIcon,
} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useLimit} from '../state/limit.jsx';
import {CodeLimit} from './CodeLimit.jsx';

const SECTIONS = [
  {content: 'General', icon: AppExtensionIcon, active: true},
  {content: 'Brand', icon: ColorIcon},
  {content: 'Email', icon: EmailNewsletterIcon},
  {content: 'Notifications', icon: NotificationIcon},
  {content: 'Pre-launch', icon: ClockIcon},
  {content: 'Order', icon: OrderDraftIcon},
  {content: 'Translations', icon: LanguageTranslateIcon},
  {content: 'Subscription', icon: PaymentIcon},
  {content: 'Developers', icon: CodeIcon},
  {content: 'Additional features', icon: PlusCircleIcon},
];

const heading = (text) => <Text as="h3" variant="headingSm">{text}</Text>;

export function Settings() {
  const {notify, notYet} = useShell();
  const {state, setState} = useScenario();
  const {saved, save} = useLimit();
  const [form, setForm] = useState(saved);
  const [failed, setFailed] = useState(state === 'limit-error');
  const [prefixNote, setPrefixNote] = useState(false);
  const [behavior, setBehavior] = useState({apply: 'open_cart_drawer', selector: 'cart-drawer', widget: 'auto_apply', freeGift: 'auto_drawer', calc: 'go_to_login'});
  const prefixRef = useRef(null);
  useEffect(() => {
    setForm(saved);
  }, [saved]);
  useEffect(() => {
    setFailed(state === 'limit-error');
    setPrefixNote(false);
  }, [state]);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (patch) => setForm((f) => ({...f, ...patch}));
  const messageError = form.enabled && !form.message.trim() ? 'Enter a message, or turn the limit off.' : undefined;

  // The real page scrolls to the card when opened from a deep link (#customer-behavior-settings).
  useEffect(() => {
    if (state === 'loading' || state === 'error') return undefined;
    const t = window.setTimeout(() => document.getElementById('code-limit')?.scrollIntoView({block: 'start'}), 60);
    return () => window.clearTimeout(t);
  }, [state]);

  const onSave = () => {
    if (messageError) {
      notify('1 field needs attention', {error: true});
      document.getElementById('code-limit-message')?.focus();
      return;
    }
    // Turning the limit on creates Joy's automatic discount in Shopify; a shop at Shopify's cap of 25 gets an error.
    if (state === 'limit-error' && form.enabled && !saved.enabled) {
      setForm((f) => ({...f, enabled: false}));
      setFailed(true);
      notify('Couldn’t turn on the limit', {error: true});
      return;
    }
    save(form);
    setFailed(false);
    notify('Settings saved');
  };

  // Change prefix opens the prefix of the program that issues that format: NB- is the default prefix on this page;
  // a tier or program prefix lives on that program's own page.
  const goToPrefix = (code = '') => {
    if (code && !code.startsWith(saved.prefix)) {
      notify('Opens the reward program that issues this prefix, at its Discount code prefix field.');
      return;
    }
    setPrefixNote(true);
    window.setTimeout(() => {
      prefixRef.current?.scrollIntoView({block: 'center'});
      document.getElementById('default-prefix')?.focus();
    }, 30);
  };

  let right;
  if (state === 'loading') right = <LoadingView rows={8} />;
  else if (state === 'error') {
    right = (
      <ErrorView title="Couldn’t load your settings" onRetry={() => setState('default')}>
        Something went wrong on our side. Nothing you saved is lost.
      </ErrorView>
    );
  } else {
    right = (
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
        <div ref={prefixRef}>
          <Card>
            <BlockStack gap="200">
              {heading('Default discount code prefix')}
              <Text as="p" tone="subdued">Default prefix for discount rewards (can be overridden in each reward program)</Text>
              {prefixNote ? (
                <Banner tone="info" onDismiss={() => setPrefixNote(false)}>
                  <p>New Joy codes will start with the new prefix. Codes Joy already issued with {saved.prefix} stay valid and still count as Joy codes until they’re used, so choose Don’t count as Joy code for your own codes that should never count.</p>
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
                disabled={state === 'disabled'}
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
              <Divider />
              <CodeLimit
                form={form}
                set={set}
                saved={saved}
                failed={failed}
                onDismissFailed={() => setFailed(false)}
                messageError={messageError}
                onChangePrefix={goToPrefix}
              />
            </BlockStack>
          </Card>
        </div>
        <Card>
          <BlockStack gap="200">
            {heading('Points exchange rate')}
            <Checkbox label="Show the money value of points to customers" checked={false} onChange={notYet} />
          </BlockStack>
        </Card>
      </BlockStack>
    );
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
      <h1 className="lc-sr">General settings</h1>
      <div className="lc-page">
      <Layout>
        <Layout.Section variant="oneThird">
          <div className="lc-sticky">
            <Card padding="0">
              <div className="lc-search">
                <TextField label="Search settings" labelHidden placeholder="Search settings..." prefix={<span className="lc-ico"><SearchIcon /></span>} autoComplete="off" value="" onChange={() => {}} />
              </div>
              <ActionList items={SECTIONS.map((s) => ({...s, onAction: s.active ? undefined : notYet}))} />
            </Card>
          </div>
        </Layout.Section>
        <Layout.Section>{right}</Layout.Section>
      </Layout>
      </div>
    </Page>
  );
}

