// Customers: who is in the program. A Shopify-style index (tabs, search, filter, sort, columns, pages) with the
// two jobs merchants do here most: adjust points for one or many people, and find someone to look at.
import React, {useMemo, useState} from 'react';
import {
  Avatar, Badge, BlockStack, Button, Card, Checkbox, ChoiceList, DropZone, IndexTable, InlineGrid, InlineStack, Modal,
  Pagination, Popover, Select, Text, TextField, useBreakpoints, useIndexResourceState,
} from '@shopify/polaris';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {CPage, CRow} from '../../ui/clean.jsx';
import {ClockIcon} from '@shopify/polaris-icons';
import {PageFrame} from '../../ui/page.jsx';
import {NumberField, ScreenState, dateLabel, money, num} from '../../ui/kit.jsx';
import {ListFilters, matches, sortBy, useScenarioList, SimpleTable} from '../../ui/parts.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {pts, tierUnit} from '../../lib/econ.js';

const TYPE_LABEL = {member: 'Member', guest: 'Guest', left: 'Left program'};
const COLS = [
  ['email', 'Email'], ['type', 'Type'], ['points', 'Points'], ['tier', 'VIP tier'], ['progress', 'Tier progress'], ['birthday', 'Birthday'], ['tierUpdated', 'Tier updated'], ['updated', 'Last updated'],
];

