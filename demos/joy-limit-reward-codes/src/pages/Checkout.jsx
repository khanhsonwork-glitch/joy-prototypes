// Shopify's own one-page checkout (it looks the same on every store), with Joy's limit at work: one Joy code and
// one shop code are applied, and a second Joy code the customer just typed is removed with the merchant's message.
// The first Joy code stays: Shopify can't remove a code that is already applied.
import React, {useMemo, useState} from 'react';
import {Icon} from '@shopify/polaris';
import {AlertCircleIcon, CartIcon, DiscountIcon, XIcon} from '@shopify/polaris-icons';
import {useLimit} from '../state/limit.jsx';
import {FORMATS, EXACT, fillMessage, testCode} from '../data/codes.js';

const ITEMS = [
  {id: 'throw', name: 'Linen throw blanket', variant: 'Sage / Large', price: 89, qty: 1, art: 'throw'},
  {id: 'mugs', name: 'Stoneware mug set', variant: 'Set of 2', price: 42, qty: 1, art: 'mugs'},
];
// Codes the fake store knows. Joy codes take a fixed amount off; the shop's own code takes a percentage.
const KNOWN = {
  'NB-O8QY6BW9J3FC': {joy: true, amount: 10},
  'NB-K2PL9X4WQ7MZ': {joy: true, amount: 5},
  'BDAY-K7BR2QXDHL': {joy: true, amount: 5},
  SUMMER15: {joy: false, percent: 15},
  WELCOME10: {joy: false, percent: 10},
};
const money = (n) => `$${n.toFixed(2)}`;

function ProductArt({kind}) {
  return (
    <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="8" fill="var(--co-art-bg)" />
      {kind === 'throw' ? (
        <g>
          <path d="M14 20h36v24c0 3-2 5-5 5H19c-3 0-5-2-5-5z" fill="var(--co-art-sage)" />
          <path d="M14 26h36M14 32h36M14 38h36" stroke="var(--co-art-line)" strokeWidth="1.5" />
          <path d="M18 49v5M24 49v5M30 49v5M36 49v5M42 49v5" stroke="var(--co-art-sage)" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <path d="M12 24h18v20c0 3-2 5-5 5h-8c-3 0-5-2-5-5z" fill="var(--co-art-clay)" />
          <path d="M30 29h3a4 4 0 0 1 0 8h-3" fill="none" stroke="var(--co-art-clay)" strokeWidth="3" />
          <path d="M34 20h18v24c0 3-2 5-5 5h-8c-3 0-5-2-5-5z" fill="var(--co-art-sand)" />
          <path d="M52 26h3a4 4 0 0 1 0 8h-3" fill="none" stroke="var(--co-art-sand)" strokeWidth="3" />
        </g>
      )}
    </svg>
  );
}

function Field({label, value, half}) {
  return (
    <label className={`co-field${half ? ' co-field--half' : ''}`}>
      <span className="co-field__label">{label}</span>
      <input className="co-input" defaultValue={value} />
    </label>
  );
}

