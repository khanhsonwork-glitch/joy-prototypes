import React, {useMemo, useState} from 'react';
import {Banner, BlockStack, Box, Button, Card, Checkbox, DropZone, IndexFilters, IndexTable, InlineStack, Modal, Popover, Select, Text, TextField, useBreakpoints} from '@shopify/polaris';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, ScreenState, Section, dateLabel, money, num, points} from '../../ui/kit.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {CustomerRows, Pager, Question, customerType, parseCsv, progressLabel, tierName, today, stamp} from './common.jsx';

const TYPES = ['All', 'Members', 'Guests', 'Left program', 'B2B'];
const SORT = [
  {label:'Updated newest', value:'updated-desc'}, {label:'Updated oldest', value:'updated-asc'},
  {label:'Points high', value:'points-desc'}, {label:'Points low', value:'points-asc'},
  {label:'Tier progress high', value:'progress-desc'}, {label:'Tier progress low', value:'progress-asc'},
];
const EXPORT_FIELDS = ['First name','Last name','Email','Shopify Customer ID','Points balance','Referrals','Referral link','VIP tier','Birthdate','Date of birth','Tier points','Points expiry date','Phone','Member type','Last updated','Tier updated','Customer since','Country','Lifetime points earned'];
const REQUIRED_EXPORT = EXPORT_FIELDS.slice(0,4);

function AdjustModal({open, onClose, ids}) {
  const {db, upsert} = useStore(); const {notify} = useShell();
  const [amount, setAmount] = useState('0'); const [reason, setReason] = useState('Manual adjustment');
  const [note, setNote] = useState(''); const [tier, setTier] = useState(false);
  const selected = (db.customers ?? []).filter(c => ids.includes(c.id));
  const single = selected.length === 1 ? selected[0] : null;
  const delta = Number(amount);
  const save = () => {
    if (!Number.isInteger(delta) || !delta || Math.abs(delta) > 1000000) {notify('Enter a whole number between -1,000,000 and 1,000,000.', {error:true}); return;}
    if (!reason.trim()) {notify('Enter a reason for the adjustment.', {error:true}); return;}
    selected.forEach(c => upsert('customers', {...c, points:Math.max(0, Number(c.points||0)+delta), tierProgress:tier ? Math.max(0, Number(c.tierProgress||0)+delta) : c.tierProgress, updated:today()}));
    selected.forEach(c => upsert('activity', {id:newId('ac'), customerId:c.id, kind:'adjusted', program:reason, points:delta, note, at:stamp()}));
    notify(`Adjusted points for ${selected.length} customer${selected.length === 1 ? '' : 's'}.`); onClose();
  };
  return <Modal open={open} onClose={onClose} title="Adjust points" primaryAction={{content:'Adjust points', onAction:save}} secondaryActions={[{content:'Cancel', onAction:onClose}]}>
    <Modal.Section><BlockStack gap="300">
      <Text as="p" tone="subdued">Add points with a positive number or remove them with a negative number. Balances cannot go below zero.</Text>
      <TextField label="Adjust points" type="number" value={amount} onChange={setAmount} autoComplete="off" />
      {single && <Banner tone="info">{single.name}: {points(single.points)} → {points(Math.max(0, Number(single.points||0)+(Number.isFinite(delta) ? delta : 0)))}</Banner>}
      {single?.type === 'member' && db.tierSettings?.rule === 'points' && <Checkbox label="Also adjust tier points" checked={tier} onChange={setTier} />}
      <TextField label="Reason for adjustment" value={reason} onChange={setReason} autoComplete="off" />
      <TextField label="Note for customer" value={note} onChange={setNote} multiline={3} autoComplete="off" />
    </BlockStack></Modal.Section>
  </Modal>;
}
export {AdjustModal};

