// One points ledger for the demo, so a grant or a redemption shows up everywhere it should.
// Members' points are lots: own points (no expiry) and one lot per giveaway (its own use-by day).
// Spending takes from the lot that expires first, then own points; at the end of a lot's use-by day, whatever is left
// of that lot expires. Nothing spent after that day is taken from it.
// Admin side: every member's balance = the seeded balance (today) + giveaways given in this session; the two customers the
// storefront follows (Maya, Jordan) are replayed with what they did in the store today, so the admin sees it too.
import {END_OF_TODAY, NOW, addDays} from './time.js';
import {useBy} from './giveaways.js';
import {GIFT, PEOPLE} from './people.js';

const GIVEN = ['giving', 'active', 'expired', 'completed'];

/** Giveaways given in this session (not seeded) that reached this member: {g, points, at}. */
export function sessionLots(giveaways, memberId) {
  return giveaways
    .filter((g) => !g.seed && g.recipientIds && g.givenAt && GIVEN.includes(g.status))
    .filter((g) => {
      const i = g.recipientIds.indexOf(memberId);
      return i !== -1 && (g.status !== 'giving' || i < (g.progress || 0));
    })
    .map((g) => ({g, points: g.points, at: g.givenAt}));
}

/**
 * The shop's clock today: it starts at NOW and moves on with whatever happened since, in the admin (points given) or in
 * the store (redeemed, ordered). Anything done next is stamped after it, so a grant made after an order can never be
 * replayed as having paid for it.
 */
export function clockNow(giveaways, visits = {}) {
  const stamps = [
    ...giveaways.filter((g) => !g.seed && g.givenAt).map((g) => g.givenAt),
    ...Object.values(visits).flatMap((v) => [...(v.actions || []), ...(v.coupons || [])].map((x) => x.at)),
  ].filter((t) => t && t >= NOW && t < END_OF_TODAY);
  return new Date(Math.max(NOW.getTime(), ...stamps.map((t) => t.getTime())));
}

/** The moment a lot expires: the end of its use-by day (null = never). */
export const lotEnd = (g) => {
  const d = useBy(g);
  return d ? addDays(d, 1) : null;
};

/** A followed customer's giveaway lots: the Dec 1 BFCM gift, then any giveaway given in this session that reached them. */
export function personLots(person, giveaways) {
  const bfcm = giveaways.find((x) => x.id === GIFT.giveawayId);
  return [
    ...(bfcm ? [{id: bfcm.id, g: bfcm, name: bfcm.name, points: GIFT.points, at: GIFT.at, end: lotEnd(bfcm)}] : []),
    ...sessionLots(giveaways, person.memberId).map(({g, points, at}) => ({id: g.id, g, name: g.name, points, at, end: lotEnd(g)})),
  ];
}

/**
 * Which lots a redemption takes its points from, at the moment it happens: the lot that expires first, then the next.
 * The result is stored on the redemption, so later changes (a use-by date moved, a new grant) never re-decide it.
 */
export function allocate(lots, left, points) {
  let need = points;
  const took = {};
  lots
    .filter((l) => (left[l.id] || 0) > 0)
    .sort((a, b) => (a.end ? a.end.getTime() : Infinity) - (b.end ? b.end.getTime() : Infinity))
    .forEach((l) => {
      const take = Math.min(need, left[l.id]);
      need -= take;
      if (take) took[l.id] = take;
    });
  return took;
}

/**
 * Replay a member's points up to time `t`.
 * lots: [{id, name, points, at, end}] · own: points before any lot · actions: [{kind: 'redeem'|'order', at, points, code?}]
 * -> {balance, left: {lotId: points}, drawn: {couponCode: {lotId: points}}, history: [{label, points, at, expires?}] (newest first)}
 */
