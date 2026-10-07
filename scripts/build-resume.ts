import { identity, education } from "../data/profile";
import { featuredWork } from "../data/workspace";
import { writeFileSync } from "node:fs";
const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
writeFileSync(
  "/tmp/adjie-resume.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>${identity.name} — Résumé</title><style>@page{size:A4;margin:13mm}body{font:9.5pt/1.35 Arial,sans-serif;color:#253030}h1{font-size:25pt;letter-spacing:-1px;margin:0}h2{font-size:11pt;border-bottom:1px solid #cdd5d2;padding-bottom:5px;margin-top:14px}h3{font-size:10.5pt;margin:10px 0 3px}p{margin:5px 0}a{color:inherit}small{color:#5b6663}section{break-inside:avoid}.contact{font-size:9pt;margin:10px 0 18px}</style><h1>${identity.name}</h1><p>Software / Full-stack Engineer</p><p class="contact"><a href="mailto:${identity.contact.email}">${identity.contact.email}</a> · <a href="https://adjierizqan.github.io">adjierizqan.github.io</a> · <a href="${identity.contact.github}">GitHub</a> · <a href="${identity.contact.linkedin}">LinkedIn</a></p><p>${esc(identity.positioning)}</p><h2>Selected engineering work</h2>${featuredWork
    .map(
      (p) =>
        `<section><h3>${p.title} <small> / ${p.year}</small></h3><p>${esc(p.summary)}</p><p><small>${esc(p.role)} · ${esc(p.stack.join(", "))}</small></p><p>${esc(
          p.evidence
            .slice(0, p.slug === "tomato-ripeness" ? 4 : 2)
            .map((e) => `${e.label}: ${e.value}`)
            .join(" · "),
        )}</p></section>`,
    )
    .join(
      "",
    )}<h2>Education</h2>${education.map((e) => `<section><h3>${e.institution}</h3><p>${e.program}</p></section>`).join("")}<h2>Public evidence</h2><p>Full case studies, system decisions and evidence limitations: <a href="https://adjierizqan.github.io">adjierizqan.github.io</a>. Product captures use synthetic or sanitized data. Research evaluation and demo imagery are distinguished.</p></html>`,
);
