// Browser test of the golden starter (/starter/, built from templates/demo) and a smoke test of every demo the hub builds.
// Usage: node test/starter-check.mjs <base url>   (npm run check serves dist/hub and passes it)
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4173');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = process.env.STARTER_CHECK_EVIDENCE || path.join(root, 'evidence/starter');
await fs.mkdir(evidence, {recursive: true});
const registry = JSON.parse(await fs.readFile(path.join(root, 'dist/hub/registry.json'), 'utf8'));
const STARTER = new URL('/starter/', base).href;
const WIDTHS = [375, 768, 1440];
// Visible text that means data or copy is missing.
const PLACEHOLDER = /lorem ipsum|\bTODO\b|\bFIXME\b|__[A-Z_]{3,}__|\bundefined\b|\bNaN\b|\[object Object\]/i;
// Fonts are the only outside requests a demo may make (Google Fonts, SIL OFL); the starter makes none.
const FONT_HOSTS = new Set(['https://fonts.googleapis.com', 'https://fonts.gstatic.com']);

const browser = await chromium.launch({headless: true});
let failed = 0, total = 0;
async function check(label, fn) {
  if (process.env.CHECK_FILTER && !label.includes(process.env.CHECK_FILTER)) return;
  total++;
  try {const note = await fn(); console.log(`PASS ${total}. ${label}${note ? ` — ${note}` : ''}`);}
  catch (error) {failed++; console.log(`FAIL ${total}. ${label}\n  ${String(error.stack).split('\n').slice(0, 4).join('\n  ')}`);}
}
async function session(width = 1440, height = 900) {
  const context = await browser.newContext({viewport: {width, height}, colorScheme: 'light', reducedMotion: 'reduce'});
  const page = await context.newPage();
  const errors = [], outside = new Set();
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {if (msg.type() === 'error') errors.push(msg.text());});
  page.on('request', request => {const u = new URL(request.url()); if (u.protocol.startsWith('http') && u.origin !== base.origin) outside.add(u.origin);});
  return {context, page, errors, outside};
}
async function open(page, hash) {
  await page.goto('about:blank'); // a fresh load each time: a hash-only change would not reload the prototype
  const response = await page.goto(`${STARTER}#${hash}`, {waitUntil: 'networkidle'});
  assert(response.ok(), `HTTP ${response.status()} for ${hash}`);
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
async function healthy(page, label) {
  const report = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth - window.innerWidth,
    text: document.body.innerText,
    broken: [...document.images].filter(img => img.complete && img.naturalWidth === 0).map(img => img.src),
  }));
  assert(report.scroll <= 0, `${label}: horizontal scroll of ${report.scroll}px`);
  const hit = report.text.match(PLACEHOLDER);
  assert(!hit, `${label}: placeholder text "${hit?.[0]}"`);
  assert.deepEqual(report.broken, [], `${label}: broken images`);
}
const shot = (page, name) => page.screenshot({path: path.join(evidence, `${name}.png`)}); // viewport only: ≤ 1440×900

await check('Routes: list, create, edit, components, not found — no errors, nothing loaded from outside', async () => {
  const {context, page, errors, outside} = await session();
  try {
    for (const [hash, heading] of [['/demo', 'Rewards'], ['/demo/new', 'Create reward'], ['/demo/r1', '$5 off your next order'], ['/kit', 'Components and tokens'], ['/nope', 'Page not found'], ['/demo/zzz', 'Reward not found']]) {
      await open(page, hash);
      await page.getByRole('heading', {name: heading, exact: true}).first().waitFor({timeout: 5000});
      await healthy(page, hash);
    }
    assert.deepEqual(errors, []);
    assert.deepEqual([...outside], [], 'the starter must not call any other origin');
    assert.equal(await page.title(), 'Starter kit · Joy prototype', 'document title comes from demo.config.js');
  } finally {await context.close();}
});

