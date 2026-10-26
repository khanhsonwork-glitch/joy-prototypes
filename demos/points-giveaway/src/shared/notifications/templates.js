// Default documents + the template gallery's voices. Each voice is the same two giveaway emails in a different look.
// Everything is built from the editor's own blocks, so a merchant can change any of it. The store look is Pomelo Park's:
// cream paper, plum ink, yellow buttons, Fraunces headings, DM Sans body (same as the storefront and the old email preview).
import {IMAGES} from '../../data/index.js';
import {band, makeFooter, makeNode, pad} from './blocks.js';

export const VOICES = [
  {id: 'clean', label: 'Clean', blurb: 'Balanced, on-brand default'},
  {id: 'editorial', label: 'Editorial', blurb: 'Magazine-style layout'},
  {id: 'warm', label: 'Warm', blurb: 'Friendly, inviting tone'},
  {id: 'warm-classic', label: 'Warm Classic', blurb: 'The original warm look'},
  {id: 'bold', label: 'Bold', blurb: 'High-contrast, confident'},
  {id: 'luxury', label: 'Luxury', blurb: 'Refined, premium feel'},
  {id: 'luxury-classic', label: 'Luxury Classic', blurb: 'The original luxury look'},
  {id: 'playful', label: 'Playful', blurb: 'Bright, energetic'},
  {id: 'playful-classic', label: 'Playful Classic', blurb: 'The original playful look'},
  {id: 'neobrutalism', label: 'Neobrutalism', blurb: 'Raw, graphic, unboxed'},
  {id: 'minimal', label: 'Minimal', blurb: 'Spare, type-forward'},
  {id: 'botanical', label: 'Botanical', blurb: 'Soft, organic styling'},
];
export const DEFAULT_VOICE = 'clean';
export const voiceLabel = (id) => VOICES.find((v) => v.id === id)?.label || '';

const HEAD = "'Fraunces', Georgia, 'Times New Roman', serif";
const BODY = "'DM Sans', 'Helvetica Neue', Arial, sans-serif";

const COPY = {
  gift: {
    subject: "{{first_name}}, you've got {{earning_points}}",
    preheader: 'A thank-you from {{shop_name}}.',
    headline: "You've got {{earning_points}}, {{first_name}}.",
    lines: ['A thank-you from {{shop_name}}.', 'See your balance and rewards.'],
    kicker: 'Points added',
  },
  reminder: {
    subject: 'Your {{earning_points}} expire on {{point_expired_at}}',
    preheader: "Use them before they're gone.",
    headline: 'Your points expire soon, {{first_name}}.',
    lines: ['You still have {{earning_points}} from {{shop_name}}.', 'See your balance and rewards.'],
    kicker: 'Points expiring',
  },
};

const PALETTES = {
  clean: {wash: '#f1e9d8', bg: '#fef8ea', ink: '#3b1f2b', muted: '#6b4a58', line: '#ecdcc7', paper: '#fffdf7', accent: '#fae13f', accentInk: '#3b1f2b'},
  editorial: {wash: '#e7e1d3', bg: '#fffdf7', ink: '#2a1520', muted: '#6b4a58', line: '#d9cdb8', paper: '#fffdf7', accent: '#3b1f2b', accentInk: '#3b1f2b'},
  warm: {wash: '#fbd5ce', bg: '#fde6e1', ink: '#3b1f2b', muted: '#6b4a58', line: '#f4bdb4', paper: '#ffffff', accent: '#fae13f', accentInk: '#3b1f2b'},
  bold: {wash: '#24121b', bg: '#3b1f2b', ink: '#ffffff', muted: '#e6d2d9', line: '#5b3342', paper: '#4c2a3a', accent: '#fae13f', accentInk: '#3b1f2b'},
};

const STYLES = {
  clean: {muted: '#6b4a58', bodyFont: BODY, headFont: HEAD, text: '#3b1f2b', head: '#3b1f2b', link: '#3b1f2b', h1: {size: 28, weight: 500, case: 'none', spacing: '-0.01em', lh: 1.2}, h2: {size: 22, weight: 500, case: 'none', spacing: '0', lh: 1.25}, h3: {size: 17, weight: 600, case: 'none', spacing: '0', lh: 1.3}},
  editorial: {muted: '#6b4a58', bodyFont: BODY, headFont: HEAD, text: '#2a1520', head: '#2a1520', link: '#2a1520', h1: {size: 36, weight: 400, case: 'none', spacing: '-0.02em', lh: 1.1}, h2: {size: 24, weight: 400, case: 'none', spacing: '-0.01em', lh: 1.2}, h3: {size: 17, weight: 600, case: 'none', spacing: '0', lh: 1.3}},
  warm: {muted: '#6b4a58', bodyFont: BODY, headFont: HEAD, text: '#3b1f2b', head: '#3b1f2b', link: '#3b1f2b', h1: {size: 30, weight: 600, case: 'none', spacing: '-0.01em', lh: 1.2}, h2: {size: 22, weight: 600, case: 'none', spacing: '0', lh: 1.25}, h3: {size: 17, weight: 600, case: 'none', spacing: '0', lh: 1.3}},
  bold: {muted: '#e6d2d9', bodyFont: BODY, headFont: BODY, text: '#ffffff', head: '#fae13f', link: '#fae13f', h1: {size: 40, weight: 800, case: 'uppercase', spacing: '-0.02em', lh: 1.02}, h2: {size: 24, weight: 800, case: 'uppercase', spacing: '-0.01em', lh: 1.1}, h3: {size: 16, weight: 700, case: 'uppercase', spacing: '0.04em', lh: 1.3}},
};

