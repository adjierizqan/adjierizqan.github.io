# Personal site v2: review package

Candidate for `https://adjie.jagau.id`. Branch `feat/personal-site-v2`, draft PR #13. Nothing is deployed and no DNS, Pages, Worker or email setting was changed.

- Figma: [ADJIE, Personal Portfolio](https://www.figma.com/design/oLmqSNPM6wFWy7w70ihGJz), page "C · Personal and direct (current)"
- Discovery and screenshot evidence matrix: [DISCOVERY.md](DISCOVERY.md)
- Figma vs build comparisons, viewport and dark-mode screenshots: [evidence/](evidence/)
- Browser check output: [browser-results.json](browser-results.json); Lighthouse lab results: [performance.json](performance.json)

## Direction

The owner rejected the first direction (an editorial layout with a struck-through headline) as reading like AI output. Three sketches were then made with real content (`evidence/direction-a.webp`, `-b`, `-c`): a typographic project index, a bold colour field, and a plain personal page. The owner picked **C, personal and direct**. The first direction's Figma pages are kept, renamed `ARCHIVE A · …`.

What C is, and why:

- One 680px reading column, read top to bottom like a short letter. A recruiter sees who, what, contact and the work list without scrolling far.
- First-person copy that names the actual systems and what was hard about them, instead of a tagline.
- IBM Plex Sans only: a plain engineering voice, legible at small sizes.
- Link blue as the single accent, because links are the main action on the page.
- Screenshots widen to 960px inside case studies so product UI stays readable.
- Light and dark follow the system setting; both pass contrast checks.
- Initials stand in for a photo until you supply one you approve.
- An "Ask about my work" box on the home page uses the existing Ask Worker. It shows a loading state, the streamed answer, or an error with a retry and your email. It is not rendered at all if the build has no Worker URL.

The old Workspace with its own Ask stays at `/workspace/` (noindex); it is no longer linked from the new pages. Decide whether to keep it.

## Pages

| Page | Figma | Build |
| --- | --- | --- |
| Home, desktop and mobile | C page | `/` |
| LabStock case study | C page | `/projects/labstock/` |
| BDRS, SuhuLog, TomatoVision, Padel Vision, Porsche 3D | same template, not drawn separately | `/projects/<slug>/` |
| Previous Workspace with Ask | not redesigned | `/workspace/` |

The separate work index page from the first direction was dropped: the home page is the index.

## Checks that ran (local, 20 October 2026)

| Check | Result |
| --- | --- |
| `npm test` (portfolio data + Ask Worker) | 43 + 12 pass, 0 fail |
| `npm run lint`, `npm run typecheck` | clean |
| `npm run build` | static export, 14 routes |
| `npm run test:static` | pass; 112 exported text files scanned for keys, tokens and private endpoints; no em dashes in visible copy; hemovigilance and ELAB absent |
| `npm run test:v2` with Chrome 141 | 45 page loads at 1440, 1280, 768, 390 and 360 wide, 0 failures (status, broken images, alt text, horizontal overflow, one h1, console errors, internal links, skip link, Ask submit, TomatoVision switch) |
| Ask, end to end | Submitting shows the question, then "The assistant couldn’t be reached" with a retry and your email. The Worker itself could not be reached from this sandbox, so a successful answer was not observed. |
| axe-core on 7 pages at 1440 and 390 | 0 violations; dark mode colour contrast 0 violations on three pages |
| Lighthouse 12, local, brotli | mobile performance 95 to 99, desktop 100; accessibility, best practices and SEO 100; CLS 0 |

Click-through, element by element: email link opens `mailto:`; Copy email copies and announces "Email address copied" (checked by code, headless clipboard not exercised); Résumé, GitHub, LinkedIn and every project row navigate (internal links return 200); Ask submit shows question then answer or error with Try again; TomatoVision buttons switch image and metrics; Padel video plays only on request; skip link is the first Tab stop.

Lab numbers are not field data. Automated accessibility checks are not a WCAG audit. No real-device testing. The old Workspace shell scripts (`test:shell`, `test:browser`, `test:intros`, `test:integration`) still target `/` and were not run.

## Not done, or blocked

- **Figma images are empty.** Uploads to `mcp.figma.com` are refused by this session’s network allowlist. Each image slot is a `Media/…` component named after its source file; fill its `image` layer once and every placement updates.
- **Photo.** Initials are a placeholder. Send a photo you want public and it replaces them.
- **DNS not inspected.** Lookups are blocked here; `adjie.jagau.id` may already answer something (possibly a wildcard). Check the zone before adding a record.
- **BDRS hemovigilance.** Not shown: no hemovigilance code is in the production tag and the Figma page is an unapproved proposal.
- **ELAB, KOMED, THINK IT, ObjectTwin.** Not included; release state or contribution is not established.

## Deployment proposal (needs your approval)

Cloudflare Pages, free plan, separate from GitHub Pages so `adjierizqan.github.io` stays live until you decide on a redirect.

1. Create a Pages project from this repository, branch `feat/personal-site-v2` (or `main` after merge). Build `npm ci && npm run build`, output `out`, Node 22. Environment: `NEXT_PUBLIC_SITE_URL=https://adjie.jagau.id`, `NEXT_PUBLIC_ASK_API_URL=https://adjie-workspace-ask.adjierizqan.workers.dev`.
2. Check the `<project>.pages.dev` preview.
3. Add the custom domain `adjie.jagau.id` in Pages, then one DNS record at the `jagau.id` provider: `CNAME adjie → <project>.pages.dev`. Export the zone first and change nothing else (MX, SPF, DKIM, DMARC, apex, `www`, application records).
4. Add `https://adjie.jagau.id` to `ALLOWED_ORIGINS` in `cloudflare/ask-worker/wrangler.jsonc` and redeploy the Worker, or the Ask box will always show its error state on the new domain.
5. Verify HTTPS, every route, the résumé PDF and Ask, then decide on `adjierizqan.github.io`.

Expected cost: none on current free tiers.

## What to review

1. Home page copy: is the first paragraph how you would describe yourself?
2. Facts: release dates, roles and the AI-assistance wording.
3. Keep or drop `/workspace/` now that Ask is on the home page.
4. Approve the deployment plan, and send a photo if you want one instead of initials.
