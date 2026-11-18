import React, {useMemo, useState} from 'react';
import {Banner, BlockStack, Button, Checkbox, IndexFilters, InlineStack, Select, Tabs, Text, TextField} from '@shopify/polaris';
import {useStore,newId} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {Section, StatusBadge, EmptyCard, useConfirm, num, money} from '../../ui/kit.jsx';
import {Question, EditorGrid, Rail, Row, Picker, DeleteButton, NotFound, choices, useVipState, useVipDraft} from './common.jsx';

const makeFrequency = interval => ({id:newId('freq'),type:'payg',every:1,unit:interval || 'month',discountType:'percent',discount:10,title:interval==='year'?'Yearly':'Monthly',description:'',minOrders:1,maxOrders:150,tierId:'',priority:1,start:'',end:'',tag:''});
const makePlan = interval => ({id:newId('pp'),name:'New membership plan',status:'inactive',price:interval==='year'?90:9,interval:interval || 'month',trialDays:0,perks:[],tierId:'',subscribers:0,monthlyBonus:0,freeShipping:false,dealsAccess:true,multiplier:1,cancelBehavior:'keep',products:[],frequencies:[makeFrequency(interval)],widget:{reverse:false,defaultOption:'payg'},subscribersList:[]});

export function PaidList() {
  const {db,upsert,remove} = useStore(); const navigate=useNavigate(); const notify=useShell().notify;
  const {empty,locked}=useVipState(); const [tab,setTab]=useState(0); const [search,setSearch]=useState(''); const [sort,setSort]=useState('name asc'); const [picker,setPicker]=useState(false); const [confirm,modal]=useConfirm();
  const plans=empty?[]:(db.paidPlans||[]).filter(p=>(tab===0||p.status===(tab===1?'active':'inactive'))&&p.name.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sort==='name desc'?b.name.localeCompare(a.name):a.name.localeCompare(b.name));
  const subscribers=empty?[]:(db.paidPlans||[]).flatMap(p=>(p.subscribersList||[]).map(s=>({...s,plan:p.name,planId:p.id})));
  return <PageFrame title="Paid membership" backUrl="/vip" primaryAction={{content:'Create plan',disabled:locked,onAction:()=>setPicker(true)}}>
    <BlockStack gap="500">
      <Question detail="Membership plans turn ongoing benefits into a recurring offer. A customer subscribes to a plan, then receives its perks.">What do paying members get each month?</Question>
      <Banner tone="info" title="Plan model"><p>Each membership plan can include products and frequency options. Existing product subscriptions can be reviewed before moving them into a plan.</p></Banner>
      {(db.paidPlans||[]).length<=8&&<Tabs tabs={['All','Active','Inactive'].map((content,id)=>({id:String(id),content}))} selected={tab} onSelect={setTab}/>}
      {empty ? <EmptyCard art="members" heading="No membership plans yet" action={{content:'Create plan',onAction:()=>setPicker(true)}}>Create your first paid plan to start offering ongoing benefits.</EmptyCard> : <Section title="Membership plans" flush><BlockStack gap="0">
        {(db.paidPlans||[]).length>8 ? <><div className="rv-vip-search-mobile"><BlockStack gap="200"><TextField label="Search plans" labelHidden placeholder="Search plans" value={search} onChange={setSearch} autoComplete="off"/><Select label="Sort plans" value={sort} options={choices([["name asc","Name: A to Z"],["name desc","Name: Z to A"]])} onChange={setSort}/></BlockStack></div><IndexFilters tabs={['All','Active','Inactive'].map((content,id)=>({id:String(id),content}))} selected={tab} onSelect={setTab} queryValue={search} queryPlaceholder="Search plans" onQueryChange={setSearch} onQueryClear={()=>setSearch('')} filters={[]} onClearAll={()=>{setSearch('');setTab(0)}} sortOptions={[{label:'Name',value:'name asc',directionLabel:'A to Z'},{label:'Name',value:'name desc',directionLabel:'Z to A'}]} sortSelected={[sort]} onSort={v=>setSort(v[0])} mode="default" setMode={()=>{}} canCreateNewView={false}/></> : <div className="rv-vip-filters"><TextField label="Search plans" labelHidden placeholder="Search plans" value={search} onChange={setSearch} autoComplete="off"/></div>}
        {!plans.length?<div className="rv-vip-list-empty"><Text as="p">{search||tab?'No plans match your filters.':'No membership plans yet. Create your first plan.'}</Text><Button onClick={()=>setPicker(true)}>Create plan</Button></div>:
        plans.map((p,i)=><Row key={p.id} index={i} title={p.name} detail={money(p.price)+' / '+p.interval+' · '+(p.frequencies||[]).length+' frequency options'} meta={num(p.subscribers)+' subscribers'} status={p.status} checked={p.status==='active'} locked={locked} onOpen={()=>navigate('/vip/paid/'+p.id)} onToggle={()=>{upsert('paidPlans',{...p,status:p.status==='active'?'inactive':'active'});notify('Plan '+(p.status==='active'?'turned off':'turned on'));}} actions={<Button size="slim" tone="critical" disabled={locked} onClick={()=>confirm({title:'Delete '+p.name+'?',body:'Subscribers will lose access to this plan. This cannot be undone.',action:'Delete plan',onConfirm:()=>{remove('paidPlans',p.id);notify('Plan deleted');}})}>Delete</Button>}/>)}
      </BlockStack></Section>}
      <Section title="Subscribers" description="Sample members enrolled in paid plans." flush>
        {subscribers.length?subscribers.map(s=><Row key={s.planId+'-'+s.id} title={s.name} detail={s.email+' · '+s.plan} status={s.status} onOpen={()=>navigate('/customers/'+s.customerId)}/>):<div className="rv-vip-list-empty"><Text as="p">No subscribers yet.</Text></div>}
      </Section>
      {(db.paidPlans?.[0]?.orphanedPlans||[]).length>0&&<Section title="Orphaned plans" description="Loyalty settings whose subscription product no longer exists.">
        <BlockStack gap="300">{db.paidPlans[0].orphanedPlans.map(p=><InlineStack key={p.id} align="space-between" blockAlign="center"><BlockStack gap="100"><Text as="span" fontWeight="semibold">{p.name}</Text><Text as="span" variant="bodySm" tone="subdued">Detected {p.detected} · {p.frequencies} preserved frequencies · {p.tag}</Text></BlockStack><InlineStack gap="100"><Button size="slim" disabled={locked} onClick={()=>{const copy=makePlan('month');copy.name=p.name;copy.frequencies=Array.from({length:p.frequencies},(_,i)=>({...makeFrequency('month'),title:'Preserved option '+(i+1),tag:p.tag}));upsert('paidPlans',copy);navigate('/vip/paid/'+copy.id);notify('Plan created from preserved settings');}}>Create new with these settings</Button><Button size="slim" tone="critical" disabled={locked} onClick={()=>confirm({title:'Delete orphaned loyalty settings?',body:'The subscription product is already gone. Only the preserved Joy settings will be deleted.',action:'Delete settings',onConfirm:()=>{upsert('paidPlans',{...db.paidPlans[0],orphanedPlans:db.paidPlans[0].orphanedPlans.filter(x=>x.id!==p.id)});notify('Orphaned settings deleted');}})}>Delete loyalty config</Button></InlineStack></InlineStack>)}</BlockStack>
      </Section>}
    </BlockStack><Picker open={picker} onClose={()=>setPicker(false)} title="Choose a billing interval" options={choices([['month','Monthly plan'],['year','Yearly plan']])} onPick={interval=>navigate('/vip/paid/new?interval='+interval)}/>{modal}
  </PageFrame>;
}

