import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { allWorkspaceProjects } from "../data/workspace";
import { identity, education } from "../data/profile";
import { strict as assert } from "node:assert";
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://adjie.jagau.id").replace(/\/$/, "");
const home = readFileSync("out/index.html", "utf8");
assert(home.includes("<del") && home.includes("<ins>adds to</ins>"), "home correction headline");
assert(home.includes(identity.contact.email), "home contact email");
assert(home.includes(identity.contact.resumeTarget), "home résumé link");
assert(home.includes(`${SITE}/`) || home.includes(`href="${SITE}"`), "home canonical");
assert(existsSync("out/work/index.html"), "work index");
assert(existsSync("out/workspace/index.html"), "Workspace with Ask is still exported");
assert(readFileSync("out/workspace/index.html", "utf8").includes("noindex"), "Workspace is not indexed");
for (const p of allWorkspaceProjects) {
  const html = readFileSync(`out/projects/${p.slug}/index.html`, "utf8");
  assert(html.match(/<h1[^>]*>/g)?.length === 1 && html.includes(p.title), p.slug + " needs exactly one initial heading");
  assert(html.includes(`${SITE}/projects/${p.slug}/`), p.slug + " canonical");
  assert(/What is not shown|Limits and credits|The photos on this page are demonstrations/.test(html), p.slug + " missing evidence boundary");
  assert(p.socialImage?.match(/\.(jpg|png)$/));
  for (const src of [p.image, p.thumb, p.socialImage, ...(p.gallery ?? []).map((i) => i.src)].filter(Boolean))
    assert(existsSync("out" + src), src);
  for (const m of html.matchAll(/src="(\/projects\/[^"]+)"/g)) assert(existsSync("out" + m[1]), p.slug + " image " + m[1]);
}
// Proposals and unreleased features must not appear as shipped work.
for (const f of ["out/index.html", "out/work/index.html", ...allWorkspaceProjects.map((p) => `out/projects/${p.slug}/index.html`)]) {
  const html = readFileSync(f, "utf8").toLowerCase();
  assert(!html.includes("hemovigil"), f + " mentions unverified hemovigilance release");
  assert(!html.includes("elab"), f + " mentions ELAB, which is not cleared for publication");
}
for (const f of [
  "sitemap.xml",
  "robots.txt",
  "404.html",
  "icon.svg",
  "muhammad-rizqan-nur-adjie-cv-2026.pdf",
])
  assert(existsSync("out/" + f), f);
assert(education[0].program.includes("completed 2026"));
assert(education[1].program.includes("completed 2023"));
assert(existsSync("out" + identity.contact.resumeTarget));
// Public-only scan. Never reads environment files or private application databases.
const problems: string[] = [];
let scanned = 0;
const forbidden = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bsk-[A-Za-z0-9]{32,}\b/,
  /https?:\/\/(?:10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|127\.0\.0\.1|localhost)(?=[:/])/,
];
function walk(dir: string) {
  for (const name of readdirSync(dir)) {
    const path = dir + "/" + name;
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    assert(!/\.env|\.sqlite|\.sql$|\.pem$/.test(name), "private file " + path);
    if (!/\.(html|txt|xml|json|svg|js)$/.test(name)) continue;
    const s = readFileSync(path, "utf8");
    scanned++;
    if (forbidden.some((p) => p.test(s))) problems.push(path);
  }
}
walk("out");
assert.deepEqual(problems, [], "public privacy scan");
console.log(
  `PASS: home, work, six case studies, canonical metadata, media, profile, résumé and ${scanned} public text files scanned.`,
);

assert(
  !existsSync("out/projects/suhulog-label-qr.jpg"),
  "unverified QR destinations must not be published",
);
