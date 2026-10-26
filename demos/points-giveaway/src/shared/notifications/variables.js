// Merge tags for the two giveaway emails: the names merchants see in Joy's Email editor V2, flat {{tag}} syntax.
// Preview resolves a tag to a sample (the picked member's real values when "Preview as" is a member).
import {IMAGES, STORE} from '../../data/index.js';

export const SECTIONS = ['This email', 'Customer', 'Store', 'Links'];

const BOTH = ['gift', 'reminder'];
export const VARIABLES = [
  {tag: 'earning_points', label: 'Points given', labels: {reminder: 'Points left to use'}, section: 'This email', events: BOTH},
  {tag: 'points_balance', label: 'Current points balance', section: 'This email', events: BOTH},
  {tag: 'point_expired_at', label: 'Points expiry date', section: 'This email', events: BOTH},
  {tag: 'earning_program', label: 'Giveaway name', section: 'This email', events: BOTH},
  {tag: 'first_name', label: 'First name', section: 'Customer', events: BOTH},
  {tag: 'customer_name', label: 'Customer full name', section: 'Customer', events: BOTH},
  {tag: 'customer_email', label: 'Customer email', section: 'Customer', events: BOTH},
  {tag: 'shop_name', label: 'Shop name', section: 'Store', events: BOTH},
  {tag: 'shop_link', label: 'Shop link', section: 'Store', events: BOTH},
  {tag: 'url_logo', label: 'Shop logo URL', section: 'Store', events: BOTH},
  {tag: 'shop_address', label: 'Shop address', section: 'Store', events: BOTH},
  {tag: 'reward_url', label: 'Reward link', section: 'Links', events: BOTH},
  {tag: 'link_unsubscribe', label: 'Unsubscribe link', section: 'Links', events: BOTH},
];

/** No older names to keep for these two new emails. */
export const LEGACY_TAGS = {};

export const variableByTag = (tag) => VARIABLES.find((v) => v.tag === tag);
export const appliesTo = (variable, emailId) => variable.events.includes(emailId);
export const labelFor = (variable, emailId) => (variable.labels && variable.labels[emailId]) || variable.label;

export const SHOP_ADDRESS = '18 Orchard Lane, Portland, OR 97205';
export const SHOP_URL = `https://${STORE.domain}`;
/** The widget opens on its Redeem tab from this link (Joy's #joy-ways-to-redeem deep link). */
export const REWARD_URL = `https://${STORE.domain}/#joy-ways-to-redeem`;
export const UNSUBSCRIBE_URL = `https://${STORE.domain}/unsubscribe`;
export const SHOP_LOGO = IMAGES.logo;

/** Joy's date style in emails: "December 4, 2026". */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const emailDate = (date) => (date ? `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}` : '');

/** The member a preview is about when no member is picked ("Sample data"). */
export const SAMPLE_MEMBER = {id: 'sample', name: 'Sam Taylor', email: 'sam.taylor@example.com', balance: 350};

/**
 * All tag -> value pairs for one email and one member.
 * Before the giveaway is given, `customer.balance` is today's balance and the points are added on top. Once given
 * (`giveaway.given`), the balance already holds them. `left` = the member's unused giveaway points (reminder);
 * `balance` overrides the balance shown (the storefront passes the balance at send time).
 */
export function sampleValues({emailId, giveaway, customer, left, balance: at}) {
  const c = customer || SAMPLE_MEMBER;
  const points = Number(giveaway.points) || 0;
  const unused = emailId === 'reminder' ? (left ?? points) : points;
  // the sample member has 350 points before any giveaway; a real member's balance already holds given points
  const balance = at ?? (giveaway.given && c !== SAMPLE_MEMBER ? c.balance : c.balance + points);
  return {
    earning_points: `${unused.toLocaleString('en-US')} points`,
    points_balance: balance.toLocaleString('en-US'),
    point_expired_at: emailDate(giveaway.expiresOn),
    earning_program: giveaway.name || 'Points giveaway',
    first_name: c.name.split(' ')[0],
    customer_name: c.name,
    customer_email: c.email,
    shop_name: STORE.name,
    shop_link: SHOP_URL,
    url_logo: SHOP_LOGO,
    shop_address: SHOP_ADDRESS,
    reward_url: REWARD_URL,
    link_unsubscribe: UNSUBSCRIBE_URL,
  };
}

export const TAG_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

/**
 * Replace {{tags}} with sample values. A tag that does not apply to this email resolves to '' (like Joy: blanked, not left as
 * catalog text); a tag Joy does not know stays as typed so the merchant notices it.
 */
export function resolveText(text, values, emailId) {
  return String(text ?? '').replace(TAG_RE, (match, raw) => {
    const tag = LEGACY_TAGS[raw] || raw;
    const variable = variableByTag(tag);
    if (!variable) return match;
    if (emailId && !appliesTo(variable, emailId)) return '';
    return values[tag] ?? '';
  });
}

/** Every distinct tag used in a string. */
export const tagsIn = (text) => [...new Set([...String(text ?? '').matchAll(TAG_RE)].map((m) => m[1]))];

/** Findings for the lint banner. kind: 'unknown' | 'out-of-scope'. */
export function lintTags(strings, emailId) {
  const out = [];
  const seen = new Set();
  strings.forEach((s) => {
    tagsIn(s).forEach((raw) => {
      const tag = LEGACY_TAGS[raw] || raw;
      const variable = variableByTag(tag);
      let finding = null;
      if (!variable) finding = {kind: 'unknown', tag: raw, message: `{{${raw}}} is not a known merge tag (typo?) — it will always resolve to an empty string at send.`};
      else if (!appliesTo(variable, emailId)) finding = {kind: 'out-of-scope', tag: raw, message: `{{${raw}}} isn't available for this email's event, so it may be blank in the sent email.`};
      if (finding && !seen.has(`${finding.kind}:${raw}`)) {
        seen.add(`${finding.kind}:${raw}`);
        out.push(finding);
      }
    });
  });
  return out;
}

/** Collect every string in a document that can hold a tag. */
export function docStrings(doc) {
  const strings = [doc.subject, doc.preheader];
  const visit = (nodes) =>
    nodes.forEach((n) => {
      Object.values(n.props || {}).forEach((v) => {
        if (typeof v === 'string') strings.push(v);
        else if (Array.isArray(v)) v.forEach((item) => item && typeof item === 'object' && Object.values(item).forEach((x) => typeof x === 'string' && strings.push(x)));
      });
      if (n.children) visit(n.children);
    });
  visit(doc.blocks);
  return strings;
}

export const lintDoc = (doc, emailId) => {
  const findings = lintTags(docStrings(doc), emailId);
  const visit = nodes => nodes.forEach(node => {
    (node.props.condition?.rules || []).forEach(rule => {
      const variable = variableByTag(rule.variable);
      if (!variable || !appliesTo(variable, emailId)) findings.push({kind: 'out-of-scope', tag: rule.variable, message: `Display condition: ${rule.variable || 'choose a variable'} is not available for this email.`});
    });
    if (node.children) visit(node.children);
  });
  visit(doc.blocks);
  return findings;
};

export const initials = (name) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