export function Checkout() {
  const {saved} = useLimit();
  const max = Number(saved.max) || 1;
  // Limit on: the second Joy code was just removed. Limit off (Off state): both Joy codes stack, as they do today.
  const on = saved.enabled;
  const [applied, setApplied] = useState(on ? ['NB-O8QY6BW9J3FC', 'SUMMER15'] : ['NB-O8QY6BW9J3FC', 'SUMMER15', 'NB-K2PL9X4WQ7MZ']);
  const [entry, setEntry] = useState(on ? 'NB-K2PL9X4WQ7MZ' : '');
  const [error, setError] = useState(() => (on ? fillMessage(saved.message, 'NB-K2PL9X4WQ7MZ', max) : ''));

  const subtotal = ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const lines = useMemo(() => applied.map((code) => {
    const k = KNOWN[code];
    return {code, amount: k.amount ?? Math.round(subtotal * k.percent) / 100};
  }), [applied, subtotal]);
  const savings = lines.reduce((s, l) => s + l.amount, 0);
  const shipping = 6;
  const total = subtotal - savings + shipping;

  const isJoy = (code) => !saved.excluded.includes(code) && testCode(code, {formats: FORMATS, exact: EXACT})?.joy;
  const apply = () => {
    const code = entry.trim().toUpperCase();
    if (!code) return;
    if (applied.includes(code)) return setError(`${code} is already applied.`);
    const known = KNOWN[code];
    if (!known) return setError('Enter a valid discount code or gift card');
    const joyNow = applied.filter(isJoy).length;
    if (on && isJoy(code) && joyNow >= max) return setError(fillMessage(saved.message, code, max));
    setApplied((a) => [...a, code]);
    setEntry('');
    setError('');
  };

  return (
    <div className="co">
      <header className="co-header">
        <div className="co-header__main">
          <div className="co-header__box"><span className="co-logo">Demo store</span></div>
        </div>
        <div className="co-header__side">
          <div className="co-header__box co-header__box--side"><span className="co-header__cart" aria-label="Cart"><Icon source={CartIcon} /></span></div>
        </div>
      </header>
      <div className="co-body">
        <main className="co-main">
          <div className="co-main__inner">
            <h1 className="lc-sr">Checkout</h1>
            <section className="co-section">
              <div className="co-section__head">
                <h2>Contact</h2>
                <a href="#/checkout" onClick={(e) => e.preventDefault()}>Sign in</a>
              </div>
              <Field label="Email" value="ava@example.com" />
              <label className="co-check"><input type="checkbox" defaultChecked /> Email me with news and offers</label>
            </section>
            <section className="co-section">
              <h2>Delivery</h2>
              <Field label="Country/Region" value="United States" />
              <div className="co-row">
                <Field label="First name" value="Ava" half />
                <Field label="Last name" value="Nguyen" half />
              </div>
              <Field label="Address" value="12 Example Street" />
              <div className="co-row">
                <Field label="City" value="Portland" half />
                <Field label="State" value="Oregon" half />
                <Field label="ZIP code" value="97201" half />
              </div>
            </section>
            <section className="co-section">
              <h2>Shipping method</h2>
              <div className="co-box co-box--selected">
                <span>Standard<br /><small>3 to 5 business days</small></span>
                <strong>{money(shipping)}</strong>
              </div>
            </section>
            <section className="co-section">
              <h2>Payment</h2>
              <p className="co-muted">All transactions are secure and encrypted.</p>
              <div className="co-box co-box--selected co-box--stack">
                <span>Credit card</span>
                <Field label="Card number" value="" />
                <div className="co-row">
                  <Field label="Expiration date (MM / YY)" value="" half />
                  <Field label="Security code" value="" half />
                </div>
              </div>
            </section>
            <button type="button" className="co-pay">Pay now</button>
            <nav className="co-policies" aria-label="Store policies">
              <span>Refund policy</span><span>Shipping policy</span><span>Privacy policy</span><span>Terms of service</span>
            </nav>
          </div>
        </main>

        <aside className="co-summary" aria-label="Order summary">
          <div className="co-summary__inner">
            {ITEMS.map((i) => (
              <div className="co-item" key={i.id}>
                <span className="co-item__art">
                  <ProductArt kind={i.art} />
                  <span className="co-item__qty">{i.qty}</span>
                </span>
                <span className="co-item__name">{i.name}<small>{i.variant}</small></span>
                <span>{money(i.price)}</span>
              </div>
            ))}

            <form className="co-discount" onSubmit={(e) => { e.preventDefault(); apply(); }}>
              <div className="co-discount__row">
                <label className={`co-field co-field--grow${error ? ' is-error' : ''}`}>
                  <span className="co-field__label">Discount code or gift card</span>
                  <input
                    className="co-input"
                    value={entry}
                    onChange={(e) => { setEntry(e.target.value); setError(''); }}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'co-discount-error' : undefined}
                  />
                </label>
                <button type="submit" className={`co-apply${entry.trim() ? ' is-ready' : ''}`}>Apply</button>
              </div>
              {error ? (
                <p className="co-error" id="co-discount-error" role="alert">
                  <span className="co-error__icon"><Icon source={AlertCircleIcon} /></span>
                  {error}
                </p>
              ) : null}
              {applied.length ? (
                <div className="co-tags">
                  {applied.map((code) => (
                    <span className="co-tag" key={code}>
                      <span className="co-tag__icon"><Icon source={DiscountIcon} /></span>
                      {code}
                      <button type="button" aria-label={`Remove ${code}`} onClick={() => { setApplied((a) => a.filter((c) => c !== code)); setError(''); }}>
                        <Icon source={XIcon} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </form>

            <dl className="co-totals">
              <div><dt>Subtotal · {ITEMS.length} items</dt><dd>{money(subtotal)}</dd></div>
              {lines.length ? (
                <>
                  <div><dt>Order discount</dt><dd /></div>
                  {lines.map((l) => (
                    <div className="co-totals__code" key={l.code}>
                      <dt><span className="co-tag__icon"><Icon source={DiscountIcon} /></span>{l.code}</dt>
                      <dd>−{money(l.amount)}</dd>
                    </div>
                  ))}
                </>
              ) : null}
              <div><dt>Shipping</dt><dd>{money(shipping)}</dd></div>
              <div className="co-totals__total"><dt>Total</dt><dd><small>USD</small> {money(total)}</dd></div>
              {savings ? (
                <div className="co-totals__savings"><dt><span className="co-tag__icon"><Icon source={DiscountIcon} /></span>TOTAL SAVINGS</dt><dd>{money(savings)}</dd></div>
              ) : null}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
