import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {normalizeFeature} from '../hub/src/registry.mjs';
import {loadBlocklist, blockedMatches, hostBlocked, hiddenCardProblems} from '../scripts/lib.mjs';
import {imageSize} from './image-size.mjs';
const base = new URL(process.argv[2] || 'http://127.0.0.1:4173');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Tests read the built bundle in dist/hub, the exact snapshot that gets uploaded.
const deploy = path.join(root,'dist/hub');
const evidence = process.env.HUB_CHECK_EVIDENCE || path.join(root,'evidence/hub');
const registryText = await fs.readFile(path.join(deploy,'registry.json'),'utf8');
const features = JSON.parse(registryText).features;
const config = JSON.parse(await fs.readFile(path.join(root,'dist/firebase.json'),'utf8')).hosting;
const url = route => new URL(route,base).href;
const canonical = (f, product = f.product) => `/${product}/${f.slug}`;
const variants = f => [...new Set([f.product,...(f.alsoIn || [])])];
const targetFor = (f,p=f.product) => f.quarantined ? `${canonical(f,p)}/info` : f.alsoInUrls?.[p] || f.reviewUrl;
const belongs = (f,p) => f.product === p || (f.alsoIn || []).includes(p);
const products = {loyalty:'Joy Loyalty',wishlist:'Joy Wishlist'};
const statuses = {review:'Đang review',todo:'Chờ dev',building:'Đang làm',live:'Đã live',paused:'Tạm dừng'};
const labels = {prototype:'Mở prototype','uat-note':'Mở ghi chú UAT',playground:'Mở playground'};
// This oracle is independent of the UI search function.
const fold = s => s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/đ/gi,'d').toLowerCase();
const searchMatch = (f,q) => fold([f.name,f.area,f.slug,...(f.aliases||[]),...f.legacy.flatMap(l=>[l.label,new URL(l.url,base).hostname])].join(' ')).includes(fold(q.trim()));
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light'});
const page = await context.newPage();
const errors = [], requests = new Set();
page.on('pageerror', error => errors.push(error.message));
page.on('console', msg => {if (msg.type() === 'error') errors.push(`${msg.text()} (${msg.location().url})`);});
page.on('request', request => {const u = new URL(request.url()); if (['http:','https:'].includes(u.protocol)) requests.add(u.origin);});
async function go(route) {
  const response = await page.goto(url(route),{waitUntil:'networkidle'});
  assert(response?.ok(),`${route}: HTTP ${response?.status()}`);
  await page.locator('h1').waitFor();
  await page.evaluate(()=>document.fonts.ready);
}
let failed = 0, total = 0;
async function check(label, fn) {
  if (process.env.CHECK_FILTER && !label.includes(process.env.CHECK_FILTER)) return;
  total++;
  try {const note = await fn(); console.log(`PASS ${total}. ${label}${note ? ` — ${note}` : ''}`);}
  catch (error) {failed++; console.log(`FAIL ${total}. ${label}\n  ${error.stack}`);}
}
async function eventually(fn) {
  const deadline = Date.now() + 5000;
  while (true) {
    try {return await fn();} catch (error) {
      if (Date.now() >= deadline) throw error;
      await new Promise(resolve => setTimeout(resolve,40));
    }
  }
}
const rows = () => page.locator('[data-archive-feature]');
const rowCount = n => eventually(async()=>assert.equal(await rows().count(),n));

