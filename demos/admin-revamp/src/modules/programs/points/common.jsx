import React from 'react';
import {TextField, Select, Checkbox} from '@shopify/polaris';
import {money, num, pct, points} from '../../../ui/kit.jsx';
export const ROOT='/programs/points';
export const opts=pairs=>pairs.map(([value,label])=>({value,label}));
export const earnReward=i=>i.reward?.kind==='per_money'?`${points(i.reward.points)} per ${money(i.reward.per||1)}`:i.reward?.kind==='per_item'?`${points(i.reward.points)} per item`:points(i.reward?.points||0);
export const rewardValue=i=>({amount:`${money(i.value)} off`,percent:`${pct(i.value)} off`,free_shipping:`Shipping up to ${money(i.maxShipping)}`,free_product:i.product||'A free product',bxgy:`Buy ${num(i.buy)}, get ${num(i.get)}`,store_credit:`${money(i.value)} store credit`,impact:`${num(i.value)} ${Number(i.value)===1?'tree':'trees'}`,gift_card:`${money(i.value)} gift card`})[i.type]||'';
export const expirySentence=e=>e.mode==='never'?'Points never expire.':e.mode==='fixed'?`Points expire every year on ${e.fixedDate||'December 31'}. Reminder: ${num(e.remindDays)} days before.`:`Points expire after ${num(e.months)} months without activity. Reminder: ${num(e.remindDays)} days before.`;
export function Field({label,value,onChange,disabled,type='text',error,helpText,prefix,suffix}){return <TextField label={label} value={value==null?'':String(value)} onChange={v=>onChange(type==='number'?(v===''?'':Number(v)):v)} type={type} autoComplete="off" disabled={disabled} error={error} helpText={helpText} prefix={prefix} suffix={suffix}/>}
export function Pick({label,value,onChange,options,disabled}){return <Select label={label} value={value||options[0]?.value} onChange={onChange} options={options} disabled={disabled}/>}
export function Check({label,checked,onChange,disabled}){return <Checkbox label={label} checked={Boolean(checked)} onChange={onChange} disabled={disabled}/>}
