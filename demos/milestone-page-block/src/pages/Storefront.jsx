// The loyalty page as the shopper sees it, drawn inside the editor's preview. Same settings object as the panel,
// so every control in the panel changes this preview (one source).
import React, {useEffect, useRef, useState} from 'react';
import {Icon} from '@shopify/polaris';
import {
  CashDollarIcon,
  CheckIcon,
  ChevronDownIcon,
  DeliveryIcon,
  DiscountIcon,
  GiftCardIcon,
  LockIcon,
  PersonAddIcon,
  StarIcon,
  OrderIcon,
  CalendarIcon,
  ChatIcon,
  AlertCircleIcon,
} from '@shopify/polaris-icons';
import {amount, nextLine, progressOf, progressText, stepSub, stepTitle} from '../data/milestones.js';
import {STORE} from '../data/index.js';

const REWARD_ICON = {points: StarIcon, coupon: DiscountIcon, gift: GiftCardIcon, shipping: DeliveryIcon, credit: CashDollarIcon};
const PROGRAM_ICON = {referral: PersonAddIcon, orders: OrderIcon, spend: CashDollarIcon};
const cx = (...c) => c.filter(Boolean).join(' ');
const BADGE = {claimed: 'Claimed', ready: 'Ready to claim', current: 'In progress', locked: 'Locked'};

/* ---------------------------------------------------------------- the new block */

/** Guest line: thresholds only, no personal progress. "Members unlock rewards at 2, 3 and 5 friends referred." */
function guestLine(program) {
  const vals = program.steps.map((s) => (program.unit ? s.at.toLocaleString('en-US') : `$${s.at.toLocaleString('en-US')}`));
  const list = vals.length > 1 ? `${vals.slice(0, -1).join(', ')} and ${vals[vals.length - 1]}` : vals[0];
  const tail = program.kind === 'referral' ? ' friends referred' : program.kind === 'orders' ? ' orders' : ' spent';
  return `Members unlock rewards at ${list}${tail}.`;
}

