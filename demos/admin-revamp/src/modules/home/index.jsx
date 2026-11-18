import React, {useMemo, useState} from 'react';
import {Badge, Banner, BlockStack, Box, Button, Card, Divider, InlineGrid, InlineStack, ProgressBar, Text, TextField} from '@shopify/polaris';
import {MKT_ART} from '../../assets/index.js';
import {useScenario} from '../../kit/scenario.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useStore} from '../../state/store.jsx';
import {Section, ScreenState, EmptyCard, Stat, StatusBadge, Switch, dateLabel, money, num, pct, points, useConfirm, usePlan} from '../../ui/kit.jsx';
import {PageFrame} from '../../ui/page.jsx';

const STEPS = [
  {id:'accounts', label:'Enable customer accounts', group:'Set up your program', advanced:'Program rules', route:'/settings?type=general', done:db=>db.settings?.general?.customerAccounts === true},
  {id:'migrate', label:'Migrate customer data', group:'Set up your program', advanced:'Program rules', route:'/customers/migration', done:db=>db.customers?.length > 0},
  {id:'earn', label:'Set up point earning rules', group:'Set up your program', advanced:'Program rules', route:'/programs/points', done:db=>db.earn?.some(x=>x.status==='active')},
  {id:'redeem', label:'Set up point redeeming rules', group:'Set up your program', advanced:'Program rules', route:'/programs/points', done:db=>db.redeem?.some(x=>x.status==='active')},
  {id:'point-name', label:'Choose a point label', group:'Set up your program', advanced:'Program rules', route:'/programs/points', done:db=>Boolean(db.program?.point?.singular)},
  {id:'prefix', label:'Set a discount code prefix', group:'Set up your program', advanced:'Program rules', route:'/settings?type=general', done:db=>Boolean(db.settings?.general?.discountPrefix)},
  {id:'vip', label:'Set up VIP tiers', group:'Set up your program', advanced:'Program rules', route:'/membership', done:db=>db.tierSettings?.enabled && db.tiers?.length>1},
  {id:'brand', label:'Set your brand color and logo', group:'Set up your program', advanced:'Branding & touchpoints', route:'/settings?type=colors', done:db=>Boolean(db.settings?.brand?.logo)},
  {id:'widget', label:'Set up the loyalty widget', group:'Set up your program', advanced:'Branding & touchpoints', route:'/store', done:db=>db.onsite?.surfaces?.some(x=>x.id==='widget'&&x.status==='live')},
  {id:'page', label:'Create a loyalty page', group:'Set up your program', advanced:'Branding & touchpoints', route:'/store', done:db=>db.onsite?.surfaces?.some(x=>x.id==='page'&&x.status==='live')},
  {id:'product-cart', label:'Show points on product and cart pages', group:'Set up your program', advanced:'Branding & touchpoints', route:'/store', done:db=>['product','cart'].every(id=>db.onsite?.surfaces?.some(x=>x.id===id&&x.status==='live'))},
  {id:'visibility', label:'Improve loyalty program visibility', group:'Set up your program', advanced:'Branding & touchpoints', route:'/store', done:db=>db.onsite?.surfaces?.filter(x=>x.status==='live').length>=3},
  {id:'account-page', label:'Show loyalty on the account page', group:'Set up your program', advanced:'Branding & touchpoints', route:'/store', done:db=>db.onsite?.surfaces?.some(x=>x.id==='account'&&x.status==='live')},
  {id:'thankyou', label:'Show loyalty on the thank you page', group:'Set up your program', advanced:'Branding & touchpoints', route:'/store', done:db=>db.onsite?.surfaces?.some(x=>x.id==='thankyou'&&x.status==='live')},
  {id:'email', label:'Enable email notifications', group:'Set up your program', advanced:'Engagement', route:'/settings?type=notifications', done:db=>db.notifications?.some(x=>x.enabled)},
  {id:'referral', label:'Enable referrals', group:'Set up your program', advanced:'Engagement', route:'/programs/referral', done:db=>db.referral?.status==='active'},
  {id:'integrations', label:'Set up integrations', group:'Set up your program', advanced:'Advanced features', route:'/integrations', done:db=>db.integrations?.some(x=>x.connected)},
  {id:'flow', label:'Set up Shopify Flow', group:'Set up your program', advanced:'Advanced features', route:'/integrations/flow', done:db=>db.integrations?.some(x=>x.id==='flow'&&x.connected)},
  {id:'checkout', label:'Set up checkout extensions', group:'Go live', advanced:'Advanced features', route:'/store', done:db=>db.onsite?.surfaces?.some(x=>x.id==='checkout'&&x.status==='live')},
  {id:'launch', label:'Switch from sandbox to live', group:'Go live', advanced:'Launch & optimize', route:'/home', done:db=>db.program?.status==='live'},
  {id:'analytics', label:'Check analytics for performance', group:'Go live', advanced:'Launch & optimize', route:'/analytics', done:db=>db.home?.dismissed?.includes('analytics-checked')},
];
const nowGreeting = () => {const d=new Date(), h=d.getHours(), m=d.getMonth()+1, day=d.getDate(); if(m===1&&day<=7)return 'Happy New Year'; if(m===12&&day>=20)return 'Happy holidays'; if(m===10&&day===31)return 'Happy Halloween'; return h<12?'Good morning':h<17?'Good afternoon':'Good evening';};
const sparkline = daily => {const values=(daily||[]).map(x=>Number(x.joy)||0); if(!values.length)return ''; const min=Math.min(...values), max=Math.max(...values); return values.map((v,i)=>`${i*300/Math.max(values.length-1,1)},${64-(v-min)*50/Math.max(max-min,1)}`).join(' ');};

