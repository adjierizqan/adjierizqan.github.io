/* Browser deep-link smoke for the workspace (CommonJS, run outside the app).
   node docs/qa/deeplink-smoke.cjs [baseUrl] [screenshotDir]
   PLAYWRIGHT_PATH may point at a local @playwright/test install. */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "@playwright/test");
const BASE = process.argv[2] || "http://localhost:4173";
const SHOTS = process.argv[3];

// Project-specific content, not just a 200: the dossier's own root class and its title.
const PROJECTS = {
  labstock: { root: "main.aw-labstock-dossier", text: "LabStock" },
  bdrs: { root: "main.aw-bdrs-project", text: "BDRS" },
  suhulog: { root: "main.aw-suhulog-project", text: "SuhuLog" },
  "tomato-ripeness": { root: "main.aw-tomato-story", text: "TomatoVision", extra: ".ps-progression" },
  "padel-vision": { root: "main.aw-padel-project", text: "Padel Vision", extra: ".aw-padel-player" },
  "porsche-3d": { root: "main.aw-porsche-project", text: "Porsche 3D", extra: ".aw-porsche-stage" },
};
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: !!pass, detail });

async function expectProject(page, slug) {
  const p = PROJECTS[slug];
  await page.waitForSelector(p.root, { timeout: 15000 });
  if (p.extra) await page.waitForSelector(p.extra, { timeout: 15000 });
  // Titles stream in after the scripted prompt, so wait for the text rather than reading it once.
  await page.waitForFunction(([root, t]) => document.querySelector(root)?.innerText.includes(t), [p.root, p.text], { timeout: 15000 });
  const text = await page.locator(p.root).innerText();
  const home = await page.locator("main.aw-home").count();
  const selected = await page.locator(".aw-project-shortcuts .is-selected").innerText().catch(() => "");
  return text.includes(p.text) && home === 0 && selected.includes(p.text) && new URL(page.url()).searchParams.get("project") === slug;
}

(async () => {
  const browser = await chromium.launch();
  for (const motion of ["no-preference", "reduce"]) {
    const ctx = await browser.newContext({ viewport: { width: 1536, height: 960 }, reducedMotion: motion });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const slug of Object.keys(PROJECTS)) {
      await page.goto(`${BASE}/workspace/?project=${slug}`, { waitUntil: "networkidle" });
      check(`${motion}: direct ${slug}`, await expectProject(page, slug).catch(() => false));
      await page.reload({ waitUntil: "networkidle" });
      check(`${motion}: refresh ${slug}`, await expectProject(page, slug).catch(() => false));
    }
    // sidebar -> URL, Back/Forward, Home clears the param
    await page.goto(`${BASE}/workspace/`, { waitUntil: "networkidle" });
    await page.locator(".aw-project-shortcuts button", { hasText: "TomatoVision" }).click();
    check(`${motion}: sidebar Tomato updates URL + content`, await expectProject(page, "tomato-ripeness").catch(() => false));
    await page.locator(".aw-project-shortcuts button", { hasText: "LabStock" }).click();
    check(`${motion}: sidebar LabStock updates URL + content`, await expectProject(page, "labstock").catch(() => false));
    await page.goBack();
    check(`${motion}: Back -> Tomato`, await expectProject(page, "tomato-ripeness").catch(() => false));
    await page.goBack();
    await page.waitForSelector("main.aw-home", { timeout: 10000 }).catch(() => null);
    check(`${motion}: Back -> Home`, (await page.locator("main.aw-home").count()) === 1 && !page.url().includes("project="));
    await page.goForward();
    check(`${motion}: Forward -> Tomato`, await expectProject(page, "tomato-ripeness").catch(() => false));
    await page.locator(".aw-primary-nav button", { hasText: "Home" }).click();
    await page.waitForSelector("main.aw-home", { timeout: 10000 }).catch(() => null);
    check(`${motion}: Home clears project`, (await page.locator("main.aw-home").count()) === 1 && !page.url().includes("project="), page.url());
    await page.locator(".aw-primary-nav button", { hasText: "Work" }).click();
    check(`${motion}: Work view without param`, (await page.locator("main.aw-work").count()) === 1 && !page.url().includes("project="));
    await page.goto(`${BASE}/workspace/?project=objecttwin`, { waitUntil: "networkidle" });
    check(`${motion}: unknown project falls back to Home`, (await page.locator("main.aw-home").count()) === 1);
    check(`${motion}: no page errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }

  if (SHOTS) {
    const shot = async (w, h, url, file, opts = {}) => {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.dpr || 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
      const page = await ctx.newPage();
      await page.goto(BASE + url, { waitUntil: "networkidle" });
      if (opts.reload) await page.reload({ waitUntil: "networkidle" });
      if (opts.wait) await page.waitForSelector(opts.wait, { timeout: 15000 });
      await page.waitForTimeout(opts.settle ?? 5200);
      const box = await page.locator(".aw-window").boundingBox().catch(() => null);
      if (box) console.log(`${file}: window ${Math.round(box.width)}x${Math.round(box.height)} at ${Math.round(box.x)},${Math.round(box.y)} in ${w}x${h}`);
      await page.screenshot({ path: `${SHOTS}/${file}`, fullPage: !!opts.full });
      await ctx.close();
    };
    await shot(1536, 960, "/workspace/", "01-workspace-home-1536.png", { settle: 800 });
    await shot(1536, 960, "/workspace/?project=tomato-ripeness", "02-tomato-direct-link-1536.png", { wait: ".ps-progression" });
    await shot(1536, 960, "/workspace/?project=tomato-ripeness", "03-tomato-refresh-1536.png", { reload: true, wait: ".ps-progression" });
    await shot(1440, 900, "/workspace/?project=labstock", "04-labstock-direct-link-1440.png", { wait: "main.aw-labstock-dossier" });
    await shot(820, 1180, "/workspace/?project=tomato-ripeness", "05-workspace-tablet-820.png", { wait: ".ps-progression" });
    await shot(390, 844, "/workspace/?project=tomato-ripeness", "06-workspace-mobile-390.png", { wait: ".ps-progression", dpr: 2, mobile: true });
  }
  await browser.close();
  for (const r of results) console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.pass ? "" : "  " + r.detail));
  console.log(results.every((r) => r.pass) ? "ALL PASS" : "FAILURES");
  process.exitCode = results.every((r) => r.pass) ? 0 : 1;
})();
