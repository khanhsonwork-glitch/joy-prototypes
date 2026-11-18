// Home (opened by the app name). Answers two questions in this order: "is my program working?" and "is there
// anything I must do today?". Then setup progress, results, what's new. Everything reads the one store.
import React, {useState} from 'react';
import {
  Badge, Banner, BlockStack, Button, Card, Collapsible, InlineGrid, InlineStack, ProgressBar, Text, TextField,
} from '@shopify/polaris';
import {
  AlertTriangleIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon, MagicIcon, PlayIcon, StoreIcon, StarIcon, PersonIcon, ReceiptIcon,
} from '@shopify/polaris-icons';
import {PageFrame} from '../../ui/page.jsx';
import {CRow, CSection} from '../../ui/clean.jsx';
import {ScreenState, money, num, pct, useConfirm} from '../../ui/kit.jsx';
import {Block, FormCard, IconTile, LineChart, ListCard, ListRow, Row} from '../../ui/parts.jsx';
import {useStore} from '../../state/store.jsx';
import {HashLink, useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {MKT_ART, PHOTOS} from '../../assets/index.js';

// The sample clock is a fixed afternoon in mid-November so screenshots match; production picks the occasion
// (New Year, Valentine's, BFCM, Halloween, December holidays) from the real date.
const greeting = () => ({hello: 'Good afternoon', occasion: 'Black Friday is 10 days away.'});

/** The 21 Quickstart steps of production, with completion read from the store where it can be. */
export function useSteps() {
  const {db} = useStore();
  const fresh = useScenario().state === 'empty';
  const done = fresh ? [] : db.home.done ?? [];
  const live = s => db.onsite.surfaces.find(x => x.id === s)?.status === 'live';
  const steps = [
    {id: 'accounts', group: 'program', adv: 'rules', title: 'Turn on customer accounts', why: 'Members need an account to see their points.', url: '/settings/general', auto: null},
    {id: 'migrate', group: 'program', adv: 'rules', title: 'Bring points from another app', why: 'Only if you used another loyalty app before.', url: '/customers/migration', auto: null, optional: true},
    {id: 'earn', group: 'program', adv: 'rules', title: 'Set up ways to earn', why: 'Start with orders and sign-up.', url: '/programs/points', auto: db.earn.some(e => e.status === 'active')},
    {id: 'redeem', group: 'program', adv: 'rules', title: 'Set up rewards', why: 'A small discount most customers reach in 2 orders.', url: '/programs/points', auto: db.redeem.some(r => r.status === 'active')},
    {id: 'label', group: 'program', adv: 'rules', title: 'Name your points', why: 'Your own word, like petals or stars.', url: '/programs/points/settings', auto: db.program.point.plural !== 'points'},
    {id: 'prefix', group: 'program', adv: 'rules', title: 'Choose a discount code prefix', why: 'So reward codes are easy to spot in orders.', url: '/settings/general', auto: Boolean(db.settings.general.discountPrefix)},
    {id: 'vip', group: 'program', adv: 'engagement', title: 'Set up VIP tiers', why: 'Optional. Most shops start with 3 tiers.', url: '/vip/tiers', auto: db.tierSettings.enabled, optional: true},
    {id: 'brand', group: 'program', adv: 'branding', title: 'Add your brand colours and logo', why: 'The widget and emails use them.', url: '/settings/brand', auto: Boolean(db.settings.brand.primary)},
    {id: 'widget', group: 'program', adv: 'branding', title: 'Turn on the loyalty widget', why: 'The main place customers see the program.', url: '/store/widget', auto: live('widget')},
    {id: 'page', group: 'program', adv: 'branding', title: 'Create a loyalty page', why: 'A page that explains the program.', url: '/store/page', auto: live('page')},
    {id: 'product', group: 'program', adv: 'branding', title: 'Show points on product and cart pages', why: '“Earn 120 points with this” nudges the order.', url: '/store/product', auto: live('product') && live('cart')},
    {id: 'visibility', group: 'program', adv: 'branding', title: 'Make the program easier to find', why: 'Add a link in your menu and footer.', url: '/store', auto: null},
    {id: 'account', group: 'program', adv: 'branding', title: 'Show loyalty on the account page', why: 'Where members check their balance.', url: '/store/account', auto: live('account')},
    {id: 'thankyou', group: 'program', adv: 'branding', title: 'Show loyalty on the thank you page', why: 'Tell buyers what they just earned.', url: '/store/thankyou', auto: live('thankyou')},
    {id: 'emails', group: 'program', adv: 'engagement', title: 'Turn on email notifications', why: 'Earn and reward emails bring people back.', url: '/settings/notifications', auto: db.notifications.some(n => n.on)},
    {id: 'referral', group: 'program', adv: 'engagement', title: 'Turn on referrals', why: 'Customers bring friends for a reward.', url: '/programs/referrals', auto: db.referral.status === 'active'},
    {id: 'integrations', group: 'program', adv: 'advanced', title: 'Connect your other apps', why: 'Email, reviews, subscriptions.', url: '/integrations', auto: db.integrations.some(i => i.connected)},
    {id: 'flow', group: 'program', adv: 'advanced', title: 'Set up Shopify Flow', why: 'Automate points and tags.', url: '/integrations/flow', auto: db.integrations.find(i => i.id === 'flow')?.connected, optional: true},
    ...(db.shop.shopifyPlus ? [{id: 'checkout', group: 'program', adv: 'advanced', title: 'Add loyalty to checkout', why: 'Shopify Plus: redeem during checkout.', url: '/store/checkout', auto: live('checkout')}] : []),
    {id: 'live', group: 'live', adv: 'launch', title: 'Go live', why: 'Switch from sandbox so every customer can earn.', url: '/programs', auto: db.program.status === 'live'},
    {id: 'analytics', group: 'live', adv: 'launch', title: 'Check how the program performs', why: 'A week after launch, look at Analytics.', url: '/analytics', auto: (db.home.visited ?? []).includes('analytics')},
  ];
  // A shop that just installed (?state=empty) has done nothing yet, whatever the sample data says.
  return steps.map(s => ({...s, done: (!fresh && Boolean(s.auto)) || done.includes(s.id)}));
}

const BASIC = [['program', 'Set up your program'], ['live', 'Go live']];
const ADVANCED = [['rules', 'Program rules'], ['branding', 'Branding and touchpoints'], ['engagement', 'Engagement'], ['advanced', 'Advanced features'], ['launch', 'Launch and optimise']];

function SetupGuide() {
  const {db, merge} = useStore();
  const {notify} = useShell();
  const navigate = useNavigate();
  const steps = useSteps();
  const mode = db.home.setupMode ?? 'basic';
  const groups = (mode === 'basic' ? BASIC : ADVANCED).map(([id, label]) => ({id, label, items: steps.filter(s => (mode === 'basic' ? s.group : s.adv) === id)}));
  const firstOpen = groups.find(g => g.items.some(s => !s.done))?.id;
  const [open, setOpen] = useState(null);
  const [allSteps, setAllSteps] = useState(false);
  const doneCount = steps.filter(s => s.done).length;
  const all = doneCount === steps.length;
  const [expanded, setExpanded] = useState(!all);
  if (db.home.setupHidden) return null;
  const toggleDone = s => {
    const d = db.home.done ?? [];
    merge(['home'], {done: d.includes(s.id) ? d.filter(x => x !== s.id) : [...d, s.id]});
    notify(d.includes(s.id) ? 'Marked as not done' : 'Marked as done');
  };
  return (
    <div className="pt-card">
      <div className="op-setup__head">
        <BlockStack gap="150">
          <InlineStack gap="200" blockAlign="center"><Text as="h2" variant="headingMd">Setup guide</Text><Text as="span" tone="subdued">{`${doneCount} of ${steps.length} done`}</Text></InlineStack>
          <div className="op-meter" aria-hidden="true"><i style={{width: `${(doneCount / steps.length) * 100}%`}} /></div>
        </BlockStack>
        <InlineStack gap="200" wrap={false} blockAlign="center">
          <div className="op-seg" role="radiogroup" aria-label="Guide detail">
            {[['basic', 'Basic'], ['advanced', 'Advanced']].map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={mode === v} onClick={() => {merge(['home'], {setupMode: v}); setOpen(null);}}>{l}</button>)}
          </div>
          <Button variant="tertiary" icon={expanded ? ChevronUpIcon : ChevronDownIcon} accessibilityLabel={expanded ? 'Collapse guide' : 'Expand guide'} onClick={() => setExpanded(v => !v)} />
        </InlineStack>
      </div>
      <Collapsible open={expanded} id="setup-guide">
        {groups.map(g => {
          const left = g.items.filter(s => !s.done).length;
          const isOpen = open === g.id || (open == null && g.id === firstOpen);
          return (
            <div key={g.id} className="op-setup__group">
              <button type="button" className="op-setup__ghead" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : g.id)}>
                <Text as="span" fontWeight="semibold">{g.label}</Text>
                <Text as="span" variant="bodySm" tone="subdued">{left ? `${left} left of ${g.items.length}` : 'Done'}</Text>
              </button>
              {isOpen && (allSteps ? g.items : g.items.filter(s => !s.done).slice(0, 3)).map(s => (
                <div key={s.id} className={`op-step${s.done ? ' is-done' : ''}`}>
                  <button type="button" className="op-step__check" aria-label={s.done ? `${s.title}: done` : `Mark ${s.title} as done`} aria-pressed={s.done} disabled={s.auto === true} onClick={() => toggleDone(s)}>{s.done ? '✓' : ''}</button>
                  <div className="op-step__text"><span className="op-step__title">{s.title}{s.optional ? <Text as="span" tone="subdued"> · optional</Text> : null}</span>{allSteps && <span className="op-step__why">{s.why}</span>}</div>
                  {!s.done && <Button size="slim" onClick={() => navigate(s.url)}>Start</Button>}
                </div>
              ))}
              {isOpen && !allSteps && g.items.length > 3 && (
                <div className="op-setup__more"><Button variant="plain" onClick={() => setAllSteps(true)}>{`Show all ${g.items.length} steps, done ones too`}</Button></div>
              )}
            </div>
          );
        })}

      </Collapsible>
    </div>
  );
}

