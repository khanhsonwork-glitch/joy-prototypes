// Customer profile: balance and what it can buy first (the question a merchant has when a customer writes in),
// then history; personal and membership facts in the rail. Every edit saves to the store.
import React, {useState} from 'react';
import {
  Avatar, Badge, BlockStack, Button, Card, Checkbox, Divider, InlineGrid, InlineStack, Modal, ProgressBar, Select, Tabs, Text, TextField,
} from '@shopify/polaris';
import {PageFrame} from '../../ui/page.jsx';
import {CCols, CProps, CRow, CSection, CSide} from '../../ui/clean.jsx';
import {NumberField, ScreenState, StatusBadge, dateLabel, money, num} from '../../ui/kit.jsx';
import {FormCard, Pairs, SimpleTable, realId, useCopy} from '../../ui/parts.jsx';
import {Missing} from '../../ui/editor.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {HashLink} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {pts, rewardGives, tierUnit, toMoney} from '../../lib/econ.js';
import {AdjustPointsModal} from './CustomerList.jsx';

const KIND_TONE = {earned: 'success', redeemed: 'info', refunded: 'warning', expired: undefined, adjusted: 'magic', tier: undefined, referral: 'success'};
const KIND_LABEL = {earned: 'Earned', redeemed: 'Redeemed', refunded: 'Refunded', expired: 'Expired', adjusted: 'Adjusted', tier: 'VIP tier', referral: 'Referral'};

