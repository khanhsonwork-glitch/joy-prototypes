// VIP & membership home + VIP tiers. Only ~1 in 4 shops runs VIP, so the home explains each program before it asks
// for set-up, and the tier page is a side-by-side ladder: a merchant designs tiers by comparing them, not one by one.
import React, {useState} from 'react';
import {
  Badge, BlockStack, Button, Card, Checkbox, ChoiceList, Icon, InlineGrid, InlineStack, Modal, Select, Tabs, Text, TextField,
} from '@shopify/polaris';
import {CreditCardIcon, DiscountIcon, StarFilledIcon, StoreIcon} from '@shopify/polaris-icons';
import {CCols, CInvite, CPage, CRow, CSection} from '../../ui/clean.jsx';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, NumberField, ScreenState, StatusBadge, dateLabel, money, num, pct, useConfirm, usePlan, PlanBadge} from '../../ui/kit.jsx';
import {Block, EditorHero, EditorLayout, EditorShell, FormCard, Hint, MoreSettings, Panel, ShareBar, SummaryCard, useScenarioList, realId} from '../../ui/parts.jsx';
import {Missing, RepeatList, useRecordDraft} from '../../ui/editor.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {HashLink, useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {EMPTY_ART, MKT_ART, TIER_ART} from '../../assets/index.js';
import {PERIOD_LABEL, RULE_LABEL, aov, baseRate, giveBack, pts, tierUnit} from '../../lib/econ.js';

export const TIER_COLORS = ['#c08a5b', '#c0c6cf', '#e3b44f', '#1f1f1f', '#b0485a', '#5b7a4a'];
const ART_FOR = {'#c08a5b': 'bronze', '#c0c6cf': 'silver', '#e3b44f': 'gold', '#1f1f1f': 'black', '#d9d9d9': 'silver'};
const PERK_PRESETS = ['Free shipping on every order', 'Early access to sales', 'Birthday gift', 'Exclusive products', 'Priority support', 'Free returns'];
const ENTRY_TYPES = [['none', 'No welcome reward'], ['points', 'Bonus points'], ['discount', 'Percentage off coupon'], ['free_shipping', 'Free shipping coupon'], ['product', 'Free product'], ['store_credit', 'Store credit']];

export const entryLabel = (e, db) => {
  if (!e || e.type === 'none') return '—';
  if (e.type === 'points') return pts(db, e.value);
  if (e.type === 'discount') return `${e.value}% off`;
  if (e.type === 'free_shipping') return 'Free shipping';
  if (e.type === 'store_credit') return `${money(e.value)} credit`;
  return `Free ${e.value}`;
};
const reachLabel = (t, db, i) => (i === 0 || !t.threshold ? 'Join the program' : `${tierUnit(db, t.threshold)} ${PERIOD_LABEL[db.tierSettings.period] ?? ''}`);

/* ---------- Home ---------- */

function ProgramCard({title, what, status, number, numberLabel, url, art, setUpUrl, plan, onSetUp, detail}) {
  const {allows} = usePlan();
  const set = Boolean(status);
  return (
    <Card padding="0">
      <div className="op-vipcard">
        {!set && art && <img className="op-vipcard__art" src={art} alt="" />}
        <div className="op-vipcard__body">
          <InlineStack gap="200" blockAlign="center">
            <Text as="h2" variant="headingSm">{title}</Text>
            {set ? <StatusBadge status={status} /> : <Badge>Not set up</Badge>}
            {!allows(plan) && <PlanBadge plan={plan} />}
          </InlineStack>
          <Text as="p" tone="subdued">{what}</Text>
          {set && <div><span className="op-vipcard__num">{number}</span> <Text as="span" tone="subdued">{numberLabel}</Text></div>}
          {set && detail && <div className="op-vipcard__detail">{detail}</div>}
          <InlineStack gap="200">
            {set ? <Button url={url}>Manage</Button> : <Button variant="primary" url={setUpUrl ?? url} onClick={onSetUp}>Set up</Button>}
          </InlineStack>
        </div>
      </div>
    </Card>
  );
}

