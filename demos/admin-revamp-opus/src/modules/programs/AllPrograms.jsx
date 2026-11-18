// All programs: the one table a merchant never had — every way to earn, reward, referral, milestone, quiz, VIP perk,
// member deal and paid plan, with who gets it. The "See it as" lens answers the real question behind the page:
// "what does a Gold customer actually get from me?"
import React, {useMemo, useState} from 'react';
import {Badge, BlockStack, Button, ChoiceList, InlineStack, Text, TextField} from '@shopify/polaris';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, ScreenState, dateLabel, money, num, pct, useConfirm} from '../../ui/kit.jsx';
import {CCols, CPage, CProps, CRow, CSearch, CSection, CSide} from '../../ui/clean.jsx';
import {TypePicker, matches, useScenarioList} from '../../ui/parts.jsx';
import {useStore} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {KINDS, allPrograms, milestoneShort, reaches} from '../../lib/allPrograms.js';
import {baseRate, earnGives, giveBack, pts} from '../../lib/econ.js';
import {REDEEM_META, earnMeta} from './points/meta.js';
import {useEarnPicker, useRewardPicker} from './points/PointsPage.jsx';
import {
  ChatReferralIcon, FlagIcon, QuestionCircleIcon, StarIcon, DiscountIcon, CreditCardIcon,
} from '@shopify/polaris-icons';

const KIND_ICON = {referral: ChatReferralIcon, milestone: FlagIcon, quiz: QuestionCircleIcon, perk: StarIcon, deal: DiscountIcon, paid: CreditCardIcon};
const rowIcon = r => (r.kind === 'earn' ? earnMeta(r.type).icon : r.kind === 'reward' ? REDEEM_META[r.type]?.icon : KIND_ICON[r.kind]);

function ProgramStatus() {
  const {db, merge} = useStore();
  const {notify} = useShell();
  const [confirm, modal] = useConfirm();
  const [email, setEmail] = useState('');
  const st = db.program.status;
  const go = (status, msg) => {merge(['program'], {status}); notify(msg);};
  const copy = {
    live: {dot: '', label: 'Live', text: `Customers earn and redeem now. Live since ${dateLabel(db.program.launchedAt)}.`},
    sandbox: {dot: 'is-info', label: 'Sandbox', text: 'Only test customers can earn and redeem.'},
    paused: {dot: 'is-warn', label: 'Paused', text: 'Nobody earns or redeems. Balances are kept.'},
  }[st];
  const sandbox = () => confirm({title: 'Switch to sandbox?', destructive: false, action: 'Switch to sandbox', body: 'Only your test customers will earn and redeem. Other customers keep their balances but stop earning until you go live again.', onConfirm: () => go('sandbox', 'Program is in sandbox')});
  const pause = () => confirm({title: 'Pause the program?', action: 'Pause', body: `${num(db.stats.last30.members)} members stop earning and can't redeem. Their balances are kept. The widget is hidden from your store.`, onConfirm: () => go('paused', 'Program paused')});
  const live = () => confirm({title: 'Go live?', destructive: false, action: 'Go live', body: 'Every customer can earn and redeem from now on, and the widget shows on your store.', onConfirm: () => go('live', 'Your program is live')});
  return (
    <CSide>
      <span className="pt-status"><span className={`pt-status__dot ${copy.dot}`} />{copy.label}</span>
      <p className="pt-note">{copy.text}</p>
      {st !== 'live' && <Button variant="primary" onClick={live}>Go live</Button>}
      {st === 'sandbox' && (
        <BlockStack gap="200">
          <Text as="h3" variant="headingXs">Test customers</Text>
          <InlineStack gap="200">
            {db.program.testCustomers.map(c => (
              <Badge key={c}>{c} <button type="button" className="op-x" aria-label={`Remove ${c}`} onClick={() => {merge(['program'], {testCustomers: db.program.testCustomers.filter(x => x !== c)}); notify('Test customer removed');}}>×</button></Badge>
            ))}
          </InlineStack>
          <TextField label="Add a test customer" value={email} onChange={setEmail} placeholder="name@inbox.example" autoComplete="off"
            connectedRight={<Button onClick={() => {if (!/@/.test(email)) {notify('Enter an email address', {error: true}); return;} merge(['program'], {testCustomers: [...db.program.testCustomers, email]}); setEmail(''); notify('Test customer added');}}>Add</Button>} />
        </BlockStack>
      )}
      <CProps rows={[
        {label: 'Point value', value: `${pts(db, db.program.point.value.points)} = ${money(db.program.point.value.money)}`, url: '/programs/points/settings'},
        st !== 'sandbox' && {label: 'Test in sandbox', value: '', onClick: sandbox},
        st === 'live' && {label: 'Pause program', value: '', onClick: pause},
      ]} />
      {modal}
    </CSide>
  );
}

function Lens({lens, setLens}) {
  const {db} = useStore();
  const options = [{id: 'all', label: 'Everything'}, {id: 'members', label: 'Any member'}, ...(db.tierSettings.enabled ? db.tiers.map(t => ({id: t.id, label: t.name, color: t.color})) : [])];
  const tier = db.tiers.find(t => t.id === lens);
  const rows = allPrograms(db).filter(r => (r.on || r.kind === 'perk') && reaches(r, lens));
  const count = k => rows.filter(r => r.kind === k).length;
  const rate = baseRate(db) * (tier?.multiplier ?? 1);
  return (
    <CSide title="See it as">
      <ChoiceList title="See programs as" titleHidden selected={[lens]} onChange={v => setLens(v[0])}
        choices={options.map(o => ({value: o.id, label: o.label}))} />
      {lens !== 'all' && (
        <p className="pt-note" aria-live="polite">
          {tier ? `A ${tier.name} member` : 'A member'} earns <b>{pts(db, +rate.toFixed(2))} per $1</b> ({pct(giveBack(db, rate)).replace('.0%', '%')} back) and can choose from <b>{count('reward')} rewards</b>
          {count('perk') ? <>, gets <b>{count('perk')} tier perks</b></> : null}{count('deal') ? <> and <b>{count('deal')} member {count('deal') === 1 ? 'deal' : 'deals'}</b></> : null}.
        </p>
      )}
    </CSide>
  );
}

