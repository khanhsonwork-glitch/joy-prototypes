// Integrations: ~45 apps in 15 categories. Connected apps first, because "is my email app still syncing?" is the
// common visit; discovery second. Detail: connect / disconnect (confirm), what syncs, last sync.
import React, {useState} from 'react';
import {Avatar, Badge, BlockStack, Button, Card, Checkbox, ChoiceList, Icon, InlineGrid, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {SearchIcon} from '@shopify/polaris-icons';
import {PageFrame} from '../../ui/page.jsx';
import {CCols, CRow, CSearch, CSection, CSide} from '../../ui/clean.jsx';
import {AppsIcon} from '@shopify/polaris-icons';
import {EmptyCard, ScreenState, StatusBadge, useConfirm} from '../../ui/kit.jsx';
import {Block, FormCard, Hint, Pairs, matches, useScenarioList} from '../../ui/parts.jsx';
import {useStore} from '../../state/store.jsx';
import {HashLink, useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';

const CATS = ['All', 'AI connection', 'Email marketing', 'Subscriptions', 'Product reviews', 'Chat', 'Theme', 'Translations', 'Page builders', 'Shopify Flow', 'Social media', 'Reporting', 'Sustainability', 'Wishlist', 'Mobile app'];
const DESC = {
  klaviyo: 'Points, tier and rewards on every Klaviyo profile', judgeme: 'Reward reviews with points', flow: 'Joy triggers and actions in Shopify Flow', pos: 'Earn and redeem in your physical shop',
  mcp: 'Let Claude or ChatGPT read and manage your program', wishlist: 'Give points for wishlist adds', subs: 'Points for subscription orders and paid membership', recharge: 'Points for subscription orders',
  omnisend: 'Sync loyalty data to Omnisend', mailchimp: 'Sync loyalty data to Mailchimp', yotpo: 'Reward reviews with points', gorgias: 'See loyalty data in tickets', instagram: 'Points for follows and story mentions',
  line: 'Points for joining your LINE account', pagefly: 'Joy blocks in PageFly pages', treeplanting: 'Plant a tree as a reward', shopney: 'Joy in your mobile app', attentive: 'Points and tier in SMS and email',
};
const desc = a => a.desc ?? DESC[a.id] ?? 'Connect to use loyalty data';
const SYNCS = ['Points balance', 'VIP tier', 'Available rewards', 'Referral link', 'Events: earned, redeemed, tier changed'];

export function IntegrationList() {
  const {db} = useStore();
  const navigate = useNavigate();
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const apps = useScenarioList(db.integrations);
  const shown = apps.filter(a => (cat === 'All' || a.category === cat) && matches(q, a.name, desc(a)));
  const connected = shown.filter(a => a.connected);
  const rest = shown.filter(a => !a.connected);
  const count = c => apps.filter(a => c === 'All' || a.category === c).length;
  const row = a => (
    <CRow key={a.id} thumb={null} icon={AppsIcon} name={a.name} value={a.connected ? 'Connected' : a.category} url={`/integrations/${a.id.split('~')[0]}`} />
  );
  return (
    <PageFrame title="Integrations">
      <ScreenState>
        <CCols sideFirst={false} side={
          <div className="pt-catside"><CSide title="Category">
            <ChoiceList title="Category" titleHidden selected={[cat]} onChange={v => setCat(v[0])}
              choices={CATS.filter(c => count(c) > 0).map(c => ({value: c, label: `${c} (${count(c)})`}))} />
          </CSide></div>}>
          <CSearch value={q} onChange={setQ} placeholder="Search apps" label="Search apps" />
          <div className="op-catselect"><Select label="Category" labelHidden value={cat} onChange={setCat} options={CATS.map(c => ({label: `${c} (${count(c)})`, value: c}))} /></div>
          {!shown.length && <EmptyCard heading="No apps match" action={{content: 'Clear search', onAction: () => {setQ(''); setCat('All');}}}>Try another word or category.</EmptyCard>}
          {connected.length > 0 && <CSection title="Connected">{connected.map(row)}</CSection>}
          {rest.length > 0 && <CSection title={cat === 'All' ? 'More apps' : cat}>{rest.map(row)}</CSection>}
        </CCols>
      </ScreenState>
    </PageFrame>
  );
}

export function IntegrationDetail({id}) {
  const {db, set} = useStore();
  const {notify} = useShell();
  const [confirm, modal] = useConfirm();
  const a = db.integrations.find(x => x.id === id);
  const [syncs, setSyncs] = useState(a?.syncs ?? SYNCS.slice(0, 3));
  const [key, setKey] = useState('');
  if (!a) return <PageFrame title="Integration" backUrl="/integrations"><EmptyCard heading="This app isn't in the list" action={{content: 'All integrations', url: '/integrations'}}>Open one from Integrations.</EmptyCard></PageFrame>;
  const save = patch => set(['integrations'], db.integrations.map(x => (x.id === a.id ? {...x, ...patch} : x)));
  const cross = a.id === 'wishlist' ? '/wishlist' : a.id === 'subs' ? '/subscription' : null;
  return (
    <PageFrame title={a.name} backUrl="/integrations" badge={<StatusBadge status={a.connected ? 'connected' : 'inactive'} label={a.connected ? 'Connected' : 'Not connected'} />}
      primaryAction={a.connected ? undefined : {content: 'Connect', onAction: () => {save({connected: true, lastSync: 'Just now'}); notify(`${a.name} connected`);}}}>
      <ScreenState>{({locked}) => (
        <InlineGrid columns={{xs: 1, md: '2fr 1fr'}} gap="400" alignItems="start">
          <BlockStack gap="400">
            <FormCard title="What it does"><Text as="p">{desc(a)}.</Text>{cross && <HashLink url={cross} className="op-link">About {a.name}</HashLink>}</FormCard>
            {a.id === 'mcp' ? (
              <FormCard title="AI connection" description="Your MCP address. Paste it into Claude or ChatGPT.">
                <TextField label="MCP address" value={db.settings.developers.mcpUrl} readOnly autoComplete="off" />
                <Text as="p" variant="bodySm" tone="subdued">Connected: {db.settings.developers.clients.join(', ')}. Manage keys in <HashLink url="/settings/developers" className="op-link">Settings › Developers</HashLink>.</Text>
              </FormCard>
            ) : (
              <FormCard title="What syncs" description="Choose what Joy sends to this app.">
                {SYNCS.map(s => <Checkbox key={s} label={s} checked={syncs.includes(s)} disabled={locked || !a.connected} onChange={v => setSyncs(v ? [...syncs, s] : syncs.filter(x => x !== s))} />)}
                <InlineStack><Button disabled={locked || !a.connected} onClick={() => {save({syncs}); notify('Sync settings saved');}}>Save sync settings</Button></InlineStack>
              </FormCard>
            )}
            {!a.connected && ['klaviyo', 'omnisend', 'mailchimp', 'attentive', 'drip', 'sendlane'].includes(a.id) && (
              <FormCard title="Connect with an API key">
                <TextField label={`${a.name} private API key`} value={key} onChange={setKey} autoComplete="off" helpText="Find it in your account settings of that app." />
                <InlineStack><Button disabled={!key.trim()} onClick={() => {save({connected: true, lastSync: 'Just now'}); setKey(''); notify(`${a.name} connected`);}}>Connect</Button></InlineStack>
              </FormCard>
            )}
          </BlockStack>
          <BlockStack gap="400">
            <FormCard title="Status">
              <Pairs rows={[['Category', a.category], ['Connection', a.connected ? 'Connected' : 'Not connected'], a.connected ? ['Last sync', a.lastSync ?? 'Today, 13:42'] : null]} />
              {a.connected && <Hint>Points and tiers sync within a minute of each change.</Hint>}
              {a.connected && <InlineStack gap="200"><Button onClick={() => {save({lastSync: 'Just now'}); notify('Sync started');}}>Sync now</Button>
                <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Disconnect ${a.name}?`, action: 'Disconnect', body: `Joy stops sending points and tiers to ${a.name}. Data already there stays. Programs that use ${a.name} stop working until you reconnect.`, onConfirm: () => {save({connected: false}); notify(`${a.name} disconnected`);}})}>Disconnect</Button></InlineStack>}
            </FormCard>
          </BlockStack>
        </InlineGrid>
      )}</ScreenState>
      {modal}
    </PageFrame>
  );
}

export function resolve(segments) {
  if (segments[0] !== 'integrations') return null;
  return segments[1] ? <IntegrationDetail key={segments[1]} id={segments[1]} /> : <IntegrationList />;
}
