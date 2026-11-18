import React, {useCallback, useMemo, useState} from 'react';
import {Avatar, Banner, BlockStack, Button, Card, Checkbox, Divider, IndexFilters, IndexFiltersMode, InlineGrid, InlineStack, Text} from '@shopify/polaris';
import {useScenario} from '../../kit/scenario.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useStore} from '../../state/store.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {EmptyCard, ScreenState, Section, StatusBadge, useConfirm} from '../../ui/kit.jsx';
import {PageFrame} from '../../ui/page.jsx';

const CATEGORIES = ['All','AI connection','Email marketing','Subscriptions','Product reviews','Chat','Theme','Translations','Page builders','Shopify Flow','Social media','Reporting','Sustainability','Wishlist','Mobile app'];

function Catalog() {
  const {db} = useStore();
  const navigate = useNavigate();
  const {state} = useScenario();
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('All');
  const [tab,setTab] = useState(0);
  const [sort,setSort] = useState(['connected desc']);
  const [mode,setMode] = useState(IndexFiltersMode.Default);
  const apps = state==='empty'?[]:(db.integrations||[]);
  const shown = useMemo(()=>apps.filter(app=>(category==='All'||app.category===category)&&(!query||app.name.toLowerCase().includes(query.toLowerCase()))&&(tab===0||(tab===1?app.connected:!app.connected))).sort((a,b)=>sort[0]==='name asc'?a.name.localeCompare(b.name):sort[0]==='name desc'?b.name.localeCompare(a.name):Number(b.connected)-Number(a.connected)||a.name.localeCompare(b.name)),[apps,category,query,tab,sort]);
  return <PageFrame title="Integrations" width="wide"><ScreenState>{({locked,overflow})=><BlockStack gap="500">
    <Text as="p" tone="subdued">Which apps should share your loyalty data and reward customer actions?</Text>
    <InlineGrid columns={{xs:1,md:'220px minmax(0,1fr)'}} gap="500">
      <div className="rv-integrations-categories"><Text as="h2" variant="headingSm">Categories</Text><div className="rv-integrations-categorylist">{CATEGORIES.map(item=><button key={item} type="button" className={`rv-integrations-category ${category===item?'is-selected':''}`} onClick={()=>setCategory(item)} aria-current={category===item?'true':undefined}>{item}</button>)}</div></div>
      <div className="rv-integrations-results"><Card padding="0"><IndexFilters tabs={[{id:'all',content:'All apps'},{id:'connected',content:'Connected'},{id:'available',content:'Available'}]} selected={tab} onSelect={setTab} queryValue={query} queryPlaceholder="Search integrations" onQueryChange={setQuery} onQueryClear={()=>setQuery('')} filters={[]} onClearAll={()=>{setCategory('All');setQuery('');setTab(0);}} mode={mode} setMode={setMode} sortOptions={[{label:'Connection',value:'connected desc',directionLabel:'Connected first'},{label:'Name',value:'name asc',directionLabel:'A to Z'},{label:'Name',value:'name desc',directionLabel:'Z to A'}]} sortSelected={sort} onSort={setSort} canCreateNewView={false} disableKeyboardShortcuts />
        <div className="rv-integrations-count"><Text as="p" tone="subdued">{shown.length} {shown.length===1?'app':'apps'}{category!=='All'?` in ${category}`:''}</Text></div>
      </Card>
      {shown.length?<div className="rv-integrations-grid">{shown.map(app=><Card key={app.id}><div className="rv-integrations-card"><div className="rv-integrations-card__top"><Avatar name={app.name} initials={app.name.slice(0,1)} size="md"/><StatusBadge status={app.connected?'connected':'inactive'} label={app.connected?'Connected':'Available'}/></div><div className="rv-integrations-card__body"><Text as="h3" variant="headingSm">{overflow?`${app.name} for a very long international storefront integration name`:app.name}</Text><Text as="p" tone="subdued">{app.description}</Text></div><div className="rv-integrations-card__bottom"><Text as="span" variant="bodySm" tone="subdued">{app.category}</Text><Button onClick={()=>navigate(`/integrations/${app.id}`)}>{app.connected?'Manage':'Connect'}</Button></div></div></Card>)}</div>:<EmptyCard heading={query||category!=='All'||tab!==0?'No integrations match these filters':'No integrations yet'} action={{content:'Show all apps',onAction:()=>{setCategory('All');setQuery('');setTab(0);}}}>Try another search or category to find an app.</EmptyCard>}
      </div>
    </InlineGrid>
  </BlockStack>}</ScreenState></PageFrame>;
}

