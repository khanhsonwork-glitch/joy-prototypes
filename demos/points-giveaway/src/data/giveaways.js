// Giveaways: the record, the dates it implies, and the seeded ones Pomelo Park already has on Thu, Dec 3, 2026.
// A giveaway = who (all members or segments, optional points range) + one fixed number of points + start + expiry + two emails.
import {MEMBERS, hash01} from './members.js';
import {matchMembers} from './segments.js';
import {NOW, at, addDays} from './time.js';

export const TRIAL_EMAILS_LEFT = 412; // a trial has 500 emails; this shop has used 88

/** The day the points can last be used (they're removed at the end of it), or null when they never expire. */
export function useBy(g) {
  if (!g.expiry || g.expiry.mode !== 'after' || !(Number(g.expiry.days) > 0)) return null;
  const start = startOf(g);
  const d = addDays(start, Number(g.expiry.days));
  return at(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}
/** When the points are (or were, or will be) given. */
export const startOf = (g) => g.givenAt || (g.start && g.start.mode === 'schedule' && g.start.at ? g.start.at : NOW);
/** Reminder lead times that still fall after the giving day. */
export function reminderChoices(g) {
  const days = g.expiry && g.expiry.mode === 'after' ? Number(g.expiry.days) || 0 : 0;
  return [1, 2, 3].filter((n) => n < days);
}
/** The lead time in use: the saved one, or the longest that still fits when the expiry got shorter. */
export function reminderDays(g) {
  const choices = reminderChoices(g);
  const saved = Number(g.emails?.reminder?.daysBefore) || 1;
  return choices.includes(saved) ? saved : choices[choices.length - 1] || null;
}
/** The reminder goes out at 9:00 AM, N days before the use-by day. Null when it's off or can't fit. */
export function reminderAt(g) {
  const end = useBy(g);
  const n = reminderDays(g);
  if (!end || !n || !g.emails?.reminder?.enabled) return null;
  const d = addDays(end, -n);
  return at(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 9, 0);
}

export const STATUS = {
  draft: {label: 'Draft', tone: undefined},
  scheduled: {label: 'Scheduled', tone: 'info'},
  giving: {label: 'Active', tone: 'success'},
  active: {label: 'Active', tone: 'success'},
  expired: {label: 'Expired', tone: undefined},
  completed: {label: 'Completed', tone: undefined},
};

/** The members a giveaway reaches: frozen when given, counted from today's data before that. */
export function recipientsOf(g, deleted = [], balanceOf) {
  if (g.recipientIds) {
    const ids = new Set(g.recipientIds);
    return MEMBERS.filter((m) => ids.has(m.id));
  }
  const list = matchMembers(g, deleted, balanceOf);
  // older giveaways predate the two customers the storefront follows (Maya joined Jul 2, Jordan Nov 28)
  return g.beforeFollowed ? list.filter((m) => m.id !== 'm0' && m.id !== 'm3') : list;
}

/**
 * What a given giveaway brought back. Seeded giveaways carry their numbers; a giveaway given in this session starts at zero
 * (nothing redeemed yet), with its emails counted from the recipients. `usage` = what the customers followed in the store
 * did with these points today (ledger.usage), added on top.
 */
export function resultsOf(g, usage = null) {
  const list = recipientsOf(g);
  const reached = g.status === 'giving' && g.recipientIds ? new Set(g.recipientIds.slice(0, g.progress || 0)) : null;
  const emailedAll = g.emails?.gift?.enabled ? list.filter((m) => !m.noEmail).slice(0, g.emailCap ?? Infinity) : [];
  const emailed = reached ? emailedAll.filter((m) => reached.has(m.id)).length : emailedAll.length;
  const add = usage || {used: new Set(), orders: 0, sales: 0};
  const base = {members: list.length, emailed, opened: 0, clicked: 0, used: add.used.size, orders: add.orders, sales: add.sales, reminded: 0, reminderOpened: 0, reminderClicked: 0};
  if (!g.seed) return base;
  const usedList = list.filter((m) => (g.seed.usedBy ? g.seed.usedBy(m) : hash01(m.id, `${g.id}-used`) < g.seed.usedRate));
  const orders = usedList.filter((m) => hash01(m.id, `${g.id}-order`) < 0.93);
  const sales = orders.reduce((t, m) => t + 38 + Math.round(hash01(m.id, `${g.id}-sale`) * 52), 0);
  const opened = Math.round(emailed * g.seed.openRate);
  const clicked = Math.round(emailed * g.seed.clickRate);
  const reminded = g.seed.reminded ? list.filter((m) => !m.noEmail && !usedList.includes(m)).length : 0;
  const extraUsed = [...add.used].filter((id) => !usedList.some((m) => m.id === id)).length;
  return {...base, opened, clicked, used: usedList.length + extraUsed, orders: orders.length + add.orders, sales: sales + add.sales, reminded, reminderOpened: Math.round(reminded * 0.44), reminderClicked: Math.round(reminded * 0.15)};
}

const email = (enabled, extra = {}) => ({enabled, ...extra});

export function seedGiveaways() {
  return [
    {
      id: 'g-bfcm',
      name: 'BFCM thank-you',
      sentName: 'BFCM thank-you',
      status: 'active',
      audience: 'segments',
      segmentIds: ['s-bfcm'],
      range: {on: false, min: '', max: ''},
      points: 150,
      expiry: {mode: 'after', days: 3},
      start: {mode: 'now', at: null},
      givenAt: at(2026, 12, 1, 9, 0),
      emails: {gift: email(true), reminder: email(true, {daysBefore: 1})},
      reminderSentAt: at(2026, 12, 3, 9, 0),
      createdAt: at(2026, 11, 30, 16, 20),
      seed: {usedBy: (m) => !!m.bfcmSpent, openRate: 0.54, clickRate: 0.21, reminded: true},
    },
    {
      id: 'g-winback',
      name: 'We miss you',
      status: 'scheduled',
      audience: 'segments',
      segmentIds: ['s-lapsed'],
      range: {on: true, min: '250', max: '499'},
      points: 200,
      expiry: {mode: 'after', days: 7},
      start: {mode: 'schedule', at: at(2026, 12, 8, 9, 0)},
      givenAt: null,
      emails: {gift: email(true), reminder: email(true, {daysBefore: 2})},
      createdAt: at(2026, 12, 1, 15, 5),
    },
    {
      id: 'g-newyear',
      name: 'New year top-up',
      status: 'draft',
      audience: 'all',
      segmentIds: [],
      range: {on: false, min: '', max: ''},
      points: 100,
      expiry: {mode: 'never', days: 7},
      start: {mode: 'schedule', at: at(2027, 1, 2, 9, 0)},
      givenAt: null,
      emails: {gift: email(true), reminder: email(false, {daysBefore: 1})},
      createdAt: at(2026, 12, 2, 9, 40),
    },
    {
      id: 'g-delay',
      name: 'Sorry for the slow shipping',
      sentName: 'Sorry for the slow shipping',
      status: 'completed',
      audience: 'segments',
      segmentIds: ['s-delayed'],
      range: {on: false, min: '', max: ''},
      points: 100,
      expiry: {mode: 'never', days: 7},
      start: {mode: 'now', at: null},
      givenAt: at(2026, 10, 19, 11, 0),
      beforeFollowed: true,
      emails: {gift: email(true), reminder: email(false, {daysBefore: 1})},
      createdAt: at(2026, 10, 19, 10, 45),
      seed: {usedRate: 0.38, openRate: 0.61, clickRate: 0.24, reminded: false},
    },
    {
      id: 'g-spring',
      name: 'Spring refresh',
      sentName: 'Spring refresh',
      status: 'expired',
      audience: 'segments',
      segmentIds: ['s-repeat'],
      range: {on: false, min: '', max: ''},
      points: 200,
      expiry: {mode: 'after', days: 7},
      start: {mode: 'now', at: null},
      givenAt: at(2026, 4, 6, 9, 0),
      beforeFollowed: true,
      emails: {gift: email(true), reminder: email(true, {daysBefore: 2})},
      reminderSentAt: at(2026, 4, 11, 9, 0),
      createdAt: at(2026, 4, 3, 14, 10),
      seed: {usedRate: 0.29, openRate: 0.49, clickRate: 0.17, reminded: true},
    },
  ];
}

/** Members this giveaway can still change: true until the points have been given. */
export const isEditable = (g) => g.status === 'draft' || g.status === 'scheduled';
export const isGiven = (g) => ['giving', 'active', 'expired', 'completed'].includes(g.status);
/**
 * A copy starts as a fresh draft: the setup (who, points, expiry, emails) carries over, nothing that happened does
 * (no send record, no recipients, no trial emails used).
 */
export function duplicateOf(g, id, now) {
  return {
    id,
    name: `${g.name} (copy)`,
    status: 'draft',
    audience: g.audience,
    segmentIds: [...g.segmentIds],
    range: {...g.range},
    points: g.points,
    expiry: {...g.expiry},
    start: {mode: 'now', at: null},
    givenAt: null,
    emails: JSON.parse(JSON.stringify(g.emails || {})),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Did this member get this email? Trial shops send to the first emailable recipients up to the emails they had left
 * (gift first, the reminder from what was left after the gifts).
 */
export function emailReaches(g, member, emailId) {
  if (member.noEmail || g.emails?.[emailId]?.enabled === false) return false;
  const cap = emailId === 'gift' ? g.emailCap : g.reminderCap;
  if (cap === null || cap === undefined) return true;
  const ids = new Set(g.recipientIds || []);
  const position = MEMBERS.filter((m) => ids.has(m.id) && !m.noEmail).findIndex((m) => m.id === member.id);
  return position !== -1 && position < cap;
}

/** Sent is a fact recorded when it went out (seeded giveaways carry it), never inferred from today's dates. */
export const reminderSent = (g) => !!g.reminderSentAt;

/** What an email says about the giveaway: a sent email keeps the name and use-by date it went out with. */
export function emailFacts(g, emailId) {
  if (emailId === 'gift') return {name: g.sentName || g.name, useBy: g.sentUseBy || useBy(g)};
  if (reminderSent(g)) return {name: g.reminderName || g.name, useBy: g.reminderUseBy || useBy(g)};
  return {name: g.name, useBy: useBy(g)};
}
