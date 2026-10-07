# LabStock review candidate

**Status: REJECTED by owner for visual reasons.** This directory preserves the rejected candidate and comparison evidence. The replacement is documented in [../labstock-reset/README.md](../labstock-reset/README.md). The technical results below describe the rejected candidate, not the current design.

## Git baseline and investigation

- Branch: `feat/workspace-v2-labstock`.
- Base: `a689541bc480f80ffa9700b87a6bef152bf68865`.
- Candidate changes remain uncommitted in the new branch working tree for owner review.
- Ancestry verified: `9e36707` → `5da2dce` → `a689541` → `ab762f1`.
- Session began on clean `feat/portfolio-v2` at `ab762f1`. Created the new branch at the requested baseline, without reset or rewriting an existing branch. `main` remains `9e36707`.
- Read AGENTS.md, CLAUDE.md, the shell design contract, motion curation, P0 record, canonical data, route implementation, tests, media generation scripts and bundled Next.js documentation.
- The old P0 record's LabStock media gap is stale. Existing public captures and their generation script establish synthetic demo data. No private source application or database was needed.
- Existing Workspace LabStock content depended on fake prompt/response timers. Direct routes used a separate generic server-rendered presentation. Ambient music attempted playback on return visits. Portal icons relied on a CSS selector outside their portal ancestry.

## Architecture and files

The Workspace shell remains in WorkspacePrototype. LabStockCaseStudy is extracted and rendered by that shell in both entry paths. The canonical static route passes an explicit initial project, so the entire case study is present in exported HTML, including without JavaScript. New LabStock navigation uses the canonical path through the existing history store. Query links remain readable for compatibility. Other project layouts and routes are unchanged.

`data/workspace.ts` is the sole factual source. Its typed presentation fields contain the existing flow, decisions and stock caption; the AI-context integrity test confirms generated context still matches canonical sources. No new facts store or dependency was introduced.

| Files | Change |
| --- | --- |
| `components/labstock/LabStockCaseStudy.tsx`, `labstock.css` | Shared editorial case study, full media, static flow and optional signature motion |
| `components/workspace/UISound.tsx`, `motion.css` | Original gesture-only sound, persisted mute, motion tokens, reduced motion, actual-size viewer styling |
| `components/WorkspacePrototype.tsx` | Integrate LabStock, remove its scripted presentation, canonical navigation, sound controls, stop music autoplay, Quick Look inspection, portal glyphs and palette focus |
| `app/projects/[slug]/page.tsx` | Render LabStock explicitly inside the preserved shell |
| `app/layout.tsx` | Load shared motion/control styles |
| `app/globals.css`, `app/theme-dark.css` | Remove obsolete LabStock green-panel CSS and regenerate derived dark layer |
| `data/workspace.ts`, `lib/projects.ts` | Canonical presentation fields, WebP thumbnail and JPEG social preview |
| `lib/i18n-id.ts`, `scripts/i18n-keys.mjs` | Translate and check new presentation fields |
| `data/labstock.test.ts`, `data/routes.test.ts` | Initial HTML/flow regressions and social-image metadata contract |
| `public/projects/labstock/thumb-v2.webp`, `thumb-v2.jpg` | New thumbnail candidate and social equivalent |
| `docs/design/WORKSPACE_V2_PROJECT_PRESENTATION.md` | Authoritative presentation addendum; shell contract retained |
| This directory | Provenance, reproducible thumbnail/QA scripts, results and review screenshots |

## Layout and interaction

Order: opener → problem / what I built → system flow → engineering decisions → product walkthrough → evidence → demonstrated capability → public boundary. The stock screen leads; Today, requisition, phone requisition and report follow as individual full images. Desktop media spans 1040px at the 1440px viewport; prose measures cap at 740px. No simulated browser frames, giant green container, invented KPIs or miniature media grid.

Quick Look offers Fit image / Actual size for LabStock. The latter renders original image dimensions in a focusable native scroller, preserving all operational UI. No new image is fabricated. Phone screenshots retain their full 390 × 1543 source aspect ratio.

Motion: 120 / 220 / 360ms tokens, cubic-bezier(.2,.8,.2,1). One user-controlled causal flow; no autoplay loop and no hidden content. Reduced motion leaves the entire flow visible and removes transitions. No animation package.

Sound: original filtered-noise transients (35–90ms), low gain, direct actions only. UI mute is visible on desktop and phone and stored locally. Semantic tap/open/close are connected to meaningful controls. Success is defined but unused. Music is separate and must be explicitly played, including on return visits. Audio failure is nonfatal.

Accessibility checks cover semantic headings, visible keyboard focus, Quick Look focus return/Escape, palette focus loop/Escape, keyboard image scrolling and complete reduced-motion content. No WCAG compliance claim.

## Thumbnail provenance