function FrequencyEditor({item,index,count,onChange,onRemove,onMove,locked,tiers}) {
  const patch=p=>onChange({...item,...p});
  return <Section title={'Frequency option '+(index+1)} action={<InlineStack gap="100"><Button size="slim" disabled={locked||index===0} onClick={()=>onMove(-1)}>↑</Button><Button size="slim" disabled={locked||index===count-1} onClick={()=>onMove(1)}>↓</Button><Button size="slim" tone="critical" disabled={locked||count===1} onClick={onRemove}>Delete</Button></InlineStack>}>
    <BlockStack gap="300">
      <Select label="Payment type" value={item.type||'payg'} options={choices([['payg','Pay as you go'],['prepaid','Auto-renew prepaid']])} disabled={locked} onChange={type=>patch({type})}/>
      <InlineStack gap="200"><div style={{flex:1}}><TextField label="Frequency" type="number" value={String(item.every||1)} autoComplete="off" disabled={locked} onChange={v=>patch({every:Number(v)})}/></div><div style={{flex:1}}><Select label="Unit" value={item.unit||'month'} options={choices([['day','Day'],['week','Week'],['month','Month'],['year','Year']])} disabled={locked} onChange={v=>patch({unit:v})}/></div></InlineStack>
      {item.type==='prepaid'&&<TextField label="Billing frequency" type="number" value={String(item.billingEvery||1)} autoComplete="off" disabled={locked} onChange={v=>patch({billingEvery:Number(v)})}/>}
      {item.unit!=='day'&&<Select label="Renewal day" value={item.renewalDay||'same'} options={choices([['same','Same day as first order'],['first','First day of period'],['last','Last day of period']])} disabled={locked} onChange={v=>patch({renewalDay:v})}/>}
      <Checkbox label="Set cut-off days" checked={Boolean(item.cutoffOn)} disabled={locked} onChange={v=>patch({cutoffOn:v})}/>
      {item.cutoffOn&&<TextField label="Cut-off day" type="number" value={String(item.cutoffDay||1)} autoComplete="off" disabled={locked} onChange={v=>patch({cutoffDay:Number(v)})}/>}
      <InlineStack gap="200"><div style={{flex:1}}><Select label="Discount type" value={item.discountType||'percent'} options={choices([['percent','Percentage'],['amount','Fixed amount']])} disabled={locked} onChange={v=>patch({discountType:v})}/></div><div style={{flex:1}}><TextField label="Discount value" type="number" value={String(item.discount||0)} suffix={item.discountType==='percent'?'%':undefined} prefix={item.discountType==='amount'?'$':undefined} autoComplete="off" disabled={locked} onChange={v=>patch({discount:Number(v)})}/></div></InlineStack>
      <Checkbox label="Include free shipping" checked={Boolean(item.freeShipping)} disabled={locked} onChange={v=>patch({freeShipping:v})}/>
      <TextField label="Apply discount from order" type="number" value={String(item.discountFrom||1)} autoComplete="off" disabled={locked} onChange={v=>patch({discountFrom:Number(v)})}/>
      <TextField label="Frequency title" value={item.title||''} autoComplete="off" disabled={locked} onChange={v=>patch({title:v})}/>
      <Checkbox label="Show frequency description" checked={Boolean(item.showDescription)} disabled={locked} onChange={v=>patch({showDescription:v})}/>
      {item.showDescription&&<TextField label="Frequency description" value={item.description||''} autoComplete="off" disabled={locked} onChange={v=>patch({description:v})}/>}
      <InlineStack gap="200"><div style={{flex:1}}><TextField label="Minimum orders" type="number" value={String(item.minOrders||1)} autoComplete="off" disabled={locked} onChange={v=>patch({minOrders:Number(v)})}/></div><div style={{flex:1}}><TextField label="Maximum orders" type="number" value={String(item.maxOrders||150)} autoComplete="off" disabled={locked} onChange={v=>patch({maxOrders:Number(v)})}/></div></InlineStack>
      <Select label="Variant application" value={item.variants||'all'} options={choices([['all','All variants'],['specific','Specific variants']])} disabled={locked} onChange={v=>patch({variants:v})}/>
      {item.variants==='specific'&&<TextField label="Variant names" value={item.variantNames||''} autoComplete="off" disabled={locked} onChange={v=>patch({variantNames:v})}/>}
      <Select label="Promote to VIP tier" value={item.tierId||''} options={[{value:'',label:'No promotion'},...tiers.map(t=>({value:t.id,label:t.name}))]} disabled={locked} onChange={v=>patch({tierId:v})}/>
      <TextField label="Priority" type="number" value={String(item.priority||1)} autoComplete="off" disabled={locked} onChange={v=>patch({priority:Number(v)})}/>
      <InlineStack gap="200"><div style={{flex:1}}><TextField label="Activation start" type="date" value={item.start||''} autoComplete="off" disabled={locked} onChange={v=>patch({start:v})}/></div><div style={{flex:1}}><TextField label="Activation end" type="date" value={item.end||''} autoComplete="off" disabled={locked} onChange={v=>patch({end:v})}/></div></InlineStack>
      <TextField label="Auto-tag customer" value={item.tag||''} autoComplete="off" disabled={locked} onChange={v=>patch({tag:v})}/>
    </BlockStack>
  </Section>;
}

