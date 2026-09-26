/* Theme + Padel replay browser checks (CommonJS, run outside the app).
   node docs/qa/theme-video-smoke.cjs [baseUrl]   (PLAYWRIGHT_PATH may point at @playwright/test) */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "@playwright/test");
const BASE = process.argv[2] || "http://localhost:4173";
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: !!pass, detail });
const themeOf = (page) => page.evaluate(() => document.documentElement.dataset.theme);
const bg = (page) => page.evaluate(() => getComputedStyle(document.querySelector(".aw-stage")).backgroundColor);

(async () => {
  const browser = await chromium.launch();
  // first visit follows the system
  for (const scheme of ["dark", "light"]) {
    const ctx = await browser.newContext({ colorScheme: scheme });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    check(`system ${scheme}: theme before hydration`, (await themeOf(page)) === scheme);
    await page.waitForLoadState("networkidle");
    check(`system ${scheme}: stage colour`, scheme === "dark" ? (await bg(page)) !== "rgb(255, 255, 255)" : (await bg(page)) === "rgb(255, 255, 255)", await bg(page));
    await ctx.close();
  }
  // manual switch, persistence, deep link, back/forward
  {
    const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/?project=tomato-ripeness", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Switch to dark mode" }).first().click();
    check("manual switch to dark", (await themeOf(page)) === "dark" && (await page.evaluate(() => localStorage.getItem("aw-theme"))) === "dark");
    check("toggle reflects state", (await page.getByRole("button", { name: "Switch to light mode" }).count()) >= 1);
    await page.reload({ waitUntil: "domcontentloaded" });
    check("refresh keeps dark (before hydration)", (await themeOf(page)) === "dark");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("main.aw-tomato-story");
    await page.locator(".aw-project-shortcuts button", { hasText: "LabStock" }).click();
    await page.waitForURL(/project=labstock/);
    await page.goBack();
    await page.waitForURL(/project=tomato-ripeness/);
    await page.waitForSelector("main.aw-tomato-story");
    check("back/forward keeps dark", (await themeOf(page)) === "dark" && page.url().includes("tomato-ripeness"));
    await page.goto(BASE + "/?project=bdrs", { waitUntil: "domcontentloaded" });
    check("direct project URL keeps dark", (await themeOf(page)) === "dark");
    await page.getByRole("button", { name: "Switch to light mode" }).first().click();
    await page.reload({ waitUntil: "domcontentloaded" });
    check("switch back to light persists", (await themeOf(page)) === "light");
    await ctx.close();
  }
  // explicit choice beats the system
  {
    const ctx = await browser.newContext({ colorScheme: "dark" });
    await ctx.addInitScript(() => localStorage.setItem("aw-theme", "light"));
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    check("saved light beats system dark", (await themeOf(page)) === "light");
    await ctx.close();
  }
  // mobile toggle
  {
    const ctx = await browser.newContext({ colorScheme: "light", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const btn = page.locator(".aw-mobile-theme");
    const box = await btn.boundingBox();
    await btn.tap();
    check("mobile toggle switches theme", (await themeOf(page)) === "dark");
    check("mobile toggle ≥ 44px", box && box.width >= 44 && box.height >= 44, JSON.stringify(box));
    await ctx.close();
  }
  // Padel replay
  for (const motion of ["no-preference", "reduce"]) {
    const ctx = await browser.newContext({ reducedMotion: motion, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/?project=padel-vision", { waitUntil: "networkidle" });
    await page.waitForSelector(".aw-padel-replay video", { timeout: 15000 });
    await page.waitForTimeout(800);
    const t0 = await page.evaluate(() => document.querySelector(".aw-padel-replay video").currentTime);
    await page.waitForTimeout(1500);
    const t1 = await page.evaluate(() => document.querySelector(".aw-padel-replay video").currentTime);
    if (motion === "no-preference") {
      check("padel autoplays: currentTime advances", t1 > t0 + 0.8, `${t0.toFixed(2)} -> ${t1.toFixed(2)}`);
      await page.getByRole("button", { name: "Pause replay" }).click();
      const p0 = await page.evaluate(() => document.querySelector(".aw-padel-replay video").currentTime);
      await page.waitForTimeout(800);
      const p1 = await page.evaluate(() => document.querySelector(".aw-padel-replay video").currentTime);
      check("padel pause stops motion", Math.abs(p1 - p0) < 0.05 && (await page.locator(".aw-padel-replay-start").count()) === 1);
      await page.locator(".aw-padel-replay-start").click();
      await page.waitForTimeout(800);
      check("padel manual play resumes", await page.evaluate(() => !document.querySelector(".aw-padel-replay video").paused));
      const bar = await page.evaluate(() => getComputedStyle(document.querySelector(".aw-padel-replay-track > span")).transform);
      check("padel progress bar moves", bar !== "none" && bar !== "matrix(0, 0, 0, 1, 0, 0)", bar);
    } else {
      check("reduced motion: no autoplay", t1 === 0 && t0 === 0);
      check("reduced motion: Play replay offered", (await page.locator(".aw-padel-replay-start").count()) === 1);
      await page.locator(".aw-padel-replay-start").click();
      await page.waitForTimeout(1200);
      check("reduced motion: voluntary play works", await page.evaluate(() => document.querySelector(".aw-padel-replay video").currentTime > 0.5));
    }
    await ctx.close();
  }
  await browser.close();
  for (const r of results) console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.pass ? "" : "  " + r.detail));
  console.log(results.every((r) => r.pass) ? "ALL PASS" : "FAILURES");
  process.exitCode = results.every((r) => r.pass) ? 0 : 1;
})();
