// Pomelo Park: the fictional skincare shop used across Joy prototypes.

export const STORE = {
  name: 'Pomelo Park',
  domain: 'pomelopark.com',
  email: 'hello@pomelopark.com',
  owner: 'Rosa',
  ownerEmail: 'rosa@pomelopark.com',
  plan: 'Advanced',
};

export const num = (n) => Math.round(n).toLocaleString('en-US');
export const money = (n, cents = false) =>
  `$${Number(n).toLocaleString('en-US', {minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0})}`;
/** "1 member", "312 members" */
export const mem = (n) => `${num(n)} member${Math.round(n) === 1 ? '' : 's'}`;
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
/** "8%", or "<1%" when some but under half a percent (so a real use never reads as 0%). */
export const pctLabel = (a, b) => (a > 0 && pct(a, b) === 0 ? '<1%' : `${pct(a, b)}%`);

/** The shop's redeem programs, as members see them in the widget and cart. */
export const REWARDS = [
  {id: 'r5', name: '$5 off', points: 500, value: 5},
  {id: 'r10', name: '$10 off', points: 1000, value: 10},
  {id: 'r20', name: '$20 off', points: 1800, value: 20},
];
export const CHEAPEST = REWARDS[0];

export const IMAGES = {
  logo: 'img/logo.png',
  icon: 'img/icon.png',
  hero: 'img/hero.jpg',
  club: 'img/club-hero.jpg',
};

export const STOREFRONT_COLORS = {
  cream: '#fef8ea',
  ink: '#3b1f2b',
  yellow: '#fae13f',
  pink: '#fbcac3',
  pomelo: '#f19ea6',
};

const P = (handle, title, price) => ({handle, title, price, image: `img/${handle}.jpg`});
export const PRODUCTS = [
  P('vitamin-c-glow-serum', 'Vitamin C Glow Serum', 34),
  P('pomelo-cloud-cream', 'Pomelo Cloud Cream', 28),
  P('sunny-side-spf-40', 'Sunny Side SPF 40', 24),
  P('pomelo-peel-pha-toner', 'Pomelo Peel PHA Toner', 22),
  P('overnight-glow-mask', 'Overnight Glow Mask', 30),
  P('citrus-gel-cleanser', 'Citrus Gel Cleanser', 18),
];
export const productByHandle = (handle) => PRODUCTS.find((p) => p.handle === handle);
