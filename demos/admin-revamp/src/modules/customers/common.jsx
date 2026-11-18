import React from 'react';
import {BlockStack, Box, Button, Card, InlineStack, Text} from '@shopify/polaris';
import {useStore} from '../../state/store.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {num, points, dateLabel} from '../../ui/kit.jsx';

export const customerType = value => ({member: 'Member', guest: 'Guest', left: 'Left program', b2b: 'B2B'})[value] ?? value;
export const tierName = (db, id) => db.tiers?.find(t => t.id === id)?.name ?? 'No tier';
export const progressLabel = rule => ({spent: 'Tier amount', points: 'Tier points', orders: 'Tier orders'})[rule] ?? 'Tier progress';
export const dateTime = value => value ? new Date(value).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'}) : '—';
export const today = () => new Date().toISOString().slice(0, 10);
export const stamp = () => new Date().toISOString();
export const customerName = (db, id) => db.customers?.find(c => c.id === id)?.name ?? 'Unknown customer';
export const activityKind = kind => ({earned:'Earned', redeemed:'Redeemed', refunded:'Refunded', expired:'Expired', adjusted:'Adjusted', tier:'VIP tier', referral:'Referral', review:'Review', google_review:'Google review', receipt:'Receipt', form:'Form', impact:'Environmental impact', launch_tier:'Launch tier'})[kind] ?? kind;
export function parseCsv(text) {
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(ch===','&&!quoted){row.push(cell);cell='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
  const headers=(rows.shift()??[]).map(x=>x.trim().toLowerCase());
  return {headers,rows:rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]??'').trim()]))) };
}

export function Question({children}) { return <Text as="p" variant="headingMd">{children}</Text>; }

export function CustomerRows({items, trailing}) {
  const nav = useNavigate();
  const {db} = useStore();
  return <div className="rv-customers-rows">{items.map(c => <div className="rv-customers-row" key={c.id}>
    <div className="rv-customers-person"><Button variant="plain" onClick={() => nav(`/customers/${c.id}`)}>{c.name}</Button><Text as="span" variant="bodySm" tone="subdued">{c.email}</Text></div>
    <div className="rv-customers-rowmeta"><Text as="span" variant="bodySm">{customerType(c.type)} · {tierName(db, c.tierId)}</Text><Text as="span" variant="bodySm" tone="subdued">{points(c.points)} · {dateLabel(c.updated)}</Text></div>
    {trailing?.(c)}
  </div>)}</div>;
}

export function Pager({page, setPage, count, size = 10}) {
  const pages = Math.max(1, Math.ceil(count / size));
  return <div className="rv-customers-pager"><Text as="span" variant="bodySm" tone="subdued">{count ? `${page * size + 1}–${Math.min(count, (page + 1) * size)} of ${num(count)}` : '0 results'}</Text><InlineStack gap="200"><Button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button><Button disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button></InlineStack></div>;
}

export function PlainEmpty({title, children, action}) {
  return <Card><Box padding="500"><BlockStack gap="200" inlineAlign="center"><Text as="h2" variant="headingSm">{title}</Text><Text as="p" tone="subdued">{children}</Text>{action}</BlockStack></Box></Card>;
}
