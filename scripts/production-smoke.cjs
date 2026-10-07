/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium, expect } = require("@playwright/test");
const fs = require("node:fs");
const base = process.env.QA_BASE || "https://adjierizqan.github.io";
const dir = process.env.QA_OUTPUT || "docs/release/production-screenshots";
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
(async () => {
  const b = await chromium.launch();
  const report = { base, pages: [], errors: [] };
  try {
    for (const width of [1440, 390]) {
      const p = await b.newPage({
        viewport: { width, height: 900 },
        colorScheme: "light",
      });
      await p.addInitScript(() => {
        window.__audioContexts = 0;
        const Original = window.AudioContext;
        window.AudioContext = class extends Original {
          constructor(...args) { super(...args); window.__audioContexts++; }
        };
      });
      p.on("pageerror", (e) => report.errors.push(e.message));
      p.on("console", (m) => {
        if (m.type() === "error") report.errors.push(m.text());
      });
      for (const slug of slugs) {
        const url = slug ? `/projects/${slug}/` : "/";
        const r = await p.goto(base + url, { waitUntil: "networkidle" });
        expect(r.status()).toBe(200);
        await expect(p.locator("h1")).toHaveCount(1);
        if (!slug) {
          await expect(p.getByRole("region", { name: "Ask Adjie AI", exact: true })).toBeVisible();
          await expect(p.locator(".home-start textarea")).toBeVisible();
          await expect(p.locator(".home-reply")).toContainText("computer vision research");
          expect(await p.evaluate(() => window.__audioContexts)).toBe(0);
        }
        if (slug) {
          await expect(p.locator(".project-intro-answer p")).toBeVisible();
          await expect(p.locator(".project-intro")).not.toHaveAttribute("data-playing", "true");
          expect(await p.evaluate(() => window.__audioContexts)).toBe(0);
        }
        await expect(p.locator("link[rel=canonical]")).toHaveAttribute(
          "href",
          base + url,
        );
        await p.locator("main img").evaluateAll(async (imgs) => {
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
        expect(
          await p.evaluate(
            () => document.documentElement.scrollWidth - innerWidth,
          ),
        ).toBe(0);
        expect(
          await p
            .locator("main img")
            .evaluateAll((imgs) => imgs.every((i) => i.naturalWidth > 0)),
        ).toBe(true);
        await p.screenshot({ path: `${dir}/${width}-${slug || "home"}.png` });
        report.pages.push({
          width,
          path: url,
          status: r.status(),
          title: await p.title(),
        });
      }
      await p.goto(base + "/?project=suhulog", { waitUntil: "networkidle" });
      await expect(p).toHaveURL(base + "/projects/suhulog/");
      await p
        .getByRole("button", { name: "Switch to dark mode", exact: true })
        .filter({ visible: true })
        .click();
      expect(await p.locator("html").getAttribute("data-theme")).toBe("dark");
      await p.reload({ waitUntil: "networkidle" });
      expect(await p.locator("html").getAttribute("data-theme")).toBe("dark");
      await p.close();
    }
    const p = await b.newPage();
    p.on("pageerror", e => report.errors.push(e.message));
    p.on("console", m => { if (m.type() === "error") report.errors.push(m.text()); });
    await p.goto(base, { waitUntil: "networkidle" });
    for (const path of [
      "/sitemap.xml",
      "/robots.txt",
      "/muhammad-rizqan-nur-adjie-cv-2026.pdf",
      "/icon.svg",
    ])
      expect((await p.request.get(base + path)).status()).toBe(200);
    expect(
      (await p.request.get(base + "/projects/suhulog-label-qr.jpg")).status(),
    ).toBe(404);
    await expect(p.locator(".home-start textarea")).toBeVisible();
    await expect(p.getByText("Adjie AI · Preview", { exact: true })).toHaveCount(0);
    await p
      .locator("textarea")
      .fill("When did Adjie complete his degrees at Tamkang and Telkom?");
    await p.locator("textarea").press("Enter");
    await expect(p.locator(".aw-message").last()).toContainText("2026", {
      timeout: 90000,
    });
    await expect(p.locator(".aw-message").last()).toContainText("2023");
    await expect(p.locator(".aw-message").last().locator("span").first()).toHaveText("Workspace", { timeout: 90000 });
    await p.screenshot({ path: `${dir}/ask-verified.png` });
    report.ask = {
      status: "PASS",
      answer: await p.locator(".aw-message").last().innerText(),
    };
    expect(report.errors).toEqual([]);
    report.status = "PASS";
    fs.writeFileSync(
      process.env.QA_REPORT || "docs/release/production-smoke.json",
      JSON.stringify(report, null, 2),
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
