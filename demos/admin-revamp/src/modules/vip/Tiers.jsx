import React, {useMemo, useState} from 'react';
import {BlockStack, Box, Button, Card, Checkbox, InlineGrid, InlineStack, Select, Tabs, Text, TextField, Banner} from '@shopify/polaris';
import {TIER_ART} from '../../assets/index.js';
import {useStore, newId} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {Section, StatusBadge, Switch, useConfirm, NumberField, EmptyCard, num, money, points} from '../../ui/kit.jsx';
import {Question, EditorGrid, Rail, DeleteButton, NotFound, amount, periodText, rewardText, rewardTypes, choices, useVipState, useVipDraft} from './common.jsx';

const COLORS = ['#d9d9d9','#c0c6cf','#e3b44f','#1f1f1f','#9caac4','#b69a8a'];
const PRESETS = ['Free shipping', 'Early access', 'Birthday gift', 'Exclusive products', 'Priority support'];
const ruleOptions = choices([['spent','Money spent'],['points','Points earned'],['orders','Number of orders']]);
const periodOptions = choices([['rolling12','Rolling 12 months'],['calendar','Calendar year'],['lifetime','Lifetime']]);
const tierSort = (a,b) => Number(a.threshold) - Number(b.threshold);

export function TiersHome() {
  const {db, upsert, merge} = useStore();
  const navigate = useNavigate();
  const notify = useShell().notify;
  const {empty, overflow, locked} = useVipState();
  const tiers = empty ? [] : [...(db.tiers || [])].sort(tierSort);
  const settings = db.tierSettings || {};
  const total = tiers.reduce((n, t) => n + Number(t.members || 0), 0);
  const unit = settings.rule === 'spent' ? 'spend' : settings.rule === 'points' ? 'earn' : 'place';
  const ruleLine = settings.rule === 'spent' ? 'Money spent' : settings.rule === 'points' ? 'Points earned' : 'Number of orders';
  return <PageFrame title="VIP tiers" backUrl="/vip" badge={<StatusBadge status={settings.enabled ? 'active' : 'inactive'}/>}
    primaryAction={{content:'Add tier',disabled:locked || tiers.length >= 10,onAction:()=>navigate('/vip/tiers/new')}}
    secondaryActions={[{content:'Settings',onAction:()=>navigate('/vip/tiers/settings')}]}
    width="wide">
    <BlockStack gap="500">
      <Question detail="Customers move through the ladder automatically. Each tier adds benefits to the one below it.">How do customers move up, and what does each tier get?</Question>
      <Section title="Level-up rule" action={<Button url="/vip/tiers/settings">Edit</Button>}>
        <Text as="p">Customers move up based on {ruleLine.toLowerCase()} over {periodText(settings.period)}. Counting starts {settings.startDate || 'when you launch'}.</Text>
      </Section>
      {!tiers.length ? <EmptyCard art="members" heading="No VIP tiers yet" action={{content:'Add tier',url:'/vip/tiers/new'}}>Start with a tier to show loyal customers what they can earn.</EmptyCard> :
      <Section title="Compare tiers" description="Open a tier to change its threshold and benefits. Tiers stay sorted by milestone." flush>
        <div className="rv-vip-tier-table" style={{'--rv-vip-cols': tiers.length, '--rv-vip-heads': tiers.length + 1}}>
          <div className="rv-vip-tier-cell"><Text as="span" tone="subdued">Benefit</Text></div>
          {tiers.map(t => <div className="rv-vip-tier-cell" key={t.id}><Button variant="plain" onClick={()=>navigate('/vip/tiers/'+t.id)}>{overflow ? t.name + ' — an unusually long tier name for layout testing' : t.name}</Button></div>)}
          {[
            ['How to reach',t => t.exclusive ? 'Manual assignment' : t.threshold === 0 ? 'Join the program' : unit + ' ' + amount(t.threshold,settings.rule)],
            ['Points multiplier',t => Number(t.multiplier || 1).toFixed(2).replace(/\.?0+$/,'') + '×'],
            ['Entry reward',t => rewardText(t.entryReward)],
            ['Perks',t => (t.perks || []).join(' · ') || 'None'],
            ['Members',t => num(overflow ? 123456789 : t.members)],
          ].map(([label, get]) => <React.Fragment key={label}><div className="rv-vip-tier-cell"><Text as="span" variant="bodySm" tone="subdued">{label}</Text></div>{tiers.map(t => <div className="rv-vip-tier-cell" key={t.id}><Text as="span" variant="bodySm">{get(t)}</Text></div>)}</React.Fragment>)}
        </div>
        <div className="rv-vip-tier-mobile">
          {tiers.map(t => <Card key={t.id}><BlockStack gap="200">
            <Button variant="plain" onClick={()=>navigate('/vip/tiers/'+t.id)}>{t.name}</Button>
            <Text as="p" variant="bodySm">{t.exclusive ? 'Manual assignment' : t.threshold === 0 ? 'Join the program' : unit + ' ' + amount(t.threshold,settings.rule)}</Text>
            <Text as="p" variant="bodySm">{t.multiplier}× points · {rewardText(t.entryReward)}</Text>
            <Text as="p" variant="bodySm">{(t.perks || []).join(' · ') || 'No perks yet'}</Text>
            <Text as="p" variant="bodySm">{num(t.members)} members</Text>
          </BlockStack></Card>)}
        </div>
      </Section>}
      {!!tiers.length && <Section title="Members by tier" description={num(total) + ' members in this ladder'}>
        <BlockStack gap="300">{tiers.map(t => <div key={t.id}><InlineStack align="space-between"><Text as="span" variant="bodySm">{t.name}</Text><Text as="span" variant="bodySm">{num(t.members)}</Text></InlineStack><div className="rv-vip-bar"><span style={{width:(total ? Math.max(2,100*t.members/total) : 0)+'%'}}/></div></div>)}</BlockStack>
      </Section>}
    </BlockStack>
  </PageFrame>;
}

