// #/settings/general: Joy › Settings › General (pages/Setting/Setting.js + Details/General.js on avada/master; the app's
// own URL is /settings?type=general). First card: "Membership enrollment" (Details/MembershipEnrollmentSettings.js).
// Changes:
// - When "Exclude B2B customers" is ticked and Joy counted 0 Shopify companies, a warning under the checkbox (below its
//   help text) says nobody is excluded. Unticked, or a shop with companies: no warning.
// - Below Advanced (?plan=essential) the checkbox is locked like Customer opt-in / Manually assigned: disabled with the
//   "Available on Advanced" badge. A shop that ticked it before the release keeps it ticked and can untick it;
//   once unticked it is locked like the others (?plan=essential&excluded=1).
import React, {useState} from 'react';
import {Banner, BlockStack, Button, Card, Checkbox, ChoiceList, Divider, Icon, InlineStack, Link, Page, Select, Text, TextField} from '@shopify/polaris';
import {
  AppExtensionIcon, ClockIcon, CodeIcon, ColorIcon, EmailNewsletterIcon, LanguageTranslateIcon, NotificationIcon, OrderDraftIcon, PaymentIcon,
  PlusCircleIcon, SearchIcon,
} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useShop} from '../kit/scenario.jsx';
import {useStore} from '../state/store.jsx';
import {ExcludeB2bWarning} from '../components/NoCompanyWarning.jsx';
import {PlanBadge} from '../components/PlanBadge.jsx';

// listSettings.js order and labels (SettingDetails.listSetting).
const SECTIONS = [
  {value: 'general', label: 'General', icon: AppExtensionIcon},
  {value: 'colors', label: 'Brand', icon: ColorIcon},
  {value: 'email-report', label: 'Email', icon: EmailNewsletterIcon},
  {value: 'notifications', label: 'Notifications', icon: NotificationIcon},
  {value: 'before-launch', label: 'Pre-launch', icon: ClockIcon},
  {value: 'order', label: 'Order', icon: OrderDraftIcon},
  {value: 'translations', label: 'Translations', icon: LanguageTranslateIcon},
  {value: 'subscription', label: 'Subscription', icon: PaymentIcon},
  {value: 'developers', label: 'Developers', icon: CodeIcon},
  {value: 'additional-features', label: 'Additional features', icon: PlusCircleIcon},
];

const MODE_AUTO = 'auto_enroll';
const MODE_OPT_IN = 'customer_opt_in';
const MODE_MANUAL = 'manually_assigned';

