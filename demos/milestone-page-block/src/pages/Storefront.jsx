// The loyalty page as the shopper sees it, drawn inside the editor's preview. Same settings object as the panel,
// so every control in the panel changes this preview (one source).
import React, {useState} from 'react';
import {Icon} from '@shopify/polaris';
import {
  CashDollarIcon,
  CheckIcon,
  DeliveryIcon,
  DiscountIcon,
  GiftCardIcon,
  LockIcon,
  PersonAddIcon,
  StarIcon,
  OrderIcon,
  CalendarIcon,
  ChatIcon,
} from '@shopify/polaris-icons';
import {amount, nextAction, progressOf} from '../data/milestones.js';
import {STORE} from '../data/index.js';

const REWARD_ICON = {points: StarIcon, coupon: DiscountIcon, gift: GiftCardIcon, shipping: DeliveryIcon, credit: CashDollarIcon};
const PROGRAM_ICON = {referral: PersonAddIcon, orders: OrderIcon, spend: CashDollarIcon};
const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------------------------------------------------------------- the new block */

function ProgressCard({program, p, viewer, onCta}) {
  if (viewer === 'guest') {
    const first = program.steps[0];
    return (
      <div className="sf-ms-next">
        <p className="sf-eyebrow">Members only</p>
        <p className="sf-ms-next__head">Join to start unlocking</p>
        <p className="sf-ms-next__sub">
          First reward at {amount(program, first.at)}: {first.reward}
        </p>
        <div className="sf-ms-next__actions">
          <button type="button" className="sf-btn" onClick={() => onCta('join')}>Join now</button>
          <button type="button" className="sf-link" onClick={() => onCta('signin')}>Sign in</button>
        </div>
      </div>
    );
  }
  if (!p.next) {
    return (
      <div className="sf-ms-next">
        <p className="sf-eyebrow">All rewards unlocked</p>
        <p className="sf-ms-next__head">You reached every step</p>
        <p className="sf-ms-next__sub">Your rewards are in My rewards.</p>
        <div className="sf-ms-bar"><span style={{width: '100%'}} /></div>
      </div>
    );
  }
  const isRef = program.kind === 'referral';
  return (
    <div className="sf-ms-next">
      <p className="sf-eyebrow">Get your next reward by</p>
      <p className="sf-ms-next__head">{nextAction(program, p.left)}</p>
      <div className="sf-ms-bar" role="progressbar" aria-valuemin={p.prevAt} aria-valuemax={p.next.at} aria-valuenow={p.value} aria-label={`${program.name} progress`}>
        <span style={{width: `${Math.round(p.share * 100)}%`}} />
      </div>
      <div className="sf-ms-bar__ends">
        <span>{amount(program, p.prevAt)}</span>
        <span>{amount(program, p.next.at)}</span>
      </div>
      <button type="button" className="sf-btn sf-btn--block" onClick={() => onCta(isRef ? 'invite' : 'shop')}>
        {isRef ? 'Invite friends' : 'Shop to earn'}
      </button>
    </div>
  );
}

