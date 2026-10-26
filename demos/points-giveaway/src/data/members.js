// A deterministic member base for Pomelo Park, so every count on the screen is computed from members and segments
// instead of being typed in. Balances are "now" (Thu, Dec 3, 10:30 AM): BFCM shoppers already hold the 150 points of
// the Dec 1 giveaway, unless they used them.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable 0..1 number for a member and a salt (who used which giveaway's points, who opened which email). */
export function hash01(id, salt) {
  let h = 2166136261;
  const s = `${id}:${salt}`;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

const FIRST = ['Maya', 'Leo', 'Ana', 'Jordan', 'Priya', 'Noah', 'Chloe', 'Mateo', 'Hana', 'Owen', 'Zoe', 'Ethan', 'Aisha', 'Lucas', 'Mia', 'Daniel', 'Sofia', 'Ryan', 'Grace', 'Kenji', 'Isla', 'Marcus', 'Elena', 'Theo', 'Nina', 'Samuel', 'Leila', 'Caleb', 'Ruby', 'Arjun', 'Freya', 'Diego', 'Ava', 'Felix', 'Imani', 'Hugo', 'Lily', 'Omar', 'Clara', 'Ben'];
const LAST = ['Chen', 'Patel', 'Garcia', 'Lee', 'Nguyen', 'Kim', 'Brooks', 'Rossi', 'Okafor', 'Silva', 'Walsh', 'Tanaka', 'Haddad', 'Novak', 'Reyes', 'Fischer', 'Ahmed', 'Murphy', 'Costa', 'Larsen', 'Dubois', 'Shah', 'Bennett', 'Ito', 'Moreau', 'Kowalski', 'Hughes', 'Mendes', 'Sato', 'Price'];
const DOMAINS = ['gmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'proton.me'];

/** The Dec 1 giveaway: what it gave and who used it (read by members.js to set balances and by giveaways.js for results). */
export const BFCM_GIFT = 150;
export const bfcmUsed = (m) => m.id === 'm0' || m.id === 'm3' ? false : hash01(m.id, 'g-bfcm-used') < 0.21;

function build() {
  const r = rng(20261202);
  const between = (a, b) => Math.round(a + r() * (b - a));
  const used = new Set();
  const members = [];
  for (let n = 0; n < 4860; n += 1) {
    const first = FIRST[n % FIRST.length];
    const last = LAST[(n * 7 + Math.floor(n / FIRST.length)) % LAST.length];
    let email = `${first}.${last}@${DOMAINS[Math.floor(r() * DOMAINS.length)]}`.toLowerCase();
    if (used.has(email)) email = email.replace('@', `${n}@`);
    used.add(email);
    const orders = r() < 0.2 ? 0 : 1 + Math.floor(-Math.log(1 - r()) * 2.2);
    const roll = r();
    let balance;
    if (roll < 0.46) balance = between(0, 245);
    else if (roll < 0.7) balance = between(250, 495);
    else if (roll < 0.92) balance = between(500, 1500);
    else balance = between(1500, 3200);
    const bfcm = orders > 0 && r() < 0.26;
    const lastOrderDays = orders === 0 ? null : bfcm ? between(2, 5) : r() < 0.3 ? between(181, 700) : between(6, 180);
    const redeemed = orders > 0 && (balance > 900 ? r() < 0.6 : r() < 0.22);
    members.push({
      id: `m${n}`,
      first,
      last,
      name: `${first} ${last}`,
      email,
      orders,
      lastOrderDays,
      bfcm,
      redeemed,
      tier: balance > 1600 && r() < 0.8 ? 'Gold' : balance > 600 && r() < 0.55 ? 'Silver' : 'Bronze',
      subscribed: r() < 0.72,
      // unsubscribed from Joy's emails: still gets points, never the emails
      noEmail: r() < 0.05,
      delayedOct: orders > 0 && r() < 0.035,
      balance,
    });
  }
  // The two customers the storefront follows: both BFCM shoppers who got 150 points on Dec 1.
  Object.assign(members[0], {first: 'Maya', last: 'Chen', name: 'Maya Chen', email: 'maya.chen@example.com', orders: 4, lastOrderDays: 3, bfcm: true, redeemed: false, tier: 'Bronze', subscribed: true, noEmail: false, balance: 350});
  Object.assign(members[3], {first: 'Jordan', last: 'Lee', name: 'Jordan Lee', email: 'jordan.lee@example.com', orders: 1, lastOrderDays: 4, bfcm: true, redeemed: false, tier: 'Bronze', subscribed: true, noEmail: false, balance: 74});
  // Dec 1: every BFCM shopper got 150 points; about one in five has already spent them on $5 off (500 points).
  members.forEach((m) => {
    if (!m.bfcm) return;
    m.bfcmBefore = m.balance;
    m.balance += BFCM_GIFT;
    if (bfcmUsed(m) && m.balance >= 500) {
      m.balance -= 500;
      m.redeemed = true;
      m.bfcmSpent = true;
    }
  });
  return members;
}

export const MEMBERS = build();
export const memberById = (id) => MEMBERS.find((m) => m.id === id);
/** Giveaway points the member still holds from the Dec 1 giveaway (expire end of Fri, Dec 4). */
export const bfcmLeft = (m) => (m.bfcm && !m.bfcmSpent ? BFCM_GIFT : 0);