function PerksEditor({items, onChange, locked}) {
  const [next, setNext] = useState('');
  const notify = useShell().notify;
  const move = (index, delta) => {
    const list = [...items]; const other = index + delta;
    if (other < 0 || other >= list.length) return;
    [list[index], list[other]] = [list[other], list[index]]; onChange(list); notify('Perk order changed. Save to keep it.');
  };
  return <BlockStack gap="300">
    {(items || []).map((perk,i) => <div className="rv-vip-perk" key={i}>
      <TextField label={'Perk '+(i+1)} labelHidden value={perk} autoComplete="off" disabled={locked} onChange={value=>onChange(items.map((x,j)=>j===i?value:x))}/>
      <InlineStack gap="100" wrap={false}><Button size="slim" disabled={locked || i===0} onClick={()=>move(i,-1)} accessibilityLabel={'Move '+perk+' up'}>↑</Button><Button size="slim" disabled={locked || i===items.length-1} onClick={()=>move(i,1)} accessibilityLabel={'Move '+perk+' down'}>↓</Button><Button size="slim" tone="critical" disabled={locked} onClick={()=>onChange(items.filter((_,j)=>j!==i))} accessibilityLabel={'Remove '+perk}>×</Button></InlineStack>
    </div>)}
    <InlineStack gap="200" blockAlign="end"><div style={{flex:1}}><TextField label="Add a perk" value={next} onChange={setNext} autoComplete="off" disabled={locked}/></div><Button disabled={locked || !next.trim()} onClick={()=>{onChange([...(items || []),next.trim()]);setNext('');}}>Add</Button></InlineStack>
    <InlineStack gap="100">{PRESETS.filter(x=>!(items || []).includes(x)).map(p=><Button key={p} size="slim" disabled={locked} onClick={()=>onChange([...(items || []),p])}>{p}</Button>)}</InlineStack>
  </BlockStack>;
}