export function CustomersList() {
  const {db, upsert, set} = useStore(); const {notify} = useShell(); const nav = useNavigate();
  const {state} = useScenario(); const {smDown} = useBreakpoints();
  const [tab, setTab] = useState(0), [query, setQuery] = useState(''), [tier, setTier] = useState('all'), [sort, setSort] = useState('updated-desc'), [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]), [columns, setColumns] = useState(['Name','Email','Type','Points','VIP tier','Tier progress','Birthday','Last updated']);
  const [columnOpen, setColumnOpen] = useState(false), [dialog, setDialog] = useState('');
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [member, setMember] = useState('member');
  const [exportEmail, setExportEmail] = useState(db.shop?.email ?? ''), [exportFields, setExportFields] = useState([...REQUIRED_EXPORT,'Points balance','VIP tier']);
  const [file, setFile] = useState(null), [importMap, setImportMap] = useState({name:'name',email:'email',points:'points'});
  const [mode, setMode] = useState('DEFAULT');
  const all = state === 'empty' ? [] : db.customers ?? [];
  const tabs = TYPES.filter(t => t !== 'B2B' || db.shop?.b2b).map((content,i) => ({id:content.toLowerCase().replaceAll(' ','-'), content, index:i}));
  const shown = useMemo(() => {
    const q = query.toLowerCase().trim(); const type = ['all','member','guest','left','b2b'][tab];
    let list = all.filter(c => (type === 'all' || c.type === type) && (tier === 'all' || c.tierId === tier) && (!q || `${c.name} ${c.email}`.toLowerCase().includes(q)));
    const [field,dir] = sort.split('-'); const prop = field === 'progress' ? 'tierProgress' : field === 'points' ? 'points' : 'updated';
    return [...list].sort((a,b) => ((a[prop] ?? 0) > (b[prop] ?? 0) ? 1 : (a[prop] ?? 0) < (b[prop] ?? 0) ? -1 : 0) * (dir === 'asc' ? 1 : -1));
  }, [all, tab, query, tier, sort]);
  const rows = shown.slice(page*10, page*10+10);
  const toggleSelect = id => setSelected(current => current.includes(id) ? current.filter(x => x !== id) : [...current,id]);
  const create = () => {
    if (!email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {notify('Enter a valid customer email.',{error:true}); return;}
    if (!email.endsWith('@example.com')) {notify('Use an @example.com address in this sample shop.',{error:true}); return;}
    if (!name.trim()) {notify('Enter the customer name.',{error:true}); return;}
    if (db.customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {notify('That email already belongs to a customer.',{error:true}); return;}
    const id = newId('c'); upsert('customers',{id,name:name.trim(),email:email.trim(),type:member,tierId:member==='member'?'t-member':null,points:0,tierProgress:0,birthday:'',joined:member==='member'?today():'',orders:0,spent:0,updated:today(),tags:[],notes:[],storeCredit:0,whitelisted:false});
    setDialog(''); notify('Customer added'); nav(`/customers/${id}`);
  };
  const whitelist = () => {selected.forEach(id => {const c = db.customers.find(x=>x.id===id); if(c) upsert('customers',{...c,whitelisted:true,updated:today()});}); notify(`Added ${selected.length} customers to the referral whitelist.`); setSelected([]);};
  const sendExport = () => {if (!exportEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {notify('Enter a valid email for the exported file.',{error:true});return;} setDialog('');notify("We'll email the file");};
  const doImport = async () => {
    if(!file){notify('Choose a CSV file first.',{error:true});return;}
    const {rows}=parseCsv(await file.text());
    const emailField=importMap.email, nameField=importMap.name, pointsField=importMap.points;
    if(!rows.length||!rows[0][emailField]){notify('The CSV needs an email column and at least one customer.',{error:true});return;}
    let count=0;
    rows.forEach(row=>{
      const address=(row[emailField]??'').toLowerCase();
      if(!address.endsWith('@example.com')||db.customers.some(c=>c.email.toLowerCase()===address))return;
      upsert('customers',{id:newId('c'),name:row[nameField]||address.split('@')[0],email:address,type:'member',tierId:'t-member',points:Number(row[pointsField])||0,tierProgress:0,birthday:'',joined:today(),orders:0,spent:0,updated:today(),tags:[],notes:[],storeCredit:0});
      count++;
    });
    if(!count){notify('No new @example.com customers were found in the file.',{error:true});return;}
    set(['customerImportHistory'],[{id:newId('imp'),file:file.name,source:'CSV import',status:'success',imported:count,failed:rows.length-count,at:stamp()},...(db.customerImportHistory??[])]);
    setDialog('');notify(`Imported ${count} customers from ${file.name}.`);
  };
  const availableColumns = ['Name','Email','Type','Points','VIP tier',progressLabel(db.tierSettings?.rule),'Birthday','Tier updated','Last updated'];
  const fieldFor = label => label === progressLabel(db.tierSettings?.rule) ? 'Tier progress' : label;
  const cell = (c,label) => ({Name:c.name,Email:c.email,Type:customerType(c.type),Points:points(c.points),'VIP tier':tierName(db,c.tierId),'Tier progress':db.tierSettings?.rule==='spent'?money(c.tierProgress):num(c.tierProgress),Birthday:dateLabel(c.birthday),'Tier updated':dateLabel(c.tierUpdated),'Last updated':dateLabel(c.updated)})[fieldFor(label)];
  return <PageFrame title="Customers" width="wide" primaryAction={{content:'Add customer',disabled:state==='disabled',onAction:()=>setDialog('add')}} secondaryActions={[{content:'Import',disabled:state==='disabled',onAction:()=>setDialog('import')},{content:'Export',onAction:()=>setDialog('export')},{content:'Migration',onAction:()=>nav('/customers/migration')},{content:'Merge customers',onAction:()=>nav('/customers/merge')},{content:'Referral whitelist',onAction:()=>nav('/customers/whitelist')}]}>
    <ScreenState>{({locked,overflow}) => <BlockStack gap="500">
      <Question>Who are my customers, and is there anything I need to approve?</Question>
      <InlineStack gap="200"><Button url="/customers/review">To review · {num(db.reviewQueue?.filter(x=>x.status==='pending').length ?? 0)}</Button><Button url="/customers/activity">Activity</Button>{db.shop?.b2b && <Button url="/customers/companies">Companies</Button>}</InlineStack>
      <Section title="Customers" description={`${num(shown.length)} customers match your view.`} flush>
        <div className="rv-customers-toolbar"><IndexFilters tabs={tabs} selected={tab} onSelect={value=>{setTab(value);setPage(0);setSelected([])}} queryValue={query} queryPlaceholder="Search name or email" onQueryChange={value=>{setQuery(value);setPage(0)}} onQueryClear={()=>setQuery('')} filters={[{key:'tier',label:'VIP tier',filter:<Select label="VIP tier" labelHidden value={tier} options={[{label:'All tiers',value:'all'},...db.tiers.map(t=>({label:t.name,value:t.id}))]} onChange={value=>{setTier(value);setPage(0)}} /> }]} appliedFilters={tier==='all'?[]:[{key:'tier',label:`VIP tier: ${tierName(db,tier)}`,onRemove:()=>setTier('all')}]} onClearAll={()=>{setTier('all');setQuery('')}} sortOptions={SORT} sortSelected={[sort]} onSort={value=>{setSort(value[0]);setPage(0)}} mode={mode} setMode={setMode} canCreateNewView={false} />
          <div className="rv-customers-tools"><Popover active={columnOpen} onClose={()=>setColumnOpen(false)} activator={<Button onClick={()=>setColumnOpen(!columnOpen)}>Columns</Button>}><Box padding="300"><BlockStack gap="150">{availableColumns.map(label=><Checkbox key={label} label={label} checked={columns.includes(fieldFor(label))} disabled={label==='Name'} onChange={checked=>setColumns(current=>checked?[...current,fieldFor(label)]:current.filter(x=>x!==fieldFor(label)))} />)}</BlockStack></Box></Popover></div>
        </div>
        {selected.length>0 && <div className="rv-customers-bulk"><InlineStack gap="200" blockAlign="center"><Text as="span" variant="bodySm">{selected.length} selected</Text><Button disabled={locked} onClick={()=>setDialog('adjust')}>Adjust points</Button><Button disabled={locked} onClick={whitelist}>Add to referral whitelist</Button><Button onClick={()=>setSelected([])}>Clear</Button></InlineStack></div>}
        {shown.length===0 ? <EmptyCard art="members" heading="No customers found" action={{content:'Add customer',onAction:()=>setDialog('add')}}>Try a different search or add your first customer.</EmptyCard> : smDown ? <CustomerRows items={rows.map((c,i)=>overflow&&i===0?{...c,name:`${c.name} — a very long customer name for the overflow scenario`,points:999999999}:c)} trailing={c=><Checkbox label={`Select ${c.name}`} labelHidden checked={selected.includes(c.id)} onChange={()=>toggleSelect(c.id)} />} /> : <IndexTable resourceName={{singular:'customer',plural:'customers'}} itemCount={rows.length} selectable={false} headings={[{title:'Select'},...availableColumns.filter(label=>columns.includes(fieldFor(label))).map(title=>({title}))]}>{rows.map((raw,i)=>{const c=overflow&&i===0?{...raw,name:`${raw.name} — a very long customer name for the overflow scenario`,points:999999999}:raw;return <IndexTable.Row id={c.id} key={c.id} position={i} onClick={()=>nav(`/customers/${c.id}`)}><IndexTable.Cell><span onClick={e=>e.stopPropagation()}><Checkbox label={`Select ${c.name}`} labelHidden checked={selected.includes(c.id)} onChange={()=>toggleSelect(c.id)} /></span></IndexTable.Cell>{availableColumns.filter(label=>columns.includes(fieldFor(label))).map(label=><IndexTable.Cell key={label}><span className="rv-customers-cell">{cell(c,label)}</span></IndexTable.Cell>)}</IndexTable.Row>})}</IndexTable>}
        <Pager page={page} setPage={setPage} count={shown.length} />
      </Section>
      {tab===4 && db.shop?.b2b && <Banner title="Business customers">Manage their company and partner tier in Companies.</Banner>}
      <AdjustModal open={dialog==='adjust'} onClose={()=>setDialog('')} ids={selected} />
      <Modal open={dialog==='add'} onClose={()=>setDialog('')} title="Add customer" primaryAction={{content:'Add customer',onAction:create}} secondaryActions={[{content:'Cancel',onAction:()=>setDialog('')}]}><Modal.Section><BlockStack gap="300"><TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="off" /><TextField label="Name" value={name} onChange={setName} autoComplete="off" /><Select label="Member status" value={member} options={[{label:'Member',value:'member'},{label:'Guest',value:'guest'},{label:'Left program',value:'left'}]} onChange={setMember} /></BlockStack></Modal.Section></Modal>
      <Modal open={dialog==='export'} onClose={()=>setDialog('')} title="Export customers" primaryAction={{content:'Email export',onAction:sendExport}} secondaryActions={[{content:'Cancel',onAction:()=>setDialog('')}]}><Modal.Section><BlockStack gap="300"><Text as="p" tone="subdued">The file includes customers in your current filtered view.</Text><div className="rv-customers-checkgrid">{EXPORT_FIELDS.map(label=><Checkbox key={label} label={label} checked={exportFields.includes(label)} disabled={REQUIRED_EXPORT.includes(label)} onChange={checked=>setExportFields(current=>checked?[...current,label]:current.filter(x=>x!==label))} />)}</div><TextField label="Send to" type="email" value={exportEmail} onChange={setExportEmail} autoComplete="off" /></BlockStack></Modal.Section></Modal>
      <Modal open={dialog==='import'} onClose={()=>setDialog('')} title="Import customers" primaryAction={{content:'Import CSV',onAction:doImport}} secondaryActions={[{content:'Cancel',onAction:()=>setDialog('')}]}><Modal.Section><BlockStack gap="300"><DropZone type="file" accept=".csv,text/csv" onDrop={files=>setFile(files[0]??null)}><DropZone.FileUpload actionHint="CSV files only" /></DropZone>{file && <Text as="p">{file.name}</Text>}<Text as="p" tone="subdued">Preview how the CSV columns map to customer fields before importing.</Text>{['name','email','points'].map(key=><Select key={key} label={key==='name'?'Customer name':key==='email'?'Email':'Points balance'} value={importMap[key]} options={[{label:'Name',value:'name'},{label:'Email',value:'email'},{label:'Points',value:'points'},{label:'Skip',value:'skip'}]} onChange={value=>setImportMap(current=>({...current,[key]:value}))} />)}</BlockStack></Modal.Section></Modal>
    </BlockStack>}</ScreenState>
  </PageFrame>;
}