export function VipHome() {
  const {db} = useStore();
  const {state} = useScenario();
  const {allows} = usePlan();
  const empty = state === 'empty';
  const t = db.tierSettings;
  const members = db.tiers.slice(1).reduce((s, x) => s + x.members, 0);
  const activeDeals = db.deals.filter(d => d.status === 'active').length;
  const rows = [
    {name: 'VIP tiers', icon: StarFilledIcon, plan: 'advanced', set: !empty && t.enabled, url: '/vip/tiers', setUp: '/vip/tiers/new', value: `${db.tiers.length} tiers · ${num(members)} members`, tag: t.needsLaunch ? 'Not launched' : null},
    {name: 'Member deals', icon: DiscountIcon, plan: 'essential', set: !empty && db.deals.length > 0, url: '/vip/deals', setUp: '/vip/deals/new', value: `${activeDeals} running`},
    {name: 'Paid membership', icon: CreditCardIcon, plan: 'advanced', set: !empty && db.paidPlans.length > 0, url: '/vip/paid', setUp: '/vip/paid/new', value: `${num(db.paidPlans.reduce((s, p) => s + p.subscribers, 0))} subscribers`},
    db.shop.b2b && {name: 'Partner tiers', icon: StoreIcon, plan: 'advanced', set: !empty && db.partnerTiers.length > 0, url: '/vip/partners', setUp: '/vip/partners/new', value: `${num(db.companies.length)} companies`},
  ].filter(Boolean);
  return (
    <PageFrame title="VIP & membership" width="default">
      <ScreenState>
        <CPage>
          <SectionNav section="vip" bare />
          <CCols>
            <CSection title="Extras for loyal customers">
              {rows.map(r => (
                <CRow key={r.name} icon={r.icon} name={r.name} url={r.set ? r.url : r.setUp}
                  tag={!r.set ? (allows(r.plan) ? 'Not set up' : `${r.plan === 'advanced' ? 'Advanced' : 'Essential'} plan`) : r.tag}
                  value={r.set ? r.value : 'Set up'} />
              ))}
            </CSection>
            <CInvite art={EMPTY_ART.members} title="Show members what they unlock" action={{content: 'Customize the loyalty page', url: '/store/page'}}>
              Put your tiers and perks on the loyalty page, so customers see the next level and what it brings before they reach it.
            </CInvite>
          </CCols>
        </CPage>
      </ScreenState>
    </PageFrame>
  );
}

/* ---------- Tier ladder ---------- */

