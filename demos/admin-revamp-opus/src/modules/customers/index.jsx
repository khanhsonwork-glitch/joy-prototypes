// Customers module: list, profile, To review, Activity, Companies, migration, merge, whitelist, import history.
import React from 'react';
import {CustomerList} from './CustomerList.jsx';
import {Profile} from './Profile.jsx';
import {ActivityLog, Companies, CompanyProfile, Imports, Merge, Migration, ReviewQueue, Whitelist} from './Work.jsx';

export function resolve(segments) {
  if (segments[0] !== 'customers') return null;
  const [, sub, id] = segments;
  if (!sub) return <CustomerList />;
  if (sub === 'review') return <ReviewQueue />;
  if (sub === 'activity') return <ActivityLog />;
  if (sub === 'companies') return id ? <CompanyProfile id={id} /> : <Companies />;
  if (sub === 'migration') return <Migration />;
  if (sub === 'merge') return <Merge />;
  if (sub === 'whitelist') return <Whitelist />;
  if (sub === 'imports') return <Imports />;
  return <Profile key={sub} id={sub} />;
}
