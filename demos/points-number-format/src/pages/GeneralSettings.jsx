// Joy admin › Settings › General (Setting/Details/General.js on avada/master), with the new "Number format" card
// right after Date format and before Currency format. The other cards are today's cards, kept so the new one sits in
// its real place. The new card mirrors Custom point label: same radio list, same "Use translation" info banner.
import React, {useEffect, useMemo, useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, Card, Checkbox, ChoiceList, Divider, InlineStack, Link, Select, Text, TextField,
} from '@shopify/polaris';
import {MagicIcon} from '@shopify/polaris-icons';
import {useShell, useSaveBar} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {MODE_LOCALE, MODE_SAME, MODE_TRANSLATION, useSettings} from '../state/settings.jsx';
import {BIG_SAMPLES, FORMATS, LANGUAGES, LOCALE, SAMPLES, formatPoints, samplePair} from '../data/numberFormat.js';
import {LockedBanner, SettingsLayout, SyncBanner, useLeaveGuard} from './shared.jsx';

const FORM_KEYS = [
  'numberMode', 'numberFormat', 'membership', 'inAppLanguage', 'showLanguageEverywhere', 'timezone', 'dateFormat', 'timeFormat',
  'currencyFormat', 'enabledCustomPointLabel', 'pointLabelMode', 'pointSingular', 'pointPlural', 'pointPosition', 'prefix',
  'applyDiscount', 'reviewStatus', 'googleReviewStatus',
];
const pick = (obj) => Object.fromEntries(FORM_KEYS.map((k) => [k, obj[k]]));

/** "1'125 points" with the merchant's own point label and position (Custom point label). */
export function pointsText(amount, format, language, form) {
  const label = amount === 1 ? form.pointSingular || 'point' : form.pointPlural || 'points';
  const number = formatPoints(amount, format, language);
  return form.pointPosition === 'before' ? `${label} ${number}` : `${number} ${label}`;
}

function Heading({children}) {
  return <Text as="h2" variant="headingSm">{children}</Text>;
}

/** Languages the storefront speaks: default language first, then the detected ones (Settings › Translations). */
function shopLanguages(saved) {
  return [saved.primaryLanguage, ...saved.languages.map((l) => l.code)];
}

/** "English 1,125 · 11,250; Italian 1125 · 11.250 …", at most four languages then "and N more". */
function perLanguageLine(codes, formatOf, samples) {
  const shown = codes.slice(0, 4).map((code) => `${LANGUAGES[code].name} ${samplePair(formatOf(code), code, samples)}`);
  const more = codes.length - 4;
  return `${shown.join('; ')}${more > 0 ? `; and ${more} more ${more === 1 ? 'language' : 'languages'}` : ''}`;
}

function NumberFormatCard({form, set, saved, disabled}) {
  const codes = shopLanguages(saved);
  const samples = saved.big ? BIG_SAMPLES : SAMPLES;
  const selectedFormat = FORMATS.find((f) => f.value === form.numberFormat) || FORMATS[0];
  const sameLine = samples.map((n) => pointsText(n, form.numberFormat, 'en', form)).join(' · ');
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack gap="200" blockAlign="center">
          <Heading>Number format</Heading>
          <span className="pnf-new" aria-label="New in this prototype">New</span>
        </InlineStack>
        <Text as="p" tone="subdued">
          How point amounts appear to your customers — in the loyalty widget, customer account pages, and email notifications.
          Applies to point balances, earn and redeem amounts, and activity history.
        </Text>
        <ChoiceList
          title="Number format mode"
          titleHidden
          disabled={disabled}
          selected={[form.numberMode]}
          onChange={([value]) => set('numberMode')(value)}
          choices={[
            {
              value: MODE_LOCALE,
              label: 'Follow each language',
              helpText: `Numbers are written the way each customer's language writes them. Example: ${perLanguageLine(codes, () => LOCALE, samples)}`,
            },
            {
              value: MODE_SAME,
              label: 'Same format for all languages',
              helpText: form.numberMode === MODE_SAME ? undefined : 'One format everywhere, whatever language the customer reads.',
              renderChildren: (isSelected) => isSelected && (
                <div className="pnf-choice-child">
                  <BlockStack gap="100">
                    <Select
                      label="Format"
                      disabled={disabled}
                      options={FORMATS.map((f) => ({label: f.label, value: f.value}))}
                      value={selectedFormat.value}
                      onChange={set('numberFormat')}
                    />
                    <Text as="p" tone="subdued" id="pnf-same-example">{`Customers see: ${sameLine}`}</Text>
                  </BlockStack>
                </div>
              ),
            },
            {
              value: MODE_TRANSLATION,
              label: 'Set per language in Translations',
              helpText: form.numberMode === MODE_TRANSLATION ? undefined : 'Pick a format for each language, next to its point labels.',
              renderChildren: (isSelected) => isSelected && (
                <div className="pnf-choice-child">
                  <BlockStack gap="200">
                    <Banner tone="info">
                      <p>
                        {'Each language uses the number format you set for it, so a customer reading Italian can see 1.125 while English shows 1,125. To set the format for each language, please go to the '}
                        <Link url="/translations?field=number_format">Translation</Link>
                      </p>
                    </Banner>
                    <Text as="p" tone="subdued">{`Customers see: ${perLanguageLine(codes, (code) => saved.perLanguage[code] || LOCALE, samples)}`}</Text>
                  </BlockStack>
                </div>
              ),
            },
          ]}
        />
      </BlockStack>
    </Card>
  );
}

