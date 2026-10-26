// Both registry generations remain readable while the data migration is running.
export const statuses = {review: 'Đang review', todo: 'Chờ dev', building: 'Đang làm', live: 'Đã live', paused: 'Tạm dừng'};
export const bands = ['review', 'todo', 'building', 'live'];
export const kindLabels = {prototype: 'Mở prototype', 'uat-note': 'Mở ghi chú UAT', playground: 'Mở playground'};
export const canonical = (feature, product = feature.product) => `/${product}/${feature.slug}`;
export const featureProducts = feature => [...new Set([feature.product, ...feature.alsoIn])];
export const reviewTarget = (feature, product = feature.product) => feature.quarantined
  ? `${canonical(feature, product)}/info`
  : feature.alsoInUrls?.[product] || feature.reviewUrl;
export const inProduct = (feature, product) => feature.product === product || feature.alsoIn.includes(product);
const folded = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/gi, 'd').toLocaleLowerCase('vi');
const unique = values => [...new Map(values.filter(Boolean).map(value => [folded(value.trim()), value.trim()])).values()];

export function normalizeFeature(source) {
  const {statusEvidence, quarantineReason, ...feature} = source;
  if (feature.quarantined) {
    delete feature.reviewUrl;
    delete feature.alsoInUrls;
    feature.legacy = [];
  }
  const reviewUrl = feature.reviewUrl || feature.legacy?.[0]?.url;
  const stage = feature.stage || null;
  const status = feature.status === 'archived' ? 'paused' : feature.status === 'approved'
    ? (['Doing', 'In progress', 'Testing', 'QA/UAT', 'Waiting to live'].includes(stage) ? 'building' : 'todo')
    : feature.status;
  const legacy = feature.legacy || [];
  const exactCurrent = legacy.findIndex(link => link.url === reviewUrl);
  const markedCurrent = legacy.findIndex(link => link.current);
  const currentIndex = exactCurrent >= 0 ? exactCurrent : markedCurrent;
  return {
    ...feature, status, stage, ...(!feature.quarantined && {reviewUrl}), kind: feature.kind || 'prototype',
    area: (feature.area || '').split('·')[0].trim(),
    surfaces: unique(feature.surfaces || []),
    alsoIn: feature.alsoIn || [], aliases: feature.aliases || [],
    legacy: legacy.map((link, index) => ({...link, current: index === currentIndex})),
  };
}

export function matches(feature, query) {
  const needle = folded(query.trim());
  const legacy = (feature.quarantined ? [] : feature.legacy).flatMap(link => {
    let host = '';
    try {host = new URL(link.url, 'https://joy-prototypes.web.app').hostname;} catch { /* Build validation reports invalid URLs. */ }
    return [link.label, host];
  });
  return folded([feature.name, feature.area, feature.slug, ...feature.aliases, ...legacy].join(' ')).includes(needle);
}