export function TierLadder() {
  const {db, merge} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const tiers = useScenarioList([...db.tiers].sort((a, b) => a.threshold - b.threshold));
  const [launch, setLaunch] = useState(false);
  const t = db.tierSettings;
  const rate = baseRate(db);
  const total = db.tiers.reduce((s, x) => s + x.members, 0);
  if (!tiers.length) {
    return (
      <PageFrame title="VIP tiers" backUrl="/vip" primaryAction={{content: 'Add tier', url: '/vip/tiers/new'}}>
        <SectionNav section="vip" />
        <ScreenState>
          <EmptyCard art="members" heading="No VIP tiers yet" action={{content: 'Add your first tier', url: '/vip/tiers/new'}}>
            Tiers give your best customers a reason to come back: they earn faster and get perks. Most shops start with 3.
          </EmptyCard>
        </ScreenState>
      </PageFrame>
    );
  }
  const rows = [
    ['How to reach', (x, i) => reachLabel(x, db, i)],
    ['Earns', x => `${x.multiplier}× points`],
    ['Welcome reward', x => entryLabel(x.entryReward, db)],
    ['Perks', x => (x.perks?.length ? <ul className="op-perks">{x.perks.map(p => <li key={p}>{p}</li>)}</ul> : '—')],
    ['Keeps the tier for', x => (x.keep ? `${x.keep} months` : 'Forever')],
    ['Members', x => num(x.members)],
  ];
  const toggle = () => {const v = !t.enabled; merge(['tierSettings'], {enabled: v}); notify(v ? 'VIP tiers turned on' : 'VIP tiers turned off. Customers keep their tier name but no perks apply.');};
  return (
    <PageFrame title="VIP tiers" backUrl="/vip" badge={<StatusBadge status={t.enabled ? 'active' : 'inactive'} />}
      moreActions={[{content: 'Add tier', url: '/vip/tiers/new', disabled: db.tiers.length >= 10}, {content: 'Rule and settings', url: '/vip/tiers/settings'}, {content: 'Relaunch tiers', onAction: () => setLaunch(true)}, {content: t.enabled ? 'Turn VIP tiers off' : 'Turn VIP tiers on', onAction: toggle}]}>
      <ScreenState>
        {({locked}) => (
          <CPage>
            <SectionNav section="vip" bare />
            <CSection title="Tiers side by side" add="Tier" onAdd={() => navigate('/vip/tiers/new')} locked={locked || db.tiers.length >= 10}>
              <div className="op-ladder" style={{'--op-cols': tiers.length}}>
                <div className="op-ladder__head op-ladder__corner" />
                {tiers.map(x => (
                  <button key={x.id} type="button" className="op-ladder__head" onClick={() => navigate(`/vip/tiers/${realId(x.id)}`)}>
                    <TierChip tier={x} />
                    <span className="op-ladder__tname"><span className="op-ladder__name">{x.name}</span>{x.exclusive && <span className="op-ladder__meta">Manual only</span>}</span>
                  </button>
                ))}
                {rows.map(([label, render]) => (
                  <React.Fragment key={label}>
                    <div className="op-ladder__label">{label}</div>
                    {tiers.map((x, i) => <div key={x.id} className="op-ladder__cell" data-label={`${x.name} · ${label}`}>{render(x, i)}</div>)}
                  </React.Fragment>
                ))}
              </div>
              <div className="op-ladder__cards">
                {tiers.map((x, i) => (
                  <button key={x.id} type="button" className="op-tiercard" onClick={() => navigate(`/vip/tiers/${realId(x.id)}`)}>
                    <span className="op-tiercard__top"><TierChip tier={x} /><strong>{x.name}</strong><span className="op-tiercard__members">{num(x.members)} members</span></span>
                    {rows.slice(0, 3).map(([label, render]) => <span key={label} className="op-tiercard__row"><span>{label}</span><span>{render(x, i)}</span></span>)}
                  </button>
                ))}
              </div>
            </CSection>
            <CSection title="How customers move up" bare>
              <div className="pt-card">
                <CRow name={`${RULE_LABEL[t.rule]} ${PERIOD_LABEL[t.period]}`} value={t.demotion?.mode === 'never' ? 'Never move down' : 'Move down if short'} url="/vip/tiers/settings" />
                <CRow name="Counted from" value={dateLabel(t.startDate)} url="/vip/tiers/settings" />
              </div>
            </CSection>
          </CPage>
        )}
      </ScreenState>
      <LaunchModal open={launch} onClose={() => setLaunch(false)} />
    </PageFrame>
  );
}

function Switch2({on, onChange}) {
  return <label className="op-inline-switch"><Text as="span" variant="bodySm">{on ? 'On' : 'Off'}</Text><input type="checkbox" role="switch" checked={on} onChange={e => onChange(e.target.checked)} aria-label="VIP tiers on" /><span className="rv-switch__track" aria-hidden="true"><span className="rv-switch__thumb" /></span></label>;
}

