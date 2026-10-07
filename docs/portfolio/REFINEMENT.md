# Personal opening and disciplined curation

7 October 2026. Baseline `39dee07`; branch `feat/workspace-personal-opening`.

## Diagnosis and decision

The released Home clearly showed work, but its large generic headline gave little reason for the Workspace identity. Real Ask was further down, and its composer still said Preview. The remedy is one integrated opening, not another full portfolio redesign.

Home now identifies Adjie and his software/full-stack role, labels an **Example conversation**, and connects a short answer directly to the existing product-led Selected Work. The example uses “Visitor,” not an assertion that the current visitor typed it. “Ask your own question” opens the separate live interface. The example never sends a Worker request.

The personal thesis is **“The record should tell you how it got there.”** Supporting copy points to stock movements, readings/corrections and careful research evaluation. It is stored once in canonical `data/profile.ts`, then derived into AI context. No new achievement, employment, metric or production claim was added.

The composition uses speaker labels and alignment rather than chat bubbles or more containers. The 76px speaker column collapses into above-text labels on phones. The smaller identity heading gives room to the conversation and actual screenshots within the first viewport. Explore Work is a native anchor with a focusable destination; neither reading nor navigation waits for animation. The four selected cases remain the core; real Ask, Labs, About and contact follow.

The reference principle is restrained application hierarchy, as discussed in [Linear's UI redesign](https://linear.app/now/how-we-redesigned-the-linear-ui). No reference layout, branding or assets were copied.

## Preserved work

All six study components, their CSS, canonical project facts, media and thumbnails are unchanged from the production baseline. Review found no clear defect warranting another redesign: LabStock's approved composition, SuhuLog's capture/review relationship, TomatoVision's comparison, BDRS's case workflow and the compact Labs stories already have distinct purposes. The thumbnail set retains its useful product/research/3D variation.

No Earlier Work category was created. [Project inventory](PROJECT_INVENTORY.md) records current work, additional candidates, contribution uncertainty, provenance and publication decisions. ObjectTwin remains intentionally excluded. ELAB is distinct from the unresolved E-Library reference; its README understates milestones found in its detailed truth record, but release closure/public-safe presentation are not assumed. The undergraduate Perpus.id fork lacks individual attribution. Old portfolio template entries linking other authors were rejected as owner evidence. No additional work was published or modernized.

## Interaction and sound

The full question, lead, answer and project links exist in original HTML. A single 360ms opacity/5px translation presents the answer; even its starting frame is readable. No typing timers, loading state, replay loop, sound call or AI request belongs to the intro. Reduced motion removes the effect entirely. There is no Replay control because the sequence is brief and does not contain information that needs replaying.

The existing sound engine and mappings are untouched: meaningful navigation retains gesture-driven tap/open/close feedback, global mute persists, audio failure is harmless. Explore Work uses a silent native anchor. Real Ask uses the existing navigation gesture. Physical-device sound audition remains a manual qualification.

Live screenshot review caught a pre-existing composer rule that constrained the labelled Projects suggestion to an icon-button width. Removed that stale selector and allowed the footer groups to wrap on narrow screens. A browser assertion now requires every visible suggestion label to fit its button. This is a bounded correctness fix, not a shell redesign.

## Recruiter review

- **10 seconds:** name/role, a concrete engineering concern, operational work and computer vision, plus real product imagery without scrolling.
- **30 seconds:** four primary projects remain in the same curated order; labels and summaries lead into distinct case studies.
- **2 minutes:** engineering decisions and inspectable evidence remain available through full static routes and Quick Look. Labs give breadth without unverified archive claims.

This is a design assessment, not a measured hiring outcome or external visual approval.

## Acceptance and evidence

Regression coverage checks complete initial HTML, explicit example framing, all four proof links, no fake loading, no passive AI requests/audio, visible first-viewport media, reduced-motion completion, no-JS Home, Explore navigation and a real visitor request reaching the Ask transport. Browser tests use a clearly identified fixture; live deployment smoke uses the actual Worker and waits for response completion.

Existing six-route, metadata/privacy, Chromium/WebKit, shell, focus, history, sound/mute and audio-failure gates remain required. CI now also runs on the refinement branch. Unit total is 36 portfolio + 12 Worker tests. Full machine evidence remains in `docs/release/*-results.json` and CI artifacts. Production results and deployed commit are recorded in local `PRODUCTION.md` after deployment, not predicted here.

Screenshots in `screenshots/` include 1440/834/390/320 Home, dark Home, Selected Work, Ask entry, all six project openings and their section views. Selected Home screenshots are committed; the full matrix is local/CI evidence. Browser capture waits for completed animations after testing reduced-motion changes, avoiding misleading mid-transition images.

No new media imported; the existing public asset tree and its source/privacy provenance are preserved. The static scan is rerun against the new export. Inventory prose intentionally omits private operational identities, records and infrastructure. It is documentation, not new public project or AI-context material.

Optional future work is limited to the inventory's specific evidence gaps and physical-device sound review. More projects and another redesign are not automatic next steps.
