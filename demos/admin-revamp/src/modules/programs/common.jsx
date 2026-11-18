import React, {useMemo, useState} from 'react';
import {BlockStack, Button, IndexFilters, IndexTable, InlineStack, Modal, Select, Text, TextField, useIndexResourceState} from '@shopify/polaris';
import {EmptyCard, Switch, num, money, pct, points} from '../../ui/kit.jsx';
import {useScenario} from '../../kit/scenario.jsx';

export const rewardText = (reward) => {
  if (!reward) return 'No reward';
  const value = reward.value ?? reward.points;
  if (reward.kind === 'per_money') return `${points(reward.points)} per ${money(reward.per || 1)} spent`;
  if (reward.kind === 'fixed') return points(reward.points);
  if (reward.type === 'points') return points(value);
  if (reward.type === 'amount' || reward.type === 'store_credit') return `${money(value)} ${reward.type === 'store_credit' ? 'store credit' : 'off'}`;
  if (reward.type === 'percent' || reward.type === 'discount') return `${pct(value)} off`;
  if (reward.type === 'product') return String(value);
  if (reward.type === 'free_shipping') return 'Free shipping';
  if (reward.type === 'free_product') return `Free ${value || 'product'}`;
  return String(value ?? reward.type);
};
export const typeOptions = [
  {label:'Points', value:'points'}, {label:'Amount discount', value:'amount'}, {label:'Percentage discount', value:'percent'},
  {label:'Free shipping', value:'free_shipping'}, {label:'Store credit', value:'store_credit'}, {label:'Free product', value:'free_product'},
];
export const rewardInput = (reward, setReward, disabled) => <BlockStack gap="200">
  <Select label="Reward type" options={typeOptions} value={reward?.type || 'points'} disabled={disabled} onChange={type => setReward({...reward, type})}/>
  {!['free_shipping'].includes(reward?.type) && <TextField label="Reward value" type={reward?.type === 'free_product' ? 'text' : 'number'} min={0} value={String(reward?.value ?? '')} autoComplete="off" disabled={disabled} onChange={value => setReward({...reward, value: reward?.type === 'free_product' ? value : Number(value)})}/>}
</BlockStack>;

export function ProgramList({items, kind, onOpen, onToggle, onDelete, onCreate, emptyHeading, locked, columns}) {
  const {state} = useScenario();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(0);
  const [sort, setSort] = useState('newest');
  const shown = useMemo(() => {
    let list = state === 'empty' ? [] : [...items];
    if (tab === 1) list = list.filter(x => x.status === 'active');
    if (tab === 2) list = list.filter(x => x.status !== 'active');
    if (query) list = list.filter(x => `${x.name} ${x.type} ${x.reward?.type || ''}`.toLowerCase().includes(query.toLowerCase()));
    return sort === 'name' ? list.sort((a,b) => a.name.localeCompare(b.name)) : list;
  }, [items, state, tab, query, sort]);
  const tabs = [{content:`All (${items.length})`, id:`${kind}-all`},{content:`Active (${items.filter(x=>x.status==='active').length})`, id:`${kind}-active`},{content:`Other (${items.filter(x=>x.status!=='active').length})`, id:`${kind}-other`}];
  const {selectedResources, allResourcesSelected, handleSelectionChange} = useIndexResourceState(shown);
  return <BlockStack gap="300">
    <IndexFilters tabs={tabs} selected={tab} onSelect={setTab} canCreateNewView={false} filters={[]} appliedFilters={[]}
      queryValue={query} queryPlaceholder={`Search ${kind.toLowerCase()}`} onQueryChange={setQuery} onQueryClear={() => setQuery('')}
      sortOptions={[{label:'Newest', value:'newest', directionLabel:'Newest first'},{label:'Name', value:'name', directionLabel:'A to Z'}]}
      sortSelected={[sort]} onSort={value => setSort(value[0])} mode="default" setMode={() => {}} />
    <div className="rv-programs-list-tools"><TextField label={`Search ${kind.toLowerCase()}`} labelHidden placeholder={`Search ${kind.toLowerCase()}`} value={query} onChange={setQuery} autoComplete="off" clearButton onClearButtonClick={()=>setQuery('')}/><Select label="Sort by" labelInline value={sort} onChange={setSort} options={[{label:'Newest',value:'newest'},{label:'Name',value:'name'}]}/></div>
    {shown.length ? <><div className="rv-programs-desktop-table"><IndexTable resourceName={{singular:kind.toLowerCase(), plural:`${kind.toLowerCase()}s`}} itemCount={shown.length} selectable={false}
      headings={[{title:'Program'}, ...(columns || []), {title:'Status'}, {title:'Actions'}]}>
      {shown.map((item, index) => <IndexTable.Row id={item.id} key={item.id} position={index} onClick={() => onOpen(item)}>
        <IndexTable.Cell><Text as="span" fontWeight="semibold">{item.name}</Text></IndexTable.Cell>
        {(columns || []).map((col, i) => <IndexTable.Cell key={i}>{col.render(item)}</IndexTable.Cell>)}
        <IndexTable.Cell><div onClick={event=>event.stopPropagation()}><Switch label={`Turn ${item.name} on or off`} checked={item.status==='active'} disabled={locked} onChange={() => onToggle(item)}/></div></IndexTable.Cell>
        <IndexTable.Cell><InlineStack gap="100"><Button size="slim" onClick={event => {event.stopPropagation(); onOpen(item);}}>Edit</Button><Button size="slim" tone="critical" disabled={locked} onClick={event => {event.stopPropagation(); onDelete(item);}}>Delete</Button></InlineStack></IndexTable.Cell>
      </IndexTable.Row>)}
    </IndexTable></div><div className="rv-programs-mobile-list">{shown.map(item=><div className="rv-programs-mobile-row" key={item.id}><Button variant="plain" onClick={()=>onOpen(item)}>{item.name}</Button><Text as="p" tone="subdued" variant="bodySm">{(columns||[]).map((col,i)=><span key={i}>{col.title}: {col.render(item)}{i<(columns||[]).length-1?' · ':''}</span>)}</Text><InlineStack align="space-between" blockAlign="center"><Switch label={`Turn ${item.name} on or off`} checked={item.status==='active'} disabled={locked} onChange={()=>onToggle(item)}/><InlineStack gap="100"><Button size="slim" onClick={()=>onOpen(item)}>Edit</Button><Button size="slim" tone="critical" disabled={locked} onClick={()=>onDelete(item)}>Delete</Button></InlineStack></InlineStack></div>)}</div></> : <EmptyCard heading={query ? 'No programs match your search' : emptyHeading} art="rewards" action={locked?null:{content: `Create ${kind.toLowerCase()}`, onAction:onCreate}}>Try another search or create a program to get started.</EmptyCard>}
  </BlockStack>;
}

export function ConfirmDelete({item, onClose, onDelete}) {return <Modal open={Boolean(item)} onClose={onClose} title={`Delete ${item?.name || 'program'}?`} primaryAction={{content:'Delete', destructive:true, onAction:() => {onDelete(item); onClose();}}} secondaryActions={[{content:'Cancel', onAction:onClose}]}><Modal.Section><Text as="p">This removes the program from your sample shop.</Text></Modal.Section></Modal>;}
