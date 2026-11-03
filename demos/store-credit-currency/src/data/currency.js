// The one place that decides what the Store credit tab and the Adjust modal show.
// Suggested currency = the PO's wallet chain for "no order" cases (multi-market decision 23/09, section D):
//   a) most of the customer's orders in the last 12 months (tie → most recent order)
//   b) currency the customer last browsed the storefront in
//   c) currency of the market containing the customer's default address
//   d) shop currency
// Only currencies the shop still sells count; a step whose currency the shop no longer sells is skipped.
// Both screens read from here, so the tab, the modal options and every line under the row always agree.

/** Narrow symbol of a currency, the same helper the real modal uses for "Current balance": $ for USD and SGD, € for EUR. */
export function currencySymbol(code) {
  const part = new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0})
    .formatToParts(0)
    .find((p) => p.type === 'currency');
  return part ? part.value : '';
}

const twoDecimals = (n) => Number(n || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

/** "$20.00 USD": symbol, amount, then the code exactly once (as Shopify's own customer page and the modal's balance line). */
export const money = (amount, code) => `${currencySymbol(code)}${twoDecimals(amount)} ${code}`;

/** Shop-currency stat values on the page header cards ("$41.2"), unchanged from the real CustomerStatsSummary. */
export const shopMoney = (amount, code) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2}).format(amount || 0);

const listCodes = (codes) => (codes.length < 2 ? codes.join('') : `${codes.slice(0, -1).join(', ')} and ${codes[codes.length - 1]}`);
const orCodes = (codes) => (codes.length < 2 ? codes.join('') : `${codes.slice(0, -1).join(', ')} or ${codes[codes.length - 1]}`);

/** @returns {{code: string, step: 'a'|'b'|'c'|'d'} | null} null = the suggestion could not be worked out. */
export function suggestCurrency(customer, shop) {
  if (customer.suggestionFailed) return null;
  const sells = new Set(shop.currencies);
  const orders = (customer.orders12m || []).filter((o) => sells.has(o.currencyCode));
  if (orders.length) {
    const top = [...orders].sort((x, y) => y.count - x.count || y.lastOrderAt.localeCompare(x.lastOrderAt))[0];
    return {code: top.currencyCode, step: 'a'};
  }
  if (customer.lastBrowsedCurrency && sells.has(customer.lastBrowsedCurrency)) return {code: customer.lastBrowsedCurrency, step: 'b'};
  if (customer.addressMarketCurrency && sells.has(customer.addressMarketCurrency)) return {code: customer.addressMarketCurrency, step: 'c'};
  return {code: shop.currency, step: 'd'};
}

const REASON = {
  a: (c) => `Suggested because most of this customer's orders are paid in ${c}.`,
  b: (c) => `Suggested because this customer last browsed your store in ${c}.`,
  c: (c) => `Suggested because this customer's default address is in a market that sells in ${c}.`,
};

/** Funded wallets, shop currency first (unchanged order from today's Store credit tab). */
export function fundedWallets(customer, shop) {
  return (customer.accounts || [])
    .filter((a) => Number(a.amount) > 0)
    .sort((a, b) => (a.currencyCode === shop.currency ? -1 : b.currencyCode === shop.currency ? 1 : a.currencyCode.localeCompare(b.currencyCode)));
}

/** Store credit tab: rows + the one mismatch note. */
export function tabView(customer, shop) {
  const suggestion = suggestCurrency(customer, shop);
  const funded = fundedWallets(customer, shop);
  const fallback = suggestion ? suggestion.code : shop.currency;
  // No funded wallet → a single zero row in the suggested currency (shop currency only if the suggestion failed).
  const rows = funded.length ? funded : [{currencyCode: fallback, amount: 0}];
  const mismatched = suggestion && !funded.some((a) => a.currencyCode === suggestion.code) ? funded.map((a) => a.currencyCode) : [];
  const note = mismatched.length
    ? `Store credit in ${listCodes(mismatched)} can only be spent on orders paid in ${orCodes(mismatched)}. Suggested currency for this customer: ${suggestion.code}.`
    : null;
  return {rows, note, stats: customer.statsByCurrency || {}};
}

/** Modal: default selection when it opens (always Credit). */
export function defaultCurrency(customer, shop) {
  const suggestion = suggestCurrency(customer, shop);
  return suggestion ? suggestion.code : shop.currency;
}

/** Currency to land on when the admin switches Credit ↔ Debit. */
export function currencyAfterTypeChange(customer, shop, type, selected) {
  if (type === 'debit') {
    const funded = fundedWallets(customer, shop);
    // Selected wallet has no balance → first funded wallet; none funded → keep it (Confirm then says insufficient balance).
    return funded.some((a) => a.currencyCode === selected) ? selected : funded[0]?.currencyCode || selected;
  }
  return shop.currencies.includes(selected) ? selected : defaultCurrency(customer, shop);
}

/** Modal: options, balance and the line under the Adjustment · Currency · Amount row. */
export function modalView(customer, shop, type, selected) {
  const suggestion = suggestCurrency(customer, shop);
  const funded = fundedWallets(customer, shop);
  let options;
  if (type === 'credit') {
    options = shop.currencies.map((c) => ({value: c, label: suggestion && c === suggestion.code ? `${c} (suggested)` : c}));
  } else {
    options = funded.map((a) => ({value: a.currencyCode, label: a.currencyCode}));
    if (!options.some((o) => o.value === selected)) options = [{value: selected, label: selected}];
  }
  const balance = Number((customer.accounts || []).find((a) => a.currencyCode === selected)?.amount || 0);

  let line = null; // {kind: 'reason' | 'warning', text}
  if (type === 'credit') {
    if (!suggestion) {
      line = {kind: 'warning', text: `We couldn't check which currency this customer pays in. Make sure ${selected} is right before adding credit.`};
    } else if (selected !== suggestion.code) {
      line = {kind: 'warning', text: `Store credit in ${selected} can only be spent on orders paid in ${selected}. Suggested currency for this customer: ${suggestion.code}.`};
    } else if (REASON[suggestion.step] && suggestion.code !== shop.currency) {
      // Suggestion = shop currency (step d, or a customer who only pays in the shop currency) → nothing to explain.
      line = {kind: 'reason', text: REASON[suggestion.step](suggestion.code)};
    }
  }
  return {options, balance, line, suggestion};
}
