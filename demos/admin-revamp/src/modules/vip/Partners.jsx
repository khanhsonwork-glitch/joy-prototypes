import React, {useMemo, useState} from 'react';
import {Banner, BlockStack, Button, Checkbox, ChoiceList, IndexFilters, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {useStore,newId} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {Section, StatusBadge, EmptyCard, useConfirm, num, money} from '../../ui/kit.jsx';
import {Question, EditorGrid, Rail, Row, DeleteButton, NotFound, choices, useVipState, useVipDraft} from './common.jsx';

const privilegeTypes=choices([['discount_amount','Discount amount'],['discount_percent','Discount percentage'],['shipping','Free shipping'],['product','Free product'],['impact','Environmental impact'],['points','Bonus points'],['credit','Bonus store credit'],['catalog','Access catalog'],['terms','Payment terms'],['custom','Custom reward']]);
const makePartner = () => ({id:newId('pt'),name:'New partner tier',status:'inactive',companies:0,companyIds:[],discount:10,threshold:0,paymentTerms:'Net 30',catalog:'Wholesale catalog',minimumOrder:0,perks:[],privileges:[],icon:'silver'});
export function PartnersList() {
  const {db,upsert,remove,set:storeSet}=useStore(); const navigate=useNavigate(); const notify=useShell().notify; const {empty,locked}=useVipState(); const [confirm,modal]=useConfirm();
  const [search,setSearch]=useState(''); const [sort,setSort]=useState('threshold asc');
  const settingsForm=useVipDraft(db.tierSettings?.partnerB2B||{rule:'spent',startDate:'',status:'inactive',syncTags:false},{onSave:d=>storeSet(['tierSettings','partnerB2B'],d),message:'Partner tier settings saved',locked});
  const settings=settingsForm.draft;
  if(!db.shop?.b2b)return <PageFrame title="Partner tiers" backUrl="/vip"><Banner tone="info" title="Partner tiers need Shopify B2B"><p>Enable B2B for your shop to assign companies to partner tiers.</p></Banner></PageFrame>;
  const tiers=empty?[]:[...(db.partnerTiers||[])].filter(t=>t.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='threshold desc'?Number(b.threshold)-Number(a.threshold):Number(a.threshold)-Number(b.threshold));
  return <PageFrame title="Partner tiers" backUrl="/vip" badge={<StatusBadge status={settings.status}/>} primaryAction={{content:'Add partner tier',disabled:locked,onAction:()=>navigate('/vip/partners/new')}} secondaryActions={[{content:'Launch',disabled:locked||settingsForm.dirty,onAction:()=>confirm({title:'Launch partner tiers?',body:'Companies will be reassessed from '+(settings.startDate||'the start date')+'. Assigned catalogs and payment terms will become active.',action:'Launch',destructive:false,onConfirm:()=>{storeSet(['tierSettings','partnerB2B','status'],'active');notify('Partner tiers launched');}})},{content:'Sync B2B data',disabled:locked,onAction:()=>confirm({title:'Sync companies from Shopify?',body:'Company tier assignments and customer tags will be refreshed.',action:'Sync now',destructive:false,onConfirm:()=>notify('B2B data synced')})}]}>
    <BlockStack gap="500"><Question detail="Group companies by purchase milestone, then choose the catalog, discount and payment terms they receive.">What do partner companies get?</Question>
      <Section title="Tier configuration"><BlockStack gap="300"><Select label="Level-up rule" value={settings.rule||'spent'} options={choices([['spent','Amount spent'],['orders','Number of orders']])} disabled={locked} onChange={v=>settingsForm.set('rule',v)}/><TextField label="Start date" type="date" value={settings.startDate||''} autoComplete="off" disabled={locked} onChange={v=>settingsForm.set('startDate',v)}/><Checkbox label="Automatically tag partner companies" checked={Boolean(settings.syncTags)} disabled={locked} onChange={v=>settingsForm.set('syncTags',v)}/></BlockStack></Section>
      {empty ? <EmptyCard art="members" heading="No partner tiers yet" action={{content:'Add partner tier',url:'/vip/partners/new'}}>Add a tier for your first company group.</EmptyCard> : <Section title="Partner tier ladder" description="Companies can be assigned to a tier from their profile." flush>
        {(db.partnerTiers||[]).length>8 ? <><div className="rv-vip-search-mobile"><BlockStack gap="200"><TextField label="Search partner tiers" labelHidden placeholder="Search partner tiers" value={search} onChange={setSearch} autoComplete="off"/><Select label="Sort partner tiers" value={sort} options={choices([["threshold asc","Milestone: lowest first"],["threshold desc","Milestone: highest first"]])} onChange={setSort}/></BlockStack></div><IndexFilters tabs={[{id:'all',content:'All'}]} selected={0} onSelect={()=>{}} queryValue={search} queryPlaceholder="Search partner tiers" onQueryChange={setSearch} onQueryClear={()=>setSearch('')} filters={[]} onClearAll={()=>setSearch('')} sortOptions={[{label:'Milestone',value:'threshold asc',directionLabel:'Lowest first'},{label:'Milestone',value:'threshold desc',directionLabel:'Highest first'}]} sortSelected={[sort]} onSort={v=>setSort(v[0])} mode="default" setMode={()=>{}} canCreateNewView={false}/></> : <div className="rv-vip-filters"><TextField label="Search partner tiers" labelHidden placeholder="Search partner tiers" value={search} onChange={setSearch} autoComplete="off"/></div>}
        {!tiers.length?<div className="rv-vip-list-empty"><Text as="p">{search?'No partner tiers match your search.':'No partner tiers yet. Add a tier for your first company group.'}</Text><Button url="/vip/partners/new">Add partner tier</Button></div>:
          tiers.map((t,i)=><Row key={t.id} index={i} title={t.name} detail={money(t.threshold)+' milestone · '+t.discount+'% wholesale discount · '+t.paymentTerms} meta={num((t.companyIds||[]).length||t.companies)+' companies'} status={t.status} checked={t.status==='active'} locked={locked} onOpen={()=>navigate('/vip/partners/'+t.id)} onToggle={()=>{upsert('partnerTiers',{...t,status:t.status==='active'?'inactive':'active'});notify('Partner tier '+(t.status==='active'?'turned off':'turned on'));}} actions={<Button size="slim" tone="critical" disabled={locked} onClick={()=>confirm({title:'Delete '+t.name+'?',body:'Assigned companies will lose this tier’s benefits.',action:'Delete tier',onConfirm:()=>{remove('partnerTiers',t.id);notify('Partner tier deleted');}})}>Delete</Button>}/>)}
      </Section>}
      {!empty && <Section title="Assigned companies">
        <BlockStack gap="200">{(db.companies||[]).map(c=><InlineStack key={c.id} align="space-between"><Text as="span">{c.name}</Text><Button url={'/customers/companies/'+c.id} variant="plain">View company</Button></InlineStack>)}</BlockStack>
      </Section>}
    </BlockStack>{modal}
  </PageFrame>;
}

export function PartnerEditor({id}) {
  const {db,upsert,remove}=useStore(); const navigate=useNavigate(); const notify=useShell().notify; const {locked}=useVipState(); const [confirm,modal]=useConfirm(); const [perk,setPerk]=useState(''); const [privType,setPrivType]=useState('discount_percent'); const [privName,setPrivName]=useState('');
  const existing=id!=='new'&&(db.partnerTiers||[]).find(t=>t.id===id);
  const base=useMemo(()=>existing||makePartner(),[existing,id]);
  const validate=d=>({name:!d.name?.trim()?'Enter a partner tier name.':undefined,discount:Number(d.discount)<0||Number(d.discount)>100?'Discount must be between 0% and 100%.':undefined});
  const form=useVipDraft(base,{onSave:d=>{upsert('partnerTiers',{...d,companies:(d.companyIds||[]).length});if(id==='new')window.setTimeout(()=>navigate('/vip/partners/'+d.id),80);},validate,message:'Partner tier saved',locked});
  const {draft:d,set,field,errors}=form;
  if(!db.shop?.b2b)return <PageFrame title="Partner tiers" backUrl="/vip"><Banner tone="info" title="Partner tiers need Shopify B2B"><p>Enable B2B for your shop to assign companies to partner tiers.</p></Banner></PageFrame>;
  if(id!=='new'&&!existing)return <PageFrame title="Partner tier not found" backUrl="/vip/partners"><NotFound label="Partner tier" back="/vip/partners"/></PageFrame>;
  const selected=(d.companyIds||[]).map(x=>db.companies?.find(c=>c.id===x)).filter(Boolean);
  const summary=d.name+': '+(d.discount||0)+'% wholesale discount from '+(d.catalog||'the wholesale catalog')+', '+d.paymentTerms+' terms, minimum order '+money(d.minimumOrder||0)+'.';
  const perks=d.perks||[];
  return <PageFrame title={id==='new'?'New partner tier':d.name} backUrl="/vip/partners" width="wide">
    <BlockStack gap="500"><Question detail="A company's assigned tier controls its wholesale benefits. Changes here affect every assigned company.">What does this partner tier give companies?</Question>
      <EditorGrid main={<>
        <Section title="Partner tier"><BlockStack gap="300">
          <TextField label="Tier name" {...field('name')} autoComplete="off" disabled={locked}/>
          <TextField label="Milestone to achieve" type="number" prefix="$" value={String(d.threshold||0)} autoComplete="off" disabled={locked} onChange={v=>set('threshold',Number(v))}/>
          <TextField label="Wholesale discount" type="number" suffix="%" value={String(d.discount||0)} autoComplete="off" disabled={locked} error={errors.discount} onChange={v=>set('discount',Number(v))}/>
          <TextField label="Catalog name" {...field('catalog')} autoComplete="off" disabled={locked}/>
          <Select label="Payment terms" value={d.paymentTerms||'Net 30'} options={choices([['Net 15','Net 15'],['Net 30','Net 30'],['Net 60','Net 60']])} disabled={locked} onChange={v=>set('paymentTerms',v)}/>
          <TextField label="Minimum order" type="number" prefix="$" value={String(d.minimumOrder||0)} autoComplete="off" disabled={locked} onChange={v=>set('minimumOrder',Number(v))}/>
          <Select label="Tier icon" value={d.icon||'silver'} options={choices([['bronze','Standard Partner'],['silver','Premium Partner'],['gold','Elite Partner']])} disabled={locked} onChange={v=>set('icon',v)}/>
        </BlockStack></Section>
        <Section title="Privileges" description="These appear on the partner tier card."><BlockStack gap="300">
          {perks.map((p,i)=><div className="rv-vip-perk" key={i}><TextField label={'Privilege '+(i+1)} labelHidden value={p} autoComplete="off" disabled={locked} onChange={v=>set('perks',perks.map((x,j)=>j===i?v:x))}/><InlineStack gap="100"><Button size="slim" disabled={locked||i===0} onClick={()=>{const a=[...perks];[a[i-1],a[i]]=[a[i],a[i-1]];set('perks',a);notify('Privilege order changed. Save to keep it.');}}>↑</Button><Button size="slim" disabled={locked||i===perks.length-1} onClick={()=>{const a=[...perks];[a[i+1],a[i]]=[a[i],a[i+1]];set('perks',a);notify('Privilege order changed. Save to keep it.');}}>↓</Button><Button size="slim" tone="critical" disabled={locked} onClick={()=>set('perks',perks.filter((_,j)=>j!==i))}>×</Button></InlineStack></div>)}
          <InlineStack gap="200" blockAlign="end"><div style={{flex:1}}><TextField label="Add privilege" value={perk} autoComplete="off" disabled={locked} onChange={setPerk}/></div><Button disabled={locked||!perk.trim()} onClick={()=>{set('perks',[...perks,perk.trim()]);setPerk('');}}>Add</Button></InlineStack>
        </BlockStack></Section>
        <Section title="Partner rewards" description="Each reward can carry its own value, code and expiry."><BlockStack gap="300">
          {(d.privileges||[]).map((p,i)=><BlockStack key={p.id} gap="200">
            <InlineStack align="space-between" blockAlign="center"><Text as="h3" variant="headingSm">{p.name}</Text><Button size="slim" tone="critical" disabled={locked} onClick={()=>set('privileges',d.privileges.filter(x=>x.id!==p.id))}>Remove</Button></InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">{privilegeTypes.find(x=>x.value===p.type)?.label}</Text>
            <TextField label="Program name" value={p.name} autoComplete="off" disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,name:v}:x))}/>
            <TextField label="Code name" value={p.code||''} autoComplete="off" disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,code:v}:x))}/>
            {!['shipping','catalog','terms','custom'].includes(p.type)&&<TextField label="Reward value" type="number" value={String(p.value||0)} autoComplete="off" disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,value:Number(v)}:x))}/>}
            {p.type==='shipping'&&<Checkbox label="Cap shipping discount" checked={Boolean(p.capShipping)} disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,capShipping:v}:x))}/>}
            {p.type==='shipping'&&p.capShipping&&<TextField label="Shipping discount cap" type="number" prefix="$" value={String(p.shippingCap||0)} autoComplete="off" disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,shippingCap:Number(v)}:x))}/>}
            <Select label="Expired after" value={p.expires||'never'} options={choices([['never','Never'],['30','30 days'],['90','90 days'],['specific','Specific date']])} disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,expires:v}:x))}/>
            {p.expires==='specific'&&<TextField label="Expiry date" type="date" value={p.expiryDate||''} autoComplete="off" disabled={locked} onChange={v=>set('privileges',d.privileges.map((x,j)=>j===i?{...x,expiryDate:v}:x))}/>}
          </BlockStack>)}
          <Select label="Reward type" value={privType} options={privilegeTypes} disabled={locked} onChange={setPrivType}/>
          <TextField label="New reward name" value={privName} autoComplete="off" disabled={locked} onChange={setPrivName}/>
          <div><Button disabled={locked||!privName.trim()} onClick={()=>{set('privileges',[...(d.privileges||[]),{id:newId('priv'),type:privType,name:privName.trim(),value:0,code:'',expires:'never'}]);setPrivName('');}}>Add reward</Button></div>
        </BlockStack></Section>
      </>} rail={<Rail status={d.status} onStatus={v=>set('status',v?'active':'inactive')} summary={summary} who={(d.companyIds||[]).length+' assigned companies'} locked={locked}>
        <Section title="Companies assigned"><BlockStack gap="200">
          <ChoiceList title="Choose companies" titleHidden allowMultiple choices={(db.companies||[]).map(c=>({label:c.name,value:c.id}))} selected={d.companyIds||[]} disabled={locked} onChange={v=>set('companyIds',v)}/>
          {selected.map(c=><Button key={c.id} url={'/customers/companies/'+c.id} variant="plain">{c.name} →</Button>)}
        </BlockStack></Section>
        {id!=='new'&&<DeleteButton label="partner tier" disabled={locked} onClick={()=>confirm({title:'Delete '+d.name+'?',body:'Assigned companies will lose these benefits.',action:'Delete tier',onConfirm:()=>{remove('partnerTiers',d.id);notify('Partner tier deleted');navigate('/vip/partners');}})}/>}
      </Rail>}/>
    </BlockStack>{modal}
  </PageFrame>;
}