function Attention() {
  const {db, merge} = useStore();
  const {notify} = useShell();
  const [showAll, setShowAll] = useState(false);
  const pending = db.reviewQueue.filter(q => q.status === 'pending');
  const dismissed = db.home.dismissed ?? [];
  const used = db.home.ordersUsed ?? 1640; const limit = db.home.ordersLimit ?? 2000;
  const alerts = [
    !db.integrations.find(i => i.id === 'pos')?.connected && {id: 'pos', tone: 'warning', title: 'In-store orders earn no points', body: 'Shopify POS isn’t connected, so customers who buy in your shop don’t get points.', action: {content: 'Connect POS', url: '/integrations/pos'}},
    {id: 'orders', tone: 'warning', title: `You've used ${pct((used / limit) * 100)} of this month's orders`, body: `${num(used)} of ${num(limit)} orders on the Advanced plan. Over the limit, new orders stop earning points until the next cycle on Dec 1.`, action: {content: 'See plans', url: '/settings/plans'}},
    {id: 'scope', tone: 'info', title: 'Joy needs one more permission', body: 'Allow Joy to read customer events so “Visit a page” rewards keep working.', action: {content: 'Review permission', onAction: () => notify('Opens the Shopify permission screen')}},
    {id: 'posext', tone: 'info', title: 'Move to the new POS extension', body: 'The old POS tile stops working on Jan 31, 2027. The new one takes 2 minutes.', action: {content: 'See how', url: '/integrations/pos'}},
  ].filter(Boolean).filter(a => !dismissed.includes(a.id));
  const shown = showAll ? alerts : alerts.slice(0, 2);
  const total = pending.length + alerts.length;
  const dismiss = id => {merge(['home'], {dismissed: [...dismissed, id]}); notify('Dismissed');};
  if (!total) {
    return <CSection title="Needs your attention"><CRow icon={CheckCircleIcon} name="Nothing needs you today" value="" /></CSection>;
  }
  return (
    <CSection title={`Needs your attention · ${total}`} extra={alerts.length > 2 ? <button type="button" className="pt-add" onClick={() => setShowAll(v => !v)}>{showAll ? 'Show fewer' : `Show all ${alerts.length}`}</button> : null}>
      {pending.length > 0 && (
        <CRow icon={ReceiptIcon} url="/customers/review" name={`${pending.length} submissions to approve`} value={`${num(pending.reduce((s, q) => s + q.points, 0))} points waiting`} />
      )}
      {shown.map(a => (
        <CRow key={a.id} icon={a.tone === 'warning' ? AlertTriangleIcon : InfoIcon} name={a.title}
          trailing={<span className="pt-row__actions">
            <Button size="slim" url={a.action.url} onClick={a.action.onAction}>{a.action.content}</Button>
            <Button variant="tertiary" size="slim" accessibilityLabel={`Dismiss: ${a.title}`} onClick={() => dismiss(a.id)}>✕</Button>
          </span>} />
      ))}
    </CSection>
  );
}

