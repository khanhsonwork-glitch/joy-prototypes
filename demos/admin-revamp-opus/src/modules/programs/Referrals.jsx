// Referrals: one program per shop, so one page. Both rewards sit side by side (the friend's offer first, because
// it is what makes a friend click), with the share card customers send previewed live.
import React from 'react';
import {BlockStack, Checkbox, ChoiceList, InlineGrid, Select, Text, TextField} from '@shopify/polaris';
import {SectionNav} from '../../ui/sectionNav.jsx';
import {CPage} from '../../ui/clean.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {NumberField, ScreenState, StatusBadge, money, num, pct, usePlan} from '../../ui/kit.jsx';
import {EditorHero, EditorShell, FormCard, Hint, MoreSettings, Panel} from '../../ui/parts.jsx';
import {ShareIcon} from '@shopify/polaris-icons';
import {RepeatList} from '../../ui/editor.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {useStore, newId} from '../../state/store.jsx';
import {HashLink} from '../../shell/router.jsx';
import {PHOTOS} from '../../assets/index.js';
import {referralGives} from '../../lib/allPrograms.js';
import {pts} from '../../lib/econ.js';

const SIDE_TYPES = {
  referrer: [['points', 'Points'], ['amount', 'Amount off coupon'], ['percent', 'Percentage off coupon'], ['store_credit', 'Store credit'], ['points_pct', 'Points as % of the friend\'s order'], ['credit_pct', 'Store credit as % of the friend\'s order']],
  friend: [['amount', 'Amount off coupon'], ['percent', 'Percentage off coupon'], ['store_credit', 'Store credit']],
};

function SideReward({title, side, value, onChange, locked}) {
  const {db} = useStore();
  const set = patch => onChange({...value, ...patch});
  const isPct = ['percent', 'points_pct', 'credit_pct'].includes(value.type);
  return (
    <BlockStack gap="300">
      <Text as="h3" variant="headingSm">{title}</Text>
      <Select label="Reward" value={value.type} disabled={locked} options={SIDE_TYPES[side].map(([v, l]) => ({value: v, label: l}))} onChange={type => set({type})} />
      <NumberField label="Value" value={value.value} onChange={v => set({value: v})} disabled={locked}
        prefix={['amount', 'store_credit'].includes(value.type) ? '$' : undefined} suffix={isPct ? '%' : value.type === 'points' ? db.program.point.plural : undefined} />
      {side === 'referrer' && (
        <Select label="Referrer gets it" value={value.after ?? 'first_order'} disabled={locked} onChange={after => set({after})}
          options={[{label: "After the friend's first order is paid", value: 'first_order'}, {label: 'As soon as the friend signs up', value: 'sign_up'}]} />
      )}
    </BlockStack>
  );
}

function RewardDetails({x, d, locked}) {
  const {db} = useStore();
  const f = x.friend; const r = x.referrer;
  const setF = patch => d.set('friend', {...f, ...patch});
  const setR = patch => d.set('referrer', {...r, ...patch});
  return <>
    <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
      <NumberField label="Friend's minimum order" prefix="$" value={f.minOrder ?? 0} onChange={v => setF({minOrder: v})} disabled={locked} />
      <NumberField label="Friend's coupon expires after" suffix="days" value={f.expiresDays ?? ''} onChange={v => setF({expiresDays: v})} disabled={locked} />
      {f.type === 'percent' && <NumberField label="Friend's maximum discount" prefix="$" value={f.maxDiscount ?? ''} onChange={v => setF({maxDiscount: v})} disabled={locked} helpText="Empty = no cap" />}
      {r.type === 'percent' && <NumberField label="Referrer's maximum discount" prefix="$" value={r.maxDiscount ?? ''} onChange={v => setR({maxDiscount: v})} disabled={locked} helpText="Empty = no cap" />}
    </InlineGrid>
    <Checkbox label="Give the referrer a bonus when they claim their reward" checked={Boolean(r.claimBonus)} onChange={v => setR({claimBonus: v})} disabled={locked} />
    {r.claimBonus && <NumberField label="Claim bonus" value={r.claimPoints ?? 50} onChange={v => setR({claimPoints: v})} suffix={db.program.point.plural} disabled={locked} />}
  </>;
}

