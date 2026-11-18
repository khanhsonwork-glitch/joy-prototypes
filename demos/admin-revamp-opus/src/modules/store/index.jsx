// On your store: where customers meet the program. The list shows each of the 7 places as a tiny map of the page
// (where on the page it sits), whether it is live, and one switch; each editor is settings on the left and a live
// preview in the shop's brand on the right.
import React, {useMemo, useState} from 'react';
import {
  ActionList, Badge, Banner, BlockStack, Button, Card, Checkbox, ChoiceList, Icon, InlineGrid, InlineStack, Popover, Select, Text, TextField,
} from '@shopify/polaris';
import {StarIcon, GiftCardIcon, PersonAddIcon, DiscountIcon, ChatReferralIcon, QuestionCircleIcon, StoreIcon, WalletIcon, ChatIcon, PageIcon, PersonIcon, ProductIcon, CartIcon, CreditCardIcon, OrderIcon, DragHandleIcon, MenuHorizontalIcon} from '@shopify/polaris-icons';
import {CCols, CPage, CProps, CRow, CSection, CSide} from '../../ui/clean.jsx';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {ScreenState, StatusBadge, NumberField, cx, num} from '../../ui/kit.jsx';
import {Block, EditorHero, EditorShell, FormCard, Hint, MoreSettings, Panel, RowSwitch, StorePreview} from '../../ui/parts.jsx';
import {RepeatList} from '../../ui/editor.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {useStore} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {PHOTOS} from '../../assets/index.js';
import {earnGives, pts, rewardGives} from '../../lib/econ.js';

const SHOWS = {
  widget: 'Points balance, ways to earn, rewards and referral link in a corner button',
  page: 'A full page that explains the program to new visitors',
  account: 'Balance, coupons and tier inside the customer account',
  product: '“Earn 120 points with this” under the price',
  cart: 'Redeem points for a discount right in the cart',
  checkout: 'Redeem rewards during checkout',
  thankyou: 'What the order just earned, and a sign-up nudge for guests',
};

const DEFAULTS = {
  widget: {sections: ['Ways to earn', 'Ways to redeem', 'Referral', 'Coupons', 'VIP tiers', 'Recent activity', 'Milestones', 'FAQ', 'Wallet pass'], hidden: ['Milestones', 'FAQ'], position: 'right', launcher: 'Rewards', heading: 'North Bloom Rewards', guestText: 'Join and get 100 points', mobile: true, hidePages: '', version: 'V4'},
  page: {sections: ['Hero banner', 'How it works', 'Ways to earn', 'Ways to redeem', 'VIP tiers', 'Referral', 'FAQ', 'Donation'], hidden: ['Donation'],
    faqs: [
      {id: 'q1', q: 'How do I earn points?', a: 'You get 5 points for every $1 you spend, plus points for your birthday, reviews and more.', on: true},
      {id: 'q2', q: 'When do my points expire?', a: 'Points expire after 12 months without an order or a reward.', on: true},
      {id: 'q3', q: 'Can I use points with other discounts?', a: 'Yes, one reward code can be combined with product discounts.', on: false},
    ],
    donation: {goal: '5000', start: '1200', from: '2026-11-20', to: '2026-12-31', amount: '1', every: '1'},
    labels: {}, hiddenPrograms: [],
    handle: 'rewards', heading: 'Glow more, earn more', sub: 'Points on every order, perks as you go.', layout: 'wide', version: 'V2'},
  account: {sections: ['Balance', 'Rewards', 'Earn', 'Redeem', 'VIP', 'Referral', 'Wallet', 'Activity', 'Impact'], hidden: ['Impact'], border: 'thin', radius: 'medium', density: 'default', coupons: '6', hero: 'medium'},
  product: {sections: ['Point calculator', 'Referral product block'], hidden: ['Referral product block'], text: 'Earn {points} points with this purchase', fontSize: 14, iconSize: 16, guests: true},
  cart: {sections: ['Redeem points', 'Applied rewards'], hidden: [], hideGuests: false, hideShort: true, earnBack: true, pointsInput: true, preferHigher: true, collapse: true, position: 'above_checkout', version: 'New'},
  checkout: {sections: ['Quick redeem', 'Available rewards', 'Referral at checkout'], hidden: [], code: 'BLOOM-QUICK5', codeTitle: 'Use 500 points for $5 off', codeText: 'Applies to this order only.'},
  thankyou: {sections: ['Points earned', 'Sign up block', 'Referral block', 'VIP tier progress'], hidden: ['Referral block'], celebrate: true,
    signup: {heading: 'You just earned 380 points', text: 'Create an account to keep them and get 100 more.', signupBtn: 'Create account', loginBtn: 'Log in', loginText: 'Already a member?'}},
};

