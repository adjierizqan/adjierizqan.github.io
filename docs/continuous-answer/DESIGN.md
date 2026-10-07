# One project answer — 7 October 2026

Owner-requested focused correction, based on approved production `2fdc6ca`. The prompt cited older `6916be4`; all newer approved refinements are preserved. This document supersedes the separate chat/result presentation and visibility-gating requirements in `docs/chat-fix/DESIGN.md`.

## Observable acceptance

- No visible “Example conversation” or project-demo metadata. A scripted-introduction description remains accessible; the visitor is never presented as the author of a scripted question.
- One AI response section contains the lead, exactly one existing primary study article, product evidence, engineering sections and the Ask follow-up. One identity marker; shared left edge and compact response-to-hero spacing; no wrapper card or repeated AI labels.
- Prompt presentation, identity, lead and opening header unfold in at most 1.48 seconds. Only opacity/transform is animated. The study container is never hidden/inert. Full prompt, response and study are in initial HTML. No Worker request, artificial loading or passive audio. Skip is silent; Replay retains gesture tap. Reduced motion/no-JS show the complete state.
- Same-page section links use native smooth scrolling with focused targets and sensible offsets. Desktop scrolls `.aw-center`; mobile scrolls the document and clears the 52 px toolbar. Reduced motion uses instant scrolling.
- Porsche's original recording is an inline figure with controls, muted and playsInline. A single automatic play attempt occurs at 45% visibility, pauses below 10% or when the tab is hidden, and never loops/restarts on re-entry. Reduced motion prevents the attempt. A rejected play promise leaves the visible poster and controls. Visitor input takes ownership.

## Implementation

`ProjectOpener` now accepts the existing study as children inside `.project-intro-answer`. `WorkspacePrototype` no longer appends an independent `.project-story` sibling. Existing study components, project facts, imagery and canonical routes are unchanged. Header top padding is normalized only inside this frame; SuhuLog's phone relationship is retained with top-aligned copy.

`lib/section-navigation.ts` is explicitly attached to Home Explore Work, SuhuLog Follow a Reading and LabStock stock/evidence links. It ignores modified clicks and non-local URLs. It updates the current hash using replaceState (no extra route entry), focuses without scrolling, then invokes native scrollIntoView. No global smooth-scroll setting, timer, scroll loop or event interception for routes, history, sidebar, modal or Quick Look.

`VisibilityVideo` owns only Porsche's original recording. IntersectionObserver, matchMedia and visibilitychange listeners are cleaned up on unmount. Controls remain native; preload is none; no media audio can autoplay. Padel's video remains visitor-controlled.

Home's existing expandable introduction is labeled “A quick introduction”; its accessible region is “Scripted introduction”. The Home composer, suggestions and composition are preserved.

## Verification and evidence

- Static tests verify initial prompt/response/story markup and inline Porsche video without details.
- The intro suite checks a single primary study inside the response, the 1.8-second ceiling, present/inspectable study during typing, zero scripted Worker calls/audio, Skip/Replay, history, refresh and reduced motion.
- `test:integration` checks intermediate native scroll positions, the actual desktop/mobile scroll root, focus, all identified LabStock section links, reduced motion, inline muted playback attempts, one-shot behavior, offscreen pause and rejected autoplay. Included in deployment CI.
- Existing portfolio/Worker tests, static/privacy, full Chromium/WebKit matrix and shell tests remain required.
- Screenshots: `docs/continuous-answer/screenshots/`, including Home before/after section navigation, project openings, Porsche recording and reduced-motion state.

No project facts, thumbnails, inventory, Worker context, sound engine or third-party media changed. No new dependencies.

Local release checks passed: 38 portfolio tests and 12 Worker tests, lint, TypeScript, production build, six static routes and 103 public text files, the 56-case Chromium/WebKit viewport/route matrix, both shell suites, both intro suites and both new integration suites. Tested widths: 1440, 834, 390 and 320. Screenshots were reviewed for the integrated answer alignment and mobile layout; `screenshots/interaction.mp4` records the prompt sequence and native Home scrolling. `screenshots/porsche-playing.png` captures the original recording after playback progressed beyond three seconds.
