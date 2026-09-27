/* EN/ID, music, Padel analyzed-clip and Knowledge browser checks (CommonJS, run outside the app).
   node docs/qa/locale-music-smoke.cjs [baseUrl] [screenshotDir]   (PLAYWRIGHT_PATH may point at @playwright/test) */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "@playwright/test");
const BASE = process.argv[2] || "http://localhost:4173";
const SHOTS = process.argv[3];
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: !!pass, detail });
const lang = (page) => page.evaluate(() => document.documentElement.lang);
// The music element is created with new Audio() and never attached, so record every audio element that is played.
const trackAudio = () => { window.__audio = new Set(); const play = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { if (this instanceof HTMLAudioElement) window.__audio.add(this); return play.call(this); }; };
const audioPlaying = (page) => page.evaluate(() => [...window.__audio].some((a) => !a.paused));

(async () => {
  const browser = await chromium.launch();
  // EN default, switch to ID, persistence, deep link, back/forward
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    check("default EN", (await lang(page)) === "en" && (await page.locator(".aw-primary-nav").innerText()).includes("Home"));
    await page.locator(".aw-title-actions .aw-lang button", { hasText: "ID" }).click();
    await page.waitForTimeout(300);
    const nav = await page.locator(".aw-primary-nav").innerText();
    check("switch to ID translates the shell", (await lang(page)) === "id" && nav.includes("Beranda") && nav.includes("Karya"), nav.replace(/\s+/g, " "));
    check("choice stored", (await page.evaluate(() => localStorage.getItem("aw-locale"))) === "id");
    await page.reload({ waitUntil: "domcontentloaded" });
    check("ID survives reload (before hydration)", (await lang(page)) === "id");
    await page.goto(BASE + "/?project=tomato-ripeness", { waitUntil: "networkidle" });
    await page.waitForSelector(".ps-progression");
    const tomato = await page.locator("main.aw-tomato-story").innerText();
    check("TomatoVision in Indonesian, terms kept", tomato.includes("Deteksi tiga tingkat kematangan") && tomato.includes("Weighted Boxes Fusion") && tomato.includes("mAP@0.5"));
    await page.locator(".aw-project-shortcuts button", { hasText: "SuhuLog" }).click();
    await page.waitForURL(/suhulog/);
    await page.waitForSelector("main.aw-suhulog-project");
    await page.waitForFunction(() => document.querySelector("main.aw-suhulog-project")?.innerText.includes("Sistem pencatatan suhu"), null, { timeout: 15000 });
    check("SuhuLog in Indonesian", true);
    await page.goBack();
    await page.waitForURL(/tomato-ripeness/);
    check("back keeps ID", (await lang(page)) === "id");
    // Ask request carries the locale
    let body = null;
    await page.route("**/ask", async (route) => { body = route.request().postDataJSON(); await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream", "access-control-allow-origin": "*" }, body: 'data: {"response":"OK"}\n\ndata: [DONE]\n\n' }); });
    await page.locator(".tv-ask-suggestions button").first().click();
    await page.waitForSelector(".aw-conversation");
    check("Ask sends locale id with an Indonesian question", body && body.locale === "id" && /Mengapa/.test(body.message), JSON.stringify(body));
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/id-ask-1440.png` });
    await page.locator(".aw-title-actions .aw-lang button", { hasText: "EN" }).click();
    await page.waitForTimeout(300);
    check("switch back to EN", (await lang(page)) === "en" && (await page.locator(".aw-primary-nav").innerText()).includes("Home"));
    await ctx.close();
  }
  // music: off by default, click plays at low volume, volume remembered, no autoplay after reload
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(trackAudio);
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    check("music off by default", (await page.locator(".aw-title-actions .aw-music").getAttribute("aria-pressed")) === "false");
    await page.locator(".aw-title-actions .aw-music").click();
    await page.waitForTimeout(1200);
    const pressed = await page.locator(".aw-title-actions .aw-music").getAttribute("aria-pressed");
    check("click starts music", pressed === "true" && (await audioPlaying(page)), pressed);
    check("low volume stored", (await page.evaluate(() => localStorage.getItem("aw-music-volume"))) === "0.2");
    await page.locator(".aw-title-actions .aw-music").click();
    await page.waitForTimeout(300);
    check("click pauses music", (await page.locator(".aw-title-actions .aw-music").getAttribute("aria-pressed")) === "false");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    check("no autoplay after reload", !(await audioPlaying(page)) && (await page.locator(".aw-title-actions .aw-music").getAttribute("aria-pressed")) === "false");
    check("pause is remembered", (await page.evaluate(() => localStorage.getItem("aw-music"))) === "off");
    // enabling once is remembered; the next visit tries to resume, and music survives internal navigation
    await page.locator(".aw-title-actions .aw-music").click();
    await page.waitForTimeout(800);
    check("enable is remembered", (await page.evaluate(() => localStorage.getItem("aw-music"))) === "on");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const cls = await page.locator(".aw-title-actions .aw-music").getAttribute("class");
    check("next visit resumes, or shows one click is needed", (await audioPlaying(page)) || cls.includes("is-waiting"), cls);
    if (!(await audioPlaying(page))) { await page.mouse.click(700, 500); await page.waitForTimeout(800); }
    await page.locator(".aw-primary-nav button", { hasText: "Projects" }).click();
    await page.waitForTimeout(600);
    await page.locator(".aw-project-objects > button").first().click();
    await page.waitForTimeout(1000);
    check("music continues across internal navigation", await audioPlaying(page));
    check("music volume is low", (await page.evaluate(() => [...window.__audio].every((a) => a.volume <= 0.25))));
    const r = await page.request.get(BASE + "/audio/ambient-wilfredor-cc0.m4a");
    check("music file served", r.status() === 200);
    await ctx.close();
  }
  // strict autoplay policy: a remembered "on" must wait for one gesture, never play silently on its own
  {
    const strict = await chromium.launch({ args: ["--autoplay-policy=user-gesture-required"] });
    const ctx = await strict.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => localStorage.setItem("aw-music", "on"));
    await ctx.addInitScript(trackAudio);
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const playing = () => audioPlaying(page);
    const btn = page.locator(".aw-title-actions .aw-music");
    check("blocked autoplay: nothing plays, button asks for one click", !(await playing()) && (await btn.getAttribute("class")).includes("is-waiting") && (await btn.getAttribute("aria-label")) === "Resume music", await btn.getAttribute("class"));
    await page.mouse.click(700, 500);
    await page.waitForTimeout(1000);
    check("first gesture resumes", (await playing()) && !(await btn.getAttribute("class")).includes("is-waiting"));
    await strict.close();
  }
  // Padel real clip
  for (const motion of ["no-preference", "reduce"]) {
    const ctx = await browser.newContext({ reducedMotion: motion, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/?project=padel-vision", { waitUntil: "networkidle" });
    await page.waitForSelector(".aw-padel-real video");
    await page.waitForTimeout(1500);
    const v = await page.evaluate(() => { const x = document.querySelector(".aw-padel-real video"); return { t: x.currentTime, paused: x.paused, muted: x.muted, dur: x.duration }; });
    if (motion === "no-preference") check("real clip autoplays muted", !v.paused && v.muted && v.t > 0.3 && v.dur > 7, JSON.stringify(v));
    else check("reduced motion: real clip waits", v.paused && v.t === 0, JSON.stringify(v));
    if (motion === "no-preference") {
      // the pipeline's boxes move: two frames a second apart differ inside the court area
      const sample = () => page.evaluate(() => { const x = document.querySelector(".aw-padel-real video"); const c = document.createElement("canvas"); c.width = 160; c.height = 90; const g = c.getContext("2d"); g.drawImage(x, 0, 0, 160, 90); return Array.from(g.getImageData(0, 30, 160, 60).data); });
      const a = await sample(); await page.waitForTimeout(1000); const b = await sample();
      let diff = 0; for (let i = 0; i < a.length; i += 4) diff += Math.abs(a[i] - b[i]) > 24 ? 1 : 0;
      check("analyzed clip is the source and frames change", (await page.locator(".aw-padel-real video").getAttribute("src")).includes("pexels-analyzed") && diff > 200, "changed px " + diff);
    }
    check(`${motion}: caption credits UsaOne Ell and the Pexels License`, /UsaOne Ell, Pexels\.[\s\S]*Pexels License/.test(await page.locator(".aw-padel-real figcaption").innerText()));
    await ctx.close();
  }
  // Knowledge: Indonesian labels, whole row opens the case
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => localStorage.setItem("aw-locale", "id"));
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.locator(".aw-primary-nav button", { hasText: "Pengetahuan" }).click();
    await page.waitForSelector(".aw-knowledge-list > button");
    const row = page.locator(".aw-knowledge-list > button").nth(3);
    check("Knowledge boundary line in Indonesian", (await row.innerText()).includes("Batas publik"));
    await row.scrollIntoViewIfNeeded();
    const box = await row.locator("figure").boundingBox();
    await page.mouse.click(box.x + 20, box.y + 20);
    await page.waitForURL(/project=/);
    check("clicking the thumbnail opens the case", /project=tomato-ripeness/.test(page.url()), page.url());
    await ctx.close();
  }
  // responsive in Indonesian (longer strings): no horizontal overflow
  for (const [w, h] of [[1440, 900], [820, 1180], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w === 390, hasTouch: w === 390, deviceScaleFactor: w === 390 ? 2 : 1, reducedMotion: "reduce" });
    await ctx.addInitScript(() => localStorage.setItem("aw-locale", "id"));
    for (const path of ["/", "/?project=tomato-ripeness", "/?project=labstock", "/?project=bdrs", "/?project=suhulog", "/?project=padel-vision", "/?project=porsche-3d"]) {
      const page = await ctx.newPage();
      const errs = []; page.on("pageerror", (e) => errs.push(e.message));
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(900);
      const o = await page.evaluate(() => { const m = document.querySelector("main.aw-center"); return { doc: document.documentElement.scrollWidth - innerWidth, main: m ? m.scrollWidth - m.clientWidth : 0, header: (() => { const hd = document.querySelector(".aw-mobile-header"); return hd && getComputedStyle(hd).display !== "none" ? hd.scrollWidth - hd.clientWidth : 0; })() }; });
      check(`ID ${w} ${path}: no overflow, no errors`, o.doc <= 0 && o.main <= 0 && o.header <= 0 && !errs.length, JSON.stringify({ ...o, errs }));
      if (SHOTS && (path === "/" || path === "/?project=padel-vision" || path === "/?project=tomato-ripeness")) await page.screenshot({ path: `${SHOTS}/id-${path === "/" ? "home" : path.split("=")[1]}-${w}.png`, fullPage: w === 390 });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  for (const r of results) console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.pass ? "" : "  " + r.detail));
  console.log(results.every((r) => r.pass) ? "ALL PASS" : "FAILURES");
  process.exitCode = results.every((r) => r.pass) ? 0 : 1;
})();