function Thumb({id}) {
  return (
    <div className={`op-thumb op-thumb--${id}`} aria-hidden="true">
      <span className="op-thumb__bar" />
      <span className="op-thumb__a" /><span className="op-thumb__b" /><span className="op-thumb__c" />
      <span className="op-thumb__hot" />
    </div>
  );
}

export function StoreHome() {
  const {db, set, merge} = useStore();
  const {notify} = useShell();
  const navigate = useNavigate();
  const t = db.onsite.theme;
  const live = db.onsite.surfaces.filter(s => s.status === 'live').length;
  const toggle = (s, on) => set(['onsite', 'surfaces'], db.onsite.surfaces.map(x => (x.id === s.id ? {...x, status: on ? 'live' : 'off'} : x)));
  const embed = () => {merge(['onsite', 'theme'], {embedOn: !t.embedOn}); notify(t.embedOn ? 'App embed turned off. The widget is hidden.' : 'App embed turned on');};
  const wallet = db.onsite.wallet.apple || db.onsite.wallet.google;
  return (
    <PageFrame title="On your store" moreActions={[{content: 'Open theme editor', onAction: () => notify('Opens the Shopify theme editor in a new tab')}]}>
      <ScreenState>
        <CPage>
          <SectionNav section="store" bare />
          <CCols sideFirst={false} side={
            <CSide title={`Theme ${t.themeName}`}>
              <p className="pt-note">{live} of {db.onsite.surfaces.length} places show your program.</p>
              <CProps rows={[
                {label: 'App embed', value: t.embedOn ? 'On' : 'Off', onClick: embed},
                {label: 'App blocks', value: num(t.blocks)},
                {label: 'Theme editor', value: 'Open', onClick: () => notify('Opens the Shopify theme editor in a new tab')},
              ]} />
            </CSide>}>
            <CSection title="Where customers see it">
              {db.onsite.surfaces.map(x => (
                <CRow key={x.id} icon={SURF_ICON[x.id] ?? StoreIcon} name={x.name} url={`/store/${x.id}`}
                  off={x.status === 'off'} value={x.where} />
              ))}
              <CRow icon={WalletIcon} name="Wallet pass" url="/store/wallet" off={!wallet} value={`${num(db.onsite.wallet.passes)} passes`} />
            </CSection>
          </CCols>
        </CPage>
      </ScreenState>
    </PageFrame>
  );
}

const SURF_ICON = {widget: ChatIcon, page: PageIcon, account: PersonIcon, product: ProductIcon, cart: CartIcon, checkout: CreditCardIcon, thankyou: OrderIcon};

/**
 * Sections of a place on the store, read like the Points rows: name + one short state on the right. Drag a row to
 * reorder it; show / hide, move and remove live in the row's ⋯ menu (also the keyboard way to reorder).
 */
