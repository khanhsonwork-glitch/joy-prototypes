// What shoppers see: Widget V4 (balance cards + store credit history) and the Shopify customer account
// (Loyalty Hub page + Joy profile block). Each screen redraws the real component on avada/master:
//   widget/joy-balance-cards.ts · widget/joy-balance-history.ts · widget/joy-activity-item.ts ·
//   extensions/loyalty-hub-page/src/sections/PointsBalanceSection.js · extensions/customer-account-ui/src/Components/CardInfoCustomer.js
// The only new pieces are the expiry lines; everything else stays as it is today.
import React, {useState} from 'react';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {
  CUSTOMER, POINTS_EXPIRY, SC_TRANSACTIONS, SC_TRANSACTIONS_MANY, SC_TRANSACTIONS_NO_EXPIRY, STORE, relativeDate, scMoney, walletsFor,
} from '../data/index.js';

const SCREENS = [
  {path: '/widget', label: 'Widget · balance card'},
  {path: '/widget/store-credit', label: 'Widget · store credit history'},
  {path: '/account/rewards', label: 'Loyalty Hub page'},
  {path: '/account/profile', label: 'Customer account'},
  {path: '/integrations/klaviyo', label: 'Admin · Klaviyo triggers'},
];
// Translatable template of the new line (Widget translations, same pattern as the points expiry label).
export const SC_EXPIRY_LABEL = '{{amount}} expires on {{date}}';
const expiryText = (exp, currency) => SC_EXPIRY_LABEL.replace('{{amount}}', scMoney(exp.amount, currency)).replace('{{date}}', exp.date);

/** Amber outline on the lines this feature adds: prototype-only, hidden in ?shot=1 card photos. */
function New({children, block}) {
  const Tag = block ? 'div' : 'span';
  return <Tag className="scl-new" data-new="true">{children}</Tag>;
}

function ProtoBar() {
  const {path} = useRoute();
  const navigate = useNavigate();
  if (new URLSearchParams(window.location.search).get('shot') === '1') return null;
  return (
    <nav className="scl-proto" aria-label="Prototype screens">
      <span className="scl-proto__label">Prototype · screens</span>
      {SCREENS.map((s) => (
        <button key={s.path} type="button" className={`scl-proto__btn${path === s.path ? ' is-on' : ''}`} aria-current={path === s.path ? 'page' : undefined}
          onClick={() => navigate(s.path)}>{s.label}</button>
      ))}
      <span className="scl-proto__hint">Amber outline = what this feature adds. Switch data with the Prototype button (bottom right).</span>
    </nav>
  );
}

function StoreHeader({account}) {
  const {notify} = useShell();
  return (
    <header className={`scl-store${account ? ' scl-store--account' : ''}`}>
      <span className="scl-store__name">{STORE.name}</span>
      <nav className="scl-store__nav" aria-label="Store">
        {(account ? ['Shop', 'Orders', 'Rewards', 'Profile'] : ['Shop all', 'Skincare', 'Sets', 'About']).map((item) => (
          <button key={item} type="button" onClick={() => notify(`${item} isn't part of this prototype`)}>{item}</button>
        ))}
      </nav>
    </header>
  );
}

/* ================================================================ Widget V4 */

const StarCoin = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M10 5.6l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="currentColor" /></svg>
);
const Wallet = () => (
  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><rect x="2.5" y="5" width="15" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M13 10.5h4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4.5 5l8-2.2.8 2.2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
);
const Eye = ({off}) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{off ? <path d="M3 3l18 18" /> : null}
  </svg>
);
const Back = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
);

function WidgetShell({children}) {
  const {notify} = useShell();
  return (
    <div className="joyw" role="dialog" aria-label="Pomelo Rewards">
      <div className="joyw__header">
        <span className="joyw__program">Pomelo Rewards</span>
        <button type="button" className="joyw__close" aria-label="Close" onClick={() => notify('The widget stays open in this prototype')}>×</button>
      </div>
      <div className="joyw__content">{children}</div>
    </div>
  );
}