function Compare({label, a, b, fmt}) {
  const max = Math.max(a, b) || 1;
  return (
    <div className="op-compare">
      <Text as="span" variant="bodySm" tone="subdued">{label}</Text>
      <div className="op-compare__row"><span>Members</span><span className="op-compare__bar"><i style={{width: `${(a / max) * 100}%`}} /></span><b>{fmt(a)}</b></div>
      <div className="op-compare__row"><span>Others</span><span className="op-compare__bar is-b"><i style={{width: `${(b / max) * 100}%`}} /></span><b>{fmt(b)}</b></div>
    </div>
  );
}

function Results() {
  const {db} = useStore();
  const navigate = useNavigate();
  const l = db.stats.last30;
  const days = db.stats.daily;
  return (
    <CSection title="Last 30 days" extra={<button type="button" className="pt-add" onClick={() => navigate('/analytics')}>Open Analytics</button>} bare>
      <div className="op-panel">
        <BlockStack gap="400">
          <div className="op-kpis op-kpis--flat" style={{'--op-kpi-count': 4}}>
            <div className="op-kpi"><Text as="span" variant="bodySm" tone="subdued">Revenue by Joy</Text><span className="op-kpi__value">{money(l.revenueByJoy)}</span><Text as="span" variant="bodySm" tone="subdued">{pct(l.revenueShare)} of sales</Text></div>
            <div className="op-kpi"><Text as="span" variant="bodySm" tone="subdued">Members</Text><span className="op-kpi__value">{num(l.members)}</span><Text as="span" variant="bodySm" tone="subdued">+{num(l.newMembers)} new</Text></div>
            <div className="op-kpi"><Text as="span" variant="bodySm" tone="subdued">Redemption rate</Text><span className="op-kpi__value">{pct(l.redemptionRate)}</span><Text as="span" variant="bodySm" tone="subdued">of members</Text></div>
            <div className="op-kpi"><Text as="span" variant="bodySm" tone="subdued">Members' average order</Text><span className="op-kpi__value">{money(l.aovMember)}</span><Text as="span" variant="bodySm" tone="subdued">{`others ${money(l.aovGuest)}`}</Text></div>
          </div>
          <LineChart label="Sales and revenue by Joy, last 30 days" labels={days.map(x => new Date(`${x.date}T00:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}))}
            series={[{name: 'Revenue by Joy', values: days.map(x => x.joy), tone: 'a', area: true}, {name: 'All sales', values: days.map(x => x.sales), tone: 'b'}]} format={v => `$${num(v)}`} height={200} />
          <p className="pt-note"><b>Program health: good.</b> Members spend {pct((l.aovMember / l.aovGuest - 1) * 100)} more per order. Only {pct(l.redemptionRate)} redeem; a cheaper first reward would lift that.</p>
        </BlockStack>
      </div>
    </CSection>
  );
}

function AskInline() {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState(null);
  return (
    <BlockStack gap="200">
      <InlineStack gap="200" wrap={false} blockAlign="end">
        <div style={{flex: 1, minWidth: 0}}><TextField label="Ask Joy AI" labelHidden value={q} onChange={setQ} placeholder="Ask Joy AI, e.g. how do I get more customers to redeem?" autoComplete="off" /></div>
        <Button icon={MagicIcon} disabled={!q.trim()} onClick={() => setAnswer('Your cheapest reward costs 500 points, about $100 in orders. Shops like yours see more redemptions with a first reward around 300 points: try Free shipping at 300, and remind members by email when they can afford it.')}>Ask</Button>
      </InlineStack>
      {answer && <div className="op-ai"><Text as="p" variant="bodySm">{answer}</Text><InlineStack gap="200"><Button size="slim" url="/programs/points/rewards/r-ship">Open Free shipping</Button><Button size="slim" variant="plain" onClick={() => {setAnswer(null); setQ('');}}>Clear</Button></InlineStack></div>}
    </BlockStack>
  );
}

function AskAi() {
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState(null);
  return (
    <FormCard title="Ask Joy AI">
      <TextField label="Question" labelHidden value={q} onChange={setQ} placeholder="How do I get more customers to redeem?" autoComplete="off" multiline={2} />
      <InlineStack><Button icon={MagicIcon} disabled={!q.trim()} onClick={() => setAnswer('Your cheapest reward costs 500 points, about $100 in orders. Shops like yours see more redemptions with a first reward around 300 points: try Free shipping at 300, and remind members by email when they can afford it.')}>Ask</Button></InlineStack>
      {answer && <div className="op-ai"><Text as="p" variant="bodySm">{answer}</Text><InlineStack gap="200"><Button size="slim" url="/programs/points/rewards/r-ship">Open Free shipping</Button><Button size="slim" variant="plain" onClick={() => {setAnswer(null); setQ('');}}>Clear</Button></InlineStack></div>}
    </FormCard>
  );
}

export function Home() {
  const {db, merge} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const {state} = useScenario();
  const [confirm, modal] = useConfirm();
  const g = greeting();
  const l = db.stats.last30;
  const st = db.program.status;
  const fresh = state === 'empty';
  const embedOn = !fresh && db.onsite.theme.embedOn;
  const live = fresh ? 0 : db.onsite.surfaces.filter(s => s.status === 'live').length;
  const off = fresh ? [] : db.onsite.surfaces.filter(s => s.status === 'off').map(s => s.name);
  const acts = (state === 'empty' ? [] : db.activity).slice(0, 5);
  const cust = id => db.customers.find(c => c.id === id);
  const dismissed = db.home.dismissed ?? [];
  const news = [
    {id: 'n1', img: MKT_ART.credit, title: 'Store credit rewards', text: 'Give money on account instead of codes. Customers spend it at checkout.', url: '/programs/points/rewards/r-credit'},
    {id: 'n2', img: PHOTOS.heroDesktop, ai: true, title: 'A loyalty page made for you', text: 'Joy AI builds the page from your brand. Edit anything after.', url: '/store/page'},
    {id: 'n3', img: MKT_ART.wallet, title: 'Points in Apple and Google Wallet', text: 'Members keep their card on the phone, with balance updates.', url: '/store/wallet'},
  ];
  return (
    <PageFrame title="Home" moreActions={db.home.setupHidden ? undefined : [{content: 'Hide the setup guide', onAction: () => {merge(['home'], {setupHidden: true}); notify('Setup guide hidden. Bring it back from Settings › General.');}}]}>
      <ScreenState>
        <div className="pt-page pt-page--home">
          <BlockStack gap="200">
            <div className="op-greet">
              <Text as="h1" variant="headingLg">{g.hello}, {db.shop.owner}</Text>
              {!fresh && <Text as="p" tone="subdued">{g.occasion}</Text>}
            </div>
            {fresh ? (
              <div className="op-panel">
                <BlockStack gap="300">
                  <p className="op-sentence">Welcome to Joy. <b>Most shops go live in about 15 minutes</b>: pick how customers earn, add one reward, then turn on the widget. Nothing shows on your store until you go live.</p>
                  <InlineStack gap="200">
                    <Button variant="primary" url="/programs/points">Start with points</Button>
                    <Button onClick={() => notify('Opens the 4-minute setup video in Joy Academy')}>Watch how (4 min)</Button>
                  </InlineStack>
                </BlockStack>
              </div>
            ) : (
              <div className="pt-homestatus">
                <span className="pt-status"><span className={`pt-status__dot ${st === 'live' ? '' : 'is-warn'}`} />{st === 'live' ? 'Live' : st === 'sandbox' ? 'Sandbox' : 'Paused'}</span>
                <span className="pt-note"><b>{num(l.members)} members</b> earning · Joy brought in <b>{money(l.revenueByJoy)}</b> in 30 days</span>
                {st !== 'live' && <Button variant="primary" onClick={() => confirm({title: 'Go live?', destructive: false, action: 'Go live', body: 'Every customer can earn and redeem from now on.', onConfirm: () => {merge(['program'], {status: 'live'}); notify('Your program is live');}})}>Go live</Button>}
              </div>
            )}
            {db.shop.plan === 'free' && <Text as="p" variant="bodySm" tone="subdued">Usage fee this cycle: $6.20 of $10. Starter shops pay per order that earns points.</Text>}
          </BlockStack>
          {!fresh && <Attention />}
          <SetupGuide />
          {!fresh && <Results />}
          <div className="pt-card">
            <CRow icon={StoreIcon} url="/store" name={embedOn ? 'Your program shows on your store' : 'Your program is not on your store yet'} value={embedOn ? `${live} of ${db.onsite.surfaces.length} places live` : 'Turn on'} />
          </div>
          {!fresh && (
            <CSection title="Recent activity" add="View all" onAdd={() => navigate('/customers/activity')}>
              {acts.length ? acts.map(a => (
                <CRow key={a.id} icon={a.kind === 'redeemed' ? StarIcon : PersonIcon} url={`/customers/${a.customerId}`}
                  name={`${cust(a.customerId)?.name ?? 'A customer'} · ${a.program}`} value={a.points ? `${a.points > 0 ? '+' : ''}${num(a.points)}` : ''} />
              )) : <p className="pt-empty">No activity yet. It shows up when customers earn or redeem.</p>}
            </CSection>
          )}
          <CSection title="New in Joy" bare>
            <div className="op-newsgrid">
              {news.map(n => (
                <div key={n.id} className="op-newscard">
                  <div className="op-news__img"><img src={n.img} alt="" />{n.ai && <span className="op-news__tag">Made with Joy AI</span>}</div>
                  <div className="op-news__body"><Text as="h3" variant="headingSm">{n.title}</Text><Text as="p" variant="bodySm" tone="subdued">{n.text}</Text><HashLink url={n.url} className="op-link">Try it</HashLink></div>
                </div>
              ))}
            </div>
          </CSection>
          <CSection title="Learn and get help" bare>
            <div className="op-panel">
              <InlineGrid columns={{xs: 1, md: 2}} gap="600">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Videos</Text>
                  {[['Set up your first program in 5 minutes', '4:12'], ['Choose rewards customers actually use', '6:30'], ['VIP tiers that pay for themselves', '8:05']].map(([t, du]) => (
                    <button key={t} type="button" className="op-video" onClick={() => notify('Opens the video in Joy Academy')}><IconTile icon={PlayIcon} size="sm" /><span>{t}</span><Text as="span" variant="bodySm" tone="subdued">{du}</Text></button>
                  ))}
                </BlockStack>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingSm">Questions</Text>
                  <AskInline />
                  <BlockStack gap="100">{['How do points expire?', 'Can guests earn points?', 'How do I test before going live?'].map(f => <button key={f} type="button" className="op-faq" onClick={() => notify('Opens the answer in the Help center')}>{f}</button>)}</BlockStack>
                  <InlineStack gap="200"><Button onClick={() => notify('Opens the chat with Joy support')}>Chat with us</Button><Button url="https://help.joy.so" external>Help center</Button></InlineStack>
                </BlockStack>
              </InlineGrid>
            </div>
          </CSection>
          <CSection title="More from Joy">
            {db.integrations.filter(i => ['wishlist', 'subs'].includes(i.id)).map(i => (
              <CRow key={i.id} icon={StarIcon} url={i.id === 'wishlist' ? '/wishlist' : '/subscription'} name={i.name} value={i.connected ? 'Open' : 'Learn more'} />
            ))}
            {!dismissed.includes('refer') && (
              <CRow icon={PersonIcon} name="Refer a merchant, get a month free"
                trailing={<span className="pt-row__actions">
                  <Button size="slim" onClick={() => notify('Referral link copied')}>Copy link</Button>
                  <Button variant="tertiary" size="slim" accessibilityLabel="Dismiss" onClick={() => {merge(['home'], {dismissed: [...dismissed, 'refer']}); notify('Dismissed');}}>✕</Button>
                </span>} />
            )}
          </CSection>
        </div>
      </ScreenState>
      {modal}
    </PageFrame>
  );
}

export function resolve(segments) {
  if (segments[0] !== 'home') return null;
  return <Home />;
}
