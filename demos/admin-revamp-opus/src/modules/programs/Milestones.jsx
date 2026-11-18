// Milestones: goals with a bonus at each step ("3rd order → 300 points, 6th → $10 off"). The editor shows the
// steps as a ladder so the merchant sees the whole journey, not one threshold at a time.
import React, {useEffect, useState} from 'react';
import {Badge, BlockStack, Button, Card, ChoiceList, InlineGrid, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {FlagIcon, OrderIcon, CashDollarIcon, PersonAddIcon, StarIcon, OrderRepeatIcon, ClockIcon, ChartHistogramGrowthIcon} from '@shopify/polaris-icons';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EligibilityField, EmptyCard, NumberField, PlanBadge, ScheduleField, ScreenState, StatusBadge, eligibilityLabel, num, useConfirm, usePlan} from '../../ui/kit.jsx';
import {Block, EditorHero, EditorShell, FormCard, MoreSettings, Panel, Row, RowSwitch, StorePreview, TypePicker, realId, useScenarioList} from '../../ui/parts.jsx';
import {Missing, RepeatList, useRecordDraft} from '../../ui/editor.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {useNavigate, useRoute} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {milestoneGives, milestoneShort} from '../../lib/allPrograms.js';
import {CCols, CPage, CRow, CSection, CSide} from '../../ui/clean.jsx';

export const MS_TYPES = {
  mixed: {name: 'Mixed', unit: 'steps', icon: ChartHistogramGrowthIcon, desc: 'Combine orders, spend and reviews in one goal'},
  orders: {name: 'Number of orders', unit: 'orders', icon: OrderIcon, desc: 'Reward the 3rd, 5th, 10th order'},
  referrals: {name: 'Number of referrals', unit: 'friends', icon: PersonAddIcon, desc: 'Reward customers who bring several friends'},
  subscription_cycles: {name: 'Subscription cycles', unit: 'renewals', icon: OrderRepeatIcon, desc: 'Reward subscribers who stay'},
  spent: {name: 'Amount spent', unit: '$ spent', icon: CashDollarIcon, desc: 'Reward lifetime spend, like $500'},
  points: {name: 'Earned points', unit: 'points earned', icon: StarIcon, desc: 'Reward customers who earn a lot'},
  reviews: {name: 'Number of reviews', unit: 'reviews', icon: StarIcon, desc: 'Reward your best reviewers'},
  inactivity: {name: 'Inactivity', unit: 'days without an order', icon: ClockIcon, desc: 'Win back customers who stopped ordering'},
};
const TEMPLATES = [
  {id: 'tpl-3orders', cat: 'orders', name: '3rd order bonus', type: 'orders', steps: [{at: 3, reward: {type: 'points', value: 300}}]},
  {id: 'tpl-ladder', cat: 'orders', name: 'Order ladder: 3, 6, 10', type: 'orders', steps: [{at: 3, reward: {type: 'points', value: 200}}, {at: 6, reward: {type: 'amount', value: 10}}, {at: 10, reward: {type: 'free_product', value: 'Cloud Cream mini'}}]},
  {id: 'tpl-spend', cat: 'spending', name: 'Spend $500, get a gift', type: 'spent', steps: [{at: 500, reward: {type: 'free_product', value: 'Glow Getter Set'}}]},
  {id: 'tpl-reviews', cat: 'engagement', name: '5 reviews club', type: 'reviews', steps: [{at: 5, reward: {type: 'points', value: 250}}]},
  {id: 'tpl-refer', cat: 'engagement', name: 'Bring 3 friends', type: 'referrals', steps: [{at: 3, reward: {type: 'amount', value: 15}}]},
  {id: 'tpl-winback', cat: 'winback', name: 'We miss you (90 days)', type: 'inactivity', steps: [{at: 90, reward: {type: 'percent', value: 15}}]},
];
const REWARD_TYPES = [['points', 'Bonus points'], ['amount', 'Amount off coupon'], ['percent', 'Percentage off coupon'], ['free_shipping', 'Free shipping'], ['free_product', 'Free product'], ['tree', 'Plant a tree'], ['store_credit', 'Store credit']];

