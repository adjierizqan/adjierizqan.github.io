const { chromium } = require('/Users/adjie/Projects/labstock-pk/node_modules/@playwright/test');
const OUT = process.argv[2];
const BASE = process.argv[3] || 'http://localhost:4173';
const fs = require('fs');
fs.mkdirSync(OUT, { recursive: true });

async function openTomato(page, mobile) {
  await page.goto(BASE + '/workspace/', { waitUntil: 'networkidle' });
  if (mobile) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
  }
  await page.locator('.aw-project-shortcuts button', { hasText: 'TomatoVision' }).click();
  await page.waitForSelector('.tv-ask');
  await page.waitForTimeout(600);
  await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll('.tv-story img')];
    imgs.forEach((img) => { img.loading = 'eager'; });
    await Promise.all(imgs.map((img) => img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
  });
}

async function audit(page, label) {
  return page.evaluate((label) => {
    const main = document.querySelector('main.aw-tomato-story');
    const imgs = [...document.querySelectorAll('.tv-story img')];
    const offenders = [...document.querySelectorAll('.tv-story *')].filter((el) => {
      const r = el.getBoundingClientRect();
      const m = main.getBoundingClientRect();
      return r.width > 0 && (r.right > m.right + 1 || r.left < m.left - 1) && !el.closest('.ps-table-scroll, .tv-scene-tabs');
    }).slice(0, 5).map((el) => el.className || el.tagName);
    return {
      label,
      docOverflowX: document.documentElement.scrollWidth - window.innerWidth,
      mainOverflowX: main.scrollWidth - main.clientWidth,
      storyWidth: Math.round(document.querySelector('.tv-story').getBoundingClientRect().width),
      images: imgs.length,
      brokenImages: imgs.filter((img) => !img.naturalWidth).map((img) => img.src),
      offenders,
    };
  }, label);
}

// Capture only: grow the workspace window so the inner scroller shows the whole page.
async function expandInnerScroll(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main.aw-tomato-story');
    const win = document.querySelector('.aw-window');
    const next = win.getBoundingClientRect().height + main.scrollHeight - main.clientHeight;
    win.style.height = next + 'px';
    win.style.maxHeight = 'none';
    return Math.ceil(next);
  });
}

(async () => {
  const browser = await chromium.launch();
  const report = [];
  const errors = [];

  // Desktop 1440
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  let page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push('desktop: ' + m.text()); });
  page.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));
  await openTomato(page, false);
  await page.screenshot({ path: OUT + '/02-tomato-desktop-viewport.png' });
  report.push(await audit(page, 'desktop-1440'));
  const h = await expandInnerScroll(page);
  await page.setViewportSize({ width: 1440, height: h + 120 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '/01-tomato-desktop-1440-full.png' });
  const sections = page.locator('.ps-section');
  await sections.nth(2).screenshot({ path: OUT + '/05-tomato-comparison.png' });
  // 06 = the result progression + 04 Experiments + 05 Accuracy vs speed, stacked (01–03 sit between them on the page)
  await page.locator('.ps-progression').screenshot({ path: OUT + '/_progression.png' });
  const b3 = await sections.nth(3).boundingBox();
  const b4 = await sections.nth(4).boundingBox();
  await page.screenshot({ path: OUT + '/_tables.png', clip: { x: b3.x, y: b3.y, width: b3.width, height: b4.y + b4.height - b3.y } });
  await ctx.close();

  // Tablet 820
  ctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('tablet pageerror: ' + e.message));
  await openTomato(page, false);
  report.push(await audit(page, 'tablet-820'));
  const ht = await expandInnerScroll(page);
  await page.setViewportSize({ width: 820, height: ht + 24 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '/03-tomato-tablet-820.png' });
  await ctx.close();

  // Mobile 390
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message));
  await openTomato(page, true);
  report.push(await audit(page, 'mobile-390'));
  await page.screenshot({ path: OUT + '/04-tomato-mobile-390-full.png', fullPage: true });
  await ctx.close();

  await browser.close();
  console.log(JSON.stringify({ report, errors }, null, 2));
})();
