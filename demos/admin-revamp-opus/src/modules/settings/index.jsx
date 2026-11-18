// Settings: laid out like the new admin's own settings (searchable section list + cards), one save bar per section.
// Point name and value moved to Programs › Points (approved map); a link card says so where people look for it.
import React, {useMemo, useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, Card, Checkbox, ChoiceList, Icon, InlineGrid, InlineStack, Modal, Select, Tabs, Text, TextField,
} from '@shopify/polaris';
import {
  SettingsIcon, PaintBrushFlatIcon, EmailIcon, NotificationIcon, ClockIcon, OrderIcon, LanguageTranslateIcon, CreditCardIcon,
  CodeIcon, AppsIcon, SearchIcon, StarIcon,
} from '@shopify/polaris-icons';
import {PageFrame} from '../../ui/page.jsx';
import {CProps, CRow, CSection, CSide} from '../../ui/clean.jsx';
import {NumberField, ScreenState, money, num, pct, useConfirm, usePlan} from '../../ui/kit.jsx';
import {EditorHero, EditorShell, FormCard, Hint, ListCard, ListRow, MoreSettings, Panel, Pairs, RowSwitch, SimpleTable, useCopy} from '../../ui/parts.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {useStore} from '../../state/store.jsx';
import {HashLink, useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';

const SECTIONS = [
  ['general', 'General', SettingsIcon, 'enrollment language timezone date currency prefix behavior review approval'],
  ['brand', 'Brand', PaintBrushFlatIcon, 'colours colors logo'],
  ['email', 'Email', EmailIcon, 'sender smtp address weekly report social'],
  ['notifications', 'Notifications', NotificationIcon, 'emails templates sent log'],
  ['prelaunch', 'Pre-launch', ClockIcon, 'sync past orders sign ups newsletter exclude segments'],
  ['order', 'Order', OrderIcon, 'paid fulfilled tag'],
  ['translations', 'Translations', LanguageTranslateIcon, 'languages detect'],
  ['billing', 'Plan and billing', CreditCardIcon, 'plan subscription billing orders'],
  ['developers', 'Developers', CodeIcon, 'api key mcp ai deeplink'],
  ['additional', 'Additional features', AppsIcon, 'sso metafields tags pending points revoke limit webmcp'],
];

function Shell({section, children, title}) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const shown = SECTIONS.filter(([id, label, , kw]) => !q || `${label} ${kw}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <PageFrame title={title ?? SECTIONS.find(s => s[0] === section)?.[1] ?? 'Settings'} backUrl="/home" width="wide">
      <div className="op-settings">
        <div className="op-settings__nav">
          <Card padding="200">
            <TextField label="Search settings" labelHidden placeholder="Search settings…" value={q} onChange={setQ} prefix={<Icon source={SearchIcon} />} autoComplete="off" clearButton onClearButtonClick={() => setQ('')} />
            <nav className="op-settings__list" aria-label="Settings sections">
              {shown.map(([id, label, icon]) => (
                <a key={id} href={`#/settings/${id}`} aria-current={section === id ? 'page' : undefined}><Icon source={icon} /><span>{label}</span></a>
              ))}
              {!shown.length && <Text as="p" variant="bodySm" tone="subdued">No setting matches “{q}”.</Text>}
            </nav>
          </Card>
          <div className="op-settings__select"><Select label="Section" labelHidden value={section} onChange={v => navigate(`/settings/${v}`)} options={SECTIONS.map(([value, label]) => ({value, label}))} /></div>
        </div>
        <div className="op-settings__main"><ScreenState>{children}</ScreenState></div>
      </div>
    </PageFrame>
  );
}

function useSection(key, message) {
  const {db, set} = useStore();
  return useDraft(db.settings[key], {message: message ?? 'Settings saved', onSave: v => set(['settings', key], v)});
}
const radio = (title, value, onChange, choices, locked, help) => <ChoiceList title={title} selected={[value]} onChange={v => onChange(v[0])} choices={choices.map(([v, l, h]) => ({value: v, label: l, helpText: h}))} disabled={locked} />;

