// Build the public bundle: dist/hub (hub + every migrated demo) plus dist/firebase.json,
// the Firebase Hosting config that CI deploys from dist/. Usage: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, DIST, SITES, fail, requireNode, run, demoDir, viteBin, ensureInstalled, resetDir, hiddenCardProblems} from './lib.mjs';
import {normalizeFeature, statuses, kindLabels, featureProducts, canonical, reviewTarget} from '../hub/src/registry.mjs';

requireNode();
const only = process.argv[2];
if (only && !SITES.includes(only)) fail(`Không có site "${only}". Chọn một trong: ${SITES.join(', ')}`);
const HUB_ORIGIN = 'https://joy-prototypes.web.app';
// The real Joy builds (Joy master admin in the Shopify frame + North Bloom storefront, one shared data set) are built
// from the private Joy code on Alex's Mac and hosted there; this public repo only carries their list and card images.
const NORTH_BLOOM = 'https://joy-north-bloom.vercel.app';
const noindex = {source: '**', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]};
// Pages (no file extension, or .html) are revalidated on every visit, so a new home shows right after a deploy instead of
// a browser keeping the old one for an hour (Alex 19/11 saw the previous list after the merge). Assets keep caching.
const freshPages = {regex: '^(/[^.]*|.*\\.html)$', headers: [{key: 'Cache-Control', value: 'no-cache'}]};

function loadRegistry() {
  const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'hub/data/registry.json'), 'utf8'));
  const hidden = hiddenCardProblems(source);
  if (hidden.length) throw Error(hidden.join('\n'));
  const registry = {...source, features: source.features.map(normalizeFeature)};
  const seen = new Set();
  for (const f of registry.features) {
    const key = `${f.product}/${f.slug}`;
    if (!['loyalty', 'wishlist'].includes(f.product) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug) || /-(r\d+|v\d+|final|uat)$/.test(f.slug) || seen.has(key)) throw Error(`Invalid/duplicate feature: ${key}`);
    for (const product of featureProducts(f)) {
      const routeKey = `${product}/${f.slug}`;
      if (!['loyalty', 'wishlist'].includes(product) || seen.has(routeKey)) throw Error(`Invalid/duplicate route: ${routeKey}`);
      seen.add(routeKey);
      if (!f.quarantined && product !== f.product && !/^(https?:\/\/|\/(?!\/))/.test(f.alsoInUrls?.[product] || '')) throw Error(`Missing/invalid product review target: ${routeKey}`);
    }
    if (!Object.hasOwn(statuses, f.status)) throw Error(`Invalid status: ${key}`);
    if (!Object.hasOwn(kindLabels, f.kind)) throw Error(`Invalid kind: ${key}`);
    if (!f.quarantined && (!f.reviewUrl || !/^(https?:\/\/|\/(?!\/))/.test(f.reviewUrl))) throw Error(`Invalid review target: ${key}`);
    for (const link of f.legacy) if (!/^(https?:\/\/|\/(?!\/))/.test(link.url)) throw Error(`Invalid legacy URL: ${key}`);
    if (f.shot && !fs.existsSync(path.join(ROOT, 'hub/public', f.shot))) console.warn(`WARNING: Missing screenshot (npm run check will fail): ${f.shot}`);
    // A migrated feature is built from demos/<slug>; the hub serves it at /<product>/<slug>/.
    if (f.migrated && !fs.existsSync(path.join(demoDir(f.slug), 'package.json'))) throw Error(`migrated: true but demos/${f.slug}/package.json is missing: ${key}`);
  }
  return registry;
}