function useTemplatePicker() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState('all');
  const cats = [['all', 'All'], ['orders', 'Orders'], ['spending', 'Spending'], ['engagement', 'Engagement'], ['winback', 'Win back']];
  const options = [
    {id: 'scratch', name: 'Build from scratch', desc: 'Pick the goal type on the next screen', icon: FlagIcon, group: 'scratch'},
    ...TEMPLATES.filter(t => cat === 'all' || t.cat === cat).map(t => ({id: t.id, name: t.name, desc: milestoneGives(t, {program: {point: {singular: 'point', plural: 'points'}}}), icon: MS_TYPES[t.type].icon, group: 'tpl'})),
    ...Object.entries(MS_TYPES).map(([id, m]) => ({id: `type:${id}`, name: m.name, desc: m.desc, icon: m.icon, group: 'type'})),
  ];
  const modal = (
    <TypePicker open={open} onClose={() => setOpen(false)} title="Add a milestone" options={options}
      groups={[{id: 'scratch', label: null}, {id: 'tpl', label: 'Templates'}, {id: 'type', label: 'Start from a goal type'}]}
      intro={<InlineStack gap="200">{cats.map(([v, l]) => <button key={v} type="button" className="op-pill" aria-pressed={cat === v} onClick={() => setCat(v)}>{l}</button>)}</InlineStack>}
      onPick={id => {setOpen(false); navigate(id === 'scratch' ? '/programs/milestones/new?type=orders' : id.startsWith('type:') ? `/programs/milestones/new?type=${id.slice(5)}` : `/programs/milestones/new?template=${id}`);}} />
  );
  return [() => setOpen(true), modal];
}

export function MilestoneList() {
  const {db, upsert, set} = useStore();
  const {allows} = usePlan();
  const {query} = useRoute();
  const navigate = useNavigate();
  const items = useScenarioList(db.milestones);
  const [add, modal] = useTemplatePicker();
  useEffect(() => {if (query.get('create')) {add(); navigate('/programs/milestones', {replace: true});}}, []); // eslint-disable-line react-hooks/exhaustive-deps
  const mode = db.milestoneMode ?? 'cumulative';
  const d = useDraft({mode}, {message: 'Milestone settings saved', onSave: v => set(['milestoneMode'], v.mode)});
  const locked = !allows('advanced');
  return (
    <PageFrame title="Milestones" backUrl="/programs" moreActions={[{content: 'Add milestone', onAction: add, disabled: locked}]}>
      <ScreenState>
        <CPage>
          <SectionNav section="programs" bare />
          <CCols sideFirst={false} side={
            <CSide title="When several steps are reached">
              <ChoiceList title="Progression" titleHidden selected={[d.draft.mode]} onChange={v => d.set('mode', v[0])} disabled={locked}
                choices={[{label: 'Give every step on the way', value: 'cumulative', helpText: 'Reaching step 3 also gives steps 1 and 2.'}, {label: 'Give only the highest step', value: 'sequential'}]} />
            </CSide>}>
            <CSection title="Goals" add="Milestone" onAdd={add} locked={locked}>
              {items.length ? items.map(m => (
                <CRow key={m.id} icon={MS_TYPES[m.type]?.icon} name={m.name} value={milestoneShort(m, db)} off={!(m.status === 'active' || m.status === 'scheduled')} url={`/programs/milestones/${m.id}`} />
              )) : <EmptyCard art="rewards" heading="No milestones yet" action={{content: 'Add milestone', onAction: add}}>A bonus at the 3rd order turns one-time buyers into regulars.</EmptyCard>}
            </CSection>
          </CCols>
        </CPage>
      </ScreenState>
      {modal}
    </PageFrame>
  );
}

