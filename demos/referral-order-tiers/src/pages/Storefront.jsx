// What shoppers see, driven by the same program the admin screens edit:
// the referrer's widget, the friend's claim popup, the friend's checkout, and the referrer's reward email.
import React, {useState} from 'react';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {useProgram} from '../state/program.jsx';
import {MY_REFERRALS, STORE, money, money2} from '../data/index.js';
import {friendDiscount, friendSummary, outcome, referrerSummary, sortTiers, tierLines} from '../state/logic.js';

const VIEWS = [
  {id: 'widget', label: "Referrer's widget"},
  {id: 'claim', label: "Friend's offer"},
  {id: 'checkout', label: "Friend's checkout"},
  {id: 'email', label: 'Reward email'},
];

const CART_PRESETS = [
  {id: 'c45', label: '$45 cart', lines: [{name: 'Citrus Gel Cleanser', price: 22}, {name: 'Pomelo Peel PHA Toner', price: 23}]},
  {id: 'c60', label: '$60 cart', lines: [{name: 'Vitamin C Glow Serum', price: 38}, {name: 'Citrus Gel Cleanser', price: 22}]},
  {id: 'c100', label: '$100 cart', lines: [{name: 'Glow Getter Set', price: 100}]},
  {id: 'c120', label: '$120 cart', lines: [{name: 'Glow Getter Set', price: 100}, {name: 'Sunny Side SPF 40', price: 20}]},
];

/** "Up to …" headline + the per-tier lines, or the single reward when tiers are off. */
function useOffer() {
  const {program} = useProgram();
  const lines = program.tiersOn ? tierLines(program) : [];
  const friendHead = program.tiersOn && lines.length ? friendSummary(program).split(' · ')[0].replace(' coupon', ' your first order') : `${friendSummary(program).split(' · ')[0].replace(' coupon', '')} your first order`;
  const youHead = program.tiersOn && lines.length ? referrerSummary(program).split(' · ')[0] : referrerSummary(program);
  return {program, lines, friendHead, youHead};
}

function TierTable({lines, who}) {
  if (!lines.length) return null;
  return (
    <ul className="sf-tiers" aria-label="Reward by order value">
      {lines.map((l) => (
        <li key={l.id}>
          <span className="sf-tiers__from">{`Orders from ${l.from}`}</span>
          <span className="sf-tiers__value">{who === 'friend' ? l.friend : `${l.friend} for your friend · ${l.referrer} for you`}</span>
        </li>
      ))}
    </ul>
  );
}