function buildHub() {
  const out = path.join(DIST, 'hub');
  const registry = loadRegistry();
  resetDir(out);
  // One sanitized snapshot drives Vite, the public data file and the routing below.
  const snapshot = path.join(out, 'registry.json');
  fs.writeFileSync(snapshot, JSON.stringify(registry, null, 2) + '\n');
  const hub = path.join(ROOT, 'hub');
  ensureInstalled(hub);
  // The /app runtime (real Joy master code) is never part of this bundle, so the hub hides its link.
  run(process.execPath, [viteBin(hub), 'build'], {cwd: hub, env: {...process.env, HUB_RUNTIME: 'null', HUB_REGISTRY_SNAPSHOT: snapshot, HUB_OUT_DIR: out}});
  for (const f of registry.features.filter(f => f.migrated)) {
    const dir = demoDir(f.slug);
    const target = path.join(out, f.product, f.slug);
    ensureInstalled(dir);
    run(process.execPath, [viteBin(dir), 'build', '--base', `/${f.product}/${f.slug}/`, '--outDir', target, '--emptyOutDir'], {cwd: dir});
    // The slash URL is served by the demo itself (a redirect would loop), so open the review screen from the entry page.
    const hash = new URL(f.reviewUrl, HUB_ORIGIN).hash;
    if (hash && hash !== '#') {
      const entry = path.join(target, 'index.html');
      const shim = `<script>if(!location.hash||location.hash==='#'||location.hash==='#/')history.replaceState(null,'',location.pathname+location.search+${JSON.stringify(hash)})</script>`;
      const html = fs.readFileSync(entry, 'utf8');
      if (!html.includes('<script type="module"')) throw Error(`No module entry in ${entry}`);
      fs.writeFileSync(entry, html.replace('<script type="module"', `${shim}\n    <script type="module"`));
    }
  }
  // The golden starter (templates/demo, what `npm run new` copies) is served at /starter/ so anyone can click through it.
  const starter = path.join(ROOT, 'templates/demo');
  ensureInstalled(starter);
  run(process.execPath, [viteBin(starter), 'build', '--base', '/starter/', '--outDir', path.join(out, 'starter'), '--emptyOutDir'], {cwd: starter});
  const redirects = registry.features.flatMap(f => featureProducts(f).flatMap(product => {
    const route = canonical(f, product);
    const destination = reviewTarget(f, product);
    const target = new URL(destination, HUB_ORIGIN);
    const selfHosted = target.origin === HUB_ORIGIN && target.pathname.replace(/\/$/, '') === route;
    if (selfHosted && !f.migrated) throw Error(`Unbuilt self-redirect: ${route}`);
    // Firebase matches a redirect source with or without its trailing slash, so a self-hosted demo gets no
    // redirect at all (it would loop on /route/); its folder index plus the entry shim open the review screen.
    const sources = selfHosted ? [] : [route, `${route}/`];
    return sources.map(source => ({source, destination: selfHosted ? `${route}/${target.search}${target.hash}` : destination, type: 302}));
  }));
  // Short links (Alex 20/11): joy-prototypes.web.app/<slug> in any letter case opens the prototype, so a link typed
  // as /Redeem-store-credit-in-checkout works. Firebase checks redirects before files, so a short link is one path
  // segment and never a name the bundle already uses at the top level (assets, loyalty, starter…).
  const taken = new Set(['archive', ...fs.readdirSync(out).map(name => name.replace(/\.[^.]+$/, '').toLowerCase())]);
  const shortLinks = [];
  for (const f of registry.features.filter(f => !f.quarantined)) {
    if (taken.has(f.slug)) continue;
    taken.add(f.slug);
    const route = canonical(f, f.product);
    shortLinks.push({regex: `(?i)^/${f.slug}/?$`, destination: f.migrated ? `${route}/` : route, type: 302});
  }
  redirects.push(...shortLinks);
  const rewrites = [{source: '/', destination: '/index.html'}, {source: '/archive', destination: '/archive/index.html'}];
  // Generated, never committed: redirects follow hub/data/registry.json, so nobody hand-edits deploy config.
  const hosting = {public: 'hub', ignore: ['firebase.json', '**/.*'], redirects, rewrites, headers: [noindex, freshPages]};
  fs.writeFileSync(path.join(DIST, 'firebase.json'), JSON.stringify({hosting}, null, 2) + '\n');
  fs.copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));
  // Static entry copies let ordinary static servers support history-mode deep links.
  for (const route of ['archive', ...registry.features.flatMap(f => featureProducts(f).map(product => `${product}/${f.slug}/info`))]) {
    fs.mkdirSync(path.join(out, route), {recursive: true});
    fs.copyFileSync(path.join(out, 'index.html'), path.join(out, route, 'index.html'));
  }
  buildHome(out, registry);
  console.log(`hub → ${path.relative(ROOT, out)} (${registry.features.length} features, ${registry.features.filter(f => f.migrated).length} built from demos/)`);
}

// Alex 18/11: the home is the Joy-branded North Bloom page — ONE list of every prototype, newest created first, no
// status ("Bỏ đi k cần status lại update mệt" · "list đủ all prototypes sxep theo thời gian dc tạo" · "branding cũ đâu").
// The React hub keeps /archive, /<product>/<slug>/info and the 404 page.
function buildHome(out, registry) {
  const tpl = fs.readFileSync(path.join(ROOT, 'hub/home/index.tpl.html'), 'utf8');
  const real = JSON.parse(fs.readFileSync(path.join(ROOT, 'hub/home/north-bloom.json'), 'utf8'));
  const protos = registry.features.filter(f => f.status !== 'paused' && !f.quarantined).map(f => {
    const dates = [...f.legacy.map(l => l.updated), f.updated].filter(Boolean).sort();
    return {slug: `proto-${f.product}-${f.slug}`, name: f.name, area: f.area,
      line: [...new Set(f.surfaces)].join(' · ') + (f.product === 'wishlist' ? ' · Joy Wishlist' : ''),
      created: f.created || dates[0] || '', href: canonical(f, f.product), shot: f.shot || '', products: featureProducts(f)};
  });
  const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
  for (const key of ['__FEATURES_JSON__', '__PROTOTYPES_JSON__', '__NB__']) if (!tpl.includes(key)) throw Error(`hub/home/index.tpl.html: missing ${key}`);
  const html = tpl.replace('__FEATURES_JSON__', () => json(real)).replace('__PROTOTYPES_JSON__', () => json(protos)).replaceAll('__NB__', NORTH_BLOOM);
  // The React hub entry moves to /archive/ (static copy made above); / and /?product= get the new home.
  fs.writeFileSync(path.join(out, 'index.html'), html);
}

try {
  buildHub();
} catch (error) {
  fail(error.message);
}