const txt = (html, props = {}) => makeNode('text', {html, ...props});

function hero(c, {minHeight = 170, position = '22% 24%', fullWidth = false} = {}) {
  return makeNode('section', {bgImage: IMAGES.hero, bgPosition: position, minHeight, padding: pad(0), bgColor: c.bg, fullWidth});
}

function logoBand(c, {align = 'center', fullWidth = false, padding = pad(10, 26)} = {}) {
  return band(
    [makeNode('image', {src: '{{url_logo}}', alt: 'Pomelo Park', width: '190px', align, padding})],
    {padding: pad(8, 0, 4), bgColor: c.bg, fullWidth},
  );
}

function button(c, props = {}) {
  return makeNode('button', {label: 'View rewards', link: '{{reward_url}}', accent: c.accent, textColor: c.accentInk, fontFamily: '', ...props});
}

function dynamicBands(c, copy, {fullWidth = false, cardProps = {}, padX = 26} = {}) {
  const around = {padding: pad(8, padX, 14), bgColor: c.bg, fullWidth};
  return [makeNode('section', around, [makeNode('card', {bgColor: c.paper, borderColor: c.line, textColor: c.ink, mutedColor: c.muted, ...cardProps})])];
}

function cleanBlocks(email) {
  const c = PALETTES.clean;
  const copy = COPY[email];
  const side = pad(6, 26);
  return [
    logoBand(c),
    hero(c),
    band(
      [txt(`<h1>${copy.headline}</h1>`, {padding: pad(8, 26, 4)}), txt(copy.lines[0], {padding: side, fontSize: 15}), txt(copy.lines[1], {padding: pad(2, 26, 8), fontSize: 15})],
      {padding: pad(18, 0, 6), bgColor: c.bg},
    ),
    ...dynamicBands(c, copy),
    band([button(c, {padding: pad(6, 26, 26)})], {padding: pad(0), bgColor: c.bg}),
    makeFooter(email, {bg: c.bg, muted: c.muted}),
  ];
}

function editorialBlocks(email) {
  const c = PALETTES.editorial;
  const copy = COPY[email];
  const left = {align: 'left'};
  return [
    hero(c, {minHeight: 240, position: '30% 20%'}),
    band(
      [
        txt(`{{shop_name}} · ${copy.kicker}`, {...left, fontSize: 11, letterSpacing: '2', textCase: 'uppercase', color: c.muted, padding: pad(4, 32, 2), fontFamily: BODY}),
        txt(`<h1>${copy.headline}</h1>`, {...left, padding: pad(4, 32, 6)}),
        txt(copy.lines[0], {...left, padding: pad(4, 32), fontSize: 15}),
        txt(copy.lines[1], {...left, padding: pad(2, 32, 8), fontSize: 15}),
      ],
      {padding: pad(30, 0, 8), bgColor: c.bg},
    ),
    band([makeNode('divider', {color: c.line, thickness: 1, padding: pad(0, 32), spaceAbove: 8, spaceBelow: 8})], {padding: pad(0), bgColor: c.bg}),
    ...dynamicBands(c, copy, {padX: 32, cardProps: {radius: 0}}),
    band([button(c, {style: 'outline', accent: c.ink, textColor: c.ink, radius: 0, align: 'left', padding: pad(8, 32, 30), textCase: 'uppercase', letterSpacing: '1.5', fontSize: 13})], {padding: pad(0), bgColor: c.bg}),
    makeFooter(email, {bg: c.bg, muted: c.muted}),
  ].map((s) => (s.props.label === 'Footer' ? leftFooter(s) : s));
}

function leftFooter(section) {
  const walkFix = (n) => ({...n, props: n.type === 'text' ? {...n.props, align: 'left', padding: pad(2, 32)} : n.props, children: n.children ? n.children.map(walkFix) : n.children});
  return walkFix(section);
}

function warmBlocks(email) {
  const c = PALETTES.warm;
  const copy = COPY[email];
  const mid = {align: 'center'};
  return [
    logoBand(c),
    band([makeNode('image', {src: IMAGES.club, alt: '', width: '100%', radius: 22, padding: pad(4, 26, 6)})], {padding: pad(0), bgColor: c.bg}),
    band(
      [
        makeNode('callout', {
          html: `<h1 style="text-align:center">${copy.headline}</h1><p style="text-align:center;margin:8px 0 0">${copy.lines[0]}</p><p style="text-align:center;margin:8px 0 0">${copy.lines[1]}</p>`,
          bgColor: c.paper, borderWidth: 0, radius: 22, padding: pad(22, 24), inset: 26, gapTop: 10, gapBottom: 8,
        }),
      ],
      {padding: pad(0), bgColor: c.bg},
    ),
    ...dynamicBands(c, copy, {cardProps: {radius: 22, borderWidth: 0}}),
    band([button(c, {padding: pad(6, 26, 28), ...mid})], {padding: pad(0), bgColor: c.bg}),
    makeFooter(email, {bg: c.bg, muted: c.muted}),
  ];
}

