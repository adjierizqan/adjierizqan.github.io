/* eslint-disable @typescript-eslint/no-require-imports */
// Run against the production static export. Uses the owner's existing Playwright install.
const { chromium, expect } = require(process.env.PLAYWRIGHT_MODULE || '/Users/adjie/Projects/labstock-pk/node_modules/@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const OUT = path.join(__dirname, 'screenshots');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:4179';
fs.mkdirSync(OUT, { recursive: true });
const report = { widths: [], checks: [], errors: [] };
async function section(page, id, filename) {
  await page.locator(id).evaluate(el => el.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, filename) });
}
async function instrument(context) {
  await context.addInitScript(() => {
    window.__audio = { starts: 0, plays: 0, contexts: 0 };
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(...args) { super(...args); window.__audio.contexts++; }
      createBufferSource() { const node = super.createBufferSource(); const start = node.start.bind(node); node.start = (...args) => { window.__audio.starts++; return start(...args); }; return node; }
    };
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(...args) { window.__audio.plays++; return play.apply(this, args); };
  });
}
async function main() {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 834, 390, 320]) {
      const context = await browser.newContext({ viewport: { width, height: width === 834 ? 1112 : 900 }, colorScheme: 'light', reducedMotion: 'no-preference' });
      await instrument(context);
      const page = await context.newPage();
      page.on('pageerror', e => report.errors.push(`${width}: ${e.message}`));
      page.on('console', m => { if (m.type() === 'error') report.errors.push(`${width}: ${m.text()}`); });
      await page.goto(BASE + '/projects/labstock/', { waitUntil: 'networkidle' });
      await expect(page.locator('#ls-title')).toHaveText('LabStock');
      await expect(page.locator('#ls-boundary')).toHaveCount(1);
      await expect(page.getByText('Replay Demo', { exact: true })).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://adjierizqan.github.io/projects/labstock/');
      await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll('.ls-study img')];
        imgs.forEach(img => img.loading = 'eager');
        await Promise.all(imgs.map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
      });
      const audit = await page.evaluate(() => {
        const main = document.querySelector('.aw-labstock-v2');
        return { docOverflow: document.documentElement.scrollWidth - innerWidth, mainOverflow: main.scrollWidth - main.clientWidth,
          mediaWidth: document.querySelector('.ls-hero').clientWidth,
          brokenImages: [...document.querySelectorAll('.ls-study img')].filter(i => !i.naturalWidth).length,
          audioOnLoad: window.__audio, flowStages: document.querySelectorAll('.ls-flow > li').length };
      });
      expect(audit.docOverflow).toBe(0); expect(audit.mainOverflow).toBe(0); expect(audit.brokenImages).toBe(0);
      expect(audit.audioOnLoad).toEqual({ starts: 0, plays: 0, contexts: 0 });
      report.widths.push({ width, ...audit });
      await page.screenshot({ path: path.join(OUT, `${width}-opening.png`) });
      await section(page, '.ls-hero', `${width}-hero-media.png`);
      await page.locator('#ls-stock .ls-screen').first().hover();
      await section(page, '#ls-system', `${width}-flow.png`);
      expect(await page.evaluate(() => window.__audio.starts)).toBe(0);
      await page.getByRole('button', { name: 'Trace the flow' }).click();
      expect(await page.locator('.ls-flow').evaluate(el => el.getAnimations({ subtree: true }).length)).toBeGreaterThan(0);
      await page.waitForTimeout(1800);
      expect(await page.locator('.ls-flow').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
      await section(page, '#ls-decisions', `${width}-engineering.png`);
      await section(page, '#ls-product', `${width}-product.png`);
      await section(page, '#ls-request', `${width}-request.png`);
      await section(page, '#ls-report', `${width}-report.png`);
      await section(page, '#ls-evidence', `${width}-evidence.png`);
      // Quick Look, focus return and Escape.
      const trigger = page.locator('#ls-stock .ls-screen').first();
      await trigger.click();
      await expect(page.getByRole('dialog', { name: 'Project image viewer' })).toBeVisible();
      expect(await page.evaluate(() => window.__audio.starts)).toBe(2);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => window.__audio.starts)).toBe(3);
      const mute = page.getByRole('button', { name: 'Mute UI sounds', exact: true }).filter({ visible: true });
      await mute.click();
      await trigger.click();
      await page.getByRole('button', { name: 'Actual size', exact: true }).click();
      expect(await page.locator('.is-actual-size img').evaluate(el => el.clientWidth)).toBe(1440);
      await page.locator('.is-actual-size').focus();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('.is-actual-size img')).toHaveAttribute('src', '/projects/labstock/stok.webp');
      await page.screenshot({ path: path.join(OUT, `${width}-quick-look-actual.png`) });
      await page.getByRole('button', { name: 'Fit image', exact: true }).click();
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => window.__audio.starts)).toBe(3);
      await page.reload({ waitUntil: 'networkidle' });
      await expect(page.getByRole('button', { name: 'Unmute UI sounds', exact: true }).filter({ visible: true })).toBeVisible();
      expect(await page.evaluate(() => window.__audio)).toEqual({ starts: 0, plays: 0, contexts: 0 });
      await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).filter({ visible: true }).click();
      await page.screenshot({ path: path.join(OUT, `${width}-dark.png`) });
      await section(page, '#ls-system', `${width}-dark-flow.png`);
      await page.getByRole('button', { name: 'Switch to light mode', exact: true }).filter({ visible: true }).click();
      // Desktop dragging; tablet and mobile must keep their position.
      const before = await page.locator('.aw-window').evaluate(el => el.style.transform);
      if (width > 760) {
        const box = await page.locator('.aw-titlebar').boundingBox();
        await page.mouse.move(box.x + 150, box.y + 15); await page.mouse.down(); await page.mouse.move(box.x + 195, box.y + 35, { steps: 5 }); await page.mouse.up();
      } else {
        const box = await page.locator('.aw-mobile-header strong').boundingBox();
        await page.mouse.move(box.x + 5, box.y + 5); await page.mouse.down(); await page.mouse.move(box.x + 40, box.y + 35); await page.mouse.up();
      }
      const after = await page.locator('.aw-window').evaluate(el => el.style.transform);
      if (width >= 1100) expect(after).not.toBe(before); else expect(after).toBe(before);
      await page.reload({ waitUntil: 'networkidle' });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await section(page, '#ls-system', `${width}-reduced-motion.png`);
      await expect(page.getByRole('button', { name: 'Trace the flow' })).toBeHidden();
      expect(await page.locator('.ls-flow > li').count()).toBe(4);
      // Workspace navigation, Back, Forward, refresh.
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      if (width <= 760) await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.locator('.aw-project-shortcuts button', { hasText: 'LabStock' }).click();
      await expect(page).toHaveURL(BASE + '/projects/labstock/');
      await expect(page.locator('#ls-title')).toBeVisible();
      await page.goBack(); await expect(page.locator('#ls-title')).toHaveCount(0);
      await page.goForward(); await expect(page.locator('#ls-title')).toBeVisible();
      await page.reload({ waitUntil: 'networkidle' }); await expect(page.locator('#ls-title')).toBeVisible();
      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('dialog').locator('button').last()).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('dialog').locator('input')).toBeFocused();
      await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
      if (width === 1440) {
        await page.getByRole('button', { name: 'Maximize workspace', exact: true }).click();
        await expect(page.locator('.aw-window')).toHaveClass(/is-maximized/);
        await page.getByRole('button', { name: 'Restore workspace', exact: true }).click();
        await page.getByRole('button', { name: 'Minimize workspace', exact: true }).click();
        await expect(page.locator('.aw-window')).toHaveClass(/is-minimized/);
        await page.locator('.aw-dock').getByRole('button', { name: 'Workspace', exact: true }).click();
        await expect(page.locator('.aw-window')).not.toHaveClass(/is-hidden/);
        await page.getByRole('button', { name: 'Close workspace', exact: true }).click();
        await expect(page.locator('.aw-window')).toHaveClass(/is-closed/);
        await page.locator('.aw-dock').getByRole('button', { name: 'Workspace', exact: true }).click();
        await expect(page.locator('#ls-title')).toBeVisible();
        report.checks.push('Desktop traffic lights, maximize/restore, minimize/close and dock reopening');
      }
      report.checks.push(`${width}: flow, Quick Look/focus/Escape, muted controls, persistence, theme, dragging threshold, reduced motion, canonical navigation, Back/Forward, refresh, palette`);
      if (width === 390) await page.screenshot({ path: path.join(OUT, '390-full.png'), fullPage: true });
      await context.close();
    }
    // No-JS exported route is a complete case study.
    const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const staticPage = await staticContext.newPage(); await staticPage.goto(BASE + '/projects/labstock/');
    for (const id of ['ls-title','ls-system','ls-decisions','ls-product','ls-evidence','ls-boundary']) await expect(staticPage.locator('#' + id)).toHaveCount(1);
    await expect(staticPage.locator('#ls-report .ls-screen')).toHaveAttribute('href', '/projects/labstock/laporan.webp');
    report.checks.push('No JavaScript: complete exported LabStock article and flow; full-source media links work without JS');
    for (const slug of ['bdrs', 'suhulog', 'tomato-ripeness', 'padel-vision', 'porsche-3d']) {
      const response = await staticPage.goto(BASE + '/projects/' + slug + '/');
      expect(response.status()).toBe(200);
      await expect(staticPage.locator('h1')).toHaveCount(1);
      await expect(staticPage.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://adjierizqan.github.io/projects/' + slug + '/');
    }
    report.checks.push('Other five direct project routes: HTTP 200, static heading, unchanged canonical URL');
    await staticContext.close();
    // Audio failure must never break project, theme or viewer controls. Saved music must not autoplay.
    const broken = await browser.newContext();
    await instrument(broken);
    await broken.addInitScript(() => { localStorage.setItem('aw-music', 'on'); window.AudioContext = class { constructor() { throw new Error('Simulated unavailable audio'); } }; });
    const p = await broken.newPage(); p.on('pageerror', e => report.errors.push('audio failure: ' + e.message));
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    expect(await p.evaluate(() => window.__audio.plays)).toBe(0);
    await p.locator('.aw-project-shortcuts button', { hasText: 'LabStock' }).click();
    await expect(p.locator('#ls-title')).toBeVisible();
    await p.locator('#ls-stock .ls-screen').first().click(); await expect(p.getByRole('dialog')).toBeVisible(); await p.keyboard.press('Escape');
    await p.getByRole('button', { name: 'Switch to dark mode', exact: true }).filter({ visible: true }).click();
    expect(await p.locator('html').getAttribute('data-theme')).toBe('dark');
    report.checks.push('Audio constructor failure: project, viewer and theme still work; saved music never plays on load');
    await broken.close();
    expect(report.errors).toEqual([]);
    report.status = 'PASS';
  } finally {
    fs.writeFileSync(path.join(__dirname, 'qa-results.json'), JSON.stringify(report, null, 2) + '\n');
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