/** The one grey value of a row: what it gives (earn), what it costs (reward), the short form for the rest. */
function shortValue(r, db) {
  if (r.kind === 'earn') return earnGives(r.item, db).replace(' spent', '');
  if (r.kind === 'reward') return pts(db, r.item.cost);
  if (r.kind === 'referral') return r.gives.replace('Friend gets ', '').replace(', referrer gets ', ' · ');
  if (r.kind === 'milestone') return milestoneShort(r.item, db);
  if (r.kind === 'perk') return db.tiers.find(t => t.id === r.tierId)?.name ?? 'Tier';
  if (r.kind === 'deal') return r.gives.split(' · ')[0];
  if (r.kind === 'paid') return `${money(r.item.price)}/${r.item.interval}`;
  return r.gives;
}

function useCreate() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openEarn, earnModal] = useEarnPicker();
  const [openReward, rewardModal] = useRewardPicker();
  const options = [
    {id: 'earn', name: 'Way to earn', desc: 'Points for orders, sign-ups, reviews, social follows and 30 more', icon: earnMeta('place_order').icon},
    {id: 'reward', name: 'Reward', desc: 'Discounts, free products, free shipping, store credit, gift cards', icon: REDEEM_META.amount.icon},
    {id: 'milestone', name: 'Milestone', desc: 'A bonus when customers reach a goal, like 5 orders', icon: FlagIcon, plan: 'advanced'},
    {id: 'quiz', name: 'Quiz', desc: 'Ask a few questions, recommend products, give a reward', icon: QuestionCircleIcon},
    {id: 'referral', name: 'Referral', desc: 'Reward customers who bring friends. One per shop', icon: ChatReferralIcon},
    {id: 'deal', name: 'Member deal', desc: 'A members-only price for a limited time', icon: DiscountIcon},
    {id: 'tier', name: 'VIP tier', desc: 'A level customers reach by spending more', icon: StarIcon},
    {id: 'paid', name: 'Paid membership', desc: 'Customers pay monthly for extra perks', icon: CreditCardIcon},
  ];
  const pick = id => {
    setOpen(false);
    if (id === 'earn') openEarn();
    else if (id === 'reward') openReward();
    else navigate({milestone: '/programs/milestones?create=1', quiz: '/programs/quizzes?create=1', referral: '/programs/referrals', deal: '/vip/deals/new', tier: '/vip/tiers/new', paid: '/vip/paid/new'}[id]);
  };
  const modal = <>
    <TypePicker open={open} onClose={() => setOpen(false)} title="Create a program" options={options} onPick={pick} intro="What do you want to add? You can turn it off any time." />
    {earnModal}{rewardModal}
  </>;
  return [() => setOpen(true), modal, {earn: openEarn, reward: openReward}];
}

export function AllPrograms() {
  const {db} = useStore();
  const navigate = useNavigate();
  const [create, createModal, adders] = useCreate();
  const [lens, setLens] = useState('all');
  const [q, setQ] = useState('');
  const base = useMemo(() => allPrograms(db), [db]);
  const rows = useScenarioList(base);
  const shown = rows.filter(r => reaches(r, lens) && matches(q, r.name, r.gives, r.whoLabel));
  const add = {earn: ['Way to earn', adders.earn], reward: ['Reward', adders.reward], milestone: ['Milestone', () => navigate('/programs/milestones?create=1')],
    quiz: ['Quiz', () => navigate('/programs/quizzes?create=1')], deal: ['Deal', () => navigate('/vip/deals/new')], paid: ['Plan', () => navigate('/vip/paid/new')]};
  const sections = rows.length ? KINDS.map(k => ({k, items: shown.filter(r => r.kind === k.id)})).filter(({k, items}) => items.length || (!q && ['earn', 'reward'].includes(k.id))) : [];
  return (
    <PageFrame title="Programs" moreActions={[{content: 'Create program', onAction: create}]}>
      <ScreenState>
        {({locked}) => (
          <CPage>
            <SectionNav section="programs" bare />
            <CCols sideFirst={false} side={<><ProgramStatus /><Lens lens={lens} setLens={setLens} /></>}>
              <CSearch value={q} onChange={setQ} placeholder="Search programs, rewards and perks" label="Search programs" />
              {!rows.length && <EmptyCard art="rewards" heading="No programs yet" action={{content: 'Create program', onAction: create}}>Start with points for orders and one reward.</EmptyCard>}
              {rows.length > 0 && !sections.length && <p className="pt-note">No programs match “{q}”. Clear the search to see everything.</p>}
              {sections.map(({k, items}) => (
                <CSection key={k.id} title={k.label} add={add[k.id]?.[0]} onAdd={add[k.id]?.[1]} locked={locked}>
                  {items.length ? items.map(r => (
                    <CRow key={r.id} icon={rowIcon(r)} name={r.name} value={shortValue(r, db)} off={r.kind !== 'perk' && !r.on} url={r.url.replace(/~\d+$/, '')} />
                  )) : <p className="pt-empty">Nothing here yet.</p>}
                </CSection>
              ))}
            </CCols>
          </CPage>
        )}
      </ScreenState>
      {createModal}
    </PageFrame>
  );
}