export function replay({own, lots, actions, t}) {
  const events = [
    ...lots.filter((l) => l.at <= t).map((l) => ({at: l.at, kind: 'grant', lot: l})),
    ...lots.filter((l) => l.end && l.end <= t).map((l) => ({at: l.end, kind: 'expire', lot: l})),
    ...actions.filter((a) => a.at <= t),
  ].sort((a, b) => a.at - b.at || (a.kind === 'expire' ? -1 : 1));
  const left = {};
  const drawn = {};
  let ownLeft = own;
  const history = [];
  events.forEach((e) => {
    if (e.kind === 'grant') {
      left[e.lot.id] = e.lot.points;
      history.push({label: e.lot.name, points: e.lot.points, at: e.at, expires: e.lot.end ? addDays(e.lot.end, -1) : null, lotId: e.lot.id});
    } else if (e.kind === 'expire') {
      const n = left[e.lot.id] || 0;
      left[e.lot.id] = 0;
      if (n) history.push({label: 'Expired points', points: -n, at: e.at});
    } else if (e.kind === 'order') {
      ownLeft += e.points;
      history.push({label: `Placed order #${e.no}`, points: e.points, at: e.at});
    } else if (e.kind === 'redeem') {
      // the lots it took from were decided when it happened (e.took); older records fall back to deciding now
      const planned = e.took || allocate(lots, left, e.points);
      let need = e.points;
      const took = {};
      Object.entries(planned).forEach(([id, n]) => {
        const take = Math.min(n, left[id] || 0, need);
        left[id] = (left[id] || 0) - take;
        need -= take;
        if (take) took[id] = take;
      });
      ownLeft -= need;
      if (e.code) drawn[e.code] = took;
      history.push({label: `Redeemed ${e.name}`, points: -e.points, at: e.at});
    }
  });
  const balance = ownLeft + Object.values(left).reduce((s, n) => s + n, 0);
  return {balance, left, drawn, history: history.reverse()};
}

/**
 * The admin's ledger, as of today. balance(m) = balance now; usage(giveawayId) = what the followed customers did with that
 * giveaway's points today: who used them, the orders that used a coupon bought with them, and those orders' sales.
 * person(key) = that customer's replay (lots, state) for their customer page.
 */
export function makeLedger(giveaways, visits = {}) {
  const extra = new Map();
  giveaways
    .filter((g) => !g.seed && g.recipientIds && g.givenAt && GIVEN.includes(g.status))
    .forEach((g) => {
      const upto = g.status === 'giving' ? g.progress || 0 : g.recipientIds.length;
      for (let i = 0; i < upto; i += 1) extra.set(g.recipientIds[i], (extra.get(g.recipientIds[i]) || 0) + g.points);
    });

  const t = new Date(END_OF_TODAY.getTime() - 1);
  const people = {};
  Object.values(PEOPLE).forEach((p) => {
    const actions = (visits[p.key]?.actions || []).filter((a) => a.at <= t);
    const lots = personLots(p, giveaways);
    people[p.key] = {person: p, lots, actions, state: replay({own: p.before, lots, actions, t})};
  });
  const byMember = new Map(Object.values(people).map((x) => [x.person.memberId, x]));
  // a shop with no Dec 1 giveaway (the "no giveaway yet" view): balances are the ones from before it
  const hasBfcm = giveaways.some((g) => g.id === GIFT.giveawayId);
  const seeded = (m) => (hasBfcm || !m.bfcm ? m.balance : m.bfcmBefore);

  const usage = (giveawayId) => {
    const used = new Set();
    let orders = 0;
    let sales = 0;
    let shared = 0; // orders paid partly with another giveaway's points too: they count in both
    Object.values(people).forEach(({person, actions, state}) => {
      const codes = Object.keys(state.drawn).filter((code) => state.drawn[code][giveawayId]);
      if (!codes.length) return;
      used.add(person.memberId);
      actions
        .filter((a) => a.kind === 'order' && codes.includes(a.couponCode))
        .forEach((a) => {
          orders += 1;
          sales += a.total;
          if (Object.keys(state.drawn[a.couponCode]).length > 1) shared += 1;
        });
    });
    return {used, orders, sales, shared};
  };

  return {
    balance: (m) => (byMember.has(m.id) ? byMember.get(m.id).state.balance : seeded(m) + (extra.get(m.id) || 0)),
    extra: (id) => extra.get(id) || 0,
    usage,
    person: (key) => people[key],
  };
}