/* ---------- General ---------- */
function General({locked}) {
  const {db, set} = useStore();
  const {allows} = usePlan();
  const {notify} = useShell();
  const [confirm, modal] = useConfirm();
  const d = useSection('general');
  const x = d.draft;
  return <>
    <FormCard title="Who becomes a member" description="How customers join the loyalty program.">
      <ChoiceList title="Membership enrollment" titleHidden selected={[x.enrollment]} onChange={v => d.set('enrollment', v[0])} disabled={locked}
        choices={[
          {label: 'Automatically, when they create an account', value: 'auto', helpText: 'Every Shopify customer account becomes a member.'},
          {label: 'Customers join themselves', value: 'optin', helpText: 'They click “Join” on your store.', disabled: !allows('advanced')},
          {label: 'Only customers I add', value: 'manual', helpText: 'Automatic enrollment is off.', disabled: !allows('advanced')},
        ]} />
      {x.enrollment !== 'manual' && <Checkbox label="Don't enroll B2B customers" checked={x.excludeB2b} onChange={v => d.set('excludeB2b', v)} disabled={locked} />}
      {x.enrollment !== 'auto' && (
        <BlockStack gap="200">
          <Banner tone="warning">Turning every member back into a guest can't be undone.</Banner>
          <InlineStack><Button tone="critical" disabled={locked} onClick={() => confirm({title: 'Convert all members to guests?', action: 'Convert', body: `${num(db.stats.last30.members)} members become guests. They keep their points but must join again to earn or redeem.`, onConfirm: () => {set(['customers'], db.customers.map(c => (c.type === 'member' ? {...c, type: 'guest'} : c))); notify('All members are now guests');}})}>Convert all members to guests</Button></InlineStack>
        </BlockStack>
      )}
    </FormCard>
    <FormCard title="Discount codes">
      <TextField label="Code prefix" value={x.discountPrefix} onChange={v => d.set('discountPrefix', v)} autoComplete="off" disabled={locked} error={!x.discountPrefix?.trim() ? 'Enter a prefix, like JOY-' : undefined} helpText={`Codes look like ${x.discountPrefix || 'JOY-'}8F2K4Q. Each program can use its own.`} />
    </FormCard>
    <div className="pt-card"><CRow icon={StarIcon} name="Point name, value and expiry" value="In Programs › Points" url="/programs/points/settings" /></div>
    <MoreSettings sections={[{title: 'Language and time', children: <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <Select label="App language" value={x.language} onChange={v => d.set('language', v)} disabled={locked} options={[['en-US', 'English (US)'], ['en-GB', 'English (UK)'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español'], ['vi', 'Tiếng Việt'], ['ja', '日本語']].map(([value, label]) => ({value, label}))} />
        <Select label="Store timezone" value={db.shop.timezone} onChange={() => notify('Timezone follows your Shopify store settings')} disabled={locked} options={[{label: db.shop.timezone, value: db.shop.timezone}]} helpText="Programs start at 00:00 in this timezone." />
        <Select label="Date format" value={x.dateFormat} onChange={v => d.set('dateFormat', v)} disabled={locked} options={['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'].map(v => ({label: v, value: v}))} />
        <Select label="Time format" value={x.timeFormat} onChange={v => d.set('timeFormat', v)} disabled={locked} options={[{label: '24-hour (14:30)', value: '24h'}, {label: '12-hour (2:30 PM)', value: '12h'}]} />
      </InlineGrid>
      <Checkbox label="Show the language switcher on every screen" checked={x.showLanguageSelector} onChange={v => d.set('showLanguageSelector', v)} disabled={locked} />
      {radio('Prices in emails and the widget', x.currencyWithCode ? 'code' : 'plain', v => d.set('currencyWithCode', v === 'code'), [['plain', 'Without currency code ($10)'], ['code', 'With currency code ($10 USD)']], locked)}
    </>}, {title: 'What happens after a customer redeems', children: <>
      {radio('Apply the discount', x.applyDiscount, v => d.set('applyDiscount', v), [['stay', 'Stay on the current page'], ['cart_page', 'Go to the cart page'], ['cart_drawer', 'Open the cart drawer']], locked)}
      {x.applyDiscount === 'cart_drawer' && <TextField label="Cart drawer button selector" value={x.drawerSelector ?? ''} onChange={v => d.set('drawerSelector', v)} autoComplete="off" disabled={locked} placeholder=".header__cart" />}
      {radio('Coupons from the widget', x.afterRedeem, v => d.set('afterRedeem', v), [['auto_apply', 'Add the coupon to the cart automatically'], ['later', 'Let the customer apply it later']], locked)}
      {radio('Free gifts', x.afterFreeGift, v => d.set('afterFreeGift', v), [['manual', 'Customer adds the gift to the cart'], ['auto', 'Add the gift to the cart automatically'], ['auto_drawer', 'Add it and open the cart drawer']], locked)}
      <TextField label="After free shipping, continue shopping at" value={x.freeShippingUrl ?? ''} onChange={v => d.set('freeShippingUrl', v)} autoComplete="off" placeholder="/collections/all" disabled={locked} />
      {radio('Point calculator link for guests', x.calculatorGuest, v => d.set('calculatorGuest', v), [['widget', 'Open the loyalty widget'], ['login', 'Go to the login page']], locked)}
      <Checkbox label="Show VIP-only rewards to guests (as locked)" checked={x.showVipRewardsToGuests} onChange={v => d.set('showVipRewardsToGuests', v)} disabled={locked} />
    </>}, {title: 'Review approval', description: 'Default for new review programs. Each program can change it.', children: (
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        {radio('Product reviews', x.reviewDefault, v => d.set('reviewDefault', v), [['pending', 'Wait for my approval'], ['approved', 'Approve automatically']], locked)}
        {radio('Google reviews', x.googleReviewDefault, v => d.set('googleReviewDefault', v), [['pending', 'Wait for my approval'], ['approved', 'Approve automatically']], locked)}
      </InlineGrid>
    )}]} />
    {db.home.setupHidden && <div className="pt-card"><CRow name="The setup guide is hidden on Home" value="Show it again" onClick={() => {set(['home'], {...db.home, setupHidden: false}); notify('Setup guide is back on Home');}} /></div>}
    {modal}
  </>;
}

/* ---------- Brand ---------- */
function Brand({locked}) {
  const d = useSection('brand', 'Brand saved');
  const x = d.draft;
  const fields = [['primary', 'Primary', 'Buttons, links, the widget header'], ['secondary', 'Secondary', 'Backgrounds and highlights'], ['accent', 'Accent', 'Badges and small details']];
  return <>
    <FormCard title="Store colours" description="The widget, loyalty page, wallet pass and emails use these.">
      {fields.map(([k, l, h]) => (
        <InlineGrid key={k} columns={{xs: '40px 1fr'}} gap="300" alignItems="end">
          <input type="color" className="op-colorinput" aria-label={`${l} colour`} value={x[k]} onChange={e => d.set(k, e.target.value)} disabled={locked} />
          <TextField label={l} value={x[k]} onChange={v => d.set(k, v)} autoComplete="off" helpText={h} disabled={locked} error={/^#[0-9a-f]{6}$/i.test(x[k]) ? undefined : 'Use a hex colour like #e86a5a'} />
        </InlineGrid>
      ))}
    </FormCard>
    <FormCard title="Logo"><InlineStack gap="300" blockAlign="center"><div className="op-logo">NB</div><Button disabled={locked}>Replace logo</Button></InlineStack></FormCard>
    <FormCard title="Preview"><div className="op-store" style={{'--brand-primary': x.primary}}><div className="op-store__head"><small>North Bloom Rewards</small><strong>1,240 points</strong></div><div className="op-store__body"><span className="op-store__btn" style={{background: x.primary}}>Redeem</span><span className="op-chip"><i style={{background: x.accent}} />Gold member</span></div></div></FormCard>
  </>;
}

/* ---------- Email ---------- */
function EmailSettings({locked}) {
  const {notify} = useShell();
  const d = useSection('email', 'Email settings saved');
  const x = d.draft;
  return <>
    <FormCard title="Sender" description="Who loyalty emails come from.">
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <TextField label="Sender name" value={x.sender.name} onChange={v => d.set('sender', {...x.sender, name: v})} autoComplete="off" disabled={locked} />
        <TextField label="Sender email" value={x.sender.email} onChange={v => d.set('sender', {...x.sender, email: v, verified: false})} autoComplete="off" disabled={locked} connectedRight={x.sender.verified ? <Badge>Verified</Badge> : <Button onClick={() => notify('Verification email sent')}>Verify</Button>} />
      </InlineGrid>
      <TextField label="Sending domain (optional)" value={x.domain ?? ''} onChange={v => d.set('domain', v)} placeholder="mail.northbloom.com" autoComplete="off" disabled={locked} helpText="Better delivery. You'll add 3 DNS records." />
    </FormCard>
    <FormCard title="Sending service">
      {radio('Send with', x.smtp, v => d.set('smtp', v), [['avada', 'Joy (default, nothing to set up)'], ['custom', 'My own SMTP server']], locked)}
      {x.smtp === 'custom' && <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <TextField label="Host" value={x.host ?? ''} onChange={v => d.set('host', v)} autoComplete="off" disabled={locked} />
        <TextField label="Port" value={x.port ?? '587'} onChange={v => d.set('port', v)} autoComplete="off" disabled={locked} />
        <TextField label="Username" value={x.user ?? ''} onChange={v => d.set('user', v)} autoComplete="off" disabled={locked} />
        <TextField label="Password" type="password" value={x.pass ?? ''} onChange={v => d.set('pass', v)} autoComplete="off" disabled={locked} />
      </InlineGrid>}
    </FormCard>
    <FormCard title="Footer details">
      <TextField label="Store address (required by email law)" value={x.address} onChange={v => d.set('address', v)} multiline={2} autoComplete="off" disabled={locked} />
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">{['Instagram', 'Facebook', 'TikTok', 'YouTube'].map(s => <TextField key={s} label={s} value={x.social?.[s] ?? ''} onChange={v => d.set('social', {...(x.social ?? {}), [s]: v})} autoComplete="off" placeholder="https://" disabled={locked} />)}</InlineGrid>
      <Checkbox label="Show my logo in emails" checked={x.logo} onChange={v => d.set('logo', v)} disabled={locked} />
    </FormCard>
    <FormCard title="Weekly report" description="A Monday email with last week's numbers." action={<RowSwitch on={x.weeklyReport} label="Weekly report" onChange={v => d.set('weeklyReport', v)} />}>
      <TextField label="Send to (one per line)" value={(x.reportTo ?? []).join('\n')} onChange={v => d.set('reportTo', v.split('\n'))} multiline={3} autoComplete="off" disabled={locked || !x.weeklyReport} />
      <InlineStack><Button onClick={() => notify('Test report sent')} disabled={!x.weeklyReport}>Send a test</Button></InlineStack>
    </FormCard>
  </>;
}

/* ---------- Notifications ---------- */
const NGROUPS = [['reward', 'Rewards'], ['referral', 'Referral'], ['vip', 'VIP tiers'], ['expiry', 'Points expiry'], ['coupon', 'Coupon reminders']];
const LOG = [
  ['Ava Nguyen', 'Reward redeemed', 'Opened', 'Nov 17, 2:15 PM'], ['Ben Carter', 'Earn points', 'Clicked', 'Nov 16, 6:05 PM'], ['Hana Sato', 'Sign up reward', 'Sent', 'Nov 12, 8:16 AM'],
  ['Chloe Martin', 'Points expire soon', 'Failed', 'Nov 10, 12:00 AM'], ['Gia Tran', 'Tier achieved', 'Opened', 'Nov 11, 8:01 AM'],
];
function Notifications() {
  const {db, set} = useStore();
  const {notify} = useShell();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [log, setLog] = useState(LOG.map(([c, e, s, d], i) => ({id: `l${i}`, c, e, s, d})));
  const all = db.notifications;
  const globalOn = db.settings.emailOn !== false;
  return <>
    <CSide>
      <span className="pt-status"><span className={`pt-status__dot ${globalOn ? '' : 'is-warn'}`} />{globalOn ? 'Loyalty emails are on' : 'All loyalty emails are paused'}</span>
      <CProps rows={[
        {label: 'Emails on', value: `${all.filter(n => n.on).length} of ${all.length}`},
        {label: globalOn ? 'Pause all emails' : 'Turn emails back on', value: '', onClick: () => {set(['settings', 'emailOn'], !globalOn); notify(globalOn ? 'All loyalty emails paused' : 'Loyalty emails are on');}},
      ]} />
    </CSide>
    <div className="pt-switch" role="tablist" aria-label="Notifications">
      {['Emails', 'Sent log'].map((l, i) => <button key={l} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'is-on' : undefined} onClick={() => setTab(i)}>{l}</button>)}
    </div>
    {tab === 0 ? NGROUPS.map(([g, label]) => {
      const items = all.filter(n => n.group === g);
      if (!items.length) return null;
      return (
        <CSection key={g} title={label}>
          {items.map(n => <CRow key={n.id} icon={EmailIcon} name={n.event} off={!n.on || !globalOn} url={`/settings/notifications/${n.id}`} value={n.on && globalOn ? 'On' : ''} />)}
        </CSection>
      );
    }) : (
      <CSection title="Last emails">
        {log.map(r => <CRow key={r.id} name={`${r.e} to ${r.c}`} tag={r.s === 'Failed' ? 'Failed' : undefined} value={r.d}
          trailing={r.s === 'Failed' ? <Button size="slim" onClick={() => {setLog(log.map(l => (l.id === r.id ? {...l, s: 'Sent'} : l))); notify('Email sent again');}}>Resend</Button> : undefined} />)}
      </CSection>
    )}
  </>;
}

export function NotificationEditor({id}) {
  const {db, set} = useStore();
  const {notify} = useShell();
  const n = db.notifications.find(x => x.id === id);
  const source = useMemo(() => n && ({heading: n.event, preview: 'Your points are waiting', body: `Hi {{first_name}},\n\n${n.subject.replace(/\{\{|\}\}/g, '')}. Thanks for shopping with North Bloom.`, button: 'See my rewards', link: '/pages/rewards', showBanner: true, showHeading: true, showButton: true, showFooter: true, footer: 'You get this email because you joined North Bloom Rewards.', language: 'en', sendBefore: 7, ...n}), [n]);
  const d = useDraft(source ?? {}, {message: 'Email saved', onSave: v => set(['notifications'], db.notifications.map(x => (x.id === id ? v : x))), validate: v => ({subject: !v.subject?.trim() ? 'Add a subject line' : null})});
  const [test, setTest] = useState(false);
  const [to, setTo] = useState(db.shop.ownerEmail);
  if (!n) return <Shell section="notifications"><Banner tone="warning">This email doesn't exist. Pick one from Notifications.</Banner></Shell>;
  const x = d.draft;
  const fill = s => String(s ?? '').replace(/\{\{first_name\}\}/g, 'Ava').replace(/\{\{points\}\}/g, '95').replace(/\{\{reward\}\}/g, '$5 off').replace(/\{\{tier\}\}/g, 'Gold').replace(/\{\{friend\}\}/g, 'Mia');
  return (
    <PageFrame title={n.event} backUrl="/settings/notifications" secondaryActions={[{content: 'Send test', onAction: () => setTest(true)}]}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={EmailIcon} sentence={n.group === 'expiry' ? `Sent ${x.sendBefore} days before a customer's points expire.` : `Sent to the customer right after “${n.event}”.`}
            facts={[['Sent, 30 days', num(n.sent)], ['Open rate', n.sent ? pct(n.opened) : '—'], ['Click rate', n.sent ? pct(n.opened / 5) : '—']]}
            status={{on: n.on, label: 'Send this email', note: n.on ? 'Sending' : 'Not sending', disabled: locked,
              onChange: v => {set(['notifications'], db.notifications.map(y => (y.id === id ? {...y, on: v} : y))); notify(v ? 'Email turned on' : 'Email turned off');}}} />}
          side={<div className="op-panel"><BlockStack gap="300"><Text as="h2" variant="headingSm">Preview</Text>
            <div className="op-email">
              <div className="op-email__meta"><b>{fill(x.subject)}</b><span>{fill(x.preview)}</span></div>
              <div className="op-email__body" style={{'--brand-primary': db.settings.brand.primary}}>
                <div className="op-logo">NB</div>
                {x.showBanner && <div className="op-email__banner" />}
                {x.showHeading && <h3>{fill(x.heading)}</h3>}
                {fill(x.body).split('\n').map((p, i) => (p ? <p key={i}>{p}</p> : null))}
                {x.showButton && <span className="op-store__btn" style={{background: db.settings.brand.primary}}>{x.button}</span>}
                {x.showFooter && <small>{x.footer}<br />{db.settings.email.address}</small>}
              </div>
            </div>
          </BlockStack></div>}
          more={<MoreSettings sections={[
            {title: 'Preview text and language', children: <>
              <TextField label="Preview text" value={x.preview} onChange={v => d.set('preview', v)} autoComplete="off" disabled={locked} helpText="The grey line after the subject in the inbox." />
              <Select label="Language" value={x.language} onChange={v => d.set('language', v)} disabled={locked} options={db.settings.translations.languages.map(l => ({label: {en: 'English', fr: 'French', es: 'Spanish'}[l] ?? l, value: l}))} />
            </>},
            {title: 'Blocks', children: <>
              {[['showBanner', 'Banner image'], ['showHeading', 'Heading'], ['showButton', 'Button'], ['showFooter', 'Footer']].map(([k, l]) => <Checkbox key={k} label={l} checked={x[k]} onChange={v => d.set(k, v)} disabled={locked} />)}
              {x.showFooter && <TextField label="Footer text" value={x.footer} onChange={v => d.set('footer', v)} autoComplete="off" disabled={locked} />}
            </>},
          ]} />}>
          <Panel title="Email">
            <TextField label="Subject" value={x.subject} onChange={v => d.set('subject', v)} autoComplete="off" disabled={locked} error={d.errors.subject} helpText="Use {{first_name}}, {{points}}, {{reward}}" />
            <TextField label="Heading" value={x.heading} onChange={v => d.set('heading', v)} autoComplete="off" disabled={locked} />
            <TextField label="Message" value={x.body} onChange={v => d.set('body', v)} multiline={5} autoComplete="off" disabled={locked} />
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <TextField label="Button text" value={x.button} onChange={v => d.set('button', v)} autoComplete="off" disabled={locked} />
              <TextField label="Button link" value={x.link} onChange={v => d.set('link', v)} autoComplete="off" disabled={locked} />
            </InlineGrid>
            {n.group === 'expiry' && <NumberField label="Send before expiry" value={x.sendBefore} onChange={v => d.set('sendBefore', v)} suffix="days" disabled={locked} />}
          </Panel>
        </EditorShell>
      )}</ScreenState>
      <Modal open={test} onClose={() => setTest(false)} title="Send a test email" primaryAction={{content: 'Send', onAction: () => {notify(`Test sent to ${to}`); setTest(false);}}} secondaryActions={[{content: 'Cancel', onAction: () => setTest(false)}]}>
        <Modal.Section><TextField label="Send to" value={to} onChange={setTo} autoComplete="email" helpText="Uses sample data for Ava, a Gold member." /></Modal.Section>
      </Modal>
    </PageFrame>
  );
}

