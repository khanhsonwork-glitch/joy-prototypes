import React, {useState} from 'react';
import {BlockStack, Checkbox, InlineGrid, InlineStack, Select, Tabs, Text, TextField} from '@shopify/polaris';
import {useStore} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {Section, NumberField, money, num} from '../../ui/kit.jsx';
import {Question, choices, useVipDraft, useVipState} from './common.jsx';
import './tier-extra.css';

const nav = [
  {content: 'Tiers', url: '/vip/tiers'},
  {content: 'Rules', url: '/vip/tiers/settings'},
  {content: 'Design', url: '/vip/tiers/design'},
  {content: 'Demotion', url: '/vip/tiers/demotion'},
];

export function TierTabs({selected}) {
  const navigate = useNavigate();
  return <Tabs tabs={nav.map(item => ({id: item.url, content: item.content}))} selected={nav.findIndex(item => item.content === selected)} onSelect={index => navigate(nav[index].url)} fitted={false}/>;
}

function ColorField({label, value, onChange, disabled}) {
  return <InlineStack gap="200" blockAlign="end" wrap={false}>
    <div className="rv-vip-color-input"><TextField label={label} value={value || ''} onChange={onChange} autoComplete="off" disabled={disabled}/></div>
    <span className="rv-vip-color-chip" style={{backgroundColor: /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff'}} aria-hidden="true"/>
  </InlineStack>;
}

export function TierDesign() {
  const {db, set: storeSet} = useStore();
  const {locked} = useVipState();
  const [selectedId, setSelectedId] = useState('t-gold');
  const source = {settings: db.tierSettings || {}, tiers: db.tiers || []};
  const form = useVipDraft(source, {onSave: value => {storeSet(['tierSettings'], value.settings); storeSet(['tiers'], value.tiers);}, message: 'Tier design saved', locked});
  const {draft, set} = form;
  const design = draft.settings.design || {};
  const tiers = draft.tiers || [];
  const tier = tiers.find(item => item.id === selectedId) || tiers[0];
  const changeDesign = (key, value) => set('settings', {...draft.settings, design: {...design, [key]: value}});
  const changeTier = (key, value) => set('tiers', tiers.map(item => item.id === tier.id ? {...item, [key]: value} : item));
  const textColor = tier?.textColor || design.textColor || '#101010';
  const background = tier?.cardColor || design.cardBackground || '#ffffff';
  const progressColor = tier?.progressColor || design.progressColor || tier?.color || '#e3b44f';
  const sample = (db.customers || []).find(item => item.tierId === tier?.id);
  const next = [...tiers].sort((a, b) => Number(a.threshold) - Number(b.threshold)).find(item => Number(item.threshold) > Number(tier?.threshold));
  const progress = sample && next ? Math.max(0, Math.min(100, Math.round(100 * (Number(sample.tierProgress) - Number(tier.threshold)) / (Number(next.threshold) - Number(tier.threshold))))) : 100;
  return <PageFrame title="VIP tier design" backUrl="/vip/tiers" width="wide"><BlockStack gap="500">
    <Question detail="Style the tier card customers see in their account. Changes appear in the preview before you save.">How should each tier look on the storefront?</Question>
    <TierTabs selected="Design"/>
    <div className="rv-vip-design-grid">
      <BlockStack gap="400">
        <Section title="Tier card"><BlockStack gap="300">
          <Select label="Tier to design" value={tier?.id || ''} options={tiers.map(item => ({label: item.name, value: item.id}))} onChange={setSelectedId} disabled={locked}/>
          <Select label="Badge style" value={design.badgeStyle || 'rounded'} options={choices([['rounded','Rounded'],['square','Square'],['minimal','Minimal']])} onChange={value => changeDesign('badgeStyle', value)} disabled={locked}/>
          <Select label="Tier icon" value={tier?.icon || 'bronze'} options={choices([['bronze','Bronze'],['silver','Silver'],['gold','Gold'],['black','Black']])} onChange={value => changeTier('icon', value)} disabled={locked}/>
          <ColorField label="Tier colour" value={tier?.color} onChange={value => changeTier('color', value)} disabled={locked}/>
          <ColorField label="Card background" value={background} onChange={value => changeTier('cardColor', value)} disabled={locked}/>
          <ColorField label="Text color" value={textColor} onChange={value => changeTier('textColor', value)} disabled={locked}/>
          <ColorField label="Icon color" value={tier?.iconColor || design.iconColor} onChange={value => changeTier('iconColor', value)} disabled={locked}/>
          <ColorField label="Progress bar color" value={progressColor} onChange={value => changeTier('progressColor', value)} disabled={locked}/>
          <Checkbox label="Show progress bar" checked={Boolean(design.showProgress)} onChange={value => changeDesign('showProgress', value)} disabled={locked}/>
          <Select label="Card footer" value={design.cardFooter || 'background'} options={choices([['background','Use background color'],['plain','Do not use background']])} onChange={value => changeDesign('cardFooter', value)} disabled={locked}/>
          <Select label="Content alignment" value={design.alignment || 'center'} options={choices([['center','Center'],['left','Left'],['right','Right']])} onChange={value => changeDesign('alignment', value)} disabled={locked}/>
          <NumberField label="Card opacity" value={design.opacity ?? 100} onChange={value => changeDesign('opacity', value)} suffix="%" min={0} max={100} disabled={locked}/>
        </BlockStack></Section>
        <Section title="Member balances"><BlockStack gap="300">
          <Select label="Preview for" value={design.view || 'after'} options={choices([['before','Before sign in'],['after','After sign in']])} onChange={value => changeDesign('view', value)} disabled={locked}/>
          <Checkbox label="Display store credit" checked={Boolean(design.showStoreCredit)} onChange={value => changeDesign('showStoreCredit', value)} disabled={locked}/>
          {design.showStoreCredit && <><Select label="Balance layout" value={design.balanceLayout || 'columns'} options={choices([['columns','Columns'],['centered','Centered'],['pill','Pill'],['rows','Rows']])} onChange={value => changeDesign('balanceLayout', value)} disabled={locked}/>
          <Select label="Balance order" value={design.balanceOrder || 'points'} options={choices([['points','Points first'],['credit','Store credit first']])} onChange={value => changeDesign('balanceOrder', value)} disabled={locked}/>
          <Checkbox label="Hide zero store credit" checked={Boolean(design.hideZeroCredit)} onChange={value => changeDesign('hideZeroCredit', value)} disabled={locked}/></>}
          <ColorField label="Button color" value={design.buttonColor} onChange={value => changeDesign('buttonColor', value)} disabled={locked}/>
          <ColorField label="Button text color" value={design.buttonTextColor} onChange={value => changeDesign('buttonTextColor', value)} disabled={locked}/>
          <ColorField label="Box color" value={design.boxColor} onChange={value => changeDesign('boxColor', value)} disabled={locked}/>
          <ColorField label="Box name color" value={design.boxNameColor} onChange={value => changeDesign('boxNameColor', value)} disabled={locked}/>
        </BlockStack></Section>
      </BlockStack>
      <div className="rv-vip-design-preview"><Section title="Storefront preview" description="This sample card updates as you edit.">
        <div className="rv-vip-preview" style={{backgroundColor: background, color: textColor, textAlign: design.alignment || 'center', opacity: Number(design.opacity ?? 100) / 100}}>
          <span className={'rv-vip-preview-badge rv-vip-preview-badge--' + (design.badgeStyle || 'rounded')} style={{backgroundColor: tier?.color || '#e3b44f', color: tier?.iconColor || design.iconColor}}>{tier?.icon === 'gold' ? '✦' : tier?.icon === 'silver' ? '◆' : '●'} {tier?.name || 'Tier'}</span>
          <Text as="p" variant="headingMd">{tier?.name || 'Tier'} member</Text>
          {design.view === 'before' ? <Text as="p">Sign in to see your tier progress.</Text> : <>
            <Text as="p">{Number(tier?.multiplier || 1)}× points on eligible orders</Text>
            {design.showProgress && <div className="rv-vip-preview-track" aria-label="Tier progress"><span style={{width: progress + '%', backgroundColor: progressColor}}/></div>}
            <Text as="p" variant="bodySm">{progress}% toward the next tier</Text>
            <div className={'rv-vip-preview-balances rv-vip-preview-balances--' + (design.balanceLayout || 'columns')} style={{backgroundColor: design.boxColor}}>{(design.balanceOrder === 'credit' ? ['Store credit', 'Points'] : ['Points', 'Store credit']).filter(item => item !== 'Store credit' || (design.showStoreCredit && (!design.hideZeroCredit || Number(sample?.storeCredit) > 0))).map(item => <span key={item} style={{color: design.boxNameColor}}>{item}: {item === 'Points' ? num(sample?.points ?? 0) : money(sample?.storeCredit ?? 0)}</span>)}</div>
          </>}
          <div className="rv-vip-preview-footer" style={{backgroundColor: design.cardFooter === 'plain' ? 'transparent' : tier?.color}}><span className="rv-vip-preview-button" style={{backgroundColor: design.buttonColor, color: design.buttonTextColor}}>View rewards</span></div>
        </div>
      </Section></div>
    </div>
  </BlockStack></PageFrame>;
}

export function TierDemotion() {
  const {db, set: storeSet} = useStore();
  const {locked} = useVipState();
  const source = db.tierSettings || {};
  const form = useVipDraft(source, {onSave: value => storeSet(['tierSettings'], value), message: 'Tier demotion saved', locked});
  const {draft: d, set} = form;
  const updateDemotion = (key, value) => set('demotion', {...(d.demotion || {}), [key]: value});
  const mode = d.demotion?.mode || 'end_of_period';
  const gold = (db.tiers || []).find(item => item.id === 't-gold') || (db.tiers || [])[1];
  const silver = (db.tiers || []).find(item => Number(item.threshold) < Number(gold?.threshold) && Number(item.threshold) > 0);
  const destination = d.demotionAction === 'lowest' ? (db.tiers || [])[0] : silver;
  const date = new Date(Date.UTC(2026, 11, 31));
  date.setUTCDate(date.getUTCDate() + Number(d.demotion?.graceDays ?? 30));
  const dateLabel = date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', timeZone: 'UTC'});
  const preview = mode === 'never' ? `A ${gold?.name || 'Gold'} member keeps their tier even if they spend under ${money(gold?.threshold || 800)} by Dec 31.` : mode === 'inactive' ? `A ${gold?.name || 'Gold'} member with no qualifying activity for ${d.inactiveDays ?? 180} days moves to ${destination?.name || 'Silver'} after ${d.demotion?.graceDays ?? 30} grace days.` : `A ${gold?.name || 'Gold'} member who spends under ${money(gold?.threshold || 800)} by Dec 31 moves to ${destination?.name || 'Silver'} on ${dateLabel}.`;
  return <PageFrame title="VIP tier demotion" backUrl="/vip/tiers" width="wide"><BlockStack gap="500">
    <Question detail="Choose when a member moves down and tell them before their tier changes.">When should customers move down a tier?</Question>
    <TierTabs selected="Demotion"/>
    <InlineGrid columns={{xs: 1, md: '2fr 1fr'}} gap="500"><BlockStack gap="400">
      <Section title="Demotion rule"><BlockStack gap="300">
        <Select label="Demotion mode" value={mode} options={choices([['end_of_period','At the end of the period'],['never','Never'],['inactive','After days without qualifying activity']])} onChange={value => updateDemotion('mode', value)} disabled={locked}/>
        {mode === 'inactive' && <NumberField label="Demote after no qualifying activity for" value={d.inactiveDays ?? 180} onChange={value => set('inactiveDays', value)} suffix="days" min={1} disabled={locked}/>}
        {mode !== 'never' && <><NumberField label="Grace days" value={d.demotion?.graceDays ?? 30} onChange={value => updateDemotion('graceDays', value)} suffix="days" min={0} disabled={locked}/>
          <Select label="Choose the action" value={d.demotionAction || 'previous'} options={choices([['previous','Downgrade to previous tier'],['lowest','Reset to lowest tier']])} onChange={value => set('demotionAction', value)} disabled={locked}/></>}
        <Checkbox label="Keep entry rewards after demotion" checked={Boolean(d.keepEntryRewards)} onChange={value => set('keepEntryRewards', value)} disabled={locked}/>
        <Text as="p" variant="bodySm" tone="subdued">{d.keepEntryRewards ? 'Customers keep rewards already granted when their tier moves down.' : 'Entry rewards from the previous tier no longer remain available after demotion.'}</Text>
        <Checkbox label="Allow giving entry reward again after being downgraded" checked={Boolean(d.entryRewardRepeat)} onChange={value => set('entryRewardRepeat', value)} disabled={locked}/>
      </BlockStack></Section>
      <Section title="Scheduled tier reset"><BlockStack gap="300">
        <Checkbox label="Scheduled tier reset" checked={Boolean(d.scheduledReset)} onChange={value => set('scheduledReset', value)} disabled={locked}/>
        <Text as="p" variant="bodySm" tone="subdued">{d.scheduledReset ? 'At each reset, tier progress starts over and members are assessed against the new period.' : 'Tier progress continues until another demotion rule applies.'}</Text>
        {d.scheduledReset && <><Select label="Reset frequency" value={d.resetFrequency || 'yearly'} options={choices([['monthly','Monthly'],['quarterly','Quarterly'],['halfyear','Half-yearly'],['yearly','Yearly'],['custom','Custom']])} onChange={value => set('resetFrequency', value)} disabled={locked}/>
          {d.resetFrequency === 'custom' && <><NumberField label="Every" value={d.resetEvery ?? 1} onChange={value => set('resetEvery', value)} min={1} disabled={locked}/><Select label="Unit" value={d.resetUnit || 'years'} options={choices([['days','Day(s)'],['months','Month(s)'],['years','Year(s)']])} onChange={value => set('resetUnit', value)} disabled={locked}/><TextField label="Start date" type="date" value={d.resetStartDate || ''} onChange={value => set('resetStartDate', value)} autoComplete="off" disabled={locked}/></>}
          {d.resetFrequency === 'monthly' ? <Select label="Day of month" value={String(d.resetDay || '1')} options={Array.from({length:28}, (_, i) => ({label:String(i+1), value:String(i+1)}))} onChange={value => set('resetDay', value)} disabled={locked}/> : d.resetFrequency !== 'custom' ? <InlineGrid columns={{xs: 1, sm: 2}} gap="300"><Select label="Anchor month" value={String(d.resetMonth || '1')} options={Array.from({length:12}, (_, i) => ({label:new Date(2026,i,1).toLocaleDateString('en-US',{month:'long'}), value:String(i+1)}))} onChange={value => set('resetMonth', value)} disabled={locked}/><Select label="Anchor day of month" value={String(d.resetDay || '1')} options={Array.from({length:28}, (_, i) => ({label:String(i+1), value:String(i+1)}))} onChange={value => set('resetDay', value)} disabled={locked}/></InlineGrid> : null}</>}
      </BlockStack></Section>
      <Section title="Warning email"><BlockStack gap="300">
        <Checkbox label="Notify customer before demotion" checked={Boolean(d.demotionNotify)} onChange={value => set('demotionNotify', value)} disabled={locked}/>
        {d.demotionNotify && <NumberField label="Send warning email before" value={d.warningDays ?? 14} onChange={value => set('warningDays', value)} suffix="days" min={0} disabled={locked}/>}
        <Text as="p" variant="bodySm" tone="subdued">{d.demotionNotify ? `Customers get a warning ${d.warningDays ?? 14} days before their tier changes.` : 'Customers do not get an advance warning.'}</Text>
      </BlockStack></Section>
      <Section title="Tier assessment"><BlockStack gap="300"><Checkbox label="Assess tiers on a cycle" checked={Boolean(d.tierAssessment)} onChange={value => set('tierAssessment', value)} disabled={locked || db.shop?.plan !== 'ultimate'}/><Text as="p" variant="bodySm" tone="subdued">Available on Ultimate.</Text>{d.tierAssessment && <><NumberField label="Assessment cycle" value={d.assessmentCycle ?? 12} onChange={value => set('assessmentCycle', value)} suffix="months" min={1} disabled={locked}/><NumberField label="Assessment offset" value={d.assessmentOffset ?? 0} onChange={value => set('assessmentOffset', value)} suffix="months" min={0} disabled={locked}/></>}</BlockStack></Section>
    </BlockStack><Section title="Member example"><Text as="p">{preview}</Text></Section></InlineGrid>
  </BlockStack></PageFrame>;
}