function EditInfoModal({open, onClose, c}) {
  const {db, upsert} = useStore();
  const {notify} = useShell();
  const [f, setF] = useState({name: c.name, birthday: c.birthday, instagram: db.profiles?.[c.id]?.instagram ?? '', type: c.type, tierId: c.tierId ?? '', tierProgress: c.tierProgress, joined: c.joined, entryReward: false});
  return (
    <Modal open={open} onClose={onClose} title="Edit customer"
      primaryAction={{content: 'Save', onAction: () => {
        if (!f.name.trim()) {notify('Enter a name', {error: true}); return;}
        upsert('customers', {...c, name: f.name, birthday: f.birthday, type: f.type, tierId: f.type === 'member' ? (f.tierId || 't-member') : null, tierProgress: Number(f.tierProgress) || 0, joined: f.joined, updated: '2026-11-18'});
        notify(f.type !== c.type ? `${f.name} is now ${f.type === 'member' ? 'a member' : f.type === 'left' ? 'out of the program' : 'a guest'}` : 'Customer saved');
        onClose();
      }}} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="300">
          <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
            <TextField label="Name" value={f.name} onChange={v => setF({...f, name: v})} autoComplete="off" />
            <TextField label="Birthday" type="date" value={f.birthday} onChange={v => setF({...f, birthday: v})} autoComplete="off" />
            <TextField label="Instagram username" value={f.instagram} onChange={v => setF({...f, instagram: v})} autoComplete="off" prefix="@" />
            <Select label="Program status" value={f.type} onChange={v => setF({...f, type: v})} options={[{label: 'Member', value: 'member'}, {label: 'Guest', value: 'guest'}, {label: 'Left program', value: 'left'}]} />
            {f.type === 'member' && db.tierSettings.enabled && <Select label="VIP tier" value={f.tierId} onChange={v => setF({...f, tierId: v})} options={db.tiers.map(t => ({label: `${t.name}${t.exclusive ? ' (manual only)' : ''}`, value: t.id}))} />}
            {f.type === 'member' && db.tierSettings.manualTierPoints !== false && <NumberField label="Tier progress" value={f.tierProgress} onChange={v => setF({...f, tierProgress: v})} prefix={db.tierSettings.rule === 'spent' ? '$' : undefined} />}
            {f.type === 'member' && <TextField label="Member since" type="date" value={f.joined} onChange={v => setF({...f, joined: v})} autoComplete="off" />}
          </InlineGrid>
          {f.tierId !== (c.tierId ?? '') && <Checkbox label="Give the new tier's welcome reward" checked={f.entryReward} onChange={v => setF({...f, entryReward: v})} />}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function RedeemModal({open, onClose, c}) {
  const {db, upsert} = useStore();
  const {notify} = useShell();
  const options = db.redeem.filter(r => r.status === 'active');
  const [pick, setPick] = useState(options[0]?.id ?? '');
  const r = options.find(x => x.id === pick);
  const short = r && r.cost > c.points;
  return (
    <Modal open={open} onClose={onClose} title={`Redeem for ${c.name}`}
      primaryAction={{content: 'Redeem', disabled: !r || short, onAction: () => {
        upsert('customers', {...c, points: c.points - r.cost, updated: '2026-11-18'});
        upsert('activity', {id: newId('ac'), customerId: c.id, kind: 'redeemed', type: 'points', program: r.name, points: -r.cost, at: '2026-11-18T14:30'}, {atStart: true});
        notify(`${r.name} redeemed. The code is in ${c.name.split(' ')[0]}'s email.`); onClose();
      }}} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="300">
          <Select label="Reward" value={pick} onChange={setPick} options={options.map(x => ({label: `${x.name} · ${pts(db, x.cost)}`, value: x.id}))} />
          {r && <Text as="p">{rewardGives(r, db)}. Balance {pts(db, c.points)} → {short ? 'not enough' : pts(db, c.points - r.cost)}.</Text>}
          {short && <Text as="p" tone="critical">{c.name.split(' ')[0]} needs {pts(db, r.cost - c.points)} more. Adjust their points first, or pick a cheaper reward.</Text>}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export function Profile({id}) {
  const {db, upsert, set} = useStore();
  const {notify} = useShell();
  const copy = useCopy();
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState(0);
  const [note, setNote] = useState('');
  const [credit, setCredit] = useState('');
  const c = db.customers.find(x => x.id === realId(id));
  if (!c) return <Missing title="Customer" backUrl="/customers" what="customer" />;
  const prof = db.profiles?.[c.id] ?? {credit: 0, coupons: [], referred: 0, referralLink: `northbloom.com/r/${c.name.split(' ')[0].toLowerCase()}`, notes: [], quiz: []};
  const setProf = patch => set(['profiles', c.id], {...prof, ...patch});
  const acts = db.activity.filter(a => a.customerId === c.id);
  const tabs = [['all', 'All'], ['earned', 'Earned'], ['redeemed', 'Redeemed'], ['refunded', 'Refunded'], ['expired', 'Expired']];
  const shownActs = acts.filter(a => tabs[tab][0] === 'all' || a.kind === tabs[tab][0]);
  const sum = kind => acts.filter(a => a.kind === kind).reduce((s, a) => s + Math.abs(a.points), 0);
  const sorted = [...db.tiers].sort((a, b) => a.threshold - b.threshold);
  const tier = db.tiers.find(t => t.id === c.tierId);
  const nextTier = sorted.find(t => t.threshold > c.tierProgress);
  const progress = nextTier ? Math.min(100, (c.tierProgress / nextTier.threshold) * 100) : 100;
  const affordable = db.redeem.filter(r => r.status === 'active' && r.cost <= c.points).length;
  const ms = db.milestones.filter(m => m.status === 'active');
  const when = at => new Date(at).toLocaleString('en-US', {month: 'short', day: 'numeric'});
  return (
    <PageFrame title={c.name} backUrl="/customers" badge={<StatusBadge status={c.type === 'member' ? 'active' : 'inactive'} label={c.type === 'member' ? 'Member' : c.type === 'left' ? 'Left program' : 'Guest'} />}
      primaryAction={{content: 'Adjust points', onAction: () => setModal('adjust')}} secondaryActions={[{content: 'Redeem for customer', onAction: () => setModal('redeem')}]}
      moreActions={[{content: 'Edit customer', onAction: () => setModal('edit')}]}>
      <ScreenState>{({locked}) => (
        <CCols sideFirst={false} side={<>
          <CSide>
            <InlineStack gap="300" blockAlign="center" wrap={false}>
              <Avatar customer size="md" name={c.name} />
              <BlockStack gap="050"><Text as="h2" variant="headingSm">{c.name}</Text><Text as="span" variant="bodySm" tone="subdued">{c.email}</Text></BlockStack>
            </InlineStack>
            <CProps rows={[
              {label: 'Birthday', value: c.birthday ? dateLabel(c.birthday) : 'Not added', onClick: locked ? undefined : () => setModal('edit')},
              {label: 'Instagram', value: prof.instagram || '—', onClick: locked ? undefined : () => setModal('edit')},
              {label: 'Member since', value: c.joined ? dateLabel(c.joined) : '—'},
              {label: 'Orders', value: `${num(c.orders)} · ${money(c.spent)}`},
            ]} />
            <Divider />
            <Text as="h3" variant="headingSm">Tags</Text>
            <InlineStack gap="200">
              {(c.tags ?? []).map(t => <Badge key={t}>{t} <button type="button" className="op-x" aria-label={`Remove tag ${t}`} onClick={() => {upsert('customers', {...c, tags: c.tags.filter(x => x !== t)}); notify('Tag removed');}}>×</button></Badge>)}
              {db.tierSettings.syncTags && tier && <Badge>{`${db.tierSettings.tagPrefix ?? 'Joy'}-${tier.name}`}</Badge>}
            </InlineStack>
            <TagAdder onAdd={t => {upsert('customers', {...c, tags: [...(c.tags ?? []), t]}); notify('Tag added');}} />
            <Divider />
            <Text as="h3" variant="headingSm">Notes</Text>
            {(prof.notes ?? []).map((n, i) => <BlockStack key={i} gap="050"><Text as="p">{n.text}</Text><Text as="span" variant="bodySm" tone="subdued">{n.at}</Text></BlockStack>)}
            <TextField label="Add a note" labelHidden placeholder="Add a note" value={note} onChange={setNote} multiline={2} autoComplete="off" />
            {note.trim() && <InlineStack><Button onClick={() => {setProf({notes: [...(prof.notes ?? []), {at: 'Nov 18, 2026', text: note.trim()}]}); setNote(''); notify('Note added');}}>Add note</Button></InlineStack>}
          </CSide>
          <CSide>
            {db.tierSettings.enabled && c.type === 'member' && <>
              <InlineStack align="space-between" blockAlign="center"><Text as="h3" variant="headingSm">VIP tier</Text>{tier && <span className="op-chip"><i style={{background: tier.color}} />{tier.name}</span>}</InlineStack>
              <ProgressBar progress={progress} size="small" tone="primary" />
              <p className="pt-note">{nextTier ? `${tierUnit(db, nextTier.threshold - c.tierProgress)} more to reach ${nextTier.name}.` : 'Top tier reached.'} <HashLink url={`/vip/tiers/${c.tierId}`} className="op-link">What {tier?.name} gets</HashLink></p>
              <Divider />
            </>}
            <InlineStack align="space-between" blockAlign="center"><Text as="h3" variant="headingSm">Store credit</Text><Text as="span" variant="headingSm">{money(prof.credit)}</Text></InlineStack>
            <NumberField label="Add or remove" prefix="$" value={credit} onChange={setCredit} min={-10000} disabled={locked} />
            {Number(credit) ? <InlineStack><Button disabled={locked} onClick={() => {setProf({credit: Math.max(0, prof.credit + Number(credit))}); notify(`Store credit ${Number(credit) > 0 ? 'added' : 'removed'}`); setCredit('');}}>Apply</Button></InlineStack> : null}
          </CSide>
        </>}>
          <div className="pt-balance">
            <span className="op-balance">{pts(db, c.points)}</span>
            <p className="pt-note">Worth {money(toMoney(db, c.points))}, enough for {affordable} {affordable === 1 ? 'reward' : 'rewards'}.</p>
          </div>
          <CSection title="Activity" extra={
            <div className="pt-switch pt-switch--sm" role="tablist" aria-label="Filter activity">
              {tabs.map(([tid, label], i) => <button key={tid} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'is-on' : undefined} onClick={() => setTab(i)}>{label}</button>)}
            </div>}>
            {shownActs.length ? shownActs.map(a => (
              <CRow key={a.id} name={a.program} value={`${when(a.at)} · ${a.points ? `${a.points > 0 ? '+' : ''}${num(a.points)}` : KIND_LABEL[a.kind] ?? a.kind}`} />
            )) : <p className="pt-empty">No {tabs[tab][1].toLowerCase()} activity yet.</p>}
          </CSection>
          <CSection title="Coupons">
            {prof.coupons?.length ? prof.coupons.map(x => <CRow key={x.code} name={x.reward} tag={x.status === 'Used' ? 'Used' : undefined} value={x.code} />)
              : <p className="pt-empty">Codes appear here when {c.name.split(' ')[0]} redeems points.</p>}
          </CSection>
          <CSection title="Referrals">
            <CRow name="Referral link" value={prof.referralLink} trailing={<Button size="slim" onClick={() => copy(`https://${prof.referralLink}`)}>Copy</Button>} />
            <CRow name="Friends referred" value={num(prof.referred)} />
          </CSection>
          {ms.length > 0 && (
            <CSection title="Milestones">
              {ms.map(m => {
                const step = m.steps[0];
                const have = m.type === 'orders' ? c.orders : m.type === 'spent' ? c.spent : 2;
                return <CRow key={m.id} name={m.name} value={`${num(Math.min(have, step.at))} / ${num(step.at)}`} />;
              })}
            </CSection>
          )}
          {prof.quiz?.length > 0 && (
            <CSection title="Quiz answers">
              {prof.quiz.map(([q, ans]) => <CRow key={q} name={q} value={ans} />)}
            </CSection>
          )}
        </CCols>
      )}</ScreenState>
      {modal === 'adjust' && <AdjustPointsModal open onClose={() => setModal(null)} customers={[c]} />}
      {modal === 'edit' && <EditInfoModal open onClose={() => setModal(null)} c={c} />}
      {modal === 'redeem' && <RedeemModal open onClose={() => setModal(null)} c={c} />}
    </PageFrame>
  );
}

function TagAdder({onAdd}) {
  const [v, setV] = useState('');
  return (
    <InlineStack gap="200" blockAlign="end" wrap={false}>
      <div style={{flex: 1}}><TextField label="Add tag" labelHidden placeholder="Add a tag" value={v} onChange={setV} autoComplete="off" /></div>
      <Button disabled={!v.trim()} onClick={() => {onAdd(v.trim()); setV('');}}>Add</Button>
    </InlineStack>
  );
}
