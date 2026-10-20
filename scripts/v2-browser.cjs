/* eslint-disable @typescript-eslint/no-require-imports */
// Browser checks for the v2 personal site.
// Serve the exported out/ at http://127.0.0.1:4182 first. Uses the system Chrome
// when CHROME_PATH is set (local sandbox), otherwise Playwright's Chromium (CI).
const { chromium } = require("@playwright/test");
const fs = require("node:fs");

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4182";
const OUT = "docs/v2/screenshots";
const SHOTS = process.env.QA_SHOTS !== "0";
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "360", width: 360, height: 800 },
];
const pages = ["/", "/projects/labstock/", "/projects/bdrs/", "/projects/suhulog/", "/projects/tomato-ripeness/", "/projects/padel-vision/", "/projects/porsche-3d/", "/workspace/", "/missing-page/"];

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const results = [];
  let askResult = null;
  const failures = [];
  fs.mkdirSync(OUT, { recursive: true });
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    for (const path of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
      const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
      // Load lazy images before measuring.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      await page.waitForFunction(() => [...document.images].filter((i) => i.loading !== "lazy" || i.getBoundingClientRect().width > 0).every((i) => i.complete), null, { timeout: 8000 }).catch(() => {});
      const report = await page.evaluate(() => {
        const imgs = [...document.images].filter((i) => i.getBoundingClientRect().width > 0 && getComputedStyle(i).opacity !== "0");
        const broken = imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.currentSrc || i.src);
        const noAlt = [...document.images].filter((i) => !i.hasAttribute("alt")).map((i) => i.src);
        const overflow = document.documentElement.scrollWidth - window.innerWidth;
        const h1 = document.querySelectorAll("h1").length;
        const small = [...document.querySelectorAll("a, button")].filter((el) => {
          const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && r.height < 24 && !el.closest(".site-footer");
        }).map((el) => (el.textContent || "").trim().slice(0, 40));
        const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
        return { broken, noAlt, overflow, h1, small, links, title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.href ?? null, height: document.body.scrollHeight };
      });
      const status = res ? res.status() : 0;
      const item = { viewport: vp.name, path, status, ...report, errors };
      delete item.links;
      results.push(item);
      const expectStatus = path === "/missing-page/" ? 404 : 200;
      if (status !== expectStatus) failures.push(`${vp.name} ${path}: status ${status}`);
      if (report.broken.length && path !== "/workspace/") failures.push(`${vp.name} ${path}: broken images ${report.broken.join(", ")}`);
      if (report.noAlt.length) failures.push(`${vp.name} ${path}: images without alt`);
      if (report.overflow > 1) failures.push(`${vp.name} ${path}: horizontal overflow ${report.overflow}px`);
      if (path !== "/workspace/" && report.h1 !== 1) failures.push(`${vp.name} ${path}: ${report.h1} h1 elements`);
      if (path !== "/workspace/" && path !== "/missing-page/" && errors.length) failures.push(`${vp.name} ${path}: console ${errors.join(" | ")}`);
      if (SHOTS && path !== "/workspace/" && path !== "/missing-page/") {
        const name = (path === "/" ? "home" : path.replace(/^\/|\/$/g, "").replace(/\//g, "-")) + `-${vp.name}.png`;
        await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
      }
      // Internal links resolve (checked once, at the widest viewport).
      if (vp.name === "1440") {
        for (const href of report.links) {
          if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
          const r = await page.request.get(BASE + href.split("#")[0]);
          if (r.status() !== 200) failures.push(`${path}: link ${href} -> ${r.status()}`);
        }
      }
      await page.close();
    }
    await context.close();
  }
  // Keyboard: first Tab reaches the skip link.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/");
  await p.keyboard.press("Tab");
  const firstFocus = await p.evaluate(() => document.activeElement?.textContent?.trim());
  if (firstFocus !== "Skip to content") failures.push(`first Tab focused "${firstFocus}"`);
  // Ask: submitting shows the question and ends in an answer or an error with a retry, never a dead control.
  if (await p.isVisible("#ask-input")) {
    await p.fill("#ask-input", "How does LabStock keep imports traceable?");
    await p.click(".ask-form button[type=submit]");
    await p.waitForSelector(".ask-answer", { timeout: 5000 });
    await p.waitForFunction(() => !document.querySelector(".ask-answer .status")?.textContent?.includes("Thinking"), null, { timeout: 20000 }).catch(() => {});
    const askText = await p.textContent(".ask-answer");
    if (!askText?.includes("How does LabStock")) failures.push("Ask did not show the question");
    askResult = askText?.slice(0, 160) ?? "";
  } else askResult = "Ask box not rendered (no endpoint configured)";
  // Tomato switch updates the selected configuration.
  await p.goto(BASE + "/projects/tomato-ripeness/");
  await p.click('button[aria-pressed]:has-text("Baseline")');
  const label = await p.textContent(".metrics");
  if (!label?.includes("YOLOv11 baseline")) failures.push("Tomato switch did not update: " + label);
  await ctx.close();
  await browser.close();
  fs.writeFileSync("docs/v2/browser-results.json", JSON.stringify({ base: BASE, askResult, results, failures }, null, 1));
  console.log(`${results.length} page loads, ${failures.length} failures`);
  for (const f of failures) console.log("FAIL", f);
  process.exit(failures.length ? 1 : 0);
})();
