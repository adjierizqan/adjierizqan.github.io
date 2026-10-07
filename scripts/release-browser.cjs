/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium, webkit, expect } = require("@playwright/test");
const fs = require("node:fs");
const base = process.env.QA_BASE || "http://127.0.0.1:4182";
const dir = process.env.QA_OUTPUT || "docs/release/screenshots";
fs.mkdirSync(dir, { recursive: true });
const slugs = [
  "",
  "labstock",
  "suhulog",
  "tomato-ripeness",
  "bdrs",
  "padel-vision",
  "porsche-3d",
];
const report = { base, browsers: [], checks: [], errors: [] };
(async () => {
  for (const [name, engine] of process.env.QA_WEBKIT === "1"
    ? [
        ["chromium", chromium],
        ["webkit", webkit],
      ]
    : [["chromium", chromium]]) {
    const browser = await engine.launch();
    report.browsers.push(name);
    try {
      for (const width of [1440, 834, 390, 320]) {
        const context = await browser.newContext({
          viewport: { width, height: width === 834 ? 1112 : 900 },
          colorScheme: "light",
        });
        await context.addInitScript(() => {
          window.__audio = 0;
          const O = window.AudioContext || window.webkitAudioContext;
          if (O)
            window.AudioContext = class extends O {
              constructor(...args) {
                super(...args);
                window.__audio++;
              }
            };
        });
        const page = await context.newPage();
        let askRequests = 0;
        page.on("request", r => { if (r.url().includes("workers.dev/ask")) askRequests++; });
        page.on("pageerror", (e) =>
          report.errors.push(`${name}/${width}: ${e.message}`),
        );
        page.on("console", (m) => {
          if (m.type() === "error")
            report.errors.push(`${name}/${width}: ${m.text()}`);
        });
        for (const slug of slugs) {
          const url = slug ? `/projects/${slug}/` : "/";
          const requestsBeforeEntry = askRequests;
          const response = await page.goto(base + url, {
            waitUntil: "networkidle",
          });
          expect(response.status()).toBe(200);
          await expect(page.locator("h1")).toHaveCount(1);
          await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
            "href",
            "https://adjierizqan.github.io" + url,
          );
          expect(await page.evaluate(() => window.__audio)).toBe(0);
          if (!slug) {
            expect(askRequests).toBe(0);
            await expect(page.getByRole("region", { name: "Ask Adjie AI", exact: true })).toBeVisible();
            await expect(page.locator(".home-start textarea")).toBeVisible();
            await page.locator(".home-example summary").click();
            await expect(page.getByRole("region", { name: "Example conversation" })).toBeVisible();
            await expect(page.locator(".home-reply")).toContainText("computer vision research");
            await page.locator(".home-example summary").click();
            const proof = await page.locator(".home-project img").first().boundingBox();
            // The recruiter sees actual product evidence before scrolling, not just a chat.
            expect(proof.y).toBeLessThan(width === 834 ? 900 : 760);
            await page.emulateMedia({ reducedMotion: "reduce" });
            expect(await page.locator(".home-reply").evaluate(e => e.getAnimations({ subtree: true }).length)).toBe(0);
            await expect(page.locator(".home-start h2")).toBeVisible();
            await page.emulateMedia({ reducedMotion: "no-preference" });
            await page.locator(".aw-center").evaluate(e => Promise.all(e.getAnimations({ subtree: true }).map(a => a.finished.catch(() => {}))));
          }
          if (slug) {
            expect(askRequests).toBe(requestsBeforeEntry);
            await expect(page.locator(".project-intro")).toContainText("Scripted introduction");
            await expect(page.locator(".project-intro-answer p")).not.toBeEmpty();
            await expect(page.locator(".project-intro")).not.toHaveAttribute("data-playing", "true");
          }
          await page.locator("main img").evaluateAll(async (imgs) => {
            imgs.forEach((i) => (i.loading = "eager"));
            await Promise.all(
              imgs.map((i) =>
                i.complete
                  ? null
                  : new Promise((r) => {
                      i.onload = i.onerror = r;
                    }),
              ),
            );
          });
          const audit = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth - innerWidth,
            content: [...document.querySelectorAll(".aw-center")].map(
              (e) => e.scrollWidth - e.clientWidth,
            ),
            broken: [...document.querySelectorAll("main img")].filter(
              (i) => !i.naturalWidth,
            ).length,
            autoplay: [...document.querySelectorAll("video")].some(
              (v) => !v.paused,
            ),
          }));
          expect(audit.overflow).toBe(0);
          expect(audit.content, `${name}/${width}/${slug || "home"}: content overflow`).toEqual(audit.content.map(() => 0));
          expect(audit.broken).toBe(0);
          expect(audit.autoplay).toBe(false);
          expect(
            await page.getByText("Replay Demo", { exact: true }).count(),
          ).toBe(0);
          await page.screenshot({
            path: `${dir}/${name}-${width}-${slug || "home"}.png`,
          });
          if (slug) {
            for (const [i, el] of (
              await page
                .locator(
                  ".study-section,.study-proof,#ls-system,#ls-decisions,#ls-product,#ls-evidence",
                )
                .all()
            ).entries()) {
              await el.evaluate((e) => e.scrollIntoView({ block: "start" }));
              await page.screenshot({
                path: `${dir}/${name}-${width}-${slug}-section-${i}.png`,
              });
            }
            const controls = page.locator(".study-controls button");
            for (const control of await controls.all()) {
              await control.click();
              await expect(control).toHaveAttribute("aria-pressed", "true");
            }
            const media = page
              .locator(".study-media a,.ls-screen")
              .filter({ visible: true })
              .first();
            if (await media.count()) {
              await media.click();
              await expect(
                page.getByRole("dialog", { name: "Project image viewer" }),
              ).toBeVisible();
              await page.keyboard.press("Escape");
              await expect(media).toBeFocused();
            }
          }
          await page
            .getByRole("button", { name: "Switch to dark mode", exact: true })
            .filter({ visible: true })
            .click();
          await page.locator(".aw-center").evaluate((e) => (e.scrollTop = 0));
          await page.screenshot({
            path: `${dir}/${name}-${width}-${slug || "home"}-dark.png`,
          });
          await page
            .getByRole("button", { name: "Switch to light mode", exact: true })
            .filter({ visible: true })
            .click();
          if (!slug) {
            await page.getByRole("link", { name: "Explore the work ↓", exact: true }).click();
            await expect(page.locator("#home-work")).toBeInViewport();
            await page.screenshot({ path: `${dir}/${name}-${width}-selected-work.png` });
            await page.route("https://adjie-workspace-ask.adjierizqan.workers.dev/ask", async route => {
              expect(route.request().postDataJSON().message).toBe("How does LabStock preserve history?");
              await route.fulfill({ contentType: "text/event-stream", body: 'data: {"response":"Fixture: a real visitor request reached the Ask transport."}\n\ndata: [DONE]\n\n' });
            });
            await page.getByRole("button", { name: "Ask your own question ↗", exact: true }).click();
            await expect(page.getByRole("region", { name: "Example conversation" })).toHaveCount(0);
            await expect(page.getByText("Adjie AI · Preview", { exact: true })).toHaveCount(0);
            for (const button of await page.locator(".aw-composer-tools button").filter({ visible: true }).all()) {
              expect(await button.evaluate(e => e.scrollWidth - e.clientWidth), "Composer label must fit its button").toBe(0);
            }
            await page.locator("textarea").fill("How does LabStock preserve history?");
            await page.locator("textarea").press("Enter");
            await expect(page.locator(".aw-message").last()).toContainText("Fixture: a real visitor request");
            expect(askRequests).toBe(1);
            await page.screenshot({ path: `${dir}/${name}-${width}-ask.png` });
          }
          console.log(`${name} ${width}px ${slug || "home"}: PASS`);
          report.checks.push({ name, width, page: slug || "home", ...audit });
        }
        await page.goto(base + "/?project=suhulog", {
          waitUntil: "networkidle",
        });
        await expect(page).toHaveURL(base + "/projects/suhulog/");
        await page.reload({ waitUntil: "networkidle" });
        await expect(page.locator("h1")).toHaveText("SuhuLog");
        await context.close();
      }
      const nojs = await browser.newContext({ javaScriptEnabled: false });
      const p = await nojs.newPage();
      await p.goto(base + "/");
      await p.locator(".home-example summary").focus();
      await p.keyboard.press("Enter");
      await expect(p.getByRole("region", { name: "Example conversation" })).toBeVisible();
      await expect(p.locator(".home-reply")).toContainText("Stock movements in LabStock");
      await expect(p.locator(".home-project")).toHaveCount(4);
      for (const slug of slugs.slice(1)) {
        await p.goto(base + `/projects/${slug}/`);
        await expect(p.locator("h1")).toHaveCount(1);
        await expect(p.locator("article")).not.toHaveCount(0);
        await expect(p.locator(".project-intro-prompt")).toBeVisible();
        await expect(p.locator(".project-intro-answer p")).toBeVisible();
        expect(await p.locator("body").innerText()).toContain(
          "About the evidence",
        );
      }
      await nojs.close();
    } finally {
      await browser.close();
    }
  }
  expect(report.errors).toEqual([]);
  report.status = "PASS";
  fs.writeFileSync(
    "docs/release/browser-results.json",
    JSON.stringify(report, null, 2),
  );
})().catch((e) => {
  report.status = "FAIL";
  report.failure = String(e);
  fs.writeFileSync(
    "docs/release/browser-results.json",
    JSON.stringify(report, null, 2),
  );
  console.error(e);
  process.exitCode = 1;
});
