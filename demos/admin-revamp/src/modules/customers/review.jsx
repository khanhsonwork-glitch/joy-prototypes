import React, {useState} from 'react';
import {BlockStack, Button, Card, Checkbox, InlineStack, Modal, Tabs, Text} from '@shopify/polaris';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, ScreenState, Section, num, points} from '../../ui/kit.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {Question, customerName, dateTime, stamp, today} from './common.jsx';

const TABS=[{kind:'review',name:'Reviews'},{kind:'receipt',name:'Receipts'},{kind:'google_review',name:'Google reviews'},{kind:'form',name:'Forms'}];

export function ReviewQueue() {
  const {db,upsert}=useStore(); const {notify}=useShell(); const {state}=useScenario();
  const [tab,setTab]=useState(0), [selected,setSelected]=useState([]), [detail,setDetail]=useState(null);
  const queue=state==='empty'?[]:(db.reviewQueue??[]).filter(x=>x.status==='pending');
  const shown=queue.filter(x=>x.kind===TABS[tab].kind);
  const decide=(ids,approved)=>{
    const items=(db.reviewQueue??[]).filter(x=>ids.includes(x.id)&&x.status==='pending');
    items.forEach(item=>{
      upsert('reviewQueue',{...item,status:approved?'approved':'rejected'});
      if(approved){const c=db.customers.find(x=>x.id===item.customerId);if(c)upsert('customers',{...c,points:Number(c.points||0)+Number(item.points||0),updated:today()});upsert('activity',{id:newId('ac'),customerId:item.customerId,kind:item.kind,program:item.program,points:item.points,at:stamp()});}
    });
    notify(`${num(items.length)} submission${items.length===1?'':'s'} ${approved?'approved':'rejected'}.`);setSelected([]);setDetail(null);
  };
  const toggle=id=>setSelected(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);
  return <PageFrame title="To review" backUrl="/customers" width="wide"><ScreenState>{({locked})=><BlockStack gap="500">
    <Question>Which customer submissions need a decision?</Question>
    <Section title="Waiting for review" description={`${num(queue.length)} submissions across reviews, receipts, Google reviews, and forms.`} flush>
      <Tabs tabs={TABS.map(x=>({id:x.kind,content:`${x.name} · ${num(queue.filter(q=>q.kind===x.kind).length)}`}))} selected={tab} onSelect={value=>{setTab(value);setSelected([])}} />
      {selected.length>0&&<div className="rv-customers-bulk"><InlineStack gap="200" blockAlign="center"><Text as="span">{selected.length} selected</Text><Button disabled={locked} onClick={()=>decide(selected,true)}>Approve</Button><Button disabled={locked} tone="critical" onClick={()=>decide(selected,false)}>Reject</Button></InlineStack></div>}
      {shown.length?<div className="rv-customers-rows">{shown.map(item=><div className="rv-customers-reviewrow" key={item.id}><Checkbox label={`Select ${customerName(db,item.customerId)}`} labelHidden checked={selected.includes(item.id)} onChange={()=>toggle(item.id)} /><div className="rv-customers-reviewbody"><Text as="p" fontWeight="semibold">{customerName(db,item.customerId)}</Text><Text as="p" tone="subdued" variant="bodySm">{item.content}</Text><Text as="p" tone="subdued" variant="bodySm">{item.media?`${item.media} media · `:''}{points(item.points)} to award · {dateTime(item.submitted)}</Text></div><InlineStack gap="100"><Button onClick={()=>setDetail(item)}>View</Button><Button disabled={locked} onClick={()=>decide([item.id],true)}>Approve</Button><Button disabled={locked} tone="critical" onClick={()=>decide([item.id],false)}>Reject</Button></InlineStack></div>)}</div>:<EmptyCard art="members" heading="All caught up">No {TABS[tab].name.toLowerCase()} are waiting for approval.</EmptyCard>}
    </Section>
    <Modal open={Boolean(detail)} onClose={()=>setDetail(null)} title={detail?`${TABS.find(x=>x.kind===detail.kind)?.name} from ${customerName(db,detail.customerId)}`:''} primaryAction={detail&&!locked?{content:'Approve',onAction:()=>decide([detail.id],true)}:undefined} secondaryActions={detail&&!locked?[{content:'Reject',destructive:true,onAction:()=>decide([detail.id],false)}]:[]}><Modal.Section>{detail&&<BlockStack gap="300"><Text as="p">{detail.content}</Text><Text as="p" tone="subdued">Submitted {dateTime(detail.submitted)} · {detail.media?`${detail.media} media attachment`:'No media'} · {points(detail.points)} if approved</Text>{detail.kind==='receipt'&&<Card><BlockStack gap="200"><Text as="h3" variant="headingSm">Ask AI summary</Text><Text as="p">The receipt appears to show a Pomelo Park purchase. Check the store, date, total, and item names against the uploaded image before approval.</Text><Button onClick={()=>notify('AI summary refreshed')}>Ask AI again</Button></BlockStack></Card>}</BlockStack>}</Modal.Section></Modal>
  </BlockStack>}</ScreenState></PageFrame>;
}