export function LaunchModal({open, onClose}) {
  const {db, merge} = useStore();
  const {notify} = useShell();
  const [grant, setGrant] = useState(false);
  const [who, setWho] = useState('skip');
  const [notes, setNotes] = useState('');
  if (!open) return null;
  const moves = db.tiers.slice(1).map(t => `${num(t.members)} to ${t.name}`).join(', ');
  return (
    <ModalLazy open onClose={onClose} title="Relaunch VIP tiers?"
      primaryAction={{content: 'Relaunch', onAction: () => {merge(['tierSettings'], {needsLaunch: false, lastLaunch: '2026-11-18'}); notify('Relaunching. Tiers update in about 10 minutes.'); onClose();}}}
      secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <BlockStack gap="300">
        <Text as="p">Joy recalculates every customer from {dateLabel(db.tierSettings.startDate)} with your current rule. Estimated result: {moves}.</Text>
        <Checkbox label="Give welcome rewards to customers who move up" checked={grant} onChange={setGrant} />
        {grant && <ChoiceList title="Who gets them" titleHidden selected={[who]} onChange={v => setWho(v[0])} choices={[{label: 'Skip customers who already got the reward', value: 'skip'}, {label: 'Send to everyone in the tier', value: 'all'}]} />}
        <TextField label="Notes for this relaunch (optional)" value={notes} onChange={setNotes} multiline={2} autoComplete="off" />
      </BlockStack>
    </ModalLazy>
  );
}
function ModalLazy({children, ...props}) {return <Modal {...props}><Modal.Section>{children}</Modal.Section></Modal>;}

/* ---------- Tier editor ---------- */

/** Small tier tile: the tier's card art with a star, so tiers read as the cards members carry. */
function TierChip({tier}) {
  return (
    <span className="op-tierchip" style={{background: tier.color}} aria-hidden="true">
      <img src={TIER_ART[ART_FOR[tier.color] ?? 'gold']} alt="" />
      <Icon source={StarFilledIcon} />
    </span>
  );
}

// Light tier colours (gold, silver) get dark text on the card, dark ones white.
const isLight = hex => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? ''); if (!m) return false;
  const n = parseInt(m[1], 16); const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
};