function CustomPointLabelCard({form, set, disabled}) {
  const {notify} = useShell();
  const on = form.enabledCustomPointLabel;
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack gap="200" align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Heading>Custom point label</Heading>
            <Badge tone={on ? 'success' : undefined}>{on ? 'On' : 'Off'}</Badge>
          </InlineStack>
          <InlineStack gap="200">
            <Button icon={MagicIcon} disabled={disabled || !on} onClick={() => notify('AI Suggestions opens here in the app')}>AI Suggestions</Button>
            <Button disabled={disabled} onClick={() => set('enabledCustomPointLabel')(!on)}>{on ? 'Turn off' : 'Turn on'}</Button>
          </InlineStack>
        </InlineStack>
        <Text as="p" tone="subdued">{`Change loyalty point’s label into another word to match your own business.${on ? '' : ' Turn off to use the default settings'}`}</Text>
        {on ? (
          <BlockStack gap="400">
            <ChoiceList
              title="Point label mode"
              disabled={disabled}
              selected={[form.pointLabelMode]}
              onChange={([v]) => set('pointLabelMode')(v)}
              choices={[
                {value: 'custom', label: 'Same label for all languages'},
                {value: 'translation', label: 'Different labels per language (editable in Translations)'},
              ]}
            />
            {form.pointLabelMode === 'translation' ? (
              <Banner tone="info">
                <p>
                  {'The point label will be automatically translated based on the customer\'s language. To edit the "point" and "points" labels, please go to the '}
                  <Link url="/translations?field=point">Translation</Link>
                </p>
              </Banner>
            ) : (
              <div className="pnf-grid-2">
                <TextField label="Singular 'point' label" value={form.pointSingular} placeholder="point" onChange={set('pointSingular')} disabled={disabled} autoComplete="off" />
                <TextField label="Plural 'point' label" value={form.pointPlural} placeholder="points" onChange={set('pointPlural')} disabled={disabled} autoComplete="off" />
              </div>
            )}
            <ChoiceList
              title="Place 'point' label"
              disabled={disabled}
              selected={[form.pointPosition]}
              onChange={([v]) => set('pointPosition')(v)}
              choices={[{value: 'before', label: 'before point amount'}, {value: 'after', label: 'after point amount'}]}
            />
          </BlockStack>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function OtherCardsBefore({form, set, disabled}) {
  const {notify} = useShell();
  return (
    <>
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <Heading>Membership enrollment</Heading>
            <Text as="p" tone="subdued">How do customers become loyalty members? <Link onClick={() => notify('Opens the Joy help center')}>Learn more</Link></Text>
          </BlockStack>
          <ChoiceList title="Membership enrollment" titleHidden disabled={disabled} selected={[form.membership]} onChange={([v]) => set('membership')(v)}
            choices={[
              {value: 'auto', label: 'Auto-enroll', helpText: 'Once customers create a Shopify customer account, they are synced to Joy and automatically enrolled as loyalty members.'},
              {value: 'opt_in', label: 'Customer opt-in', helpText: 'Customers must click "Join Program" on your storefront to become members.'},
              {value: 'manual', label: 'Manually assigned', helpText: 'You assign each customer manually. Automatic enrollment is ignored.'},
            ]} />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="200">
          <Heading>In-app language</Heading>
          <Text as="p" tone="subdued">Choose the language for the app's user interface. This setting will not change the language used in your online store</Text>
          <Select label="In-app language" labelHidden disabled={disabled} value={form.inAppLanguage} onChange={set('inAppLanguage')}
            options={[{label: 'English', value: 'en'}, {label: 'Français', value: 'fr'}, {label: 'Deutsch', value: 'de'}, {label: 'Italiano', value: 'it'}]} />
          <Checkbox label="Display language settings on every screen." disabled={disabled} checked={form.showLanguageEverywhere} onChange={set('showLanguageEverywhere')} />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="200">
          <Heading>Store timezone</Heading>
          <Text as="p" tone="subdued">Select the timezone for all loyalty programs. All programs will start at 00:00:00 of the start date in this timezone.</Text>
          <Banner tone="info"><p>This setting affects all your programs configured in the app including VIP Tiers, Earning Programs, Rewards, and Promotional Campaigns.</p></Banner>
          <Select label="Store timezone" disabled={disabled} value={form.timezone} onChange={set('timezone')}
            options={['(UTC-08:00) Pacific Time (US & Canada)', '(UTC-05:00) Eastern Time (US & Canada)', '(UTC+00:00) London', '(UTC+01:00) Rome, Paris, Berlin'].map((v) => ({label: v, value: v}))} />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="200">
          <Heading>Date format</Heading>
          <Text as="p" tone="subdued">How dates appear to your customers — in the loyalty widget, customer account pages, and email notifications. Applies to coupon expiry, points expiry, pending points availability, and activity dates.</Text>
          <Text as="p" tone="subdued">Note: <Link onClick={() => notify('Opens the Birthday program')}>Birthday program</Link> dates have their own format, set inside the Birthday program.</Text>
          <ChoiceList title="Date format" titleHidden disabled={disabled} selected={[form.dateFormat]} onChange={([v]) => set('dateFormat')(v)}
            choices={[
              {value: 'MM/DD/YYYY', label: 'MM/DD/YYYY — 06/30/2026'},
              {value: 'DD/MM/YYYY', label: 'DD/MM/YYYY — 30/06/2026'},
              {value: 'YYYY/MM/DD', label: 'YYYY/MM/DD — 2026/06/30'},
              {value: 'YYYY-MM-DD', label: 'YYYY-MM-DD — 2026-06-30'},
            ]} />
          <Box paddingBlockStart="400">
            <BlockStack gap="200">
              <Heading>Time format</Heading>
              <Text as="p" tone="subdued">How times appear in your customers' activity history.</Text>
              <ChoiceList title="Time format" titleHidden disabled={disabled} selected={[form.timeFormat]} onChange={([v]) => set('timeFormat')(v)}
                choices={[{value: 'HH:mm', label: '24-hour — 14:30'}, {value: 'hh:mm A', label: '12-hour — 2:30 PM'}]} />
            </BlockStack>
          </Box>
        </BlockStack>
      </Card>
    </>
  );
}

function CurrencyFormatCard({form, set, disabled}) {
  const {notify} = useShell();
  return (
    <Card>
      <BlockStack gap="200">
        <Heading>Currency format</Heading>
        <Text as="p" tone="subdued">
          Choose which Shopify currency format Joy widgets use when displaying prices. The format templates come from Settings → General → Currency display in your Shopify admin.{' '}
          <Link onClick={() => notify('Opens Shopify settings in a new tab')}>Edit in Shopify</Link>
        </Text>
        <ChoiceList title="Currency format" titleHidden disabled={disabled} selected={[form.currencyFormat]} onChange={([v]) => set('currencyFormat')(v)}
          choices={[
            {value: 'without', label: 'Use HTML without currency', helpText: 'Follows your Shopify HTML without currency setting. Example: $1,234.50'},
            {value: 'with', label: 'Use HTML with currency', helpText: 'Follows your Shopify HTML with currency setting. Example: $1,234.50 USD'},
          ]} />
      </BlockStack>
    </Card>
  );
}

function OtherCardsAfter({form, set, saved, disabled}) {
  const {notify} = useShell();
  return (
    <>
      <Card>
        <BlockStack gap="200">
          <Heading>Default discount code prefix</Heading>
          <Text as="p" tone="subdued">Default prefix for discount rewards (can be overridden in each reward program)</Text>
          <TextField label="Default discount code prefix" labelHidden disabled={disabled} value={form.prefix} placeholder="E.g: JOY-" onChange={set('prefix')}
            autoComplete="off" helpText="Remove spaces and special characters for seamless discount code copying by customers" />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <Heading>Redemption behavior</Heading>
          </BlockStack>
          <ChoiceList title="Trigger: Apply discount" disabled={disabled} selected={[form.applyDiscount]} onChange={([v]) => set('applyDiscount')(v)}
            choices={[
              {value: 'stay', label: 'Stay on current page', helpText: 'Customer remain on the same page after applying discount'},
              {value: 'go_to_cart', label: 'Go to cart page', helpText: 'The discount is applied and the customer is redirected to the cart page.'},
              {value: 'open_cart_drawer', label: 'Open cart drawer', helpText: 'The discount is applied and the cart drawer opens to display the updated cart.'},
            ]} />
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="200">
          <Heading>Points exchange rate</Heading>
          <Text as="p" tone="subdued">
            Set the conversion rate between loyalty points and monetary value. This rate will be used throughout the app to display monetary equivalents of points.{' '}
            <Link onClick={() => notify('Opens the Joy help center')}>Learn more</Link>
          </Text>
          <InlineStack align="space-between" blockAlign="center" gap="200" wrap>
            <Text as="p">{`Exchange rate configured: ${saved.exchangePoints.toLocaleString('en-US')} points = $1`}</Text>
            <InlineStack gap="200">
              <Button variant="tertiary" disabled={disabled} onClick={() => notify('Edit exchange rate opens here in the app')}>Edit</Button>
              <Button variant="tertiary" tone="critical" disabled={disabled} onClick={() => notify('Delete asks to confirm in the app')}>Delete</Button>
            </InlineStack>
          </InlineStack>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Heading>Default status for Product reviews</Heading>
            <ChoiceList title="Default status for Product reviews" titleHidden disabled={disabled} selected={[form.reviewStatus]} onChange={([v]) => set('reviewStatus')(v)}
              choices={[
                {value: 'pending', label: 'Pending', helpText: 'Customers need to wait for in-app review approval to get reward points.'},
                {value: 'approved', label: 'Approved', helpText: 'Customers receive reward points as soon as they complete a review.'},
              ]} />
          </BlockStack>
          <Divider />
          <BlockStack gap="200">
            <Heading>Default status for Google Maps reviews</Heading>
            <ChoiceList title="Default status for Google Maps reviews" titleHidden disabled={disabled} selected={[form.googleReviewStatus]} onChange={([v]) => set('googleReviewStatus')(v)}
              choices={[
                {value: 'pending', label: 'Pending', helpText: 'Customers need to wait for Google Maps review approval to get reward points.'},
                {value: 'approved', label: 'Approved', helpText: 'Customers receive reward points as soon as they submit a Google Maps review.'},
              ]} />
          </BlockStack>
        </BlockStack>
      </Card>
    </>
  );
}

export function GeneralSettings() {
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const {saved, save} = useSettings();
  const initial = useMemo(() => pick(saved), [saved]);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);
  const set = (key) => (value) => setForm((f) => ({...f, [key]: value}));
  const disabled = state === 'disabled';
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const discard = () => setForm(initial);
  const onSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      save(form);
      setSaving(false);
      notify('Settings saved');
    }, 500);
  };
  useSaveBar({dirty: dirty && !disabled, saving, onSave, onDiscard: discard});
  const leave = useLeaveGuard(dirty && !disabled, discard);

  // The card a reviewer opens this link for: bring it into view (the page is long; on a phone the menu card sits above it).
  useEffect(() => {
    if (state === 'loading' || state === 'error') return undefined;
    const t = window.setTimeout(() => document.getElementById('number-format')?.scrollIntoView({block: 'center'}), 60);
    return () => window.clearTimeout(t);
  }, [state]);

  let body;
  if (state === 'loading') body = <LoadingView rows={10} />;
  else if (state === 'error') {
    body = (
      <ErrorView title="Couldn't load your settings" onRetry={() => setState('default')}>
        Joy couldn't reach your settings just now. Nothing was changed; try again in a moment.
      </ErrorView>
    );
  } else {
    body = (
      <BlockStack gap="400">
        {disabled ? <LockedBanner /> : null}
        {state === 'worst' ? <SyncBanner what="number format" /> : null}
        <OtherCardsBefore form={form} set={set} disabled={disabled} />
        <div id="number-format" className="pnf-anchor"><NumberFormatCard form={form} set={set} saved={saved} disabled={disabled} /></div>
        <div id="currency-format"><CurrencyFormatCard form={form} set={set} disabled={disabled} /></div>
        <CustomPointLabelCard form={form} set={set} disabled={disabled} />
        <OtherCardsAfter form={form} set={set} saved={saved} disabled={disabled} />
      </BlockStack>
    );
  }

  return (
    <SettingsLayout selected="general">
      {body}
      {leave}
    </SettingsLayout>
  );
}
