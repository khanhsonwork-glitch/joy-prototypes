import React from 'react';
import {VipHome} from './Home.jsx';
import {TiersHome, TierEditor, TierSettings} from './Tiers.jsx';
import {TierDesign, TierDemotion} from './TierExtra.jsx';
import {DealsList, DealEditor} from './Deals.jsx';
import {PaidList, PaidEditor} from './Paid.jsx';
import {PartnersList, PartnerEditor} from './Partners.jsx';
import {PageFrame} from '../../ui/page.jsx';
import {ScreenState} from '../../ui/kit.jsx';
import {useScenario} from '../../kit/scenario.jsx';

function VipState({children}) {
  const {state} = useScenario();
  if (state==='loading' || state==='error') return <PageFrame title="VIP & membership" backUrl="/vip"><ScreenState>{children}</ScreenState></PageFrame>;
  return children;
}

export function resolve(segments, query) {
  if (segments[0] !== 'vip') return null;
  if (!segments[1]) return <VipState><VipHome/></VipState>;
  if (segments[1] === 'tiers') {
    if (segments[2] === 'settings') return <VipState><TierSettings/></VipState>;
    if (segments[2] === 'design') return <VipState><TierDesign/></VipState>;
    if (segments[2] === 'demotion') return <VipState><TierDemotion/></VipState>;
    return <VipState>{segments[2] ? <TierEditor id={segments[2]}/> : <TiersHome/>}</VipState>;
  }
  if (segments[1] === 'deals') return <VipState>{segments[2] ? <DealEditor id={segments[2]} query={query}/> : <DealsList/>}</VipState>;
  if (segments[1] === 'paid') return <VipState>{segments[2] ? <PaidEditor id={segments[2]} query={query}/> : <PaidList/>}</VipState>;
  if (segments[1] === 'partners') return <VipState>{segments[2] ? <PartnerEditor id={segments[2]}/> : <PartnersList/>}</VipState>;
  return <VipState><VipHome/></VipState>;
}