export function MilestoneEditor({id, query}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const fresh = React.useMemo(() => {
    const tpl = TEMPLATES.find(t => t.id === query.get('template'));
    const type = tpl?.type ?? query.get('type') ?? 'orders';
    return {id: null, type, name: tpl?.name ?? MS_TYPES[type]?.name ?? 'Milestone', status: 'active', steps: tpl?.steps ?? [{at: 3, reward: {type: 'points', value: 200}}], eligibility: {mode: 'members'}, schedule: {start: '', end: ''}, reached: 0, grantExisting: false};
  }, [query]);
  const record = isNew ? fresh : db.milestones.find(m => m.id === realId(id));
  const d = useRecordDraft({record: record ?? fresh, isNew, backUrl: '/programs/milestones', prefix: 'ms', save: item => upsert('milestones', item), urlFor: nid => `/programs/milestones/${nid}`,
    validate: x => ({name: !x.name?.trim() ? 'Name the milestone' : null, steps: x.steps.some((s, i) => i && Number(s.at) <= Number(x.steps[i - 1].at)) ? 'Each step needs a higher number than the one before' : null})});
  if (!record && !isNew) return <Missing title="Milestone" backUrl="/programs/milestones" what="milestone" />;
  const x = d.draft;
  const on = x.status === 'active';
  const unit = MS_TYPES[x.type]?.unit ?? 'steps';
  return (
    <PageFrame title={isNew ? 'New milestone' : x.name} backUrl="/programs/milestones" badge={isNew ? undefined : <StatusBadge status={on ? 'active' : 'inactive'} />}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={MS_TYPES[x.type]?.icon ?? FlagIcon}
            sentence={`${eligibilityLabel(x.eligibility, db)} get: ${milestoneGives(x, db).replace(/(\d+) →/g, (m, n) => `at ${n} ${unit} →`)}.`}
            facts={[['Reached so far', num(x.reached)], ['Counts', MS_TYPES[x.type]?.name]]}
            status={{on, disabled: locked, label: 'Turn on', note: on ? 'Customers progress' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
          side={<StorePreview heading="Your progress" sub={`Ava · ${Math.max(0, Number(x.steps[0]?.at) - 1)} of ${x.steps[0]?.at ?? 0} ${unit}`} brand={db.settings.brand.primary}
            lines={x.steps.map((st, i) => ({icon: MS_TYPES[x.type]?.icon ?? FlagIcon, text: `Reach ${st.at} ${unit}`, value: milestoneGives({...x, steps: [st]}, db).replace(/^\d+ → /, ''), active: i === 0}))} />}
          more={<MoreSettings sections={[
            {title: 'Who can get this', children: <EligibilityField label="Customers" value={x.eligibility} onChange={v => d.set('eligibility', v)} disabled={locked} />},
            {title: 'When it runs', children: <ScheduleField value={x.schedule} onChange={v => d.set('schedule', v)} disabled={locked} />},
          ]} />}
          danger={isNew ? null : <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Delete “${x.name}”?`, action: 'Delete', body: `Customers stop progressing. Rewards already given stay. ${num(x.reached)} customers reached it.`, onConfirm: () => {remove('milestones', x.id); notify('Milestone deleted'); navigate('/programs/milestones');}})}>Delete</Button>}>
          <Panel title="Goal and steps" description={`Each step: when a customer reaches the number of ${unit}, they get the reward.`} action={<PlanBadge plan="advanced" />}>
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} />
              <Select label="Count" value={x.type} onChange={v => d.set('type', v)} disabled={locked || (!isNew && x.reached > 0)} options={Object.entries(MS_TYPES).map(([v, m]) => ({label: m.name, value: v}))}
                helpText={!isNew && x.reached > 0 ? "Can't change after customers reached it" : undefined} />
            </InlineGrid>
            <RepeatList items={x.steps} onChange={v => d.set('steps', v)} disabled={locked} addLabel="Add step" min={1} max={10}
              make={i => ({at: (Number(x.steps[i - 1]?.at) || 0) + 3, reward: {type: 'points', value: 200}})}
              render={(st, patch, i) => (
                <InlineGrid columns={{xs: 1, sm: '1fr 1.4fr 1fr'}} gap="200" alignItems="end">
                  <NumberField label={`Step ${i + 1}: reach`} value={st.at} onChange={v => patch({at: v})} suffix={unit.split(' ')[0]} disabled={locked} />
                  <Select label="Reward" value={st.reward.type} onChange={v => patch({reward: {...st.reward, type: v, value: v === 'free_product' ? 'Cloud Cream mini' : 10}})} disabled={locked} options={REWARD_TYPES.map(([v, l]) => ({value: v, label: l}))} />
                  {st.reward.type === 'free_product'
                    ? <TextField label="Product" value={String(st.reward.value)} onChange={v => patch({reward: {...st.reward, value: v}})} autoComplete="off" disabled={locked} />
                    : st.reward.type === 'free_shipping' || st.reward.type === 'tree' ? <Badge>No value needed</Badge>
                      : <NumberField label="Value" value={st.reward.value} onChange={v => patch({reward: {...st.reward, value: v}})} disabled={locked} prefix={['amount', 'store_credit'].includes(st.reward.type) ? '$' : undefined} suffix={st.reward.type === 'percent' ? '%' : st.reward.type === 'points' ? db.program.point.plural : undefined} />}
                </InlineGrid>
              )} />
            {d.errors.steps && <Text as="p" tone="critical">{d.errors.steps}</Text>}
            {isNew && (
              <ChoiceList title="Customers who already qualify" selected={[x.grantExisting ? 'yes' : 'no']} onChange={v => d.set('grantExisting', v[0] === 'yes')} disabled={locked}
                choices={[{label: 'Count from today: only new progress counts', value: 'no'}, {label: 'Count past activity too and reward customers who already qualify', value: 'yes', helpText: 'Rewards go out right after you save.'}]} />
            )}
          </Panel>
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}