function BalanceCards({state, revealed, onToggle}) {
  const navigate = useNavigate();
  const {notify} = useShell();
  const masked = state === 'masked' && !revealed;
  const maskOn = state === 'masked';
  const wallet = walletsFor(state)[0];
  if (state === 'loading') {
    return <div className="joyb-grid joyb-grid--tile" aria-busy="true"><span className="joyb-skel" /><span className="joyb-skel" /></div>;
  }
  const scAmount = wallet ? wallet.amount : 0;
  const scExpiry = wallet?.expiry;
  const eye = (balance) => (
    <button type="button" className="joyb-eye" aria-label={revealed ? 'Hide' : 'Show'}
      onClick={(e) => {e.stopPropagation(); onToggle(balance);}}><Eye off={revealed} /></button>
  );
  const card = ({key, icon, label, value, expiry, onOpen, isNew}) => (
    <div key={key} className="joyb-card" role="button" tabIndex={0} onClick={onOpen}
      onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); onOpen();}}}>
      <span className="joyb-card__icon">{icon}</span>
      <span className="joyb-card__label">{label}{maskOn ? eye(key) : null}</span>
      <span className={`joyb-card__value${masked ? ' is-masked' : ''}`}>{masked ? '••••' : value}</span>
      {expiry ? <span className="joyb-card__expiry">{isNew ? <New>{expiry}</New> : expiry}</span> : null}
      <span className="joyb-card__chevron"><Chevron /></span>
    </div>
  );
  return (
    <div className="joyb-grid joyb-grid--tile">
      {card({key: 'point', icon: <StarCoin />, label: 'Points', value: CUSTOMER.points.toLocaleString('en-US'),
        expiry: `${POINTS_EXPIRY.amount} points expire on ${POINTS_EXPIRY.date}`, onOpen: () => notify('Points history is unchanged in this feature')})}
      {card({key: 'sc', icon: <Wallet />, label: 'Store credit', value: scMoney(scAmount, wallet?.currency),
        // New: nearest expiry of the wallet on show. Hidden with the balance; no line without expiring credit.
        expiry: scExpiry && !masked ? expiryText(scExpiry, wallet.currency) : null, isNew: true,
        onOpen: () => navigate('/widget/store-credit')})}
    </div>
  );
}

function WidgetHome({state, revealed, onToggle}) {
  const {notify} = useShell();
  return (
    <WidgetShell>
      <div className="joyw__main">
        <div className="joyw__welcome">
          <div className="joyw__avatar" aria-hidden="true">AN</div>
          <div>
            <p className="joyw__hello">{`Welcome back, ${CUSTOMER.firstName}`}</p>
            <button type="button" className="joyw__link" onClick={() => notify('Profile is unchanged in this feature')}>View Profile</button>
          </div>
        </div>
        {state === 'error' ? (
          <div className="joyw__error" role="alert">
            <p>We couldn’t load your balance. Your points and store credit are safe.</p>
            <button type="button" className="joyw__btn" onClick={() => notify('Trying again…')}>Try again</button>
          </div>
        ) : <BalanceCards state={state} revealed={revealed} onToggle={onToggle} />}
        <div className="joyw__member">
          <div className="joyw__member-top"><strong>{CUSTOMER.tier}</strong><span>Member</span></div>
          <div className="joyw__progress"><span style={{width: '62%'}} /></div>
          <p className="joyw__muted">Spend CA$120.00 more to reach Platinum</p>
        </div>
        {['Ways to earn', 'Ways to redeem', 'Refer friends'].map((row) => (
          <button key={row} type="button" className="joyw__row" onClick={() => notify(`${row} is unchanged in this feature`)}>
            <span>{row}</span><Chevron />
          </button>
        ))}
      </div>
    </WidgetShell>
  );
}

