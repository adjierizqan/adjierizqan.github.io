# Personal site v2 — review package

Candidate for `https://adjie.jagau.id`. Branch `feat/personal-site-v2`. Nothing is deployed and no DNS, Pages, Worker or email setting was changed.

- Figma: [ADJIE — Personal Portfolio / adjie.jagau.id](https://www.figma.com/design/oLmqSNPM6wFWy7w70ihGJz)
- Discovery and screenshot evidence matrix: [DISCOVERY.md](DISCOVERY.md)
- Figma vs build comparisons and viewport screenshots: [evidence/](evidence/)
- Browser check output: [browser-results.json](browser-results.json); Lighthouse lab results: [performance.json](performance.json)

## Design direction

The site is built around one idea from the work itself: a correction is added to the record, not written over it. LabStock supersedes ledger entries, SuhuLog appends corrected readings, BDRS keeps issue, outcome and transfusion as separate records. The hero sentence carries that as its only expressive device (“a correction ~~overwrites~~ adds to the record”), and red is reserved for that mark everywhere on the site.

Everything else is quiet so the real screens carry the pages: cool form-paper background, register-ink text, Schibsted Grotesk for structure, Literata for prose, a left margin column for metadata, hairline sections, screenshots on a neutral mat with a caption saying where each came from. The TomatoVision page uses a white background and numbered figures and tables to read as research rather than hospital software.

Directions considered and not chosen: a dark instrument-panel look (fits the subject but drifts toward fake-terminal styling and hurts prose) and a card-based profile layout (fast to scan but indistinguishable from template portfolios). The card layout’s information order — identity, role, work, education, contact — was kept.

References were read as page text only; the browser was not linked to this session, so no reference was inspected visually. Principles taken: personable first screen and an Ask entry point (Faiz Intifada), reverse-chronological education and work (Magic UI portfolio), restraint and short copy (ibelick, Paco Coursey, Emil Kowalski), editorial colour discipline (Michele Greco), project index with metadata columns (Olivier Larose, Pentagram captions), case-study storytelling (Piet).

## What was built

| Page | Figma | Build |
| --- | --- | --- |
| Home, desktop and mobile | 03 · Home | `/` |
| Work index with hover/focus preview | 04 · Work | `/work/` |
| LabStock case study | 05 · Case · LabStock | `/projects/labstock/` |
| TomatoVision research page | 06 · Case · TomatoVision | `/projects/tomato-ripeness/` |
| BDRS, SuhuLog, Padel Vision, Porsche 3D | follow the same system (not separately drawn) | `/projects/<slug>/` |
| Foundations, components, motion spec | 01, 02, 07 | `components/site/site.css` |
| Previous Workspace with Ask AI | — | `/workspace/` (noindex) |

The Workspace and its Ask AI were not removed. They now live at `/workspace/`, linked from the footer as “Ask about my work”, and keep project selection in `?project=` so `/projects/<slug>/` belongs to the new case studies. The Ask Worker still only allows `https://adjierizqan.github.io` and localhost; see deployment step 4.

Copy is in plain English and states contribution as recorded: BDRS says AI-assisted implementation; LabStock and the About section say the work was built with AI coding tools.

## Checks that ran (local, 20 October 2026)

| Check | Result |
| --- | --- |
| `npm test` (portfolio data + Ask Worker) | 44 + 12 pass, 0 fail |
| `npm run lint`, `npm run typecheck` | clean |
| `npm run build` (static export) | 15 routes |
| `npm run test:static` | pass; 123 exported text files scanned for keys, tokens and private endpoints; hemovigilance and ELAB absent |
| `npm run test:v2` with Chrome 141 | 50 page loads at 1440, 1280, 768, 390 and 360 wide; 0 failures (status, broken images, missing alt, horizontal overflow, one h1, console errors, internal links, skip link, mobile menu Escape, TomatoVision switch) |
| axe-core 4 on 8 pages at 1440 and 390 | 0 violations after fixing heading order and the scrollable table |
| Lighthouse 12, local, brotli | Mobile performance 94–99, accessibility, best practices and SEO 100; CLS 0. Desktop performance 96–100 |
| Workspace at `/workspace/?project=bdrs` | renders the BDRS study, `noindex, follow`, no page errors |

Lighthouse numbers are lab results from a local server, not field data from a deployed origin. Automated accessibility checks are not a WCAG audit. Real-device testing (iOS Safari, Android Chrome) has not been done. The old Workspace shell scripts (`test:shell`, `test:browser`, `test:intros`, `test:integration`) still target `/` and were not run; CI now runs `test:v2` instead.

## Not done, or blocked

- **Figma images are empty.** Uploads from this workspace to `mcp.figma.com` were refused by the session’s network allowlist. Every image slot is a `Media/…` component named after its source file and sized to its aspect ratio; filling the `image` layer once updates every placement. Allow `mcp.figma.com` and I can fill them, or drop the files from `public/projects/` into those components by hand. The comparisons in `evidence/` show the unfilled Figma next to the build.
- **DNS not inspected.** Public DNS lookups are blocked here. A fetch of `adjie.jagau.id` was answered with a robots refusal, so something may already answer on that name (a wildcard record or the host’s default). Check the zone before adding a record.
- **BDRS hemovigilance.** Not shown. No hemovigilance code is in the production tag, and the Figma page is labelled as an unapproved proposal. If it has shipped from a local branch, push the tag and it can be added.
- **ELAB, KOMED, THINK IT, ObjectTwin.** Not included; release state or contribution is not established (see DISCOVERY.md).
- **Page transitions.** The motion spec’s cross-page transition is not implemented; Next’s View Transitions support is still experimental in this version.
- **BDRS and SuhuLog case pages** were designed directly in code from the same system; only LabStock and TomatoVision have Figma frames.

## Deployment proposal (needs your approval)

Recommended: Cloudflare Pages, free plan, separate from the current GitHub Pages site so `adjierizqan.github.io` stays live until you decide on a redirect.

1. Create a Cloudflare Pages project from `adjierizqan/adjierizqan.github.io`, production branch `feat/personal-site-v2` (or `main` after merge). Build `npm ci && npm run build`, output `out`, Node 22. Environment: `NEXT_PUBLIC_SITE_URL=https://adjie.jagau.id`, `NEXT_PUBLIC_ASK_API_URL=https://adjie-workspace-ask.adjierizqan.workers.dev`.
2. Check the preview at `<project>.pages.dev`.
3. Add the custom domain `adjie.jagau.id` in Pages. At the DNS provider for `jagau.id`, add one record: `CNAME adjie → <project>.pages.dev`. Change nothing else: MX, SPF, DKIM, DMARC, apex, `www` and the hospital application records stay as they are. Export the zone first.
4. Add `https://adjie.jagau.id` to the Ask Worker’s `ALLOWED_ORIGINS` in `cloudflare/ask-worker/wrangler.jsonc` and redeploy the Worker, or Ask stays disabled on the new domain.
5. Verify HTTPS on `adjie.jagau.id`, every route, the résumé PDF and Ask, then decide whether `adjierizqan.github.io` should redirect.

Expected cost: none on current free tiers. Alternative without Cloudflare: GitHub Pages with a `CNAME` file, but on a user site that moves `adjierizqan.github.io` itself to the custom domain, so it is not separable from the old portfolio.

## What to review

1. The Figma file, page 03 Home, against `evidence/compare-home-desktop.webp` and `home-390.webp`. Is the correction headline right for you?
2. Facts: release dates, roles and the AI-assistance wording on Home, LabStock and BDRS.
3. Whether the Workspace with Ask should stay at `/workspace/` or be dropped from the new domain.
4. Approve or change the deployment plan, and whether to allow `mcp.figma.com` so the Figma images can be filled.
