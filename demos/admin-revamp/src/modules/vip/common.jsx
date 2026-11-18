import React, {useCallback, useRef, useState} from 'react';
import {Banner, BlockStack, Box, Button, Card, Checkbox, InlineGrid, InlineStack, Modal, Select, Text, TextField} from '@shopify/polaris';
import {useScenario} from '../../kit/scenario.jsx';
import {useStore} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useDraft} from '../../ui/SaveBar.jsx';
import {Section, StatusBadge, Switch, num, money, points, pct} from '../../ui/kit.jsx';

export const choices = pairs => pairs.map(([value, label]) => ({value, label}));
export const rewardTypes = choices([['none', 'None'], ['points', 'Bonus points'], ['discount', 'Discount percentage'], ['amount', 'Discount amount'], ['shipping', 'Free shipping'], ['product', 'Free product'], ['credit', 'Store credit']]);
export const amount = (value, rule) => rule === 'spent' ? money(value) : rule === 'points' ? points(value) : num(value) + ' orders';
export const periodText = period => ({rolling12: '12 months', calendar: 'calendar year', lifetime: 'lifetime'})[period] || '12 months';
export const rewardText = reward => {
  if (!reward || reward.type === 'none') return 'No entry reward';
  if (reward.type === 'points') return points(reward.value);
  if (reward.type === 'discount') return pct(reward.value) + ' off';
  if (reward.type === 'amount') return money(reward.value) + ' off';
  if (reward.type === 'shipping') return 'Free shipping';
  if (reward.type === 'credit') return money(reward.value) + ' store credit';
  return 'Free ' + (reward.value || 'product');
};
export const useVipState = () => {
  const {state} = useScenario();
  return {empty: state === 'empty', overflow: state === 'overflow' || state === 'worst', locked: state === 'disabled'};
};

// Keep SaveBar callbacks stable while letting each screen's latest save logic read current store data.
export function useVipDraft(source, options) {
  const callbacks = useRef(options);
  callbacks.current = options;
  const save = useCallback(d => callbacks.current.onSave?.(d), []);
  const validate = useCallback(d => callbacks.current.validate?.(d), []);
  return useDraft(source, {...options, onSave: save, validate});
}

export function Question({children, detail}) {
  const {state} = useScenario();
  return <BlockStack gap="100"><Text as="h1" variant="headingMd">{children}</Text>{detail && <Text as="p" tone="subdued">{detail}</Text>}{state==='disabled' && <Banner tone="warning" title="Editing needs the Advanced plan"><p>You can review this program, but save and status controls are unavailable until you upgrade.</p></Banner>}</BlockStack>;
}
export function Summary({children}) {
  return <Section title="Customers see"><Text as="p">{children}</Text></Section>;
}
export function Rail({status, onStatus, summary, who, schedule, limits, locked, children}) {
  return <BlockStack gap="400">
    <Section title="Status"><InlineStack align="space-between" blockAlign="center"><StatusBadge status={status}/><Switch checked={status === 'active'} onChange={onStatus} label="Active" disabled={locked}/></InlineStack></Section>
    <Summary>{summary}</Summary>
    {who && <Section title="Who can get it">{typeof who === 'string' ? <Text as="p">{who}</Text> : who}</Section>}
    {schedule && <Section title="Schedule">{typeof schedule === 'string' ? <Text as="p">{schedule}</Text> : schedule}</Section>}
    {limits && <Section title="Limits">{typeof limits === 'string' ? <Text as="p">{limits}</Text> : limits}</Section>}
    {children}
  </BlockStack>;
}
export function EditorGrid({main, rail}) {
  return <InlineGrid columns={{xs: 1, md: '2fr 1fr'}} gap="500"><BlockStack gap="400">{main}</BlockStack>{rail}</InlineGrid>;
}
export function Row({title, detail, meta, status, checked, onToggle, onOpen, actions, locked, index}) {
  return <div className="rv-vip-row" data-row={index}>
    <div className="rv-vip-row__main">
      <Button variant="plain" textAlign="left" fullWidth onClick={onOpen}><span className="rv-vip-row__title"><Text as="span" fontWeight="semibold">{title}</Text><Text as="span" variant="bodySm" tone="subdued">{detail}</Text></span></Button>
      {meta && <Text as="span" variant="bodySm">{meta}</Text>}
    </div>
    <InlineStack gap="200" blockAlign="center" wrap={false}>
      {status && <StatusBadge status={status}/>}
      {onToggle && <Switch checked={checked} onChange={onToggle} label={'Toggle ' + title} disabled={locked}/>}
      {actions}
    </InlineStack>
  </div>;
}

export function Picker({open, onClose, title, options, onPick}) {
  const [search, setSearch] = useState('');
  const filtered = options.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));
  return <Modal open={open} onClose={onClose} title={title} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
    <Modal.Section><BlockStack gap="300">
      <TextField label="Search types" labelHidden placeholder="Search types" autoComplete="off" value={search} onChange={setSearch}/>
      {filtered.map(item => <Button key={item.value} textAlign="left" fullWidth disabled={item.locked} onClick={() => {onPick(item.value); onClose();}}>
        {item.label}{item.locked ? ' · Upgrade to ' + (item.plan || 'Ultimate') : ''}
      </Button>)}
      {!filtered.length && <Text as="p" tone="subdued">No types match your search.</Text>}
    </BlockStack></Modal.Section>
  </Modal>;
}
export function FormLine({children}) {return <Box paddingBlockEnd="300">{children}</Box>;}
export function NotFound({label, back}) {return <Section title={label + ' not found'}><Button url={back}>Back to list</Button></Section>;}
export function DeleteButton({label, onClick, disabled}) {return <Section title="Delete"><Button tone="critical" variant="plain" onClick={onClick} disabled={disabled}>Delete {label}</Button></Section>;}
export function ListSection({title, description, children}) {return <Section title={title} description={description} flush>{children}</Section>;}
