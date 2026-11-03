// The one place that decides what the Store credit tab, the Adjust modal and the activity lines show.
// Small UI fix (scope cut 03/11/2026):
//   - every store credit amount ends with its currency code exactly once ("$20.00 USD")
//   - Credit lists every currency the shop sells; the modal opens on the currency of the customer's last order
//     (if the shop still sells it), else today's rule (first funded wallet, shop currency first, else shop currency)
//   - one subdued line about the last order, plus a warning when Credit uses another currency
//   - Debit unchanged from today

/**
 * "$20.00 USD": symbol, amount with the currency's own decimals, then the code exactly once.
 * When the symbol already is the code ("CHF 20.00") nothing is added.
 */
export function money(amount, code) {
  const formatted = new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol'}).format(Number(amount || 0));
  return formatted.includes(code) ? formatted.replace(/ /g, ' ') : `${formatted} ${code}`;
}

/** Shop-currency stat values on the page header cards ("$41.2"), unchanged from the real CustomerStatsSummary. */
export const shopMoney = (amount, code) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2}).format(amount || 0);

const shopFirst = (shop) => (a, b) =>
  a.currencyCode === shop.currency ? -1 : b.currencyCode === shop.currency ? 1 : a.currencyCode.localeCompare(b.currencyCode);

/** Store credit tab rows, unchanged from today: every wallet with a non-zero balance, shop currency first; none → one 0 row in the shop currency. */
export function tabRows(customer, shop) {
  const funded = (customer.accounts || []).filter((a) => Number(a.amount) !== 0).sort(shopFirst(shop));
  return funded.length ? funded : [{currencyCode: shop.currency, amount: 0}];
}

/** Last order currency, only if the shop still sells it (null = no order, or a currency the shop dropped). */
export const lastOrderCurrency = (customer, shop) =>
  customer.lastOrderCurrency && shop.currencies.includes(customer.lastOrderCurrency) ? customer.lastOrderCurrency : null;

/** Today's default: first funded wallet (shop currency first), else the shop currency. */
const todaysDefault = (customer, shop) => tabRows(customer, shop)[0].currencyCode;

/** Currency the modal opens on (always with Credit). */
export const defaultCurrency = (customer, shop) => lastOrderCurrency(customer, shop) || todaysDefault(customer, shop);

/** Debit list, unchanged from today: shop currency + every currency the customer has a wallet in. */
const debitCurrencies = (customer, shop) => [...new Set([shop.currency, ...(customer.accounts || []).map((a) => a.currencyCode)])];

/** Currency after switching Credit ↔ Debit. */
export function currencyAfterTypeChange(customer, shop, type, selected) {
  if (type === 'debit') return debitCurrencies(customer, shop).includes(selected) ? selected : todaysDefault(customer, shop);
  return shop.currencies.includes(selected) ? selected : defaultCurrency(customer, shop);
}

/** Modal: options, balance, and the lines under the Adjustment · Currency · Amount row (Credit only). */
export function modalView(customer, shop, type, selected) {
  const codes = type === 'credit' ? shop.currencies : debitCurrencies(customer, shop);
  const options = codes.map((c) => ({value: c, label: c}));
  const balance = Number((customer.accounts || []).find((a) => a.currencyCode === selected)?.amount || 0);
  const last = lastOrderCurrency(customer, shop);
  const lines = [];
  if (type === 'credit' && last) {
    lines.push({kind: 'info', text: `This customer's last order was paid in ${last}.`});
    if (selected !== last) lines.push({kind: 'warning', text: `Store credit in ${selected} can only be spent on orders paid in ${selected}.`});
  }
  return {options, balance, lines};
}
