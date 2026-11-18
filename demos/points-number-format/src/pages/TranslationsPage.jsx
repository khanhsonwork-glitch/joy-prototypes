// Joy admin › Settings › Translations (Translations/Translation.js, DefaultLanguageCard.js, AdditionalLanguageCard.js,
// Parts/TranslationEditorTable.js on avada/master). Unchanged screen: it is the way into the Unified widget editor,
// where the new Number format row and the Points added via API message live.
import React, {useState} from 'react';
import {Badge, BlockStack, Box, Button, Card, Icon, InlineGrid, InlineStack, Select, Tabs, Text} from '@shopify/polaris';
import {ChevronRightIcon, PlusIcon} from '@shopify/polaris-icons';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useSettings} from '../state/settings.jsx';
import {LANGUAGES} from '../data/numberFormat.js';
import {LockedBanner, SettingsLayout, SyncBanner} from './shared.jsx';

// translationTab() in config/appMenu.js for a shop on the unified widget (useWidgetV4).
const SURFACES = [
  {id: 'widget-v4', label: 'Unified widget'},
  {id: 'loyalty-page-v2', label: 'Loyalty page'},
  {id: 'blocks', label: 'Storefront blocks'},
  {id: 'customer-account', label: 'Customer Account'},
  {id: 'checkout', label: 'Checkout'},
  {id: 'point-calculator', label: 'Point calculator'},
  {id: 'visit-website', label: 'Visit website popup'},
  {id: 'reward-reminder', label: 'Reward reminder'},
  {id: 'signup', label: 'Sign up widget'},
  {id: 'redeem-inline', label: 'Redeem in Cart'},
  {id: 'referral', label: 'Referral'},
  {id: 'signup-block', label: 'Sign-up block'},
  {id: 'milestone', label: 'Milestone'},
];

function LanguageTable({code, no, active, isDefault, disabled}) {
  const navigate = useNavigate();
  const {notify} = useShell();
  return (
    <Card padding="0">
      <div className="pnf-lang__header">
        <InlineStack gap="200" align="space-between" blockAlign="center" wrap={false}>
          <InlineStack gap="200" blockAlign="center">
            {isDefault ? null : <Badge>{String(no)}</Badge>}
            <Text as="h3" variant="headingSm">{LANGUAGES[code].name}</Text>
            {isDefault ? <Badge tone="info">Default</Badge> : <Badge tone={active ? 'success' : undefined}>{active ? 'On' : 'Off'}</Badge>}
          </InlineStack>
          {isDefault ? null : <Button variant="tertiary" disabled={disabled} accessibilityLabel={`${LANGUAGES[code].name} actions`} onClick={() => notify('Activate, deactivate and delete sit in this menu in the app')}>•••</Button>}
        </InlineStack>
      </div>
      <ul className="pnf-lang__items">
        {SURFACES.map((s) => (
          <li key={s.id}>
            <button type="button" className="pnf-lang__item"
              onClick={() => (s.id === 'widget-v4' ? navigate(`/translations?lang=${code}`) : notify(`${s.label} translations aren't part of this prototype`))}>
              <Text as="span" variant="bodyMd" fontWeight="bold">{s.label}</Text>
              <Icon source={ChevronRightIcon} />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function TranslationsPage() {
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const {saved} = useSettings();
  const {query} = useRoute();
  const [tab, setTab] = useState(() => Math.max(0, ['default', 'additional', 'embed'].indexOf(query.get('tab') || 'default')));
  const [detect, setDetect] = useState('storefront');
  const disabled = state === 'disabled';
  const tabs = [
    {id: 'default', content: 'Default language'},
    {id: 'additional', content: 'Detected Language'},
    {id: 'embed', content: 'Content embed language'},
  ];

  let body;
  if (state === 'loading') body = <LoadingView rows={8} />;
  else if (state === 'error') {
    body = (
      <ErrorView title="Couldn't load your translations" onRetry={() => setState('default')}>
        Joy couldn't reach your translations just now. Nothing was changed; try again in a moment.
      </ErrorView>
    );
  } else if (tab === 0) {
    body = (
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingSm">Default language</Text>
            <Text as="p" tone="subdued">This is the widget's default language. If Detect Language is enabled and the customer's language is not in the Detected Language List, the default language will be used.</Text>
            <div className="pnf-half">
              <Select label="Default language" disabled={disabled} value={saved.primaryLanguage} onChange={() => notify('Changing the default language is not part of this prototype')}
                options={[{label: 'English', value: 'en'}]} />
            </div>
          </BlockStack>
        </Card>
        <LanguageTable code={saved.primaryLanguage} isDefault disabled={disabled} />
      </BlockStack>
    );
  } else if (tab === 1) {
    body = (
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingSm">Detected Language</Text>
            <Text as="p" tone="subdued">Choose how to detect your customer'language</Text>
            <div className="pnf-half">
              <Select label="Detect language by" disabled={disabled} value={detect} onChange={setDetect}
                options={[
                  {label: 'Shopify language selector (Shopify Translate & Adapt)', value: 'storefront'},
                  {label: "Customer's IP", value: 'ip'},
                  {label: "Browser's language", value: 'browser'},
                ]} />
            </div>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="300">
            <InlineGrid columns="1fr auto" alignItems="center">
              <Text as="h2" variant="headingSm">Detected language list</Text>
              <Button icon={PlusIcon} disabled={disabled} onClick={() => notify('Add language opens the language picker in the app')}>Add language</Button>
            </InlineGrid>
            <Text as="p">Add a variety of languages and easily turn on or off these languages</Text>
            {saved.languages.length ? saved.languages.map((l, i) => (
              <LanguageTable key={l.code} code={l.code} no={i + 1} active={l.active} disabled={disabled} />
            )) : (
              <EmptyView heading="No detected languages yet"
                action={{content: 'Add language', disabled, onAction: () => notify('Add language opens the language picker in the app')}}>
                Customers see your default language until you add another one.
              </EmptyView>
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    );
  } else {
    body = (
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingSm">Embed Content Translation</Text>
          <Text as="p" tone="subdued">Select languages to automatically translate your embed content. Your content will be translated to the selected languages when displayed on your site.</Text>
          <Box><Badge tone="info">Note: This feature requires the Shopify Translate & Adapt app to be installed and configured.</Badge></Box>
        </BlockStack>
      </Card>
    );
  }

  return (
    <SettingsLayout selected="translations">
      <BlockStack gap="400">
        {disabled ? <LockedBanner /> : null}
        {state === 'worst' ? <SyncBanner what="translations" /> : null}
        <Tabs tabs={tabs} selected={tab} onSelect={setTab} />
        {body}
      </BlockStack>
    </SettingsLayout>
  );
}