/** Adjust points for one or many customers, with the old → new balance shown before saving. */
export function AdjustPointsModal({open, onClose, customers}) {
  const {db, upsert} = useStore();
  const {notify} = useShell();
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState('Adjusted by Rosa');
  const [note, setNote] = useState('');
  const [tierToo, setTierToo] = useState(false);
  const one = customers.length === 1 ? customers[0] : null;
  const next = one ? Math.max(0, one.points + (Number(amount) || 0)) : null;
  const save = () => {
    if (!Number(amount)) {notify('Enter a number of points, like 100 or -50', {error: true}); return;}
    customers.forEach(c => upsert('customers', {...c, points: Math.max(0, c.points + Number(amount)), tierProgress: tierToo ? c.tierProgress + Number(amount) : c.tierProgress, updated: '2026-11-18'}));
    customers.forEach(c => upsert('activity', {id: newId('ac'), customerId: c.id, kind: 'adjusted', type: 'points', program: reason || 'Adjusted by admin', points: Number(amount), at: '2026-11-18T14:20'}, {atStart: true}));
    notify(`${Number(amount) > 0 ? 'Added' : 'Removed'} ${pts(db, Math.abs(amount))} for ${customers.length === 1 ? one.name : `${customers.length} customers`}`);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={one ? `Adjust points for ${one.name}` : `Adjust points for ${customers.length} customers`}
      primaryAction={{content: 'Save', onAction: save}} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="300">
          <NumberField label="Points to add or remove" value={amount} onChange={setAmount} min={-100000} helpText="Use a minus sign to remove, like -50" />
          {one && <Text as="p">Balance: <b>{pts(db, one.points)}</b> → <b>{pts(db, next)}</b></Text>}
          <TextField label="Reason (only you see this)" value={reason} onChange={setReason} autoComplete="off" />
          <TextField label="Note for the customer (optional)" value={note} onChange={setNote} autoComplete="off" helpText="Shown in their activity history and the points email." />
          {one && db.tierSettings.enabled && db.tierSettings.rule === 'points' && <Checkbox label="Also change their tier progress" checked={tierToo} onChange={setTierToo} />}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function AddCustomerModal({open, onClose}) {
  const {upsert} = useStore();
  const {notify} = useShell();
  const navigate = useNavigate();
  const [f, setF] = useState({name: '', email: '', type: 'member'});
  const err = f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email) ? 'Enter an email like name@inbox.example' : null;
  return (
    <Modal open={open} onClose={onClose} title="Add customer"
      primaryAction={{content: 'Add customer', disabled: !f.email || Boolean(err), onAction: () => {
        const id = newId('c');
        upsert('customers', {id, name: f.name || f.email.split('@')[0], email: f.email, type: f.type, tierId: f.type === 'member' ? 't-member' : null, points: 0, tierProgress: 0, birthday: '', joined: f.type === 'member' ? '2026-11-18' : '', orders: 0, spent: 0, updated: '2026-11-18', tags: []}, {atStart: true});
        notify('Customer added'); onClose(); navigate(`/customers/${id}`);
      }}} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="300">
          <TextField label="Email" value={f.email} onChange={v => setF({...f, email: v})} autoComplete="off" error={err} />
          <TextField label="Name" value={f.name} onChange={v => setF({...f, name: v})} autoComplete="off" />
          <Select label="Status" value={f.type} onChange={v => setF({...f, type: v})} options={[{label: 'Member', value: 'member'}, {label: 'Guest (not in the program yet)', value: 'guest'}]} />
          <Text as="p" variant="bodySm" tone="subdued">The customer is also created in Shopify if they don't exist yet.</Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function ImportModal({open, onClose}) {
  const {notify} = useShell();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const map = [['Email', 'email'], ['First name', 'first_name'], ['Points balance', 'points'], ['VIP tier', 'tier'], ['Birthday', 'birthday']];
  return (
    <Modal open={open} onClose={() => {setFile(null); onClose();}} title="Import customers"
      primaryAction={{content: 'Import', disabled: !file, onAction: () => {notify("Import started. We'll email you when it's done."); setFile(null); onClose();}}}
      secondaryActions={[{content: 'Import history', onAction: () => {onClose(); navigate('/customers/imports');}}, {content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p">Upload a CSV with one customer per row. Existing customers are matched by email; their points are replaced.</Text>
          <DropZone accept=".csv,text/csv" type="file" allowMultiple={false} onDrop={(_, accepted) => setFile(accepted[0] ?? {name: 'customers.csv'})} label="CSV file">
            {file ? <BlockStack inlineAlign="center"><Text as="p" fontWeight="medium">{file.name}</Text></BlockStack> : <DropZone.FileUpload actionHint="or drop a .csv file" />}
          </DropZone>
          <Button variant="plain" onClick={() => setFile({name: 'sample-customers.csv'})}>Use the sample file</Button>
          {file && (
            <BlockStack gap="200">
              <Text as="h3" variant="headingXs">Columns we found</Text>
              <div className="op-inset"><SimpleTable columns={[{key: 'col', label: 'Column in your file'}, {key: 'to', label: 'Goes to'}]} rows={map.map(([col, to]) => ({id: col, col, to: <Select label={`${col} goes to`} labelHidden value={to} onChange={() => {}} options={[{label: 'Email', value: 'email'}, {label: 'First name', value: 'first_name'}, {label: 'Points balance', value: 'points'}, {label: 'VIP tier', value: 'tier'}, {label: 'Birthday', value: 'birthday'}, {label: "Don't import", value: 'skip'}]} />}))} /></div>
              <Text as="p" variant="bodySm" tone="subdued">4,120 rows · preview of the first row: ava@inbox.example · Ava · 1,240 · Gold · 1994-03-12</Text>
            </BlockStack>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

function ExportModal({open, onClose, count}) {
  const {db} = useStore();
  const {notify} = useShell();
  const [fields, setFields] = useState(['points', 'referrals', 'tier']);
  const [email, setEmail] = useState(db.shop.email);
  return (
    <Modal open={open} onClose={onClose} title={`Export ${num(count)} customers`}
      primaryAction={{content: 'Export', disabled: !count, onAction: () => {notify(`We'll email the file to ${email}`); onClose();}}} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="300">
          <Text as="p" tone="subdued">Always included: first name, last name, email, Shopify customer ID. Exports the customers that match your current filters.</Text>
          <ChoiceList allowMultiple title="Also include" selected={fields} onChange={setFields}
            choices={[['points', 'Points balance'], ['referrals', 'Referrals'], ['link', 'Referral link'], ['tier', 'VIP tier'], ['birthday', 'Birthday'], ['tierPoints', 'Tier progress'], ['expiry', 'Points expiry date'], ['phone', 'Phone'], ['type', 'Member type'], ['updated', 'Last updated'], ['since', 'Customer since'], ['country', 'Country'], ['lifetime', 'Lifetime points earned']].map(([value, label]) => ({value, label}))} />
          <TextField label="Send the file to" value={email} onChange={setEmail} autoComplete="email" />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export function CustomerList() {
  const {db, upsert} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const {smDown} = useBreakpoints();
  const all = useScenarioList(db.customers);
  const tabs = [['all', 'All'], ['member', 'Members'], ['guest', 'Guests'], ['left', 'Left program'], ...(db.shop.b2b ? [['b2b', 'B2B']] : [])];
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('updated desc');
  const [tierFilter, setTierFilter] = useState([]);
  const [page, setPage] = useState(0);
  const [cols, setCols] = useState(['email', 'points', 'tier', 'updated']);
  const [colsOpen, setColsOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const kind = tabs[tab][0];
  const isB2b = c => (c.tags ?? []).includes('wholesale');
  const filtered = sortBy(all.filter(c => (kind === 'all' || (kind === 'b2b' ? isB2b(c) : c.type === kind)) && (!tierFilter.length || tierFilter.includes(c.tierId)) && matches(q, c.name, c.email)), sort, {progress: c => c.tierProgress});
  const per = 10;
  const pages = Math.max(1, Math.ceil(filtered.length / per));
  const shown = filtered.slice(page * per, page * per + per);
  const {selectedResources, allResourcesSelected, handleSelectionChange, clearSelection} = useIndexResourceState(shown);
  const selected = db.customers.filter(c => selectedResources.map(id => id.split('~')[0]).includes(c.id));
  const tier = id => db.tiers.find(t => t.id === id);
  const progressLabel = db.tierSettings.rule === 'points' ? 'Tier points' : db.tierSettings.rule === 'orders' ? 'Tier orders' : 'Tier spend';
  const headings = [{title: 'Customer'}, ...COLS.filter(([k]) => cols.includes(k)).map(([k, l]) => ({title: k === 'progress' ? progressLabel : l, alignment: ['points', 'progress'].includes(k) ? 'end' : undefined}))];
  const cell = (c, k) => {
    switch (k) {
      case 'email': return <Text as="span" tone="subdued">{c.email}</Text>;
      case 'type': return <Text as="span" tone="subdued">{TYPE_LABEL[c.type]}</Text>;
      case 'points': return <Text as="span" numeric alignment="end">{num(c.points)}</Text>;
      case 'tier': return tier(c.tierId) ? <span className="op-chip"><i style={{background: tier(c.tierId).color}} />{tier(c.tierId).name}</span> : <Text as="span" tone="subdued">—</Text>;
      case 'progress': return <Text as="span" numeric alignment="end">{c.tierId ? tierUnit(db, c.tierProgress) : '—'}</Text>;
      case 'birthday': return c.birthday ? dateLabel(c.birthday) : '—';
      case 'tierUpdated': return c.tierId ? dateLabel(c.tierUpdated ?? c.updated) : '—';
      case 'updated': return dateLabel(c.updated);
      default: return null;
    }
  };
  return (
    <PageFrame title="Customers" width="wide" primaryAction={{content: 'Add customer', onAction: () => setModal('add')}}
      secondaryActions={[{content: 'Import', onAction: () => setModal('import')}]}
      moreActions={[{content: 'Export', onAction: () => setModal('export')}, {content: 'Migrate from another app', url: '/customers/migration'}, {content: 'Merge customers', url: '/customers/merge'}, {content: 'Referral whitelist', url: '/customers/whitelist'}, {content: 'Import history', url: '/customers/imports'}]}>
      <ScreenState>
        <CPage>
          <SectionNav section="customers" bare />
          {db.reviewQueue.filter(r => r.status === 'pending').length > 0 && (
            <div className="pt-card"><CRow icon={ClockIcon} name={`${db.reviewQueue.filter(r => r.status === 'pending').length} submissions waiting for your approval`} value="Review" url="/customers/review" /></div>
          )}
          <Card padding="0">
            <ListFilters tabs={tabs.map(([id, label]) => ({id, label, count: id === 'all' ? all.length : id === 'b2b' ? all.filter(isB2b).length : all.filter(c => c.type === id).length}))}
              selected={tab} onSelect={i => {setTab(i); setPage(0); clearSelection();}} query={q} onQuery={v => {setQ(v); setPage(0);}} placeholder="Search by name or email"
              sortOptions={[
                {label: 'Last updated', value: 'updated desc', directionLabel: 'Newest'}, {label: 'Last updated', value: 'updated asc', directionLabel: 'Oldest'},
                {label: 'Points', value: 'points desc', directionLabel: 'Highest'}, {label: 'Points', value: 'points asc', directionLabel: 'Lowest'},
                {label: progressLabel, value: 'progress desc', directionLabel: 'Highest'}, {label: progressLabel, value: 'progress asc', directionLabel: 'Lowest'},
              ]} sort={sort} onSort={setSort}
              filters={db.tierSettings.enabled ? [{key: 'tier', label: 'VIP tier', shortcut: true, filter: <ChoiceList title="VIP tier" titleHidden allowMultiple choices={db.tiers.map(t => ({label: t.name, value: t.id}))} selected={tierFilter} onChange={v => {setTierFilter(v); setPage(0);}} />}] : []}
              applied={tierFilter.length ? [{key: 'tier', label: `VIP tier: ${tierFilter.map(id => tier(id)?.name).join(', ')}`, onRemove: () => setTierFilter([])}] : []}
              onClearAll={() => {setTierFilter([]); setQ('');}} />
            <div className="op-tabletools">
              <Text as="span" variant="bodySm" tone="subdued">{num(filtered.length)} customers</Text>
              <Popover active={colsOpen} onClose={() => setColsOpen(false)} preferredAlignment="right" activator={<Button size="slim" variant="tertiary" onClick={() => setColsOpen(v => !v)} disclosure>Columns</Button>}>
                <Popover.Section><ChoiceList allowMultiple title="Show columns" choices={COLS.map(([value, label]) => ({value, label: value === 'progress' ? progressLabel : label}))} selected={cols} onChange={setCols} /></Popover.Section>
              </Popover>
            </div>
            <IndexTable condensed={smDown} resourceName={{singular: 'customer', plural: 'customers'}} itemCount={shown.length} headings={headings}
              selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length} onSelectionChange={handleSelectionChange}
              promotedBulkActions={[{content: 'Adjust points', onAction: () => setModal('adjust')}, {content: 'Add to referral whitelist', onAction: () => {
                selected.forEach(c => upsert('whitelist', {id: newId('w'), customerId: c.id, added: '2026-11-18', reason: 'Added from Customers'}));
                notify(`${selected.length} added to the referral whitelist`); clearSelection();
              }}]}
              emptyState={<div className="op-empty-row"><Text as="p" tone="subdued">{all.length ? 'No customers match. Try another search or tab.' : 'No customers yet. They appear here when they sign up or order.'}</Text>{!all.length && <Button onClick={() => setModal('import')}>Import customers</Button>}</div>}>
              {shown.map((c, i) => (
                <IndexTable.Row id={c.id} key={c.id} position={i} selected={selectedResources.includes(c.id)} onClick={() => navigate(`/customers/${c.id.split('~')[0]}`)}>
                  {smDown ? (
                    <div className="op-condensed-row">
                      <div className="op-condensed">
                        <Avatar customer size="sm" name={c.name} initials={c.name.split(' ').map(x => x[0]).join('').slice(0, 2)} />
                        <div className="op-condensed__main">
                          <Text as="span" fontWeight="medium" truncate>{c.name}</Text>
                          <Text as="span" variant="bodySm" tone="subdued" truncate>{c.email}</Text>
                        </div>
                        <BlockStack inlineAlign="end" gap="050"><Text as="span" numeric fontWeight="medium">{num(c.points)}</Text>{tier(c.tierId) && <Text as="span" variant="bodySm" tone="subdued">{tier(c.tierId).name}</Text>}</BlockStack>
                      </div>
                    </div>
                  ) : <>
                    <IndexTable.Cell><InlineStack gap="200" blockAlign="center" wrap={false}><Avatar customer size="xs" name={c.name} /><span className="op-cell-name"><Text as="span" fontWeight="medium">{c.name}</Text></span></InlineStack></IndexTable.Cell>
                    {COLS.filter(([k]) => cols.includes(k)).map(([k]) => <IndexTable.Cell key={k}>{cell(c, k)}</IndexTable.Cell>)}
                  </>}
                </IndexTable.Row>
              ))}
            </IndexTable>
            {pages > 1 && <div className="op-pager"><Pagination hasPrevious={page > 0} onPrevious={() => setPage(page - 1)} hasNext={page < pages - 1} onNext={() => setPage(page + 1)} label={`Page ${page + 1} of ${pages}`} /></div>}
          </Card>
        </CPage>
      </ScreenState>
      <AddCustomerModal open={modal === 'add'} onClose={() => setModal(null)} />
      <ImportModal open={modal === 'import'} onClose={() => setModal(null)} />
      <ExportModal open={modal === 'export'} onClose={() => setModal(null)} count={filtered.length} />
      {modal === 'adjust' && <AdjustPointsModal open onClose={() => {setModal(null); clearSelection();}} customers={selected} />}
    </PageFrame>
  );
}
