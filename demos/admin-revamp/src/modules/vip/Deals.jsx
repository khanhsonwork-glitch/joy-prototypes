import React, {useMemo, useState} from 'react';
import {BlockStack, Button, Checkbox, IndexFilters, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {useStore, newId} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EligibilityField, eligibilityLabel, EmptyCard, ScheduleField, Section, StatusBadge, useConfirm, num, money, pct, dateLabel} from '../../ui/kit.jsx';
import {Question, EditorGrid, Rail, Row, Picker, DeleteButton, NotFound, choices, useVipState, useVipDraft} from './common.jsx';

const types = choices([['percent','Discount percentage'],['amount','Discount amount'],['shipping','Free shipping'],['fixed','Fixed price'],['product','Free product'],['impact','Environmental impact']]);
const typeText = d => {
  const x = d.discount || {};
  if(x.type==='percent') return pct(x.value)+' off';
  if(x.type==='amount') return money(x.value)+' off';
  if(x.type==='shipping') return 'Free shipping';
  if(x.type==='fixed') return money(x.value)+' fixed price';
  if(x.type==='product') return 'Free product';
  return 'Environmental impact reward';
};
const defaultDeal = type => ({id:newId('d'),name:'New member deal',status:'inactive',discount:{type:type || 'percent',value:10},eligibility:{mode:'members'},schedule:{start:'2026-11-20',end:'2026-12-20'},products:'All products',used:0,limit:1,countdown:false,badgeText:'Members only',saleChannels:'Online store',orderMinimum:0,combines:false,dateMode:'static',dynamicDate:'birth_month',fontSize:14,actionText:'Members only',cta:'Shop member deals',availableSpot:'Member account',textFont:'Default',textColor:'',iconColor:'',backgroundColor:'',gradient:false});

export function DealsList() {
  const {db,upsert,remove} = useStore();
  const navigate = useNavigate();
  const notify = useShell().notify;
  const {empty,overflow,locked} = useVipState();
  const [picker,setPicker] = useState(false);
  const [confirm,modal] = useConfirm();
  const [query,setQuery] = useState('');
  const [filter,setFilter] = useState('all');
  const [sort,setSort] = useState('name asc');
  const deals = empty ? [] : (db.deals || []).filter(d=>(filter==='all'||d.status===filter)&&d.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='name desc'?b.name.localeCompare(a.name):a.name.localeCompare(b.name));
  const toggle = d => {upsert('deals',{...d,status:d.status==='active'?'inactive':'active'});notify(d.status==='active'?'Deal turned off':'Deal turned on');};
  const removeDeal = d => confirm({title:'Delete '+d.name+'?',body:'This deal will no longer be available to members.',action:'Delete deal',onConfirm:()=>{remove('deals',d.id);notify('Deal deleted');}});
  return <PageFrame title="Member deals" backUrl="/vip" primaryAction={{content:'Add deal',disabled:locked,onAction:()=>setPicker(true)}}>
    <BlockStack gap="500"><Question detail="A deal gives members a reason to come back. Schedule it before turning it on.">What special offers do members get?</Question>
      {empty ? <EmptyCard art="rewards" heading="No member deals yet" action={{content:'Add deal',onAction:()=>setPicker(true)}}>Create a deal to reward loyal customers.</EmptyCard> : <Section title="Deals" description={(db.deals || []).filter(x=>x.status==='active').length+' active deals'} flush>
        <BlockStack gap="0">
          {(db.deals||[]).length>8 ? <><div className="rv-vip-search-mobile"><BlockStack gap="200"><TextField label="Search deals" labelHidden placeholder="Search deals" value={query} onChange={setQuery} autoComplete="off"/><Select label="Sort deals" value={sort} options={choices([["name asc","Name: A to Z"],["name desc","Name: Z to A"]])} onChange={setSort}/></BlockStack></div><IndexFilters tabs={['all','active','inactive'].map((value,id)=>({id:value,content:value==='all'?'All':value==='active'?'Active':'Inactive'}))} selected={['all','active','inactive'].indexOf(filter)} onSelect={i=>setFilter(['all','active','inactive'][i])} queryValue={query} queryPlaceholder="Search deals" onQueryChange={setQuery} onQueryClear={()=>setQuery('')} filters={[]} onClearAll={()=>{setQuery('');setFilter('all')}} sortOptions={[{label:'Name',value:'name asc',directionLabel:'A to Z'},{label:'Name',value:'name desc',directionLabel:'Z to A'}]} sortSelected={[sort]} onSort={v=>setSort(v[0])} mode="default" setMode={()=>{}} canCreateNewView={false}/></> : <div className="rv-vip-filters"><TextField label="Search deals" labelHidden placeholder="Search deals" value={query} onChange={setQuery} autoComplete="off"/><Select label="Status" labelHidden value={filter} options={choices([['all','All'],['active','Active'],['inactive','Inactive']])} onChange={setFilter}/></div>}
          {!deals.length ? <div className="rv-vip-list-empty"><Text as="p">{query||filter!=='all'?'No deals match your filters.':'No member deals yet. Create one to reward loyal customers.'}</Text><Button onClick={()=>{setQuery('');setFilter('all');setPicker(true);}}>Add deal</Button></div> :
          deals.map((d,i)=><Row key={d.id} index={i} title={overflow?d.name+' — special long name for layout review':d.name} detail={typeText(d)+' · '+eligibilityLabel(d.eligibility,db)+' · '+dateLabel(d.schedule?.start)+' – '+dateLabel(d.schedule?.end)} meta={num(d.used)+' uses'} status={d.status} checked={d.status==='active'} locked={locked} onToggle={()=>toggle(d)} onOpen={()=>navigate('/vip/deals/'+d.id)} actions={<InlineStack gap="100"><Button size="slim" disabled={locked} onClick={()=>{const copy={...d,id:newId('d'),name:d.name+' copy',status:'inactive',used:0};upsert('deals',copy);notify('Deal duplicated');navigate('/vip/deals/'+copy.id);}}>Duplicate</Button><Button size="slim" tone="critical" disabled={locked} onClick={()=>removeDeal(d)}>Delete</Button></InlineStack>}/>)}
        </BlockStack>
      </Section>}
    </BlockStack>
    <Picker open={picker} onClose={()=>setPicker(false)} title="Choose a deal type" options={types.map(x=>({...x,locked:x.value==='impact',plan:'Ultimate'}))} onPick={type=>navigate('/vip/deals/new?type='+type)}/>{modal}
  </PageFrame>;
}