await check('Registry cũ/mới và dữ liệu public',async()=> {
  const old = normalizeFeature({status:'archived',name:'Sample',area:'Membership · Sample',surfaces:['Admin','Admin','Widget'],legacy:[{url:'https://example.com/review',label:'Latest'},{url:'https://example.com/previous',label:'Older'}],statusEvidence:'Private note'});
  assert.equal(old.status,'paused'); assert.equal(old.stage,null); assert.equal(old.kind,'prototype');
  assert.equal(old.reviewUrl,'https://example.com/review'); assert.equal(old.area,'Membership');
  assert.deepEqual(old.surfaces,['Admin','Widget']); assert.deepEqual(old.legacy.map(l=>l.current),[true,false]);
  assert(!Object.hasOwn(old,'statusEvidence'));
  assert.equal(normalizeFeature({...old,status:'approved'}).status,'todo');
  const modern = normalizeFeature({...old,status:'building',stage:'Testing',reviewUrl:'https://example.com/previous',kind:'uat-note',aliases:['Quest'],alsoIn:['wishlist']});
  assert.equal(modern.status,'building'); assert.equal(modern.kind,'uat-note'); assert.equal(modern.stage,'Testing');
  assert.deepEqual(modern.legacy.map(l=>l.current),[false,true]);
  assert.deepEqual(normalizeFeature(modern),modern,'Normalization must be idempotent');
  assert(!registryText.includes('statusEvidence'));
  for(const file of await fs.readdir(path.join(deploy,'assets'))) if(/\.(js|json)$/.test(file)) assert(!/["']?statusEvidence["']?\s*:\s*["']/.test(await fs.readFile(path.join(deploy,'assets',file),'utf8')),`Internal evidence value in ${file}`);
});
await check('Home: bốn bands, counts, card metadata và hai tabs',async()=> {
  await go('/');
  for(const [product,label] of Object.entries(products)) {
    const expected = features.filter(f=>belongs(f,product)&&f.status!=='paused');
    const tab = page.getByRole('tab',{name:new RegExp(label)});
    await tab.click(); await eventually(async()=>assert.equal(await tab.getAttribute('aria-selected'),'true'));
    assert.equal(Number(await tab.locator('.count').textContent()),expected.length);
    assert.equal(await page.locator('.feature-card').count(),expected.length);
    const activeBands=['review','todo','building','live'].filter(status=>expected.some(f=>f.status===status));
    assert.deepEqual(await page.locator('.bands h2').evaluateAll(nodes=>nodes.map(n=>n.id)),activeBands.map(s=>`band-${s}`));
    for(const status of activeBands) {
      const group=expected.filter(f=>f.status===status).sort((a,b)=>b.updated.localeCompare(a.updated)||(b.stage==='Ready')-(a.stage==='Ready')||(b.round??-1)-(a.round??-1)||a.name.localeCompare(b.name));
      const section=page.locator('section').filter({has:page.locator(`#band-${status}`)});
      assert.deepEqual(await section.locator('.feature-card').evaluateAll(nodes=>nodes.map(n=>n.dataset.feature)),group.map(f=>f.slug));
    }
    for(const f of expected) {
      const card=page.locator(`[data-feature="${f.slug}"]`);
      assert.equal(await card.locator('.card-main').getAttribute('href'),canonical(f,product));
      assert.equal(await card.locator('.card-area').textContent(),f.area);
      assert.equal(await card.locator('.card-surfaces').textContent(),[...new Set(f.surfaces)].join(' · '));
      assert.equal(await card.locator('.stage-chip').count(),f.stage?1:0);
      if(f.stage) {
        assert.equal(await card.locator('.card-meta .stage-chip').textContent(),`Notion · ${f.stage}`);
        assert.equal(await card.locator('.stage-chip').getAttribute('title'),`Trạng thái trên Notion: ${f.stage}`);
      }
      assert.equal(await card.locator('.entry-note').count(),f.entryNote?1:0);
      if(f.entryNote) assert.equal(await card.locator('.entry-note').textContent(),f.entryNote);
      assert.equal(await card.locator('.card-meta i').count(),0);
      assert.equal(await card.getByRole('link',{name:`Chi tiết ${f.name}`,exact:true}).count(),1);
    }
    // Alex 21/10: "bỏ cái code thật và tất cả bản dựng" — both home shortcuts are gone; the routes stay.
    assert.equal(await page.getByRole('link',{name:/Tất cả bản dựng/}).count(),0);
    assert.equal(await page.locator('a[href="/app/"]').count(),0);
    // Alex 21/10: paused builds are hidden from the hub — no paused chip, line or count on home.
    assert.equal(await page.locator('.paused-line,.chip-paused,.paused-results').count(),0);
    assert(!(await page.locator('body').innerText()).includes('Tạm dừng'),`Tạm dừng visible on ${product}`);
  }
  assert.equal(await page.getByText('Link cũ',{exact:true}).count(),0);
  assert.equal(await page.locator('#band-paused').count(),0);
  await page.reload({waitUntil:'networkidle'}); assert.equal(await page.getByRole('tab',{name:/Joy Wishlist/}).getAttribute('aria-selected'),'true');
  await page.getByRole('tab',{name:/Joy Wishlist/}).press('ArrowLeft');
  await eventually(async()=>assert.equal(await page.getByRole('tab',{name:/Joy Loyalty/}).getAttribute('aria-selected'),'true'));
});
await check('F4a: every product redirect and static info route',async()=> {
  const expectedRules=[];
  for(const f of features) for(const product of variants(f)) {
    const route=canonical(f,product), destination=targetFor(f,product);
    const target=new URL(destination,base);
    const samePath=target.pathname.replace(/\/$/,'')===route&&['joy-prototypes.web.app',base.hostname].includes(target.hostname);
    for(const suffix of ['', '/']) {
      if(f.migrated&&samePath)continue;
      expectedRules.push({source:route+suffix,destination:samePath?`${route}/${target.search}${target.hash}`:destination,type:302});
    }
    await fs.access(path.join(deploy,route,'info/index.html'));
  }
  assert.deepEqual(config.redirects,expectedRules);
  assert(!config.rewrites.some(r=>r.source.includes(':product')||r.source.includes(':slug')),'Unknown info routes must fall through to 404.html');
});
await check('HTTP redirects (302, same as Firebase Hosting)',async()=> {
  for(const rule of config.redirects) {
    const response=await context.request.get(url(rule.source),{maxRedirects:0,timeout:15000});
    assert.equal(response.status(),302,rule.source); assert.equal(response.headers().location,rule.destination);
  }
});
await check('Non-quarantined current/history destinations',async()=> {
  const targets=[...new Set(features.filter(f=>!f.quarantined).flatMap(f=>[...variants(f).map(p=>targetFor(f,p)),...f.legacy.map(l=>l.url)]))];
  const problems=[];
  let cursor=0;
  await Promise.all(Array.from({length:5},async()=> {
    while(cursor<targets.length) {
      const link=targets[cursor++];
      try {
        const response=await context.request.get(new URL(link,base).href,{timeout:25000,maxRedirects:10});
        if(response.status()!==200)problems.push(`${link}: HTTP ${response.status()}`);
      } catch(error) {problems.push(`${link}: ${error.message.split('\n')[0]}`);}
    }
  }));
  assert.deepEqual(problems,[]);
  return `${targets.length} destinations`;
});
await check('F4a: hidden cards carry no link, in the repo or the bundle',async()=> {
  // The repo is public: a hidden card's link would be published by registry.json even if the hub hides it.
  const source=JSON.parse(await fs.readFile(path.join(root,'hub/data/registry.json'),'utf8'));
  assert.deepEqual(hiddenCardProblems(source),[]);
  for(const raw of source.features.filter(f=>f.quarantined)) {
    const f=features.find(f=>f.product===raw.product&&f.slug===raw.slug);
    assert.deepEqual(f.legacy,[]);
    for(const field of ['reviewUrl','quarantineReason','alsoInUrls']) assert(!Object.hasOwn(f,field),`Public quarantine field: ${field}`);
  }
  // The two builds taken out on 26/10 must not come back through any file of the bundle.
  async function scan(dir) {
    for(const item of await fs.readdir(dir,{withFileTypes:true})) {
      const file=path.join(dir,item.name);
      if(item.isDirectory()) await scan(file);
      else {const bytes=await fs.readFile(file); for(const host of ['joy-ai-workspace','joy-store-credit-only']) assert(!bytes.includes(Buffer.from(host)),`Removed build ${host} in ${file}`);}
    }
  }
  await scan(deploy);
  await go('/archive');
  // Paused builds (all quarantined ones are paused) are hidden from the hub list since 21/10; they must not appear at all.
  for(const f of features.filter(f=>f.status==='paused')) assert.equal(await page.locator(`[data-archive-feature="${f.slug}"]`).count(),0,`paused ${f.slug} listed`);
  for(const f of features.filter(f=>f.status!=='paused')) {
    const row=page.locator(`[data-archive-feature="${f.slug}"]`);
    const links=await row.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    assert(links.every(href=>href.startsWith('/')),'All-builds must expose hub routes only');
    if(f.quarantined) {
      assert.equal(await row.locator('.archive-links a').count(),0);
      assert.match(await row.textContent(),/Link tạm ẩn/);
    }
  }
});
await check('Info: title, stage, kind, current/history và pairing',async()=> {
  for(const f of features) for(const product of variants(f)) {
    await go(`${canonical(f,product)}/info`);
    assert.equal(await page.locator('h1').textContent(),f.name);
    assert.equal(await page.title(),`${f.name} · Joy Prototypes`);
    if(f.quarantined) {
      assert.equal(await page.locator('.actions a,.legacy-list a,.detail-shot-link').count(),0);
      assert.equal(await page.locator('.quarantine-note').textContent(),'Link tạm ẩn: bản dựng cũ còn dữ liệu mẫu cần làm sạch.');
      continue;
    }
    assert.equal(await page.locator('.actions .primary').getAttribute('href'),canonical(f,product));
    assert.equal(await page.locator('.primary-action .entry-note').count(),f.entryNote?1:0);
    if(f.entryNote) assert.equal(await page.locator('.primary-action .entry-note').textContent(),f.entryNote);
    if(f.shot) {
      assert.equal(await page.locator('.detail-shot-link').getAttribute('href'),canonical(f,product));
      const dimensions=await page.locator('.detail-shot').evaluate(img=>({width:img.getBoundingClientRect().width,natural:img.naturalWidth,center:(img.getBoundingClientRect().left+img.getBoundingClientRect().right)/2}));
      assert(dimensions.width<=960&&dimensions.width<=dimensions.natural);
      assert(Math.abs(dimensions.center-720)<=1,'Hero must be centered at 1440px');
    }
    assert.equal((await page.locator('.actions .primary').textContent()).replace('↗','').trim(),labels[f.kind]);
    assert.equal(await page.locator('.detail-header .stage-chip').count(),f.stage?1:0);
    if(f.stage) assert.equal(await page.locator('.detail-header .stage-chip').textContent(),`Notion: ${f.stage}`);
    for(const [key,label] of [['notion','Task Notion'],['prd','PRD']]) {
      const link=page.getByRole('link',{name:new RegExp(`^${label}`)});
      if(f[key]) assert.equal(await link.getAttribute('href'),f[key]); else assert.equal(await link.count(),0);
    }
    const current=page.locator('section').filter({has:page.getByRole('heading',{name:'Bản hiện tại',exact:true})});
    const past=page.locator('section').filter({has:page.getByRole('heading',{name:'Các bản trước',exact:true})});
    const expectedCurrent=f.legacy.filter(l=>l.current);
    assert.deepEqual(await current.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),expectedCurrent.length?expectedCurrent.map(()=>targetFor(f,product)):[targetFor(f,product)]);
    const expectedPast=f.legacy.filter(l=>!l.current);
    assert.equal(await past.count(),expectedPast.length?1:0);
    assert.deepEqual(await past.locator('a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))),expectedPast.map(l=>l.url));
    assert.equal(await page.getByRole('heading',{name:'So với production',exact:true}).count(),f.slug!=='custom-plan'&&f.parity?.length?1:0);
    if(f.slug==='custom-plan'&&await page.locator('.pairing-row').count()) assert.equal(await page.locator('.pairing-row a').getAttribute('href'),'/app/#/customize_plan');
  }
  // Navigate from the actual gallery action, including the shared Wishlist entry.
  for(const product of Object.keys(products)) {
    const f=features.find(f=>belongs(f,product)&&f.status!=='paused');
    if(!f)continue;
    await go(`/?product=${product}`); await page.getByRole('link',{name:`Chi tiết ${f.name}`,exact:true}).click();
    await page.getByRole('heading',{name:f.name,exact:true}).waitFor();
    await page.locator('.back-link').click(); await page.getByRole('heading',{name:'Joy Prototypes',exact:true}).waitFor();
    assert.equal(await page.getByRole('tab',{name:new RegExp(products[product])}).getAttribute('aria-selected'),'true');
  }
});
await check('Custom plan: source stays out of this repo, the card points at its standalone link',async()=> {
  const f=features.find(f=>f.slug==='custom-plan');
  assert(f&&!f.migrated,'custom-plan replicates an internal admin screen, so it must not be built from demos/');
  await fs.access(path.join(root,'demos/custom-plan')).then(()=>{throw Error('demos/custom-plan must not exist');},()=>{});
  for(const suffix of ['', '/']) {
    const response=await page.request.get(url('/loyalty/custom-plan'+suffix),{maxRedirects:0});
    assert.equal(response.status(),302,`custom-plan${suffix}`);
    assert.equal(response.headers().location,f.reviewUrl);
  }
});
await check('Every demo built into the hub opens its review screen directly',async()=> {
  const migrated=features.filter(f=>f.migrated&&!f.quarantined);
  assert(migrated.length>=1,'Points Giveaway must be built from demos/');
  const fresh=await browser.newContext(); const p=await fresh.newPage();
  const pageErrors=[]; p.on('pageerror',error=>pageErrors.push(error.message));
  try {
    for(const f of migrated) {
      const review=new URL(f.reviewUrl,base);
      for(const suffix of ['', '/']) {
        const response=await p.goto(url(canonical(f)+suffix),{waitUntil:'networkidle'});
        assert.equal(response.status(),200,`${f.slug}${suffix}`);
        await p.locator('#root *').first().waitFor({timeout:10000});
        assert.equal(new URL(p.url()).origin,new URL(url('/')).origin,`${f.slug} left the hub: ${p.url()}`);
        assert.equal(new URL(p.url()).pathname,`${canonical(f)}/`);
        assert.equal(new URL(p.url()).hash,review.hash,`${f.slug}${suffix} review screen`);
        assert.equal(await p.locator('input[type=password]').count(),0);
        assert((await p.locator('#root').innerText()).trim().length>40,`${f.slug}${suffix}: empty screen`);
      }
    }
    assert.deepEqual(pageErrors,[]);
  } finally {await fresh.close();}
  return migrated.map(f=>f.slug).join(', ');
});
await check('Home search và all-builds filters/search/empty',async()=> {
  // Alex 21/10 "Mấy cái tạm dừng bỏ đi": paused builds are hidden from every hub list; their routes stay (checks 3, 5, 7).
  const active=features.filter(f=>f.status!=='paused');
  await go('/archive'); assert.equal(await page.locator('h1').textContent(),'Tất cả bản dựng');
  await rowCount(active.length);
  for(const [product,label] of Object.entries(products)) {
    await page.getByRole('button',{name:label,exact:true}).click(); await rowCount(active.filter(f=>belongs(f,product)).length);
  }
  await page.getByRole('button',{name:'Tất cả sản phẩm',exact:true}).click(); await rowCount(active.length);
  for(const [status,label] of Object.entries(statuses)) {
    if(status==='paused') {assert.equal(await page.getByRole('button',{name:label,exact:true}).count(),0); continue;}
    await page.getByRole('button',{name:label,exact:true}).click(); await rowCount(active.filter(f=>f.status===status).length);
  }
  await page.getByRole('button',{name:'Tất cả trạng thái',exact:true}).click(); await rowCount(active.length);
  const sample=active.find(f=>f.legacy.length);
  const queries=['quest',sample.name,sample.area,sample.slug,sample.legacy[0].label,new URL(sample.legacy[0].url,base).hostname,...features.flatMap(f=>f.aliases||[]),'zzzz-no-matching-feature'];
  for(const q of [...new Set(queries)]) {
    await page.getByRole('searchbox').fill(q); await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('q'),q)); await rowCount(active.filter(f=>searchMatch(f,q)).length);
  }
  await page.getByRole('status').waitFor();
  for(const product of Object.keys(products)) {
    await go(`/?product=${product}`);
    for(const q of ['quest',sample.area,sample.slug,sample.legacy[0].label,new URL(sample.legacy[0].url,base).hostname,'zzzz-no-matching-feature','']) {
      await page.getByRole('searchbox').fill(q);
      const expected=active.filter(f=>belongs(f,product)&&searchMatch(f,q));
      await eventually(async()=>assert.equal(await page.locator('.feature-card').count(),expected.length));
      if(!expected.length) await page.getByRole('status').waitFor();
    }
  }
  // Queries that only match paused builds ("pulse", "MED") now show the plain empty state, with no link into paused builds.
  for(const product of Object.keys(products)) for(const q of ['pulse','MED','programs','']) {
    await go(`/?product=${product}&q=${encodeURIComponent(q)}`);
    const expected=active.filter(f=>belongs(f,product)&&searchMatch(f,q));
    assert.equal(await page.locator('.feature-card').count(),expected.length);
    assert.equal(await page.locator('.paused-results,.paused-line,.chip-paused').count(),0);
    assert(!(await page.locator('body').innerText()).includes('Tạm dừng'),`Tạm dừng visible for ${product} q=${q}`);
    if(!expected.length) assert.equal(await page.locator('.empty-state').count(),1);
  }
  for(const route of ['/archive?status=archived','/archive?status=paused']) {
    await go(route); await rowCount(active.length);
    assert.equal(await rows().filter({hasText:'Tạm dừng'}).count(),0);
  }
});
await check('Regression B4: search keeps every key typed fast on home and archive',async()=> {
  // Review 26/10: typing "milestone" with no pause between keys came out as "ne" (controlled input vs router transition).
  const active=features.filter(f=>f.status!=='paused');
  for(const [route,count,scope] of [['/',()=>page.locator('.feature-card').count(),f=>belongs(f,'loyalty')],['/archive',()=>rows().count(),()=>true]]) {
    for(const delay of [0,10,30]) {
      await go(route); const box=page.getByRole('searchbox'); await box.click();
      await box.pressSequentially('milestone',{delay});
      await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('q'),'milestone'));
      assert.equal(await box.inputValue(),'milestone',`${route} delay ${delay}`);
      const expected=active.filter(f=>scope(f)&&searchMatch(f,'milestone')).length;
      await eventually(async()=>assert.equal(await count(),expected));
    }
  }
  // The URL still fills the box: a shared link with ?q= and the back button after a tab switch.
  await go('/?q=quest'); assert.equal(await page.getByRole('searchbox').inputValue(),'quest');
  await page.getByRole('tab',{name:'Joy Wishlist'}).click(); await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('product'),'wishlist'));
  assert.equal(await page.getByRole('searchbox').inputValue(),'quest');
  return 'delay 0, 10 và 30 ms';
});
await check('Regression B4: shared queries, paste, clear and focused Back/Forward stay in sync',async()=> {
  for(const route of ['/', '/archive']) {
    await go(`${route}?q=quest`);
    const input=page.getByRole('searchbox');
    assert.equal(await input.inputValue(),'quest');
    // Seed an extra same-document history entry; search then replaces only that entry, just as in normal use.
    await page.evaluate(()=>history.pushState(history.state,'',location.href));
    await input.focus();
    await input.fill('milestone');
    await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('q'),'milestone'));
    await page.goBack();
    await eventually(async()=>assert.equal(await input.inputValue(),'quest'));
    await page.goForward();
    await eventually(async()=>assert.equal(await input.inputValue(),'milestone'));
    await input.fill('');
    await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('q'),null));
    await input.pressSequentially('quyền lợi',{delay:0});
    await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('q'),'quyền lợi'));
    assert.equal(await input.inputValue(),'quyền lợi');
    await input.fill(''); await input.focus();
    await page.keyboard.insertText('milestone');
    await eventually(async()=>assert.equal(new URL(page.url()).searchParams.get('q'),'milestone'));
    assert.equal(await input.inputValue(),'milestone');
  }
});
await check('Regression B5: all status chips fit at 375 without sideways scrolling',async()=> {
  await page.setViewportSize({width:375,height:812});
  try {
    await go('/');
    const chips=page.locator('.statusbar .chip');
    assert(await chips.count()>1,'fixture needs multiple status groups');
    for(const chip of await chips.all()) {
      const box=await chip.boundingBox();
      assert(box.x>=0 && box.x+box.width<=375,`${await chip.innerText()}: chip outside viewport`);
    }
    const dimensions=await page.locator('.statusbar .wrap').evaluate(n=>({scroll:n.scrollWidth,width:n.clientWidth}));
    assert(dimensions.scroll<=dimensions.width,'status chips require hidden horizontal scrolling');
    await page.getByRole('link',{name:/Đã live/}).click();
    assert.equal(new URL(page.url()).hash,'#band-live');
  } finally {await page.setViewportSize({width:1440,height:900});}
});
await check('Responsive, no /app/ link on home and /app/ not served (real Joy code stays out), hover và whole-card focus',async()=> {
  for(const width of [1440,768,375]) {
    await page.setViewportSize({width,height:900});
    for(const route of ['/','/?product=wishlist','/archive',...features.flatMap(f=>variants(f).map(p=>`${canonical(f,p)}/info`))]) {
      await go(route);
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
      assert(sizes.scroll<=sizes.width,`${route} at ${width}: ${sizes.scroll}`);
      if(route==='/') {
        // The code-lane shortcut was removed from home on 21/10. The /app runtime runs real Joy master code, so this
        // public hub never ships it (check-bundle blocks app/); the route must answer 404, not a page.
        assert.equal(await page.locator('a[href="/app/"]').count(),0);
        if(width===1440){const r=await page.request.get(url('/app/'));assert.equal(r.status(),404,'/app/ must not be served');assert(!(await r.text()).includes('<title>Joy Loyalty'),'/app/ content leaked');}
      }
    }
  }
  await page.setViewportSize({width:1440,height:900}); await go('/');
  const card=page.locator('.feature-card').first();
  // The spotlight card is large; park the pointer first so a leftover hover from earlier clicks cannot pre-lift it.
  await page.mouse.move(0,0); await page.waitForTimeout(250);
  const before=await card.boundingBox(); await card.hover();
  await eventually(async()=>assert((await card.boundingBox()).y<before.y,'Card hover should lift'));
  await page.keyboard.press('Tab'); await card.locator('.card-main').focus();
  assert.equal(await card.evaluate(n=>getComputedStyle(n).outlineStyle),'solid');
  assert.equal(await card.evaluate(n=>getComputedStyle(n).outlineWidth),'2px');
  await page.keyboard.press('Tab'); assert(await card.locator('.info-link').evaluate(n=>n===document.activeElement));
});
await check('Hub font local, no external requests, no errors',async()=> {
  await go('/');
  const fonts=await page.evaluate(()=>[...document.fonts].map(f=>({family:f.family,status:f.status,weight:f.weight})));
  // Be Vietnam Pro (SIL OFL) for the whole hub, self-hosted. General Sans left 26/10: its license forbids a public repo.
  for(const weight of ['400','500','600']) assert(fonts.some(f=>f.family.replace(/"/g,'')==='Be Vietnam Pro'&&f.status==='loaded'&&f.weight===weight),JSON.stringify(fonts));
  assert(!fonts.some(f=>f.family.replace(/"/g,'')==='General Sans'),'General Sans must stay out: its license forbids a public repo');
  const woff=(await fs.readdir(path.join(deploy,'fonts'))).filter(f=>f.endsWith('.woff2'));
  for(const file of ['be-vietnam-pro-regular.woff2','be-vietnam-pro-medium.woff2','be-vietnam-pro-semibold.woff2','be-vietnam-pro-bold.woff2']) assert(woff.includes(file),file);
  assert(!woff.includes('general-sans-600.woff2'),'general-sans-600.woff2 must not ship');
  assert.deepEqual([...requests].filter(origin=>origin!==base.origin),[]);
  assert.deepEqual(errors,[]);
  assert(config.headers.find(h=>h.source==='**')?.headers.some(h=>h.key==='X-Robots-Tag'&&h.value==='noindex, nofollow'));
});
await check('Hub stays white on dark-mode devices (Alex 21/10)',async()=> {
  const lightTextCard={};
  async function textCardIn(scheme,width,route) {
    const ctx=await browser.newContext({colorScheme:scheme,viewport:{width,height:900}}); const lp=await ctx.newPage();
    await lp.goto(url(route),{waitUntil:'networkidle'}); await lp.locator('h1').waitFor();
    const value=await lp.evaluate(()=>{const e=document.querySelector('.text-card');return e&&getComputedStyle(e).backgroundColor;});
    await ctx.close(); return value;
  }
  const dark=await browser.newContext({colorScheme:'dark'}); const p=await dark.newPage();
  const info=`${canonical(features.find(f=>!f.quarantined))}/info`;
  for(const width of [1440,390]) {
    await p.setViewportSize({width,height:900});
    for(const route of ['/','/?product=wishlist','/archive',info]) {
      const r=await p.goto(url(route),{waitUntil:'networkidle'}); assert(r?.ok(),route); await p.locator('h1').waitFor();
      const c=await p.evaluate(()=>{const cs=e=>e&&getComputedStyle(e);return {scheme:cs(document.documentElement).colorScheme,bg:cs(document.body).backgroundColor,text:cs(document.body).color,card:cs(document.querySelector('.feature-card:not(.text-card),.archive-table,.detail-shot'))?.backgroundColor,text_card:cs(document.querySelector('.text-card'))?.backgroundColor,band:cs(document.querySelector('.hb'))?.backgroundColor};});
      assert.equal(c.scheme,'light',`${route}@${width} color-scheme`);
      assert.equal(c.bg,'rgb(255, 255, 255)',`${route}@${width} background`);
      assert.equal(c.text,'rgb(28, 14, 18)',`${route}@${width} text`);
      if(route.startsWith('/?')||route==='/') {assert.equal(c.card,'rgb(255, 255, 255)',`${route}@${width} card`); assert.equal(c.band,'rgb(229, 57, 53)',`${route}@${width} header`);}
      if(route==='/archive') assert.equal(c.card,'rgb(255, 255, 255)',`archive@${width} table`);
      // Cards without a screenshot use the lavender text surface by design; dark mode must not change it.
      if(c.text_card) assert.equal(c.text_card,lightTextCard[`${route}@${width}`]??(lightTextCard[`${route}@${width}`]=await textCardIn('light',width,route)),`${route}@${width} text card`);
    }
  }
  await dark.close();
});
await check('HTTP 404 branded fallback',async()=> {
  assert.equal(await fs.readFile(path.join(deploy,'404.html'),'utf8'),await fs.readFile(path.join(deploy,'index.html'),'utf8'));
  const fresh=await browser.newContext(); const p=await fresh.newPage();
  try {
    for(const route of ['/loyalty/does-not-exist','/loyalty/does-not-exist/info','/wishlist/does-not-exist/info']) {
      const response=await p.goto(url(route),{waitUntil:'networkidle'});
      assert.equal(response.status(),404);
      await p.getByRole('heading',{name:'Không tìm thấy trang',exact:true}).waitFor({timeout:3000});
      await p.getByRole('link',{name:'← Joy Prototypes',exact:true}).click(); await p.getByRole('heading',{name:'Joy Prototypes',exact:true}).waitFor();
    }
  } finally {await fresh.close();}
});
await check('Excluded names và ảnh registry ≤1600×900',async()=> {
  // privacy/blocklist.json keeps real merchant/brand names and excluded hosts as hashes only.
  const blocklist=loadBlocklist();
  assert(blocklist.keywords.length&&blocklist.hosts.length,'privacy/blocklist.json is empty');
  assert.deepEqual(blockedMatches(registryText,blocklist.keywords),[],'Registry names a real merchant/brand');
  for(const f of features)for(const l of f.legacy)assert(!hostBlocked(l.url,blocklist),`Excluded host: ${l.url}`);
  // A demo built from demos/ can always be photographed (npm run shot); without it the hub shows a large empty text card.
  const missing=features.filter(f=>f.migrated&&!f.quarantined&&!f.shot).map(f=>f.slug);
  assert.deepEqual(missing,[],`Thiếu ảnh thẻ, chạy: npm run shot -- ${missing[0]}`);
  for(const f of features.filter(f=>f.shot)) {
    const {width:w,height:h}=await imageSize(path.join(deploy,f.shot));
    assert(w>0&&h>0&&w<=1600&&h<=900,`${f.shot}: ${w}×${h}`);
  }
});
// Evidence goes to evidence/ (gitignored). Every capture stays ≤2000px.
await fs.mkdir(evidence,{recursive:true});
const captures=[];
for(const scheme of process.env.CHECK_FILTER ? [] : ['light','dark']) {
  await page.emulateMedia({colorScheme:scheme});
  for(const width of [1440,768,375]) {
    await page.setViewportSize({width,height:900});
    for(const [name,route] of [['home','/'],['info','/loyalty/custom-plan/info'],['archive','/archive'],['paused','/?q=pulse'],['sea','/loyalty/sea-survey/info'],['wishlist','/?product=wishlist']]) {
      await go(route);
      const file=path.join(evidence,`${name}-${width}-${scheme}.png`);
      await page.screenshot({path:file,animations:'disabled'});
      const {width:w,height:h}=await imageSize(file);
      assert(w<=2000&&h<=2000,`${file}: ${w}×${h}`);
      captures.push(`${path.basename(file)} ${w}×${h}`);
    }
  }
}
await fs.writeFile(path.join(evidence,'image-dimensions.txt'),captures.join('\n')+'\n');
await browser.close();
console.log(`\n${total-failed}/${total} PASS${failed?`, ${failed} FAIL`:''}. Screenshots: ${evidence}`);
process.exitCode=failed?1:0;
