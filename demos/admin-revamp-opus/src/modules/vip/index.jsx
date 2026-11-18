// VIP & membership module: home, VIP tiers (ladder, editor, settings), member deals, paid membership, partner tiers.
import React from 'react';
import {TierEditor, TierLadder, TierSettings, VipHome} from './Tiers.jsx';
import {DealEditor, DealList, PaidEditor, PaidList, PartnerEditor, PartnerList} from './Offers.jsx';

export function resolve(segments, query) {
  if (segments[0] !== 'vip') return null;
  const [, sub, id] = segments;
  if (!sub) return <VipHome />;
  if (sub === 'tiers') {
    if (id === 'settings') return <TierSettings query={query} />;
    return id ? <TierEditor key={id} id={id} /> : <TierLadder />;
  }
  if (sub === 'deals') return id ? <DealEditor key={id} id={id} /> : <DealList />;
  if (sub === 'paid') return id ? <PaidEditor key={id} id={id} /> : <PaidList />;
  if (sub === 'partners') return id ? <PartnerEditor key={id} id={id} /> : <PartnerList />;
  return null;
}