function Home() {
  const {db, set, merge} = useStore();
  const {notify} = useShell();
  const navigate = useNavigate();
  const [confirm, modal] = useConfirm();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [ask, setAsk] = useState('');
  const [reply, setReply] = useState('');
  const {state} = useScenario();
  const {plan} = usePlan();
  const isEmpty = state === 'empty';
  const home = db.home || {};
  const dismissed = home.dismissed || [];
  const dismiss = id => {set(['home','dismissed'], [...dismissed,id]); notify('Dismissed from Home');};
  const steps = STEPS.map(step=>({...step, complete:Boolean(step.done(db))}));
  const completed = steps.filter(s=>s.complete).length;
  const pending = isEmpty ? [] : (db.reviewQueue||[]).filter(x=>x.status==='pending');
  const disconnected = (db.integrations||[]).find(x=>x.id==='judgeme'&&!x.connected);
  const usage = home.usage || {};
  const nearOrderLimit = plan!=='ultimate' && usage.orderLimit>0 && usage.orders/usage.orderLimit>=0.9;
  const alerts = isEmpty ? [] : [...(home.alerts||[]), ...(nearOrderLimit?[{id:'order-limit',title:'You are close to your order limit',detail:`${num(usage.orders)} of ${num(usage.orderLimit)} monthly orders used. Review your plan so new orders keep earning points.`,route:'/settings?type=subscription',tone:'warning'}]:[]), ...(disconnected?[{id:'integration-disconnected',title:'Judge.me is disconnected',detail:'Review rewards will not sync until you reconnect it.',route:'/integrations/judgeme',tone:'warning'}]:[])].filter(a=>!dismissed.includes(a.id));
  const attentionCount = pending.length+alerts.length;
  const metrics = db.stats?.last30 || {};
  const activity = isEmpty ? [] : (db.activity||[]).slice(0,5);
  const surfaces = db.onsite?.surfaces || [];
  const liveSurfaces = surfaces.filter(x=>x.status==='live').length;
  const status = db.program?.status || 'sandbox';
  const nextStatus = status==='live'?'paused':'live';
  const toggleProgram = () => confirm({title:nextStatus==='paused'?'Pause your loyalty program?':'Make your loyalty program live?',body:nextStatus==='paused'?'Customers will stop earning and redeeming points until you turn it back on.':'Customers can earn and redeem points on your store.',action:nextStatus==='paused'?'Pause program':'Go live',destructive:nextStatus==='paused',onConfirm:()=>{merge(['program'],{status:nextStatus});notify(nextStatus==='paused'?'Program paused':'Program is live');}});
  const submitAsk = () => {if(!ask.trim())return; const q=ask.toLowerCase(); setReply(q.includes('redeem')?'Open Reward programs to check what customers can buy with points. You can edit each reward there.':q.includes('member')?'Open Customers to see member balances and VIP tiers. Analytics shows how members perform over time.':'Your loyalty program is live. Start with Needs your attention, then check the last 30 days below.'); setAsk('');};
  return <PageFrame title="Home" width="wide">
    <ScreenState>{({locked,overflow}) => <div className="rv-home-layout">
      <div className="rv-home-main"><BlockStack gap="600">
        <div className="rv-home-intro"><BlockStack gap="100"><Text as="h1" variant="headingLg">{nowGreeting()}, {db.shop?.owner || 'there'}</Text><Text as="p" tone="subdued">Is your program working, and is there anything you should do today?</Text></BlockStack></div>
        <Card><div className="rv-home-status"><div><InlineStack gap="200" blockAlign="center"><StatusBadge status={status} label={status==='sandbox'?'Sandbox':status==='live'?'Program live':'Paused'}/><Text as="span" variant="bodySm" tone="subdued">{db.shop?.name}</Text></InlineStack><div className="rv-home-status__number"><Text as="span" variant="headingXl">{money(overflow?999999999:metrics.revenueByJoy)}</Text><Text as="span" tone="subdued">Revenue by Joy · last 30 days</Text></div></div><div className="rv-home-status__side"><Text as="span" variant="headingMd">{num(overflow?9999999:metrics.members)}</Text><Text as="span" tone="subdued">loyalty members</Text><Switch checked={status==='live'} onChange={toggleProgram} label="Program live" labelHidden={false} disabled={locked}/></div></div></Card>
        {attentionCount===0?<EmptyCard art="members" heading="You're all caught up">New customer reviews and setup alerts will appear here.</EmptyCard>:<Section title={`Needs your attention · ${attentionCount}`} action={alerts.length>2?<Button variant="plain" onClick={()=>setShowAlerts(!showAlerts)}>{showAlerts?'Show less':'Show all'}</Button>:null} flush>
          <div className="rv-list">
            {pending.map(item=><div className="rv-home-attention" key={item.id}><div className="rv-item__main"><Text as="span" fontWeight="medium">{item.program}</Text><Text as="span" tone="subdued">{db.customers?.find(x=>x.id===item.customerId)?.name || 'Customer'} · Waiting for review</Text></div><Button url="/customers/review">Review</Button></div>)}
            {alerts.slice(0,showAlerts?undefined:2).map(alert=><div className="rv-home-attention" key={alert.id}><div className="rv-item__main"><Text as="span" fontWeight="medium">{alert.title}</Text><Text as="span" tone="subdued">{alert.detail}</Text></div><InlineStack gap="100" blockAlign="center" wrap={false}><Button url={alert.route}>View</Button><Button variant="plain" onClick={()=>dismiss(alert.id)} disabled={locked} accessibilityLabel={`Dismiss ${alert.title}`}>Dismiss</Button></InlineStack></div>)}
          </div>
        </Section>}
        {!home.setupHidden && <Section title="Set up your loyalty program" description={`${completed} of ${steps.length} steps complete`} action={<InlineStack gap="100"><Button variant="plain" onClick={()=>setShowSetup(!showSetup)}>{showSetup?'Collapse':'Expand'}</Button><Button variant="plain" onClick={()=>{set(['home','setupHidden'],true);notify('Setup guide hidden');}} disabled={locked}>Dismiss</Button></InlineStack>}>
          <BlockStack gap="300"><ProgressBar progress={completed/steps.length*100} size="small"/><InlineStack gap="200"><Button pressed={home.setupMode!=='advanced'} onClick={()=>set(['home','setupMode'],'basic')} disabled={locked}>Basic</Button><Button pressed={home.setupMode==='advanced'} onClick={()=>set(['home','setupMode'],'advanced')} disabled={locked}>Advanced</Button></InlineStack>
            {showSetup && (completed===steps.length?<Text as="p">All set. Your program is ready to keep growing.</Text>:Object.entries(steps.reduce((groups,step)=>{const key=home.setupMode==='advanced'?step.advanced:step.group;(groups[key]??=[]).push(step);return groups;},{})).map(([group,items])=><div key={group} className="rv-home-stepgroup"><Text as="h3" variant="headingSm">{group}</Text><div className="rv-list">{items.map(step=><button type="button" className="rv-item" key={step.id} onClick={()=>{if(step.id==='analytics')set(['home','dismissed'],[...dismissed,'analytics-checked']);navigate(step.route);}}><span className="rv-home-stepcheck" aria-hidden="true">{step.complete?'✓':'○'}</span><span className="rv-item__main"><Text as="span">{step.label}</Text></span><Text as="span" tone="subdued">{step.complete?'Done':'Set up →'}</Text></button>)}</div></div>))}
          </BlockStack>
        </Section>}
        <Section title="Last 30 days" action={<Button variant="plain" url="/analytics">View analytics</Button>}><BlockStack gap="400"><div className="rv-home-kpis"><Stat label="Revenue by Joy" value={money(metrics.revenueByJoy)}/><Stat label="Members" value={num(metrics.members)}/><Stat label="Redemption rate" value={pct(metrics.redemptionRate)}/></div><div className="rv-home-spark"><svg role="img" aria-label="Revenue by Joy over the last 30 days" viewBox="0 0 300 70" preserveAspectRatio="none"><polyline points={sparkline(db.stats?.daily)} /></svg></div><Divider/><div className="rv-home-comparison"><div><Text as="p" fontWeight="semibold">Average order value</Text><Text as="p" tone="subdued">Members {money(metrics.aovMember)} · Other customers {money(metrics.aovGuest)}</Text></div><div><Text as="p" fontWeight="semibold">Repeat purchase rate</Text><Text as="p" tone="subdued">Members {pct(metrics.repeatMember)} · Other customers {pct(metrics.repeatGuest)}</Text></div></div></BlockStack></Section>
        {activity.length?<Section title="Recent activity" action={<Button variant="plain" url="/customers/activity">View all</Button>} flush><div className="rv-list">{activity.map(item=><button className="rv-item" type="button" key={item.id} onClick={()=>navigate('/customers/activity')}><span className="rv-item__main"><Text as="span" fontWeight="medium">{db.customers?.find(x=>x.id===item.customerId)?.name || 'Customer'} · {item.program}</Text><Text as="span" tone="subdued">{dateLabel(item.at?.slice(0,10))}</Text></span><Text as="span">{item.points===0?'—':`${item.points>0?'+':''}${points(item.points)}`}</Text></button>)}</div></Section>:<EmptyCard art="members" heading="No recent activity">Customer activity will appear after the first loyalty action.</EmptyCard>}
        <Section title="On your store" action={<Button variant="plain" url="/store">Manage content</Button>}><InlineStack gap="300" blockAlign="center"><StatusBadge status={db.onsite?.theme?.embedOn?'live':'paused'} label={db.onsite?.theme?.embedOn?'App embed on':'App embed off'}/><Text as="span">{num(liveSurfaces)} of {num(surfaces.length)} surfaces live</Text><Text as="span" tone="subdued">{num(db.onsite?.theme?.blocks)} theme blocks</Text></InlineStack></Section>
        <Section title="New in Joy" description="Ideas and guides to grow your program"><BlockStack gap="400"><div className="rv-home-announcements">{(home.announcements||[]).map(item=><div className="rv-home-announcement" key={item.id}><img src={MKT_ART[item.art]} alt=""/><div><InlineStack gap="100" blockAlign="center"><Text as="h3" variant="headingSm">{item.title}</Text>{item.ai&&<Badge>Made with Joy AI</Badge>}</InlineStack><Text as="p" tone="subdued">{item.detail}</Text><Button variant="plain" url={item.action}>Explore</Button></div></div>)}</div><Divider/><Text as="h3" variant="headingSm">Learn Joy</Text><div className="rv-home-guides">{(home.guides||[]).map(guide=><div key={guide.id}><Text as="h4" fontWeight="semibold">{guide.title}</Text><Text as="p" tone="subdued">{guide.detail}</Text><InlineStack gap="200"><Button variant="plain" url={guide.route}>{guide.cta ?? 'Start here'}</Button></InlineStack></div>)}</div></BlockStack></Section>
      </BlockStack></div>
      <aside className="rv-home-rail"><BlockStack gap="600">
        <Section title="Ask Joy AI"><BlockStack gap="300"><Text as="p" tone="subdued">Ask about your program or where to find a setting.</Text><TextField label="Your question" labelHidden value={ask} onChange={setAsk} placeholder="How are my members doing?" autoComplete="off" disabled={locked} onKeyDown={e=>{if(e.key==='Enter')submitAsk();}}/><Button onClick={submitAsk} disabled={locked||!ask.trim()}>Ask Joy AI</Button>{reply&&<Banner tone="info"><p>{reply}</p></Banner>}</BlockStack></Section>
        <Section title="Help & FAQs"><BlockStack gap="200"><Button url="/settings?type=general">Help with settings</Button><Button url="/programs/points">How do points work?</Button><Button url="/integrations">Connect an app</Button></BlockStack></Section>
        {plan==='free'&&<Section title="Usage fee"><BlockStack gap="200"><Text as="p">Your Starter plan includes a monthly activity allowance. Review usage before you reach your limit.</Text><Button url="/settings?type=subscription">See usage and plans</Button></BlockStack></Section>}
        <Section title="Recommended apps"><BlockStack gap="200">{(db.integrations||[]).filter(x=>['wishlist','subs'].includes(x.id)).map(x=><div key={x.id} className="rv-home-recommend"><Text as="span" fontWeight="medium">{x.name}</Text><Button variant="plain" url={x.id==='wishlist'?'/wishlist':'/subscription'}>Explore</Button></div>)}</BlockStack></Section>
        {!dismissed.includes('refer')&&<Section title="Refer a merchant"><BlockStack gap="200"><Text as="p">Know a store that could grow with Joy? Share the app with them.</Text><InlineStack gap="200"><Button onClick={()=>notify('Share Joy from the Shopify App Store')}>Learn about referrals</Button><Button variant="plain" onClick={()=>dismiss('refer')} disabled={locked}>Dismiss</Button></InlineStack></BlockStack></Section>}
      </BlockStack></aside>
      {modal}
    </div>}</ScreenState>
  </PageFrame>;
}

export function resolve(segments) {return segments[0]==='home'?<Home/>:null;}
