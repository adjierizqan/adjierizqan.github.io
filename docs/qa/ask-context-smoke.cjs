/* Ask: project context per turn (CommonJS, run outside the app). The worker is mocked; request bodies are checked.
   node docs/qa/ask-context-smoke.cjs [baseUrl] [screenshotDir]   (PLAYWRIGHT_PATH may point at @playwright/test) */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "@playwright/test");
const BASE = process.argv[2] || "http://localhost:4173";
const SHOTS = process.argv[3];
const results = [];
const check = (name, pass, detail = "") => results.push({ name, pass: !!pass, detail });

async function session(browser, locale, width = 1440, height = 900) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", isMobile: width < 500, hasTouch: width < 500 });
  await ctx.addInitScript((l) => localStorage.setItem("aw-locale", l), locale);
  const page = await ctx.newPage();
  const bodies = [];
  await page.route("**/ask", async (route) => {
    const body = route.request().postDataJSON();
    bodies.push(body);
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream", "access-control-allow-origin": "*" }, body: `data: {"response":"Answer ${bodies.length} (${body.projectId || "general"})"}\n\ndata: [DONE]\n\n` });
  });
  return { ctx, page, bodies };
}
async function ask(page, text) {
  const box = page.locator(".aw-ask .aw-composer textarea");
  await box.fill(text);
  await box.press("Enter");
  await page.waitForFunction((n) => document.querySelectorAll(".aw-ask-turn").length >= n && !document.querySelector(".aw-ask .aw-composer textarea")?.disabled, null, { timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(300);
}
const turns = (page) => page.$$eval(".aw-ask-group", (groups) => groups.map((g) => ({ label: g.querySelector(".aw-ask-label")?.textContent, switch: g.querySelector(".aw-ask-switch")?.textContent || null, n: g.querySelectorAll(".aw-ask-turn").length, answers: [...g.querySelectorAll(".aw-ask-turn .aw-message:not(.is-user) p")].map((p) => p.textContent) })));

(async () => {
  const browser = await chromium.launch();
  // EN: LabStock -> LabStock -> TomatoVision -> General
  {
    const { ctx, page, bodies } = await session(browser, "en");
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.locator(".aw-primary-nav button", { hasText: "Ask" }).click();
    await page.waitForSelector(".aw-ask-context select");
    check("context defaults to General", (await page.locator(".aw-ask-context select option:checked").textContent()) === "General");
    await page.locator(".aw-ask-context select").selectOption("labstock");
    await ask(page, "How does LabStock derive stock?");
    await ask(page, "And corrections?");
    check("LabStock turns send projectId labstock", bodies[0]?.projectId === "labstock" && bodies[1]?.projectId === "labstock", JSON.stringify(bodies.map((b) => b.projectId)));
    check("second LabStock turn carries LabStock history", bodies[1]?.history?.length === 2 && bodies[1].history[0].content === "How does LabStock derive stock?", JSON.stringify(bodies[1]?.history));
    check("context bar keeps LabStock", (await page.locator(".aw-ask-context select option:checked").textContent()) === "LabStock");
    await page.locator(".aw-ask-context select").selectOption("tomato-ripeness");
    await ask(page, "What did WBF improve?");
    check("TomatoVision turn sends its projectId", bodies[2]?.projectId === "tomato-ripeness", JSON.stringify(bodies[2]));
    check("TomatoVision turn does not carry LabStock history", Array.isArray(bodies[2]?.history) && bodies[2].history.length === 0, JSON.stringify(bodies[2]?.history));
    await page.locator(".aw-ask-context select").selectOption("");
    await ask(page, "Who is Adjie?");
    check("General turn sends no projectId", bodies[3] && bodies[3].projectId === undefined && bodies[3].history.length === 0, JSON.stringify(bodies[3]));
    const g = await turns(page);
    check("groups: LabStock(2), TomatoVision(1), General(1)", JSON.stringify(g.map((x) => [x.label, x.n])) === JSON.stringify([["LabStock", 2], ["TomatoVision", 1], ["General", 1]]), JSON.stringify(g));
    check("dividers name the new context", g[0].switch === null && g[1].switch === "Context switched to TomatoVision" && g[2].switch === "Context switched to General", JSON.stringify(g.map((x) => x.switch)));
    check("earlier turns keep their answers and label", g[0].answers.join("|") === "Answer 1 (labstock)|Answer 2 (labstock)", JSON.stringify(g[0]));
    if (SHOTS) await page.locator("main.aw-ask").screenshot({ path: `${SHOTS}/ask-context-1440.png` });
    await ctx.close();
  }
  // Asking from a project page sets that context; then back on Ask the next turn stays in it
  {
    const { ctx, page, bodies } = await session(browser, "en");
    await page.goto(BASE + "/?project=suhulog", { waitUntil: "networkidle" });
    const box = page.locator("main.aw-center .aw-composer textarea").first();
    await box.fill("What does SuhuLog export?");
    await box.press("Enter");
    await page.waitForSelector(".aw-ask-turn");
    await page.waitForTimeout(500);
    check("project page turn sends projectId suhulog", bodies[0]?.projectId === "suhulog", JSON.stringify(bodies[0]));
    check("Ask shows SuhuLog label and context", (await page.locator(".aw-ask-label").first().textContent()) === "SuhuLog" && (await page.locator(".aw-ask-context select option:checked").textContent()) === "SuhuLog");
    await ask(page, "Which formats?");
    check("follow-up stays in SuhuLog with history", bodies[1]?.projectId === "suhulog" && bodies[1].history.length === 2, JSON.stringify(bodies[1]));
    await ctx.close();
  }
  // ID labels, and 390 layout
  for (const width of [1440, 390]) {
    const { ctx, page, bodies } = await session(browser, "id", width, width < 500 ? 844 : 900);
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    if (width < 500) await page.getByRole("button", { name: "Buka navigasi" }).click();
    await page.locator(".aw-primary-nav button", { hasText: "Tanya" }).click();
    await page.waitForSelector(".aw-ask-context select");
    check(`ID ${width}: context label and General`, (await page.locator(".aw-ask-context > span").textContent()) === "Konteks" && (await page.locator(".aw-ask-context select option:checked").textContent()) === "Umum");
    await ask(page, "Siapa Adjie?");
    await page.locator(".aw-ask-context select").selectOption("bdrs");
    await ask(page, "Apa itu BDRS?");
    const g = await turns(page);
    check(`ID ${width}: divider in Indonesian`, g[1]?.switch === "Konteks beralih ke BDRS" && g[0]?.label === "Umum", JSON.stringify(g));
    check(`ID ${width}: locale id sent`, bodies.every((b) => b.locale === "id"));
    const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`ID ${width}: no horizontal overflow`, o <= 0, String(o));
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/ask-context-id-${width}.png`, fullPage: width < 500 });
    await ctx.close();
  }
  await browser.close();
  for (const r of results) console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.pass ? "" : "  " + r.detail));
  console.log(results.every((r) => r.pass) ? "ALL PASS" : "FAILURES");
  process.exitCode = results.every((r) => r.pass) ? 0 : 1;
})();