export function TierEditor({id}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const notify = useShell().notify;
  const {locked} = useVipState();
  const [confirm, modal] = useConfirm();
  const existing = id !== 'new' && (db.tiers || []).find(t=>t.id===id);
  const base = useMemo(() => existing || {id:newId('t'),name:'New tier',status:'active',threshold:((db.tiers || []).reduce((m,t)=>Math.max(m,Number(t.threshold)||0),0)+500),multiplier:1.25,color:COLORS[4],members:0,keep:12,tag:'joy-new-tier',perks:[],entryReward:null,icon:'silver',exclusive:false,preReward:{enabled:false,within:100,type:'points',value:100},hideDefault:false,tierPoints:0,additionalName:''}, [existing,id]);
  const validate = d => ({name:!d.name?.trim()?'Enter a tier name.':undefined,threshold:Number(d.threshold)<0?'Threshold must be 0 or more.':undefined,multiplier:Number(d.multiplier)<1?'Multiplier must be at least 1.':undefined});
  const form = useVipDraft(base,{onSave:d=>{upsert('tiers',d); if(id==='new') window.setTimeout(()=>navigate('/vip/tiers/'+d.id),80);},validate,message:'Tier saved',locked});
  const {draft:d,set,field,errors} = form;
  const first = existing?.id === [...(db.tiers || [])].sort(tierSort)[0]?.id;
  const settings = db.tierSettings || {};
  const reward = d.entryReward || {type:'none',value:0};
  const pre = d.preReward || {enabled:false,within:100,type:'points',value:100};
  const summary = d.name + ': ' + (d.exclusive ? 'assigned manually' : d.threshold === 0 ? 'joins automatically' : 'reach by '+amount(d.threshold,settings.rule)+' in '+periodText(settings.period)) + '. Earns '+d.multiplier+'× points, gets '+rewardText(d.entryReward)+' on arrival.';
  if(id !== 'new' && !existing) return <PageFrame title="Tier not found" backUrl="/vip/tiers"><NotFound label="Tier" back="/vip/tiers"/></PageFrame>;
  return <PageFrame title={id==='new'?'New tier':d.name} backUrl="/vip/tiers" width="wide">
    <BlockStack gap="500">
      <Question detail="Set the milestone and benefits customers see when they reach this tier.">What does {d.name || 'this tier'} give customers?</Question>
      <EditorGrid main={<>
        <Section title="Tier and milestone"><BlockStack gap="300">
          <TextField label="Tier name" {...field('name')} autoComplete="off" disabled={locked}/>
          <TextField label="Tier name in another language" {...field('additionalName')} autoComplete="off" disabled={locked} helpText="Optional. Falls back to the main tier name."/>
          <NumberField label="Milestone to achieve" value={d.threshold} onChange={v=>set('threshold',v)} prefix={settings.rule==='spent'?'$':undefined} suffix={settings.rule==='points'?'points':settings.rule==='orders'?'orders':undefined} disabled={locked || first} error={errors.threshold}/>
          <NumberField label="Points multiplier" value={d.multiplier} onChange={v=>set('multiplier',v)} suffix="×" min={1} step={0.05} disabled={locked} error={errors.multiplier} helpText="Customers earn this many times the usual points on eligible orders."/>
          <Select label="Keeps tier for" value={d.keep==null?'forever':String(d.keep)} options={choices([['6','6 months'],['12','12 months'],['forever','Forever']])} disabled={locked} onChange={v=>set('keep',v==='forever'?null:Number(v))}/>
          <Checkbox label="Exclusive tier — assign customers manually" checked={Boolean(d.exclusive)} disabled={locked || first} onChange={v=>set('exclusive',v)}/>
          {first && <Checkbox label="Hide default tier on storefront" checked={Boolean(d.hideDefault)} disabled={locked} onChange={v=>set('hideDefault',v)}/>}
          {settings.tierPointEditing && <NumberField label="Tier points" value={d.tierPoints} onChange={v=>set('tierPoints',v)} suffix="points" disabled={locked}/>}
        </BlockStack></Section>
        <Section title="Entry reward"><BlockStack gap="300">
          <Select label="Reward when a customer arrives" value={reward.type} options={rewardTypes} disabled={locked} onChange={type=>set('entryReward',type==='none'?null:{type,value:type==='product'?'Glow Getter Set':type==='shipping'?0:100})}/>
          {reward.type!=='none' && reward.type!=='shipping' && <TextField label={reward.type==='product'?'Product':'Value'} type={reward.type==='product'?'text':'number'} value={String(reward.value??'')} autoComplete="off" disabled={locked} onChange={value=>set('entryReward',{...reward,value:reward.type==='product'?value:Number(value)})}/>}
          <Text as="p" variant="bodySm" tone="subdued">On arrival, the customer gets {rewardText(d.entryReward).toLowerCase()}.</Text>
        </BlockStack></Section>
        <Section title="Perks" description="Benefits that remain while the customer is in this tier."><PerksEditor items={d.perks || []} onChange={v=>set('perks',v)} locked={locked}/></Section>
        <Section title="Almost there reward"><BlockStack gap="300">
          <Checkbox label="Reward customers close to this tier" checked={pre.enabled} disabled={locked} onChange={v=>set('preReward',{...pre,enabled:v})}/>
          {pre.enabled && <><NumberField label="Within" value={pre.within} onChange={v=>set('preReward',{...pre,within:v})} suffix={settings.rule==='spent'?'$':settings.rule==='points'?'points':'orders'} disabled={locked}/>
          <Select label="Reward type" value={pre.type} options={rewardTypes.filter(x=>x.value!=='none')} disabled={locked} onChange={v=>set('preReward',{...pre,type:v})}/>
          <NumberField label="Reward value" value={pre.value} onChange={v=>set('preReward',{...pre,value:v})} disabled={locked}/></>}
        </BlockStack></Section>
        <Section title="Storefront identity"><BlockStack gap="300">
          <TextField label="Shopify customer tag" {...field('tag')} autoComplete="off" disabled={locked}/>
          <Select label="Tier colour" value={d.color} options={COLORS.map((color,i)=>({value:color,label:['Cloud','Silver','Gold','Black','Blue grey','Warm sand'][i]}))} disabled={locked} onChange={v=>set('color',v)}/>
          <InlineStack gap="200" blockAlign="center"><span className="rv-vip-swatch" style={{background:d.color}}/><Text as="span" variant="bodySm" tone="subdued">Storefront tier colour preview</Text></InlineStack>
          <Select label="Tier icon" value={d.icon || 'silver'} options={choices([['bronze','Bronze'],['silver','Silver'],['gold','Gold'],['black','Black']])} disabled={locked} onChange={v=>set('icon',v)}/>
          <img className="rv-vip-tier-art" src={TIER_ART[d.icon] || TIER_ART.silver} alt="Tier card preview"/>
        </BlockStack></Section>
      </>} rail={<Rail status={d.status || 'active'} onStatus={v=>set('status',v?'active':'inactive')} summary={summary} who={d.exclusive?'Assigned manually':'Members who reach '+amount(d.threshold,settings.rule)} limits={d.keep?'Keeps this tier for '+d.keep+' months':'Keeps this tier forever'} locked={locked}>
        <Section title="Members"><Text as="p">{num(d.members)} members in this tier</Text></Section>
        {id!=='new' && !first && <DeleteButton label="tier" disabled={locked} onClick={()=>confirm({title:'Delete '+d.name+'?',body:'Members in this tier will move to the next eligible tier. This cannot be undone.',action:'Delete tier',onConfirm:()=>{remove('tiers',id);notify('Tier deleted');navigate('/vip/tiers');}})}/>}
      </Rail>}/>
    </BlockStack>{modal}
  </PageFrame>;
}

