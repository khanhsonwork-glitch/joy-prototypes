// Which shop the reviewer is looking at (new install, existing shop on the old version, after a downgrade) and its plan.
// Both travel in the hash query (?shop=old&plan=essential) so a copied link opens the same case.
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

export const SHOPS = [
  {value: 'new', label: 'New shop', help: 'Installed after this change: latest Place order and Birthday from day one'},
  {value: 'old', label: 'Existing shop', help: 'Still on the old Place order and Birthday: banner, preview, switch'},
  {value: 'downgraded', label: 'After downgrade', help: 'Was on Advanced with 3 Place order programs and Birthday gifts per VIP tier'},
];
export const PLANS = [
  {value: 'starter', label: 'Starter'},
  {value: 'essential', label: 'Essential'},
  {value: 'advanced', label: 'Advanced'},
];
const RANK = {starter: 0, essential: 1, advanced: 2};
export const planLabel = (plan) => PLANS.find((p) => p.value === plan).label;
/** true when the shop's plan includes `need` ('essential' | 'advanced'). */
export const hasPlan = (plan, need) => RANK[plan] >= RANK[need];

// Sample programs. Converted = made from the old Place order rules when the shop switched (they keep running on any plan).
const OLD_RULES = [
  {id: 'r1', title: 'Spend $1, earn 1 point', summary: 'Earn 1 point for every $1 spent'},
  {id: 'r2', title: 'Skincare sets earn double', summary: 'Earn 2 points for every $1 spent on Skincare sets'},
  {id: 'r3', title: 'Big orders bonus', summary: 'Earn 300 points on orders from $200'},
];
const PROGRAMS = {
  new: [
    {id: 'po1', event: 'place_order', title: 'Place an order', summary: 'Earn 1 point for every $1 spent', on: true, priority: 1},
    {id: 'su', event: 'sign_up', title: 'Sign up', summary: 'Earn 200 points', on: true},
    {id: 'bd', event: 'birthday', title: 'Celebrate a birthday', summary: 'Earn 100 points, 10% off and a free gift', on: true},
    {id: 'wr', event: 'review', title: 'Write a review', summary: 'Earn 50 points', on: false},
  ],
  old: [
    {id: 'po-old', event: 'place_order', title: 'One-time purchase', summary: '3 rules · Earn 1 point for every $1 spent', on: true},
    {id: 'su', event: 'sign_up', title: 'Sign up', summary: 'Earn 200 points', on: true},
    {id: 'bd', event: 'birthday', title: 'Celebrate a birthday', summary: 'Earn 50 points', on: true},
    {id: 'wr', event: 'review', title: 'Write a review', summary: 'Earn 50 points', on: false},
  ],
  switched: [
    ...OLD_RULES.map((r, i) => ({id: r.id, event: 'place_order', title: r.title, summary: r.summary, on: true, priority: i + 1, converted: true})),
    {id: 'su', event: 'sign_up', title: 'Sign up', summary: 'Earn 200 points', on: true},
    {id: 'bd', event: 'birthday', title: 'Celebrate a birthday', summary: 'Earn 50 points', on: true},
    {id: 'wr', event: 'review', title: 'Write a review', summary: 'Earn 50 points', on: false},
  ],
  downgraded: [
    {id: 'po1', event: 'place_order', title: 'Everyday points', summary: 'Earn 1 point for every $1 spent', on: true, priority: 1},
    {id: 'po2', event: 'place_order', title: 'Double points weekends', summary: 'Earn 2 points for every $1 spent on Sat–Sun', on: false, priority: 2, offByPlan: true},
    {id: 'po3', event: 'place_order', title: 'Gold tier bonus', summary: 'Earn 100 points on orders from $150 · Gold members', on: false, priority: 3, offByPlan: true},
    {id: 'su', event: 'sign_up', title: 'Sign up', summary: 'Earn 200 points', on: true},
    {id: 'bd', event: 'birthday', title: 'Celebrate a birthday', summary: 'Gifts per VIP tier', on: false, offByPlan: true},
    {id: 'wr', event: 'review', title: 'Write a review', summary: 'Earn 50 points', on: true},
  ],
};
export {OLD_RULES};

const VALID_SHOP = new Set(SHOPS.map((s) => s.value));
const VALID_PLAN = new Set(PLANS.map((p) => p.value));
function readUrl() {
  const q = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  return {shop: VALID_SHOP.has(q.get('shop')) ? q.get('shop') : null, plan: VALID_PLAN.has(q.get('plan')) ? q.get('plan') : null};
}
function writeUrl(patch) {
  const [path, q = ''] = window.location.hash.replace(/^#/, '').split('?');
  const params = new URLSearchParams(q);
  Object.entries(patch).forEach(([k, v]) => params.set(k, v));
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${path || '/demo'}?${params}`);
}

const ProtoContext = createContext(null);

export function ProtoProvider({children}) {
  const first = readUrl();
  const [shop, setShopRaw] = useState(first.shop || 'new');
  const [plan, setPlanRaw] = useState(first.plan || 'essential');
  const [switched, setSwitched] = useState(false);
  const [banner, setBanner] = useState('shown'); // shown | remind | never
  const [extra, setExtra] = useState([]); // programs added during the review

  useEffect(() => {
    const sync = () => {
      const u = readUrl();
      if (u.shop && u.shop !== shop) {setShopRaw(u.shop); setSwitched(false); setBanner('shown'); setExtra([]);}
      if (u.plan) setPlanRaw(u.plan);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [shop]);

  const setShop = useCallback((v) => {setShopRaw(v); setSwitched(false); setBanner('shown'); setExtra([]); writeUrl({shop: v});}, []);
  const setPlan = useCallback((v) => {setPlanRaw(v); writeUrl({plan: v});}, []);

  const value = useMemo(() => {
    const oldVersion = shop === 'old' && !switched;
    const key = shop === 'old' ? (switched ? 'switched' : 'old') : shop;
    const programs = [...PROGRAMS[key], ...extra];
    return {
      shop, plan, setShop, setPlan, switched, oldVersion, programs,
      switchVersion: () => setSwitched(true),
      banner, setBanner,
      addProgram: (p) => setExtra((list) => [...list, p]),
      placeOrders: programs.filter((p) => p.event === 'place_order'),
    };
  }, [shop, plan, setShop, setPlan, switched, banner, extra]);
  return <ProtoContext.Provider value={value}>{children}</ProtoContext.Provider>;
}

export const useProto = () => useContext(ProtoContext);
