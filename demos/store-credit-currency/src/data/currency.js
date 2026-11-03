// The one place that decides what the Store credit tab and the Adjust modal show (rules A1–A2, B3–B8).
// Both screens read from currencyView(), so the tab, the modal and the warning can never disagree.

/** Narrow symbol of a currency, the same helper the real modal uses for "Current balance": $ for USD and SGD, € for EUR. */
export function currencySymbol(code) {
  const part = new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0})
    .formatToParts(0)
    .find((p) => p.type === 'currency');
  return part ? part.value : '';
}

const twoDecimals = (n) => Number(n || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

/** Rule A1 / B6: "$20.00 USD" — symbol, amount, then the currency code (as Shopify and the modal's balance line write it). */
export const money = (amount, code) => `${currencySymbol(code)}${twoDecimals(amount)} ${code}`;

/** Shop-currency stat values on the page header cards ("$41.2"), unchanged from the real CustomerStatsSummary. */
export const shopMoney = (amount, code) =>
  new Intl.NumberFormat('en-US', {style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 0, maximumFractionDigits: 2}).format(amount || 0);

/**
 * @param {object} customer  fixture from data/index.js (accounts, statsByCurrency, orderCurrency)
 * @param {string} shopCurrency
 * @param {string} picked  currency the admin picked in the modal ('' until they pick one)
 */
export function currencyView(customer, shopCurrency, picked = '') {
  const accounts = customer.accounts || [];
  const orderCurrency = customer.orderCurrency || null;

  // Store credit tab rows: every funded account, shop currency first (unchanged from today).
  const funded = accounts
    .filter((a) => Number(a.amount) !== 0)
    .sort((a, b) => (a.currencyCode === shopCurrency ? -1 : b.currencyCode === shopCurrency ? 1 : a.currencyCode.localeCompare(b.currencyCode)));
  const rows = funded.length ? funded : [{currencyCode: shopCurrency, amount: 0}];

  // Rule A2: the order currency has no funded account while another account is funded → note under that balance.
  const orderCurrencyFunded = !!orderCurrency && funded.some((a) => a.currencyCode === orderCurrency);
  const noteFor = (code) =>
    orderCurrency && !orderCurrencyFunded && funded.some((a) => a.currencyCode === code) && code !== orderCurrency
      ? `Recent orders are paid in ${orderCurrency}. This balance can only be used on orders paid in ${code}.`
      : null;

  // Rule B3: shop currency + every account currency + the order currency, deduplicated.
  const options = [...new Set([shopCurrency, ...accounts.map((a) => a.currencyCode), orderCurrency].filter(Boolean))];

  // Rule B4 (B7 when there are no orders): order currency → first funded account → shop currency.
  const defaultCurrency = orderCurrency || funded[0]?.currencyCode || shopCurrency;
  const selected = picked && options.includes(picked) ? picked : defaultCurrency;

  // Rule B6: Current balance follows the selected currency.
  const balance = Number(accounts.find((a) => a.currencyCode === selected)?.amount || 0);

  // Rule B5: warn when the selected currency is not the one the customer pays in. No orders → never (B7).
  const warning =
    orderCurrency && selected !== orderCurrency
      ? `This customer's recent orders are paid in ${orderCurrency}. Store credit in ${selected} can only be used on orders paid in ${selected}.`
      : null;

  return {rows, noteFor, options, defaultCurrency, selected, balance, warning, stats: customer.statsByCurrency || {}};
}