export function TierSettings() {
  const {db, set:storeSet, merge} = useStore();
  const notify = useShell().notify;
  const {locked} = useVipState();
  const [tab,setTab] = useState(0);
  const [confirm,modal] = useConfirm();
  const source = db.tierSettings || {};
  const form = useVipDraft(source,{onSave:d=>storeSet(['tierSettings'],d),message:'Tier settings saved',locked});
  const {draft:d,set} = form;
  const update = (key,patch)=>set(key,{...(d[key] || {}),...patch});
  const tabs = ['Rules','Demotion','Launch','Sync','Design','Notifications'].map((content,id)=>({id:String(id),content}));
  const selected = [...(db.tiers || [])].sort(tierSort);
  const previewTier = selected[2] || selected[0];
  const nextTier = selected.find(t=>Number(t.threshold)>Number(previewTier?.threshold));
  const previewCustomer = (db.customers||[]).find(c=>c.tierId===previewTier?.id);
  const progress = nextTier && previewCustomer ? Math.max(0,Math.min(100,100*(Number(previewCustomer.tierProgress)-Number(previewTier.threshold))/(Number(nextTier.threshold)-Number(previewTier.threshold)))) : 100;
  const prediction = selected.slice(1,3).map(t=>num(t.members)+' customers move to '+t.name).join(', ') || 'Customer tiers will be recalculated';
  return <PageFrame title="VIP tier settings" backUrl="/vip/tiers" width="wide">
    <BlockStack gap="500">
      <Question detail="These rules decide when customers move up or down. Review the effect before relaunching.">How should the tier ladder run?</Question>
      <Tabs tabs={tabs} selected={tab} onSelect={setTab} fitted={false}/>
      {tab===0 && <EditorGrid main={<>
        <Section title="Level-up rule"><BlockStack gap="300">
          <Select label="Level-up rule" value={d.rule || 'spent'} options={ruleOptions} disabled={locked} onChange={v=>set('rule',v)}/>
          <Select label="Measure over" value={d.period || 'rolling12'} options={periodOptions} disabled={locked} onChange={v=>set('period',v)}/>
          <TextField type="date" label="Start date" value={d.startDate || ''} onChange={v=>set('startDate',v)} autoComplete="off" disabled={locked}/>
          <Select label="Count tier points from" value={d.pointsFrom || 'paid'} options={choices([['paid','Orders paid'],['fulfilled','Orders fulfilled']])} disabled={locked} onChange={v=>set('pointsFrom',v)}/>
          <Checkbox label="Exclude refunded orders" checked={Boolean(d.excludeRefunds)} disabled={locked} onChange={v=>set('excludeRefunds',v)}/>
        </BlockStack></Section>
        <Section title="Customer management"><BlockStack gap="300">
          <Checkbox label="Automatically tag VIP customers based on their tier" checked={Boolean(d.syncTags)} disabled={locked} onChange={v=>set('syncTags',v)}/>
          <TextField label="Customize tag prefix" value={d.tagPrefix || ''} autoComplete="off" disabled={locked || !d.syncTags} onChange={v=>set('tagPrefix',v)}/>
          <Checkbox label="Allow giving entry reward again after being downgraded" checked={Boolean(d.entryRewardRepeat)} disabled={locked} onChange={v=>set('entryRewardRepeat',v)}/>
          <Checkbox label="Enable tier point editing" checked={Boolean(d.tierPointEditing)} disabled={locked} onChange={v=>set('tierPointEditing',v)}/>
        </BlockStack></Section>
      </>} rail={<Section title="How this works"><Text as="p">Customers move up from {d.startDate || 'launch'} based on {d.rule === 'spent' ? 'money spent' : d.rule === 'points' ? 'points earned' : 'orders placed'} over {periodText(d.period)}. {d.excludeRefunds ? 'Refunded orders do not count.' : 'Refunded orders still count.'}</Text></Section>}/>}
      {tab===1 && <EditorGrid main={<>
        <Section title="Tier demotion"><BlockStack gap="300">
          <Select label="When a tier ends" value={d.demotion?.mode || 'end_of_period'} options={choices([['end_of_period','At the end of the period'],['never','Never'],['inactive','After no orders']])} disabled={locked} onChange={mode=>update('demotion',{mode})}/>
          {d.demotion?.mode==='inactive' && <TextField label="Demote after no orders for" type="number" suffix="days" value={String(d.inactiveDays || 180)} autoComplete="off" disabled={locked} onChange={v=>set('inactiveDays',Number(v))}/>}
          {d.demotion?.mode !== 'never' && <TextField label="Grace days" type="number" value={String(d.demotion?.graceDays ?? 30)} autoComplete="off" disabled={locked} onChange={v=>update('demotion',{graceDays:Number(v)})}/>}
          <Checkbox label="Notify customers before demotion" checked={Boolean(d.demotionNotify)} disabled={locked} onChange={v=>set('demotionNotify',v)}/>
          {d.demotion?.mode==='inactive' && <Select label="Choose the action" value={d.demotionAction||'previous'} options={choices([['previous','Downgrade to previous tier'],['lowest','Reset to lowest tier']])} disabled={locked} onChange={v=>set('demotionAction',v)}/>}
          {d.demotionNotify && <TextField label="Send warning email before" type="number" suffix="days" value={String(d.warningDays??14)} autoComplete="off" disabled={locked} onChange={v=>set('warningDays',Number(v))}/>}
        </BlockStack></Section>
        <Section title="Tier assessment"><BlockStack gap="300">
          <Checkbox label="Assess tiers on a cycle" checked={Boolean(d.tierAssessment)} disabled={locked || db.shop?.plan!=='ultimate'} onChange={v=>set('tierAssessment',v)}/>
          {db.shop?.plan!=='ultimate' && <Text as="p" variant="bodySm" tone="subdued">Available on Ultimate.</Text>}
          {d.tierAssessment && <><TextField label="Assessment cycle" type="number" suffix="months" value={String(d.assessmentCycle||12)} autoComplete="off" disabled={locked} onChange={v=>set('assessmentCycle',Number(v))}/><TextField label="Assessment offset" type="number" suffix="months" value={String(d.assessmentOffset||0)} autoComplete="off" disabled={locked} onChange={v=>set('assessmentOffset',Number(v))}/></>}
        </BlockStack></Section>
        <Section title="Scheduled tier reset"><BlockStack gap="300">
          <Checkbox label="Reset tier progress on a schedule" checked={Boolean(d.scheduledReset)} disabled={locked} onChange={v=>set('scheduledReset',v)}/>
          {d.scheduledReset && <><Select label="Reset frequency" value={d.resetFrequency || 'yearly'} options={choices([['monthly','Monthly'],['quarterly','Quarterly'],['halfyear','Half-yearly'],['yearly','Yearly'],['custom','Custom']])} disabled={locked} onChange={v=>set('resetFrequency',v)}/>
          {d.resetFrequency==='custom' && <TextField label="Every" type="number" value={String(d.resetEvery || 12)} suffix="months" autoComplete="off" disabled={locked} onChange={v=>set('resetEvery',Number(v))}/>}
          <TextField label="Anchor date" type="date" value={d.anchorDate || d.startDate || ''} autoComplete="off" disabled={locked} onChange={v=>set('anchorDate',v)}/></>}
        </BlockStack></Section>
      </>} rail={<Section title="What changes"><Text as="p">{d.demotion?.mode==='never'?'Customers keep their highest tier.':'Customers can move down after their assessment period.'} A grace period gives them time to qualify again.</Text></Section>}/>}
      {tab===2 && <EditorGrid main={<Section title="Launch or relaunch"><BlockStack gap="300">
        <Text as="p">Recalculate everyone now using the saved level-up rule. {prediction}.</Text>
        <Checkbox label="Give entry rewards again on relaunch" checked={Boolean(d.entryRewardOnRelaunch)} disabled={locked} onChange={v=>set('entryRewardOnRelaunch',v)}/>
        {d.entryRewardOnRelaunch && <Select label="Give rewards to" value={d.rewardAudience||'skip'} options={choices([['skip','Skip customers already rewarded'],['everyone','Everyone in the tier']])} disabled={locked} onChange={v=>set('rewardAudience',v)}/>}
        <TextField label="Change notes" value={d.launchNotes||''} multiline={3} autoComplete="off" disabled={locked} onChange={v=>set('launchNotes',v)}/>
        <div><Button variant="primary" disabled={locked || form.dirty} onClick={()=>confirm({title:d.launchStatus==='launched'?'Relaunch VIP tiers?':'Launch VIP tiers?',body:prediction+'. '+(d.entryRewardOnRelaunch?'Entry rewards will be granted again.':'Existing entry rewards will not be granted again.'),action:d.launchStatus==='launched'?'Relaunch':'Launch',destructive:false,onConfirm:()=>{merge(['tierSettings'],{launchStatus:'launched',enabled:true});notify('VIP tiers launched');}})}>{d.launchStatus==='launched'?'Relaunch program':'Launch program'}</Button></div>
        {form.dirty && <Text as="p" tone="subdued">Save your rule changes before relaunching.</Text>}
      </BlockStack></Section>} rail={<Section title="Estimated movement"><Text as="p">{prediction}.</Text></Section>}/>}
      {tab===3 && <EditorGrid main={<Section title="Keep Shopify in sync"><BlockStack gap="300">
        <Checkbox label="Sync customer tier tags" checked={Boolean(d.syncTags)} disabled={locked} onChange={v=>set('syncTags',v)}/>
        <Checkbox label="Sync tier metafields" checked={Boolean(d.syncMetafields)} disabled={locked} onChange={v=>set('syncMetafields',v)}/>
        <Button disabled={locked} onClick={()=>confirm({title:'Sync tier data now?',body:'Shopify customer tags and metafields will be updated from the current tier ladder.',action:'Sync now',destructive:false,onConfirm:()=>notify('Tier data synced')})}>Sync now</Button>
      </BlockStack></Section>} rail={<Section title="What sync updates"><Text as="p">Shopify customer records receive the current tier tag and metafield. Your tier rules stay the same.</Text></Section>}/>}
      {tab===4 && <EditorGrid main={<Section title="Tier card design"><BlockStack gap="300">
        <Select label="Preview for" value={d.design?.view||'after'} options={choices([['before','Before sign in'],['after','After sign in']])} disabled={locked} onChange={v=>update('design',{view:v})}/>
        <Select label="Badge style" value={d.design?.badgeStyle || 'rounded'} options={choices([['rounded','Rounded'],['square','Square'],['minimal','Minimal']])} disabled={locked} onChange={v=>update('design',{badgeStyle:v})}/>
        <Checkbox label="Show progress bar" checked={Boolean(d.design?.showProgress)} disabled={locked} onChange={v=>update('design',{showProgress:v})}/>
        <Checkbox label="Display store credit" checked={Boolean(d.design?.showStoreCredit)} disabled={locked} onChange={v=>update('design',{showStoreCredit:v})}/>
        <Select label="Balance layout" value={d.design?.balanceLayout || 'columns'} options={choices([['columns','Columns'],['centered','Centered'],['pill','Pill'],['rows','Rows']])} disabled={locked} onChange={v=>update('design',{balanceLayout:v})}/>
        <Select label="Balance order" value={d.design?.balanceOrder || 'points'} options={choices([['points','Points first'],['credit','Store credit first']])} disabled={locked} onChange={v=>update('design',{balanceOrder:v})}/>
        <Checkbox label="Hide zero store credit" checked={Boolean(d.design?.hideZeroCredit)} disabled={locked} onChange={v=>update('design',{hideZeroCredit:v})}/>
        <Select label="Card footer" value={d.design?.cardFooter || 'background'} options={choices([['background','Use background color'],['plain','Do not use background']])} disabled={locked} onChange={v=>update('design',{cardFooter:v})}/>
        <Select label="Content alignment" value={d.design?.alignment || 'center'} options={choices([['center','Center'],['left','Left'],['right','Right']])} disabled={locked} onChange={v=>update('design',{alignment:v})}/>
        <TextField label="Card opacity" type="number" suffix="%" value={String(d.design?.opacity ?? 100)} autoComplete="off" disabled={locked} onChange={v=>update('design',{opacity:Number(v)})}/>
        <TextField label="Box color" value={d.design?.boxColor||''} autoComplete="off" disabled={locked} onChange={v=>update('design',{boxColor:v})}/>
        <TextField label="Text color" value={d.design?.textColor||''} autoComplete="off" disabled={locked} onChange={v=>update('design',{textColor:v})}/>
        <TextField label="Icon color" value={d.design?.iconColor||''} autoComplete="off" disabled={locked} onChange={v=>update('design',{iconColor:v})}/>
        <TextField label="Button color" value={d.design?.buttonColor||''} autoComplete="off" disabled={locked} onChange={v=>update('design',{buttonColor:v})}/>
      </BlockStack></Section>} rail={<Section title="Storefront preview"><Card><BlockStack gap="200"><Text as="h3" variant="headingSm">{previewTier?.name || 'Tier'}</Text><Text as="p">{previewTier?.multiplier || 1}× points · {rewardText(previewTier?.entryReward)} on arrival</Text>{d.design?.showProgress && <div className="rv-vip-bar"><span style={{width:progress+'%'}}/></div>}</BlockStack></Card></Section>}/>}
      {tab===5 && <Section title="Customer notifications"><BlockStack gap="200"><Text as="p">Choose what customers hear when their tier changes.</Text><div><Button url="/settings/notifications/n-tierup">Tier upgrade notification</Button></div><div><Button url="/settings/notifications/n-tierdown">Tier demotion notification</Button></div></BlockStack></Section>}
    </BlockStack>{modal}
  </PageFrame>;
}
