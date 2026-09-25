/* Node QA script (CommonJS), run outside the app. */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('/Users/adjie/Projects/labstock-pk/node_modules/@playwright/test');
const BASE = process.argv[2] || 'http://localhost:4173';
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  // Desktop interactions
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  let page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + '/workspace/', { waitUntil: 'networkidle' });

  // Every project page opens (no regression)
  for (const title of ['LabStock', 'BDRS', 'SuhuLog', 'Padel Vision', 'ObjectTwin', 'Porsche 3D', 'TomatoVision']) {
    await page.locator('.aw-project-shortcuts button', { hasText: title }).click();
    await page.waitForSelector('.aw-dossier-response, .aw-compact-project', { timeout: 10000 });
    const h = await page.locator('main').first().innerText();
    ok('project opens: ' + title, h.includes(title));
  }
  await page.waitForSelector('.tv-ask');

  const tabs = page.locator('.tv-scene-tabs button');
  ok('03 has 7 configuration tabs', (await tabs.count()) === 7);
  await tabs.nth(0).click();
  ok('03 YOLOv11 tab hides divider', (await page.locator('.tv-scene-stage input').count()) === 0);
  await tabs.nth(4).click();
  const src = await page.locator('.tv-scene-stage > img').getAttribute('src');
  ok('03 Combine 2 tab swaps image', src.includes('demo2-combine2'), src);
  await page.locator('.tv-scene-stage input').fill('20');
  const clip = await page.locator('.tv-scene-baseline').getAttribute('style');
  ok('03 divider moves', /inset\(0(px)? 80% 0(px)? 0(px)?\)/.test(clip), clip);

  await page.locator('.ps-chip', { hasText: 'Training config' }).first().click();
  await page.waitForTimeout(400);
  ok('chip focuses evidence row', await page.evaluate(() => document.activeElement?.id === 'tv-evidence-training'));

  const links = await page.$$eval('.tv-story a[href]', (as) => as.map((a) => a.getAttribute('href')));
  ok('only in-page links on the story', links.every((h) => h.startsWith('#')), links.join(' '));

  // Ask: suggestion routes into the existing Ask flow with the project context
  const requests = [];
  page.on('request', (r) => { if (r.method() === 'POST') requests.push(r.url()); });
  await page.locator('.tv-ask-suggestions button').first().click();
  await page.waitForSelector('.aw-conversation', { timeout: 10000 });
  await page.waitForTimeout(4000);
  const conv = await page.locator('.aw-conversation').innerText();
  ok('ask suggestion opens Ask view with the question', conv.includes('Why does fusion beat the best single model?'));
  ok('ask request sent to configured endpoint', requests.some((u) => u.endsWith('/ask')), requests.join(' '));
  ok('ask returns an answer or the existing error state', /Workspace/.test(conv), conv.slice(0, 300).replace(/\s+/g, ' '));
  await ctx.close();

  // Mobile interactions
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + '/workspace/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open navigation' }).tap();
  await page.locator('.aw-project-shortcuts button', { hasText: 'TomatoVision' }).tap();
  await page.waitForSelector('.tv-ask');
  ok('mobile drawer tap opens TomatoVision', true);
  const seg = page.locator('.ps-segmented button');
  ok('mobile hero defaults to WBF', (await seg.nth(2).getAttribute('aria-selected')) === 'true');
  await seg.nth(0).tap();
  ok('mobile hero switches to baseline', await page.locator('.ps-detection-grid figure.is-active img').getAttribute('src').then((s) => s.includes('demo1-yolov11.webp')));
  ok('mobile P/R hidden by default', !(await page.locator('.ps-table thead th', { hasText: 'Precision' }).isVisible()));
  await page.locator('.ps-table-toggle').tap();
  ok('mobile P/R toggle reveals columns', await page.locator('.ps-table thead th', { hasText: 'Precision' }).isVisible());
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok('mobile no horizontal overflow after toggle', overflow <= 0, String(overflow));
  const small = await page.$$eval('.tv-story button, .tv-story input', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height < 40; }).map((e) => e.textContent.trim() || e.getAttribute('aria-label')));
  ok('mobile controls ≥40px tall (chips excluded)', small.length === 0, small.join(' | '));
  await ctx.close();

  // Legacy route
  ctx = await browser.newContext();
  page = await ctx.newPage();
  await page.goto(BASE + '/projects/tomato-ripeness/');
  await page.waitForURL(/\/workspace\/\?project=tomato-ripeness/, { timeout: 10000 });
  await page.waitForSelector('.tv-ask', { timeout: 10000 });
  ok('legacy /projects/tomato-ripeness/ forwards to the workspace TomatoVision page', true, page.url());
  for (const slug of ['padel-vision', 'suhulog']) {
    const other = await page.goto(BASE + '/projects/' + slug + '/');
    ok('other legacy page unchanged: ' + slug, other.status() === 200 && !page.url().includes('workspace'));
  }
  // Every image the TomatoVision page requests is a demo output
  await page.goto(BASE + '/workspace/?project=tomato-ripeness');
  await page.waitForSelector('.tv-ask');
  const imgs = await page.$$eval('main img', (els) => els.map((e) => e.getAttribute('src')));
  ok('TomatoVision images are demo outputs only', imgs.length > 0 && imgs.every((src) => /research\/demo\d/.test(decodeURIComponent(src))), imgs.join(' '));
  await ctx.close();

  await browser.close();
  ok('no page errors', errors.length === 0, errors.join(' | '));
  for (const r of results) console.log((r.pass ? 'PASS ' : 'FAIL ') + r.name + (r.detail && !r.pass ? '  — ' + r.detail : ''));
  const askDetail = results.find((r) => r.name.startsWith('ask returns'));
  console.log('ASK DETAIL:', askDetail?.detail);
})();