function Roadmap({program, p, showLocked, viewer}) {
  return (
    <div className="sf-ms-road">
      <div className="sf-ms-road__top">
        <span className="sf-ms-road__title">Milestone roadmap</span>
        <span className="sf-ms-road__count">
          {viewer === 'guest' ? `${p.total} rewards` : `${p.reached} / ${p.total} unlocked`}
        </span>
      </div>
      <ol className="sf-ms-steps" style={{'--steps': p.total}}>
        {p.steps.map((s, i) => {
          const isNext = viewer !== 'guest' && p.next && p.next.at === s.at;
          const hide = !showLocked && !s.reached;
          const state = viewer !== 'guest' && s.reached ? 'done' : isNext ? 'next' : 'locked';
          return (
            <li key={s.at} className={cx('sf-ms-step', `is-${state}`)}>
              <span className="sf-ms-step__dot" aria-hidden="true">
                {state === 'done' ? <Icon source={CheckIcon} /> : null}
              </span>
              {i < p.total - 1 ? <span className={cx('sf-ms-step__line', state === 'done' && p.steps[i + 1].reached && viewer !== 'guest' && 'is-done')} aria-hidden="true" /> : null}
              <div className="sf-ms-step__card">
                <span className="sf-ms-step__icon" aria-hidden="true">
                  <Icon source={hide ? LockIcon : REWARD_ICON[s.icon] || GiftCardIcon} />
                </span>
                <span className="sf-ms-step__reward">{hide ? 'Mystery reward' : s.reward}</span>
                <span className="sf-ms-step__at">at {amount(program, s.at)}</span>
                <span className={cx('sf-chip', state === 'done' && 'sf-chip--done', state === 'next' && 'sf-chip--next')}>
                  {state === 'done' ? 'Unlocked' : state === 'next' ? `${amount(program, p.left)} to go` : 'Locked'}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function CompactBar({program, p, showLocked, viewer}) {
  const last = program.steps[program.steps.length - 1].at;
  const pos = (at) => `${Math.round((at / last) * 100)}%`;
  const fill = viewer === 'guest' ? 0 : Math.min(1, p.value / last);
  const label = viewer === 'guest'
    ? `First reward at ${amount(program, program.steps[0].at)}: ${showLocked ? program.steps[0].reward : 'a mystery reward'}`
    : p.next
      ? `Next: ${showLocked ? p.next.reward : 'a mystery reward'} at ${amount(program, p.next.at)} · ${amount(program, p.left)} to go`
      : 'Every reward unlocked';
  return (
    <div className="sf-ms-compact">
      <div className="sf-ms-compact__top">
        <span className="sf-ms-compact__name">{program.name}</span>
        <span className="sf-ms-road__count">{viewer === 'guest' ? `${p.total} rewards` : `${p.reached} / ${p.total} unlocked`}</span>
      </div>
      <div className="sf-ms-compact__track">
        <div className="sf-ms-bar"><span style={{width: `${Math.round(fill * 100)}%`}} /></div>
        {p.steps.map((s) => (
          <span key={s.at} className={cx('sf-ms-compact__mark', viewer !== 'guest' && s.reached && 'is-done')} style={{left: pos(s.at)}} title={`${amount(program, s.at)}: ${s.reward}`} />
        ))}
      </div>
      <p className="sf-ms-compact__label">{label}</p>
    </div>
  );
}

export function MilestoneBlock({settings, programs, progress, viewer, onCta}) {
  const shown = settings.programs.filter((row) => row.shown).map((row) => programs.find((p) => p.id === row.id)).filter(Boolean);
  const [tab, setTab] = useState(null);
  if (!shown.length) return null;
  const active = shown.find((p) => p.id === tab) || shown[0];
  const useTabs = settings.multi === 'tabs' && shown.length > 1;
  const list = useTabs ? [active] : shown;
  return (
    <div className={cx('sf-ms', settings.layout === 'compact' && 'sf-ms--compact')}>
      <header className="sf-head">
        <h2 className="sf-h2">Milestone rewards</h2>
        <p className="sf-sub">The more you do, the bigger the reward. Every step adds a reward to your account.</p>
      </header>
      {useTabs ? (
        <div className="sf-ms-tabs" role="tablist" aria-label="Milestone programs">
          {shown.map((program) => {
            const p = progressOf(program, progress[program.id] || 0);
            return (
              <button
                key={program.id}
                type="button"
                role="tab"
                aria-selected={program.id === active.id}
                className={cx('sf-ms-tab', program.id === active.id && 'is-active')}
                onClick={() => setTab(program.id)}
              >
                <Icon source={PROGRAM_ICON[program.kind]} />
                <span className="sf-ms-tab__name">{program.name}</span>
                {viewer !== 'guest' ? <span className="sf-ms-tab__count">{p.reached}/{p.total}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="sf-ms-list">
        {list.map((program) => {
          const p = progressOf(program, viewer === 'guest' ? 0 : progress[program.id] || 0);
          if (settings.layout === 'compact') return <CompactBar key={program.id} program={program} p={p} showLocked={settings.showLocked} viewer={viewer} />;
          return (
            <div key={program.id} className="sf-ms-prog">
              {!useTabs && shown.length > 1 ? <h3 className="sf-h3">{program.name}</h3> : null}
              <div className="sf-ms-grid">
                <ProgressCard program={program} p={p} viewer={viewer} onCta={onCta} />
                <Roadmap program={program} p={p} showLocked={settings.showLocked} viewer={viewer} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MilestoneSkeleton() {
  return (
    <div className="sf-ms" aria-busy="true" aria-label="Loading milestones">
      <header className="sf-head">
        <span className="sf-skel" style={{width: 240, height: 26}} />
        <span className="sf-skel" style={{width: 360, height: 14, marginTop: 10}} />
      </header>
      <div className="sf-ms-grid">
        <span className="sf-skel" style={{height: 180}} />
        <span className="sf-skel" style={{height: 180}} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- the rest of the page (unchanged blocks, short) */

const EARN = [
  {icon: PersonAddIcon, title: 'Sign up', text: 'Earn 100 points'},
  {icon: OrderIcon, title: 'Place an order', text: 'Earn 5 points for every $1'},
  {icon: CalendarIcon, title: 'Celebrate a birthday', text: 'Earn 200 points'},
  {icon: ChatIcon, title: 'Write a review', text: 'Earn 50 points for every review'},
];
const REDEEM = [
  {icon: DiscountIcon, title: '$5 off your next order', text: '500 points'},
  {icon: DiscountIcon, title: '10% off sitewide', text: '1,000 points'},
  {icon: DeliveryIcon, title: 'Free shipping', text: '300 points'},
];

function Hero({viewer}) {
  return (
    <div className="sf-hero">
      <p className="sf-eyebrow">Pomelo Rewards</p>
      <h1 className="sf-h1">{viewer === 'guest' ? 'Glow a little more with every order' : 'Welcome back, Ava'}</h1>
      <p className="sf-sub">{viewer === 'guest' ? 'Join free to earn points, unlock milestone rewards and get perks.' : 'You have 1,240 points ready to use.'}</p>
      <button type="button" className="sf-btn">{viewer === 'guest' ? 'Join now' : 'Shop now'}</button>
    </div>
  );
}

function HowItWorks() {
  return (
    <div>
      <header className="sf-head"><h2 className="sf-h2">How it works</h2></header>
      <ol className="sf-how">
        {['Join', 'Earn', 'Redeem'].map((step, i) => (
          <li key={step}><span className="sf-how__n">{i + 1}</span><strong>{step}</strong></li>
        ))}
      </ol>
    </div>
  );
}

function Cards({title, sub, items}) {
  return (
    <div>
      <header className="sf-head"><h2 className="sf-h2">{title}</h2>{sub ? <p className="sf-sub">{sub}</p> : null}</header>
      <div className="sf-cards">
        {items.map((item) => (
          <div key={item.title} className={cx('sf-card', item.milestone && 'sf-card--ms')}>
            <span className="sf-card__icon"><Icon source={item.icon} /></span>
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Refer() {
  return (
    <div className="sf-refer">
      <div>
        <h2 className="sf-h2">Refer a friend</h2>
        <p className="sf-sub">When your friend places their first order, you both get rewarded.</p>
        <div className="sf-refer__deal"><span>You get<strong>200 points</strong></span><span>Friend gets<strong>15% off</strong></span></div>
      </div>
      <div className="sf-refer__link"><span>pomelopark.com/r/ava-2k9</span><button type="button" className="sf-btn sf-btn--ghost">Copy</button></div>
    </div>
  );
}

function Faq() {
  return (
    <div>
      <header className="sf-head"><h2 className="sf-h2">FAQs</h2></header>
      <div className="sf-faq">
        {['How do I join Pomelo Rewards?', 'How do milestone rewards work?', 'Do my points expire?'].map((q) => (
          <div key={q} className="sf-faq__row"><span>{q}</span><span aria-hidden="true">+</span></div>
        ))}
      </div>
    </div>
  );
}

/**
 * The whole page. `sections` is the editor's ordered list; the Milestones block reads `settings`.
 * Milestone programs show in Ways to earn only when the Milestones block is off, or when the merchant keeps both.
 */
export function StorefrontPage({sections, settings, programs, progress, viewer, device, selectedId, onSelect, loading, onCta}) {
  const blockOn = sections.some((s) => s.id === 'milestones' && s.on);
  const shownPrograms = settings.programs.filter((r) => r.shown).map((r) => programs.find((p) => p.id === r.id)).filter(Boolean);
  const earnItems = [...EARN];
  if (!blockOn || settings.alsoInEarn) {
    shownPrograms.forEach((program) => {
      const first = program.steps[0];
      earnItems.push({icon: PROGRAM_ICON[program.kind], title: program.name, text: `Reach ${amount(program, first.at)} to get ${first.reward}`, milestone: true});
    });
  }
  const audienceOk = (s) => {
    if (s.id !== 'milestones') return true;
    if (settings.audience === 'members') return viewer === 'member';
    if (settings.audience === 'guests') return viewer === 'guest';
    return true;
  };
  const render = (s) => {
    switch (s.id) {
      case 'hero': return <Hero viewer={viewer} />;
      case 'howItWorks': return <HowItWorks />;
      case 'earn': return <Cards title="Ways to earn" sub="Earn points with every interaction." items={earnItems} />;
      case 'milestones': return loading ? <MilestoneSkeleton /> : <MilestoneBlock settings={settings} programs={programs} progress={progress} viewer={viewer} onCta={onCta} />;
      case 'redeem': return <Cards title="Ways to redeem" items={REDEEM} />;
      case 'referral': return <Refer />;
      case 'faq': return <Faq />;
      default: return null;
    }
  };
  return (
    <div className={cx('sf', device === 'mobile' && 'sf--mobile')}>
      <div className="sf-store">
        <span className="sf-store__name">{STORE.name}</span>
        <span className="sf-store__nav"><span>Shop</span><span>Rewards</span><span>About</span></span>
      </div>
      {sections.filter((s) => s.on && audienceOk(s)).map((s) => {
        const body = render(s);
        if (!body) return null;
        const full = s.id === 'milestones' && settings.fullWidth;
        return (
          <section
            key={s.id}
            data-section={s.id}
            className={cx('sf-section', full && 'sf-section--full', selectedId === s.id && 'is-selected', s.id === 'milestones' && 'sf-section--ms')}
            onClick={() => onSelect?.(s.id)}
          >
            {body}
          </section>
        );
      })}
    </div>
  );
}