function IntegrationDetail({id}) {
  const {db,upsert} = useStore();
  const {notify} = useShell();
  const {state} = useScenario();
  const [confirm,modal] = useConfirm();
  const app = (db.integrations||[]).find(x=>x.id===id);
  if(!app)return <PageFrame title="Integration not found" backUrl="/integrations"><EmptyCard heading="This integration isn't in the catalog" action={{content:'Browse integrations',url:'/integrations'}}>Choose an app from the integration list.</EmptyCard></PageFrame>;
  return <IntegrationEditor key={id} app={app} upsert={upsert} notify={notify} confirm={confirm} modal={modal} state={state}/>;
}

function IntegrationEditor({app,upsert,notify,confirm,modal,state}) {
  const saveIntegration = useCallback(value=>upsert('integrations',value),[upsert]);
  const {draft,set} = useDraft(app,{onSave:saveIntegration,message:`${app.name} sync settings saved`,locked:state==='disabled'});
  const sync=draft.sync||{};
  const changeConnection=()=>confirm({title:app.connected?`Disconnect ${app.name}?`:`Connect ${app.name}?`,body:app.connected?'New loyalty activity will stop syncing with this app. Your saved data stays in Joy.':'Joy will start sharing the selected loyalty data with this app.',action:app.connected?'Disconnect':'Connect',destructive:app.connected,onConfirm:()=>{upsert('integrations',{...app,connected:!app.connected,lastSync:app.connected?null:new Date().toISOString()});notify(app.connected?`${app.name} disconnected`:`${app.name} connected`);}});
  return <PageFrame title={app.name} backUrl="/integrations" badge={app.connected?<StatusBadge status="connected"/>:null} primaryAction={app.connected?undefined:{content:'Connect',onAction:changeConnection,disabled:state==='disabled'}} width="default"><ScreenState>{({locked})=><BlockStack gap="500">
    <Text as="p" tone="subdued">What should Joy share with {app.name}, and is the connection working?</Text>
    {app.external&&<Banner tone="info"><p>Finish setup in the app or Shopify admin. This prototype shows how the connection will appear in Joy.</p></Banner>}
    <InlineGrid columns={{xs:1,md:'2fr 1fr'}} gap="500"><BlockStack gap="500">
      <Section title="Connection"><BlockStack gap="300"><InlineStack gap="300" blockAlign="center"><Avatar name={app.name} initials={app.name.slice(0,1)} size="lg"/><div><Text as="h2" variant="headingMd">{app.name}</Text><Text as="p" tone="subdued">{app.description}</Text></div></InlineStack><Divider/><InlineStack gap="200" blockAlign="center"><StatusBadge status={app.connected?'connected':'inactive'} label={app.connected?'Connected':'Not connected'}/><Text as="span" tone="subdued">{app.connected?'Loyalty data can sync with this app.':'Connect to start syncing loyalty data.'}</Text></InlineStack></BlockStack></Section>
      <Section title="What syncs" description="Choose the loyalty data this app can use."><BlockStack gap="300"><Checkbox label="Customer points and balances" checked={Boolean(sync.points)} onChange={checked=>set('sync',{...sync,points:checked})} disabled={locked||!app.connected}/><Checkbox label="VIP tier and membership" checked={Boolean(sync.tiers)} onChange={checked=>set('sync',{...sync,tiers:checked})} disabled={locked||!app.connected}/><Checkbox label="Reward and redemption activity" checked={Boolean(sync.rewards)} onChange={checked=>set('sync',{...sync,rewards:checked})} disabled={locked||!app.connected}/><Text as="p" tone="subdued">Changes to these options are saved with the bar above.</Text></BlockStack></Section>
      {app.connected&&<Button tone="critical" variant="plain" onClick={changeConnection} disabled={locked}>Disconnect {app.name}</Button>}
    </BlockStack><BlockStack gap="500"><Section title="At a glance"><BlockStack gap="300"><div><Text as="p" tone="subdued">Category</Text><Text as="p">{app.category}</Text></div><div><Text as="p" tone="subdued">Last sync</Text><Text as="p">{app.lastSync?new Date(app.lastSync).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'}):'Not synced yet'}</Text></div><div><Text as="p" tone="subdued">Customers see</Text><Text as="p">{app.connected?'Their loyalty details stay up to date across connected apps.':'No change until you connect this app.'}</Text></div></BlockStack></Section></BlockStack></InlineGrid>
    {modal}
  </BlockStack>}</ScreenState></PageFrame>;
}

export function resolve(segments) {if(segments[0]!=='integrations')return null;return segments[1]?<IntegrationDetail id={segments[1]}/>:<Catalog/>;}
