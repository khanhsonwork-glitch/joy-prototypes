// The four 2026 plans as the Joy Plans page lists them (Starter, Essential, Advanced, Ultimate), plus the one
// rule this prototype is about: Black Friday takes 30% off Advanced and Ultimate for the first 3 monthly charges.
// Every price on every screen comes from planView() so the Plans page and the onboarding step cannot disagree.

export const PROMO = {
  percent: 30,
  cycles: 3,
  plans: ['advanced', 'ultimate'],
  lastDay: 'Dec 31, 2026',
};

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    rank: 0,
    price: 0,
    description: "For new stores starting their first loyalty program and exploring Joy's potential.",
    freeOrders: '250 monthly free orders',
    extraOrders: 'No additional charges',
    freeOrderCount: 250,
    heading: 'Features:',
    features: [
      'Basic point & rewards program',
      'Referral program',
      {label: 'Unified Widget', badge: 'Best-in-class'},
      'Customize branding (colors, logo, fonts)',
      'Email reward notifications',
      '1 language support',
      '24/7 Live chat support',
    ],
  },
  {
    id: 'essential',
    name: 'Essential',
    rank: 1,
    price: 29,
    trialDays: 14,
    description: 'For growing stores scaling loyalty with AI, analytics, and 30+ integrations.',
    freeOrders: '500 monthly free orders',
    extraOrders: '+$15 per 100 additional orders',
    heading: 'All Starter features, plus:',
    features: [
      'Complete points program',
      {label: 'Joy AI Agent', badge: 'NEW'},
      'On-brand loyalty page',
      'Potential points on product page',
      'Analytics',
      'Point expiration',
      'Shopify Flow and 30+ integrations',
      'Custom email templates',
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    rank: 2,
    price: 129,
    trialDays: 14,
    description: 'For scaling brands — VIP tiers, paid membership, POS, and social rewards.',
    freeOrders: '2,000 monthly free orders',
    extraOrders: '+$10 per 100 additional orders',
    heading: 'All Essential features, plus:',
    features: [
      'VIP tiers + B2B/Wholesale tiers',
      'Paid membership',
      {label: 'Social rewards — Instagram, Facebook automation', badge: 'ONLY JOY'},
      {label: 'Loyalty rule engine', badge: 'Best-in-class'},
      'Apple & Google Wallet passes',
      'Redeem in cart',
      'Loyalty Hub (Shopify native UI)',
      'POS loyalty extension',
      'Automated translation',
    ],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    rank: 3,
    price: 499,
    trialDays: 30,
    description: 'For large brands - custom workflows, omnichannel & white-glove onboarding.',
    freeOrders: '7,000 monthly free orders',
    extraOrders: '+$5 per 100 additional orders',
    heading: 'All Advanced features, plus:',
    features: [
      'Up to 7000 free orders',
      'On-demand development hours',
      'Checkout loyalty extensions',
      'Dynamic point expiration',
      'Developer toolkit',
      'Headless commerce (Hydrogen)',
      'Unlimited integration, APIs & Webhooks',
      'Priority support · dedicated AM',
    ],
  },
];

export const SHOPS = [
  {value: 'starter', label: 'Shop on Starter (free)', help: 'Never paid, trial not used'},
  {value: 'essential', label: 'Shop on Essential', help: 'Paying $29/month, trial used'},
  {value: 'advanced', label: 'Shop on Advanced', help: 'Paying $129/month'},
];

export const CAMPAIGN = [
  {value: 'running', label: 'Black Friday running', help: 'Nov 3 – Dec 31, 2026'},
  {value: 'ended', label: 'After Dec 31, 2026', help: 'Offer over, prices back to normal'},
];

const money = (value) => (Number.isInteger(value) ? `${value}` : value.toFixed(2));

/**
 * What one plan card shows for a shop.
 * The promo only applies to a plan above the shop's current one, on monthly billing, while the campaign runs.
 */
export function planView(plan, {shopPlan, campaign, interval}) {
  const current = PLANS.find((p) => p.id === shopPlan);
  const isCurrent = plan.id === shopPlan;
  const isUpgrade = plan.rank > current.rank;
  const promo =
    campaign === 'running' && interval === 'monthly' && PROMO.plans.includes(plan.id) && isUpgrade
      ? {percent: PROMO.percent, cycles: PROMO.cycles}
      : null;
  const base = interval === 'annually' ? plan.price * 12 : plan.price;
  const price = promo ? +(base * (1 - promo.percent / 100)).toFixed(2) : base;

  let cta;
  if (isCurrent) cta = {label: 'Current plan', disabled: true};
  else if (!isUpgrade) cta = {label: 'Downgrade'};
  else if (shopPlan === 'starter') cta = {label: `${plan.trialDays}-day free trial`};
  else cta = {label: 'Upgrade'};

  return {
    ...plan,
    isCurrent,
    cta,
    promo,
    price: money(price),
    originalPrice: promo ? money(base) : null,
    suffix: interval === 'annually' ? 'year' : 'month',
    // The card's "Recommended" tab sits on Advanced only when it is above the shop's plan (never suggests a downgrade).
    recommended: plan.id === 'advanced' && isUpgrade,
  };
}

/** Banner copy, one place for the Plans page, the onboarding step and the Dashboard banner. */
export const BFCM_COPY = {
  title: 'Black Friday: 30% off Advanced & Ultimate',
  line: `Your first 3 monthly charges, when you upgrade by ${PROMO.lastDay}. Applied automatically — no code needed.`,
  tooltip: '30% off your first 3 monthly charges. If you switch between Advanced and Ultimate during these 3 charges, the discount continues on the new plan.',
};