await check('Nine states: default, empty, loading, error, disabled, overflow, worst (+ hover, focus below) on desktop and phone', async () => {
  const expectations = {
    default: async page => assert.equal(await page.locator('[data-primary-link]').count(), 5),
    empty: async page => {await page.locator('[data-state-view="empty"]').waitFor(); await page.getByRole('heading', {name: 'Create your first reward'}).waitFor();},
    loading: async page => {await page.locator('[data-state-view="loading"][aria-busy="true"]').waitFor(); assert(await page.getByRole('button', {name: 'Create reward'}).isDisabled());},
    error: async page => {await page.locator('[data-state-view="error"]').waitFor(); await page.getByRole('button', {name: 'Try again'}).waitFor();},
    disabled: async page => {await page.getByText('Editing rewards needs the Advanced plan').waitFor(); assert(await page.getByRole('button', {name: 'Create reward'}).isDisabled());},
    overflow: async page => {await page.getByText('$25 off the Glow Getter Set', {exact: false}).first().waitFor();},
    worst: async page => {await page.getByText('2 rewards failed to sync').waitFor(); await page.getByText('1–10 of 29').waitFor();},
  };
  for (const width of [1440, 375]) {
    const {context, page, errors} = await session(width);
    try {
      for (const [state, expect] of Object.entries(expectations)) {
        await open(page, `/demo?state=${state}`);
        await expect(page);
        await healthy(page, `${state}@${width}`);
        await shot(page, `list-${state}-${width}`);
      }
      assert.deepEqual(errors, []);
    } finally {await context.close();}
  }
});

await check('Error state recovers with Try again; worst case pages through all rows', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo?state=error');
    await page.getByRole('button', {name: 'Try again'}).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-primary-link]').length === 5);
    assert(!page.url().includes('state='), 'Try again returns to the default state');
    await open(page, '/demo?state=worst');
    await page.getByRole('button', {name: 'Next'}).click();
    await page.getByText('11–20 of 29').waitFor();
  } finally {await context.close();}
});

await check('Tabs and search filter the table; no match shows the empty search result', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo');
    await page.getByRole('tab', {name: /Active rewards/}).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-primary-link]').length === 3);
    await page.getByRole('tab', {name: /All rewards/}).click();
    await page.getByLabel('Search rewards').fill('free');
    await page.waitForFunction(() => document.querySelectorAll('[data-primary-link]').length === 2);
    await page.getByLabel('Search rewards').fill('zzz');
    await page.getByText('No rewards match').waitFor();
    await healthy(page, 'no-match');
  } finally {await context.close();}
});

await check('Create: validation errors, focus on the first bad field, save toast, new row on the list', async () => {
  const {context, page, errors} = await session();
  try {
    await open(page, '/demo');
    await page.getByRole('link', {name: 'Create reward'}).click();
    await page.getByRole('heading', {name: 'Create reward'}).waitFor();
    await page.getByLabel('Reward name').fill('');
    await page.getByRole('button', {name: 'Save'}).click();
    await page.getByText('Enter a reward name').waitFor();
    await page.getByText(/field needs attention before you save/).waitFor();
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-invalid')), 'true', 'focus moves to the invalid field');
    await shot(page, 'create-errors-1440');
    await page.getByLabel('Reward name').fill('Birthday treat');
    await page.getByLabel('Points cost').fill('750');
    await page.getByRole('button', {name: 'Save'}).click();
    await page.getByText('Reward created').waitFor();
    await page.getByRole('heading', {name: 'Birthday treat'}).waitFor();
    assert.match(page.url(), /#\/demo\/n\d+/);
    await page.getByRole('link', {name: 'Rewards'}).first().click();
    await page.getByRole('link', {name: 'Birthday treat'}).waitFor();
    assert.deepEqual(errors, []);
  } finally {await context.close();}
});

await check('Edit: Save disabled until something changes, then saves; disabled state locks every field', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo/r1');
    const save = page.getByRole('button', {name: 'Save'});
    assert(await save.isDisabled(), 'Save starts disabled');
    await page.getByLabel('Points cost').fill('550');
    assert(await save.isEnabled(), 'Save enables after a change');
    await save.click();
    await page.getByText('Reward saved').waitFor();
    await open(page, '/demo/r1?state=disabled');
    for (const label of ['Reward name', 'Points cost', 'Discount amount']) assert(await page.getByLabel(label).isDisabled(), `${label} disabled`);
    assert(await page.getByRole('button', {name: 'Delete'}).isDisabled());
    await shot(page, 'edit-disabled-1440');
  } finally {await context.close();}
});

