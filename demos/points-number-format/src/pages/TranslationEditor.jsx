// Joy admin › Settings › Translations › Unified widget (Translations/Sections/index.js + Sections/WidgetDesign.js +
// Parts/translationsWidgetV4.js on avada/master): AI assistant, search, collapsible sections with Label · Original ·
// Translation rows. Two new rows:
//  - Points & Description › Points display › "Number format", right after Point plural, a select per language. It is
//    editable only when General › Number format = "Set per language in Translations" (like the point label rows, which
//    are locked unless Custom point label = "Different labels per language").
//  - Activity history › Activity messages › "Points added via API", default "Received {{loyalty_point}}".
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {BlockStack, Button, Card, Icon, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {ChevronDownIcon, ChevronUpIcon, MagicIcon, SearchIcon, SendIcon} from '@shopify/polaris-icons';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useSaveBar, useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {MODE_SAME, MODE_TRANSLATION, apiDefault, useSettings} from '../state/settings.jsx';
import {WIDGET_SECTIONS} from '../data/widgetSections.js';
import {BIG_SAMPLES, FORMATS, LANGUAGES, LOCALE, POINT_LABELS, SAMPLES, formatLabel, formatPoints, localeLabel} from '../data/numberFormat.js';
import {LockedBanner, SyncBanner, useLeaveGuard} from './shared.jsx';

const NUMBER_ROW = {key: 'number_format', label: 'Number format', type: 'number', isNew: true};
const API_ROW = {key: 'points_api', label: 'Points added via API', source: 'Received {{loyalty_point}}', vars: true, isNew: true, type: 'api'};

/** WIDGET_SECTIONS with the two new rows in place. */
const SECTIONS = WIDGET_SECTIONS.map((section) => {
  const fields = [...section.fields];
  if (section.id === 'points') fields.splice(fields.findIndex((f) => f.label === 'Point plural') + 1, 0, NUMBER_ROW);
  if (section.id === 'activity_history_messages') fields.splice(fields.findIndex((f) => f.label === 'Admin adjusted points') + 1, 0, API_ROW);
  return {...section, fields};
});

// SECTION_TYPES in Translations/Sections/index.js, with their page titles.
const SURFACE_OPTIONS = [
  'Widget design', 'Unified widget', 'Loyalty page', 'Customer Account', 'Check out', 'Point calculator', 'Visit website popup',
  'Reward reminder', 'Sign-up block', 'Redeem in Cart', 'Referral', 'Milestone',
].map((label) => ({label, value: label}));

const VAR_HELP = 'Keep the same variable format to display the right value';
const POINT_LOCKED = 'Using the same point label for all languages. Switch to "Different labels per language" in Settings → Custom point label to edit per-locale values.';

function numberLockedHelp(mode) {
  return mode === MODE_SAME
    ? 'Using the same number format for all languages. Switch to "Set per language in Translations" in Settings → General → Number format to set one per language.'
    : 'Each language follows its own standard. Switch to "Set per language in Translations" in Settings → General → Number format to set one per language.';
}

function AiAssistant({disabled}) {
  const {notify} = useShell();
  const [ask, setAsk] = useState('');
  return (
    <Card>
      <InlineStack gap="200" blockAlign="center" wrap={false}>
        <div className="pnf-grow">
          <TextField label="Ask AI" labelHidden autoComplete="off" disabled={disabled} value={ask} onChange={setAsk}
            placeholder={'Ask AI to edit text, e.g. "make the Earn button say Get rewards"'} />
        </div>
        <Button icon={SendIcon} accessibilityLabel="Send" disabled={disabled || !ask.trim()} onClick={() => {setAsk(''); notify('The AI assistant answers here in the app');}} />
      </InlineStack>
    </Card>
  );
}

export function TranslationEditor() {
  const {notify} = useShell();
  const navigate = useNavigate();
  const {query} = useRoute();
  const {state, setState} = useScenario();
  const {saved, save} = useSettings();
  const disabled = state === 'disabled';
  const codes = [saved.primaryLanguage, ...saved.languages.map((l) => l.code)];
  const lang = codes.includes(query.get('lang')) ? query.get('lang') : saved.primaryLanguage;
  const isDefault = lang === saved.primaryLanguage;
  const field = query.get('field');
  const perLanguageMode = saved.numberMode === MODE_TRANSLATION;
  const pointsPerLanguage = saved.pointLabelMode === 'translation';
  const samples = saved.big ? BIG_SAMPLES : SAMPLES;

  const initial = useMemo(() => ({perLanguage: saved.perLanguage, apiMessage: saved.apiMessage, texts: saved.texts}), [saved]);
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(initial), [initial]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const discard = () => setDraft(initial);
  const onSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      save(draft);
      setSaving(false);
      notify('Saved translations successfully');
    }, 500);
  };
  useSaveBar({dirty: dirty && !disabled, saving, onSave, onDiscard: discard});
  const leave = useLeaveGuard(dirty && !disabled, discard);

  // First section open by default; ?field= opens the section holding that row and scrolls to it (WidgetDesign.js).
  const target = useMemo(() => SECTIONS.find((s) => s.fields.some((f) => f.key === field || (field === 'point' && f.label === 'Point singular'))), [field]);
  const [open, setOpen] = useState(() => ({[SECTIONS[0].id]: true, ...(target ? {[target.id]: true} : {})}));
  const [search, setSearch] = useState('');
  const scrolled = useRef(null);
  useEffect(() => {
    if (scrolled.current === field || !target || state === 'loading' || state === 'error') return undefined;
    scrolled.current = field;
    setOpen((prev) => ({...prev, [target.id]: true}));
    const id = field === 'point' ? `tnx-field-${target.fields[0].key}` : `tnx-field-${field}`;
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({block: 'center'});
      el.classList.add('is-flash');
      window.setTimeout(() => el.classList.remove('is-flash'), 1600);
    }, 120);
    return () => window.clearTimeout(t);
  }, [target, field, state]);

  const needle = search.trim().toLowerCase();
  const sections = needle
    ? SECTIONS.map((s) => ({...s, fields: s.fields.filter((f) => `${f.label} ${f.source || ''}`.toLowerCase().includes(needle))})).filter((s) => s.fields.length)
    : SECTIONS;

  const pointLabel = (code, amount) => {
    if (pointsPerLanguage) return (POINT_LABELS[code] || POINT_LABELS.en)[amount === 1 ? 0 : 1];
    return amount === 1 ? saved.pointSingular : saved.pointPlural;
  };
  const seen = (format) => samples.map((n) => `${formatPoints(n, format, lang)} ${pointLabel(lang, n)}`).join(' · ');
  const effectiveFormat = perLanguageMode ? draft.perLanguage[lang] || LOCALE : saved.numberMode === MODE_SAME ? saved.numberFormat : LOCALE;
  const textKey = (key) => `${lang}|${key}`;
  const setText = (key, value) => setDraft((d) => ({...d, texts: {...d.texts, [textKey(key)]: value}}));

  function renderRow(row) {
    const id = `tnx-field-${row.key}`;
    let original;
    let translation;
    if (row.type === 'number') {
      const defaultFormat = perLanguageMode ? draft.perLanguage[saved.primaryLanguage] || LOCALE : effectiveFormat;
      original = <TextField label="Original" labelHidden disabled autoComplete="off" value={formatLabel(defaultFormat, saved.primaryLanguage)} />;
      const options = [{label: localeLabel(lang), value: LOCALE}, ...FORMATS.map((f) => ({label: f.label, value: f.value}))];
      translation = (
        <BlockStack gap="100">
          <Select label="Translation" labelHidden options={options} value={effectiveFormat} disabled={disabled || !perLanguageMode}
            onChange={(value) => setDraft((d) => ({...d, perLanguage: {...d.perLanguage, [lang]: value}}))} />
          <Text as="p" variant="bodySm" tone="subdued">{perLanguageMode ? `Customers see: ${seen(effectiveFormat)}` : numberLockedHelp(saved.numberMode)}</Text>
        </BlockStack>
      );
    } else if (row.type === 'api') {
      const value = draft.apiMessage[lang] || '';
      const sourceText = isDefault ? row.source : draft.apiMessage[saved.primaryLanguage] || row.source;
      const shown = (value || (isDefault ? row.source : apiDefault(lang))).replace('{{loyalty_point}}', `${formatPoints(samples[0], effectiveFormat, lang)} ${pointLabel(lang, samples[0])}`);
      original = <TextField label="Original" labelHidden disabled autoComplete="off" value={sourceText} />;
      translation = (
        <TextField label="Translation" labelHidden autoComplete="off" disabled={disabled} value={value} placeholder={isDefault ? row.source : apiDefault(lang)}
          onChange={(v) => setDraft((d) => ({...d, apiMessage: {...d.apiMessage, [lang]: v}}))}
          helpText={<BlockStack gap="050"><span>{VAR_HELP}</span><span>{`Shown when your other system adds points through the Joy REST API. Customers see: ${shown}`}</span></BlockStack>} />
      );
    } else {
      const isPoint = row.label === 'Point singular' || row.label === 'Point plural';
      const locked = isPoint && !pointsPerLanguage;
      const pointValue = isPoint && pointsPerLanguage && !isDefault ? (POINT_LABELS[lang] || POINT_LABELS.en)[row.label === 'Point singular' ? 0 : 1] : '';
      const value = draft.texts[textKey(row.key)] ?? pointValue;
      const originalText = isDefault ? row.source : draft.texts[`${saved.primaryLanguage}|${row.key}`] || row.source;
      original = <TextField label="Original" labelHidden disabled autoComplete="off" value={originalText} />;
      translation = (
        <TextField label="Translation" labelHidden autoComplete="off" disabled={disabled || locked} value={locked ? '' : value} placeholder={row.source}
          onChange={(v) => setText(row.key, v)} helpText={locked ? POINT_LOCKED : row.vars ? VAR_HELP : undefined} />
      );
    }
    return (
      <div key={row.key} id={id} className={`pnf-tr__row${row.isNew ? ' is-new' : ''}`}>
        <div className="pnf-tr__label">
          <Text as="span">{row.label}</Text>
          {row.isNew ? <span className="pnf-new">New</span> : null}
        </div>
        <div className="pnf-tr__col">{original}</div>
        <div className="pnf-tr__col">{translation}</div>
      </div>
    );
  }

  const languageOptions = codes.map((code) => ({label: code === saved.primaryLanguage ? `${LANGUAGES[code].name} (Default)` : LANGUAGES[code].name, value: code}));

  let body;
  if (state === 'loading') body = <LoadingView rows={10} />;
  else if (state === 'error') {
    body = (
      <ErrorView title="Couldn't load your translations" onRetry={() => setState('default')}>
        Joy couldn't reach your translations just now. Nothing was changed; try again in a moment.
      </ErrorView>
    );
  } else {
    body = (
      <BlockStack gap="400">
        {disabled ? <LockedBanner /> : null}
        {state === 'worst' ? <SyncBanner what="labels" /> : null}
        <AiAssistant disabled={disabled} />
        <Card>
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center" wrap={false}>
              <div className="pnf-grow">
                <TextField label="Search" labelHidden placeholder="Search" autoComplete="off" value={search} onChange={setSearch}
                  prefix={<Icon source={SearchIcon} tone="subdued" />} clearButton onClearButtonClick={() => setSearch('')} />
              </div>
              {isDefault ? <Button icon={MagicIcon} disabled={disabled} onClick={() => notify('Make it on-brand rewrites every label with AI in the app')}>Make it on-brand</Button> : null}
            </InlineStack>
            <div className="pnf-tr">
              <div className="pnf-tr__head" aria-hidden="true">
                <div className="pnf-tr__label" />
                <div className="pnf-tr__col">Original</div>
                <div className="pnf-tr__col">Translation</div>
              </div>
              {sections.length ? sections.map((section) => {
                const isOpen = !!needle || !!open[section.id];
                return (
                  <div key={section.id} className="pnf-tr__section">
                    <button type="button" className="pnf-tr__toggle" aria-expanded={isOpen} aria-controls={`section-${section.id}`}
                      onClick={() => setOpen((prev) => ({...prev, [section.id]: !prev[section.id]}))}>
                      <Text as="span" fontWeight="semibold">{section.title}</Text>
                      <Icon source={isOpen ? ChevronUpIcon : ChevronDownIcon} />
                    </button>
                    <div id={`section-${section.id}`} hidden={!isOpen}>
                      {isOpen ? <div className="pnf-tr__fields">{section.fields.map(renderRow)}</div> : null}
                    </div>
                  </div>
                );
              }) : (
                <div className="pnf-tr__none"><Text as="p" tone="subdued">{`No labels match "${search.trim()}". Try another word.`}</Text></div>
              )}
            </div>
          </BlockStack>
        </Card>
      </BlockStack>
    );
  }

  return (
    <div className="pnf-page pnf-editor">
      <BlockStack gap="400">
        <div className="pnf-editor__head">
          <BlockStack gap="100">
            <Text as="h1" variant="headingLg">Unified widget</Text>
            <Text as="p" tone="subdued">Translate unified loyalty widget labels into your preferred language</Text>
          </BlockStack>
          <div className="pnf-editor__pickers">
            <Select label="Translations" labelHidden options={SURFACE_OPTIONS} value="Unified widget"
              onChange={(v) => v !== 'Unified widget' && notify(`${v} translations aren't part of this prototype`)} />
            <Select label="Select languages" labelHidden options={languageOptions} value={lang}
              onChange={(code) => navigate(`/translations?lang=${code}`)} />
          </div>
        </div>
        {body}
      </BlockStack>
      {leave}
    </div>
  );
}
