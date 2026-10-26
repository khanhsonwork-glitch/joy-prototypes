// #/store/inbox → #/store/widget → #/store/cart → #/store/order: what a member of "BFCM thank-you" sees.
// Maya (350 + 150 = 500) can redeem $5 off; Jordan (74 + 150 = 224) can't yet. Customer clock: Thu, Dec 3, 10:00 AM, after
// the reminder; or the day after the use-by date (?day=after), when unused points have expired.
// The emails are the giveaway's own Email editor V2 documents, rendered with the member's values. The widget is Joy's v4
// layout; the only giveaway parts are the existing "Expires on" line in the Points card, the launcher badge and the
// history line. One state per customer for the visit: redeeming takes the points once, a placed order is frozen.
import React, {useEffect, useState} from 'react';
import {CHEAPEST, PRODUCTS, REWARDS, STORE, money, num} from '../data/index.js';
import {GIFT, PEOPLE, newVisit} from '../data/people.js';
import {memberById} from '../data/members.js';
import {emailFacts, emailReaches, reminderAt, useBy} from '../data/giveaways.js';
import {allocate, lotEnd, personLots, replay} from '../data/ledger.js';
import {NOW, at, clock, day, weekday} from '../data/time.js';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useStore} from '../state/store.jsx';
import {EmailDocument, defaultDoc, emailWithDefaults, makeCtx, resolveText, sampleValues} from '../shared/notifications';

const CODES = ['8K2M', '3QP7', 'X4LT', '9ZWD', 'H6RB'];
const couponCode = (r, i) => `JOY-${r.value ? `${r.value}OFF` : 'SHIP'}-${CODES[i] || `N${String(i + 1).padStart(3, '0')}`}`;
const product = (handle) => PRODUCTS.find((p) => p.handle === handle);

/* ---------------------------------------------------------------- step bar (viewer navigation, not part of the store) */

const STEPS = [
  {id: 'inbox', label: 'Email'},
  {id: 'shop', label: 'Store'},
  {id: 'cart', label: 'Cart'},
  {id: 'order', label: 'Order'},
];

/** "← Admin" goes back to the giveaway last opened in the admin (else the Dec 1 one, else the list). */
function adminHref(giveaways) {
  let last = null;
  try {
    last = sessionStorage.getItem('pg:lastGiveaway');
  } catch {
    // no storage: fall back below
  }
  const id = [last, GIFT.giveawayId].find((x) => x && giveaways.some((g) => g.id === x));
  return id ? `#/points-giveaway/${id}` : '#/points-giveaway';
}

function StepBar({current, q, after, afterLabel, setAfter, today, adminHref}) {
  return (
    <nav className="jr-steps" aria-label="Customer view steps">
      {/* the admin is on today; the look-ahead day is the customer's side only */}
      {after ? null : (
        <a className="jr-steps__back" href={adminHref}>
          ← Admin
        </a>
      )}
      {STEPS.map((s, i) => {
        const on = current === s.id || (current === 'widget' && s.id === 'shop');
        return (
          <a key={s.id} href={`#/store/${s.id}${q}`} className={`jr-steps__item${on ? ' is-on' : ''}`} aria-current={on ? 'step' : undefined}>
            <span>{i + 1}</span>
            {s.label}
          </a>
        );
      })}
      {afterLabel ? (
        <span className="jr-steps__days" role="group" aria-label="Day">
          <button type="button" className={`jr-steps__day${after ? '' : ' is-on'}`} aria-pressed={!after} onClick={() => setAfter(false)}>
            {weekday(today)}
          </button>
          <button type="button" className={`jr-steps__day${after ? ' is-on' : ''}`} aria-pressed={after} onClick={() => setAfter(true)}>
            {afterLabel}
          </button>
        </span>
      ) : null}
      {after ? <span className="jr-steps__note">View only</span> : null}
    </nav>
  );
}

/* ---------------------------------------------------------------- 1. inbox */

/** One email of one giveaway, rendered from its Email editor V2 document with this member's values at send time. */
function emailFor(lot, emailId, person, {left, balance}) {
  const g = lot.g;
  const stored = emailWithDefaults(g.emails?.[emailId]);
  const doc = stored.doc || defaultDoc(emailId);
  const values = sampleValues({
    emailId,
    // a sent email keeps what it said when it went out: name and use-by date
    giveaway: {name: emailFacts(g, emailId).name, points: lot.points, expiresOn: emailFacts(g, emailId).useBy, given: true},
    customer: {name: person.name, email: person.email, balance},
    left,
    balance,
  });
  return {doc, ctx: makeCtx({values, resolve: (t) => resolveText(t, values, emailId), emailId, customCss: stored.cssOn ? stored.css : ''}), senderName: stored.senderName};
}

