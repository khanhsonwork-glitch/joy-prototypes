// What each earn / reward type is, in merchant words, plus the defaults a new one starts with.
import {
  CalendarCheckIcon, CalendarTimeIcon, ChatIcon, ClipboardChecklistIcon, CodeIcon, ConfettiIcon, DeliveryIcon,
  DiscountIcon, EmailNewsletterIcon, FormsIcon, GiftCardIcon, GlobeIcon, LogoFacebookIcon, LogoGoogleIcon,
  LogoInstagramIcon, LogoPinterestIcon, LogoTiktokIcon, LogoXIcon, LogoYoutubeIcon, MobileIcon, NatureIcon, OrderIcon,
  OrderRepeatIcon, PersonAddIcon, ProductIcon, ReceiptIcon, StarIcon, WalletIcon, CartSaleIcon, ChatReferralIcon,
  HeartIcon, RewardIcon,
} from '@shopify/polaris-icons';

export const EARN_META = {
  place_order: {icon: OrderIcon, desc: 'Customer places an order', email: 'n-earn'},
  place_order_sub: {icon: OrderRepeatIcon, desc: 'Customer pays a subscription order', email: 'n-earn'},
  sign_up: {icon: PersonAddIcon, desc: 'Customer creates an account', email: 'n-signup'},
  newsletter: {icon: EmailNewsletterIcon, desc: 'Customer subscribes to your emails', email: 'n-earn'},
  sms: {icon: ChatIcon, desc: 'Customer subscribes to text messages', email: 'n-earn'},
  birthday: {icon: ConfettiIcon, desc: 'Once a year, on their birthday', email: 'n-bday'},
  anniversary: {icon: CalendarCheckIcon, desc: 'Every year on the day they joined', email: 'n-earn'},
  review: {icon: StarIcon, desc: 'Customer reviews a product they bought', email: 'n-earn'},
  google_review: {icon: LogoGoogleIcon, desc: 'Customer reviews your shop on Google', email: 'n-earn'},
  visit: {icon: GlobeIcon, desc: 'Customer visits a page on your store', email: 'n-earn'},
  streak: {icon: CalendarTimeIcon, desc: 'Customer comes back several days in a row', email: 'n-earn'},
  survey: {icon: ClipboardChecklistIcon, desc: 'Customer fills out your survey', email: 'n-earn'},
  receipt: {icon: ReceiptIcon, desc: 'Customer uploads a receipt from your shop', email: 'n-earn'},
  form: {icon: FormsIcon, desc: 'Customer sends your form, with photos if you like', email: 'n-earn'},
  custom: {icon: CodeIcon, desc: 'Your app or Shopify Flow gives the points', email: 'n-earn'},
  mobile_app: {icon: MobileIcon, desc: 'Customer downloads or uses your mobile app', email: 'n-earn'},
};
const SOCIAL_ICON = {facebook: LogoFacebookIcon, instagram: LogoInstagramIcon, x_twitter: LogoXIcon, tiktok: LogoTiktokIcon, pinterest: LogoPinterestIcon, youtube: LogoYoutubeIcon};
export function earnMeta(type) {
  if (EARN_META[type]) return EARN_META[type];
  const key = Object.keys(SOCIAL_ICON).find(k => type.includes(k));
  const action = type.includes('share') ? 'Customer shares a link' : type.includes('comment') ? 'Customer comments on a post' : type.includes('join') ? 'Customer joins your group' : type.includes('mention') || type.includes('story') ? 'Customer mentions you in a story' : type.includes('reply') ? 'Customer replies to your story' : 'Customer follows your account';
  return {icon: SOCIAL_ICON[key] ?? ChatReferralIcon, desc: action, email: 'n-earn', social: true};
}
export const isSocial = type => type.startsWith('social_');
export const isClickType = type => isSocial(type) || ['visit', 'survey', 'mobile_app'].includes(type);
export const isOrderType = type => ['place_order', 'place_order_sub', 'receipt'].includes(type);

export const REDEEM_META = {
  amount: {icon: DiscountIcon, desc: 'A fixed amount off the order'},
  percent: {icon: CartSaleIcon, desc: 'A percentage off the order, with a cap'},
  bxgy: {icon: ProductIcon, desc: 'Buy some items, get others free or cheaper'},
  store_credit: {icon: WalletIcon, desc: 'Money on their account, spent at checkout'},
  impact: {icon: NatureIcon, desc: 'You plant a tree for every redemption'},
  free_product: {icon: HeartIcon, desc: 'A product added to their order for free'},
  free_shipping: {icon: DeliveryIcon, desc: 'Shipping is free on their next order'},
  gift_card: {icon: GiftCardIcon, desc: 'A Shopify gift card they can spend or give'},
};
export const REDEEM_GROUP_LABEL = {discount: 'Discounts', credit: 'Store credit', impact: 'Impact', gift: 'Free products', shipping: 'Shipping', gift_card: 'Gift cards'};
export const REDEEM_GROUPS = Object.entries(REDEEM_GROUP_LABEL).map(([id, label]) => ({id, label}));