export function PaidEditor({id,query}) {
  const {db,upsert,remove}=useStore(); const navigate=useNavigate(); const notify=useShell().notify; const {locked}=useVipState(); const [confirm,modal]=useConfirm();
  const existing=id!=='new'&&(db.paidPlans||[]).find(p=>p.id===id);
  const base=useMemo(()=>existing||makePlan(query?.get('interval')),[existing,id]);
  const validate=d=>({name:!d.name?.trim()?'Enter a plan name.':undefined,price:Number(d.price)<=0?'Price must be more than $0.':undefined,products:!(d.products||[]).length?'Add at least one product.':undefined,frequencies:!(d.frequencies||[]).length?'Add at least one frequency.':undefined});
  const form=useVipDraft(base,{onSave:d=>{upsert('paidPlans',d);if(id==='new')window.setTimeout(()=>navigate('/vip/paid/'+d.id),80);},validate,message:'Membership plan saved',locked});
  const {draft:d,set,field,errors}=form; const [product,setProduct]=useState('');
  if(id!=='new'&&!existing)return <PageFrame title="Plan not found" backUrl="/vip/paid"><NotFound label="Plan" back="/vip/paid"/></PageFrame>;
  const frequencies=d.frequencies||[]; const changeFreq=(index,item)=>set('frequencies',frequencies.map((x,i)=>i===index?item:x));
  const moveFreq=(index,delta)=>{const next=[...frequencies];[next[index],next[index+delta]]=[next[index+delta],next[index]];set('frequencies',next);notify('Frequency order changed. Save to keep it.');};
  const summary=d.name+' costs '+money(d.price)+' per '+d.interval+' after '+num(d.trialDays)+' trial days. Members earn '+d.multiplier+'× points'+(d.freeShipping?', receive free shipping':'')+(d.dealsAccess?', and access member deals':'')+'.';
  return <PageFrame title={id==='new'?'New membership plan':d.name} backUrl="/vip/paid" width="wide">
    <BlockStack gap="500"><Question detail="A paid plan combines a recurring price, products and ongoing benefits.">What is included in this membership?</Question>
      <EditorGrid main={<>
        <Section title="Plan"><BlockStack gap="300">
          <TextField label="Plan name" {...field('name')} autoComplete="off" disabled={locked}/>
          <InlineStack gap="200"><div style={{flex:1}}><TextField label="Price" type="number" prefix="$" value={String(d.price||0)} autoComplete="off" disabled={locked} error={errors.price} onChange={v=>set('price',Number(v))}/></div><div style={{flex:1}}><Select label="Interval" value={d.interval||'month'} options={choices([['month','Month'],['year','Year']])} disabled={locked} onChange={v=>set('interval',v)}/></div></InlineStack>
          <TextField label="Trial days" type="number" value={String(d.trialDays||0)} autoComplete="off" disabled={locked} onChange={v=>set('trialDays',Number(v))}/>
        </BlockStack></Section>
        <Section title="Products" description="Choose the products this plan covers."><BlockStack gap="200">
          {(d.products||[]).map(p=><InlineStack key={p} align="space-between"><Text as="span">{p}</Text><Button size="slim" tone="critical" disabled={locked} onClick={()=>set('products',d.products.filter(x=>x!==p))}>Remove</Button></InlineStack>)}
          <InlineStack gap="200" blockAlign="end"><div style={{flex:1}}><TextField label="Product name" value={product} autoComplete="off" disabled={locked} onChange={setProduct} error={errors.products}/></div><Button disabled={locked||!product.trim()} onClick={()=>{set('products',[...(d.products||[]),product.trim()]);setProduct('');}}>Add product</Button></InlineStack>
        </BlockStack></Section>
        <Section title="Member benefits"><BlockStack gap="300">
          <TextField label="Points multiplier" type="number" suffix="×" value={String(d.multiplier||1)} autoComplete="off" disabled={locked} onChange={v=>set('multiplier',Number(v))}/>
          <Checkbox label="Free shipping" checked={Boolean(d.freeShipping)} disabled={locked} onChange={v=>set('freeShipping',v)}/>
          <Checkbox label="Access member deals" checked={Boolean(d.dealsAccess)} disabled={locked} onChange={v=>set('dealsAccess',v)}/>
          <TextField label="Monthly bonus points" type="number" value={String(d.monthlyBonus||0)} suffix="points" autoComplete="off" disabled={locked} onChange={v=>set('monthlyBonus',Number(v))}/>
          <Select label="Assign VIP tier" value={d.tierId||''} options={[{value:'',label:'Do not assign a tier'},...(db.tiers||[]).map(t=>({value:t.id,label:t.name}))]} disabled={locked} onChange={v=>set('tierId',v)}/>
        </BlockStack></Section>
        <Section title="Frequency options" description="Customers choose how often they are billed."><BlockStack gap="300">{frequencies.map((f,i)=><FrequencyEditor key={f.id} item={f} index={i} count={frequencies.length} onChange={x=>changeFreq(i,x)} onRemove={()=>set('frequencies',frequencies.filter(x=>x.id!==f.id))} onMove={delta=>moveFreq(i,delta)} locked={locked} tiers={db.tiers||[]}/>)}
          <div><Button disabled={locked} onClick={()=>set('frequencies',[...frequencies,makeFrequency(d.interval)])}>Add frequency option</Button></div>
        </BlockStack></Section>
        <Section title="Widget settings"><BlockStack gap="300">
          <Checkbox label="Show subscription before one-time purchase" checked={Boolean(d.widget?.reverse)} disabled={locked} onChange={v=>set('widget',{...d.widget,reverse:v})}/>
          <Select label="Default purchase option" value={d.widget?.defaultOption||'payg'} options={choices([['once','One-time purchase'],['payg','Pay as you go'],['prepaid','Prepaid']])} disabled={locked} onChange={v=>set('widget',{...d.widget,defaultOption:v})}/>
          {d.widget?.defaultOption==='payg'&&<Select label="Default pay-as-you-go plan" value={d.widget?.defaultPayg||frequencies[0]?.id||''} options={frequencies.filter(x=>x.type==='payg').map(x=>({value:x.id,label:x.title||'Frequency'}))} disabled={locked} onChange={v=>set('widget',{...d.widget,defaultPayg:v})}/>}
          {d.widget?.defaultOption==='prepaid'&&<Select label="Default prepaid plan" value={d.widget?.defaultPrepaid||frequencies[0]?.id||''} options={frequencies.filter(x=>x.type==='prepaid').map(x=>({value:x.id,label:x.title||'Frequency'}))} disabled={locked} onChange={v=>set('widget',{...d.widget,defaultPrepaid:v})}/>}
        </BlockStack></Section>
      </>} rail={<Rail status={d.status} onStatus={v=>set('status',v?'active':'inactive')} summary={summary} who={d.tierId?(db.tiers||[]).find(t=>t.id===d.tierId)?.name+' tier':'All subscribers'} limits={'Trial: '+num(d.trialDays)+' days'} locked={locked}>
        <Section title="When a member cancels"><Select label="Cancel behaviour" labelHidden value={d.cancelBehavior||'keep'} options={choices([['keep','Keep earned points'],['remove','Remove assigned tier']])} disabled={locked} onChange={v=>set('cancelBehavior',v)}/></Section>
        <Section title="Subscribers"><Text as="p">{num(d.subscribers)} subscribers</Text></Section>
        {id!=='new'&&<DeleteButton label="plan" disabled={locked} onClick={()=>confirm({title:'Delete '+d.name+'?',body:'Subscribers will lose access to this plan.',action:'Delete plan',onConfirm:()=>{remove('paidPlans',d.id);notify('Plan deleted');navigate('/vip/paid');}})}/>}
      </Rail>}/>
    </BlockStack>{modal}
  </PageFrame>;
}
