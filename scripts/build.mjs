// Build the public bundle: dist/hub (hub + every migrated demo) plus dist/firebase.json,
// the Firebase Hosting config that CI deploys from dist/. Usage: node scripts/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, DIST, SITES, fail, requireNode, run, demoDir, viteBin, ensureInstalled, resetDir} from './lib.mjs';
import {normalizeFeature, statuses, kindLabels, featureProducts, canonical, reviewTarget} from '../hub/src/registry.mjs';

requireNode();
const only = process.argv[2];
if (only && !SITES.includes(only)) fail(`Không có site "${only}". Chọn một trong: ${SITES.join(', ')}`);
const HUB_ORIGIN = 'https://joy-prototypes.web.app';
const noindex = {source: '**', headers: [{key: 'X-Robots-Tag', value: 'noindex, nofollow'}]};

function loadRegistry() {
  const source = JSON.parse(fs.readFileSync(path.join(ROOT, 'hub/data/registry.json'), 'utf8'));
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
  const rewrites = [{source: '/', destination: '/index.html'}, {source: '/archive', destination: '/index.html'}];
  // Generated, never committed: redirects follow hub/data/registry.json, so nobody hand-edits deploy config.
  const hosting = {public: 'hub', ignore: ['firebase.json', '**/.*'], redirects, rewrites, headers: [noindex]};
  fs.writeFileSync(path.join(DIST, 'firebase.json'), JSON.stringify({hosting}, null, 2) + '\n');
  fs.copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));
  // Static entry copies let ordinary static servers support history-mode deep links.
  for (const route of ['archive', ...registry.features.flatMap(f => featureProducts(f).map(product => `${product}/${f.slug}/info`))]) {
    fs.mkdirSync(path.join(out, route), {recursive: true});
    fs.copyFileSync(path.join(out, 'index.html'), path.join(out, route, 'index.html'));
  }
  console.log(`hub → ${path.relative(ROOT, out)} (${registry.features.length} features, ${registry.features.filter(f => f.migrated).length} built from demos/)`);
}

try {
  buildHub();
} catch (error) {
  fail(error.message);
}
