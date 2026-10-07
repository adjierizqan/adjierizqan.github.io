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
        page.on("pageerror", (e) =>
          report.errors.push(`${name}/${width}: ${e.message}`),
        );
        page.on("console", (m) => {
          if (m.type() === "error")
            report.errors.push(`${name}/${width}: ${m.text()}`);
        });
        for (const slug of slugs) {
          const url = slug ? `/projects/${slug}/` : "/";
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
          expect(audit.content.every((n) => n === 0)).toBe(true);
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
      for (const slug of slugs.slice(1)) {
        await p.goto(base + `/projects/${slug}/`);
        await expect(p.locator("h1")).toHaveCount(1);
        await expect(p.locator("article")).not.toHaveCount(0);
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
