// To review (work to do), Activity (history in one filtered list), Companies, and the tools: migration, merge,
// referral whitelist, import history.
import React, {useState} from 'react';
import {
  Avatar, Badge, Banner, BlockStack, Button, Card, ChoiceList, InlineGrid, InlineStack, Modal, Select, Tabs, Text, TextField,
} from '@shopify/polaris';
import {MagicIcon, ImageIcon} from '@shopify/polaris-icons';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, ScreenState, dateLabel, money, num, useConfirm} from '../../ui/kit.jsx';
import {Block, FormCard, Hint, IconTile, ListFilters, Pairs, SimpleTable, matches, realId, sortBy, useScenarioList} from '../../ui/parts.jsx';
import {Missing} from '../../ui/editor.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {HashLink, useNavigate, useRoute} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {pts} from '../../lib/econ.js';

const when = at => new Date(at).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});

/* ---------- To review ---------- */

const QTABS = [['review', 'Reviews'], ['receipt', 'Receipts'], ['google_review', 'Google reviews'], ['form', 'Forms']];

export function ReviewQueue() {
  const {db, set, upsert} = useStore();
  const {notify} = useShell();
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState([]);
  const [detail, setDetail] = useState(null);
  const [ai, setAi] = useState(false);
  const pending = useScenarioList(db.reviewQueue.filter(q => q.status === 'pending'), 'content');
  const kind = QTABS[tab][0];
  const rows = pending.filter(q => q.kind === kind);
  const cust = id => db.customers.find(c => c.id === id);
  const decide = (ids, approve) => {
    const items = db.reviewQueue.filter(q => ids.includes(q.id));
    set(['reviewQueue'], db.reviewQueue.map(q => (ids.includes(q.id) ? {...q, status: approve ? 'approved' : 'rejected'} : q)));
    if (approve) items.forEach(q => {
      const c = cust(q.customerId);
      if (c) upsert('customers', {...c, points: c.points + q.points, updated: '2026-11-18'});
      upsert('activity', {id: newId('ac'), customerId: q.customerId, kind: 'earned', type: q.kind, program: q.program, points: q.points, at: '2026-11-18T14:40'}, {atStart: true});
    });
    setSel([]); setDetail(null);
    notify(approve ? `Approved. ${pts(db, items.reduce((s, q) => s + q.points, 0))} added.` : `Rejected. ${items.length === 1 ? 'The customer gets' : 'Customers get'} an email saying why.`);
  };
  const total = pending.reduce((s, q) => s + q.points, 0);
  return (
    <PageFrame title="To review" backUrl="/customers">
      <SectionNav section="customers" />
      <ScreenState>
        <BlockStack gap="400">
          <p className="pt-note">{pending.length ? `${pending.length} waiting · ${pts(db, total)} in total` : 'Nothing is waiting. Reviews, receipts and forms that need approval show up here.'}</p>
          <Card padding="0">
            <Tabs tabs={QTABS.map(([id, content]) => ({id, content, badge: String(pending.filter(q => q.kind === id).length)}))} selected={tab} onSelect={i => {setTab(i); setSel([]);}} />
            {sel.length > 0 && (
              <div className="op-bulkbar"><Text as="span">{sel.length} selected</Text><InlineStack gap="200"><Button onClick={() => decide(sel, false)}>Reject</Button><Button variant="primary" onClick={() => decide(sel, true)}>Approve</Button></InlineStack></div>
            )}
            {rows.length ? (
              <div className="op-list">
                {rows.map(q => {
                  const c = cust(q.customerId);
                  const id = realId(q.id);
                  return (
                    <div key={q.id} className="op-qrow">
                      <input type="checkbox" className="op-check" aria-label={`Select ${c?.name}`} checked={sel.includes(id)} onChange={e => setSel(e.target.checked ? [...sel, id] : sel.filter(x => x !== id))} />
                      <button type="button" className="op-qrow__main" onClick={() => {setDetail(q); setAi(false);}}>
                        <InlineStack gap="200" blockAlign="center" wrap={false}><Avatar customer size="xs" name={c?.name} /><Text as="span" fontWeight="medium">{c?.name}</Text><Text as="span" variant="bodySm" tone="subdued">{when(q.submitted)}</Text></InlineStack>
                        <span className="op-qrow__content">{q.content}</span>
                        <span className="op-qrow__meta">{q.program}{q.media ? ` · ${q.media} photo` : ''}</span>
                      </button>
                      <div className="op-qrow__side">
                        <Text as="span" fontWeight="semibold" numeric>+{num(q.points)}</Text>
                        <InlineStack gap="100" wrap={false}><Button size="slim" onClick={() => decide([id], false)}>Reject</Button><Button size="slim" variant="primary" onClick={() => decide([id], true)}>Approve</Button></InlineStack>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="op-empty-row"><Text as="p" tone="subdued">No {QTABS[tab][1].toLowerCase()} waiting.</Text></div>}
          </Card>
        </BlockStack>
      </ScreenState>
      {detail && (
        <Modal open onClose={() => setDetail(null)} title={`${QTABS.find(t => t[0] === detail.kind)?.[1].replace(/s$/, '')} from ${cust(detail.customerId)?.name}`}
          primaryAction={{content: `Approve · +${num(detail.points)}`, onAction: () => decide([realId(detail.id)], true)}}
          secondaryActions={[{content: 'Reject', destructive: true, onAction: () => decide([realId(detail.id)], false)}]}>
          <Modal.Section>
            <BlockStack gap="300">
              {detail.media > 0 && <div className="op-mediabox"><IconTile icon={ImageIcon} size="lg" /><Text as="span" tone="subdued">{detail.kind === 'receipt' ? 'receipt-photo.jpg' : 'review-photo.jpg'}</Text></div>}
              <Text as="p">{detail.content}</Text>
              <Pairs rows={[['Program', detail.program], ['Submitted', when(detail.submitted)], ['Gives', pts(db, detail.points)]]} />
              {detail.kind === 'receipt' && (ai ? (
                <div className="op-ai"><InlineStack gap="200" blockAlign="center"><IconTile icon={MagicIcon} size="sm" tone="magic" /><Text as="span" fontWeight="medium">Joy AI read the receipt</Text></InlineStack>
                  <Text as="p">Store: North Bloom Union Square · Date: Nov 17, 2026 · Total: $64.00 (2 items: Cloud Cream, Daily Mist). Not seen before, matches the store address. Looks genuine.</Text></div>
              ) : <InlineStack><Button icon={MagicIcon} onClick={() => setAi(true)}>Ask AI to check this receipt</Button></InlineStack>)}
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </PageFrame>
  );
}

/* ---------- Activity ---------- */

const ATYPES = [['points', 'Points'], ['tier', 'VIP tier'], ['referral', 'Referrals'], ['review', 'Reviews'], ['google_review', 'Google review'], ['receipt', 'Receipts'], ['form', 'Forms'], ['impact', 'Environmental impact'], ['launch', 'Launch tier']];
const typeOf = a => a.type ?? (a.kind === 'tier' ? 'tier' : 'points');

export function ActivityLog() {
  const {db} = useStore();
  const {query} = useRoute();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [types, setTypes] = useState(query.get('type') ? [query.get('type')] : []);
  const [range, setRange] = useState('30');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('at desc');
  const all = useScenarioList(db.activity, 'program');
  const cust = id => db.customers.find(c => c.id === id);
  const cutoff = new Date('2026-11-18T23:59'); cutoff.setDate(cutoff.getDate() - Number(range));
  const rows = sortBy(all.filter(a => (!types.length || types.includes(typeOf(a))) && new Date(a.at) >= cutoff && matches(q, a.program, cust(a.customerId)?.name, cust(a.customerId)?.email)), sort, {points: a => a.points});
  return (
    <PageFrame title="Activity" backUrl="/customers" width="wide" secondaryActions={[{content: 'Export', onAction: () => notify(`We'll email ${rows.length} rows to ${db.shop.email}`)}]}>
      <SectionNav section="customers" />
      <ScreenState>
        <Card padding="0">
          <ListFilters tabs={[{id: 'all', label: 'All activity', count: rows.length}]} selected={0} onSelect={() => {}} query={q} onQuery={setQ} placeholder="Search customer or program"
            sortOptions={[{label: 'Date', value: 'at desc', directionLabel: 'Newest'}, {label: 'Date', value: 'at asc', directionLabel: 'Oldest'}, {label: 'Points', value: 'points desc', directionLabel: 'Most'}, {label: 'Points', value: 'points asc', directionLabel: 'Least'}]}
            sort={sort} onSort={setSort}
            filters={[
              {key: 'type', label: 'Type', shortcut: true, filter: <ChoiceList title="Type" titleHidden allowMultiple choices={ATYPES.map(([value, label]) => ({value, label}))} selected={types} onChange={setTypes} />},
              {key: 'range', label: 'Date', shortcut: true, filter: <ChoiceList title="Date" titleHidden choices={[['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months']].map(([value, label]) => ({value, label}))} selected={[range]} onChange={v => setRange(v[0])} />},
            ]}
            applied={[...(types.length ? [{key: 'type', label: `Type: ${types.map(t => ATYPES.find(x => x[0] === t)?.[1]).join(', ')}`, onRemove: () => setTypes([])}] : []), ...(range !== '30' ? [{key: 'range', label: `Last ${range} days`, onRemove: () => setRange('30')}] : [])]}
            onClearAll={() => {setTypes([]); setRange('30'); setQ('');}} />
          <SimpleTable empty="No activity matches these filters." onRow={a => navigate(`/customers/${a.customerId}`)} rows={rows}
            columns={[
              {key: 'program', label: 'What happened', render: a => <span className="op-cell-gives">{a.program}</span>},
              {key: 'customer', label: 'Customer', render: a => cust(a.customerId)?.name ?? '—'},
              {key: 'type', label: 'Type', render: a => <Text as="span" tone="subdued">{ATYPES.find(t => t[0] === typeOf(a))?.[1] ?? 'Points'}</Text>},
              {key: 'at', label: 'Date', render: a => when(a.at)},
              {key: 'points', label: 'Points', numeric: true, render: a => (a.points ? `${a.points > 0 ? '+' : ''}${num(a.points)}` : '—')},
            ]} />
        </Card>
      </ScreenState>
    </PageFrame>
  );
}

/* ---------- Companies ---------- */

export function Companies() {
  const {db} = useStore();
  const navigate = useNavigate();
  const items = useScenarioList(db.companies);
  if (!db.shop.b2b) return <PageFrame title="Companies" backUrl="/customers"><Banner tone="info">Companies come from Shopify B2B, which is on Shopify Plus.</Banner></PageFrame>;
  return (
    <PageFrame title="Companies" backUrl="/customers">
      <SectionNav section="customers" />
      <ScreenState>
        <Card padding="0">
          {items.length ? <SimpleTable onRow={c => navigate(`/customers/companies/${realId(c.id)}`)} rows={items} columns={[
            {key: 'name', label: 'Company', render: c => <span className="op-cell-name">{c.name}</span>},
            {key: 'tier', label: 'Partner tier', render: c => db.partnerTiers.find(p => p.id === c.partnerTierId)?.name ?? 'None'},
            {key: 'contacts', label: 'Contacts', numeric: true},
            {key: 'orders', label: 'Orders', numeric: true},
            {key: 'spent', label: 'Spent', numeric: true, render: c => money(c.spent)},
          ]} /> : <EmptyCard art="members" heading="No companies yet">Companies you create in Shopify B2B show up here with their partner tier.</EmptyCard>}
        </Card>
      </ScreenState>
    </PageFrame>
  );
}

export function CompanyProfile({id}) {
  const {db, upsert} = useStore();
  const {notify} = useShell();
  const c = db.companies.find(x => x.id === realId(id));
  if (!c) return <Missing title="Company" backUrl="/customers/companies" what="company" />;
  const contacts = [{id: 'k1', name: 'Mai Lee', email: 'mai@inbox.example', role: 'Owner'}, {id: 'k2', name: 'Theo Park', email: 'theo@inbox.example', role: 'Buyer'}].slice(0, Math.max(1, c.contacts));
  return (
    <PageFrame title={c.name} backUrl="/customers/companies">
      <ScreenState>
        <InlineGrid columns={{xs: 1, md: '2fr 1fr'}} gap="400" alignItems="start">
          <BlockStack gap="400">
            <Card><InlineGrid columns={3} gap="300">
              <div className="op-mini"><Text as="span" variant="bodySm" tone="subdued">Orders</Text><span className="op-mini__v">{num(c.orders)}</span></div>
              <div className="op-mini"><Text as="span" variant="bodySm" tone="subdued">Spent</Text><span className="op-mini__v">{money(c.spent)}</span></div>
              <div className="op-mini"><Text as="span" variant="bodySm" tone="subdued">Contacts</Text><span className="op-mini__v">{c.contacts}</span></div>
            </InlineGrid></Card>
            <Block title="Contacts"><Card padding="0"><SimpleTable rows={contacts} columns={[{key: 'name', label: 'Name'}, {key: 'email', label: 'Email'}, {key: 'role', label: 'Role'}]} /></Card></Block>
          </BlockStack>
          <FormCard title="Partner tier" description="Sets this company's wholesale discount and payment terms.">
            <Select label="Partner tier" labelHidden value={c.partnerTierId ?? ''} onChange={v => {upsert('companies', {...c, partnerTierId: v || null}); notify('Partner tier updated');}}
              options={[{label: 'None', value: ''}, ...db.partnerTiers.map(p => ({label: `${p.name} · ${p.discount}% off`, value: p.id}))]} />
            {c.partnerTierId && <HashLink url={`/vip/partners/${c.partnerTierId}`} className="op-link">Open partner tier</HashLink>}
          </FormCard>
        </InlineGrid>
      </ScreenState>
    </PageFrame>
  );
}

/* ---------- Tools ---------- */

const STEPS = ['Source app', 'Upload', 'Choose data', 'Match columns', 'VIP tiers'];
export function Migration() {
  const {notify} = useShell();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({source: 'smile', file: '', fields: ['points', 'tier', 'birthday', 'referral'], tierMode: 'keep'});
  const next = () => {
    if (step === 1 && !f.file) {notify('Upload the export file first', {error: true}); return;}
    if (step === STEPS.length - 1) {notify("Migration started. We'll email you when it's done, usually within an hour."); navigate('/customers/imports'); return;}
    setStep(step + 1);
  };
  return (
    <PageFrame title="Migrate from another app" backUrl="/customers" width="narrow">
      <ScreenState>
        <BlockStack gap="400">
          <ol className="op-stepper">{STEPS.map((s, i) => <li key={s} className={i === step ? 'is-current' : i < step ? 'is-done' : undefined}><span>{i < step ? '✓' : i + 1}</span>{s}</li>)}</ol>
          <FormCard title={STEPS[step]}>
            {step === 0 && <Select label="Moving from" value={f.source} onChange={v => setF({...f, source: v})} options={[['smile', 'Smile.io'], ['yotpo', 'Yotpo Loyalty'], ['loyaltylion', 'LoyaltyLion'], ['rivo', 'Rivo'], ['growave', 'Growave'], ['bon', 'BON Loyalty'], ['csv', 'Another app (CSV)']].map(([value, label]) => ({value, label}))} helpText="We'll show you where to find the export in that app." />}
            {step === 1 && <BlockStack gap="200"><Text as="p">Export your customers from {f.source === 'csv' ? 'your current app' : 'the app'} as a CSV, then upload it here.</Text><InlineStack gap="200" blockAlign="center"><Button onClick={() => setF({...f, file: 'loyalty-export.csv'})}>Upload CSV</Button>{f.file && <Badge tone="success">{f.file} · 4,120 rows</Badge>}</InlineStack></BlockStack>}
            {step === 2 && <ChoiceList allowMultiple title="Bring over" selected={f.fields} onChange={v => setF({...f, fields: v})} choices={[['points', 'Points balances'], ['tier', 'VIP tiers'], ['birthday', 'Birthdays'], ['referral', 'Referral links'], ['history', 'Points history (last 12 months)']].map(([value, label]) => ({value, label}))} />}
            {step === 3 && <div className="op-inset"><SimpleTable columns={[{key: 'a', label: 'Their column'}, {key: 'b', label: 'Joy field'}]} rows={[['email', 'Email'], ['points_balance', 'Points'], ['vip_tier', 'VIP tier'], ['date_of_birth', 'Birthday']].map(([a, b]) => ({id: a, a, b}))} /></div>}
            {step === 4 && <ChoiceList title="VIP tiers" titleHidden selected={[f.tierMode]} onChange={v => setF({...f, tierMode: v[0]})} choices={[{label: 'Keep the tier from the old app', value: 'keep'}, {label: 'Recalculate with my Joy rule', value: 'recalc', helpText: 'Uses orders since your VIP start date.'}]} />}
          </FormCard>
          <InlineStack align="space-between"><Button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button><Button variant="primary" onClick={next}>{step === STEPS.length - 1 ? 'Start migration' : 'Continue'}</Button></InlineStack>
        </BlockStack>
      </ScreenState>
    </PageFrame>
  );
}

export function Merge() {
  const {db, upsert, remove} = useStore();
  const {notify} = useShell();
  const [confirm, modal] = useConfirm();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const ca = db.customers.find(c => c.email === a || c.id === a);
  const cb = db.customers.find(c => c.email === b || c.id === b);
  return (
    <PageFrame title="Merge customers" backUrl="/customers" width="narrow">
      <ScreenState>
        <FormCard title="Merge two loyalty accounts" description="Use when one person has two accounts. Points and history move to the account you keep.">
          <TextField label="Keep this account (email)" value={a} onChange={setA} autoComplete="off" placeholder="ava@inbox.example" error={a && !ca ? 'No customer with this email' : undefined} />
          <TextField label="Merge and remove this account (email)" value={b} onChange={setB} autoComplete="off" placeholder="ava.n@inbox.example" error={b && !cb ? 'No customer with this email' : ca && cb && ca.id === cb.id ? 'Pick two different accounts' : undefined} />
          {ca && cb && ca.id !== cb.id && <Hint>{ca.name} will have {pts(db, ca.points + cb.points)} and both histories. {cb.email} is removed from the program.</Hint>}
          <InlineStack><Button variant="primary" disabled={!ca || !cb || ca.id === cb.id} onClick={() => confirm({title: 'Merge these accounts?', action: 'Merge', body: `${cb.email} is removed and its ${pts(db, cb.points)} move to ${ca.email}. This can't be undone.`, onConfirm: () => {upsert('customers', {...ca, points: ca.points + cb.points}); remove('customers', cb.id); notify('Accounts merged'); setA(''); setB('');}})}>Merge</Button></InlineStack>
        </FormCard>
      </ScreenState>
      {modal}
    </PageFrame>
  );
}

export function Whitelist() {
  const {db, upsert, remove} = useStore();
  const {notify} = useShell();
  const [email, setEmail] = useState('');
  const rows = useScenarioList(db.whitelist, 'reason');
  const cust = id => db.customers.find(c => c.id === id);
  return (
    <PageFrame title="Referral whitelist" backUrl="/customers" width="narrow">
      <ScreenState>
        <BlockStack gap="400">
          <Text as="p" tone="subdued">Customers here skip the referral anti-cheat checks, for example a salon owner who refers clients from the same address.</Text>
          <Card>
            <InlineStack gap="200" blockAlign="end" wrap={false}>
              <div style={{flex: 1}}><TextField label="Add a customer by email" value={email} onChange={setEmail} autoComplete="off" placeholder="name@inbox.example" /></div>
              <Button onClick={() => {const c = db.customers.find(x => x.email === email.trim()); if (!c) {notify('No customer with this email', {error: true}); return;} upsert('whitelist', {id: newId('w'), customerId: c.id, added: '2026-11-18', reason: 'Added by Rosa'}); setEmail(''); notify(`${c.name} added`);}}>Add</Button>
            </InlineStack>
          </Card>
          <Card padding="0">
            <SimpleTable empty="Nobody is whitelisted." rows={rows} columns={[
              {key: 'name', label: 'Customer', render: w => cust(w.customerId)?.name ?? '—'},
              {key: 'reason', label: 'Why'},
              {key: 'added', label: 'Added', render: w => dateLabel(w.added)},
              {key: 'x', label: '', render: w => <Button size="slim" variant="tertiary" tone="critical" onClick={() => {remove('whitelist', realId(w.id)); notify('Removed from the whitelist');}}>Remove</Button>},
            ]} />
          </Card>
        </BlockStack>
      </ScreenState>
    </PageFrame>
  );
}

export function Imports() {
  const {db} = useStore();
  const rows = useScenarioList(db.imports, 'file');
  return (
    <PageFrame title="Import history" backUrl="/customers" width="narrow">
      <ScreenState>
        <Card padding="0"><SimpleTable empty="No imports yet." rows={rows} columns={[
          {key: 'file', label: 'File', render: r => <span className="op-cell-gives">{r.file}</span>}, {key: 'source', label: 'From'},
          {key: 'ok', label: 'Imported', numeric: true, render: r => num(r.ok)}, {key: 'failed', label: 'Failed', numeric: true, render: r => (r.failed ? <span className="op-neg">{num(r.failed)}</span> : '0')},
          {key: 'at', label: 'Date', render: r => dateLabel(r.at)},
        ]} /></Card>
      </ScreenState>
    </PageFrame>
  );
}
