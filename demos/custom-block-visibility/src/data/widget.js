// Fake widget design for the fictional shop (Pomelo Park). Nothing here is a real merchant's setting.
// Section ids, block types, defaults and labels follow the real Widget editor so the prototype reads the same.

/** Who is looking at the widget. On an opt-in shop "Signed in" lands on the Join Program screen (not a member yet), like a guest. */
export const VIEWERS = [
  {value: 'guest', label: 'Guest'},
  {value: 'signed-in', label: 'Signed in'},
  {value: 'member', label: 'Member'},
];
export const viewerLabel = (value) => VIEWERS.find((v) => v.value === value)?.label ?? value;

export const SHOW_TO_LABEL = 'Who can see this block';
export const SHOW_TO_OPTIONS = [
  {label: 'Everyone', value: 'everyone'},
  {label: 'Guests', value: 'guests'},
  {label: 'Members', value: 'members'},
];
export const SHOW_TO_HELP = 'Guests are visitors who see the Sign in or Join screen in the widget. Everyone else counts as a member.';
export const SHOW_TO_GUESTS_HELP = 'When off, this section is hidden from visitors who see the Sign in or Join screen in the widget.';

/** Built-in Body sections, in the default order of the real editor. `guestOption: false` = no "Show to guests" checkbox. */
export const SECTION_META = {
  COUPONS: {label: 'My coupons', guestOption: false, banner: true},
  VIP_TIERS: {label: 'VIP tiers', guestOption: true, memberOption: true, banner: false},
  PROMOTED_COLLECTIONS: {label: 'Promoted collections', guestOption: true, banner: false},
  QUEST: {label: 'Quiz', guestOption: true, banner: false},
  REFERRAL: {label: 'Refer a friend', guestOption: true, banner: true},
  EARN_TAB: {label: 'Ways to earn', guestOption: true, banner: true},
  REDEEM_TAB: {label: 'Ways to redeem', guestOption: true, banner: true},
  RECENTLY_VIEWED: {label: 'Recently viewed', guestOption: true, banner: true},
  PRODUCTS: {label: 'Recommended', guestOption: true, banner: true},
  ACTIVITIES: {label: 'Recent activity', guestOption: false, banner: true},
  MILESTONE: {label: 'Milestones', guestOption: true, banner: true},
  FAQ: {label: 'FAQ', guestOption: true, banner: true, badge: 'NEW'},
  WIDGET_QR: {label: 'My QR code', guestOption: false, banner: true},
  WALLET_PASS: {label: 'Wallet pass', guestOption: false, banner: true},
};

export const CUSTOM_LABELS = {
  CUSTOM_LINK: 'Custom link',
  CUSTOM_CTA: 'Custom CTA',
  CUSTOM_BANNER: 'Image banner',
  CUSTOM_BUTTON: 'Button',
  CUSTOM_HEADING: 'Heading',
  CUSTOM_RICHTEXT: 'Rich text',
  CUSTOM_DIVIDER: 'Divider',
  CUSTOM_IMAGE_TEXT: 'Image with text',
};

/** The add-block menu, grouped like the real one. */
export const ADD_BLOCK_GROUPS = [
  {title: 'Basic', types: ['CUSTOM_HEADING', 'CUSTOM_RICHTEXT', 'CUSTOM_BUTTON', 'CUSTOM_DIVIDER']},
  {title: 'Media', types: ['CUSTOM_BANNER', 'CUSTOM_IMAGE_TEXT']},
  {title: 'Actions', types: ['CUSTOM_LINK', 'CUSTOM_CTA']},
];

/** Starting config of a block added from the + menu (what the real editor creates), plus the new Show to default. */
export const BLOCK_DEFAULTS = {
  CUSTOM_LINK: {title: 'Custom link', icon: 'external', url: '', external: true},
  CUSTOM_CTA: {
    title: 'Custom CTA',
    buttonLabel: 'Button',
    url: '',
    bgColor: '#FAFAFA',
    textColor: '#1A1A1A',
    buttonBgColor: '',
    buttonTextColor: '',
    fullWidth: true,
    align: 'center',
  },
  CUSTOM_BANNER: {image: '', url: '', external: true, alt: ''},
  CUSTOM_BUTTON: {label: 'Button', url: '', variant: 'primary', size: 'sm', fullWidth: true, align: 'center'},
  CUSTOM_HEADING: {text: 'Heading', subtitle: '', level: 'h3', align: 'left'},
  CUSTOM_RICHTEXT: {content: 'Rich text', size: 'sm', align: 'left'},
  CUSTOM_DIVIDER: {variant: 'solid', spacing: 'md'},
  CUSTOM_IMAGE_TEXT: {image: '', title: '', description: '', layout: 'image-left', alt: '', url: '', external: true},
};

/** The widget's primary colour, what "Use primary color" fills in (Pomelo Park red). */
export const THEME_PRIMARY = '#B5303F';

export const isCustom = (section) => section.id.startsWith('CUSTOM_');
export const typeOf = (section) => section.type || section.id.replace(/_\d+$/, '');

/** The row label in the Body list: same fallbacks as the real editor (content is cut at 30 characters). */
export function rowLabel(section) {
  if (isCustom(section)) {
    return (
      section.title || section.text || section.label || section.content?.substring(0, 30) || CUSTOM_LABELS[typeOf(section)] || 'Custom block'
    );
  }
  return SECTION_META[section.id]?.label ?? section.id;
}