export function Referrals() {
  const {db, set} = useStore();
  const {allows} = usePlan();
  const ref = db.referral;
  const d = useDraft(ref, {
    message: 'Referral program saved', onSave: v => set(['referral'], v),
    validate: v => ({name: !v.name?.trim() ? 'Give the program a name' : null, redirectUrl: v.redirectUrl && !v.redirectUrl.startsWith('/') && !/^https:\/\//.test(v.redirectUrl) ? 'Use a page on your store (/pages/…) or a full https:// address' : null}),
  });
  const x = d.draft;
  const on = x.status === 'active';

  const af = x.antiFraud ?? {};
  return (
    <PageFrame title="Referrals" backUrl="/programs" badge={<StatusBadge status={on ? 'active' : 'inactive'} />}>
      <ScreenState>{({locked}) => (
        <CPage>
        <SectionNav section="programs" bare />
        <EditorShell
          hero={<EditorHero icon={ShareIcon}
            sentence={`${referralGives(x, db)}${x.referrer.after === 'sign_up' ? ' as soon as the friend signs up' : " after the friend's first order"}.`}
            nudge={!af.blockSameIp && !af.blockSameAddress ? 'No cheating checks are on, so one person can refer themselves with a second email. Turn one on in More settings.' : null}
            status={{on, disabled: locked, label: 'Turn on', note: on ? 'Customers can refer' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
          side={<div className="op-share-card">
            <img src={PHOTOS.referral} alt="North Bloom products on a bathroom shelf" />
            <div className="op-share-card__body">
              <Text as="p" variant="bodySm" tone="subdued">Ava sent you a gift</Text>
              <Text as="p" variant="headingMd">{x.friend.type === 'percent' ? `${x.friend.value}% off` : x.friend.type === 'store_credit' ? `${money(x.friend.value)} credit` : `${money(x.friend.value)} off`} your first order</Text>
              <Text as="p" variant="bodySm" tone="subdued">{x.friend.minOrder ? `On orders over ${money(x.friend.minOrder)}. ` : ''}{x.linkPrefix}ava10</Text>
            </div>
          </div>}
          more={<MoreSettings sections={[
            {title: 'Reward details', children: <RewardDetails x={x} d={d} locked={locked} />},
            {title: 'Different rewards per country', description: 'Use when you sell in several currencies.', children: <>
              <Checkbox label="Set rewards per country" checked={Boolean(x.regionsOn)} onChange={v => d.set('regionsOn', v)} disabled={locked} />
              {x.regionsOn ? (
                <RepeatList items={x.regions ?? []} onChange={v => d.set('regions', v)} disabled={locked} addLabel="Add region"
                  make={() => ({id: newId('reg'), country: 'Canada', currency: 'CAD', friend: 15, referrer: 600})}
                  render={(r, patch) => (
                    <InlineGrid columns={{xs: 1, sm: 4}} gap="200">
                      <TextField label="Country" value={r.country} onChange={v => patch({country: v})} autoComplete="off" disabled={locked} />
                      <Select label="Currency" value={r.currency} onChange={v => patch({currency: v})} disabled={locked} options={['CAD', 'EUR', 'GBP', 'AUD', 'JPY'].map(c => ({label: c, value: c}))} />
                      <NumberField label="Friend gets" value={r.friend} onChange={v => patch({friend: v})} disabled={locked} />
                      <NumberField label="Referrer gets" value={r.referrer} onChange={v => patch({referrer: v})} disabled={locked} />
                    </InlineGrid>
                  )} />
              ) : <Text as="p" variant="bodySm" tone="subdued">Everyone gets the rewards above, converted to their currency at checkout.</Text>}
            </>},
            {title: 'Who can refer and where friends land', children: <>
              <Checkbox label="Limit how many friends one customer can refer" checked={Boolean(x.maxPerCustomer?.on)} onChange={v => d.set('maxPerCustomer', {...x.maxPerCustomer, on: v})} disabled={locked} />
              {x.maxPerCustomer?.on && <NumberField label="Friends per customer" value={x.maxPerCustomer.times} onChange={v => d.set('maxPerCustomer', {...x.maxPerCustomer, times: v})} disabled={locked} />}
              <Checkbox label="Only customers with certain tags can refer" checked={Boolean(x.tagAccess?.on)} onChange={v => d.set('tagAccess', {...(x.tagAccess ?? {}), on: v})} disabled={locked} />
              {x.tagAccess?.on && <TextField label="Customer tags" value={x.tagAccess.tags ?? ''} onChange={v => d.set('tagAccess', {...x.tagAccess, tags: v})} autoComplete="off" placeholder="ambassador, vip" disabled={locked} />}
              <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
                <TextField label="Friends land on" value={x.redirectUrl} onChange={v => d.set('redirectUrl', v)} autoComplete="off" disabled={locked} error={d.errors.redirectUrl} helpText="/ is your home page" />
                <TextField label="Link looks like" value={x.linkPrefix} onChange={v => d.set('linkPrefix', v)} autoComplete="off" disabled={locked} helpText={`${x.linkPrefix}ava10`} />
              </InlineGrid>
              {!allows('advanced') && <Text as="p" variant="bodySm" tone="subdued">Per-tier referral limits need the Advanced plan.</Text>}
            </>},
            {title: 'How customers share', children: <>
              <ChoiceList title="Sharing" titleHidden disabled={locked} selected={[x.flow ?? 'manual']} onChange={v => d.set('flow', v[0])}
                choices={[
                  {label: 'Customers copy their link and share it themselves', value: 'manual'},
                  {label: 'Also send each new member their link by email', value: 'auto', renderChildren: sel => sel && (
                    <Select label="Send with" value={x.flowTool ?? 'joy'} onChange={v => d.set('flowTool', v)} disabled={locked}
                      options={[{label: 'Joy email', value: 'joy'}, {label: 'Shopify Flow', value: 'flow'}, {label: 'Klaviyo', value: 'klaviyo'}]} />
                  )},
                ]} />
              <ChoiceList allowMultiple title="Share buttons on the widget" disabled={locked} selected={x.channels ?? ['facebook', 'x', 'whatsapp', 'email']} onChange={v => d.set('channels', v)}
                choices={[{label: 'Facebook', value: 'facebook'}, {label: 'X (Twitter)', value: 'x'}, {label: 'WhatsApp', value: 'whatsapp'}, {label: 'Email', value: 'email'}, {label: 'SMS', value: 'sms'}]} />
              <TextField label="Share message" value={x.shareMessage ?? 'Here’s a gift for your first North Bloom order'} onChange={v => d.set('shareMessage', v)} autoComplete="off" disabled={locked} multiline={2} />
            </>},
            {title: 'Stop cheating', description: 'Joy checks every referral before the referrer is rewarded.', children: <>
              <Checkbox label="Block friends who use the same IP address as the referrer" checked={Boolean(af.blockSameIp)} onChange={v => d.set('antiFraud', {...af, blockSameIp: v})} disabled={locked} />
              <Checkbox label="Block friends who ship to the referrer's address" checked={Boolean(af.blockSameAddress)} onChange={v => d.set('antiFraud', {...af, blockSameAddress: v})} disabled={locked} />
              <Checkbox label="Only new customers count as friends" checked={Boolean(af.requireNewCustomer)} onChange={v => d.set('antiFraud', {...af, requireNewCustomer: v})} disabled={locked} />
              <Checkbox label="Take the reward back if the friend's order is refunded" checked={Boolean(af.autoRevoke)} onChange={v => d.set('antiFraud', {...af, autoRevoke: v})} disabled={locked} />
              <Text as="p" variant="bodySm" tone="subdued">Customers you trust can skip these checks: <HashLink url="/customers/whitelist" className="op-link">referral whitelist</HashLink>.</Text>
            </>},
            {title: 'Email', children: <>
              <Text as="p" variant="bodySm" tone="subdued">Referrers get an email when a friend uses their link.</Text>
              <HashLink url="/settings/notifications/n-ref" className="op-link">Edit the referral email</HashLink>
            </>},
          ]} />}>
          <Panel title="Rewards">
            <TextField label="Name" value={x.name} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} helpText="Customers see this on the referral tab of the widget." />
            <InlineGrid columns={{xs: 1, sm: 2}} gap="500" alignItems="start">
              <SideReward side="friend" title="The friend gets" value={x.friend} onChange={v => d.set('friend', v)} locked={locked} />
              <SideReward side="referrer" title="The referrer gets" value={x.referrer} onChange={v => d.set('referrer', v)} locked={locked} />
            </InlineGrid>
          </Panel>
        </EditorShell>
        </CPage>
      )}</ScreenState>
    </PageFrame>
  );
}
