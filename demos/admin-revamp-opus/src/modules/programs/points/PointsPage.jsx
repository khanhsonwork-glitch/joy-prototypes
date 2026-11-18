// Points: a price list read in five seconds (clean pass 18/11, references: opus/clean/references.md), in Joy's set-up
// order: what a point is worth (top band, Joy 3D art), then how customers earn (left) next to what they can buy (right),
// each row only a name and one grey value. Money maths lives in the editors, beside the field being typed.
import React, {useState} from 'react';
import {Badge, Button, Icon, Text} from '@shopify/polaris';
import {PageFrame} from '../../../ui/page.jsx';
import {EmptyCard, ScreenState, money, pct} from '../../../ui/kit.jsx';
import {TypePicker, useScenarioList} from '../../../ui/parts.jsx';
import {useStore} from '../../../state/store.jsx';
import {useNavigate, useRoute} from '../../../shell/router.jsx';
import {useShell} from '../../../shell/ShellContext.jsx';
import {EMPTY_ART, MKT_ART} from '../../../assets/index.js';
import {EARN_GROUPS, EARN_TYPES, REDEEM_TYPES, REPEATABLE} from '../../../data/seed/programs.js';
import {REDEEM_GROUPS, REDEEM_META, earnMeta, iconFor, isOrderType} from './meta.js';
import {baseRate, earnGives, giveBack, pointValue, pts} from '../../../lib/econ.js';

export function useEarnPicker() {
  const {db} = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const options = EARN_TYPES.map(t => ({
    id: t.type, name: t.name, group: t.group, plan: t.plan, icon: earnMeta(t.type).icon, desc: earnMeta(t.type).desc,
    taken: !REPEATABLE.includes(t.type) && !t.type.startsWith('social_') && db.earn.some(e => e.type === t.type),
  }));
  const modal = (
    <TypePicker open={open} onClose={() => setOpen(false)} title="Add a way to earn" groups={EARN_GROUPS} options={options}
      intro="Pick what the customer does. You'll set the reward on the next screen."
      onPick={type => {setOpen(false); navigate(`/programs/points/earn/new?type=${type}`);}} />
  );
  return [() => setOpen(true), modal];
}

export function useRewardPicker() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const options = REDEEM_TYPES.map(t => ({id: t.type, name: t.name, group: t.group, plan: t.plan, icon: REDEEM_META[t.type].icon, desc: REDEEM_META[t.type].desc}));
  const modal = (
    <TypePicker open={open} onClose={() => setOpen(false)} title="Add a reward" groups={REDEEM_GROUPS} options={options}
      intro="Pick what customers can buy with their points."
      onPick={type => {setOpen(false); navigate(`/programs/points/rewards/new?type=${type}`);}} />
  );
  return [() => setOpen(true), modal];
}

/** The quiet switcher between the Programs pages (the app nav has one level only, so the pages live here). */
function ProgramSwitch() {
  const {path} = useRoute();
  const navigate = useNavigate();
  const items = [['All programs', '/programs'], ['Points', '/programs/points'], ['Referrals', '/programs/referrals'], ['Milestones', '/programs/milestones'], ['Quizzes', '/programs/quizzes']];
  return (
    <div className="pt-switch" role="tablist" aria-label="Programs">
      {items.map(([label, url]) => (
        <button key={url} type="button" role="tab" aria-selected={path === url} className={path === url ? 'is-on' : undefined} onClick={() => path !== url && navigate(url)}>{label}</button>
      ))}
    </div>
  );
}

/** One row: grey icon, name, one grey value, chevron. Off = grey name + "Off". */
function Line({icon, name, value, off, url}) {
  const navigate = useNavigate();
  return (
    <button type="button" className={off ? 'pt-row is-off' : 'pt-row'} onClick={() => navigate(url)}>
      <span className="pt-row__icon" aria-hidden="true"><Icon source={icon} /></span>
      <span className="pt-row__name">{name}</span>
      {off && <Badge size="small">Off</Badge>}
      <span className="pt-row__value">{value}</span>
      <span className="pt-row__chev" aria-hidden="true">›</span>
    </button>
  );
}

