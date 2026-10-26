// The two members the customer side follows, both reached by "BFCM thank-you" (150 points each, given Tue, Dec 1).
// Maya: 350 + 150 = 500, exactly $5 off. Jordan: 74 + 150 = 224, still 276 short of $5 off.
// Their points history before the gift adds up to their balance before it.
import {at} from './time.js';

export const GIFT = {giveawayId: 'g-bfcm', points: 150, at: at(2026, 12, 1, 9, 0)};

/** A customer's store visit before they do anything: two products in the cart, nothing redeemed or ordered. */
export const newVisit = () => ({actions: [], coupons: [], items: ['vitamin-c-glow-serum', 'pomelo-cloud-cream'], seen: []});

export const PEOPLE = {
  maya: {
    key: 'maya',
    memberId: 'm0',
    first: 'Maya',
    name: 'Maya Chen',
    email: 'maya.chen@example.com',
    initials: 'MC',
    since: 'Jul 2, 2026',
    before: 350,
    history: [
      {label: 'Placed order #1186', points: 94, at: at(2026, 11, 28, 20, 14)},
      {label: 'Wrote a review', points: 50, at: at(2026, 9, 3, 11, 40)},
      {label: 'Placed order #1094', points: 106, at: at(2026, 8, 18, 19, 5)},
      {label: 'Followed on Instagram', points: 50, at: at(2026, 7, 2, 8, 30)},
      {label: 'Signed up', points: 50, at: at(2026, 7, 2, 8, 22)},
    ],
  },
  jordan: {
    key: 'jordan',
    memberId: 'm3',
    first: 'Jordan',
    name: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    initials: 'JL',
    since: 'Nov 28, 2026',
    before: 74,
    history: [
      {label: 'Placed order #1191', points: 24, at: at(2026, 11, 28, 13, 2)},
      {label: 'Signed up', points: 50, at: at(2026, 11, 28, 12, 51)},
    ],
  },
};
