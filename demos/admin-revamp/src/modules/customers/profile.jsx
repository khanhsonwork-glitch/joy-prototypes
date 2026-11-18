import React, {useMemo, useState} from 'react';
import {Banner, BlockStack, Box, Button, Card, Checkbox, InlineGrid, InlineStack, Modal, ProgressBar, Select, Tabs, Text, TextField} from '@shopify/polaris';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, Fact, ScreenState, Section, Stat, dateLabel, money, num, points, useConfirm} from '../../ui/kit.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {AdjustModal} from './list.jsx';
import {Question, activityKind, customerType, dateTime, stamp, tierName, today} from './common.jsx';

const ACTIVITY_TABS = ['All','Earned','Redeemed','Refunded','Expired'];

function PersonalEditor({customer, close}) {
  const {db, upsert} = useStore();
  const source = useMemo(()=>({...customer}),[customer]);
  const draft = useDraft(source,{onSave:value=>{upsert('customers',{...value,updated:today()});close()},validate:value=>({name:value.name?.trim()?'':'Enter a customer name.'}),message:'Customer details saved'});
  return <Modal open onClose={close} title="Edit personal information" primaryAction={{content:'Save',onAction:draft.save}} secondaryActions={[{content:'Cancel',onAction:()=>{draft.discard();close()}}]}><Modal.Section><BlockStack gap="300">
    <TextField label="Customer name" {...draft.field('name')} autoComplete="off" />
    <TextField label="Birthday" type="date" {...draft.field('birthday')} autoComplete="off" />
    <TextField label="Instagram username" {...draft.field('instagram')} autoComplete="off" />
    <Select label="Member status" {...draft.field('type')} options={[{label:'Guest',value:'guest'},{label:'Member',value:'member'},{label:'Left program',value:'left'}]} />
    <Select label="VIP tier" {...draft.field('tierId')} options={[{label:'No tier',value:''},...db.tiers.map(t=>({label:t.name,value:t.id}))]} />
    <Checkbox label="Exclusive tier" checked={Boolean(draft.draft.exclusiveTier)} onChange={value=>draft.set('exclusiveTier',value)} />
    <TextField label="Tier points" type="number" {...draft.field('tierProgress',{number:true})} autoComplete="off" />
    <TextField label="Customer became a member" type="date" {...draft.field('joined')} autoComplete="off" />
    <TextField label="Phone" {...draft.field('phone')} autoComplete="off" />
    <TextField label="Locale" {...draft.field('locale')} autoComplete="off" />
    <TextField label="Facebook account" {...draft.field('facebook')} autoComplete="off" />
    <Select label="Market" {...draft.field('marketMode')} options={[{label:'Auto resolve',value:'auto'},{label:'Override',value:'override'}]} />
    {draft.draft.marketMode==='override' && <TextField label="Region" {...draft.field('region')} autoComplete="off" />}
    <Checkbox label="Email marketing consent" checked={Boolean(draft.draft.emailConsent)} onChange={value=>draft.set('emailConsent',value)} />
    <Checkbox label="SMS marketing consent" checked={Boolean(draft.draft.smsConsent)} onChange={value=>draft.set('smsConsent',value)} />
  </BlockStack></Modal.Section></Modal>;
}