export const ICON_CHOICES = [
  {id: 'star', icon: StarIcon}, {id: 'gift', icon: RewardIcon}, {id: 'heart', icon: HeartIcon},
  {id: 'order', icon: OrderIcon}, {id: 'confetti', icon: ConfettiIcon}, {id: 'chat', icon: ChatIcon},
];
export const iconFor = (rule) => ICON_CHOICES.find(c => c.id === rule.icon)?.icon ?? earnMeta(rule.type).icon;

const BASE = {eligibility: {mode: 'all'}, schedule: {start: '', end: ''}, limit: {on: false, times: 1, per: 'lifetime'}, status: 'active', completions: 0};

export function newEarn(type, name) {
  const r = {...BASE, id: null, type, name, description: '', reward: {kind: 'fixed', points: 100, type: 'points'}};
  switch (type) {
    case 'place_order':
    case 'place_order_sub':
      return {...r, reward: {kind: 'per_money', points: 1, per: 1, type: 'points'}, rounding: 'down', excludeTax: true, excludeShipping: true, excludeDiscounts: false, minOrder: 0, products: {mode: 'all', list: ''}, sources: ['online'], tierRates: true, cancelMinus: true};
    case 'receipt':
      return {...r, reward: {kind: 'per_money', points: 1, per: 1, type: 'points'}, approval: 'manual'};
    case 'birthday':
      return {...r, reward: {kind: 'fixed', points: 200, type: 'points'}, collectFrom: 'both', once: 'year', tierRates: true};
    case 'review':
      return {...r, reward: {kind: 'fixed', points: 50, type: 'points'}, reviewApp: 'judgeme', photoBonus: 25, minChars: 30, minStars: 1, verifiedOnly: false, approval: 'auto', limit: {on: true, times: 5, per: 'month'}};
    case 'google_review':
      return {...r, location: 'North Bloom, Union Square', approval: 'manual', instant: false};
    case 'visit':
      return {...r, reward: {kind: 'fixed', points: 10, type: 'points'}, pageUrl: 'https://northbloom.com/pages/skincare-guide', visits: 1, linkTitle: 'Read the skincare guide'};
    case 'streak':
      return {...r, reward: {kind: 'fixed', points: 10, type: 'points'}, days: 7, unit: 'day', bonusPerDay: 5, resetRule: 'restart', allowRepeat: true};
    case 'survey':
      return {...r, surveyUrl: 'https://forms.example.com/northbloom-survey', questions: 5, linkTitle: 'Take the 2-minute survey'};
    case 'form':
      return {...r, fields: [{id: 'f1', label: 'Your name', kind: 'text', required: true}, {id: 'f2', label: 'Skin type', kind: 'choice', required: true}], allowUpload: true, uploadFormat: 'image', requireUpload: false, onlyLoggedIn: true, minOrders: 0, approval: 'manual', instant: false};
    case 'custom':
    case 'mobile_app':
      return {...r, trigger: type === 'mobile_app' ? 'app_download' : 'flow', actionKey: 'joy_custom_7f3a', appStore: '', googlePlay: ''};
    case 'sign_up':
    case 'newsletter':
      return {...r, syncExisting: type === 'newsletter'};
    default:
      if (isSocial(type)) return {...r, reward: {kind: 'fixed', points: 50, type: 'points'}, url: '', shareMessage: type.includes('share') ? 'I love North Bloom skincare. Take a look!' : '', joinMethod: 'link', linkTitle: ''};
      return r;
  }
}

export function newReward(type, name) {
  const r = {...BASE, id: null, type, name, cost: 500, minOrder: 0, expiresDays: 90, refundPoints: true, limit: {on: false, times: 1, per: 'lifetime'}, redemptions: 0};
  switch (type) {
    case 'amount': return {...r, value: 5, flexible: false, flexPoints: 100, flexValue: 1, flexMin: 100, flexMax: 2000, appliesTo: 'order', combines: ['shipping'], purchaseType: 'one_time'};
    case 'percent': return {...r, cost: 1000, value: 10, maxDiscount: 30, appliesTo: 'order', combines: [], purchaseType: 'one_time'};
    case 'free_shipping': return {...r, cost: 800, maxShipping: 15, countries: 'all', countryList: ''};
    case 'free_product': return {...r, cost: 1800, product: 'Cloud Cream mini', variant: '15 ml', photo: 'miniJar', quantity: 1, applyTo: 'lowest'};
    case 'bxgy': return {...r, cost: 2500, buy: 2, get: 1, collection: 'Serums', getCollection: 'Serums', getDiscount: 'free', getValue: 100, maxPerOrder: 1};
    case 'store_credit': return {...r, cost: 1000, value: 10, creditExpiry: 'never', creditDays: 365};
    case 'impact': return {...r, cost: 300, value: 1, provider: 'treeplanting', impactType: 'trees'};
    case 'gift_card': return {...r, cost: 2500, value: 25};
    default: return r;
  }
}