/* ---------- Pre-launch, Order, Translations ---------- */
function Prelaunch({locked}) {
  const {db} = useStore();
  const {notify} = useShell();
  const d = useSection('prelaunch', 'Pre-launch saved');
  const x = d.draft;
  const row = (k, title, text) => (
    <InlineStack key={k} align="space-between" blockAlign="center" gap="200" wrap={false}>
      <BlockStack gap="050"><Text as="span" fontWeight="medium">{title}</Text><Text as="span" variant="bodySm" tone="subdued">{text}</Text></BlockStack>
      {x[k] === 'done' ? <Badge tone="success">Done</Badge> : x[k] === 'running' ? <Badge tone="info">Running</Badge> : <Button disabled={locked} onClick={() => {d.set(k, 'running'); notify(`${title} started`);}}>Start</Button>}
    </InlineStack>
  );
  return <>
    <FormCard title="Reward what customers did before you launched" description="Give points for past sign-ups and orders, once.">
      {row('syncSignups', 'Past account sign-ups', 'Gives the sign-up reward to existing accounts')}
      {row('syncNewsletter', 'Past newsletter sign-ups', 'Gives the newsletter reward to current subscribers')}
      {row('syncOrders', 'Past orders', 'Gives order points for the last 12 months')}
    </FormCard>
    <FormCard title="Leave out" description="Customers in these segments don't get points for past activity.">
      <ChoiceList allowMultiple title="Segments" titleHidden selected={x.excludeSegments} onChange={v => d.set('excludeSegments', v)} disabled={locked} choices={db.segments.map(s => ({label: `${s.name} · ${num(s.size)} customers`, value: s.id}))} />
    </FormCard>
  </>;
}
function OrderSettings({locked}) {
  const {notify} = useShell();
  const d = useSection('order', 'Order settings saved');
  const x = d.draft;
  return <FormCard title="When orders earn points">
    {radio('Give points when the order is', x.rewardOn, v => d.set('rewardOn', v), [['paid', 'Paid', 'Fastest. Refunds take points back.'], ['fulfilled', 'Fulfilled', 'Safer for shops with many cancellations.']], locked)}
    {x.rewardOn === 'fulfilled' && <>
      <Checkbox label="Show points waiting for fulfilment to the customer" checked={x.showAwaiting} onChange={v => d.set('showAwaiting', v)} disabled={locked} />
      <Checkbox label="Use the program rules from when the order was placed" checked={x.freezeRules} onChange={v => d.set('freezeRules', v)} disabled={locked} />
    </>}
    <Checkbox label="Tag orders and customers that earned points" checked={x.tagSync} onChange={v => d.set('tagSync', v)} disabled={locked} />
    {x.tagSync && <InlineStack gap="200" blockAlign="end" wrap={false}><div style={{flex: 1}}><TextField label="Tag" value={x.tag} onChange={v => d.set('tag', v)} autoComplete="off" disabled={locked} /></div><Button onClick={() => notify('Tagging past orders started')}>Tag past orders</Button></InlineStack>}
  </FormCard>;
}
function Translations({locked}) {
  const {notify} = useShell();
  const d = useSection('translations', 'Languages saved');
  const x = d.draft;
  const NAMES = {en: 'English', fr: 'French', es: 'Spanish', de: 'German', ja: 'Japanese', vi: 'Vietnamese'};
  return <>
    <FormCard title="Languages">
      <Select label="Default language" value={x.primary} onChange={v => d.set('primary', v)} disabled={locked} options={Object.entries(NAMES).map(([value, label]) => ({value, label}))} />
      {radio('Show customers', x.detect, v => d.set('detect', v), [['storefront', 'The language of your storefront'], ['browser', 'Their browser language']], locked)}
      <ChoiceList allowMultiple title="Also translate into" selected={x.languages} onChange={v => d.set('languages', v.includes(x.primary) ? v : [x.primary, ...v])} disabled={locked} choices={Object.entries(NAMES).map(([value, label]) => ({value, label: value === x.primary ? `${label} (default)` : label, disabled: value === x.primary}))} />
    </FormCard>
    <FormCard title="Edit translations">
      {['Widget', 'Loyalty page', 'Customer account', 'Checkout', 'Point calculator', 'Redeem in cart', 'Referral', 'Sign-up block', 'Milestones'].map(s => (
        <InlineStack key={s} align="space-between" blockAlign="center"><Text as="span">{s}</Text><Button size="slim" onClick={() => notify(`Opens the ${s} translations`)}>Edit</Button></InlineStack>
      ))}
    </FormCard>
  </>;
}