function WidgetView() {
  const {notify} = useShell();
  const {program, lines, friendHead, youHead} = useOffer();
  const first = sortTiers(program.tiers).find((t) => Number(t.min) > 0);
  return (
    <div className="sf-widget" role="dialog" aria-label="Rewards">
      <div className="sf-widget__head">
        <p className="sf-widget__hello">Hi Ava</p>
        <p className="sf-widget__points">1,240 points</p>
      </div>
      <section className="sf-card">
        <h2 className="sf-card__title">Refer friends</h2>
        <div className="sf-pair">
          <div><p className="sf-pair__label">You get</p><p className="sf-pair__value">{youHead}</p></div>
          <div><p className="sf-pair__label">Friend gets</p><p className="sf-pair__value">{friendHead.replace(' your first order', '')}</p></div>
        </div>
        <TierTable lines={lines} who="referrer" />
        {program.tiersOn && first ? <p className="sf-note">{`Rewards are given when your friend's first order from ${money(first.min)} is paid.`}</p> : null}
        <div className="sf-link">
          <input aria-label="Your referral link" readOnly value={`${STORE.domain}/?ref=AVA2026`} />
          <button type="button" className="sf-btn" onClick={() => notify('Link copied')}>Copy</button>
        </div>
      </section>
      <section className="sf-card">
        <h2 className="sf-card__title">Your referrals</h2>
        <ul className="sf-refs">
          {MY_REFERRALS.map((r) => {
            let detail = 'No order yet';
            if (r.status === 'completed') detail = `${outcome(program, r.subtotal).referrer} · order ${money2(r.subtotal)}`;
            else if (r.subtotal !== null && program.tiersOn && first) detail = `Order ${money2(r.subtotal)} is below ${money(first.min)}`;
            else if (r.subtotal !== null) detail = `Order ${money2(r.subtotal)} placed`;
            const done = r.status === 'completed' || (!program.tiersOn && r.subtotal !== null);
            return (
              <li key={r.id}>
                <span className="sf-refs__name">{r.name}</span>
                <span className={`sf-pill ${done ? 'sf-pill--done' : ''}`}>{done ? 'Completed' : 'Pending'}</span>
                <span className="sf-refs__detail">{done && r.status !== 'completed' ? `${outcome(program, r.subtotal).referrer} · order ${money2(r.subtotal)}` : detail}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ClaimView() {
  const {lines, friendHead, program} = useOffer();
  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');
  const first = sortTiers(program.tiers).find((t) => Number(t.min) > 0);
  const claim = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address');
    setError('');
    return setClaimed(true);
  };
  return (
    <div className="sf-popup" role="dialog" aria-label="Your friend sent you a gift">
      <p className="sf-popup__eyebrow">Ava sent you a gift</p>
      <h2 className="sf-popup__title">{`Get ${friendHead.replace(/^Up to/, 'up to')}`}</h2>
      <TierTable lines={lines} who="friend" />
      {!lines.length && Number(program.friendMinOrder) > 0 ? <p className="sf-note">{`On orders from ${money(program.friendMinOrder)}.`}</p> : null}
      {claimed ? (
        <div className="sf-code" aria-live="polite">
          <p>Your code</p>
          <p className="sf-code__value">JOY-7KQ2MD</p>
          <p className="sf-note">{lines.length ? `One code for every tier. Checkout takes off the right amount for your cart, from ${money(first.min)}.` : 'Use it at checkout.'}</p>
        </div>
      ) : (
        <>
          <label className="sf-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={error ? 'true' : undefined} />
          </label>
          {error ? <p className="sf-error">{error}</p> : null}
          <button type="button" className="sf-btn sf-btn--full" onClick={claim}>Claim my reward</button>
        </>
      )}
    </div>
  );
}

function CheckoutView() {
  const {program} = useProgram();
  const [cart, setCart] = useState('c60');
  const lines = CART_PRESETS.find((c) => c.id === cart).lines;
  const subtotal = lines.reduce((s, l) => s + l.price, 0);
  const discount = friendDiscount(program, subtotal);
  const res = outcome(program, subtotal);
  return (
    <div className="sf-checkout">
      <div className="sf-choose" role="group" aria-label="Pick a cart">
        {CART_PRESETS.map((c) => (
          <button key={c.id} type="button" className={`sf-chip ${cart === c.id ? 'is-on' : ''}`} aria-pressed={cart === c.id} onClick={() => setCart(c.id)}>{c.label}</button>
        ))}
      </div>
      <div className="sf-summary" aria-label="Order summary">
        {lines.map((l) => (
          <div key={l.name} className="sf-summary__line"><span>{l.name}</span><span>{money2(l.price)}</span></div>
        ))}
        <div className="sf-summary__code">
          <span className={`sf-tag ${discount ? '' : 'is-off'}`}>JOY-7KQ2MD</span>
          {discount ? null : <span className="sf-error">JOY-7KQ2MD discount code isn't available to you right now</span>}
        </div>
        <div className="sf-summary__line"><span>Subtotal</span><span>{money2(subtotal)}</span></div>
        {discount ? <div className="sf-summary__line"><span>Discount · JOY-7KQ2MD</span><span>{`−${money2(discount)}`}</span></div> : null}
        <div className="sf-summary__line"><span>Shipping</span><span className="sf-muted">Calculated at next step</span></div>
        <div className="sf-summary__line sf-summary__total"><span>Total</span><span>{`USD ${money2(subtotal - discount)}`}</span></div>
      </div>
      <p className="sf-proto-note">
        {res.qualifies
          ? `When this order is paid, Ava (the referrer) gets ${res.referrer}.${program.tiersOn ? ` The tier is picked from ${money2(subtotal)}, the subtotal before the referral discount.` : ''}`
          : `Below the first tier: no discount, and Ava's referral stays pending until this friend places an order from ${money(res.min)}.`}
      </p>
    </div>
  );
}

function EmailView() {
  const {program} = useProgram();
  const res = outcome(program, 120);
  return (
    <div className="sf-email" aria-label="Email preview">
      <p className="sf-email__meta">From: {STORE.name} &lt;{STORE.email}&gt; · Subject: You earned a referral reward</p>
      <div className="sf-email__body">
        <p className="sf-email__brand">{STORE.name}</p>
        <h2 className="sf-email__title">{`You earned ${res.referrer}`}</h2>
        <p>Your friend Ben Carter placed a qualifying order, so your referral is complete. Thanks for spreading the word!</p>
        {program.tiersOn && res.tier ? <p className="sf-muted">{`Order subtotal ${money2(120)} · tier ${sortTiers(program.tiers).indexOf(res.tier) + 1} (orders from ${money(res.tier.min)})`}</p> : null}
        <span className="sf-btn">See my rewards</span>
      </div>
    </div>
  );
}

export function Storefront() {
  const {state} = useScenario();
  const [view, setView] = useState('widget');
  const body = {widget: <WidgetView />, claim: <ClaimView />, checkout: <CheckoutView />, email: <EmailView />}[view];
  return (
    <div className="sf">
      <header className="sf-store">
        <a href="#/demo" className="sf-back">← Back to admin</a>
        <span className="sf-store__name">{STORE.name}</span>
        <span className="sf-store__nav" aria-hidden="true">Shop · Sets · About</span>
      </header>
      <div className="sf-proto" role="group" aria-label="Prototype · storefront view">
        <span className="sf-proto__label">Prototype · storefront view</span>
        {VIEWS.map((v) => (
          <button key={v.id} type="button" className={`sf-proto__btn ${view === v.id ? 'is-on' : ''}`} aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
        ))}
        {state === 'off' ? <span className="sf-proto__hint">Tiers are off in this state: this is what shoppers see today.</span> : null}
      </div>
      <main className="sf-stage">{body}</main>
    </div>
  );
}