/** Everyone / Guests / Members against the three preview customers (Guest and Signed in both see the Sign in or Join screen). */
export function audienceSees(audience, viewer) {
  const rule = audience || 'everyone';
  if (rule === 'everyone') return true;
  return rule === 'members' ? viewer === 'member' : viewer !== 'member';
}

/** Does this Body entry show in the widget for this customer? Custom blocks follow Show to; built-in sections follow their own checkboxes. */
export function sectionVisible(section, viewer) {
  if (section.enabled === false) return false;
  if (isCustom(section)) return audienceSees(section.audience, viewer);
  if (viewer === 'member') return section.id === 'VIP_TIERS' ? section.memberVisible === true : true;
  if (SECTION_META[section.id]?.guestOption === false) return false;
  return section.guestVisible !== false;
}

/** The first custom blocks, as the shop has them. `preset` only changes what the merchant opened the editor with. */
export function initialSections(preset = 'default') {
  const sections = [
    {
      id: 'CUSTOM_RICHTEXT_1',
      type: 'CUSTOM_RICHTEXT',
      enabled: preset !== 'off',
      content: 'Start BLACK WEEK early with code BLACK26',
      size: 'lg',
      align: 'center',
      // A block saved as hidden for guests (before the select existed) opens as Members.
      audience: preset === 'members-only-existing' ? 'members' : 'everyone',
    },
    {
      id: 'CUSTOM_IMAGE_TEXT_1',
      type: 'CUSTOM_IMAGE_TEXT',
      enabled: true,
      bannerType: 'image',
      image: 'img/black-week.svg',
      title: 'Black Week starts early',
      description: 'Save up to 40% on bestsellers before Friday.',
      layout: 'image-left',
      alt: '',
      url: '/collections/black-week',
      external: true,
      audience: 'everyone',
    },
    {id: 'COUPONS', enabled: true},
    {id: 'VIP_TIERS', enabled: true},
    {id: 'PROMOTED_COLLECTIONS', enabled: false},
    {id: 'QUEST', enabled: true},
    {id: 'REFERRAL', enabled: true},
    {id: 'EARN_TAB', enabled: true},
    {id: 'REDEEM_TAB', enabled: true},
    {id: 'RECENTLY_VIEWED', enabled: true},
    {id: 'PRODUCTS', enabled: true},
    {id: 'ACTIVITIES', enabled: true},
    {id: 'MILESTONE', enabled: true},
    {id: 'FAQ', enabled: false},
    {id: 'WIDGET_QR', enabled: true},
    {id: 'WALLET_PASS', enabled: true},
  ];
  if (preset === 'empty') return sections.filter((s) => !isCustom(s));
  if (preset === 'overflow') {
    sections[0].content =
      'Start BLACK WEEK early with code BLACK26 at checkout: free shipping on every order, a free gift above $75, and double points on every Black Week purchase until Cyber Monday midnight';
    sections[1].title = 'Black Week starts early for every member of the Pomelo Park Rewards Club';
    sections[1].description =
      'Save up to 40% on bestsellers, limited-edition gift sets and the full Night Notes collection before Friday, with free tracked shipping on every order.';
  }
  return sections;
}

/** Earn programs listed under "Customize programs" in the Ways to earn panel. */
export const EARN_PROGRAMS = [
  {id: 'place-order', title: 'Place an order', sub: 'Default icon', isShow: true},
  {id: 'sign-up', title: 'Sign up', sub: 'Default icon', isShow: true},
  {id: 'newsletter', title: 'Sign up for newsletter', sub: 'Default icon', isShow: true},
  {id: 'instagram', title: 'Follow on Instagram', sub: 'Custom icon', isShow: true},
  {id: 'birthday', title: 'Birthday', sub: 'Default icon', isShow: true},
];

/** Route slug → what opens. The hub card links to these. */
export const PRESET_ROUTES = ['rich-text', 'image-with-text', 'off', 'members-only-existing', 'section-help'];
const SLUG_TO_ID = {
  'rich-text': 'CUSTOM_RICHTEXT_1',
  off: 'CUSTOM_RICHTEXT_1',
  'members-only-existing': 'CUSTOM_RICHTEXT_1',
  'image-with-text': 'CUSTOM_IMAGE_TEXT_1',
  'section-help': 'EARN_TAB',
};
export const RICH_TEXT_SLUGS = ['rich-text', 'off', 'members-only-existing'];

export function idFromSegments(segments) {
  if (SLUG_TO_ID[segments[0]]) return SLUG_TO_ID[segments[0]];
  if (segments[0] === 'block') return segments[1];
  if (segments[0] === 'section') return (segments[1] || '').toUpperCase();
  return null;
}

/** Where a Body row lives in the URL. Keeps `#/off` and `#/members-only-existing` while their block stays selected. */
export function pathFor(id, current = '') {
  const here = current.replace(/^\//, '').split('/')[0];
  if (id === 'CUSTOM_RICHTEXT_1') return RICH_TEXT_SLUGS.includes(here) ? `/${here}` : '/rich-text';
  if (id === 'CUSTOM_IMAGE_TEXT_1') return '/image-with-text';
  if (id === 'EARN_TAB') return '/section-help';
  if (id.startsWith('CUSTOM_')) return `/block/${id}`;
  return `/section/${id.toLowerCase()}`;
}

/** Preset a deep link opens with (only the first load or an outside link; picking rows in the editor never resets). */
export const presetForSlug = (slug) => (slug === 'off' || slug === 'members-only-existing' ? slug : 'default');