function SectionsList({cfg, set, locked}) {
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [menu, setMenu] = useState(null);
  const order = cfg.sections;
  const hidden = cfg.hidden;
  const move = (from, to) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order]; const [x] = next.splice(from, 1); next.splice(to, 0, x);
    set({sections: next});
  };
  const toggle = name => set({hidden: hidden.includes(name) ? hidden.filter(h => h !== name) : [...hidden, name]});
  const remove = name => set({sections: order.filter(x => x !== name), hidden: hidden.filter(h => h !== name)});
  const end = () => {setDrag(null); setOver(null);};
  return (
    <div className="pt-list" role="list" aria-label="Sections, drag to reorder">
      {order.map((name, i) => {
        const off = hidden.includes(name);
        return (
          <div key={name} role="listitem" className={cx('pt-row', 'pt-drag', off && 'is-off', drag === i && 'is-dragging', over === i && drag != null && drag !== i && 'is-over')}
            draggable={!locked} onDragStart={e => {setDrag(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', name);}}
            onDragOver={e => {if (drag == null) return; e.preventDefault(); if (over !== i) setOver(i);}}
            onDrop={e => {e.preventDefault(); if (drag != null) move(drag, i); end();}} onDragEnd={end}>
            <span className="pt-drag__handle" aria-hidden="true"><Icon source={DragHandleIcon} /></span>
            <span className="pt-row__name">{name}</span>
            <span className="pt-row__value">{off ? 'Hidden' : 'Shown'}</span>
            <Popover active={menu === name} onClose={() => setMenu(null)} preferredAlignment="right"
              activator={<Button variant="tertiary" icon={MenuHorizontalIcon} accessibilityLabel={`Actions for ${name}`} disabled={locked} onClick={() => setMenu(m => (m === name ? null : name))} />}>
              <ActionList actionRole="menuitem" onActionAnyItem={() => setMenu(null)} items={[
                {content: off ? 'Show on the widget' : 'Hide from the widget', onAction: () => toggle(name)},
                {content: 'Move up', disabled: i === 0, onAction: () => move(i, i - 1)},
                {content: 'Move down', disabled: i === order.length - 1, onAction: () => move(i, i + 1)},
                {content: 'Remove', destructive: true, onAction: () => remove(name)},
              ]} />
            </Popover>
          </div>
        );
      })}
    </div>
  );
}

/** Content inside the sections: FAQ answers, the donation goal, how each program reads on the page, the sign-up
 * banner on the thank you page and the quick-redeem code at checkout. Production keeps each in its own screen; here
 * they sit under the section list of the place they belong to, next to the same preview. */
function SectionContent({id, cfg, patch, locked}) {
  const {db} = useStore();
  const {notify} = useShell();
  const shown = name => !cfg.hidden.includes(name);
  const sub = (key, p) => patch({[key]: {...cfg[key], ...p}});
  if (id === 'page') {
    const progs = [...db.earn.filter(e => e.status === 'active').map(e => ({id: e.id, name: e.name, kind: 'Earn'})), ...db.redeem.filter(r => r.status === 'active').map(r => ({id: r.id, name: r.name, kind: 'Reward'}))];
    const hiddenP = cfg.hiddenPrograms ?? [];
    return (
      <>
        <FormCard title="How programs read on the page" description="Rename a program for customers or leave it off the page. The program itself does not change.">
          <div className="op-list--tight">
            {progs.slice(0, 10).map(pg => (
              <InlineStack key={pg.id} gap="300" blockAlign="center" wrap={false}>
                <Badge>{pg.kind}</Badge>
                <div style={{flex: 1, minWidth: 0}}><TextField label={`Name on the page for ${pg.name}`} labelHidden value={cfg.labels?.[pg.id] ?? pg.name} onChange={v => patch({labels: {...cfg.labels, [pg.id]: v}})} autoComplete="off" disabled={locked} /></div>
                <Checkbox label="Show" checked={!hiddenP.includes(pg.id)} disabled={locked} onChange={v => patch({hiddenPrograms: v ? hiddenP.filter(x => x !== pg.id) : [...hiddenP, pg.id]})} />
              </InlineStack>
            ))}
          </div>
          {progs.length > 10 && <Text as="p" variant="bodySm" tone="subdued">{`and ${progs.length - 10} more, in the order of Programs › Points.`}</Text>}
        </FormCard>
        {shown('FAQ') && (
          <FormCard title="FAQ" action={<Button size="slim" disabled={locked} onClick={() => {patch({faqs: [...cfg.faqs, {id: `q${Date.now()}`, q: 'Do guests earn points?', a: 'Guests earn after they create an account with the same email.', on: true}]}); notify('Joy AI added a question from your program rules');}}>Write with Joy AI</Button>}>
            <RepeatList items={cfg.faqs} onChange={v => patch({faqs: v})} disabled={locked} addLabel="Add question" max={20} min={0}
              make={i => ({id: `q${Date.now()}${i}`, q: '', a: '', on: true})}
              render={(f, p) => (
                <BlockStack gap="200">
                  <TextField label="Question" value={f.q} onChange={v => p({q: v})} autoComplete="off" disabled={locked} error={!f.q.trim() ? 'Write the question' : undefined} />
                  <TextField label="Answer" value={f.a} onChange={v => p({a: v})} multiline={2} autoComplete="off" disabled={locked} />
                  <Checkbox label="Show on the page" checked={f.on} onChange={v => p({on: v})} disabled={locked} />
                </BlockStack>
              )} />
            {!cfg.faqs.length && <Text as="p" tone="subdued">No questions yet. Add one or let Joy AI write them from your rules.</Text>}
          </FormCard>
        )}
        {shown('Donation') && (
          <FormCard title="Donation goal" description="Customers see a bar that fills as orders come in.">
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <TextField label="Goal" prefix="$" type="number" value={cfg.donation.goal} onChange={v => sub('donation', {goal: v})} autoComplete="off" disabled={locked} />
              <TextField label="Starting point" prefix="$" type="number" value={cfg.donation.start} onChange={v => sub('donation', {start: v})} autoComplete="off" disabled={locked} />
              <TextField label="Starts" type="date" value={cfg.donation.from} onChange={v => sub('donation', {from: v})} autoComplete="off" disabled={locked} />
              <TextField label="Ends" type="date" value={cfg.donation.to} onChange={v => sub('donation', {to: v})} autoComplete="off" disabled={locked} error={cfg.donation.to && cfg.donation.from && cfg.donation.to < cfg.donation.from ? 'Ends before it starts' : undefined} />
              <TextField label="You give" prefix="$" type="number" min={1} value={cfg.donation.amount} onChange={v => sub('donation', {amount: v})} autoComplete="off" disabled={locked} error={Number(cfg.donation.amount) < 1 ? 'At least $1' : undefined} />
              <TextField label="For every" suffix="orders" type="number" min={1} value={cfg.donation.every} onChange={v => sub('donation', {every: v})} autoComplete="off" disabled={locked} error={Number(cfg.donation.every) < 1 ? 'At least 1 order' : undefined} />
            </InlineGrid>
            <p className="op-sentence">{`You give $${cfg.donation.amount || 0} for every ${cfg.donation.every || 1} ${Number(cfg.donation.every) === 1 ? 'order' : 'orders'} until you reach $${num(Number(cfg.donation.goal) || 0)}. The bar starts at $${num(Number(cfg.donation.start) || 0)}.`}</p>
          </FormCard>
        )}
      </>
    );
  }
  if (id === 'thankyou' && shown('Sign up block')) {
    return (
      <FormCard title="Sign up block" description="Guests see this after they order.">
        <TextField label="Heading" value={cfg.signup.heading} onChange={v => sub('signup', {heading: v})} autoComplete="off" disabled={locked} />
        <TextField label="Text" value={cfg.signup.text} onChange={v => sub('signup', {text: v})} autoComplete="off" disabled={locked} />
        <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
          <TextField label="Sign up button" value={cfg.signup.signupBtn} onChange={v => sub('signup', {signupBtn: v})} autoComplete="off" disabled={locked} />
          <TextField label="Log in button" value={cfg.signup.loginBtn} onChange={v => sub('signup', {loginBtn: v})} autoComplete="off" disabled={locked} />
        </InlineGrid>
        <TextField label="Text before log in" value={cfg.signup.loginText} onChange={v => sub('signup', {loginText: v})} autoComplete="off" disabled={locked} />
      </FormCard>
    );
  }
  if (id === 'checkout' && shown('Quick redeem')) {
    return (
      <FormCard title="Quick redeem code" description="One tap at checkout spends points for this code.">
        <TextField label="Discount code" value={cfg.code} onChange={v => patch({code: v.toUpperCase()})} autoComplete="off" disabled={locked} error={!cfg.code.trim() ? 'Enter a code' : undefined} />
        <TextField label="Title" value={cfg.codeTitle} onChange={v => patch({codeTitle: v})} autoComplete="off" disabled={locked} />
        <TextField label="Description" value={cfg.codeText} onChange={v => patch({codeText: v})} autoComplete="off" disabled={locked} />
      </FormCard>
    );
  }
  return null;
}

function Preview({id, cfg}) {
  const {db} = useStore();
  const brand = db.settings.brand.primary;
  const shown = cfg.sections.filter(s => !cfg.hidden.includes(s));
  const earn = db.earn.filter(e => e.status === 'active').slice(0, 3);
  const red = db.redeem.filter(r => r.status === 'active').slice(0, 2);
  if (id === 'page') {
    return (
      <Card><BlockStack gap="300"><Text as="h2" variant="headingSm">Preview</Text>
        <div className="op-store" style={{'--brand-primary': brand}}>
          {shown.includes('Hero banner') && <div className="op-hero"><img src={PHOTOS.heroDesktop} alt="North Bloom skincare on a sunny shelf" /><div><strong>{cfg.heading}</strong><span>{cfg.sub}</span><span className="op-store__btn">Join now</span></div></div>}
          <div className="op-store__body">
            {shown.filter(s => s !== 'Hero banner').map(s => (
              <div key={s} className="op-store__line op-store__line--stack">
                <span className="op-store__text">{s}</span>
                {s === 'Ways to earn' && <span className="op-store__muted">{earn.filter(e => !(cfg.hiddenPrograms ?? []).includes(e.id)).map(e => cfg.labels?.[e.id] || e.name).join(' · ')}</span>}
                {s === 'Ways to redeem' && <span className="op-store__muted">{red.filter(r => !(cfg.hiddenPrograms ?? []).includes(r.id)).map(r => cfg.labels?.[r.id] || r.name).join(' · ')}</span>}
                {s === 'FAQ' && <span className="op-store__muted">{(cfg.faqs ?? []).filter(f => f.on && f.q).map(f => f.q).slice(0, 2).join(' · ') || 'No questions shown'}</span>}
                {s === 'Donation' && cfg.donation && <span className="op-donate"><i style={{width: `${Math.min(100, ((Number(cfg.donation.start) || 0) / (Number(cfg.donation.goal) || 1)) * 100)}%`}} /></span>}
              </div>
            ))}
          </div>
        </div>
      </BlockStack></Card>
    );
  }
  if (id === 'product') {
    return (
      <Card><BlockStack gap="300"><Text as="h2" variant="headingSm">Preview</Text>
        <div className="op-store op-pdp" style={{'--brand-primary': brand}}>
          <img src={PHOTOS.miniJar} alt="" /><div className="op-store__body"><strong className="op-quiz__q">Cloud Cream</strong><span>$38.00</span>
            {shown.includes('Point calculator') && <span className="op-calc" style={{fontSize: cfg.fontSize}}>★ {cfg.text.replace('{points}', '190')}</span>}
            <span className="op-store__btn">Add to cart</span></div>
        </div>
      </BlockStack></Card>
    );
  }
  if (id === 'cart') {
    return (
      <Card><BlockStack gap="300"><Text as="h2" variant="headingSm">Preview</Text>
        <div className="op-store" style={{'--brand-primary': brand}}>
          <div className="op-store__body">
            <div className="op-store__line"><span className="op-store__text">Cloud Cream × 2</span><b>$76.00</b></div>
            {shown.includes('Redeem points') && <div className="op-redeembox"><strong>You have {pts(db, 1240)}</strong>{cfg.pointsInput && <span className="op-store__muted">Use 500 points → $5 off</span>}<span className="op-store__btn">Redeem</span>{cfg.earnBack && <span className="op-store__muted">This order earns you 380 points</span>}</div>}
            <span className="op-store__btn">Check out</span>
          </div>
        </div>
      </BlockStack></Card>
    );
  }
  const lines = {
    widget: shown.slice(0, 5).map(s => ({icon: {'Ways to earn': StarIcon, 'Ways to redeem': GiftCardIcon, Referral: ChatReferralIcon, Coupons: DiscountIcon, 'VIP tiers': StarIcon, FAQ: QuestionCircleIcon, 'Wallet pass': WalletIcon}[s] ?? PersonAddIcon, text: s, value: s === 'Ways to earn' ? `${earn.length} ways` : s === 'Ways to redeem' ? `${db.redeem.filter(r => r.status === 'active').length} rewards` : s === 'Referral' ? 'Give $10' : ''})),
    account: shown.slice(0, 6).map(s => ({text: s, value: s === 'Balance' ? pts(db, 1240) : s === 'VIP' ? 'Gold' : ''})),
    checkout: shown.map(s => ({text: s === 'Quick redeem' ? cfg.codeTitle : s, value: s === 'Quick redeem' ? cfg.code : ''})),
    thankyou: shown.map(s => ({text: s === 'Points earned' ? 'You earned 380 points with this order' : s === 'Sign up block' ? `${cfg.signup.heading}. ${cfg.signup.text}` : s, value: s === 'VIP tier progress' ? '62% to VIP' : s === 'Sign up block' ? cfg.signup.signupBtn : ''})),
  }[id] ?? [];
  return (
    <div className={id === 'widget' ? `op-widgetwrap is-${cfg.position}` : undefined}>
      <StorePreview title="Preview" heading={id === 'widget' ? cfg.heading : id === 'thankyou' ? 'Thank you, Ava!' : 'Your rewards'} sub={id === 'widget' ? `Ava · ${pts(db, 1240)}` : 'North Bloom'} brand={brand} lines={lines}
        footer={id === 'widget' ? <span className="op-launcher">{cfg.launcher}</span> : null} />
    </div>
  );
}

export function SurfaceEditor({id}) {
  const {db, set} = useStore();
  const {notify} = useShell();
  const surface = db.onsite.surfaces.find(s => s.id === id);
  const saved = db.onsite.config?.[id];
  const source = useMemo(() => ({...DEFAULTS[id], ...(saved ?? {})}), [id, saved]);
  const d = useDraft(source, {message: `${surface?.name ?? 'Settings'} saved`, onSave: v => set(['onsite', 'config', id], v)});
  if (!surface) return null;
  const cfg = d.draft;
  const patch = p => d.set(x => ({...x, ...p}));
  const plusLocked = surface.status === 'locked';
  const brand = db.settings.brand;
  return (
    <PageFrame title={surface.name} backUrl="/store" badge={plusLocked ? <Badge>Shopify Plus only</Badge> : <StatusBadge status={surface.status === 'live' ? 'live' : 'inactive'} label={surface.status === 'live' ? 'Live' : 'Off'} />}>
      <ScreenState>{({locked: l0}) => {
        const locked = l0 || plusLocked;
        const live = surface.status === 'live';
        return (
          <EditorShell
            hero={<EditorHero icon={StoreIcon} sentence={`${SHOWS[id]}.`}
              facts={[['Sections shown', `${cfg.sections.filter(x => !cfg.hidden.includes(x)).length} of ${cfg.sections.length}`], ...(cfg.version ? [['Version', cfg.version]] : [])]}
              nudge={plusLocked ? 'Checkout blocks need Shopify Plus. Customers on other plans redeem in the cart instead; you can look at the settings here.' : null}
              status={plusLocked ? undefined : {on: live, disabled: locked, label: 'Show on store', note: live ? 'Live on your store' : 'Off',
                onChange: v => {set(['onsite', 'surfaces'], db.onsite.surfaces.map(y => (y.id === id ? {...y, status: v ? 'live' : 'off'} : y))); notify(v ? `${surface.name} is live` : `${surface.name} turned off`);}}} />}
            side={<Preview id={id} cfg={cfg} />}
            more={<MoreSettings sections={[
              {title: 'Colours', description: 'From Settings › Brand, so the widget, pages and emails match.', children: <>
                <InlineStack gap="300">{Object.entries(brand).map(([k, v]) => <span key={k} className="op-chip"><i style={{background: v}} />{k} {v}</span>)}</InlineStack>
                <Button url="/settings/brand" variant="plain">Change brand colours</Button>
              </>},
              ['widget', 'page', 'cart'].includes(id) && {title: 'Classic version', children: <Text as="p" variant="bodySm" tone="subdued">{id === 'widget' ? 'You are on the newest widget (V4). The classic widget editor is still available for shops that use it.' : id === 'page' ? 'You are on the new loyalty page (V2). Shops on the classic page keep their editor and can switch when ready.' : 'You are on the new cart redeem. The classic “redeem inline” stays available.'}</Text>},
            ]} />}>
            <Panel title="Sections" action={cfg.sections.length < 14 ? <button type="button" className="pt-add" disabled={locked} onClick={() => patch({sections: [...cfg.sections, `Custom block ${cfg.sections.length + 1}`]})}>+ Block</button> : null}>
              <SectionsList cfg={cfg} set={patch} locked={locked} />
            </Panel>
            <SectionContent id={id} cfg={cfg} patch={patch} locked={locked} />
                {id === 'widget' && (
              <Panel title="Launcher and text">
                <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                  <Select label="Position" value={cfg.position} onChange={v => patch({position: v})} disabled={locked} options={[{label: 'Bottom right', value: 'right'}, {label: 'Bottom left', value: 'left'}]} />
                  <TextField label="Button text" value={cfg.launcher} onChange={v => patch({launcher: v})} autoComplete="off" disabled={locked} />
                  <TextField label="Heading" value={cfg.heading} onChange={v => patch({heading: v})} autoComplete="off" disabled={locked} />
                  <TextField label="Text for guests" value={cfg.guestText} onChange={v => patch({guestText: v})} autoComplete="off" disabled={locked} />
                </InlineGrid>
                <Checkbox label="Show on phones" checked={cfg.mobile} onChange={v => patch({mobile: v})} disabled={locked} />
                <TextField label="Hide on these pages" value={cfg.hidePages} onChange={v => patch({hidePages: v})} placeholder="/pages/wholesale, /checkout" autoComplete="off" disabled={locked} />
              </Panel>
            )}
            {id === 'page' && (
              <Panel title="Page">
                <TextField label="Page address" prefix="northbloom.com/pages/" value={cfg.handle} onChange={v => patch({handle: v})} autoComplete="off" disabled={locked} />
                <TextField label="Heading" value={cfg.heading} onChange={v => patch({heading: v})} autoComplete="off" disabled={locked} />
                <TextField label="Text under the heading" value={cfg.sub} onChange={v => patch({sub: v})} autoComplete="off" disabled={locked} />
                <Select label="Layout" value={cfg.layout} onChange={v => patch({layout: v})} disabled={locked} options={[{label: 'Wide', value: 'wide'}, {label: 'Centred', value: 'centred'}]} />
              </Panel>
            )}
            {id === 'account' && (
              <Panel title="Design">
                <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                  <Select label="Card border" value={cfg.border} onChange={v => patch({border: v})} disabled={locked} options={[{label: 'Thin', value: 'thin'}, {label: 'Thick', value: 'thick'}]} />
                  <Select label="Corners" value={cfg.radius} onChange={v => patch({radius: v})} disabled={locked} options={[{label: 'Square', value: 'square'}, {label: 'Medium', value: 'medium'}, {label: 'Pill', value: 'pill'}]} />
                  <Select label="Spacing" value={cfg.density} onChange={v => patch({density: v})} disabled={locked} options={[{label: 'Compact', value: 'compact'}, {label: 'Default', value: 'default'}, {label: 'Airy', value: 'airy'}]} />
                  <Select label="Coupons shown" value={cfg.coupons} onChange={v => patch({coupons: v})} disabled={locked} options={['4', '6', '8'].map(v => ({label: v, value: v}))} />
                </InlineGrid>
              </Panel>
            )}
            {id === 'product' && (
              <Panel title="Point calculator">
                <TextField label="Text" value={cfg.text} onChange={v => patch({text: v})} autoComplete="off" disabled={locked} helpText="{points} becomes the number for that product" />
                <InlineGrid columns={2} gap="300">
                  <NumberField label="Font size" value={cfg.fontSize} onChange={v => patch({fontSize: v})} suffix="px" min={10} disabled={locked} error={!(cfg.fontSize > 0) ? 'Enter a size above 0' : undefined} />
                  <NumberField label="Icon size" value={cfg.iconSize} onChange={v => patch({iconSize: v})} suffix="px" min={10} disabled={locked} />
                </InlineGrid>
                <Checkbox label="Show to guests too" checked={cfg.guests} onChange={v => patch({guests: v})} disabled={locked} />
              </Panel>
            )}
            {id === 'cart' && (
              <Panel title="Behaviour">
                <Checkbox label="Hide for guests" checked={cfg.hideGuests} onChange={v => patch({hideGuests: v})} disabled={locked} />
                <Checkbox label="Hide when the customer can't afford any reward" checked={cfg.hideShort} onChange={v => patch({hideShort: v})} disabled={locked} />
                <Checkbox label="Show points this order earns" checked={cfg.earnBack} onChange={v => patch({earnBack: v})} disabled={locked} />
                <Checkbox label="Let customers type how many points to use" checked={cfg.pointsInput} onChange={v => patch({pointsInput: v})} disabled={locked} />
                <Checkbox label="Suggest the reward with the highest value first" checked={cfg.preferHigher} onChange={v => patch({preferHigher: v})} disabled={locked} />
                <Checkbox label="Collapse after redeeming" checked={cfg.collapse} onChange={v => patch({collapse: v})} disabled={locked} />
                <Select label="Position" value={cfg.position} onChange={v => patch({position: v})} disabled={locked} options={[{label: 'Above the checkout button', value: 'above_checkout'}, {label: 'Below the items', value: 'below_items'}, {label: 'Custom (CSS selector)', value: 'custom'}]} />
                {cfg.position === 'custom' && <TextField label="CSS selector" value={cfg.selector ?? ''} onChange={v => patch({selector: v})} autoComplete="off" disabled={locked} placeholder=".cart__footer" />}
              </Panel>
            )}
            {id === 'thankyou' && (
              <Panel title="Behaviour">
                <Checkbox label="Celebrate when an order unlocks a reward" checked={cfg.celebrate} onChange={v => patch({celebrate: v})} disabled={locked} />
              </Panel>
            )}
          </EditorShell>
        );
      }}</ScreenState>
    </PageFrame>
  );
}

function Qr() {
  const cells = Array.from({length: 121}, (_, i) => ((i * 7 + (i % 11) * 3 + Math.floor(i / 11)) % 5 < 2));
  return <div className="op-qr" role="img" aria-label="QR code for ava@inbox.example">{cells.map((on, i) => <i key={i} className={on ? 'is-on' : undefined} />)}</div>;
}

export function Wallet() {
  const {db, set} = useStore();
  const {notify} = useShell();
  const w = db.onsite.wallet;
  const source = useMemo(() => ({header: 'North Bloom Rewards', bg: db.settings.brand.primary, text: '#ffffff', fields: [{id: 'f1', label: 'Points', value: 'Balance'}, {id: 'f2', label: 'Tier', value: 'VIP tier'}], notifyChange: true, notifyExpiry: true, qrWidget: w.qrWidget, qrTitle: 'Show this at the counter', ...w}), [w, db.settings.brand.primary]);
  const d = useDraft(source, {message: 'Wallet pass saved', onSave: v => set(['onsite', 'wallet'], v)});
  const x = d.draft;
  const [email, setEmail] = useState('ava@inbox.example');
  const [qr, setQr] = useState(false);
  return (
    <PageFrame title="Wallet pass" backUrl="/store">
      <SectionNav section="store" />
      <ScreenState>{({locked}) => (
        <InlineGrid columns={{xs: 1, md: '1.1fr 1fr'}} gap="400" alignItems="start">
          <BlockStack gap="400">
            <FormCard title="Where members can add it">
              <Checkbox label="Apple Wallet" checked={x.apple} onChange={v => d.set('apple', v)} disabled={locked} />
              <Checkbox label="Google Wallet" checked={x.google} onChange={v => d.set('google', v)} disabled={locked} />
              <Text as="p" variant="bodySm" tone="subdued">{num(w.passes)} members have a pass.</Text>
            </FormCard>
            <FormCard title="Design">
              <TextField label="Header" value={x.header} onChange={v => d.set('header', v)} autoComplete="off" disabled={locked} />
              <InlineGrid columns={2} gap="300">
                <TextField label="Background colour" value={x.bg} onChange={v => d.set('bg', v)} autoComplete="off" disabled={locked} prefix={<span className="op-dot" style={{background: x.bg}} />} />
                <TextField label="Text colour" value={x.text} onChange={v => d.set('text', v)} autoComplete="off" disabled={locked} prefix={<span className="op-dot" style={{background: x.text}} />} />
              </InlineGrid>
              <Text as="h3" variant="headingXs">Fields on the pass</Text>
              <RepeatList items={x.fields} onChange={v => d.set('fields', v)} disabled={locked} addLabel="Add field" max={4} min={1}
                make={i => ({id: `f${i + 1}${Date.now()}`, label: 'Member since', value: 'Joined date'})}
                render={(f, patch) => (
                  <InlineGrid columns={2} gap="200">
                    <TextField label="Label" value={f.label} onChange={v => patch({label: v})} autoComplete="off" disabled={locked} />
                    <Select label="Shows" value={f.value} onChange={v => patch({value: v})} disabled={locked} options={['Balance', 'VIP tier', 'Joined date', 'Referral link', 'Store credit'].map(v => ({label: v, value: v}))} />
                  </InlineGrid>
                )} />
            </FormCard>
            <FormCard title="Pass notifications">
              <Checkbox label="Notify when the balance changes" checked={x.notifyChange} onChange={v => d.set('notifyChange', v)} disabled={locked} />
              <Checkbox label="Notify before points expire" checked={x.notifyExpiry} onChange={v => d.set('notifyExpiry', v)} disabled={locked} />
            </FormCard>
            <FormCard title="QR code at the counter" description="Staff scan the member's QR code on POS to find them.">
              <Checkbox label="Show the QR code in the widget" checked={x.qrWidget} onChange={v => d.set('qrWidget', v)} disabled={locked} />
              {x.qrWidget && <TextField label="Text above the QR code" value={x.qrTitle} onChange={v => d.set('qrTitle', v)} autoComplete="off" disabled={locked} />}
              <InlineStack gap="200" blockAlign="end" wrap={false}>
                <div style={{flex: 1}}><TextField label="Export a customer's QR code" value={email} onChange={setEmail} autoComplete="off" /></div>
                <Button onClick={() => {if (!db.customers.some(c => c.email === email)) {notify('No customer with this email', {error: true}); return;} setQr(true);}}>Show QR</Button>
              </InlineStack>
              {qr && <InlineStack gap="300" blockAlign="center"><Qr /><Button onClick={() => notify('QR code downloaded')}>Download</Button></InlineStack>}
            </FormCard>
          </BlockStack>
          <div className="op-sticky">
            <Card><BlockStack gap="300"><Text as="h2" variant="headingSm">Preview</Text>
              <div className="op-pass" style={{background: x.bg, color: x.text}}>
                <div className="op-pass__top"><strong>{x.header}</strong><span>North Bloom</span></div>
                <div className="op-pass__fields">{x.fields.map(f => <div key={f.id}><small>{f.label}</small><b>{f.value === 'Balance' ? num(1240) : f.value === 'VIP tier' ? 'Gold' : f.value === 'Joined date' ? 'Apr 2025' : f.value === 'Store credit' ? '$12' : 'ava10'}</b></div>)}</div>
                <div className="op-pass__qr"><Qr /></div>
              </div>
              <Hint>Changes reach passes already in wallets within a few minutes.</Hint>
            </BlockStack></Card>
          </div>
        </InlineGrid>
      )}</ScreenState>
    </PageFrame>
  );
}

export function resolve(segments) {
  if (segments[0] !== 'store') return null;
  const [, sub] = segments;
  if (!sub) return <StoreHome />;
  if (sub === 'wallet') return <Wallet />;
  return <SurfaceEditor key={sub} id={sub} />;
}
