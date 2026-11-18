import React, {useState} from 'react';
import {BlockStack, Button, InlineGrid, InlineStack, Select, Text} from '@shopify/polaris';
import {PageFrame} from '../../ui/page.jsx';
import {EmptyCard, Fact, ScreenState, Section, money, num} from '../../ui/kit.jsx';
import {useStore} from '../../state/store.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {useNavigate} from '../../shell/router.jsx';
import {useScenario} from '../../kit/scenario.jsx';
import {Question} from './common.jsx';

export function CompaniesList(){
  const {db}=useStore();const nav=useNavigate();const {state}=useScenario();
  if(!db.shop?.b2b)return <PageFrame title="Companies" backUrl="/customers"><EmptyCard art="members" heading="Companies are unavailable">Enable B2B for this shop to manage company contacts and partner tiers.</EmptyCard></PageFrame>;
  const companies=state==='empty'?[]:db.companies??[];
  return <PageFrame title="Companies" backUrl="/customers" width="wide"><ScreenState>{()=> <BlockStack gap="500"><Question>Which companies and contacts are in my B2B program?</Question><Section title="Companies" description={`${num(companies.length)} companies in this shop.`} flush>{companies.length?<div className="rv-customers-rows">{companies.map(c=><div className="rv-customers-row" key={c.id}><div className="rv-customers-person"><Button variant="plain" onClick={()=>nav(`/customers/companies/${c.id}`)}>{c.name}</Button><Text as="span" variant="bodySm" tone="subdued">{num(c.contacts)} contacts · {db.partnerTiers?.find(t=>t.id===c.partnerTierId)?.name??'No partner tier'}</Text></div><Text as="span">{num(c.orders)} orders · {money(c.spent)}</Text></div>)}</div>:<EmptyCard art="members" heading="No companies yet">Company accounts appear here when your B2B customers join.</EmptyCard>}</Section></BlockStack>}</ScreenState></PageFrame>;
}

export function CompanyProfile({id}){
  const {db,upsert}=useStore();const {notify}=useShell();const {state}=useScenario();
  const company=db.companies?.find(c=>c.id===id);
  if(!db.shop?.b2b||!company)return <PageFrame title="Company" backUrl="/customers/companies"><EmptyCard art="members" heading="Company not found">Choose a company from the list.</EmptyCard></PageFrame>;
  const contacts=(state==='empty'?[]:db.customers).filter(c=>c.companyId===id);
  return <PageFrame title={company.name} backUrl="/customers/companies"><ScreenState>{({locked})=><BlockStack gap="500"><Question>Who belongs to {company.name}, and what partner benefits apply?</Question><InlineGrid columns={{xs:1,md:'2fr 1fr'}} gap="500"><Section title="Contacts"><BlockStack gap="200">{contacts.length?contacts.map(c=><Button key={c.id} variant="plain" url={`/customers/${c.id}`}>{c.name} · {c.email}</Button>):<Text as="p" tone="subdued">{num(company.contacts)} contacts are linked to this company in Shopify.</Text>}</BlockStack></Section><BlockStack gap="500"><Section title="Partner tier"><Select label="Partner tier" labelHidden value={company.partnerTierId??''} disabled={locked} options={[{label:'No partner tier',value:''},...(db.partnerTiers??[]).map(t=>({label:t.name,value:t.id}))]} onChange={value=>{upsert('companies',{...company,partnerTierId:value});notify('Partner tier saved')}} /></Section><Section title="Orders"><BlockStack gap="200"><Fact label="Orders">{num(company.orders)}</Fact><Fact label="Amount spent">{money(company.spent)}</Fact></BlockStack></Section></BlockStack></InlineGrid></BlockStack>}</ScreenState></PageFrame>;
}
