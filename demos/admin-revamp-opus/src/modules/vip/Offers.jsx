// Member deals, paid membership (Plans V2 model) and partner tiers (B2B). Lists + editors on the same pattern as
// every other program: list row → editor with the consequence sentence in the rail.
import React from 'react';
import {Badge, Banner, BlockStack, Button, Card, Checkbox, ChoiceList, InlineGrid, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {DiscountIcon, CreditCardIcon, StoreIcon} from '@shopify/polaris-icons';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {CCols, CInvite, CPage, CRow, CSection} from '../../ui/clean.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {EligibilityField, EmptyCard, NumberField, ScreenState, StatusBadge, dateLabel, eligibilityLabel, money, num, useConfirm, usePlan} from '../../ui/kit.jsx';
import {Block, EditorHero, EditorLayout, EditorShell, FormCard, KpiRow, MoreSettings, Panel, Row, RowSwitch, SimpleTable, StatusCard, SummaryCard, realId, useScenarioList} from '../../ui/parts.jsx';
import {Missing, RepeatList, useRecordDraft} from '../../ui/editor.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {HashLink, useNavigate} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {MKT_ART} from '../../assets/index.js';
import {dealGives} from '../../lib/allPrograms.js';
import {pts} from '../../lib/econ.js';

const dupe = (upsert, coll, x, prefix, notify, navigate, base) => {
  const nid = newId(prefix);
  upsert(coll, {...x, id: nid, name: `${x.name} (copy)`, status: 'inactive'});
  notify('Duplicated as a draft (off)');
  navigate(`${base}/${nid}`);
};

/* ---------- Member deals ---------- */

export function DealList() {
  const {db} = useStore();
  const navigate = useNavigate();
  const items = useScenarioList(db.deals);
  return (
    <PageFrame title="Member deals" backUrl="/vip" moreActions={[{content: 'Add deal', url: '/vip/deals/new'}]}>
      <ScreenState>
        {({locked}) => (
          <CPage>
            <SectionNav section="vip" bare />
            <CCols>
              <CSection title="Deals" add="Deal" onAdd={() => navigate('/vip/deals/new')} locked={locked}>
                {items.length ? items.map(x => (
                  <CRow key={x.id} icon={DiscountIcon} name={x.name} value={dealGives(x).split(' · ')[0]} url={`/vip/deals/${x.id}`}
                    off={!(x.status === 'active' || x.status === 'scheduled')} tag={x.status === 'scheduled' ? 'Scheduled' : undefined} />
                )) : <EmptyCard art="rewards" heading="No deals yet" action={{content: 'Add deal', url: '/vip/deals/new'}}>Early access to your next launch, for members only.</EmptyCard>}
              </CSection>
            </CCols>
          </CPage>
        )}
      </ScreenState>
    </PageFrame>
  );
}

export function DealEditor({id}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const fresh = React.useMemo(() => ({id: null, name: 'Exclusive deal', status: 'inactive', discount: {type: 'amount', value: 5}, eligibility: {mode: 'members'}, schedule: {start: '2026-11-18', end: '2026-11-19'}, dateMode: 'static', products: '', appliesTo: 'all', perCustomer: 1, countdown: true, design: {action: 'Members save', cta: 'Shop the deal'}, used: 0}), []);
  const record = isNew ? fresh : db.deals.find(x => x.id === realId(id));
  const d = useRecordDraft({record: record ?? fresh, isNew, backUrl: '/vip/deals', prefix: 'd', save: item => upsert('deals', item), urlFor: nid => `/vip/deals/${nid}`,
    validate: x => ({name: !x.name?.trim() ? 'Name the deal' : null, schedule: (x.dateMode ?? 'static') === 'static' && !x.schedule?.start ? 'Deals need a start date' : x.schedule?.end && x.schedule.end < x.schedule.start ? 'The deal ends before it starts' : null})});
  if (!record && !isNew) return <Missing title="Member deal" backUrl="/vip/deals" what="deal" />;
  const x = d.draft;
  const on = x.status === 'active' || x.status === 'scheduled';
  const disc = x.discount;
  const design = x.design ?? {};
  return (
    <PageFrame title={isNew ? 'New member deal' : x.name} backUrl="/vip/deals" badge={isNew ? undefined : <StatusBadge status={x.status} />}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={DiscountIcon}
            sentence={`${eligibilityLabel(x.eligibility, db)} get ${dealGives(x)}${(x.dateMode ?? 'static') === 'birth_month' ? ' during their birthday month' : x.schedule?.start ? ` from ${dateLabel(x.schedule.start)} to ${x.schedule.end ? dateLabel(x.schedule.end) : 'no end date'}` : ''}.`}
            facts={[['Used', num(x.used)], ['Per customer', x.perCustomer ? `${x.perCustomer}×` : 'unlimited']]}
            status={{on, disabled: locked, label: 'Turn on', note: on ? 'Applies at checkout' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
          side={<div className="op-panel"><BlockStack gap="300"><Text as="h2" variant="headingSm">Customers see</Text>
            <div className="op-store op-dealbar"><span>{design.action || 'Members save'} {disc.type === 'percent' ? `${disc.value}%` : disc.type === 'amount' ? money(disc.value) : ''}</span>{x.countdown && <b>Ends in 2d 04h</b>}<span className="op-store__btn">{design.cta || 'Shop the deal'}</span></div>
          </BlockStack></div>}
          more={<MoreSettings sections={[
            {title: 'Products and limits', children: <>
              <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                <Select label="Applies to" value={x.appliesTo ?? 'all'} onChange={v => d.set('appliesTo', v)} disabled={locked} options={[{label: 'All products', value: 'all'}, {label: 'Specific collections or products', value: 'some'}]} />
                {x.appliesTo === 'some' || x.products ? <TextField label="Collections or products" value={x.products ?? ''} onChange={v => d.set('products', v)} autoComplete="off" disabled={locked} /> : null}
              </InlineGrid>
              <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                <NumberField label="Minimum order" prefix="$" value={x.minOrder ?? 0} onChange={v => d.set('minOrder', v)} disabled={locked} />
                <NumberField label="Uses per customer" value={x.perCustomer ?? ''} onChange={v => d.set('perCustomer', v)} disabled={locked} helpText="Empty = unlimited" />
              </InlineGrid>
            </>},
            {title: 'Design on your store', children: <>
              <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                <TextField label="Badge text" value={design.action ?? ''} onChange={v => d.set('design', {...design, action: v})} autoComplete="off" disabled={locked} />
                <TextField label="Button text" value={design.cta ?? ''} onChange={v => d.set('design', {...design, cta: v})} autoComplete="off" disabled={locked} />
              </InlineGrid>
              <Checkbox label="Show a countdown on your store" checked={Boolean(x.countdown)} onChange={v => d.set('countdown', v)} disabled={locked} />
            </>},
          ]} />}
          danger={isNew ? null : <>
            <Button disabled={locked} onClick={() => dupe(upsert, 'deals', x, 'd', notify, navigate, '/vip/deals')}>Duplicate</Button>
            <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Delete “${x.name}”?`, action: 'Delete', body: 'The deal stops applying at checkout right away.', onConfirm: () => {remove('deals', x.id); notify('Deal deleted'); navigate('/vip/deals');}})}>Delete</Button>
          </>}>
          <Panel title="Deal" description="Deals are time-limited, so a date is required.">
            <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} />
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <Select label="Discount" value={disc.type} onChange={v => d.set('discount', {...disc, type: v})} disabled={locked}
                options={[{label: 'Amount off', value: 'amount'}, {label: 'Percentage off', value: 'percent'}, {label: 'Free shipping', value: 'free_shipping'}, {label: 'Free product', value: 'free_product'}, {label: 'Plant a tree', value: 'impact'}]} />
              {['amount', 'percent'].includes(disc.type) && <NumberField label="Value" value={disc.value} onChange={v => d.set('discount', {...disc, value: v})} disabled={locked} prefix={disc.type === 'amount' ? '$' : undefined} suffix={disc.type === 'percent' ? '%' : undefined} />}
              {disc.type === 'free_product' && <NumberField label="Free items per order" value={x.giftLimit ?? 1} onChange={v => d.set('giftLimit', v)} disabled={locked} />}
            </InlineGrid>
            <EligibilityField label="Who gets it" value={x.eligibility} onChange={v => d.set('eligibility', v)} disabled={locked} />
            <ChoiceList title="When" selected={[x.dateMode ?? 'static']} onChange={v => d.set('dateMode', v[0])} disabled={locked}
              choices={[{label: 'Between two dates', value: 'static'}, {label: "During each member's birthday month", value: 'birth_month'}]} />
            {(x.dateMode ?? 'static') === 'static' && (
              <InlineGrid columns={2} gap="300">
                <TextField label="Starts" type="date" value={x.schedule?.start ?? ''} onChange={v => d.set('schedule', {...x.schedule, start: v})} autoComplete="off" disabled={locked} error={d.errors.schedule} />
                <TextField label="Ends" type="date" value={x.schedule?.end ?? ''} onChange={v => d.set('schedule', {...x.schedule, end: v})} autoComplete="off" disabled={locked} />
              </InlineGrid>
            )}
          </Panel>
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}

/* ---------- Paid membership ---------- */

const SUBSCRIBERS = [
  {id: 's1', name: 'Ava Nguyen', email: 'ava@inbox.example', since: 'Mar 3, 2026', status: 'Active', next: 'Dec 3'},
  {id: 's2', name: 'Dev Patel', email: 'dev@inbox.example', since: 'Jan 12, 2026', status: 'Active', next: 'Dec 12'},
  {id: 's3', name: 'Gia Tran', email: 'gia@inbox.example', since: 'Nov 1, 2026', status: 'Trial', next: 'Nov 15'},
  {id: 's4', name: 'Finn Okafor', email: 'finn@inbox.example', since: 'Jun 20, 2026', status: 'Cancelled', next: '—'},
];

export function PaidList() {
  const {db} = useStore();
  const navigate = useNavigate();
  const items = useScenarioList(db.paidPlans);
  const subs = db.integrations.find(i => i.id === 'subs');
  return (
    <PageFrame title="Paid membership" backUrl="/vip" moreActions={[{content: 'Create plan', url: '/vip/paid/new'}]}>
      <ScreenState>
        {({locked}) => (
          <CPage>
            <SectionNav section="vip" bare />
            <CCols>
              {!subs?.connected && <Banner tone="info" action={{content: 'Connect Joy Subscription', url: '/integrations/subs'}}>Paid membership runs on Joy Subscription. Connect it to change billing.</Banner>}
              {items.length ? (
                <>
                  <CSection title="Plans" add="Plan" onAdd={() => navigate('/vip/paid/new')} locked={locked}>
                    {items.map(x => (
                      <CRow key={x.id} icon={CreditCardIcon} name={x.name} value={`${money(x.price)}/${x.interval}`} url={`/vip/paid/${x.id}`} off={x.status !== 'active'} />
                    ))}
                  </CSection>
                  <CInvite art={MKT_ART.wallet} title="Give members a reason to order every month" action={{content: 'Create a plan', url: '/vip/paid/new'}}>
                    A yearly plan or one for a single product line reaches customers the monthly plan misses. Joy runs the perks, Joy Subscription runs the billing.
                  </CInvite>
                </>
              ) : (
                <div className="pt-card"><div className="op-promo">
                  <img src={MKT_ART.wallet} alt="" />
                  <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">Turn your best customers into members who pay</Text>
                    <Text as="p" tone="subdued">A monthly plan with double points and free shipping brings steady revenue. Joy handles the perks; Joy Subscription handles billing.</Text>
                    <InlineStack gap="200"><Button variant="primary" url="/vip/paid/new">Create plan</Button><Button url="/subscription">About Joy Subscription</Button></InlineStack>
                  </BlockStack>
                </div></div>
              )}
            </CCols>
          </CPage>
        )}
      </ScreenState>
    </PageFrame>
  );
}

export function PaidEditor({id}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const fresh = React.useMemo(() => ({id: null, name: '', status: 'active', price: 9, interval: 'month', trialDays: 0, perks: ['2× points on every order', 'Free shipping'], tierId: '', products: 'Bloom Club membership', frequencies: [{id: 'f1', payment: 'payg', every: 1, unit: 'month', discount: 0, freeShipping: true}], cancel: 'keep_points', bonusPoints: 0, subscribers: 0, widgetFirst: false}), []);
  const record = isNew ? fresh : db.paidPlans.find(x => x.id === realId(id));
  const d = useRecordDraft({record: record ?? fresh, isNew, backUrl: '/vip/paid', prefix: 'pp', save: item => upsert('paidPlans', item), urlFor: nid => `/vip/paid/${nid}`,
    validate: x => ({name: !x.name?.trim() ? 'Name the plan' : null, price: !(Number(x.price) > 0) ? 'Enter a price above $0' : null})});
  if (!record && !isNew) return <Missing title="Paid membership" backUrl="/vip/paid" what="plan" />;
  const x = d.draft;
  const tier = db.tiers.find(t => t.id === x.tierId);
  const freqs = x.frequencies ?? [{id: 'f1', payment: 'payg', every: 1, unit: x.interval, discount: 0, freeShipping: true}];
  return (
    <PageFrame title={isNew ? 'New plan' : x.name} backUrl="/vip/paid" badge={isNew ? undefined : <StatusBadge status={x.status} />}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={CreditCardIcon}
            sentence={`Customers pay ${money(x.price)} per ${x.interval}${x.trialDays ? ` after a ${x.trialDays}-day free trial` : ''} and get ${(x.perks ?? []).join(', ') || 'no perks yet'}${tier ? `. They join ${tier.name} while subscribed` : ''}.`}
            facts={isNew ? [] : [['Subscribers', num(x.subscribers)], ['Monthly revenue', money(x.subscribers * x.price * (x.interval === 'year' ? 1 / 12 : 1))], ['Trials now', '18'], ['Cancelled, 30 days', '6']]}
            status={{on: x.status === 'active', disabled: locked, label: 'Turn on', note: x.status === 'active' ? 'Customers can join' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
          side={<div className="op-paidcard">
            <span className="op-paidcard__name">{x.name || 'Your plan'}</span>
            <span className="op-paidcard__price">{money(x.price)}<small>/{x.interval}</small></span>
            {x.trialDays ? <span className="op-paidcard__trial">{x.trialDays}-day free trial</span> : null}
            <ul>{(x.perks ?? []).filter(Boolean).slice(0, 5).map(p => <li key={p}>{p}</li>)}</ul>
            <span className="op-store__btn">Join</span>
          </div>}
          more={<MoreSettings sections={[
            {title: 'Billing options', description: 'Each option is one way to pay for the plan.', children: (
              <RepeatList items={freqs} onChange={v => d.set('frequencies', v)} disabled={locked} addLabel="Add billing option" min={1} max={4}
                make={() => ({id: newId('f'), payment: 'prepaid', every: 12, unit: 'month', discount: 10, freeShipping: true})}
                render={(f, patch) => (
                  <InlineGrid columns={{xs: 1, sm: 4}} gap="200" alignItems="end">
                    <Select label="Payment" value={f.payment} onChange={v => patch({payment: v})} disabled={locked} options={[{label: 'Pay as you go', value: 'payg'}, {label: 'Prepaid', value: 'prepaid'}]} />
                    <NumberField label="Every" value={f.every} onChange={v => patch({every: v})} disabled={locked} />
                    <Select label="Unit" value={f.unit} onChange={v => patch({unit: v})} disabled={locked} options={['week', 'month', 'year'].map(u => ({label: u[0].toUpperCase() + u.slice(1), value: u}))} />
                    <NumberField label="Discount" suffix="%" value={f.discount} onChange={v => patch({discount: v})} disabled={locked} />
                  </InlineGrid>
                )} />
            )},
            {title: 'Subscription product', children: <TextField label="Subscription product" labelHidden value={x.products ?? ''} onChange={v => d.set('products', v)} autoComplete="off" disabled={locked} helpText="In the app this opens the product picker." />},
            {title: 'Extras while subscribed', children: <>
              <NumberField label={`Monthly bonus ${db.program.point.plural}`} value={x.bonusPoints ?? 0} onChange={v => d.set('bonusPoints', v)} disabled={locked} />
              <Checkbox label="Members-only deals included" checked={x.dealsAccess !== false} onChange={v => d.set('dealsAccess', v)} disabled={locked} />
              <Checkbox label="Show the subscription option before one-time purchase on the product page" checked={Boolean(x.widgetFirst)} onChange={v => d.set('widgetFirst', v)} disabled={locked} />
            </>},
            {title: 'If they cancel', children: (
              <ChoiceList title="On cancel" titleHidden selected={[x.cancel ?? 'keep_points']} onChange={v => d.set('cancel', v[0])} disabled={locked}
                choices={[{label: 'Keep their points, remove the tier', value: 'keep_points'}, {label: 'Keep points and tier until the period ends', value: 'period_end'}]} />
            )},
          ]} />}
          danger={isNew ? null : <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Delete “${x.name}”?`, action: 'Delete plan', body: `${num(x.subscribers)} subscribers lose their perks at the end of their billing period. Billing stops in Joy Subscription.`, onConfirm: () => {remove('paidPlans', x.id); notify('Plan deleted'); navigate('/vip/paid');}})}>Delete plan</Button>}>
          <Panel title="Plan">
            <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} placeholder="Bloom Club" />
            <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
              <NumberField label="Price" prefix="$" value={x.price} onChange={v => d.set('price', v)} disabled={locked} error={d.errors.price} />
              <Select label="Billed every" value={x.interval} onChange={v => d.set('interval', v)} disabled={locked} options={[{label: 'Month', value: 'month'}, {label: 'Year', value: 'year'}]} />
              <NumberField label="Free trial" suffix="days" value={x.trialDays} onChange={v => d.set('trialDays', v)} disabled={locked} />
            </InlineGrid>
          </Panel>
          <Panel title="What subscribers get">
            <RepeatList items={(x.perks ?? []).map((p, i) => ({id: i, name: p}))} onChange={v => d.set('perks', v.map(p => p.name))} disabled={locked} addLabel="Add perk" max={10}
              make={() => ({id: Date.now(), name: ''})} render={(p, patch, i) => <TextField label={`Perk ${i + 1}`} labelHidden value={p.name} onChange={v => patch({name: v})} autoComplete="off" disabled={locked} />} />
            <Select label="Promote to VIP tier while subscribed" value={x.tierId ?? ''} onChange={v => d.set('tierId', v)} disabled={locked} options={[{label: 'No promotion', value: ''}, ...db.tiers.map(t => ({label: t.name, value: t.id}))]} />
          </Panel>
          {!isNew && (
            <Block title="Subscribers">
              <Card padding="0"><SimpleTable columns={[{key: 'name', label: 'Customer'}, {key: 'since', label: 'Since'}, {key: 'status', label: 'Status', render: r => <Badge tone={r.status === 'Active' ? 'success' : r.status === 'Trial' ? 'info' : undefined}>{r.status}</Badge>}, {key: 'next', label: 'Next charge'}]} rows={SUBSCRIBERS} onRow={r => navigate(`/customers/c-${r.name.split(' ')[0].toLowerCase()}`)} /></Card>
            </Block>
          )}
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}

