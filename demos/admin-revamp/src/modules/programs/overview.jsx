import React, {useMemo, useState} from 'react';
import {Banner, BlockStack, Box, Button, Card, IndexFilters, IndexTable, InlineGrid, InlineStack, Modal, Select, Text, TextField} from '@shopify/polaris';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, Fact, PlanBadge, ScreenState, Section, Stat, StatusBadge, Switch, eligibilityLabel, num, money, pct, points, useConfirm, usePlan} from '../../ui/kit.jsx';
import {useStore} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {rewardText} from './common.jsx';

const KINDS = ['All', 'Earn', 'Reward', 'Referral', 'Milestone', 'Quiz', 'VIP perk', 'Member deal', 'Paid membership'];
function rowsFrom(db) {
  const row = (item, kind, url, give, who, coll, last30) => ({id:`${kind}-${item.id || item.name}`, item, kind, url, give, who, coll, last30:last30 ?? null});
  return [
    ...(db.earn || []).map(x=>row(x,'Earn',`/programs/points/earn/${x.id}`, rewardText(x.reward), x.eligibility,'earn',x.completions)),
    ...(db.redeem || []).map(x=>row(x,'Reward',`/programs/points/rewards/${x.id}`,`${(x.type==='bxgy'?`Buy ${x.buy}, get ${x.get} free`:rewardText({type:x.type, value:x.value || x.product}))} for ${points(x.cost)}`, x.eligibility,'redeem',x.redemptions)),
    db.referral && row({...db.referral,id:'referral'},'Referral','/programs/referrals',`${rewardText(db.referral.friend)} for friends · ${rewardText(db.referral.referrer)} for referrers`,{mode:'all'},'referral',db.referral.stats?.referred),
    ...(db.milestones || []).map(x=>row(x,'Milestone',`/programs/milestones/${x.id}`,x.steps?.map(s=>rewardText(s.reward)).join(' · ') || 'No reward',x.eligibility,'milestones',x.reached)),
    ...(db.quizzes || []).map(x=>row(x,'Quiz',`/programs/quizzes/${x.id}`,rewardText(x.reward),x.eligibility,'quizzes',x.completions)),
    ...(db.tiers || []).flatMap(t=>[...((t.perks || []).map((perk,i)=>row({id:`${t.id}-perk-${i}`,name:perk,status:'active'},'VIP perk',`/vip/tiers/${t.id}`,perk,{mode:'tiers',tiers:[t.id]},null,null))), ...(t.entryReward ? [row({id:`${t.id}-entry`,name:`${t.name} entry reward`,status:'active'},'VIP perk',`/vip/tiers/${t.id}`,rewardText(t.entryReward),{mode:'tiers',tiers:[t.id]},null,null)] : [])]),
    ...(db.deals || []).map(x=>row(x,'Member deal',`/vip/deals/${x.id}`,rewardText(x.discount),x.eligibility,'deals',null)),
    ...(db.paidPlans || []).map(x=>row(x,'Paid membership',`/vip/paid/${x.id}`,`${money(x.price)} / ${x.interval}`,{mode:'tiers',tiers:[x.tierId]},'paidPlans',null)),
  ].filter(Boolean);
}
function qualifies(who, tierId) {
  if (!tierId) return true;
  if (!who || who.mode === 'all' || who.mode === 'members') return true;
  if (who.mode === 'tiers') return (who.tiers || []).includes(tierId);
  return false;
}
const createOptions=[['Way to earn','/programs/points/earn/new','Points','free'],['Reward','/programs/points/rewards/new','Points','free'],['Milestone','/programs/milestones/new','Engagement','advanced'],['Quiz','/programs/quizzes/new','Engagement','advanced'],['Member deal','/vip/deals/new','Membership','essential'],['VIP tier','/vip/tiers/new','Membership','advanced']];
export function Overview() {
  const {db, merge, upsert} = useStore();
  const navigate = useNavigate(); const {notify}=useShell(); const {state}=useScenario(); const plan=usePlan();
  const [createOpen,setCreateOpen]=useState(false); const [createQuery,setCreateQuery]=useState('');
  const [tab,setTab]=useState(0); const [search,setSearch]=useState(''); const [who,setWho]=useState('all'); const [sort,setSort]=useState('name');
  const [confirm, confirmModal]=useConfirm();
  const all=useMemo(()=>rowsFrom(db),[db]);
  const visible=useMemo(()=>{
    let r=state==='empty'?[]:all;
    if(tab) r=r.filter(x=>x.kind===KINDS[tab]);
    if(who==='members') r=r.filter(x=>x.who?.mode!=='all');
    else if(who!=='all') r=r.filter(x=>qualifies(x.who,who));
    if(search) r=r.filter(x=>`${x.item.name} ${x.kind} ${x.give}`.toLowerCase().includes(search.toLowerCase()));
    return [...r].sort((a,b)=>sort==='activity'?b.last30-a.last30:a.item.name.localeCompare(b.item.name));
  },[all,state,tab,who,search,sort]);
  const tabs=KINDS.map((kind,i)=>({content:`${kind} (${i?all.filter(r=>r.kind===kind).length:all.length})`,id:`kind-${i}`}));
  const toggle=(r)=>{if(!r.coll || !r.item.status)return; const next=r.item.status==='active'?'inactive':'active'; if(r.coll==='referral')merge(['referral'],{status:next});else upsert(r.coll,{...r.item,status:next});notify(`${r.item.name} ${next==='active'?'turned on':'turned off'}`);};
  return <PageFrame title="All programs" primaryAction={{content:'Create program',onAction:()=>setCreateOpen(true),disabled:state==='disabled'}} width="wide">
    <ScreenState>{({locked,overflow})=><BlockStack gap="500">
      <Text as="p" variant="bodyMd">See what customers can earn, use, and unlock across your loyalty program.</Text>
      <InlineGrid columns={{xs:2,md:4}} gap="300"><Stat label="Active programs" value={num(all.filter(r=>r.item.status==='active').length)}/><Stat label="Members" value={num(db.stats?.last30?.members)}/><Stat label="Points earned · 30 days" value={points(db.stats?.last30?.pointsEarned)}/><Stat label="Redemption rate" value={pct(db.stats?.last30?.redemptionRate)}/></InlineGrid>
      <Card><InlineStack align="space-between" blockAlign="center" gap="300"><BlockStack gap="100"><InlineStack gap="200" blockAlign="center"><Text as="h2" variant="headingSm">Program is {db.program?.status === 'live'?'live':db.program?.status==='sandbox'?'in sandbox':'paused'}</Text><StatusBadge status={db.program?.status}/></InlineStack><Text as="p" tone="subdued" variant="bodySm">{db.program?.status==='sandbox'?'Only test customers can see and use your program.':db.program?.status==='paused'?'Customers cannot earn or redeem right now.':'Customers can earn and redeem with active programs.'}</Text></BlockStack><InlineStack gap="200" blockAlign="center"><Switch label="Program live" checked={db.program?.status==='live'} disabled={locked} onChange={on=>{merge(['program'],{status:on?'live':'paused'});notify(on?'Program is live':'Program paused');}}/>{db.program?.status==='sandbox'&&<Button disabled={locked} onClick={()=>confirm({title:'Go live?',body:'All active programs will become available to eligible customers.',action:'Go live',destructive:false,onConfirm:()=>{merge(['program'],{status:'live'});notify('Program is live');}})}>Go live</Button>}</InlineStack></InlineStack>{db.program?.status==='sandbox'&&<Box paddingBlockStart="300"><Text as="p" variant="bodySm">Test customers: {(db.program.testCustomers||[]).join(', ') || 'None added'}</Text></Box>}</Card>
      <Section title="Programs" description="Find everything a customer can get in one place." flush>
        <BlockStack gap="300">
          <div className="rv-programs-filters"><IndexFilters tabs={tabs} selected={tab} onSelect={setTab} canCreateNewView={false} filters={[]} appliedFilters={[]} queryValue={search} queryPlaceholder="Search programs" onQueryChange={setSearch} onQueryClear={()=>setSearch('')} sortOptions={[{label:'Name',value:'name',directionLabel:'A to Z'},{label:'Last 30 days',value:'activity',directionLabel:'Most first'}]} sortSelected={[sort]} onSort={v=>setSort(v[0])} mode="default" setMode={()=>{}}/></div>
          <div className="rv-programs-list-tools"><TextField label="Search programs" labelHidden placeholder="Search programs" value={search} onChange={setSearch} autoComplete="off" clearButton onClearButtonClick={()=>setSearch('')}/><Select label="Sort by" labelInline value={sort} onChange={setSort} options={[{label:'Name',value:'name'},{label:'Last 30 days',value:'activity'}]}/></div>
          <Box paddingInline="300"><Select label="Who can get it" labelInline value={who} onChange={setWho} options={[{label:'All customers',value:'all'},{label:'Members',value:'members'},...(db.tiers||[]).map(t=>({label:t.name,value:t.id}))]}/></Box>
          {visible.length?<><div className="rv-programs-desktop-table"><IndexTable resourceName={{singular:'program',plural:'programs'}} itemCount={visible.length} selectable={false} headings={[{title:'Program'},{title:'Kind'},{title:'Who'},{title:'Gives / costs'},{title:'Status'},{title:'Last 30 days'}]}>{visible.map((r,i)=><IndexTable.Row id={r.id} key={r.id} position={i} onClick={()=>navigate(r.url)}><IndexTable.Cell><Text as="span" fontWeight="semibold">{overflow?`${r.item.name} — limited seasonal members and partners with an exceptionally long descriptive name`:r.item.name}</Text></IndexTable.Cell><IndexTable.Cell>{r.kind}</IndexTable.Cell><IndexTable.Cell>{eligibilityLabel(r.who,db)}</IndexTable.Cell><IndexTable.Cell>{r.give}</IndexTable.Cell><IndexTable.Cell><div onClick={event=>event.stopPropagation()}>{r.coll?<Switch label={`Turn ${r.item.name} on or off`} checked={r.item.status==='active'} disabled={locked} onChange={()=>toggle(r)}/>:<Button variant="plain" url={r.url}>View tier</Button>}</div></IndexTable.Cell><IndexTable.Cell>{num(r.last30)}</IndexTable.Cell></IndexTable.Row>)}</IndexTable></div><div className="rv-programs-mobile-list">{visible.map(r=><div className="rv-programs-mobile-row" key={r.id}><div className="rv-programs-mobile-top"><button type="button" className="rv-programs-mobile-name" onClick={()=>navigate(r.url)}>{r.item.name}</button>{r.coll?<Switch label={`Turn ${r.item.name} on or off`} checked={r.item.status==='active'} disabled={locked} onChange={()=>toggle(r)}/>:<Button variant="plain" size="slim" url={r.url}>View tier</Button>}</div><Text as="p" tone="subdued" variant="bodySm">{r.kind} · {eligibilityLabel(r.who,db)} · {r.give}</Text></div>)}</div></>:<EmptyCard heading={search?'No programs match your search':'No programs yet'} action={locked?null:{content:'Create program',onAction:()=>setCreateOpen(true)}}>Create a way to earn or a reward to get started.</EmptyCard>}
        </BlockStack>
      </Section>
    </BlockStack>}</ScreenState>
    <Modal open={createOpen} onClose={()=>setCreateOpen(false)} title="Create a program"><Modal.Section><BlockStack gap="300"><TextField label="Find a type" value={createQuery} onChange={setCreateQuery} autoComplete="off"/>{['Points','Engagement','Membership'].map(group=>{const options=createOptions.filter(([name,,g])=>g===group&&name.toLowerCase().includes(createQuery.toLowerCase()));return options.length?<BlockStack key={group} gap="200"><Text as="h3" variant="headingSm">{group}</Text>{options.map(([name,url,,required])=><Button key={name} fullWidth textAlign="left" disabled={!plan.allows(required)} onClick={()=>{setCreateOpen(false);navigate(url);}}><InlineStack gap="200" blockAlign="center">{name}<PlanBadge plan={required}/>{!plan.allows(required)&&`Upgrade to ${plan.label(required)}`}</InlineStack></Button>)}</BlockStack>:null})}</BlockStack></Modal.Section></Modal>{confirmModal}
  </PageFrame>;
}