await check('Modal: delete asks first, Esc cancels, confirm deletes and returns to the list', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo/r3');
    await page.getByRole('button', {name: 'Delete'}).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert(await dialog.evaluate(node => node.contains(document.activeElement)), 'focus moves into the modal');
    await page.keyboard.press('Escape');
    await dialog.waitFor({state: 'detached'});
    await page.getByRole('button', {name: 'Delete'}).click();
    await page.getByRole('button', {name: 'Delete reward'}).click();
    await page.getByText('Reward deleted').waitFor();
    await page.getByRole('heading', {name: 'Rewards', exact: true}).waitFor();
    assert.equal(await page.getByRole('link', {name: 'Free shipping', exact: true}).count(), 0);
  } finally {await context.close();}
});

await check('Drawer: focus moves in, Tab stays inside, Esc closes, focus returns to the opener', async () => {
  for (const width of [1440, 375]) {
    const {context, page} = await session(width);
    try {
      await open(page, '/demo/r1');
      const opener = width === 1440 ? page.getByRole('button', {name: 'View activity'}) : null;
      if (opener) await opener.click();
      else {
        await page.getByRole('button', {name: /^(More actions|View actions)/}).click();
        await page.getByRole('button', {name: 'View activity'}).click();
      }
      const drawer = page.getByRole('dialog', {name: 'Activity'});
      await drawer.waitFor();
      await page.getByText('Changed points from 400 to 500').waitFor();
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        assert(await drawer.evaluate(node => node.contains(document.activeElement)), `Tab ${i + 1} left the drawer`);
      }
      const ring = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
      assert.notEqual(ring, 'none', 'focused control shows an outline');
      await shot(page, `drawer-${width}`);
      await page.keyboard.press('Escape');
      await drawer.waitFor({state: 'detached'});
      // Focus comes back on the next frame (the page actions may re-render when the scroll lock is released).
      if (opener) await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'View activity', null, {timeout: 1000});
    } finally {await context.close();}
  }
});

await check('Keyboard: Tab reaches the primary action and every row link, each with a visible focus ring', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo');
    const reached = new Set();
    for (let i = 0; i < 80 && reached.size < 6; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el), after = getComputedStyle(el, '::after');
        // Polaris draws a text field's ring on its backdrop, a button's on ::after, ours as an outline.
        const backdrop = el.closest('.Polaris-TextField')?.querySelector('.Polaris-TextField__Backdrop');
        const ring = style.outlineStyle !== 'none' || style.boxShadow !== 'none' || (after.content !== 'none' && (after.boxShadow !== 'none' || after.outlineStyle !== 'none'))
          || (backdrop && getComputedStyle(backdrop).outlineStyle !== 'none');
        return {tag: `${el.tagName}.${el.className}`, text: el.textContent.trim(), primary: el.hasAttribute('data-primary-link'), visible: box.width > 0 && box.height > 0, ring, focusVisible: el.matches(':focus-visible')};
      });
      assert(info.visible, `focused element has no size: ${info.text}`);
      assert(info.focusVisible && info.ring, `no visible focus ring on "${info.text}" (${info.tag})`);
      if (info.text === 'Create reward' || info.primary) reached.add(info.text);
    }
    assert(reached.has('Create reward'), 'Create reward reachable by Tab');
    assert(reached.size >= 6, `row links reached by Tab: ${[...reached].join(', ')}`);
    await page.keyboard.press('Enter');
    await page.locator('h1').filter({hasNotText: 'Rewards'}).first().waitFor();
    assert.match(page.url(), /#\/demo\/r\d/, 'Enter on a row link opens it');
  } finally {await context.close();}
});

