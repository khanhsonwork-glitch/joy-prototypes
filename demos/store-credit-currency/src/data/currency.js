// The one place that decides what the Store credit tab, the Adjust modal and the activity lines show (PRD A–D).
// Suggested currency = the PO's wallet chain (multi-market decision 23/09, section D), first step with a result:
//   1) most of the customer's paid orders in the last 12 months (tie → most recent order)
//   2) currency the customer last browsed the storefront in
//   3) currency of the market containing the customer's default address
//   4) shop currency
// Only currencies the shop still sells count; a step whose currency the shop no longer sells is skipped.
// A shop that sells one currency skips the chain: the suggestion is always that currency.

/**
 * "$20.00 USD": symbol, amount with the currency's own decimals, then the code exactly once.
 * When the symbol already is the code ("CHF 20.00") nothing is added. "¥2,000 JPY", "€0.00 EUR".
 */
export function money(amount, code) {
  const formatted = new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol'}).format(Number(amount || 0));
  return formatted.includes(code) ? formatted.replace(/ /g, ' ') : `${formatted} ${code}`;
}

/** Shop-currency stat values on the page header cards ("$41.2"), unchanged from the real CustomerStatsSummary. */
export const shopMoney = (amount, code) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2}).format(amount || 0);

/**
 * @returns {{status: 'pending'} | {status: 'failed'} | {status: 'ok', code: string, step: 1|2|3|4|'single'}}
 */
export function suggestCurrency(customer, shop) {
  if (shop.currencies.length === 1) return {status: 'ok', code: shop.currencies[0], step: 'single'};
  if (customer.suggestionPending) return {status: 'pending'};
  if (customer.suggestionFailed) return {status: 'failed'};
  const sells = new Set(shop.currencies);
  const orders = (customer.orders12m || []).filter((o) => sells.has(o.currencyCode));
  if (orders.length) {
    const top = [...orders].sort((x, y) => y.count - x.count || y.lastOrderAt.localeCompare(x.lastOrderAt))[0];
    return {status: 'ok', code: top.currencyCode, step: 1};
  }
  if (customer.lastBrowsedCurrency && sells.has(customer.lastBrowsedCurrency)) return {status: 'ok', code: customer.lastBrowsedCurrency, step: 2};
  if (customer.addressMarketCurrency && sells.has(customer.addressMarketCurrency)) return {status: 'ok', code: customer.addressMarketCurrency, step: 3};
  return {status: 'ok', code: shop.currency, step: 4};
}

const shopFirst = (shop) => (a, b) =>
  a.currencyCode === shop.currency ? -1 : b.currencyCode === shop.currency ? 1 : a.currencyCode.localeCompare(b.currencyCode);

/** Wallets that can be debited: balance > 0, shop currency first, including currencies the shop no longer sells. */
export const fundedWallets = (customer, shop) => (customer.accounts || []).filter((a) => Number(a.amount) > 0).sort(shopFirst(shop));

const listAnd = (codes) => (codes.length < 2 ? codes[0] : `${codes.slice(0, -1).join(', ')} and ${codes[codes.length - 1]}`);

/** Store credit tab (PRD B): rows + the one mismatch note. */
export function tabView(customer, shop) {
  const s = suggestCurrency(customer, shop);
  // Rows: every wallet with a non-zero balance, shop currency first (unchanged).
  const shown = (customer.accounts || []).filter((a) => Number(a.amount) !== 0).sort(shopFirst(shop));
  if (s.status === 'pending') return {rows: shown, note: null, stats: customer.statsByCurrency || {}};
  const zeroCode = s.status === 'ok' ? s.code : shop.currency;
  const rows = shown.length ? shown : [{currencyCode: zeroCode, amount: 0}];
  let note = null;
  if (s.status === 'ok' && [1, 2, 3].includes(s.step)) {
    const others = shown.filter((a) => Number(a.amount) > 0 && a.currencyCode !== s.code).map((a) => a.currencyCode);
    if (others.length === 1) note = `Store credit in ${others[0]} can only be spent on orders paid in ${others[0]}. Suggested currency for this customer: ${s.code}.`;
    if (others.length > 1) note = `Store credit in ${listAnd(others)} can only be spent on orders paid in the same currency. Suggested currency for this customer: ${s.code}.`;
  }
  return {rows, note, stats: customer.statsByCurrency || {}};
}

/** Currency the modal opens on (always with Credit). */
export function defaultCurrency(customer, shop) {
  const s = suggestCurrency(customer, shop);
  return s.status === 'ok' ? s.code : shop.currency;
}

/**
 * Credit ↔ Debit (PRD C). Returns the new currency and whether Joy (not the merchant) picked it.
 * @param autoSwitched true when the current currency was chosen by Joy on the way to Debit
 */
export function currencyAfterTypeChange(customer, shop, type, selected, autoSwitched) {
  if (type === 'debit') {
    const funded = fundedWallets(customer, shop);
    if (funded.some((a) => a.currencyCode === selected) || !funded.length) return {code: selected, auto: false};
    return {code: funded[0].currencyCode, auto: true};
  }
  if (autoSwitched || !shop.currencies.includes(selected)) return {code: defaultCurrency(customer, shop), auto: false};
  return {code: selected, auto: false};
}

const REASON = {
  1: (c) => `Suggested because most of this customer's orders are paid in ${c}.`,
  2: (c) => `Suggested because this customer last browsed your store in ${c}.`,
  3: (c) => `Suggested because this customer's default address is in a market that sells in ${c}.`,
  4: (c) => `We don't know which currency this customer pays in yet. Store credit in ${c} can only be spent on orders paid in ${c}.`,
};

/** Modal (PRD C): options, balance, and the one line under the Adjustment · Currency · Amount row. */
export function modalView(customer, shop, type, selected) {
  const s = suggestCurrency(customer, shop);
  if (s.status === 'pending') return {pending: true, options: [], balance: null, line: null};
  let options;
  if (type === 'credit') {
    options = shop.currencies.map((c) => ({value: c, label: s.status === 'ok' && s.step !== 'single' && c === s.code ? `${c} (suggested)` : c}));
  } else {
    options = fundedWallets(customer, shop).map((a) => ({value: a.currencyCode, label: a.currencyCode}));
    if (!options.some((o) => o.value === selected)) options = [{value: selected, label: selected}];
  }
  const balance = Number((customer.accounts || []).find((a) => a.currencyCode === selected)?.amount || 0);

  let line = null; // {kind: 'reason' | 'warning', text}
  if (type === 'credit' && shop.currencies.length > 1) {
    if (s.status === 'failed') {
      line = {kind: 'warning', text: `We couldn't check which currency this customer pays in. Make sure ${selected} is right before adding credit.`};
    } else if (selected === s.code) {
      line = {kind: 'reason', text: REASON[s.step](s.code)};
    } else if ([1, 2, 3].includes(s.step)) {
      line = {kind: 'warning', text: `Store credit in ${selected} can only be spent on orders paid in ${selected}. Suggested currency for this customer: ${s.code}.`};
    } // step 4 + another currency: no line
  }
  return {pending: false, options, balance, line};
}