/* ---------- Billing + plans ---------- */
const PLANS = [
  ['free', 'Starter', 0, 0, ['Points for orders, sign-up, birthday', 'Discount and free shipping rewards', 'Loyalty widget', '200 orders a month']],
  ['essential', 'Essential', 49, 39, ['Everything in Starter', 'Google reviews, surveys, anniversary', 'Member deals', '1,000 orders a month']],
  ['advanced', 'Advanced', 199, 159, ['Everything in Essential', 'VIP tiers and milestones', 'Store credit, gift cards, paid membership', '2,000 orders a month']],
  ['ultimate', 'Ultimate', 499, 399, ['Everything in Advanced', 'Custom metrics, checkout blocks', 'Mobile app engagement', 'Unlimited orders, dedicated manager']],
];
function Billing() {
  const {db} = useStore();
  const used = db.home.ordersUsed ?? 1640; const limit = db.home.ordersLimit ?? 2000;
  const plan = PLANS.find(p => p[0] === db.shop.plan);
  return <>
    <FormCard title="Your plan" action={<Button url="/settings/plans">View plans</Button>}>
      <InlineStack gap="200" blockAlign="center"><Text as="span" variant="headingMd">{plan?.[1]}</Text><Text as="span" tone="subdued">{money(plan?.[2])} per month</Text></InlineStack>
      <BlockStack gap="100"><Text as="span" variant="bodySm">Orders this cycle: {num(used)} of {num(limit)}</Text><div className="op-meter op-meter--wide"><i style={{width: `${(used / limit) * 100}%`}} /></div><Text as="span" variant="bodySm" tone="subdued">Resets on Dec 1. Over the limit, new orders stop earning points.</Text></BlockStack>
    </FormCard>
    <FormCard title="Billing"><Pairs rows={[['Billed through', 'Shopify'], ['Next charge', `${money(plan?.[2])} on Dec 1, 2026`], ['Billing email', db.shop.email]]} /></FormCard>
  </>;
}
export function Plans() {
  const {db, set} = useStore();
  const {notify} = useShell();
  const [yearly, setYearly] = useState(false);
  const [pick, setPick] = useState(null);
  const cur = PLANS.findIndex(p => p[0] === db.shop.plan);
  return (
    <PageFrame title="Plans" backUrl="/settings/billing" width="wide">
      <ScreenState>
        <BlockStack gap="400">
          <InlineStack align="center"><div className="op-seg" role="radiogroup" aria-label="Billing period">{[[false, 'Monthly'], [true, 'Yearly · save 20%']].map(([v, l]) => <button key={l} type="button" role="radio" aria-checked={yearly === v} onClick={() => setYearly(v)}>{l}</button>)}</div></InlineStack>
          <InlineGrid columns={{xs: 1, sm: 2, lg: 4}} gap="300">
            {PLANS.map(([id, name, m, y, feats], i) => (
              <Card key={id}>
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center"><Text as="h2" variant="headingMd">{name}</Text>{i === cur && <Badge tone="success">Current</Badge>}</InlineStack>
                  <div><span className="op-kpi__value">{money(yearly ? y : m)}</span> <Text as="span" tone="subdued">/ month{yearly && m ? ', billed yearly' : ''}</Text></div>
                  <ul className="op-feats">{feats.map(f => <li key={f}>{f}</li>)}</ul>
                  {i === cur ? <Button disabled>Your plan</Button> : <Button variant={i > cur ? 'primary' : 'secondary'} onClick={() => setPick(i)}>{i > cur ? `Upgrade to ${name}` : `Switch to ${name}`}</Button>}
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>
        </BlockStack>
      </ScreenState>
      {pick != null && (
        <Modal open onClose={() => setPick(null)} title={`Switch to ${PLANS[pick][1]}?`}
          primaryAction={{content: 'Approve in Shopify', onAction: () => {set(['shop', 'plan'], PLANS[pick][0]); notify(`You're on ${PLANS[pick][1]}`); setPick(null);}}} secondaryActions={[{content: 'Cancel', onAction: () => setPick(null)}]}>
          <Modal.Section><Text as="p">{pick > cur ? `You'll pay ${money(yearly ? PLANS[pick][3] : PLANS[pick][2])} a month from today, prorated by Shopify.` : `Features only in ${PLANS[cur][1]} turn off at the end of this cycle: ${PLANS[cur][4][1]}.`}</Text></Modal.Section>
        </Modal>
      )}
    </PageFrame>
  );
}

/* ---------- Developers, Additional ---------- */
function Developers({locked}) {
  const {db} = useStore();
  const copy = useCopy();
  const {notify} = useShell();
  const [confirm, modal] = useConfirm();
  const x = db.settings.developers;
  return <>
    <FormCard title="API key" description="For your own code and headless storefronts. Keep it secret.">
      <InlineStack gap="200" blockAlign="end" wrap={false}><div style={{flex: 1}}><TextField label="API key" value={x.apiKey} readOnly autoComplete="off" /></div><Button onClick={() => copy(x.apiKey, 'API key')}>Copy</Button></InlineStack>
      <InlineStack><Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: 'Make a new API key?', action: 'Regenerate', body: 'The old key stops working right away. Anything that uses it must be updated.', onConfirm: () => notify('New API key created')})}>Regenerate</Button></InlineStack>
    </FormCard>
    <FormCard title="AI connections" description="Let Claude or ChatGPT read your program and help manage it.">
      <InlineStack gap="200" blockAlign="end" wrap={false}><div style={{flex: 1}}><TextField label="MCP address" value={x.mcpUrl} readOnly autoComplete="off" /></div><Button onClick={() => copy(x.mcpUrl, 'MCP address')}>Copy</Button></InlineStack>
      <Text as="p" variant="bodySm" tone="subdued">Connected: {x.clients.join(', ')}</Text>
      <Checkbox label="Allow AI to make changes (not only read)" checked={Boolean(x.allowWrites)} onChange={() => notify('Saved')} disabled={locked} />
    </FormCard>
    <FormCard title="Deep links" description="Open a part of the widget from any link on your store.">
      <div className="op-inset"><SimpleTable rows={[['Rewards', 'joy-open=redeem'], ['Ways to earn', 'joy-open=earn'], ['Referral', 'joy-open=referral'], ['VIP tiers', 'joy-open=vip']].map(([b, p]) => ({id: b, b, p}))} onRow={r => copy(`?${r.p}`, 'Link')} columns={[{key: 'b', label: 'Widget part'}, {key: 'p', label: 'Add to any URL'}]} /></div>
    </FormCard>
    <FormCard title="Republish"><Text as="p" variant="bodySm" tone="subdued">Pushes the latest widget files to your theme if something looks out of date.</Text><InlineStack><Button onClick={() => notify('Republished to your theme')}>Republish</Button></InlineStack></FormCard>
    {modal}
  </>;
}
function Additional({locked}) {
  const {allows} = usePlan();
  const d = useSection('additional', 'Additional features saved');
  const x = d.draft;
  const sw = (label, help, value, onChange, plan) => (
    <InlineStack align="space-between" blockAlign="start" gap="300" wrap={false}>
      <BlockStack gap="050"><Text as="span" fontWeight="medium">{label}</Text>{help && <Text as="span" variant="bodySm" tone="subdued">{help}</Text>}</BlockStack>
      <RowSwitch on={value} label={label} disabled={locked || (plan && !allows(plan))} onChange={onChange} />
    </InlineStack>
  );
  return <>
    <FormCard title="Sign in inside the widget">
      {sw('Shop app sign-in', 'One tap with Shop', x.widgetSso.shop, v => d.set('widgetSso', {...x.widgetSso, shop: v}))}
      {sw('Google sign-in', 'Needs a Google client ID', x.widgetSso.google, v => d.set('widgetSso', {...x.widgetSso, google: v}))}
      {x.widgetSso.google && <InlineGrid columns={{xs: 1, sm: 2}} gap="300"><TextField label="Client ID" value={x.googleId ?? ''} onChange={v => d.set('googleId', v)} autoComplete="off" disabled={locked} /><TextField label="Client secret" type="password" value={x.googleSecret ?? ''} onChange={v => d.set('googleSecret', v)} autoComplete="off" disabled={locked} /></InlineGrid>}
      {sw('Facebook sign-in', null, x.widgetSso.facebook, v => d.set('widgetSso', {...x.widgetSso, facebook: v}))}
    </FormCard>
    <FormCard title="Shopify data">
      {sw('Show loyalty metafields in Shopify admin', 'Points and tier on the customer page', x.showMetafields, v => d.set('showMetafields', v))}
      {sw('Tag customers who redeem', null, x.autoTag.redeemer, v => d.set('autoTag', {...x.autoTag, redeemer: v}))}
      {sw('Tag members', null, x.autoTag.member, v => d.set('autoTag', {...x.autoTag, member: v}))}
    </FormCard>
    <FormCard title="Points and coupons">
      {sw('Pending points', 'Points become usable after a waiting time, so returns can be handled first.', x.pendingPoints.on, v => d.set('pendingPoints', {...x.pendingPoints, on: v}), 'advanced')}
      {x.pendingPoints.on && <InlineGrid columns={2} gap="300"><NumberField label="Wait" value={x.pendingPoints.value} onChange={v => d.set('pendingPoints', {...x.pendingPoints, value: v})} disabled={locked} error={!(x.pendingPoints.value > 0) ? 'Enter a number above 0' : undefined} /><Select label="Unit" value={x.pendingPoints.unit} onChange={v => d.set('pendingPoints', {...x.pendingPoints, unit: v})} disabled={locked} options={['minutes', 'days', 'months'].map(v => ({label: v, value: v}))} /></InlineGrid>}
      {sw('Customers can cancel a coupon and get points back', null, x.selfRevoke.on, v => d.set('selfRevoke', {...x.selfRevoke, on: v}))}
      {x.selfRevoke.on && <NumberField label="Within" value={x.selfRevoke.window.value} onChange={v => d.set('selfRevoke', {...x.selfRevoke, window: {...x.selfRevoke.window, value: v}})} suffix="hours" disabled={locked} />}
      {sw('Limit points a customer can earn', 'A ceiling across all programs', x.globalLimit.on, v => d.set('globalLimit', {...x.globalLimit, on: v}))}
      {x.globalLimit.on && <InlineGrid columns={2} gap="300"><NumberField label="Maximum points" value={x.globalLimit.max} onChange={v => d.set('globalLimit', {...x.globalLimit, max: v})} disabled={locked} /><Select label="Per" value={x.globalLimit.per} onChange={v => d.set('globalLimit', {...x.globalLimit, per: v})} disabled={locked} options={['day', 'week', 'month', 'year'].map(v => ({label: v, value: v}))} /></InlineGrid>}
      <NumberField label="Free products per cart" value={x.freeProductLimit} onChange={v => d.set('freeProductLimit', v)} disabled={locked} />
      {sw('Show points earned in the Shopify order email', null, x.pointsInOrderEmail, v => d.set('pointsInOrderEmail', v))}
    </FormCard>
    <FormCard title="Login links">
      {sw('Use my own login and sign-up pages', null, x.loginUrls.on, v => d.set('loginUrls', {...x.loginUrls, on: v}))}
      {x.loginUrls.on && <InlineGrid columns={{xs: 1, sm: 2}} gap="300"><TextField label="Login page" value={x.loginUrls.login} onChange={v => d.set('loginUrls', {...x.loginUrls, login: v})} autoComplete="off" disabled={locked} /><TextField label="Sign-up page" value={x.loginUrls.signup} onChange={v => d.set('loginUrls', {...x.loginUrls, signup: v})} autoComplete="off" disabled={locked} /></InlineGrid>}
    </FormCard>
    <FormCard title="AI shopping agents (WebMCP)">
      {sw('Let AI shopping agents read the program', 'Agents see points and rewards when they shop for a customer.', x.webmcp.on, v => d.set('webmcp', {...x.webmcp, on: v}))}
      {sw('Let them redeem rewards', null, x.webmcp.redeem, v => d.set('webmcp', {...x.webmcp, redeem: v}))}
    </FormCard>
  </>;
}

const VIEWS = {general: General, brand: Brand, email: EmailSettings, notifications: Notifications, prelaunch: Prelaunch, order: OrderSettings, translations: Translations, billing: Billing, developers: Developers, additional: Additional};

export function resolve(segments) {
  if (segments[0] !== 'settings') return null;
  const [, sub, id] = segments;
  if (sub === 'plans') return <Plans />;
  if (sub === 'notifications' && id) return <NotificationEditor key={id} id={id} />;
  const section = VIEWS[sub] ? sub : 'general';
  const View = VIEWS[section];
  return <Shell key={section} section={section}>{({locked}) => <BlockStack gap="400"><View locked={locked} /></BlockStack>}</Shell>;
}