export function DealEditor({id,query}) {
  const {db,upsert,remove} = useStore();
  const navigate = useNavigate();
  const notify = useShell().notify;
  const {locked} = useVipState();
  const [confirm,modal] = useConfirm();
  const existing = id!=='new' && (db.deals || []).find(d=>d.id===id);
  const base = useMemo(() => existing || defaultDeal(query?.get('type')), [existing,id]);
  const validate = d => ({name:!d.name?.trim()?'Enter a deal name.':undefined,schedule:!d.schedule?.start||!d.schedule?.end?'Set both schedule dates.':d.schedule.end<d.schedule.start?'End date must be after start date.':undefined,discount:Number(d.discount?.value)<0?'Discount cannot be negative.':undefined});
  const form = useVipDraft(base,{onSave:d=>{upsert('deals',d);if(id==='new')window.setTimeout(()=>navigate('/vip/deals/'+d.id),80);},validate,message:'Deal saved',locked});
  const {draft:d,set,field,errors} = form;
  if(id!=='new'&&!existing) return <PageFrame title="Deal not found" backUrl="/vip/deals"><NotFound label="Deal" back="/vip/deals"/></PageFrame>;
  const setDiscount=patch=>set('discount',{...d.discount,...patch});
  const schedule = d.schedule || {start:'',end:''};
  const summary = d.name+': '+typeText(d)+' on '+d.products+' for '+eligibilityLabel(d.eligibility,db)+'. Runs '+dateLabel(schedule.start)+' to '+dateLabel(schedule.end)+'.';
  return <PageFrame title={id==='new'?'New member deal':d.name} backUrl="/vip/deals" width="wide">
    <BlockStack gap="500"><Question detail="Set the offer, who qualifies, and when customers can use it.">What do members get from this deal?</Question>
      <EditorGrid main={<>
        <Section title="Deal settings"><BlockStack gap="300">
          <TextField label="Deal name" {...field('name')} autoComplete="off" disabled={locked}/>
          <Select label="Discount" value={d.discount?.type || 'percent'} options={types} disabled={locked} onChange={type=>setDiscount({type})}/>
          {['percent','amount','fixed'].includes(d.discount?.type) && <TextField label={d.discount?.type==='percent'?'Discount percentage':d.discount?.type==='fixed'?'Fixed price':'Discount amount'} type="number" value={String(d.discount?.value ?? 0)} suffix={d.discount?.type==='percent'?'%':undefined} prefix={d.discount?.type==='percent'?undefined:'$'} autoComplete="off" disabled={locked} error={errors.discount} onChange={v=>setDiscount({value:Number(v)})}/>}
          {d.discount?.type==='shipping' && <TextField label="Shipping discount rate" type="number" suffix="%" value={String(d.discount?.shippingRate ?? 100)} autoComplete="off" disabled={locked} onChange={v=>setDiscount({shippingRate:Number(v)})}/>}
          {d.discount?.type==='product' && <TextField label="Limit items free gift" type="number" value={String(d.discount?.giftLimit ?? 1)} autoComplete="off" disabled={locked} onChange={v=>setDiscount({giftLimit:Number(v)})}/>}
          <TextField label="Applies to products or collections" {...field('products')} autoComplete="off" disabled={locked} helpText="Use a product or collection name, or All products."/>
          <TextField label="Order minimum" type="number" prefix="$" value={String(d.orderMinimum || 0)} autoComplete="off" disabled={locked} onChange={v=>set('orderMinimum',Number(v))}/>
          <Checkbox label="Combine with other discounts" checked={Boolean(d.combines)} disabled={locked} onChange={v=>set('combines',v)}/>
          <Select label="Apply discount to sale channel" value={d.saleChannels || 'Online store'} options={choices([['Online store','Online store'],['All channels','All channels'],['Point of sale','Point of sale']])} disabled={locked} onChange={v=>set('saleChannels',v)}/>
        </BlockStack></Section>
        <Section title="Design"><BlockStack gap="300">
          <TextField label="Badge text" {...field('badgeText')} autoComplete="off" disabled={locked}/>
          <TextField label="Action text" {...field('actionText')} autoComplete="off" disabled={locked}/>
          <TextField label="Call to action" value={d.cta||''} autoComplete="off" disabled={locked} onChange={v=>set('cta',v)}/>
          <TextField label="Available spot" value={d.availableSpot||''} autoComplete="off" disabled={locked} onChange={v=>set('availableSpot',v)}/>
          <Select label="Text font" value={d.textFont||'Default'} options={choices([['Default','Default'],['Shop font','Shop font']])} disabled={locked} onChange={v=>set('textFont',v)}/>
          <TextField label="Text size" type="number" suffix="px" value={String(d.fontSize||14)} autoComplete="off" disabled={locked} onChange={v=>set('fontSize',Number(v))}/>
          <TextField label="Text color" value={d.textColor||''} autoComplete="off" disabled={locked} onChange={v=>set('textColor',v)}/>
          <TextField label="Icon color" value={d.iconColor||''} autoComplete="off" disabled={locked} onChange={v=>set('iconColor',v)}/>
          <TextField label="Background color" value={d.backgroundColor||''} autoComplete="off" disabled={locked} onChange={v=>set('backgroundColor',v)}/>
          <Checkbox label="Gradient background" checked={Boolean(d.gradient)} disabled={locked} onChange={v=>set('gradient',v)}/>
          {d.gradient&&<><TextField label="Background color start" value={d.backgroundColorStart||''} autoComplete="off" disabled={locked} onChange={v=>set('backgroundColorStart',v)}/><TextField label="Background color end" value={d.backgroundColorEnd||''} autoComplete="off" disabled={locked} onChange={v=>set('backgroundColorEnd',v)}/></>}
          <Checkbox label="Show countdown on storefront" checked={Boolean(d.countdown)} disabled={locked} onChange={v=>set('countdown',v)}/>
        </BlockStack></Section>
      </>} rail={<Rail status={d.status} onStatus={v=>set('status',v?'active':'inactive')} summary={summary} who={<EligibilityField value={d.eligibility} onChange={v=>set('eligibility',v)} disabled={locked}/>} schedule={<BlockStack gap="200"><Select label="Date range" value={d.dateMode||'static'} options={choices([['static','Static date'],['dynamic','Dynamic date']])} disabled={locked} onChange={v=>set('dateMode',v)}/>{d.dateMode==='dynamic'&&<Select label="Dynamic date" value={d.dynamicDate||'birth_month'} options={choices([['birth_month','Month of birth'],['weekend','Weekend'],['month_day','Specific day of month'],['week_day','Specific day of week']])} disabled={locked} onChange={v=>set('dynamicDate',v)}/>}<TextField label="Starts" type="date" value={schedule.start} onChange={v=>set('schedule',{...schedule,start:v})} autoComplete="off" disabled={locked}/><TextField label="Ends" type="date" value={schedule.end} onChange={v=>set('schedule',{...schedule,end:v})} autoComplete="off" disabled={locked} error={errors.schedule}/></BlockStack>} limits={<TextField label="Uses per customer" type="number" value={String(d.limit??1)} autoComplete="off" disabled={locked} onChange={v=>set('limit',Number(v))}/>} locked={locked}>
        {id!=='new' && <DeleteButton label="deal" disabled={locked} onClick={()=>confirm({title:'Delete '+d.name+'?',body:'Members will no longer see or use this deal.',action:'Delete deal',onConfirm:()=>{remove('deals',d.id);notify('Deal deleted');navigate('/vip/deals');}})}/>}
      </Rail>}/>
    </BlockStack>{modal}
  </PageFrame>;
}