await check('Hover changes a table row and a button (hover state)', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo');
    const row = page.locator('[data-primary-link]').first().locator('xpath=ancestor::tr');
    const before = await row.evaluate(node => getComputedStyle(node).backgroundColor);
    await row.hover();
    await page.waitForTimeout(150);
    const after = await row.evaluate(node => getComputedStyle(node).backgroundColor);
    assert.notEqual(after, before, 'row background changes on hover');
    const toggle = page.getByRole('button', {name: /^Prototype/});
    const filterBefore = await toggle.evaluate(node => getComputedStyle(node).filter);
    await toggle.hover();
    assert.notEqual(await toggle.evaluate(node => getComputedStyle(node).filter), filterBefore);
  } finally {await context.close();}
});

await check('Phone: the menu button opens the nav drawer, Esc closes it, closed nav takes no focus', async () => {
  const {context, page} = await session(375);
  try {
    await open(page, '/demo');
    const nav = page.locator('nav.adm-nav');
    assert.equal(await nav.evaluate(node => getComputedStyle(node).visibility), 'hidden');
    await page.getByRole('button', {name: 'Open navigation'}).click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.adm-nav')).visibility === 'visible');
    assert(await nav.evaluate(node => node.contains(document.activeElement)), 'focus moves into the nav');
    await shot(page, 'nav-open-375');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.adm-nav')).visibility === 'hidden');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Open navigation');
  } finally {await context.close();}
});

await check('Regression B3: phone controls clear toasts and hide behind navigation', async () => {
  // Review 26/10 (B3): at 375 the amber pill covered list rows, the save toast and the open nav drawer.
  const {context, page} = await session(375, 812);
  const box = locator => locator.boundingBox();
  const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  try {
    await open(page, '/demo');
    const toggle = page.getByRole('button', {name: /^Prototype/});
    const t = await box(toggle);
    assert(t.width <= 110 && t.height <= 32, `toggle is ${t.width}×${t.height}`);
    assert.equal((await toggle.innerText()).trim(), 'Prototype', 'the word stays visible on phones (Alex 20/10)');
    assert(t.x + t.width > 375 - 24, 'toggle sits in the right corner');
    await page.getByRole('link', {name: 'Create reward'}).click();
    await page.getByRole('heading', {name: 'Create reward'}).waitFor();
    await page.getByRole('button', {name: 'Save'}).click();
    const toast = page.locator('.Polaris-Frame-Toast');
    await toast.waitFor();
    await page.waitForTimeout(500); // Polaris toast slide-in
    assert(!overlap(await box(toggle), await box(toast)), 'toggle covers the toast');
    await shot(page, 'proto-toast-375');
    await open(page, '/demo?state=empty');
    assert.equal(await toggle.textContent(), 'Prototype · Empty', 'label stays for screen readers');
    assert(await page.locator('.kit-proto__dot').isVisible(), 'a dot marks a non-default state');
    await page.getByRole('button', {name: 'Open navigation'}).click();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.adm-nav')).visibility === 'visible');
    assert(!await toggle.isVisible(), 'toggle must hide when navigation is open');
    await page.keyboard.press('Escape');
    assert(await toggle.isVisible(), 'toggle returns after navigation closes');
    await shot(page, 'proto-nav-375');
  } finally {await context.close();}
});

