# LabStock — reset candidate

Status: **approved by the owner in the final end-to-end brief**. This replaces the rejected first V2 presentation. It does not approve or propagate a design to any other project.

Branch: `feat/workspace-v2-labstock`, still based on `a689541`. The working tree contains both the original correctness foundations and this replacement presentation. Main is unchanged; no reset, merge, commit, push or deployment was performed.

## Design decision

**Every movement has a source.** The opening identifies laboratory inventory and presents the desktop application with phone entry before asking the visitor to read the engineering story. The media cover leads into three operational scenes: finding work that needs attention, recording a requisition, and producing the final workbook.

The rejected candidate was a repeated sequence of heading, paragraph and image. This replacement uses different compositions for different kinds of information:

- An asymmetric identity lockup and a desktop/phone product cover. Role and stack follow the product instead of delaying it.
- A short brief with a margin label and paired problem/build copy.
- A source-document → validation → ledger → output diagram. A compact charcoal ledger is the visual center; document and report geometry are explanatory marks, not fake application data or charts. Tablet/phone flow follows a numbered U-shaped route.
- A separate engineering spread: editorial headline opposite large numbered decisions, with direct phrases describing each invariant.
- Three product scenes: annotated Today detail; desktop/phone requisition pairing; near-full-width report. Stock is a supporting view, rather than another large duplicate opener.
- An evidence index links claims to the relevant explanation or report screen. It explicitly distinguishes the public record from an independent backend test.

Typography retains Geist. Georgia is used only as an editorial accent, consistent with the existing shell contract's serif-accent allowance. No global font change or new typeface download. Thin rules, quiet surfaces and differing column proportions create rhythm without a collection of generic cards.

## Reference synthesis

Official references inspected on 2026-10-07. No reference source code, screenshot, illustration, device asset or brand styling was copied into the product.

