import {EARN_TYPES, REDEEM_TYPES} from '../../../data/seed/programs.js';

export const earnDefault = type => ({
  id: '', type, name: EARN_TYPES.find(t => t.type === type)?.name ?? 'New way to earn',
  description: '', status: 'inactive', reward: {kind: 'fixed', points: 100, per: 1},
  eligibility: {mode: 'all'}, schedule: {start: '', end: ''}, limit: {on: false, times: 1, per: 'lifetime'},
  icon: 'Star', url: '', shareMessage: '', joinMethod: 'link',
  rounding: 'down', excludeTax: true, excludeShipping: true, excludeDiscounts: false,
  minOrder: 0, productScope: 'all', products: '', rewardType: 'points', orderSources: ['online'],
  tierRates: false, tierPoints: {}, collectFrom: 'both', oncePerYear: true,
  photoBonus: 0, minChars: 0, approval: 'auto', questionCount: 1, formFields: ['Email'],
  visitCount: 1, streakDays: 7, bonusPerDay: 0, resetRule: 'missed_day', completions: 0,
});

export const redeemDefault = type => ({
  id: '', type, name: REDEEM_TYPES.find(t => t.type === type)?.name ?? 'New reward',
  description: '', status: 'inactive', cost: 500, value: type === 'percent' ? 10 : 5,
  eligibility: {mode: 'all'}, schedule: {start: '', end: ''}, limit: {on: false, times: 1, per: 'lifetime'},
  minOrder: 0, appliesTo: 'order', products: '', combines: [], expiresDays: 90,
  flexible: false, flexibleEvery: 100, flexibleValue: 1, minPoints: 100, maxPoints: 5000,
  maxDiscount: 30, maxShipping: 15, countries: 'all', countryList: '',
  product: '', variant: '', photo: '', quantityLimit: 1, buy: 2, get: 1,
  collection: '', getCollection: '', discountPercent: 100, creditExpiry: 'days',
  impactKind: 'trees', connected: false, prefix: 'JOY-', tierValues: {}, redemptions: 0,
});
