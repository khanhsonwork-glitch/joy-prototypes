// One place for every "Shop now" destination, shared by Settings, the reward form and the milestone form.
// The storefront picks: the button's own link → the one product / one collection the reward is for →
// the shopping link in Settings (the old free-shipping Continue shopping URL) → where the button goes today.
import React, {createContext, useContext, useMemo, useState} from 'react';

/** The server's rule for the free-shipping URL ("/" but not "//", or http(s)://) plus a host, no spaces, 2,048 max. */
export const linkError = (value) => {
  const v = (value || '').trim();
  if (!v) return undefined;
  if (/\s/.test(v)) return 'Remove the spaces from the link';
  if (!/^(\/(?!\/)|https?:\/\/[^/?#]+)/.test(v)) return 'Start the link with “/” or “https://”';
  if (v.length > 2048) return 'Use 2,048 characters or fewer';
  return undefined;
};

/** Where Shop now goes, and the reason in words a merchant reads under the field. */
export function shopNowTarget({ownLink = '', products = [], collections = [], giftType = 'products', defaultLink = '',
  fallback = '/', fallbackWhy = 'your homepage, because the shopping link in Settings is blank'}) {
  const own = ownLink.trim();
  if (own && !linkError(own)) return {url: own, why: 'the link above'};
  if (giftType === 'products' && products.length === 1) {
    return {url: `/products/${products[0].handle}`, why: `the ${products[0].title} page, the only product in this reward`};
  }
  if (giftType === 'collections' && collections.length === 1) {
    return {url: `/collections/${collections[0].handle}`, why: `the ${collections[0].title} collection, the only collection in this reward`};
  }
  const def = defaultLink.trim();
  if (def && !linkError(def)) return {url: def, why: 'the shopping link in Settings'};
  return {url: fallback, why: fallbackWhy};
}

const LinksContext = createContext(null);

export function LinksProvider({children}) {
  const [saved, setSaved] = useState({defaultLink: '/collections/best-sellers'});
  const value = useMemo(() => ({saved, save: (next) => setSaved((s) => ({...s, ...next}))}), [saved]);
  return <LinksContext.Provider value={value}>{children}</LinksContext.Provider>;
}

export const useLinks = () => useContext(LinksContext);