await check('Regression B3: scrolling rows and checkbox labels stay outside the control lane', async () => {
  const {context, page} = await session(375, 812);
  try {
    await open(page, '/demo?state=worst');
    const content = page.locator('.adm-content');
    const toggle = page.getByRole('button', {name: /^Prototype/});
    for (const fraction of [0, 0.5, 1]) {
      await content.evaluate((node, f) => {node.scrollTop = (node.scrollHeight - node.clientHeight) * f;}, fraction);
      const viewport = await content.boundingBox();
      const button = await toggle.boundingBox();
      assert(viewport.y + viewport.height <= button.y, `scroll ${fraction}: product viewport overlaps reviewer control`);
      if (fraction === 0.5) assert(await content.evaluate(node => node.scrollTop > 0), 'test must actually scroll');
      await shot(page, `proto-list-scroll-${fraction}-375`);
    }
    await open(page, '/demo');
    await page.getByRole('link', {name: 'Create reward'}).click();
    const label = page.getByText('Show in the loyalty widget', {exact: true});
    await label.scrollIntoViewIfNeeded();
    const labelBox = await label.boundingBox();
    const button = await toggle.boundingBox();
    assert(labelBox.y + labelBox.height <= button.y, 'checkbox label goes underneath the control');
    await shot(page, 'proto-checkbox-375');
    await page.getByRole('link', {name: 'Rewards', exact: true}).first().click();
    assert.equal(await content.evaluate(node => node.scrollTop), 0, 'real navigation resets the phone content scroll');
  } finally {await context.close();}
});

await check('Regression B3: card screenshot mode omits reviewer controls', async () => {
  const {context, page} = await session(1280, 720);
  try {
    await page.goto(`${STARTER}?shot=1#/demo`, {waitUntil: 'networkidle'});
    await page.getByRole('heading', {name: 'Rewards', exact: true}).waitFor();
    assert.equal(await page.locator('.kit-proto').count(), 0, 'shot=1 must omit controls, not merely crop them');
    await shot(page, 'card-without-controls');
  } finally {await context.close();}
});

await check('Regression B5: state responds to hash edits and Back/Forward without reloading', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo');
    await page.evaluate(() => {window.__sameDocument = true; window.location.hash = '/demo?state=empty';});
    await page.locator('[data-state-view="empty"]').waitFor({timeout: 3000});
    await page.evaluate(() => {window.location.hash = '/demo?state=error';});
    await page.locator('[data-state-view="error"]').waitFor({timeout: 3000});
    await page.goBack();
    await page.locator('[data-state-view="empty"]').waitFor({timeout: 3000});
    await page.goForward();
    await page.locator('[data-state-view="error"]').waitFor({timeout: 3000});
    await page.evaluate(() => {window.location.hash = '/demo?state=unknown';});
    await page.waitForFunction(() => document.querySelectorAll('[data-primary-link]').length === 5, null, {timeout: 3000});
    assert(await page.evaluate(() => window.__sameDocument), 'state changes must not reload the tab');
  } finally {await context.close();}
});