function Section({title, add, onAdd, locked, children}) {
  return (
    <section className="pt-section" aria-label={title}>
      <div className="pt-section__head">
        <Text as="h2" variant="headingMd">{title}</Text>
        {add && <button type="button" className="pt-add" onClick={onAdd} disabled={locked}>+ {add}</button>}
      </div>
      <div className="pt-card">{children}</div>
    </section>
  );
}

const on = x => x.status === 'active' || x.status === 'scheduled';

/**
 * The first question a merchant sets up: what is one point worth? Answered on top, in one band with Joy's own 3D art,
 * before "how do customers earn" and "what can they buy" (Joy's set-up order, not a reference app's layout).
 */
function PointWorth() {
  const {db} = useStore();
  const navigate = useNavigate();
  const p = db.program.point;
  const e = db.program.expiry;
  const rate = baseRate(db);
  const props = [
    ['Name', p.plural],
    ['Expiry', e.mode === 'never' ? 'Never' : e.mode === 'fixed' ? `Every year on ${e.date ?? 'Dec 31'}` : `${e.months} months without activity`],
    ['Rounding', {down: 'Round down', nearest: 'Nearest', up: 'Round up'}[db.program.rounding ?? 'down']],
  ];
  return (
    <section className="pt-worth" aria-label="What a point is worth">
      <div className="pt-worth__text">
        <span className="pt-worth__value">{pts(db, p.value.points)} = {money(p.value.money)}</span>
        <p className="pt-worth__line">{rate ? `Customers get back ${pct(giveBack(db, rate)).replace('.0%', '%')} of what they spend.` : 'No points for orders yet.'}</p>
      </div>
      <img className="pt-worth__art" src={MKT_ART.credit} alt="" />
      <div className="pt-worth__props">
        {props.map(([k, v]) => (
          <button key={k} type="button" className="pt-worth__prop" onClick={() => navigate('/programs/points/settings')}>
            <span>{k}</span><b>{v}</b>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * A shop with nothing set up starts with one decision, not two empty lists: how much of each order comes back as
 * rewards. Joy turns the % into the order rule (and the rest stays editable), so the merchant never has to work
 * out "points per $1" by hand.
 */
function OneDecision() {
  const {db, upsert} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [rate, setRate] = useState(5);
  const presets = [[3, 'Light', 'Low margin products'], [5, 'Balanced', 'Most shops start here'], [8, 'Generous', 'Repeat-buy products']];
  const ppd = +(rate / (pointValue(db) * 100)).toFixed(2);
  const create = () => {
    const order = db.earn.find(e => e.type === 'place_order');
    if (order) upsert('earn', {...order, status: 'active', reward: {...order.reward, type: 'points', kind: 'per_money', points: ppd, per: 1}});
    notify(`Program created at ${rate}%: ${ppd} ${db.program.point.plural} per $1`);
    navigate('/programs/points');
  };
  return (
    <div className="op-onedec">
      <img className="op-onedec__art" src={EMPTY_ART.rewards} alt="" />
      <Text as="h2" variant="headingLg" alignment="center">Start with one decision: how generous is your program?</Text>
      <Text as="p" tone="subdued" alignment="center">Pick how much of each order comes back as rewards. Joy sets the order rule, a sign-up bonus and a first reward for you, and you can change everything later.</Text>
      <div className="op-presets" role="radiogroup" aria-label="How generous">
        {presets.map(([r, word, hint]) => (
          <button key={r} type="button" role="radio" aria-checked={rate === r} className={rate === r ? 'op-preset is-selected' : 'op-preset'} onClick={() => setRate(r)}>
            <span className="op-preset__rate">{r}%</span><span className="op-preset__word">{word}</span><Text as="span" variant="bodySm" tone="subdued">{hint}</Text>
          </button>
        ))}
      </div>
      <Text as="p" variant="bodySm" tone="subdued" alignment="center">{`${rate}% back = ${ppd} ${db.program.point.plural} for every $1, at 100 ${db.program.point.plural} = $1.`}</Text>
      <Button variant="primary" onClick={create}>Create my program</Button>
    </div>
  );
}

export function PointsPage() {
  const {db, reorder} = useStore();
  const {notify} = useShell();
  const earn = useScenarioList(db.earn);
  const redeem = useScenarioList(db.redeem);
  const [addEarn, earnModal] = useEarnPicker();
  const [addReward, rewardModal] = useRewardPicker();
  const [sorting, setSorting] = useState(false);
  const spend = earn.filter(e => isOrderType(e.type));
  const actions = earn.filter(e => !isOrderType(e.type));
  // Keep the earn list in the order merchants think in (account, engagement, social), not in creation order.
  const groupIndex = e => EARN_GROUPS.findIndex(g => g.id === (EARN_TYPES.find(t => t.type === e.type)?.group ?? 'engagement'));
  const ordered = [...actions].sort((a, b) => groupIndex(a) - groupIndex(b));
  const ids = db.redeem.map(r => r.id);
  const move = (id, dir) => {
    const i = ids.indexOf(id); const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    const next = [...ids]; [next[i], next[j]] = [next[j], next[i]];
    reorder('redeem', next);
    notify('Order on your store updated');
  };
  const short = e => earnGives(e, db).replace(' spent', '');
  return (
    <PageFrame title="Points" backUrl="/programs"
      moreActions={[
        {content: 'Add way to earn', onAction: addEarn},
        {content: 'Add reward', onAction: addReward},
        {content: 'Point settings', url: '/programs/points/settings'},
        {content: sorting ? 'Done changing reward order' : 'Change reward order', onAction: () => setSorting(v => !v)},
      ]}>
      <ScreenState>
        {({locked}) => (!earn.length && !redeem.length ? <OneDecision /> : (
          <div className="pt-page">
            <ProgramSwitch />
            <PointWorth />
            <div className="pt-ledger">
              <div className="pt-ledger__col">
                <Section title="Points per spend" add="Rate" onAdd={addEarn} locked={locked}>
                  {spend.length ? spend.map(e => <Line key={e.id} icon={iconFor(e)} name={e.name} value={short(e)} off={!on(e)} url={`/programs/points/earn/${e.id}`} />)
                    : <p className="pt-empty">No points for orders yet.</p>}
                </Section>
                <Section title="Ways to earn" add="Way to earn" onAdd={addEarn} locked={locked}>
                  {ordered.length ? ordered.map(e => <Line key={e.id} icon={iconFor(e)} name={e.name} value={short(e)} off={!on(e)} url={`/programs/points/earn/${e.id}`} />)
                    : <EmptyCard art="members" heading="No ways to earn yet" action={{content: 'Add a way to earn', onAction: addEarn}}>Sign up and birthday are the usual first two.</EmptyCard>}
                </Section>
              </div>
              <div className="pt-ledger__col">
                <Section title="Rewards" add="Reward" onAdd={addReward} locked={locked}>
                  {redeem.length ? redeem.map((r, i) => (
                    sorting ? (
                      <div key={r.id} className="pt-row is-sorting">
                        <span className="pt-row__icon" aria-hidden="true"><Icon source={REDEEM_META[r.type]?.icon} /></span>
                        <span className="pt-row__name">{r.name}</span>
                        <Button variant="tertiary" size="slim" accessibilityLabel={`Move ${r.name} up`} disabled={i === 0} onClick={() => move(r.id, -1)}>↑</Button>
                        <Button variant="tertiary" size="slim" accessibilityLabel={`Move ${r.name} down`} disabled={i === redeem.length - 1} onClick={() => move(r.id, 1)}>↓</Button>
                      </div>
                    ) : <Line key={r.id} icon={REDEEM_META[r.type]?.icon} name={r.name} value={pts(db, r.cost)} off={r.status !== 'active'} url={`/programs/points/rewards/${r.id}`} />
                  )) : <EmptyCard art="rewards" heading="Nothing to spend points on yet" action={{content: 'Add a reward', onAction: addReward}}>A small discount most customers reach in 2 orders works best.</EmptyCard>}
                  {sorting && <div className="pt-sortbar"><Button size="slim" variant="primary" onClick={() => setSorting(false)}>Done</Button></div>}
                </Section>
              </div>
            </div>
          </div>
        ))}
      </ScreenState>
      {earnModal}{rewardModal}
    </PageFrame>
  );
}