function boldBlocks(email) {
  const c = PALETTES.bold;
  const copy = COPY[email];
  return [
    // the logo is plum on transparent, so it sits on a yellow band here, not on the dark ink
    band(
      [makeNode('image', {src: '{{url_logo}}', alt: 'Pomelo Park', width: '170px', align: 'left', padding: pad(6, 26)})],
      {padding: pad(14, 0, 10), bgColor: c.accent, fullWidth: true},
    ),
    hero(c, {minHeight: 190, fullWidth: true, position: '20% 30%'}),
    band(
      [
        txt(`<h1>${copy.headline}</h1>`, {align: 'left', padding: pad(8, 26, 6)}),
        txt(copy.lines[0], {align: 'left', padding: pad(4, 26), fontSize: 16, color: '#ffffff'}),
        txt(copy.lines[1], {align: 'left', padding: pad(2, 26, 8), fontSize: 16, color: '#ffffff'}),
      ],
      {padding: pad(24, 0, 8), bgColor: c.bg, fullWidth: true},
    ),
    ...dynamicBands(c, copy, {fullWidth: true, cardProps: {bgColor: c.accent, borderWidth: 0, radius: 0, textColor: c.accentInk, mutedColor: '#5c4a12'}}),
    band([button(c, {radius: 4, align: 'left', textCase: 'uppercase', letterSpacing: '1', fontWeight: '800', padding: pad(8, 26, 30)})], {padding: pad(0), bgColor: c.bg, fullWidth: true}),
    makeFooter(email, {bg: c.bg, muted: c.muted, fullWidth: true}),
  ];
}

const BUILDERS = {clean: cleanBlocks, editorial: editorialBlocks, warm: warmBlocks, bold: boldBlocks};
// Each additional voice supplies a distinct composition, type scale and frame using the same editable blocks.
const VOICE_VARIANTS = {
  'warm-classic': {base: 'warm', radius: 8, photo: false, size: 28, font: HEAD, align: 'left'},
  luxury: {base: 'editorial', radius: 0, photo: true, size: 42, font: HEAD, align: 'center'},
  'luxury-classic': {base: 'clean', radius: 0, photo: false, size: 34, font: 'Georgia, serif', align: 'center'},
  playful: {base: 'warm', radius: 30, photo: true, size: 38, font: BODY, align: 'center'},
  'playful-classic': {base: 'warm', radius: 12, photo: false, size: 34, font: BODY, align: 'left'},
  neobrutalism: {base: 'bold', radius: 0, photo: false, size: 44, font: "'Courier New', monospace", align: 'left'},
  minimal: {base: 'editorial', radius: 0, photo: false, size: 26, font: BODY, align: 'left'},
  botanical: {base: 'clean', radius: 18, photo: true, size: 32, font: HEAD, align: 'left'},
};
function variantDoc(email, voice) {
  const config = VOICE_VARIANTS[voice];
  const c = PALETTES[config.base];
  const copy = COPY[email];
  const blocks = [logoBand(c), ...(config.photo ? [hero(c, {minHeight: voice === 'luxury' ? 280 : 150})] : []),
    band([txt(`<h1>${copy.headline}</h1>`, {align: config.align, padding: pad(16, 30)}), ...copy.lines.map(line => txt(line, {align: config.align, padding: pad(4, 30), fontSize: 15}))], {padding: pad(24, 0), bgColor: c.bg}),
    ...dynamicBands(c, copy, {cardProps: {radius: config.radius}}),
    band([button(c, {radius: config.radius, align: config.align, style: voice.includes('luxury') ? 'outline' : 'solid', padding: pad(16, 30)})], {bgColor: c.bg}), makeFooter(email, {bg: c.bg, muted: c.muted})];
  return {blocks, pageBg: c.wash, style: {...STYLES[config.base], headFont: config.font, h1: {...STYLES[config.base].h1, size: config.size}}};
}


/** A fresh document for `email` ('gift' | 'reminder') in `voice`. New ids every call. */
function buildBaseDoc(email, voice = DEFAULT_VOICE) {
  const key = BUILDERS[voice] ? voice : DEFAULT_VOICE;
  const id = email in COPY ? email : 'gift';
  const copy = COPY[id];
  if (VOICE_VARIANTS[voice]) return {subject: copy.subject, preheader: copy.preheader, ...variantDoc(id, voice)};
  return {
    subject: copy.subject,
    preheader: copy.preheader,
    pageBg: PALETTES[key].wash,
    style: STYLES[key],
    blocks: BUILDERS[key](id),
  };
}

export const buildDoc = (email, voice = DEFAULT_VOICE) => buildBaseDoc(email, voice);
export const defaultDoc = (email) => buildDoc(email, DEFAULT_VOICE);