export function CustomerProfile({id}) {
  const {db, upsert, remove} = useStore(); const {notify} = useShell(); const {state} = useScenario();
  const [modal,setModal]=useState(''), [activityTab,setActivityTab]=useState(0), [credit,setCredit]=useState('0'), [note,setNote]=useState(''), [tag,setTag]=useState(''), [reward,setReward]=useState('');
  const [confirm,confirmation]=useConfirm();
  const customer = db.customers?.find(c=>c.id===id);
  if (!customer) return <PageFrame title="Customer" backUrl="/customers"><EmptyCard art="members" heading="Customer not found" action={{content:'Back to customers',url:'/customers'}}>This customer may have been merged or removed.</EmptyCard></PageFrame>;
  const acts = state==='empty'?[]:db.activity?.filter(a=>a.customerId===id)??[];
  const filter = ['all','earned','redeemed','refunded','expired'][activityTab];
  const visibleActs = acts.filter(a=>filter==='all'||a.kind===filter).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  const tier = db.tiers.find(t=>t.id===customer.tierId);
  const sortedTiers = [...(db.tiers??[])].sort((a,b)=>a.threshold-b.threshold);
  const next = sortedTiers.find(t=>t.threshold>Number(customer.tierProgress||0));
  const earned=acts.filter(a=>['earned','adjusted','refunded'].includes(a.kind)&&a.points>0).reduce((n,a)=>n+Number(a.points),0);
  const redeemed=acts.filter(a=>a.kind==='redeemed').reduce((n,a)=>n+Math.abs(Number(a.points)),0);
  const expired=acts.filter(a=>a.kind==='expired').reduce((n,a)=>n+Math.abs(Number(a.points)),0);
  const adjusted=acts.filter(a=>a.kind==='adjusted').reduce((n,a)=>n+Number(a.points),0);
  const amount=Number(credit);
  const saveCredit=()=>{if(!Number.isFinite(amount)||amount===0){notify('Enter a non-zero store credit amount.',{error:true});return;} upsert('customers',{...customer,storeCredit:Math.max(0,Number(customer.storeCredit||0)+amount),updated:today()});notify('Store credit adjusted');setModal('');};
  const redeem=()=>{const chosen=db.redeem?.find(r=>r.id===reward);if(!chosen){notify('Choose a reward.',{error:true});return;}if(chosen.cost>customer.points){notify('This customer does not have enough points.',{error:true});return;}upsert('customers',{...customer,points:customer.points-chosen.cost,updated:today(),coupons:[...(customer.coupons??[]),{id:newId('coupon'),name:chosen.name,at:stamp()}]});upsert('activity',{id:newId('ac'),customerId:id,kind:'redeemed',program:chosen.name,points:-chosen.cost,at:stamp()});notify('Reward redeemed for customer');setModal('');};
  const addNote=()=>{if(!note.trim()){notify('Write a note first.',{error:true});return;}upsert('customers',{...customer,notes:[...(customer.notes??[]),{id:newId('note'),text:note.trim(),at:stamp()}]});setNote('');notify('Note added');};
  const addTag=()=>{if(!tag.trim()){notify('Enter a tag.',{error:true});return;}upsert('customers',{...customer,tags:[...new Set([...(customer.tags??[]),tag.trim()])]});setTag('');notify('Customer tag added');};
  const referralLink=`https://${db.shop.domain}/refer/${id}`;
  const copy=()=>{navigator.clipboard?.writeText(referralLink).then(()=>notify('Referral link copied')).catch(()=>notify('Could not copy the link. Select and copy it manually.',{error:true}));};
  const deleteCustomer=()=>confirm({title:'Delete customer?',body:`Delete ${customer.name} from this sample shop? This removes the profile and its activity.`,action:'Delete customer',onConfirm:()=>{remove('customers',id);remove('activity',acts.map(a=>a.id));notify('Customer deleted');window.location.hash='#/customers';}});
  const recalculateTier=()=>{const matching=[...db.tiers].sort((a,b)=>b.threshold-a.threshold).find(t=>Number(customer.tierProgress||0)>=t.threshold);upsert('customers',{...customer,tierId:matching?.id??null,tierUpdated:today(),updated:today()});notify(`VIP tier recalculated: ${matching?.name??'no tier'}`);};
  const syncTier=()=>{upsert('customers',{...customer,lastTierSync:stamp()});notify('Shopify tier fields synced');};
  const birthdayReward=()=>{const program=db.earn?.find(e=>e.type==='birthday'&&e.status==='active');if(!program){notify('Enable the birthday earning program first.',{error:true});return;}const amount=Number(program.reward?.points||0);upsert('customers',{...customer,points:Number(customer.points||0)+amount,updated:today()});upsert('activity',{id:newId('ac'),customerId:id,kind:'earned',program:program.name,points:amount,at:stamp()});notify(`Birthday reward sent: ${points(amount)}`);};
  return <PageFrame title={customer.name} backUrl="/customers" width="wide" secondaryActions={[{content:'Adjust points',disabled:state==='disabled',onAction:()=>setModal('points')},{content:'Edit customer',disabled:state==='disabled',onAction:()=>setModal('personal')}]}>
    <ScreenState>{({locked,overflow})=><BlockStack gap="500">
      <Question>What has {customer.name} earned, used, and shared?</Question>
      <InlineGrid columns={{xs:1,md:'2fr 1fr'}} gap="500" alignItems="start">
        <BlockStack gap="500">
          <Section title="Points" description="Balance and the transactions behind it."><BlockStack gap="400"><Stat label="Available balance" value={points(overflow?999999999:customer.points)} /><InlineGrid columns={{xs:2,sm:4}} gap="300"><Fact label="Earned">{points(earned)}</Fact><Fact label="Redeemed">{points(redeemed)}</Fact><Fact label="Expired">{points(expired)}</Fact><Fact label="Adjusted">{points(adjusted)}</Fact></InlineGrid><InlineStack gap="200"><Button disabled={locked} onClick={()=>setModal('points')}>Adjust points</Button><Button disabled={locked} onClick={()=>setModal('redeem')}>Redeem for customer</Button></InlineStack></BlockStack></Section>
          <Section title="Activity" description="Every points and loyalty change for this customer."><BlockStack gap="300"><Tabs tabs={ACTIVITY_TABS.map(x=>({id:x.toLowerCase(),content:x}))} selected={activityTab} onSelect={setActivityTab} /><div className="rv-customers-timeline">{visibleActs.length?visibleActs.map(a=><div className="rv-customers-event" key={a.id}><div><Text as="p" fontWeight="semibold">{a.program}</Text><Text as="p" tone="subdued" variant="bodySm">{activityKind(a.kind)} · {dateTime(a.at)}</Text></div><Text as="span" numeric>{a.points?points(a.points):'—'}</Text></div>):<Text as="p" tone="subdued">No activity in this view.</Text>}</div></BlockStack></Section>
          <Section title="Coupons"><BlockStack gap="200">{state!=='empty'&&(customer.coupons??[]).length?(customer.coupons??[]).map(c=><Fact key={c.id} label={dateTime(c.at)}>{c.name}</Fact>):<Text as="p" tone="subdued">No coupons yet. Redeemed discounts appear here.</Text>}</BlockStack></Section>
          <Section title="Pending rewards"><BlockStack gap="200">{state!=='empty'&&(customer.pendingRewards??[]).length?customer.pendingRewards.map(r=><Fact key={r.id} label={r.name}>{points(r.points)}</Fact>):<Text as="p" tone="subdued">No rewards waiting to be claimed.</Text>}</BlockStack></Section>
          <Section title="Pending points"><Fact label="Waiting for order completion">{points(customer.pendingPoints??0)}</Fact></Section>
          <Section title="Referrals"><BlockStack gap="300"><TextField label="Referral link" value={referralLink} readOnly autoComplete="off" connectedRight={<Button onClick={copy}>Copy</Button>} /><InlineGrid columns={{xs:2,sm:3}} gap="300"><Fact label="Pending">{num(customer.referralsPending??0)}</Fact><Fact label="Completed">{num(customer.referralsCompleted??0)}</Fact><Fact label="Conversion">{num(customer.referralsCompleted??0)} of {num((customer.referralsPending??0)+(customer.referralsCompleted??0))}</Fact></InlineGrid></BlockStack></Section>
          <Section title="Referral history"><BlockStack gap="200">{state!=='empty'&&(customer.referralHistory??[]).length?customer.referralHistory.map(r=><Fact key={r.id} label={dateLabel(r.at)}>{r.name} · {r.status}</Fact>):<Text as="p" tone="subdued">No referred customers yet.</Text>}</BlockStack></Section>
          <Section title="Environmental impact"><Fact label="Trees planted">{num(customer.impactTrees??0)}</Fact></Section>
          {customer.type==='member' && <Section title="Milestone progress"><Text as="p" tone="subdued">{num(customer.milestonesReached??0)} milestones reached. New milestones show here as customers earn points.</Text></Section>}
          <Section title="Quiz answers"><Text as="p" tone="subdued">{customer.quizAnswers?.length?customer.quizAnswers.join(' · '):'No quiz answers yet.'}</Text></Section>
        </BlockStack>
        <BlockStack gap="500">
          <Section title="Personal information" action={<Button disabled={locked} onClick={()=>setModal('personal')}>Edit</Button>}><BlockStack gap="200"><Fact label="Email">{customer.email}</Fact><Fact label="Phone">{customer.phone||'—'}</Fact><Fact label="Birthday">{dateLabel(customer.birthday)}</Fact><Fact label="Instagram">{customer.instagram||'—'}</Fact><Fact label="Facebook">{customer.facebook||'—'}</Fact><Fact label="Locale">{customer.locale||'—'}</Fact><Fact label="Market">{customer.marketMode==='override'?(customer.region||'Override'):'Auto resolve'}</Fact><Fact label="Email marketing">{customer.emailConsent?'Subscribed':'Not subscribed'}</Fact><Fact label="SMS marketing">{customer.smsConsent?'Subscribed':'Not subscribed'}</Fact><Fact label="Member status">{customerType(customer.type)}</Fact><Fact label="Member since">{dateLabel(customer.joined)}</Fact><Fact label="Last order">{dateLabel(customer.lastOrder)}</Fact><Fact label="Last updated">{dateLabel(customer.updated)}</Fact></BlockStack></Section>
          <Section title="Membership"><BlockStack gap="300"><Fact label="VIP tier">{tierName(db,customer.tierId)}{customer.exclusiveTier?' · Exclusive':''}</Fact>{tier&&<><Text as="p" variant="bodySm">{db.tierSettings?.rule==='spent'?money(customer.tierProgress):points(customer.tierProgress)} towards {next?next.name:'the highest tier'}</Text><ProgressBar progress={next?Math.min(100,100*Number(customer.tierProgress||0)/next.threshold):100} size="small" /><Text as="p" variant="bodySm" tone="subdued">{next?`${db.tierSettings?.rule==='spent'?money(Math.max(0,next.threshold-customer.tierProgress)):points(Math.max(0,next.threshold-customer.tierProgress))} to ${next.name}`:'Highest tier reached'}</Text></>}<InlineStack gap="100"><Button disabled={locked} onClick={recalculateTier}>Recalculate tier</Button><Button disabled={locked} onClick={syncTier}>Sync Shopify tier</Button><Button disabled={locked} onClick={birthdayReward}>Trigger birthday reward</Button></InlineStack>{customer.lastTierSync&&<Text as="p" variant="bodySm" tone="subdued">Last synced {dateTime(customer.lastTierSync)}</Text>}</BlockStack></Section>
          <Section title="Store credit" action={<Button disabled={locked} onClick={()=>setModal('credit')}>Adjust</Button>}><Fact label="Balance">{money(customer.storeCredit??0)}</Fact></Section>
          <Section title="Customer tags"><BlockStack gap="200"><Text as="p">{(customer.tags??[]).length?customer.tags.join(', '):'No tags'}</Text><InlineStack gap="200"><div className="rv-customers-grow"><TextField label="Add a tag" labelHidden value={tag} onChange={setTag} autoComplete="off" /></div><Button disabled={locked} onClick={addTag}>Add</Button></InlineStack>{(customer.tags??[]).map(t=><Button key={t} variant="plain" tone="critical" disabled={locked} onClick={()=>{upsert('customers',{...customer,tags:customer.tags.filter(x=>x!==t)});notify('Tag removed')}}>Remove {t}</Button>)}</BlockStack></Section>
          <Section title="Notes"><BlockStack gap="200">{(customer.notes??[]).map(n=><Text as="p" key={n.id}>{n.text} · {dateTime(n.at)}</Text>)}<TextField label="Add a note" labelHidden value={note} onChange={setNote} multiline={2} autoComplete="off" /><Button disabled={locked} onClick={addNote}>Add note</Button></BlockStack></Section>
          <Section title="Integrations"><Text as="p" tone="subdued">Customer data is ready to sync with connected integrations.</Text><Box paddingBlockStart="200"><Button disabled={locked} onClick={()=>notify('Customer integrations synced')}>Sync now</Button></Box></Section>
        </BlockStack>
      </InlineGrid>
      <Section title="Remove customer" description="Delete this sample customer and their loyalty activity."><Button variant="plain" tone="critical" disabled={locked} onClick={deleteCustomer}>Delete customer</Button></Section>
      <AdjustModal open={modal==='points'} onClose={()=>setModal('')} ids={[id]} />
      {modal==='personal' && <PersonalEditor customer={customer} close={()=>setModal('')} />}
      <Modal open={modal==='credit'} onClose={()=>setModal('')} title="Adjust store credit" primaryAction={{content:'Adjust credit',onAction:saveCredit}} secondaryActions={[{content:'Cancel',onAction:()=>setModal('')}]}><Modal.Section><BlockStack gap="300"><TextField label="Amount to add or remove" type="number" value={credit} onChange={setCredit} autoComplete="off" /><Banner tone="info">{money(customer.storeCredit??0)} → {money(Math.max(0,Number(customer.storeCredit||0)+(Number.isFinite(amount)?amount:0)))}</Banner></BlockStack></Modal.Section></Modal>
      <Modal open={modal==='redeem'} onClose={()=>setModal('')} title="Redeem for customer" primaryAction={{content:'Redeem',onAction:redeem}} secondaryActions={[{content:'Cancel',onAction:()=>setModal('')}]}><Modal.Section><BlockStack gap="300"><Select label="Reward" value={reward} options={[{label:'Choose a reward',value:''},...(db.redeem??[]).filter(r=>r.status==='active').map(r=>({label:`${r.name} · ${points(r.cost)}`,value:r.id}))]} onChange={setReward} /><Text as="p" tone="subdued">Available: {points(customer.points)}. Redeeming deducts the reward cost immediately.</Text></BlockStack></Modal.Section></Modal>
      {confirmation}
    </BlockStack>}</ScreenState>
  </PageFrame>;
}
