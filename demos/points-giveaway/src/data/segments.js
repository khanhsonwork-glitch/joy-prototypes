// The shop's Shopify customer segments (what Joy's /lp/segments returns), each with the query Shopify shows and the rule
// the prototype uses to find its members. Query syntax checked against Shopify Help "Shopify-based customer segment
// filters" (19/10/2026): last_order_date >= -7d, customer_tags CONTAINS '…', number_of_orders > 10,
// orders_placed MATCHES (count >= 3, date BETWEEN … AND …), email_subscription_status = 'SUBSCRIBED'.
import {MEMBERS} from './members.js';

export const SEGMENTS = [
  {id: 's-bfcm', name: 'BFCM 2026 shoppers', query: 'orders_placed MATCHES (count >= 1, date BETWEEN 2026-11-27 AND 2026-11-30)', test: (m) => m.bfcm},
  {id: 's-lapsed', name: 'No order in 180 days', query: 'last_order_date < -180d', test: (m) => m.lastOrderDays !== null && m.lastOrderDays > 180},
  {id: 's-never-redeemed', name: 'Never redeemed a reward', query: "customer_tags CONTAINS 'Joy non-redeemer'", test: (m) => !m.redeemed},
  {id: 's-gold', name: 'VIP Gold', query: "metafields.avada_joy_definition.tierName = 'Gold'", test: (m) => m.tier === 'Gold'},
  {id: 's-delayed', name: 'Delayed orders, October', query: "customer_tags CONTAINS 'delayed-oct'", test: (m) => m.delayedOct},
  {id: 's-subscribers', name: 'Email subscribers', query: "email_subscription_status = 'SUBSCRIBED'", test: (m) => m.subscribed},
  {id: 's-once', name: 'Customers who have purchased at least once', query: 'number_of_orders >= 1', test: (m) => m.orders >= 1},
  {id: 's-repeat', name: 'Customers who have purchased more than once', query: 'number_of_orders > 1', test: (m) => m.orders > 1},
  {id: 's-none', name: "Customers who haven't purchased", query: 'number_of_orders = 0', test: (m) => m.orders === 0},
];
export const segmentById = (id) => SEGMENTS.find((s) => s.id === id);

/**
 * Segment ideas: a short list, each one a plain Shopify segment the merchant creates in Shopify.
 * `needs` = a Joy setting the query depends on (shown so a shop with it off doesn't get an empty segment by surprise).
 */
export const SEGMENT_IDEAS = [
  {name: 'Ordered 3+ times', query: 'number_of_orders >= 3'},
  {name: 'No order in 180 days', query: 'last_order_date < -180d'},
  {name: 'Never redeemed a reward', query: "customer_tags CONTAINS 'Joy non-redeemer'", needs: 'Needs Settings → Auto-tag customers → Redeemer turned on in Joy.'},
];

/**
 * Who a giveaway reaches: loyalty members in ANY of the picked segments (or all members), counted once, then the optional
 * points range on today's balance. `deleted` = segment ids deleted in Shopify (they match nobody).
 */
export function matchMembers({audience, segmentIds = [], range}, deleted = [], balanceOf = (m) => m.balance) {
  const picked = segmentIds.map(segmentById).filter((s) => s && !deleted.includes(s.id));
  let list = audience === 'all' ? MEMBERS : MEMBERS.filter((m) => picked.some((s) => s.test(m)));
  if (range && range.on) {
    const min = Number(range.min) || 0;
    const max = range.max === '' || range.max === null || range.max === undefined ? Infinity : Number(range.max);
    list = list.filter((m) => balanceOf(m) >= min && balanceOf(m) <= max);
  }
  return list;
}