| Reference | Principle used | Deliberately excluded |
| --- | --- | --- |
| [Meya Lab / Elera](https://meyalab.com/projects/elera) | Product media as a composed, prominent visual; distinct desktop/mobile scenes | Brand palette, layout copying, external images, testimonials and metrics |
| [Linear — UI redesign](https://linear.app/now/how-we-redesigned-the-linear-ui) | Hierarchy, alignment and reducing competing chrome | Reworking the owner's preserved shell or copying Linear UI |
| [Brittany Chiang](https://brittanychiang.com/) | Clear identity, role and scannable explanations | Personal branding, code and decorative cursor treatment |
| [Prompt Folio — official listing](https://www.framer.com/marketplace/templates/prompt-folio/) | Personal language, restrained type and spacing, a real invitation to ask | Simulated conversations, prompt/response reveal, template structure |

Official page content was read; accessible reference pages were also inspected through Chromium. Some reference live previews timed out during font/render loading, so no unsupported claim is made about their animation timing. The implementation uses original local code and existing LabStock evidence.

## Thumbnail explorations

[All five thumbnails side by side](thumbnail-explorations.png): original, rejected first V2, and three replacements.

- **A / Desktop + field entry — selected.** Today provides a recognizable desktop product; the larger phone makes the second form factor clear. Quiet stone background and narrow hardware silhouettes preserve the product character of the original without the rejected crop's loss of context.
- **B / Graphite product studio.** Stock view with smaller phone on a dark neutral background. Explores stronger silhouette contrast; less inviting as the primary cover.
- **C / Reporting + requisition.** Report-first composition with phone on the left. Useful for the export narrative; less expressive of day-to-day use than A.

Selection is the implementation choice, **not owner visual acceptance**.

Site cover: `public/projects/labstock/thumb-reset-a.webp`.
Social preview: `public/projects/labstock/thumb-reset-a.jpg`.
Alternatives: `thumb-reset-b.*`, `thumb-reset-c.*` in the same folder.
Original and rejected thumbnails remain untouched for comparison.

## Provenance and transformations

All input images were already public in `public/projects/labstock/`: `hari-ini.webp`, `stok.webp`, `amprah.webp`, `amprah-mobile.webp`, `laporan.webp`. They were inspected and retain the canonical provenance: final-release captures against the synthetic `labstock_pk_demo` database, as recorded in `docs/design/v101/build_assets.py` and `data/workspace.ts`. No live production environment was accessed.

`media.cjs` reproducibly creates every new image. `media-transforms.json` records exact crops and composition coordinates.

- Thumbnails: 1600 × 1000 canvas. Source desktop captures are 1440 × 1024 and are only downsampled. Phone source is 390 × 1543; cover/detail uses its top 390 × 844 viewport crop, then downsamples for the cover. Original source remains accessible in Quick Look.
- Hardware silhouettes, neutral surfaces and shadows are original SVG geometry, composited with Sharp. They illustrate desktop/handheld context, with no claim to a particular physical device. No fake UI, text labels or metrics are painted onto the screenshots.
- Today detail: `(280,80,1136,888)`, removing app sidebar and top chrome while retaining the operational content.
- Desktop requisition: `(280,80,1136,704)`, retaining its title, selected items and save action.
- Report detail: `(280,80,1136,920)`, retaining filters, report rows, correction column, closing balance and Excel control.
- Phone detail: `(0,0,390,844)`. Labeled as a detail; the original full page is linked, not misrepresented as a new capture.
- Website images use WebP; all thumbnail options also have JPEG derivatives. No input is upscaled.

Reproduce: `node docs/design/labstock-reset/media.cjs`.

## Architecture, motion and sound

The existing Workspace shell and sound implementation are retained. No other project presentation is redesigned. `LabStockCaseStudy` is still the sole presentation for Workspace navigation and the real static `/projects/labstock/` route. All content is present without timers, including in exported HTML. Image links have genuine original-image destinations without JavaScript and open the existing Quick Look when enhanced.

Facts and copy remain in `data/workspace.ts`; the generated AI context was rebuilt after the concise copy rewrite. New category, hero and walkthrough fields are typed canonical presentation data. Translations use the existing locale system.

The signature interaction is a single user-triggered pass through the diagram: stage marks activate in order and connectors progress. It changes no facts, hides no text and never loops. It uses Web Animations with transform/opacity and the same restrained easing as the shared motion tokens. Reduced motion shows the full static system and removes the optional trigger. UI sounds remain quiet, original and gesture-only, with a locally persisted mute preference; no sound on load, hover or scroll. Trace activation uses one tap.

## Changed files

- `components/labstock/LabStockCaseStudy.tsx`, `labstock.css`: replacement presentation and responsive diagram.
- `components/workspace/UISound.tsx`, `motion.css`: retained sound, motion and Quick Look foundations.
- `components/WorkspacePrototype.tsx`: shared case-study integration, canonical navigation, media viewer and gesture sound integration.
- `app/projects/[slug]/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/theme-dark.css`: real-route integration, shared motion import and removal of obsolete LabStock styling.
- `data/workspace.ts`, `data/portfolio-ai-context.json`, `lib/projects.ts`: canonical presentation data, derived context and social-image selection.
- `lib/i18n-id.ts`, `scripts/i18n-keys.mjs`: translations and coverage of new presentation fields.
- `data/labstock.test.ts`, `data/routes.test.ts`: exported-content and route metadata verification.
- `public/projects/labstock/`: three thumbnail pairs and four explicitly derived detail images; rejected thumbnail retained for comparison.
- `docs/design/WORKSPACE_V2_PROJECT_PRESENTATION.md`, this folder and the archived `workspace-v2-labstock` report: rules, provenance, reproducible generation/QA scripts and visual evidence.

## Checks and review artifacts

Final production run: **PASS**. All four widths have zero document/content overflow, zero broken images and no audio contexts or playback on load. Browser error collection is empty. Navigation, focus/Escape, desktop/mobile dragging behavior, theme, reduced motion, mute persistence and audio failure checks passed. Screenshots below were regenerated after the final build and inspected.

- `npm test`: 35 portfolio tests + 11 Worker tests.
- `npm run lint`.
- `npx tsc --noEmit`, using the actual tsconfig (no package typecheck script exists).
- `npm run build`, generating all six canonical project routes.
- Production static export served on `http://127.0.0.1:4179`.
- Chromium script: `node docs/design/labstock-reset/qa.cjs`. `PLAYWRIGHT_MODULE` and `QA_BASE` are overridable. No package added; uses the owner's existing Playwright installation.
- [Machine-readable browser results](qa-results.json).

| Surface | Desktop 1440 | Tablet 834 | Phone 390 |
| --- | --- | --- | --- |
| Opening | [View](screenshots/1440-opening.png) | [View](screenshots/834-opening.png) | [View](screenshots/390-opening.png) |
| Full hero media | [View](screenshots/1440-hero-media.png) | [View](screenshots/834-hero-media.png) | [View](screenshots/390-hero-media.png) |
| Flow | [View](screenshots/1440-flow.png) | [View](screenshots/834-flow.png) | [View](screenshots/390-flow.png) |
| Decisions | [View](screenshots/1440-engineering.png) | [View](screenshots/834-engineering.png) | [View](screenshots/390-engineering.png) |
| Product | [View](screenshots/1440-product.png) | [View](screenshots/834-product.png) | [View](screenshots/390-product.png) |
| Requisition | [View](screenshots/1440-request.png) | [View](screenshots/834-request.png) | [View](screenshots/390-request.png) |
| Report | [View](screenshots/1440-report.png) | [View](screenshots/834-report.png) | [View](screenshots/390-report.png) |
| Evidence | [View](screenshots/1440-evidence.png) | [View](screenshots/834-evidence.png) | [View](screenshots/390-evidence.png) |
| Dark | [View](screenshots/1440-dark.png) | [View](screenshots/834-dark.png) | [View](screenshots/390-dark.png) |

Additional captures include dark flow, reduced motion, actual-size Quick Look, 320px stress width and the [full phone page](screenshots/390-full.png). Viewport captures use the real Workspace scroller, with no artificially enlarged desktop window.

## Limits / stop boundary

Technical passes do not approve the design. Owner visual review and listening on real hardware remain pending. Chromium QA does not constitute a cross-browser, physical-device or WCAG audit. Live Ask AI was not called; existing client/Worker tests cover its retained behavior. The pre-existing multiple-lockfile warning remains in the successful build.

Original screenshots are finite-resolution evidence, not newly captured higher-resolution screens. Cropped views are presentation derivatives, with full original evidence reachable. No backend re-audit or new deployment/usage claim is implied.

No work on SuhuLog, TomatoVision, BDRS, Padel Vision or Porsche 3D. No propagation, merge or deployment. Stop here for owner review.

## Subsequent owner decision

The final end-to-end brief approved this candidate and authorized portfolio-wide completion, merge and deployment after release gates. The earlier stop boundary is historical. See `docs/release/FINAL_PORTFOLIO_SYSTEM.md`.
