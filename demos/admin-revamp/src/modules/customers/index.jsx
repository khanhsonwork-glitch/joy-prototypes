import React from 'react';
import {CustomersList} from './list.jsx';
import {CustomerProfile} from './profile.jsx';
import {ReviewQueue} from './review.jsx';
import {ActivityList} from './activity.jsx';
import {CompaniesList, CompanyProfile} from './companies.jsx';
import {Migration, MergeCustomers, ReferralWhitelist} from './tools.jsx';

export function resolve(segments) {
  if (segments[0] !== 'customers') return null;
  if (segments[1] === 'review') return <ReviewQueue />;
  if (segments[1] === 'activity') return <ActivityList />;
  if (segments[1] === 'migration') return <Migration />;
  if (segments[1] === 'merge') return <MergeCustomers />;
  if (segments[1] === 'whitelist') return <ReferralWhitelist />;
  if (segments[1] === 'companies') return segments[2] ? <CompanyProfile id={segments[2]} /> : <CompaniesList />;
  return segments[1] ? <CustomerProfile id={segments[1]} /> : <CustomersList />;
}