function SettingsNav() {
  const {notify} = useShell();
  const [query, setQuery] = useState('');
  return (
    <Card padding="200">
      <BlockStack gap="200">
        <TextField
          label="Search settings"
          labelHidden
          placeholder="Search settings…"
          prefix={<Icon source={SearchIcon} />}
          value={query}
          onChange={setQuery}
          autoComplete="off"
        />
        <ul className="set-nav">
          {SECTIONS.map((s) => (
            <li key={s.value}>
              <button
                type="button"
                className={s.value === 'general' ? 'set-nav__item is-selected' : 'set-nav__item'}
                aria-current={s.value === 'general' ? 'page' : undefined}
                onClick={() => (s.value === 'general' ? null : notify('This prototype draws only Settings › General'))}
              >
                <Icon source={s.icon} />
                <span>{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </BlockStack>
    </Card>
  );
}

function MembershipEnrollment({form, setForm}) {
  const {hasB2bCompanies, isAdvanced} = useShop();
  const {notify} = useShell();
  const help = () => notify('Opens the Joy help center in a new tab');
  const {mode, excludeB2B} = form;
  // Locked below Advanced unless it is still ticked from before the release (unticking it locks it).
  const excludeLocked = !isAdvanced && !excludeB2B;
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text as="h2" variant="headingSm">Membership enrollment</Text>
          <Text as="p" tone="subdued">
            How do customers become loyalty members? <Link monochrome onClick={help}>Learn more</Link>
          </Text>
        </BlockStack>
        <ChoiceList
          title="Membership enrollment"
          titleHidden
          choices={[
            {label: 'Auto-enroll', value: MODE_AUTO, helpText: 'Once customers create a Shopify customer account, they are synced to Joy and automatically enrolled as loyalty members.'},
            {
              label: 'Customer opt-in',
              value: MODE_OPT_IN,
              helpText: 'Customers must click "Join Program" on your storefront to become members.',
              disabled: !isAdvanced,
              renderChildren: (selected) =>
                !isAdvanced || selected ? (
                  <BlockStack gap="200">
                    {!isAdvanced ? <span><PlanBadge /></span> : null}
                    {selected ? (
                      <Banner tone="info">
                        <BlockStack gap="100">
                          <Text as="p">Want to auto-tag members when they join?</Text>
                          <span><Link onClick={() => notify('Opens Settings › Additional features › Auto-tag customers')}>Go to Auto-tag customers</Link></span>
                        </BlockStack>
                      </Banner>
                    ) : null}
                  </BlockStack>
                ) : null,
            },
            {
              label: 'Manually assigned',
              value: MODE_MANUAL,
              helpText: (
                <>
                  You assign each customer manually. Automatic enrollment is ignored. <Link onClick={help}>Learn more</Link>
                </>
              ),
              disabled: !isAdvanced,
              renderChildren: () => (!isAdvanced ? <span><PlanBadge /></span> : null),
            },
          ]}
          selected={[mode]}
          onChange={([next]) => setForm((f) => ({...f, mode: next}))}
        />
        {mode !== MODE_MANUAL ? (
          <>
            <Divider />
            <BlockStack gap="300">
              <Checkbox
                label="Exclude B2B customers"
                helpText="Exclude B2B customers from loyalty program. Only direct-to-consumer customers will earn and redeem points."
                checked={excludeB2B}
                disabled={excludeLocked}
                onChange={(checked) => setForm((f) => ({...f, excludeB2B: checked}))}
              />
              {excludeLocked ? <div className="set-under-checkbox"><PlanBadge /></div> : null}
              {excludeB2B && !hasB2bCompanies ? <ExcludeB2bWarning /> : null}
            </BlockStack>
          </>
        ) : null}
        {mode !== MODE_AUTO ? (
          <>
            <Divider />
            <BlockStack gap="200">
              <Text as="p">Convert existing members to guests</Text>
              <Text as="p" tone="subdued">Reset all current members back to guests. They will need to re-enroll via Join Program (opt-in) or be manually reassigned.</Text>
              <Banner tone="warning">
                <Text as="p">This action will convert all existing loyalty program members to guests. This cannot be undone.</Text>
              </Banner>
              <InlineStack>
                <Button tone="critical" onClick={() => notify('Asks to confirm before converting members')}>Convert all members to guests</Button>
              </InlineStack>
            </BlockStack>
          </>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function InAppLanguage() {
  const [showEverywhere, setShowEverywhere] = useState(false);
  const {notify} = useShell();
  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingSm">In-app language</Text>
        <Text as="p" tone="subdued">
          Choose the language for the app's user interface. This setting will not change the language used in your online store.{' '}
          <Link monochrome onClick={() => notify('Opens the Joy help center in a new tab')}>Learn more</Link>
        </Text>
        <BlockStack gap="400">
          <Select label="In-app language" labelHidden options={[{label: 'English (uk)', value: 'en'}]} value="en" onChange={() => {}} />
          <Checkbox label="Display language settings on every screen." checked={showEverywhere} onChange={setShowEverywhere} />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

function StoreTimezone() {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">Store timezone</Text>
        <Text as="p" tone="subdued">Select the timezone for all loyalty programs. All programs will start at 00:00:00 of the start date in this timezone.</Text>
        <Banner tone="info">
          <Text as="p">This setting affects all your programs configured in the app including VIP Tiers, Earning Programs, Rewards, and Promotional Campaigns.</Text>
        </Banner>
        <Select
          label="Store timezone"
          options={[{label: '(UTC-05:00) Eastern Time (US & Canada)', value: 'America/New_York'}]}
          value="America/New_York"
          onChange={() => {}}
        />
      </BlockStack>
    </Card>
  );
}

/** Keyed by plan in App.jsx: switching plan in the Prototype panel opens that shop's saved settings. */
export function SettingsPage() {
  const {enrollmentFor, saveEnrollment} = useStore();
  const {planKey} = useShop();
  const {notify} = useShell();
  const enrollment = enrollmentFor(planKey);
  const [form, setForm] = useState(enrollment);
  const dirty = JSON.stringify(form) !== JSON.stringify(enrollment);
  return (
    <Page
      title="General"
      primaryAction={{content: 'Save', disabled: !dirty, onAction: () => {saveEnrollment(planKey, form); notify('Settings saved');}}}
      secondaryActions={dirty ? [{content: 'Discard', onAction: () => setForm(enrollment)}] : []}
    >
      <div className="set-root">
        <div className="set-grid">
          <div className="set-grid__nav"><SettingsNav /></div>
          <BlockStack gap="400">
            <div id="customer-eligibility"><MembershipEnrollment form={form} setForm={setForm} /></div>
            <InAppLanguage />
            <StoreTimezone />
          </BlockStack>
        </div>
      </div>
    </Page>
  );
}