await check('Regression B5: state before hash updates on popstate in the same tab', async () => {
  const {context, page} = await session();
  try {
    await page.goto(`${STARTER}?state=empty#/demo`, {waitUntil: 'networkidle'});
    await page.evaluate(() => {
      history.pushState(null, '', '?state=error#/demo');
      dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.locator('[data-state-view="error"]').waitFor({timeout: 3000});
    await page.goBack();
    await page.locator('[data-state-view="empty"]').waitFor({timeout: 3000});
    await page.goForward();
    await page.locator('[data-state-view="error"]').waitFor({timeout: 3000});
  } finally {await context.close();}
});

await check('Prototype panel switches state, Esc closes it, focus returns to its button', async () => {
  const {context, page} = await session();
  try {
    await open(page, '/demo');
    await page.getByRole('button', {name: 'Prototype'}).click();
    await page.getByRole('group', {name: 'Prototype settings'}).waitFor();
    await page.getByLabel(/^Empty/).check();
    await page.locator('[data-state-view="empty"]').waitFor();
    assert.match(page.url(), /state=empty/, 'state is shareable in the URL');
    await page.keyboard.press('Escape');
    assert.match(await page.evaluate(() => document.activeElement?.textContent), /Prototype · Empty/);
    await page.getByRole('button', {name: /Prototype/}).click();
    await page.getByRole('link', {name: /Components and tokens/}).click();
    await page.getByRole('heading', {name: 'Components and tokens'}).waitFor();
  } finally {await context.close();}
});

await check('A state typed before the # works too, and switching state drops it', async () => {
  const {context, page} = await session();
  try {
    await page.goto(`${STARTER}?state=empty#/demo`, {waitUntil: 'networkidle'});
    await page.locator('[data-state-view="empty"]').waitFor();
    await page.getByRole('button', {name: /Prototype/}).click();
    await page.getByLabel(/^Error/).check();
    await page.locator('[data-state-view="error"]').waitFor();
    const url = new URL(page.url());
    assert.equal(url.searchParams.get('state'), null, 'no stale ?state= left before the #');
    assert.match(url.hash, /state=error/);
  } finally {await context.close();}
});

await check('Components page: every overlay works (toast, error toast, modal, drawer)', async () => {
  const {context, page, errors} = await session();
  try {
    await open(page, '/kit');
    await page.getByRole('button', {name: 'Show toast'}).click();
    await page.getByText('Reward saved').waitFor();
    await page.getByRole('button', {name: 'Show error toast'}).click();
    await page.getByText('Couldn’t save reward').waitFor();
    await page.getByRole('button', {name: 'Open modal'}).click();
    await page.getByRole('dialog').waitFor();
    await page.getByRole('button', {name: 'Cancel'}).click();
    await page.getByRole('button', {name: 'Open drawer'}).click();
    await page.getByRole('dialog', {name: 'Drawer'}).waitFor();
    await page.getByRole('button', {name: 'Apply'}).click();
    await page.locator('.Polaris-Frame-Toast').getByText('Applied').waitFor();
    await shot(page, 'kit-1440');
    assert.deepEqual(errors, []);
  } finally {await context.close();}
});

await check('Responsive: every starter screen at 375 / 768 / 1440 has no sideways scroll or placeholder text', async () => {
  for (const width of WIDTHS) {
    const {context, page} = await session(width);
    try {
      for (const hash of ['/demo', '/demo/new', '/demo/r1', '/demo/r1?state=overflow', '/demo/o1?state=overflow', '/kit', '/demo?state=worst']) {
        await open(page, hash);
        await healthy(page, `${hash}@${width}`);
      }
      await open(page, '/demo/r1');
      await shot(page, `edit-${width}`);
    } finally {await context.close();}
  }
});

await check('Every demo the hub builds opens with no errors, fonts as the only outside requests, no sideways scroll', async () => {
  const demos = registry.features.filter(f => f.migrated && !f.quarantined);
  assert(demos.length >= 1);
  for (const f of demos) for (const width of [375, 1440]) {
    const {context, page, errors, outside} = await session(width);
    try {
      const response = await page.goto(new URL(`/${f.product}/${f.slug}/`, base).href, {waitUntil: 'networkidle'});
      assert(response.ok(), `${f.slug}: HTTP ${response.status()}`);
      await page.locator('#root *').first().waitFor();
      await healthy(page, `${f.slug}@${width}`);
      assert.deepEqual(errors, [], `${f.slug}: page errors`);
      assert.deepEqual([...outside].filter(origin => !FONT_HOSTS.has(origin)), [], `${f.slug}: outside requests`);
    } finally {await context.close();}
  }
  return demos.map(f => f.slug).join(', ');
});

await browser.close();
console.log(`${total - failed}/${total} PASS (starter). Screenshots: ${evidence}`);
process.exit(failed ? 1 : 0);