/** Top card of one program: "Your progress", the big number, what is left, the action, the track with each step. */
function ProgressCard({program, p, viewer, referralOnPage, onCta}) {
  const guest = viewer === 'guest';
  const txt = progressText(program, p.value);
  const isRef = program.kind === 'referral';
  // Refer a friend only makes sense when the Referral block is on the same page (PRD C).
  const action = isRef ? (referralOnPage ? {id: 'invite', label: 'Refer a friend'} : null) : {id: 'shop', label: 'Shop now'};
  return (
    <div className="sf-ms-progress">
      <div className="sf-ms-progress__top">
        <div className="sf-ms-progress__text">
          <p className="sf-ms-eyebrow">Your progress</p>
          {guest ? (
            <>
              <p className="sf-ms-progress__big sf-ms-progress__big--guest">Sign in to see your progress</p>
              <p className="sf-ms-progress__sub">{guestLine(program)}</p>
            </>
          ) : (
            <>
              <p className="sf-ms-progress__big">{txt.big} <span>{txt.rest}</span></p>
              <p className="sf-ms-progress__sub">{p.next ? nextLine(program, p.left) : 'You unlocked every reward in this program'}</p>
            </>
          )}
        </div>
        <div className="sf-ms-progress__actions">
          {guest ? (
            <>
              <button type="button" className="sf-btn" onClick={() => onCta('signin')}>Sign in</button>
              <button type="button" className="sf-btn sf-btn--ghost" onClick={() => onCta('join')}>Join now</button>
            </>
          ) : action && p.next ? (
            <button type="button" className="sf-btn" onClick={() => onCta(action.id)}>{action.label}</button>
          ) : null}
        </div>
      </div>
      <div className="sf-ms-track" role={guest ? undefined : 'progressbar'} aria-valuemin={0} aria-valuemax={p.max} aria-valuenow={guest ? undefined : p.value} aria-label={`${program.name} progress`}>
        <span className="sf-ms-track__fill" style={{width: `${Math.round(p.share * 100)}%`}} />
        {p.steps.map((s) => (
          <span key={s.at} className={cx('sf-ms-mark', (s.status === 'claimed' || s.status === 'ready') && 'is-done')} style={{left: `${(s.at / p.max) * 100}%`}}>
            <i aria-hidden="true">{s.status === 'claimed' || s.status === 'ready' ? <Icon source={CheckIcon} /> : null}</i>
            <b>{program.unit ? s.at.toLocaleString('en-US') : `$${s.at.toLocaleString('en-US')}`}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/** One step card: title, "After …", status badge, "Choose 1 reward" list, Claim. */
function StepCard({program, step, viewer, claim, onPick, onClaim}) {
  const guest = viewer === 'guest';
  const ready = step.status === 'ready';
  const claimed = step.status === 'claimed';
  const choose = step.rewards.length > 1;
  const picked = claim?.picked || (!choose ? step.rewards[0].id : null);
  const busy = claim?.phase === 'claiming';
  const failed = claim?.phase === 'failed';
  const rewards = claimed ? step.rewards.filter((r) => r.id === step.claimedId) : step.rewards;
  const label = claimed ? 'Your reward' : choose ? 'Choose 1 reward' : 'Reward';
  const status = guest ? 'locked' : step.status;
  return (
    <article className={cx('sf-ms-card', `is-${status}`)} data-step={step.at}>
      <div className="sf-ms-card__top">
        <div>
          <h4 className="sf-ms-card__title">{stepTitle(program, step.at)}</h4>
          <p className="sf-ms-card__sub">{stepSub(program, step.at)}</p>
        </div>
        <span className={cx('sf-ms-badge', `sf-ms-badge--${status}`)}>
          {status === 'locked' ? <Icon source={LockIcon} /> : status === 'claimed' ? <Icon source={CheckIcon} /> : null}
          {BADGE[status]}
        </span>
      </div>
      <p className="sf-ms-card__label">{label}</p>
      <div className="sf-ms-rewards" role={ready && choose ? 'radiogroup' : undefined} aria-label={ready && choose ? `Choose 1 reward for ${stepTitle(program, step.at)}` : undefined}>
        {rewards.map((r) => {
          const selectable = ready && choose && !busy;
          const isPicked = ready && choose && picked === r.id;
          const inner = (
            <>
              <span className="sf-ms-reward__icon" aria-hidden="true"><Icon source={REWARD_ICON[r.icon] || GiftCardIcon} /></span>
              <span className="sf-ms-reward__text">
                <strong>{r.title}</strong>
                {r.sub ? <small>{r.sub}</small> : null}
              </span>
              {ready && choose ? <span className={cx('sf-ms-radio', isPicked && 'is-on')} aria-hidden="true" /> : null}
            </>
          );
          return selectable ? (
            <button key={r.id} type="button" role="radio" aria-checked={isPicked} className={cx('sf-ms-reward', 'is-selectable', isPicked && 'is-picked')} onClick={() => onPick(r.id)}>
              {inner}
            </button>
          ) : (
            <div key={r.id} className={cx('sf-ms-reward', isPicked && 'is-picked')}>{inner}</div>
          );
        })}
      </div>
      {ready ? (
        <>
          {failed ? (
            <p className="sf-ms-card__error" role="alert"><Icon source={AlertCircleIcon} />Couldn’t claim this reward. Nothing was added to your account. Try again.</p>
          ) : null}
          <button type="button" className="sf-btn sf-btn--block" disabled={!picked || busy} aria-busy={busy || undefined} onClick={() => onClaim(picked)}>
            {busy ? 'Claiming…' : failed ? 'Try again' : choose && !picked ? 'Choose a reward to claim' : 'Claim reward'}
          </button>
        </>
      ) : null}
      {claimed ? <p className="sf-ms-card__done">Added to My rewards</p> : null}
    </article>
  );
}

/** One program in full: progress card on top, step cards below. Same body for all three layouts. */
function ProgramBody({program, p, viewer, referralOnPage, claims, onCta, onPick, onClaim}) {
  return (
    <div className="sf-ms-body">
      <ProgressCard program={program} p={p} viewer={viewer} referralOnPage={referralOnPage} onCta={onCta} />
      <div className="sf-ms-cards" style={{'--steps': Math.min(p.total, 3)}}>
        {p.steps.map((s) => (
          <StepCard
            key={s.at}
            program={program}
            step={s}
            viewer={viewer}
            claim={claims[`${program.id}:${s.at}`]}
            onPick={(rid) => onPick(program.id, s.at, rid)}
            onClaim={(rid) => onClaim(program.id, s.at, rid)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The Milestone rewards block. Programs and their order come from settings.programs (merchant's saved list);
 * inactive programs are skipped, never replaced by another one. Layout: stacked · accordion · tabs.
 */
/** Programs the block can show, in the saved order: shown, still existing, not inactive. */
export function shownPrograms(settings, programs) {
  return settings.programs
    .filter((row) => row.shown)
    .map((row) => programs.find((p) => p.id === row.id))
    .filter((p) => p && !p.inactive);
}

export function MilestoneBlock({settings, programs, progress, viewer, referralOnPage, failClaims, onCta}) {
  const shown = shownPrograms(settings, programs);
  const [tab, setTab] = useState(null);
  const [open, setOpen] = useState(() => new Set(shown[0] ? [shown[0].id] : []));
  const [claims, setClaims] = useState({});
  const [claimed, setClaimed] = useState({});
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  // A different first program (reorder, hide) re-opens the new first one in Collapsible, like a fresh page load.
  const firstId = shown[0]?.id;
  useEffect(() => { setOpen(new Set(firstId ? [firstId] : [])); }, [firstId]);
  if (!shown.length) return null;

  const guest = viewer === 'guest';
  const pOf = (program) => {
    const base = progress.claimed[program.id] || {};
    return progressOf(program, guest ? 0 : progress.value[program.id] || 0, {...base, ...(claimed[program.id] || {})}, guest);
  };
  const onPick = (pid, at, rid) => setClaims((c) => ({...c, [`${pid}:${at}`]: {...c[`${pid}:${at}`], picked: rid, phase: c[`${pid}:${at}`]?.phase === 'failed' ? 'failed' : 'idle'}}));
  const onClaim = (pid, at, rid) => {
    const key = `${pid}:${at}`;
    if (claims[key]?.phase === 'claiming') return; // no double claim
    setClaims((c) => ({...c, [key]: {picked: rid, phase: 'claiming'}}));
    timers.current.push(setTimeout(() => {
      if (failClaims) { setClaims((c) => ({...c, [key]: {picked: rid, phase: 'failed'}})); return; }
      setClaimed((m) => ({...m, [pid]: {...(m[pid] || {}), [at]: rid}}));
      setClaims((c) => { const n = {...c}; delete n[key]; return n; });
    }, 900));
  };

  const layout = shown.length > 1 ? settings.layout : 'single';
  const active = shown.find((p) => p.id === tab) || shown[0];
  const body = (program) => (
    <ProgramBody program={program} p={pOf(program)} viewer={viewer} referralOnPage={referralOnPage} claims={claims} onCta={onCta} onPick={onPick} onClaim={onClaim} />
  );
  const onTabKey = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = shown[(i + (e.key === 'ArrowRight' ? 1 : shown.length - 1)) % shown.length];
    setTab(next.id);
    e.currentTarget.parentElement.querySelector(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <div className={cx('sf-ms', `sf-ms--${layout}`)} data-layout={layout}>
      <header className="sf-head">
        <h2 className="sf-h2">Milestone rewards</h2>
        <p className="sf-sub">Reach a milestone and pick your reward.</p>
      </header>

      {layout === 'single' ? body(shown[0]) : null}

      {layout === 'stacked' ? (
        <div className="sf-ms-stack">
          {shown.map((program) => (
            <section key={program.id} className="sf-ms-prog" data-program={program.id}>
              <h3 className="sf-h3">{program.name}</h3>
              {body(program)}
            </section>
          ))}
        </div>
      ) : null}

      {layout === 'accordion' ? (
        <div className="sf-ms-acc">
          {shown.map((program) => {
            const p = pOf(program);
            const isOpen = open.has(program.id);
            const txt = progressText(program, p.value);
            return (
              <section key={program.id} className={cx('sf-ms-acc__item', isOpen && 'is-open')} data-program={program.id}>
                <h3 className="sf-ms-acc__h">
                  <button
                    type="button"
                    className="sf-ms-acc__head"
                    aria-expanded={isOpen}
                    aria-controls={`ms-acc-${program.id}`}
                    data-accordion={program.id}
                    onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(program.id)) n.delete(program.id); else n.add(program.id); return n; })}
                  >
                    <span className="sf-ms-acc__icon" aria-hidden="true"><Icon source={PROGRAM_ICON[program.kind]} /></span>
                    <span className="sf-ms-acc__text">
                      <strong>{program.name}</strong>
                      <small>{guest ? `${p.total} rewards to unlock` : `${txt.big} ${txt.rest}`}</small>
                    </span>
                    {!guest && p.ready ? <span className="sf-ms-pill">{p.ready} reward{p.ready === 1 ? '' : 's'} ready</span> : null}
                    {!guest && !p.ready ? <span className="sf-ms-acc__count">{p.unlocked}/{p.total} unlocked</span> : null}
                    <span className="sf-ms-acc__arrow" aria-hidden="true"><Icon source={ChevronDownIcon} /></span>
                  </button>
                </h3>
                <div id={`ms-acc-${program.id}`} className="sf-ms-acc__panel" hidden={!isOpen}>
                  {isOpen ? body(program) : null}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {layout === 'tabs' ? (
        <>
          <div className="sf-ms-tabs" role="tablist" aria-label="Milestone programs">
            {shown.map((program, i) => {
              const p = pOf(program);
              const sel = program.id === active.id;
              return (
                <button
                  key={program.id}
                  type="button"
                  role="tab"
                  id={`ms-tab-${program.id}`}
                  data-tab={program.id}
                  aria-selected={sel}
                  aria-controls="ms-tabpanel"
                  tabIndex={sel ? 0 : -1}
                  className={cx('sf-ms-tab', sel && 'is-active')}
                  onClick={() => setTab(program.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                >
                  <Icon source={PROGRAM_ICON[program.kind]} />
                  <span className="sf-ms-tab__name">{program.name}</span>
                  {!guest && p.ready ? <span className="sf-ms-tab__ready" aria-label={`${p.ready} reward ready`}>{p.ready}</span> : null}
                </button>
              );
            })}
          </div>
          <div id="ms-tabpanel" role="tabpanel" aria-labelledby={`ms-tab-${active.id}`} data-program={active.id}>
            {body(active)}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MilestoneSkeleton() {
  return (
    <div className="sf-ms" aria-busy="true" aria-label="Loading milestones">
      <header className="sf-head">
        <span className="sf-skel" style={{width: 240, height: 26}} />
        <span className="sf-skel" style={{width: 320, height: 14, marginTop: 10}} />
      </header>
      <span className="sf-skel" style={{height: 150}} />
      <div className="sf-ms-cards" style={{'--steps': 3, marginTop: 16}}>
        <span className="sf-skel" style={{height: 200}} />
        <span className="sf-skel" style={{height: 200}} />
        <span className="sf-skel" style={{height: 200}} />
      </div>
    </div>
  );
}

/** Member data failed to load: only this block says so, the rest of the page is untouched (PRD C). */
export function MilestoneLoadError({onRetry}) {
  return (
    <div className="sf-ms">
      <header className="sf-head">
        <h2 className="sf-h2">Milestone rewards</h2>
      </header>
      <div className="sf-ms-error" role="alert">
        <Icon source={AlertCircleIcon} />
        <p>We couldn’t load your milestone progress.</p>
        <button type="button" className="sf-btn sf-btn--ghost" onClick={onRetry}>Try again</button>
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
 * The whole page. `sections` is the editor's ordered list; the Milestone rewards block reads `settings`.
 * Ways to earn keeps today's milestone cards: hiding or keeping them is the merchant's separate choice (PRD D).
 */
export function StorefrontPage({sections, settings, programs, progress, viewer, device, selectedId, onSelect, loading, loadError, failClaims, onRetry, onCta, entitled = true}) {
  const earnItems = [...EARN];
  programs.filter((p) => !p.inactive).forEach((program) => {
    const first = program.steps[0];
    earnItems.push({icon: PROGRAM_ICON[program.kind], title: program.name, text: `Reach ${amount(program, first.at)} to unlock a reward`, milestone: true});
  });
  const referralOnPage = sections.some((s) => s.id === 'referral' && s.on);
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
      case 'milestones':
        // Live store without Loyalty Page V2 + Milestone access: the whole section is left out, no frame.
        if (!entitled) return null;
        if (loading) return <MilestoneSkeleton />;
        if (loadError) return <MilestoneLoadError onRetry={onRetry} />;
        // Nothing usable to show (all hidden, none exist, all inactive or deleted): no section at all.
        if (!shownPrograms(settings, programs).length) return null;
        return <MilestoneBlock key={`${viewer}-${device}`} settings={settings} programs={programs} progress={progress} viewer={viewer} referralOnPage={referralOnPage} failClaims={failClaims} onCta={onCta} />;
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