/* ---------- Partner tiers (B2B) ---------- */

export function PartnerList() {
  const {db} = useStore();
  const navigate = useNavigate();
  const items = useScenarioList(db.partnerTiers);
  if (!db.shop.b2b) return <PageFrame title="Partner tiers" backUrl="/vip"><Banner tone="info">Partner tiers need Shopify B2B, which is on Shopify Plus.</Banner></PageFrame>;
  return (
    <PageFrame title="Partner tiers" backUrl="/vip" moreActions={[{content: 'Add partner tier', url: '/vip/partners/new'}]}>
      <ScreenState>
        {({locked}) => (
          <CPage>
            <SectionNav section="vip" bare />
            <CCols>
              <CSection title="Tiers for B2B companies" add="Partner tier" onAdd={() => navigate('/vip/partners/new')} locked={locked}>
                {items.length ? items.map(x => (
                  <CRow key={x.id} icon={StoreIcon} name={x.name} value={`${x.discount}% off`} url={`/vip/partners/${x.id}`} off={x.status !== 'active'} />
                )) : <EmptyCard art="members" heading="No partner tiers yet" action={{content: 'Add partner tier', url: '/vip/partners/new'}}>Better prices for salons and resellers the more they order.</EmptyCard>}
              </CSection>
            </CCols>
          </CPage>
        )}
      </ScreenState>
    </PageFrame>
  );
}

