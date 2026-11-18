import React from 'react';
import {Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Text} from '@shopify/polaris';
import {PHOTOS} from '../../assets/index.js';
import {useShell} from '../../shell/ShellContext.jsx';
import {useStore} from '../../state/store.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {ScreenState, Section} from '../../ui/kit.jsx';

const PAGES={
  wishlist:{name:'Joy Wishlist',kind:'wishlist',image:PHOTOS.heroDesktop,question:'Give customers a reason to come back for the products they love.',intro:'A wishlist makes it easy to save favorites and return when the moment is right.',benefits:[['Save favorites','Shoppers can keep the products they want in one place.'],['Bring shoppers back','Remind customers about saved products when they are ready to buy.'],['Grow loyalty together','Reward wishlist adds with points and turn intent into repeat visits.']],connection:'Customers can earn Joy Loyalty points when they add a product to their wishlist.'},
  subscription:{name:'Joy Subscription',kind:'subs',image:PHOTOS.giftSet,question:'Make repeat orders easy for customers and valuable for your program.',intro:'Subscriptions help customers get the products they love on a schedule.',benefits:[['Simple recurring orders','Customers choose a schedule that suits their routine.'],['A reason to stay','Give subscribers a dependable experience with every order.'],['Reward each delivery','Earn loyalty points on subscription orders to encourage long-term relationships.']],connection:'Customers can earn Joy Loyalty points for every subscription order.'},
};

function Intro({type}) {
  const {db}=useStore();
  const {notify}=useShell();
  const data=PAGES[type];
  const installed=Boolean((db.integrations||[]).find(x=>x.id===data.kind)?.connected);
  const action=()=>notify(installed?`Opens ${data.name} in Shopify admin`:'Opens the Shopify App Store');
  return <PageFrame title={type==='wishlist'?'Wishlist':'Subscription'} width="wide" primaryAction={{content:installed?`Open ${data.name}`:`Install ${data.name}`,onAction:action}}><ScreenState>{({locked})=><BlockStack gap="600">
    <div className="rv-crossapp-hero"><img src={data.image} alt="Pomelo Park skincare products"/><div className="rv-crossapp-hero__copy"><BlockStack gap="300"><Badge>{installed?'Installed':'Made for Joy Loyalty'}</Badge><Text as="h1" variant="headingXl">{data.question}</Text><Text as="p" tone="subdued">{data.intro}</Text><div><Button variant="primary" onClick={action} disabled={locked}>{installed?`Open ${data.name}`:`Install ${data.name}`}</Button></div></BlockStack></div></div>
    <Section title={`Why ${data.name}?`}><InlineGrid columns={{xs:1,sm:3}} gap="500">{data.benefits.map(([title,detail])=><div key={title} className="rv-crossapp-benefit"><Text as="h2" variant="headingSm">{title}</Text><Text as="p" tone="subdued">{detail}</Text></div>)}</InlineGrid></Section>
    <Section title="Works with your loyalty program"><InlineStack gap="300" blockAlign="center"><Text as="p">{data.connection}</Text><Button variant="plain" url="/programs/point">Explore earning rules</Button></InlineStack></Section>
  </BlockStack>}</ScreenState></PageFrame>;
}
export function resolve(segments){return PAGES[segments[0]]?<Intro type={segments[0]}/>:null;}