function Inbox({mails, person, who, setWho, now, onOpenRewards}) {
  const others = [
    {id: 'other1', from: 'Juniper Books', subject: 'Your order has shipped', at: at(2026, 12, 2, 11, 20)},
    {id: 'other2', from: 'Northline Fitness', subject: 'Your December class schedule', at: at(2026, 11, 30, 18, 20)},
  ];
  const items = [...mails, ...others].sort((x, y) => y.at - x.at);
  const [openId, setOpenId] = useState(items.find((m) => m.mail)?.id);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const open = items.find((m) => m.id === openId && m.mail) || items.find((m) => m.mail);
  return (
    <div className="mail">
      <header className="mail__top">
        <span className="mail__brand">Mail</span>
        <div className="mail__who" role="tablist" aria-label="Inbox">
          {['maya', 'jordan'].map((k) => (
            <button key={k} type="button" role="tab" aria-selected={who === k} className={who === k ? 'is-on' : ''} onClick={() => setWho(k)}>
              {PEOPLE[k].name}
            </button>
          ))}
        </div>
        <span className="mail__addr">{person.email}</span>
      </header>
      <div className="mail__body">
        <ul className="mail__list">
          {items.map((m) => (
            <li key={m.id}>
              <button type="button" className={`mail__item${open?.id === m.id ? ' is-on' : ''}${m.mail ? '' : ' is-other'}`} onClick={() => {
                if (!m.mail) return;
                setOpenId(m.id);
                setUnsubscribed(false);
              }} disabled={!m.mail}>
                <span className="mail__from">{m.from}</span>
                <span className="mail__when">{m.at.getUTCDate() === now.getUTCDate() && m.at.getUTCMonth() === now.getUTCMonth() ? clock(m.at) : day(m.at)}</span>
                <span className="mail__subject">{m.subject}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mail__read">
          {open && unsubscribed ? (
            <div className="mail__unsub">
              <b>{`You're unsubscribed`}</b>
              <p>{`${person.email} won't get ${STORE.name} rewards emails anymore.`}</p>
              <button type="button" className="st-btn st-btn--line" onClick={() => setUnsubscribed(false)}>
                Back to email
              </button>
            </div>
          ) : open ? (
            <div
              className="mail__doc"
              onClickCapture={(e) => {
                const a = e.target.closest('a');
                if (!a) return;
                e.preventDefault();
                // the rewards button opens the store; unsubscribe opens the shop's unsubscribe page
                const href = a.getAttribute('href') || '';
                if (href.includes('#joy-ways-to-redeem')) onOpenRewards();
                else if (href.includes('/unsubscribe')) setUnsubscribed(true);
              }}
            >
              <div className="mail__head">
                <b>{open.subject}</b>
                <span>{`${open.from} <joyio_noreply@send.avada.io> · ${weekday(open.at)}, ${clock(open.at)}`}</span>
              </div>
              <div style={{background: open.mail.doc.pageBg}}>
                <EmailDocument doc={open.mail.doc} ctx={open.mail.ctx} />
              </div>
            </div>
          ) : (
            <p className="mail__note">No email from {STORE.name}.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- store page */

function StoreHeader({cartCount, onCart, onAccount, onShop}) {
  return (
    <>
      <div className="st-announce">Free shipping on orders over $50</div>
      <header className="st-head">
        <img className="st-logo" src="img/logo.png" alt={STORE.name} />
        <nav className="st-nav">
          {['Shop all', 'Serums', 'Sets', 'Our story'].map((l) => (
            <button key={l} type="button" onClick={onShop}>
              {l}
            </button>
          ))}
        </nav>
        <div className="st-icons">
          <button type="button" className="st-icon" aria-label="Account" onClick={onAccount}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <button type="button" className="st-icon" aria-label={`Cart, ${cartCount} items`} onClick={onCart}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M5 8h14l-1.2 12H6.2z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {cartCount ? <span className="st-count">{cartCount}</span> : null}
          </button>
        </div>
      </header>
    </>
  );
}

function StoreBody({onAdd, onShop, readOnly}) {
  return (
    <main className="st-main">
      <section className="st-hero" style={{backgroundImage: 'url(img/hero.jpg)'}}>
        <div className="st-hero__copy">
          <h1>Bright skin, citrus-fresh</h1>
          <p>Gentle daily care made with pomelo peel and vitamin C.</p>
          <button type="button" className="st-btn" onClick={onShop}>
            Shop serums
          </button>
        </div>
      </section>
      <section className="st-grid-wrap" id="bestsellers">
        <h2>Bestsellers</h2>
        <div className="st-grid">
          {PRODUCTS.map((p) => (
            <article key={p.handle} className="st-card">
              <img src={p.image} alt={p.title} />
              <h3>{p.title}</h3>
              <p>{money(p.price, true)}</p>
              <button type="button" className="st-btn st-btn--line" onClick={() => onAdd(p.handle)} disabled={readOnly}>
                Add to cart
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

/** Joy's floating launcher; the badge is the existing fab-badge prop, set while there are new points the member hasn't seen. */
function Launcher({badge, onOpen}) {
  return (
    <button type="button" className="jw-launch" onClick={onOpen} aria-label={badge ? 'Rewards, 1 new' : 'Rewards'}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M4 10h16v10H4zM2 7h20v3H2zM12 7v13M12 7c-2-4-6-4-6-1.5S10 7 12 7zm0 0c2-4 6-4 6-1.5S14 7 12 7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span>Rewards</span>
      {badge ? <i className="jw-launch__badge">1</i> : null}
    </button>
  );
}

/* ---------------------------------------------------------------- 2. Joy widget (real v4 layout: black header, tiles, tabs, bottom bar) */

const ICON = {
  home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z',
  rewards: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-4-6-1.5S10 7 12 7zm0 0c2-4 6-4 6-1.5S14 7 12 7z',
  orders: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  coupon: 'M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4zM10 7v12',
};
const Glyph = ({name, size = 20}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={ICON[name]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const EARN = [
  ['Place an order', '1 point for every $1'],
  ['Write a review', '50 points'],
  ['Celebrate a birthday', '100 points'],
];

function Widget({person, balance, expiry, history, coupons, orders, initialTab, onRedeem, onApply, onClose, readOnly}) {
  const [view, setView] = useState('home');
  const [tab, setTab] = useState(initialTab || 'redeem');
  const back = (label) => (
    <button type="button" className="jw__back" onClick={() => setView('home')}>
      ‹ <b>{label}</b>
    </button>
  );
  const rewards = REWARDS.slice(0, 3);
  const earnList = (
    <div className="jw__list">
      {EARN.map(([a, b]) => (
        <div key={a} className="jw__reward">
          <div>
            <b>{a}</b>
            <span>{b}</span>
          </div>
        </div>
      ))}
    </div>
  );
  const redeemList = (
    <div className="jw__list">
      {rewards.map((r) => {
        const can = balance >= r.points && !readOnly;
        return (
          <div key={r.id} className="jw__reward">
            <div>
              <b>{r.name}</b>
              <span>{num(r.points)} points</span>
            </div>
            <button type="button" className={`jw__redeem${can ? '' : ' is-off'}`} disabled={!can} onClick={() => setView(`confirm-${r.id}`)}>
              {can || balance >= r.points ? 'Redeem' : `${num(r.points - balance)} more`}
            </button>
          </div>
        );
      })}
    </div>
  );

  let body;
  if (view === 'points') {
    body = (
      <>
        {back('Points')}
        <div className="jw__tile jw__tile--wide">
          <span className="jw__k">Balance</span>
          <span className="jw__v">{num(balance)} points</span>
          {expiry ? <span className="jw__exp">{`Expires on: ${expiry}`}</span> : null}
        </div>
        <h4 className="jw__h">Points history</h4>
        <ul className="jw__hist">
          {history.map((h) => (
            <li key={`${h.label}-${h.at.getTime()}`}>
              <div>
                <span className="jw__hist-label">{h.label}</span>
                <span className="jw__hist-date">
                  {weekday(h.at)}
                  {h.expires ? ` · Expires on ${day(h.expires)}` : ''}
                </span>
              </div>
              <span className={`jw__hist-pts${h.points < 0 ? ' is-minus' : ''}`}>{h.points < 0 ? `−${num(-h.points)}` : `+${num(h.points)}`}</span>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (view.startsWith('confirm-')) {
    const r = REWARDS.find((x) => x.id === view.slice(8));
    body = (
      <>
        {back('Redeem')}
        <div className="jw__coupon">
          <span className="jw__k">Redeem {num(r.points)} points for</span>
          <span className="jw__v">{r.name}</span>
          <button
            type="button"
            className={`jw__redeem${balance >= r.points && !readOnly ? '' : ' is-off'}`}
            disabled={balance < r.points || readOnly}
            onClick={() => {
              onRedeem(r);
              setView('coupons');
            }}
          >
            Redeem
          </button>
        </div>
      </>
    );
  } else if (view === 'coupons') {
    body = (
      <>
        {back('My coupons')}
        {coupons.length ? (
          [...coupons].reverse().map((coupon) => (
            <div key={coupon.code} className="jw__coupon">
              <span className="jw__k">{coupon.reward.name}</span>
              <span className="jw__code">{coupon.code}</span>
              <span className="jw__k">{coupon.used ? `Used on order #${coupon.used}.` : coupon.applied ? 'Applied to your cart.' : 'Use it in your cart or at checkout.'}</span>
              {!coupon.applied && !coupon.used && !readOnly ? (
                <button type="button" className="jw__redeem" onClick={() => onApply(coupon.code)}>
                  Apply to cart
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <p className="jw__empty">No coupons yet. Redeem points to get one.</p>
        )}
      </>
    );
  } else if (view === 'rewards') {
    body = (
      <>
        <h4 className="jw__h">Ways to redeem</h4>
        {redeemList}
        <h4 className="jw__h jw__h--gap">Ways to earn</h4>
        {earnList}
      </>
    );
  } else if (view === 'orders') {
    const past = person.history.filter((h) => h.label.startsWith('Placed order'));
    body = (
      <>
        <h4 className="jw__h">Orders</h4>
        {[...orders].reverse().map((o) => (
          <div key={o.no} className="jw__reward">
            <div>
              <b>{`Order #${o.no}`}</b>
              <span>{`${weekday(o.at)} · ${money(o.total, true)} · +${num(o.points)} points`}</span>
            </div>
          </div>
        ))}
        {past.map((h) => (
          <div key={h.label} className="jw__reward">
            <div>
              <b>{h.label.replace('Placed order', 'Order')}</b>
              <span>{`${weekday(h.at)} · +${num(h.points)} points`}</span>
            </div>
          </div>
        ))}
      </>
    );
  } else if (view === 'profile') {
    body = (
      <>
        <h4 className="jw__h">Profile</h4>
        <div className="jw__tile jw__tile--wide">
          <span className="jw__k">Name</span>
          <span>{person.name}</span>
          <span className="jw__k">Email</span>
          <span>{person.email}</span>
          <span className="jw__k">Member since</span>
          <span>{person.since}</span>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div className="jw__hello">
          <span className="jw__avatar">{person.initials}</span>
          <div>
            <b>Welcome back, {person.first}</b>
            <button type="button" className="jw__link" onClick={() => setView('profile')}>
              View profile
            </button>
          </div>
        </div>
        <div className="jw__tiles">
          <button type="button" className="jw__tile" onClick={() => setView('points')}>
            <span className="jw__k">Points</span>
            <span className="jw__v">{num(balance)}</span>
            {expiry ? <span className="jw__exp">{`Expires on: ${expiry}`}</span> : null}
            <i>›</i>
          </button>
          <div className="jw__tile">
            <span className="jw__k">Store credit</span>
            <span className="jw__v">$0</span>
          </div>
        </div>
        <button type="button" className="jw__row" onClick={() => setView('coupons')}>
          <span className="jw__row-icon">
            <Glyph name="coupon" />
          </span>
          <div>
            <b>My coupons</b>
            <span>
              {coupons.length
                ? `${coupons.length} coupon${coupons.length === 1 ? '' : 's'}${coupons.some((x) => !x.used) ? `, ${coupons.filter((x) => !x.used).length} ready to use` : ', all used'}`
                : 'Redeem points to earn coupons'}
            </span>
          </div>
          <i>›</i>
        </button>
        <div className="jw__tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'earn'} className={tab === 'earn' ? 'is-on' : ''} onClick={() => setTab('earn')}>
            Earn
          </button>
          <button type="button" role="tab" aria-selected={tab === 'redeem'} className={tab === 'redeem' ? 'is-on' : ''} onClick={() => setTab('redeem')}>
            Redeem
          </button>
        </div>
        {tab === 'redeem' ? redeemList : earnList}
      </>
    );
  }

  const bar = [
    ['home', 'Home'],
    ['rewards', 'Rewards'],
    ['orders', 'Orders'],
    ['profile', 'Profile'],
  ];
  const onBar = bar.some(([b]) => b === view) ? view : 'home';
  return (
    <aside className="jw" aria-label="Rewards">
      <div className="jw__head">
        <span>{STORE.name} Rewards</span>
        <button type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="jw__body">{body}</div>
      <div className="jw__bar">
        {bar.map(([id, label]) => (
          <button key={id} type="button" className={onBar === id ? 'is-on' : ''} onClick={() => setView(id)}>
            <Glyph name={id} />
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- 3. cart drawer with Joy's Redeem in cart */

function CartDrawer({items, balance, coupon, onRedeem, onApply, onRemove, onClose, onCheckout, onShop, readOnly}) {
  const subtotal = items.reduce((s, h) => s + product(h).price, 0);
  // Joy's Redeem in cart: pick one of the fixed-amount rewards the member can afford
  const affordable = REWARDS.filter((r) => r.value && r.points <= balance && r.value < subtotal);
  const [pick, setPick] = useState(null);
  const chosen = affordable.find((r) => r.id === pick) || affordable[0];
  const open = coupon && !coupon.used ? coupon : null;
  // a coupon only takes money off what's in the cart, and never below $0
  const applied = Boolean(open?.applied) && items.length > 0;
  const discount = applied ? Math.min(open.reward.value || 0, subtotal) : 0;
  let joy;
  if (!items.length) {
    joy = open ? (
      <div className="cd__joy-top">
        <b>{`Your ${open.reward.name} coupon is ready`}</b>
        <span>{`Code ${open.code} · add something to your cart to use it.`}</span>
      </div>
    ) : (
      <div className="cd__joy-top">
        <b>{`You have ${num(balance)} points`}</b>
        <span>Add something to your cart to use them.</span>
      </div>
    );
  } else if (applied) {
    joy = (
      <div className="cd__joy-top">
        <b>{open.reward.name} applied</b>
        <span>{`Code ${open.code} · ${num(balance)} points left`}</span>
        {readOnly ? null : (
          <button type="button" className="cd__remove" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
    );
  } else if (open) {
    joy = (
      <>
        <div className="cd__joy-top">
          <b>You have a {open.reward.name} coupon</b>
          <span>Code {open.code}</span>
        </div>
        <button type="button" className="cd__redeem" onClick={onApply} disabled={readOnly}>
          Apply {open.reward.name}
        </button>
      </>
    );
  } else if (chosen) {
    joy = (
      <>
        <div className="cd__joy-top cd__joy-top--icon">
          <Glyph name="rewards" />
          <div>
            <b>
              Save up to <em>{money(Math.max(...affordable.map((r) => r.value)), true)}</em> using points
            </b>
            <span>{`Earn ${num(Math.floor(subtotal))} points with this order`}</span>
          </div>
        </div>
        <select className="cd__select" aria-label="Reward" value={chosen.id} onChange={(e) => setPick(e.target.value)}>
          {affordable.map((r) => (
            <option key={r.id} value={r.id}>{`${r.name} for ${num(r.points)} points`}</option>
          ))}
        </select>
        <button type="button" className="cd__redeem" onClick={() => onRedeem(chosen)} disabled={readOnly}>
          Redeem {num(chosen.points)} points for {money(chosen.value, true)}
        </button>
      </>
    );
  } else {
    joy = (
      <div className="cd__joy-top cd__joy-top--icon">
        <Glyph name="rewards" />
        <div>
          <b>
            You have {num(balance)} points. Earn {num(CHEAPEST.points - balance)} more for {CHEAPEST.name}
          </b>
          <span>{`Earn ${num(Math.floor(subtotal))} points with this order`}</span>
        </div>
      </div>
    );
  }
  return (
    <aside className="cd" aria-label="Cart">
      <div className="cd__head">
        <b>Cart ({items.length})</b>
        <button type="button" aria-label="Close cart" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="cd__items">
        {!items.length ? (
          <div className="cd__empty">
            <p>Your cart is empty.</p>
            <button type="button" className="st-btn st-btn--line" onClick={onShop}>
              Continue shopping
            </button>
          </div>
        ) : null}
        {items.map((h) => {
          const p = product(h);
          return (
            <div key={h} className="cd__item">
              <img src={p.image} alt="" />
              <div>
                <b>{p.title}</b>
                <span>{money(p.price, true)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="cd__joy">{joy}</div>
      <div className="cd__totals">
        <div>
          <span>Subtotal</span>
          <span>{money(subtotal, true)}</span>
        </div>
        {applied ? (
          <div>
            <span>Reward ({open.reward.name})</span>
            <span>−{money(discount, true)}</span>
          </div>
        ) : null}
        <div className="cd__total">
          <span>Total</span>
          <span>{money(Math.max(0, subtotal - discount), true)}</span>
        </div>
      </div>
      <button type="button" className="cd__checkout" onClick={onCheckout} disabled={!items.length || readOnly}>
        Check out
      </button>
    </aside>
  );
}

/* ---------------------------------------------------------------- 4. thank-you page */

function ThankYou({person, order, balance}) {
  return (
    <div className="ty">
      <div className="ty__main">
        <img className="st-logo" src="img/logo.png" alt={STORE.name} />
        <p className="ty__order">{`Order #${order.no}`}</p>
        <h1>Thank you, {person.first}!</h1>
        <div className="ty__box">
          <b>Your order is confirmed</b>
          <p>We’ll email you when it ships.</p>
        </div>
        <div className="ty__box ty__joy">
          <b>You earned {num(order.points)} points with this order</b>
          <p>{`Points balance: ${num(balance)} points.${order.couponCode ? ` Your ${order.couponName} reward was used on this order.` : ''}`}</p>
        </div>
      </div>
      <aside className="ty__side">
        {order.items.map((h) => {
          const p = product(h);
          return (
            <div key={h} className="cd__item">
              <img src={p.image} alt="" />
              <div>
                <b>{p.title}</b>
                <span>{money(p.price, true)}</span>
              </div>
            </div>
          );
        })}
        <div className="cd__totals">
          <div>
            <span>Subtotal</span>
            <span>{money(order.subtotal, true)}</span>
          </div>
          {order.couponCode ? (
            <div>
              <span>Discount · {order.couponCode}</span>
              <span>−{money(order.discount, true)}</span>
            </div>
          ) : null}
          <div>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="cd__total">
            <span>Total</span>
            <span>{money(order.total, true)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default function Journey() {
  const {giveaways} = useStore();
  return <Visit giveaways={giveaways} />;
}

function Visit({giveaways}) {
  const route = useRoute();
  const navigate = useNavigate();
  const step = ['inbox', 'widget', 'cart', 'order', 'shop'].includes(route.segments[1]) ? route.segments[1] : 'inbox';
  const who = route.query.get('as') === 'jordan' ? 'jordan' : 'maya';
  const person = PEOPLE[who];
  // The member's giveaway lots: the Dec 1 one (when the shop has it), plus any given in the admin that reached them.
  const lots = personLots(person, giveaways);
  const firstEnd = lots.map((l) => l.end).filter(Boolean).sort((a, b) => a - b)[0] || null;
  const after = route.query.get('day') === 'after' && !!firstEnd;
  // customer clock: the shop's clock today (Thu, Dec 3, from 10:30 AM, moving on with what's done in the admin and the
  // store), or 10:00 AM the day after the first use-by date
  const {visits, setVisit, clock: shopClock} = useStore();
  const base = after ? new Date(firstEnd.getTime() + 10 * 3600000) : shopClock;
  // One visit per customer, kept in the shop's store (so going to the admin and back keeps it, and the admin counts it):
  // every action is stamped with the time it happened, and the clock of the day shown moves on with that day's actions.
  const v = visits[who] || newVisit();
  const sameDay = [...v.actions, ...v.coupons].map((x) => x.at).filter((t) => t >= base && t - base < 12 * 3600000);
  const now = new Date(Math.max(base.getTime(), ...sameDay.map((t) => t.getTime())));
  const set = (changes) => setVisit(who, (prev) => ({...prev, ...changes}));
  const qs = (extra = '') => {
    const p = new URLSearchParams();
    if (who === 'jordan') p.set('as', 'jordan');
    if (after) p.set('day', 'after');
    if (extra) extra.split('&').forEach((kv) => p.set(...kv.split('=')));
    const str = p.toString();
    return str ? `?${str}` : '';
  };
  const go = (s2, extra) => navigate(`/store/${s2}${qs(extra)}`);

  const state = replay({own: person.before, lots, actions: v.actions, t: now});
  const balance = state.balance;
  // coupons and orders as of the day shown
  const coupons = v.coupons.filter((c) => c.at <= now).map((c) => ({...c, used: c.used && c.used.at <= now ? c.used.no : null}));
  const orders = v.actions.filter((x) => x.kind === 'order' && x.at <= now);
  const unused = [...coupons].reverse().filter((c) => !c.used);
  const openCoupon = unused.find((c) => c.applied) || unused[0] || null;
  const history = [...state.history, ...person.history];
  const live = lots.filter((l) => l.at <= now && (!l.end || l.end > now) && (state.left[l.id] || 0) > 0).sort((x, y) => (x.end ? x.end.getTime() : Infinity) - (y.end ? y.end.getTime() : Infinity));
  const soon = live.find((l) => l.end);
  const expiry = soon ? `${day(useBy(soon.g))} · ${num(state.left[soon.id])} points` : null;
  const badge = live.some((l) => !v.seen.includes(l.id));

  // Emails: each giveaway's gift email when its points landed, and its reminder when it went out (or is due) if points
  // were left. A trial shop's emails stop at the emails it had left.
  const member = memberById(person.memberId);
  const mails = [];
  lots.forEach((l) => {
    if (l.at > now) return;
    if (emailReaches(l.g, member, 'gift')) {
      const atSend = replay({own: person.before, lots, actions: v.actions, t: l.at});
      const mail = emailFor(l, 'gift', person, {left: l.points, balance: atSend.balance});
      mails.push({id: `${l.id}-gift`, from: mail.senderName, subject: mail.ctx.resolve(mail.doc.subject), at: l.at, mail});
    }
    const rt = l.g.reminderSentAt || reminderAt(l.g);
    if (rt && rt <= now && emailReaches(l.g, member, 'reminder')) {
      const atSend = replay({own: person.before, lots, actions: v.actions, t: rt});
      const left = atSend.left[l.id] || 0;
      if (left > 0) {
        const mail = emailFor(l, 'reminder', person, {left, balance: atSend.balance});
        mails.push({id: `${l.id}-reminder`, from: mail.senderName, subject: mail.ctx.resolve(mail.doc.subject), at: rt, mail});
      }
    }
  });

  const stamp = () => new Date(now.getTime() + 5 * 60000);
  // the look-ahead day is view only: everything is done today, so a later day can't spend the same points twice
  const redeem = (r, applied) => {
    if (after || balance < r.points) return;
    const when = stamp();
    const coupon = {reward: {...r}, code: couponCode(r, v.coupons.length), applied, used: null, at: when};
    // which giveaway's points pay for it is decided now and kept with the redemption
    const took = allocate(lots, replay({own: person.before, lots, actions: v.actions, t: when}).left, r.points);
    set({
      actions: [...v.actions, {kind: 'redeem', at: when, points: r.points, name: r.name, code: coupon.code, took}],
      coupons: [...v.coupons.map((c) => (applied && !c.used ? {...c, applied: false} : c)), coupon],
    });
  };
  const apply = (code) => !after && set({coupons: v.coupons.map((c) => (c.used ? c : {...c, applied: c.code === code}))});
  const placeOrder = () => {
    if (after || !v.items.length) return;
    const subtotal = v.items.reduce((t, h) => t + product(h).price, 0);
    const useCoupon = openCoupon?.applied ? openCoupon : null;
    const discount = useCoupon ? Math.min(useCoupon.reward.value || 0, subtotal) : 0;
    const total = subtotal - discount;
    // order numbers are the shop's: one sequence across customers
    const no = 1204 + Object.values(visits).reduce((n, x) => n + (x.actions || []).filter((a) => a.kind === 'order').length, 0);
    const when = stamp();
    const order = {kind: 'order', no, items: v.items, subtotal, discount, total, points: Math.floor(total), at: when, couponCode: useCoupon ? useCoupon.code : null, couponName: useCoupon ? useCoupon.reward.name : null};
    set({actions: [...v.actions, order], items: [], coupons: v.coupons.map((c) => (useCoupon && c.code === useCoupon.code ? {...c, used: {no, at: when}, applied: false} : c))});
  };
  const lastOrder = orders[orders.length - 1];

  useEffect(() => {
    if (step === 'order' && !after && !orders.length && v.items.length) placeOrder();
    if (step === 'widget') {
      const ids = live.map((l) => l.id).filter((id) => !v.seen.includes(id));
      if (ids.length) set({seen: [...v.seen, ...ids]});
    }
  }, [step, who, after]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = step === 'inbox' ? 'Mail' : step === 'order' ? `Thank you · ${STORE.name}` : STORE.name;
  }, [step]);

  const toShop = () => {
    go('shop');
    setTimeout(() => document.getElementById('bestsellers')?.scrollIntoView({behavior: 'smooth'}), 60);
  };

  let content;
  if (step === 'inbox') {
    content = (
      <Inbox
        key={`${who}-${after}-${mails.length}`}
        mails={mails}
        person={person}
        who={who}
        now={now}
        setWho={(k) => navigate(`/store/inbox${k === 'jordan' ? '?as=jordan' : ''}${after ? `${k === 'jordan' ? '&' : '?'}day=after` : ''}`)}
        onOpenRewards={() => go('widget', 'tab=redeem')}
      />
    );
  } else if (step === 'order') {
    // the confirmation shows the balance right after that order, whichever day is shown
    content = lastOrder ? (
      <ThankYou person={person} order={lastOrder} balance={replay({own: person.before, lots, actions: v.actions, t: lastOrder.at}).balance} />
    ) : (
      <div className="st">
        <div className="mail__unsub">
          <b>No order yet</b>
          <p>{`${person.first} hasn't placed an order yet.`}</p>
          <button type="button" className="st-btn st-btn--line" onClick={toShop}>
            Continue shopping
          </button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="st">
        <StoreHeader cartCount={v.items.length} onCart={() => go('cart')} onAccount={() => go('widget')} onShop={toShop} />
        <StoreBody
          readOnly={after}
          onShop={toShop}
          onAdd={(h) => {
            set({items: v.items.includes(h) ? v.items : [...v.items, h]});
            go('cart');
          }}
        />
        {step !== 'widget' ? <Launcher badge={badge} onOpen={() => go('widget')} /> : null}
        {step === 'widget' ? (
          <>
            <div className="st-scrim" onClick={() => go('shop')} aria-hidden="true" />
            <Widget
              key={`${who}-${after}`}
              person={person}
              balance={balance}
              expiry={expiry}
              history={history}
              coupons={coupons}
              orders={orders}
              initialTab={route.query.get('tab') || 'redeem'}
              readOnly={after}
              onRedeem={(r) => redeem(r, false)}
              onApply={(code) => {
                apply(code);
                go('cart');
              }}
              onClose={() => go('shop')}
            />
          </>
        ) : null}
        {step === 'cart' ? (
          <>
            <div className="st-scrim st-scrim--dark" onClick={() => go('shop')} aria-hidden="true" />
            <CartDrawer
              items={v.items}
              balance={balance}
              coupon={openCoupon}
              readOnly={after}
              onRedeem={(r) => redeem(r, true)}
              onApply={() => apply(openCoupon.code)}
              onRemove={() => apply(null)}
              onClose={() => go('shop')}
              onShop={toShop}
              onCheckout={() => {
                placeOrder();
                go('order');
              }}
            />
          </>
        ) : null}
      </div>
    );
  }
  const afterLabel = firstEnd ? weekday(firstEnd) : null;
  return (
    <div className={`jr${step === 'inbox' ? ' jr--inbox' : ''}`}>
      {content}
      <StepBar
        today={NOW}
        adminHref={adminHref(giveaways)}
        current={step}
        q={qs()}
        after={after}
        afterLabel={afterLabel}
        setAfter={(on) => {
          const p = new URLSearchParams(route.query);
          if (on) p.set('day', 'after');
          else p.delete('day');
          p.delete('tab');
          const str = p.toString();
          navigate(`/store/${step}${str ? `?${str}` : ''}`);
        }}
      />
    </div>
  );
}