export function TierEditor({id}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const sorted = [...db.tiers].sort((a, b) => a.threshold - b.threshold);
  const fresh = React.useMemo(() => {
    const top = sorted[sorted.length - 1];
    return {id: null, name: 'New tier', threshold: top ? Math.round(top.threshold * 2 || 300) : 0, multiplier: top ? +(top.multiplier + 0.25).toFixed(2) : 1, color: TIER_COLORS[5], members: 0, keep: 12, tag: 'joy-new-tier', perks: [], entryReward: {type: 'points', value: 200}, exclusive: false, preTier: {on: false, within: 50, reward: {type: 'points', value: 100}}};
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const record = isNew ? fresh : db.tiers.find(t => t.id === realId(id));
  const d = useRecordDraft({record: record ?? fresh, isNew, backUrl: '/vip/tiers', prefix: 't', save: item => upsert('tiers', item), urlFor: nid => `/vip/tiers/${nid}`,
    validate: x => ({
      name: !x.name?.trim() ? 'Name the tier' : db.tiers.some(t => t.id !== x.id && t.name.toLowerCase() === x.name.trim().toLowerCase()) ? 'Another tier has this name' : null,
      threshold: db.tiers.some(t => t.id !== x.id && Number(t.threshold) === Number(x.threshold)) ? 'Another tier starts at the same number' : null,
      multiplier: !(Number(x.multiplier) > 0) ? 'Enter a multiplier above 0' : null,
    })});
  if (!record && !isNew) return <Missing title="VIP tier" backUrl="/vip/tiers" what="tier" />;
  const x = d.draft;
  const first = sorted[0]?.id === x.id;
  const e = x.entryReward ?? {type: 'none'};
  const pre = x.preTier ?? {on: false, within: 50, reward: {type: 'points', value: 100}};
  const rate = baseRate(db) * (Number(x.multiplier) || 1);
  const orders = db.tierSettings.rule === 'spent' && x.threshold ? Math.ceil(x.threshold / aov(db)) : null;
  const art = TIER_ART[ART_FOR[x.color] ?? 'gold'];
  const sentence = `${x.name || 'This tier'}: ${first ? 'everyone who joins' : `${RULE_LABEL[db.tierSettings.rule].toLowerCase()} ${tierUnit(db, x.threshold)} ${PERIOD_LABEL[db.tierSettings.period]}`}. Earns ${x.multiplier}× ${db.program.point.plural}${e.type !== 'none' ? `, gets ${entryLabel(e, db)} on arrival` : ''}.`;
  return (
    <PageFrame title={isNew ? 'New tier' : x.name} backUrl="/vip/tiers">
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<>
            {!isNew && (
              <div className="op-tierstrip" role="tablist" aria-label="Tiers">
                {sorted.map(t => (
                  <button key={t.id} type="button" role="tab" aria-selected={t.id === x.id} className={t.id === x.id ? 'op-tierstrip__tier is-selected' : 'op-tierstrip__tier'}
                    onClick={() => t.id !== x.id && navigate(`/vip/tiers/${t.id}`)}>
                    <TierChip tier={t} />
                    <span className="op-ladder__tname"><span className="op-ladder__name">{t.id === x.id ? x.name || t.name : t.name}</span><span className="op-ladder__meta">{num(t.members)} members</span></span>
                  </button>
                ))}
                <button type="button" className="op-tierstrip__tier op-tierstrip__add" onClick={() => navigate('/vip/tiers/new')}>+ Tier</button>
              </div>
            )}
            <EditorHero icon={StarFilledIcon} sentence={sentence} facts={[
            ['Gives back', pct(giveBack(db, rate))],
            orders ? ['To reach', `about ${orders} orders at ${money(aov(db))}`] : null,
            ['Members now', num(x.members)],
          ].filter(Boolean)} nudge={!first && Number(x.multiplier) > 3 ? `${x.multiplier}× gives back ${pct(giveBack(db, rate))} of every order. That's a lot; check your margins.` : null} />
          </>}
          side={<>
            <div className={`op-tierpass${isLight(x.color) ? ' is-light' : ''}`} style={{'--tier': x.color}}>
              <img src={art} alt="" />
              <span className="op-tierpass__shop">NORTH BLOOM</span>
              <strong className="op-tierpass__name">{x.name || 'Tier'}</strong>
              <span className="op-tierpass__pts">{pts(db, 1240)}</span>
            </div>
            <Text as="p" variant="bodySm" tone="subdued">Shows in the widget, the Loyalty page and Apple / Google Wallet. Change the card look in VIP settings › Design.</Text>
          </>}
          more={<MoreSettings sections={[
            {title: 'Colour', children: (
              <div className="op-swatches" role="radiogroup" aria-label="Tier colour">
                {TIER_COLORS.map(c => <button key={c} type="button" role="radio" aria-checked={x.color === c} aria-label={c} style={{background: c}} onClick={() => d.set('color', c)} disabled={locked} />)}
              </div>
            )},
            !first && {title: 'Who can join', children: <Checkbox label="Manual only: customers join this tier only when you assign them" helpText="Use for invite-only tiers, staff or paid members." checked={Boolean(x.exclusive)} onChange={v => d.set('exclusive', v)} disabled={locked} />},
            {title: 'Shopify customer tag', description: 'Added to members of this tier, for Shopify segments and Flow.', children: (
              <TextField label="Tag" labelHidden value={x.tag ?? ''} onChange={v => d.set('tag', v)} autoComplete="off" disabled={locked || !db.tierSettings.syncTags} helpText={db.tierSettings.syncTags ? undefined : 'Turn on tagging in VIP tiers › Settings › Sync.'} />
            )},
            !first && {title: 'Almost there reward', description: 'A nudge for customers close to this tier.', children: <>
              <Checkbox label="Give a reward when a customer is close" checked={pre.on} onChange={v => d.set('preTier', {...pre, on: v})} disabled={locked} />
              {pre.on && (
                <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                  <NumberField label="When they're within" value={pre.within} onChange={v => d.set('preTier', {...pre, within: v})} prefix={db.tierSettings.rule === 'spent' ? '$' : undefined} disabled={locked} />
                  <NumberField label={`Give ${db.program.point.plural}`} value={pre.reward.value} onChange={v => d.set('preTier', {...pre, reward: {...pre.reward, value: v}})} disabled={locked} />
                </InlineGrid>
              )}
            </>},
          ]} />}
          danger={isNew || first ? (first && !isNew ? <Text as="p" variant="bodySm" tone="subdued">The first tier can't be deleted: every member starts here.</Text> : null) : (
            <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Delete ${x.name}?`, action: 'Delete tier', body: `${num(x.members)} members move down to the tier below. Rewards they already got stay.`, onConfirm: () => {remove('tiers', x.id); notify('Tier deleted'); navigate('/vip/tiers');}})}>Delete tier</Button>
          )}>
          <Panel title="How customers reach it">
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} />
              <NumberField label={`Reach at (${RULE_LABEL[db.tierSettings.rule].toLowerCase()})`} value={x.threshold} onChange={v => d.set('threshold', v)} disabled={locked || first}
                prefix={db.tierSettings.rule === 'spent' ? '$' : undefined} suffix={db.tierSettings.rule === 'points' ? db.program.point.plural : db.tierSettings.rule === 'orders' ? 'orders' : undefined}
                helpText={first ? 'Everyone starts in the first tier' : orders ? `About ${orders} orders` : undefined} error={d.errors.threshold} />
              <NumberField label="Points multiplier" value={x.multiplier} onChange={v => d.set('multiplier', v)} step={0.25} suffix="×" disabled={locked} error={d.errors.multiplier} helpText={`Earns ${pts(db, +(rate).toFixed(2))} per $1`} />
              <Select label="Keeps the tier for" value={String(x.keep ?? 'forever')} onChange={v => d.set('keep', v === 'forever' ? null : Number(v))} disabled={locked}
                options={[{label: '6 months', value: '6'}, {label: '12 months', value: '12'}, {label: '24 months', value: '24'}, {label: 'Forever', value: 'forever'}]} />
            </InlineGrid>
          </Panel>
          <Panel title="What members get">
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <Select label="Welcome reward, once on arrival" value={e.type} onChange={v => d.set('entryReward', v === 'none' ? {type: 'none'} : {type: v, value: v === 'product' ? 'Cloud Cream mini' : v === 'points' ? 200 : 10})} disabled={locked} options={ENTRY_TYPES.map(([v, l]) => ({value: v, label: l}))} />
              {e.type !== 'none' && e.type !== 'free_shipping' && (e.type === 'product'
                ? <TextField label="Product" value={String(e.value)} onChange={v => d.set('entryReward', {...e, value: v})} autoComplete="off" disabled={locked} />
                : <NumberField label="Value" value={e.value} onChange={v => d.set('entryReward', {...e, value: v})} disabled={locked} suffix={e.type === 'discount' ? '%' : e.type === 'points' ? db.program.point.plural : undefined} prefix={e.type === 'store_credit' ? '$' : undefined} />)}
            </InlineGrid>
            <BlockStack gap="200">
              <Text as="span">Perks, every time, in this order on the card</Text>
              <RepeatList items={(x.perks ?? []).map((p, i) => ({id: i, name: p}))} onChange={v => d.set('perks', v.map(p => p.name))} disabled={locked} addLabel="Add perk" max={12}
                make={() => ({id: Date.now(), name: ''})}
                render={(p, patch, i) => <TextField label={`Perk ${i + 1}`} labelHidden value={p.name} onChange={v => patch({name: v})} autoComplete="off" disabled={locked} placeholder="Describe the perk" />} />
              <InlineStack gap="200">
                {PERK_PRESETS.filter(p => !(x.perks ?? []).includes(p)).map(p => <button key={p} type="button" className="op-pill" disabled={locked} onClick={() => d.set('perks', [...(x.perks ?? []), p])}>+ {p}</button>)}
              </InlineStack>
            </BlockStack>
          </Panel>
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}

/* ---------- Tier settings ---------- */

const TABS = [['rules', 'Rules'], ['demotion', 'Demotion'], ['launch', 'Launch'], ['sync', 'Sync'], ['design', 'Design'], ['emails', 'Emails']];
export function TierSettings({query}) {
  const {db, set} = useStore();
  const navigate = useNavigate();
  const [launch, setLaunch] = useState(false);
  const tab = Math.max(0, TABS.findIndex(([id]) => id === query.get('tab')));
  const d = useDraft(db.tierSettings, {message: 'VIP settings saved', onSave: v => set(['tierSettings'], v)});
  const x = d.draft;
  const dem = x.demotion ?? {mode: 'end_of_period', graceDays: 30};
  const design = x.design ?? {badge: 'pill', progress: true, showCredit: true, layout: 'columns'};
  return (
    <PageFrame title="VIP tier settings" backUrl="/vip/tiers">
      <ScreenState>{({locked}) => (
        <BlockStack gap="400">
          <Card padding="0"><Tabs tabs={TABS.map(([id, content]) => ({id, content}))} selected={tab} onSelect={i => navigate(`/vip/tiers/settings?tab=${TABS[i][0]}`, {replace: true})} /></Card>
          {tab === 0 && (
            <FormCard title="How customers move up">
              <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                <Select label="Level-up rule" value={x.rule} onChange={v => d.set('rule', v)} disabled={locked} options={Object.entries(RULE_LABEL).map(([value, label]) => ({value, label}))} />
                <Select label="Counted over" value={x.period} onChange={v => d.set('period', v)} disabled={locked} options={[{label: 'The last 12 months (rolling)', value: 'rolling12'}, {label: 'The calendar year', value: 'calendar'}, {label: 'Lifetime', value: 'lifetime'}]} />
                <TextField label="Count from" type="date" value={x.startDate} onChange={v => d.set('startDate', v)} autoComplete="off" disabled={locked} helpText="Orders before this date don't count" />
                <Select label="Count an order when it is" value={x.countOn ?? 'paid'} onChange={v => d.set('countOn', v)} disabled={locked} options={[{label: 'Paid', value: 'paid'}, {label: 'Fulfilled', value: 'fulfilled'}]} />
              </InlineGrid>
              <Checkbox label="Take refunds off the tier progress" checked={x.excludeRefunds !== false} onChange={v => d.set('excludeRefunds', v)} disabled={locked} />
              <Checkbox label="Let me edit a customer's tier progress by hand" checked={Boolean(x.manualTierPoints)} onChange={v => d.set('manualTierPoints', v)} disabled={locked} />
              <Checkbox label="Give the welcome reward again if a customer drops and comes back" checked={x.entryAgain !== false} onChange={v => d.set('entryAgain', v)} disabled={locked} />
              {d.dirty && <Hint tone="warning">Changing the rule only takes effect after you relaunch. Customers keep their current tier until then.</Hint>}
            </FormCard>
          )}
          {tab === 1 && (
            <FormCard title="When customers move down">
              <ChoiceList title="Demotion" titleHidden disabled={locked} selected={[dem.mode]} onChange={v => d.set('demotion', {...dem, mode: v[0]})}
                choices={[
                  {label: 'At the end of each period, if they fall short', value: 'end_of_period'},
                  {label: 'On a schedule (reset everyone)', value: 'scheduled', renderChildren: s => s && <Select label="Reset" value={dem.every ?? 'yearly'} onChange={v => d.set('demotion', {...dem, every: v})} options={['monthly', 'quarterly', 'half-yearly', 'yearly'].map(v => ({label: v[0].toUpperCase() + v.slice(1), value: v}))} />},
                  {label: 'After a time without orders', value: 'inactive', renderChildren: s => s && (
                    <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                      <NumberField label="No orders for" value={dem.days ?? 180} onChange={v => d.set('demotion', {...dem, days: v})} suffix="days" />
                      <Select label="Then" value={dem.action ?? 'previous'} onChange={v => d.set('demotion', {...dem, action: v})} options={[{label: 'Move down one tier', value: 'previous'}, {label: 'Back to the first tier', value: 'lowest'}]} />
                    </InlineGrid>
                  )},
                  {label: 'Never', value: 'never'},
                ]} />
              {dem.mode !== 'never' && <>
                <NumberField label="Grace period" value={dem.graceDays ?? 30} onChange={v => d.set('demotion', {...dem, graceDays: v})} suffix="days" disabled={locked} helpText="Extra time before the move happens" />
                <NumberField label="Warn customers" value={dem.warnDays ?? 14} onChange={v => d.set('demotion', {...dem, warnDays: v})} suffix="days before" disabled={locked} />
              </>}
            </FormCard>
          )}
          {tab === 2 && (
            <FormCard title="Launch and relaunch" description="Recalculates every customer with the current rule.">
              <Text as="p">Last launched {dateLabel(x.lastLaunch ?? x.startDate)}. {x.needsLaunch ? 'You changed the rule since then.' : 'Everything is up to date.'}</Text>
              <InlineStack gap="200"><Button variant="primary" onClick={() => setLaunch(true)} disabled={locked}>Relaunch VIP tiers</Button><Button url="/customers/activity?type=launch">See past launches</Button></InlineStack>
            </FormCard>
          )}
          {tab === 3 && (
            <FormCard title="Sync to Shopify">
              <Checkbox label="Tag customers with their tier" checked={Boolean(x.syncTags)} onChange={v => d.set('syncTags', v)} disabled={locked} helpText="Use the tags in Shopify segments, Flow and email apps." />
              {x.syncTags && <TextField label="Tag prefix" value={x.tagPrefix ?? 'Joy'} onChange={v => d.set('tagPrefix', v)} autoComplete="off" disabled={locked} helpText={`Tags look like ${x.tagPrefix ?? 'Joy'}-Gold`} />}
              <Checkbox label="Save tier and points to customer metafields" checked={x.metafields !== false} onChange={v => d.set('metafields', v)} disabled={locked} helpText="For themes and apps that read metafields." />
            </FormCard>
          )}
          {tab === 4 && (
            <InlineGrid columns={{xs: 1, md: '1fr 1fr'}} gap="400" alignItems="start">
              <FormCard title="Membership card on your store">
                <Select label="Tier badge" value={design.badge} onChange={v => d.set('design', {...design, badge: v})} disabled={locked} options={[{label: 'Pill', value: 'pill'}, {label: 'Text', value: 'text'}, {label: 'Icon and text', value: 'icon'}]} />
                <Select label="Balance layout" value={design.layout} onChange={v => d.set('design', {...design, layout: v})} disabled={locked} options={['columns', 'centered', 'pill', 'rows'].map(v => ({label: v[0].toUpperCase() + v.slice(1), value: v}))} />
                <Checkbox label="Show progress to the next tier" checked={design.progress} onChange={v => d.set('design', {...design, progress: v})} disabled={locked} />
                <Checkbox label="Show store credit balance" checked={design.showCredit} onChange={v => d.set('design', {...design, showCredit: v})} disabled={locked} />
              </FormCard>
              <Card><BlockStack gap="300"><Text as="h2" variant="headingSm">Preview</Text>
                <div className="op-tiercardpreview" style={{'--tier': db.tiers[2]?.color}}>
                  <img src={TIER_ART.gold} alt="" />
                  <div><small>North Bloom Rewards</small><strong>{design.badge === 'pill' ? <span className="op-badgepill">Gold</span> : 'Gold'}</strong><span>{pts(db, 1240)}{design.showCredit ? ' · $12 credit' : ''}</span>
                    {design.progress && <span className="op-progress"><i style={{width: '62%'}} /></span>}</div>
                </div>
              </BlockStack></Card>
            </InlineGrid>
          )}
          {tab === 5 && (
            <FormCard title="Emails about tiers">
              {db.notifications.filter(n => n.group === 'vip').map(n => (
                <InlineStack key={n.id} align="space-between" blockAlign="center"><Text as="span">{n.event}</Text><HashLink url={`/settings/notifications/${n.id}`} className="op-link">Edit email</HashLink></InlineStack>
              ))}
            </FormCard>
          )}
        </BlockStack>
      )}</ScreenState>
      <LaunchModal open={launch} onClose={() => setLaunch(false)} />
    </PageFrame>
  );
}
