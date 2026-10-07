import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { allWorkspaceProjects } from "../data/workspace";
import { identity, education } from "../data/profile";
import { strict as assert } from "node:assert";
for (const p of allWorkspaceProjects) {
  const html = readFileSync(`out/projects/${p.slug}/index.html`, "utf8");
  assert(
    html.includes(`<h1`) && html.includes(p.title),
    p.slug + " missing initial heading",
  );
  assert(
    html.includes("About the evidence"),
    p.slug + " missing static boundary",
  );
  assert(
    html.includes(`https://adjierizqan.github.io/projects/${p.slug}/`),
    p.slug + " canonical",
  );
  assert(!html.includes("Replay Demo"), p.slug + " obsolete presentation");
  assert(html.includes(p.opener.prompt), p.slug + " missing initial prompt");
  assert(html.includes(p.opener.response), p.slug + " missing initial response");
  assert(html.includes("Scripted introduction"), p.slug + " missing transparent framing");
  assert(p.socialImage?.match(/\.(jpg|png)$/));
  for (const src of [
    p.image,
    p.thumb,
    p.socialImage,
    ...(p.gallery ?? []).map((i) => i.src),
  ].filter(Boolean))
    assert(existsSync("out" + src), src);
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
  `PASS: six static routes, canonical metadata, media, profile, résumé and ${scanned} public text files scanned.`,
);

assert(
  !existsSync("out/projects/suhulog-label-qr.jpg"),
  "unverified QR destinations must not be published",
);
