// What shoppers see, driven by the same program the admin screens edit:
// the referrer's widget, the friend's claim popup, the friend's checkout, and the referrer's reward email.
import React, {useState} from 'react';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {useProgram} from '../state/program.jsx';
import {MY_REFERRALS, STORE, money, money2} from '../data/index.js';
import {
  friendDiscount, friendHeadline, friendLinked, friendMin, friendTiered, friendTiers, friendValueText, outcome, pointsText, referrerHeadline,
  referrerMin, referrerTiered, referrerTiers,
} from '../state/logic.js';

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
  {id: 'c105', label: '$105 cart', lines: [{name: 'Glow Getter Set', price: 100}, {name: 'Citrus Lip Balm', price: 5}]},
  {id: 'c120', label: '$120 cart', lines: [{name: 'Glow Getter Set', price: 100}, {name: 'Sunny Side SPF 40', price: 20}]},
];

/** Headlines for both sides plus the tier lines each side sees. */
function useOffer() {
  const {program} = useProgram();
  const linked = friendLinked(program);
  const rLines = referrerTiered(program)
    ? referrerTiers(program).filter((t) => Number(t.min) > 0).map((t, i) => ({
      id: t.id,
      from: money(t.min),
      text: `${pointsText(t.value)} for you${linked ? ` · ${friendValueText(program.friendMethod, friendTiers(program)[i]?.value)} for your friend` : ''}`,
    }))
    : [];
  const fLines = friendTiered(program)
    ? friendTiers(program).filter((t) => Number(t.min) > 0).map((t) => ({id: t.id, from: money(t.min), text: friendValueText(program.friendMethod, t.value)}))
    : [];
  return {program, rLines, fLines, youHead: referrerHeadline(program), friendHead: friendHeadline(program)};
}

function TierTable({lines}) {
  if (!lines.length) return null;
  return (
    <ul className="sf-tiers" aria-label="Reward by order value">
      {lines.map((l) => (
        <li key={l.id}>
          <span className="sf-tiers__from">{`Orders from ${l.from}`}</span>
          <span className="sf-tiers__value">{l.text}</span>
        </li>
      ))}
    </ul>
  );
}

function WidgetView() {
  const {notify} = useShell();
  const {program, rLines, friendHead, youHead} = useOffer();
  const min = referrerMin(program);
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
          <div><p className="sf-pair__label">Friend gets</p><p className="sf-pair__value">{friendHead}</p></div>
        </div>
        <TierTable lines={rLines} />
        {min !== null ? <p className="sf-note">{`You get your reward when your friend's first order from ${money(min)} is paid.`}</p> : null}
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
            const res = r.subtotal !== null ? outcome(program, r.subtotal) : null;
            if (r.status === 'completed') detail = `${res.referrer} · order ${money2(res.counted)}`;
            else if (res && !res.qualifies) detail = `Order ${money2(res.counted)} is below ${money(min)}`;
            else if (res) detail = `Order ${money2(res.counted)} placed`;
            const done = r.status === 'completed' || (res !== null && res.qualifies);
            return (
              <li key={r.id}>
                <span className="sf-refs__name">{r.name}</span>
                <span className={`sf-pill ${done ? 'sf-pill--done' : ''}`}>{done ? 'Completed' : 'Pending'}</span>
                <span className="sf-refs__detail">{done && r.status !== 'completed' ? `${res.referrer} · order ${money2(res.counted)}` : detail}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ClaimView() {
  const {fLines, friendHead, program} = useOffer();
  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');
  const min = friendMin(program);
  const claim = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address');
    setError('');
    return setClaimed(true);
  };
  return (
    <div className="sf-popup" role="dialog" aria-label="Your friend sent you a gift">
      <p className="sf-popup__eyebrow">Ava sent you a gift</p>
      <h2 className="sf-popup__title">{`Get ${friendHead.replace(/^Up to/, 'up to')}${min ? ` an order of ${money(min)} or more` : ' your first order'}`}</h2>
      <TierTable lines={fLines} />
      {claimed ? (
        <div className="sf-code" aria-live="polite">
          <p>Your code</p>
          <p className="sf-code__value">JOY-7KQ2MD</p>
          <p className="sf-note">{fLines.length ? `One code for every order amount. Checkout takes off the right amount for your cart, from ${money(min)}.` : 'Use it at checkout.'}</p>
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
          ? `When this order is paid, Ava (the referrer) gets ${res.referrer}.${referrerTiered(program) ? ` Counted amount: ${money2(res.counted)}, the subtotal before the referral code.` : ''}`
          : `Counted amount ${money2(res.counted)} is below ${money(res.min)}, Ava's lowest order amount: ${discount ? 'the friend still gets the discount, but ' : ''}Ava's referral stays pending until an order from this friend counts ${money(res.min)} or more.`}
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
        {res.tier ? <p className="sf-muted">{`Order subtotal ${money2(res.counted)} before the referral code · orders from ${money(res.tier.min)} earn ${pointsText(res.tier.value)}`}</p> : null}
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
        <a href="#/demo?type=referral" className="sf-back">← Back to admin</a>
        <span className="sf-store__name">{STORE.name}</span>
        <span className="sf-store__nav" aria-hidden="true">Shop · Sets · About</span>
      </header>
      <div className="sf-proto" role="group" aria-label="Prototype · storefront view">
        <span className="sf-proto__label">Prototype · storefront view</span>
        {VIEWS.map((v) => (
          <button key={v.id} type="button" className={`sf-proto__btn ${view === v.id ? 'is-on' : ''}`} aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
        ))}
        {state === 'today' ? <span className="sf-proto__hint">Order amounts are off in this state: this is what shoppers see today.</span> : null}
      </div>
      <main className="sf-stage">{body}</main>
    </div>
  );
}