export function PartnerEditor({id}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const fresh = React.useMemo(() => ({id: null, name: '', status: 'active', companies: 0, discount: 15, paymentTerms: 'Net 30', catalog: 'Wholesale catalog', minOrder: 200, threshold: 0, perks: []}), []);
  const record = isNew ? fresh : db.partnerTiers.find(x => x.id === realId(id));
  const d = useRecordDraft({record: record ?? fresh, isNew, backUrl: '/vip/partners', prefix: 'pt', save: item => upsert('partnerTiers', item), urlFor: nid => `/vip/partners/${nid}`,
    validate: x => ({name: !x.name?.trim() ? 'Name the partner tier' : null})});
  if (!record && !isNew) return <Missing title="Partner tier" backUrl="/vip/partners" what="partner tier" />;
  const x = d.draft;
  const companies = db.companies.filter(c => c.partnerTierId === x.id);
  return (
    <PageFrame title={isNew ? 'New partner tier' : x.name} backUrl="/vip/partners" badge={isNew ? undefined : <StatusBadge status={x.status} />}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={StoreIcon} sentence={`${x.name || 'This tier'}: ${x.discount}% off wholesale, pays ${x.paymentTerms}, ${Number(x.minOrder) ? `orders at least ${money(x.minOrder)}` : 'no minimum order'}.`}
            facts={[['Companies', num(companies.length)], ['Reach at', x.threshold ? `${money(x.threshold)} company spend` : 'assigned by you']]}
            status={{on: x.status === 'active', disabled: locked, label: 'Turn on', note: x.status === 'active' ? 'Applies to companies' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
          side={<div className="op-panel"><BlockStack gap="200">
            <Text as="h2" variant="headingSm">Companies in this tier</Text>
            {companies.length ? companies.map(c => <HashLink key={c.id} url={`/customers/companies/${c.id}`} className="op-link">{c.name}</HashLink>) : <Text as="p" tone="subdued">None yet. Assign companies from their profile.</Text>}
          </BlockStack></div>}
          more={<MoreSettings sections={[
            {title: 'Catalog and reach', children: (
              <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                <NumberField label="Reach at (company spend)" prefix="$" value={x.threshold ?? 0} onChange={v => d.set('threshold', v)} disabled={locked} />
                <TextField label="Catalog" value={x.catalog} onChange={v => d.set('catalog', v)} autoComplete="off" disabled={locked} helpText={db.shop.shopifyPlus ? undefined : 'Catalog access needs Shopify Plus'} />
              </InlineGrid>
            )},
            {title: 'Perks', children: (
              <RepeatList items={(x.perks ?? []).map((p, i) => ({id: i, name: p}))} onChange={v => d.set('perks', v.map(p => p.name))} disabled={locked} addLabel="Add perk" max={10}
                make={() => ({id: Date.now(), name: ''})} render={(p, patch, i) => <TextField label={`Perk ${i + 1}`} labelHidden value={p.name} onChange={v => patch({name: v})} autoComplete="off" disabled={locked} placeholder="Free samples with every order" />} />
            )},
          ]} />}
          danger={isNew ? null : <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({title: `Delete ${x.name}?`, action: 'Delete', body: `${companies.length} companies lose this tier's discount and terms.`, onConfirm: () => {remove('partnerTiers', x.id); notify('Partner tier deleted'); navigate('/vip/partners');}})}>Delete</Button>}>
          <Panel title="Partner tier">
            <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} placeholder="Salon partner" />
            <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
              <NumberField label="Wholesale discount" suffix="%" value={x.discount} onChange={v => d.set('discount', v)} disabled={locked} />
              <Select label="Payment terms" value={x.paymentTerms} onChange={v => d.set('paymentTerms', v)} disabled={locked} options={['Due on receipt', 'Net 15', 'Net 30', 'Net 60'].map(v => ({label: v, value: v}))} />
              <NumberField label="Minimum order" prefix="$" value={x.minOrder ?? 0} onChange={v => d.set('minOrder', v)} disabled={locked} />
            </InlineGrid>
          </Panel>
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}
