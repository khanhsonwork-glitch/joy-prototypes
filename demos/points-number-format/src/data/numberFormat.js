// Number formats for point amounts. What Joy does today: each language writes numbers by its own standard
// (Intl number format of the customer's language), e.g. Italian 1125 · 11.250 — four-digit numbers ungrouped.

/** The four formats a merchant can force (labels as approved: thousands separator only, points are whole numbers). */
export const FORMATS = [
  {value: 'comma', label: '1,125', group: ',', decimal: '.'},
  {value: 'dot', label: '1.125', group: '.', decimal: ','},
  {value: 'apostrophe', label: "1'125", group: "'", decimal: '.'},
  {value: 'space', label: '1 125', group: ' ', decimal: ','},
];
export const LOCALE = 'locale';

/**
 * Each language's own standard (what the storefront shows today). minGroup 2 = a four-digit number stays ungrouped,
 * as Intl does for Italian, Spanish and Polish.
 */
export const LANGUAGES = {
  en: {name: 'English', group: ',', decimal: '.', minGroup: 1},
  it: {name: 'Italian', group: '.', decimal: ',', minGroup: 2},
  fr: {name: 'French', group: ' ', decimal: ',', minGroup: 1},
  de: {name: 'German', group: '.', decimal: ',', minGroup: 1},
  es: {name: 'Spanish', group: '.', decimal: ',', minGroup: 2},
  nl: {name: 'Dutch', group: '.', decimal: ',', minGroup: 1},
  pl: {name: 'Polish', group: ' ', decimal: ',', minGroup: 2},
  'pt-BR': {name: 'Portuguese (Brazil)', group: '.', decimal: ',', minGroup: 1},
  'de-CH': {name: 'German (Switzerland)', group: "'", decimal: '.', minGroup: 1},
};

/** Point labels per language when Custom point label = Different labels per language. */
export const POINT_LABELS = {
  en: ['point', 'points'],
  it: ['punto', 'punti'],
  fr: ['point', 'points'],
  de: ['Punkt', 'Punkte'],
  es: ['punto', 'puntos'],
  nl: ['punt', 'punten'],
  pl: ['punkt', 'punktów'],
  'pt-BR': ['ponto', 'pontos'],
  'de-CH': ['Punkt', 'Punkte'],
};

/** Joy's system translation of the new "Points added via API" activity message, per language. */
export const API_MESSAGE = {
  en: 'Received {{loyalty_point}}',
  it: 'Ricevuti {{loyalty_point}}',
  fr: 'Reçu {{loyalty_point}}',
  de: '{{loyalty_point}} erhalten',
  es: 'Recibidos {{loyalty_point}}',
  nl: '{{loyalty_point}} ontvangen',
  pl: 'Otrzymano {{loyalty_point}}',
  'pt-BR': 'Recebeu {{loyalty_point}}',
  'de-CH': '{{loyalty_point}} erhalten',
};

/** Sample amounts the help texts show: a four-digit and a five-digit balance, like the Italian report. */
export const SAMPLES = [1125, 11250];
export const BIG_SAMPLES = [1234567, 12345678];

function spec(format, language) {
  if (format && format !== LOCALE) return {...FORMATS.find((f) => f.value === format), minGroup: 1};
  return LANGUAGES[language] || LANGUAGES.en;
}

/** formatPoints(11250, 'apostrophe') → "11'250"; formatPoints(1125, 'locale', 'it') → "1125". */
export function formatPoints(amount, format, language = 'en') {
  const {group, minGroup} = spec(format, language);
  const digits = String(Math.round(Math.abs(amount)));
  if (digits.length < 4 + (minGroup - 1)) return digits;
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, group);
}

/** "1125 · 11.250" for a language's own standard, used in option labels. */
export const samplePair = (format, language, samples = SAMPLES) => samples.map((n) => formatPoints(n, format, language)).join(' · ');

/** Option label for a language's own standard: "Language standard — 1125 · 11.250". */
export const localeLabel = (language) => `Language standard — ${samplePair(LOCALE, language)}`;

export const formatLabel = (format, language) => (format === LOCALE || !format ? localeLabel(language) : FORMATS.find((f) => f.value === format).label);