/** joy-balance-history (store-credit variant): a credit row's description carries its own expiry date (new). */
function eventLabel(txn) {
  if (txn.type === 'StoreCreditAccountExpirationTransaction') return 'Store credit expired';
  const order = txn.orderName ? String(txn.orderName).replace(/^#/, '') : '';
  if (txn.event === 'ORDER_PAYMENT') return order ? `Applied store credit to order #${order}` : 'Applied store credit to your order';
  return txn.amount >= 0 ? 'Store credit added to your balance' : 'Store credit deducted from your balance';
}

function StoreCreditHistory({state, revealed, onToggle}) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const wallet = walletsFor(state)[0];
  const masked = state === 'masked' && !revealed;
  const all = state === 'empty' ? [] : state === 'no-expiry' ? SC_TRANSACTIONS_NO_EXPIRY : state === 'worst' ? SC_TRANSACTIONS_MANY : SC_TRANSACTIONS;
  const PER = 8;
  const rows = all.slice((page - 1) * PER, page * PER);
  return (
    <WidgetShell>
      <div className="joyp__header">
        <button type="button" className="joyp__back" aria-label="Back" onClick={() => navigate('/widget')}><Back /></button>
        <h2 className="joyp__title">Store credit</h2>
      </div>
      <div className="joyh">
        <div className="joyh__balance">
          <p className="joyh__balance-label">Balance</p>
          <div className="joyh__balance-amount">
            {masked ? <span className="is-masked">••••</span> : scMoney(wallet ? wallet.amount : 0, wallet?.currency)}
            {state === 'masked' ? <button type="button" className="joyb-eye" aria-label={revealed ? 'Hide' : 'Show'} onClick={() => onToggle('sc')}><Eye off={revealed} /></button> : null}
          </div>
        </div>
        <p className="joyh__title">Store credit history</p>
        {state === 'loading' ? (
          <div className="joyh__list" aria-busy="true">{[1, 2, 3, 4].map((i) => <div key={i} className="joya joya--skel"><span /><span /></div>)}</div>
        ) : state === 'error' ? (
          <div className="joyw__error" role="alert"><p>We couldn’t load your store credit history.</p><button type="button" className="joyw__btn" onClick={() => setPage(1)}>Try again</button></div>
        ) : rows.length ? (
          <>
            <div className="joyh__list">
              {rows.map((txn) => {
                const credit = txn.amount >= 0;
                return (
                  <div key={txn.id} className="joya">
                    <div className="joya__content">
                      <p className="joya__title">{eventLabel(txn)}</p>
                      {credit && txn.expiresAt ? <p className="joya__desc"><New>{`Expires on ${txn.expiresAt}`}</New></p> : null}
                      <p className="joya__date">{relativeDate(txn.createdAt)}</p>
                    </div>
                    <span className={`joya__amount ${credit ? 'is-earn' : 'is-redeem'}`}>{`${credit ? '+' : '-'}${scMoney(txn.amount, txn.currencyCode)}`}</span>
                  </div>
                );
              })}
            </div>
            {all.length > PER ? (
              <div className="joyh__pager">
                <button type="button" className="joyw__btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                <span>{`Page ${page}`}</span>
                <button type="button" className="joyw__btn" disabled={page * PER >= all.length} onClick={() => setPage((p) => p + 1)}>›</button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="joyh__empty"><span aria-hidden="true">🧾</span><p>No store credit activity yet</p></div>
        )}
      </div>
    </WidgetShell>
  );
}

/* ================================================================ customer account */

function WalletLines({wallets, Heading}) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 2;
  const shown = expanded ? wallets : wallets.slice(0, VISIBLE);
  return (
    <>
      {shown.map((w) => (
        <div key={w.currency} className="ca-wallet">
          <Heading>{scMoney(w.amount, w.currency)}</Heading>
          {/* New: this wallet's own nearest expiry. */}
          {w.expiry ? <New block><span className="ca-small ca-subdued">{expiryText(w.expiry, w.currency)}</span></New> : null}
        </div>
      ))}
      {wallets.length > VISIBLE ? (
        <button type="button" className="ca-link" onClick={() => setExpanded((v) => !v)}>
          <span className="ca-small ca-subdued">{expanded ? 'Show less' : 'Show more'}</span><span aria-hidden="true">{expanded ? '▴' : '▾'}</span>
        </button>
      ) : null}
    </>
  );
}

const H = ({children}) => <p className="ca-heading">{children}</p>;
const T = ({children}) => <p className="ca-text">{children}</p>;

function AccountState({state}) {
  if (state === 'loading') return <div className="ca-box ca-box--skel" aria-busy="true"><span /><span /><span /></div>;
  if (state === 'error') return <div className="ca-box" role="alert"><H>We couldn’t load your rewards</H><T>Refresh the page to try again. Your points and store credit are safe.</T></div>;
  return null;
}

function LoyaltyHubPage({state}) {
  const wallets = walletsFor(state);
  const stateView = AccountState({state});
  // Hide store credit when zero is off by default, so the 0 box still shows (keepZeroBalance).
  const shownWallets = wallets.length ? wallets : [{currency: 'CAD', amount: 0, expiry: null}];
  return (
    <div className="ca-page">
      <h1 className="ca-title">Rewards</h1>
      <section className="ca-section">
        {stateView || (
          <div className="ca-grid">
            <div className="ca-box ca-box--subdued">
              <span className="ca-small ca-subdued">Available points:</span>
              <H>{CUSTOMER.points.toLocaleString('en-US')}</H>
              <div className="ca-inline"><span className="ca-small ca-subdued">Next expiry</span><span className="ca-small ca-subdued">{`${POINTS_EXPIRY.amount} points expire on ${POINTS_EXPIRY.date}`}</span></div>
            </div>
            <div className="ca-box ca-box--subdued">
              <span className="ca-small ca-subdued">Store credit:</span>
              <WalletLines wallets={shownWallets} Heading={H} />
            </div>
            <div className="ca-box ca-box--subdued">
              <H>{CUSTOMER.tier}</H>
              <div className="ca-progress"><span style={{width: '62%'}} /></div>
              <span className="ca-small">Spend CA$120.00 more to reach Platinum</span>
            </div>
          </div>
        )}
      </section>
      <section className="ca-section ca-section--muted">
        <H>Ways to earn</H>
        <T>Earn 5 points for every CA$1 spent · Birthday reward · Refer a friend</T>
      </section>
    </div>
  );
}

function CustomerAccountProfile({state}) {
  const wallets = walletsFor(state);
  const stateView = AccountState({state});
  return (
    <div className="ca-page">
      <h1 className="ca-title">Profile</h1>
      <section className="ca-section">
        <H>{CUSTOMER.name}</H>
        <div className="ca-inline"><span className="ca-small ca-subdued">Email</span><span className="ca-small">{CUSTOMER.email}</span></div>
      </section>
      <section className="ca-section">
        <H>Pomelo Rewards</H>
        {stateView || (
          <div className="ca-grid">
            <div className="ca-box">
              <H>Available points:</H>
              <T>{CUSTOMER.points.toLocaleString('en-US')}</T>
              <div className="ca-inline"><span className="ca-small ca-subdued">Next expiry</span><span className="ca-small ca-subdued">{`${POINTS_EXPIRY.amount} points expire on ${POINTS_EXPIRY.date}`}</span></div>
            </div>
            {/* Rendered on a positive balance only (hasStoreCreditBalance), as today. */}
            {wallets.some((w) => w.amount > 0) ? (
              <div className="ca-box">
                <H>Store credit:</H>
                <WalletLines wallets={wallets} Heading={T} />
              </div>
            ) : null}
            <div className="ca-box">
              <H>{CUSTOMER.tier}</H>
              <div className="ca-progress"><span style={{width: '62%'}} /></div>
              <span className="ca-small">Spend CA$120.00 more to reach Platinum</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================================================================ frame */

export function Storefront() {
  const {path} = useRoute();
  const {state} = useScenario();
  const [revealed, setRevealed] = useState(false);
  const toggle = () => setRevealed((v) => !v);
  const account = path.startsWith('/account');
  let body;
  if (path === '/widget/store-credit') body = <StoreCreditHistory state={state} revealed={revealed} onToggle={toggle} />;
  else if (path === '/account/rewards') body = <LoyaltyHubPage state={state} />;
  else if (path === '/account/profile') body = <CustomerAccountProfile state={state} />;
  else body = <WidgetHome state={state} revealed={revealed} onToggle={toggle} />;
  return (
    <div className={`scl-sf${account ? ' scl-sf--account' : ''}`}>
      <ProtoBar />
      <StoreHeader account={account} />
      <main className={account ? 'scl-account' : 'scl-stage'}>
        {account ? body : (
          <>
            <div className="scl-hero" aria-hidden="true">
              <p className="scl-hero__kicker">Winter glow edit</p>
              <p className="scl-hero__title">Bright skin, all season</p>
            </div>
            <div className="scl-widget-slot">{body}</div>
          </>
        )}
      </main>
    </div>
  );
}
