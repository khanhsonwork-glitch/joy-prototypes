// Rows the widget shows for a shop under the current screen state, with remove kept in memory.
import {useEffect, useMemo, useState} from 'react';
import {OVERFLOW_ITEMS, SHOPS, WORST_EXTRA} from '../data/wishlist.js';

function rowsFor(shopId, state) {
  const base = SHOPS[shopId].items;
  if (state === 'empty') return [];
  if (state === 'disabled') return base.map((item) => ({...item, soldOut: true}));
  if (state === 'overflow') return [...OVERFLOW_ITEMS, ...base];
  if (state === 'worst') {
    const extra = Array.from({length: WORST_EXTRA}, (_, i) => {
      const src = base[i % base.length];
      return {...src, id: `${src.id}-w${i}`};
    });
    return [...OVERFLOW_ITEMS, ...base, ...extra];
  }
  return base;
}

/** {items, remove(item), status}: status is 'loading' / 'error' / 'ready' from the screen state. */
export function useWishlistItems(shopId, state) {
  const initial = useMemo(() => rowsFor(shopId, state), [shopId, state]);
  const [items, setItems] = useState(initial);
  useEffect(() => setItems(initial), [initial]);
  const status = state === 'loading' ? 'loading' : state === 'error' ? 'error' : 'ready';
  return {items, status, remove: (item) => setItems((prev) => prev.filter((i) => i.id !== item.id)), reset: () => setItems(initial)};
}