- Source: existing `public/projects/labstock/hari-ini.webp` (1440 × 1024).
- Recorded origin: `docs/design/v101/build_assets.py`, final-release capture `01-hari-ini-1440.png`, synthetic `labstock_pk_demo` database. Existing source media were visually inspected; generic inventory and Demo identities are visible.
- Exact crop: left 288, top 94, width 784, height 554. Retains the Today title and complete five-item action list. Omits sidebar, activity column and requisition list deliberately for thumbnail focus.
- Composite: original crop at (88,23) on a 960 × 600 neutral `#eef0f2` canvas. **No resizing or upscaling of the screenshot**, no recoloring, no added product text, no fake UI.
- Website: WebP quality 88. Social: JPEG quality 92 / mozjpeg. OG/Twitter metadata uses JPEG.
- Reproduce: `node docs/design/workspace-v2-labstock/thumbnail.cjs`.
- Old thumbnail is preserved at `public/projects/labstock/thumb.webp`; it is a device composition, not the new source.
- Compare: [old vs new](thumbnail-comparison.png). Comparison sheet scales both to 480 × 300 for equal-size inspection; its labels are outside the images and do not ship as the website thumbnail.

## Verification

- `npm test`: 35 portfolio tests + 11 Worker tests pass.
- `npm run lint`: pass.
- `npx tsc --noEmit`: pass, using the repository's tsconfig (there is no typecheck npm script).
- `npm run build`: pass; all six static project routes emitted.
- Production export served with `python3 -m http.server 4178 --bind 127.0.0.1 --directory out`.
- Chromium: `node docs/design/workspace-v2-labstock/qa.cjs`. Uses the owner's already-installed Playwright; `PLAYWRIGHT_MODULE` can override the module path. No dependency added.
- See [machine-readable browser results](qa-results.json). Widths: 1440, 834, 390, 320. Checks include overflow, media loading, errors, canonical navigation, Back/Forward/refresh, Quick Look, desktop dragging and mobile non-dragging, theme, reduced motion and initial complete HTML.
- Audio instrumentation verifies no AudioContext or playback at load, no hover/scroll sound, gesture-triggered sources, mute/persistence and functional controls with a throwing AudioContext. Saved music does not autoplay.

## Screenshot index

Captures use actual viewport dimensions and the real scroller; no artificial window expansion. Each of 1440, 834, 390 and 320 has opening, flow, engineering, product, evidence, dark, reduced-motion and actual-size Quick Look images in `screenshots/`.

| Review surface | Desktop | Tablet | Phone |
| --- | --- | --- | --- |
| Opening | [1440](screenshots/1440-opening.png) | [834](screenshots/834-opening.png) | [390](screenshots/390-opening.png) |
| System flow | [1440](screenshots/1440-flow.png) | [834](screenshots/834-flow.png) | [390](screenshots/390-flow.png) |
| Engineering decisions | [1440](screenshots/1440-engineering.png) | [834](screenshots/834-engineering.png) | [390](screenshots/390-engineering.png) |
| Product walkthrough | [1440](screenshots/1440-product.png) | [834](screenshots/834-product.png) | [390](screenshots/390-product.png) |
| Evidence | [1440](screenshots/1440-evidence.png) | [834](screenshots/834-evidence.png) | [390](screenshots/390-evidence.png) |
| Dark mode | [1440](screenshots/1440-dark.png) | [834](screenshots/834-dark.png) | [390](screenshots/390-dark.png) |

[Full phone page](screenshots/390-full.png) · [320px opening](screenshots/320-opening.png) · [Phone actual-size inspection](screenshots/390-quick-look-actual.png)

## Known limits and deliberately deferred work

- Visual quality and audible feel require owner review; automated source-call checks do not substitute for listening on real hardware. No self-approval.
- Browser QA is local Chromium, not a cross-browser or physical-device audit. Live Ask AI service was not exercised; its existing client/Worker tests pass and the capability remains separate.
- Wide desktop UI necessarily becomes small in a phone-width overview. Actual-size Quick Look provides native scrolling for reading details; the real phone screen remains legible directly in the walkthrough.
- No fresh application/backend verification is claimed: the page reports existing verified repository facts and explicitly distinguishes screenshots from proof of backend safety. Private data and operational workbooks remain unpublished.
- Next.js emits the existing warning about multiple lockfiles and workspace-root inference; the build succeeds. The restricted first build stalled; the authorized retry completed.
- Native in-shell history preserves window state; the static route owns indexable metadata. Other projects retain their existing Workspace query navigation and independent direct-route layouts pending their separate design passes.
- Other project content, thumbnails and scripted presentations were deliberately left alone. BDRS reconciliation against `cc133f6` / `6a98164`, any broader shell refactor, propagation, merge and deployment are deferred.
