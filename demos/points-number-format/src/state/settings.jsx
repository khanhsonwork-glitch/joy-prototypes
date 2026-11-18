// Saved settings of the fake shop Pomelo Park. Lives in memory until reload; the Prototype panel's screen state
// (or ?state= / ?mode= in the URL) picks the starting values.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useScenario} from '../kit/scenario.jsx';
import {API_MESSAGE, LOCALE} from '../data/numberFormat.js';

// Number format mode values, named like Custom point label's POINT_LABEL_MODE_* constants.
export const MODE_LOCALE = 'locale';
export const MODE_SAME = 'same';
export const MODE_TRANSLATION = 'translation';

const BASE_LANGUAGES = [
  {code: 'it', active: true},
  {code: 'fr', active: true},
  {code: 'de', active: true},
];
const MANY_LANGUAGES = [
  ...BASE_LANGUAGES,
  {code: 'es', active: true},
  {code: 'nl', active: true},
  {code: 'pl', active: false},
  {code: 'pt-BR', active: true},
  {code: 'de-CH', active: true},
];

function initialFor(state) {
  const big = state === 'overflow' || state === 'worst';
  const languages = state === 'empty' ? [] : state === 'worst' ? MANY_LANGUAGES : BASE_LANGUAGES;
  const all = ['en', ...languages.map((l) => l.code)];
  return {
    primaryLanguage: 'en',
    languages,
    // General › Number format (new)
    numberMode: state === 'same' ? MODE_SAME : state === 'per-language' ? MODE_TRANSLATION : MODE_LOCALE,
    numberFormat: state === 'same' ? 'apostrophe' : 'comma',
    // Translations › Unified widget › Points display › Number format, per language (used when mode = translation)
    perLanguage: Object.fromEntries(all.map((code) => [code, state === 'per-language' ? ({it: 'apostrophe', fr: 'space'}[code] || LOCALE) : LOCALE])),
    // Translations › Unified widget › Activity history › Activity messages › Points added via API (new)
    apiMessage: Object.fromEntries(all.map((code) => [code, ''])),
    // Other Unified widget rows the merchant edits, keyed "<language>|<row key>"
    texts: {},
    // General › Custom point label (today)
    enabledCustomPointLabel: true,
    // Per language state: point labels are per language too, so the Translations rows show both side by side.
    pointLabelMode: state === 'per-language' ? 'translation' : 'custom',
    pointSingular: big ? 'Pomelo Park reward star' : 'point',
    pointPlural: big ? 'Pomelo Park reward stars' : 'points',
    pointPosition: 'after',
    // Other General cards (today)
    membership: 'auto',
    inAppLanguage: 'en',
    showLanguageEverywhere: false,
    timezone: '(UTC-05:00) Eastern Time (US & Canada)',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm',
    currencyFormat: 'without',
    prefix: 'POMELO-',
    applyDiscount: 'go_to_cart',
    exchangePoints: big ? 1250000 : 100,
    reviewStatus: 'pending',
    googleReviewStatus: 'pending',
    big,
  };
}

const SettingsContext = createContext(null);

export function SettingsProvider({children}) {
  const {state} = useScenario();
  const [saved, setSaved] = useState(() => initialFor(state));
  useEffect(() => setSaved(initialFor(state)), [state]);
  const save = useCallback((patch) => setSaved((prev) => ({...prev, ...patch})), []);
  const value = useMemo(() => ({saved, save}), [saved, save]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** {saved, save(patch)} */
export const useSettings = () => useContext(SettingsContext);

/** Joy's system text for the new API message in a language (what the storefront shows while the field is empty). */
export const apiDefault = (code) => API_MESSAGE[code] || API_MESSAGE.en;
