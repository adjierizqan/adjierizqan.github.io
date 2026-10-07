# Professional refinement — 7 October 2026

Baseline: `ea26259`. The owner approved the chat-first direction and requested an independent design audit and reference-led polish. This is a refinement, not a replacement of Home, the Workspace shell or the six case studies.

## Research and decisions

- [Linear: A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh), March 2026: supporting navigation should carry less weight than the work; soften separators and keep controls predictable. Applied to navigation state, shared composer surfaces and toolbar controls.
- [Brittany Chiang](https://brittanychiang.com/): clear name/role hierarchy, readable supporting copy, project descriptions with substance. Applied to identity scale, preview captions and case-study/chat reading sizes. No layout, assets, code or brand styling copied.
- Claude's public entry was attempted as an additional reference but did not reach a stable loaded chat screen in this environment; it is not claimed as a reviewed authenticated interface. The owner's approved AI-start composition remains the source of truth for the conversational layout.

## Audit findings and bounded changes

1. Home and LabStock were both selected when Home was open. Project selection now depends on the current view; `aria-current="page"` reports one destination. Browser tests enforce this on Home and all six project routes.
2. The desktop project previews were only 72 × 45 px. They are now 96 × 60 px with larger category captions, keeping the three shortcuts visible in the first viewport. Mobile retains its three-image arrangement.
3. Supporting Home text and project chat text were undersized. Identity, captions, prompt/answer typography and suggestion targets have been raised selectively. Mobile composer input uses 16 px to avoid automatic focus zoom in iOS Safari.
4. Composer colors came from the automatic legacy theme conversion, while newer Home surfaces used their own colors. `interface.css` owns explicit shared light/dark control tokens for composer, send, focus, navigation selection and toolbar feedback. It does not replace the existing theme or recolor product media.
5. Real Ask used a narrow label column beside the visitor question, unlike the approved project chat. It now shares right-aligned question geometry, reading size and spacing with the scripted openers. Newlines in actual answers are preserved.
6. Early dark screenshots captured color transitions in progress. The old production border was confirmed to settle to `rgb(52,53,56)`; it was **not** permanently white. The new token palette is a deliberate refinement, not a fix for a nonexistent settled-state white-border bug. Screenshot QA now waits for actual animations/transitions to finish.

## Acceptance

- Preserve the approved prompt → answer → result sequence, immediate semantic HTML, Skip/Replay, silent autoplay and reduced-motion behavior.
- Preserve single icon-only audio control and persistent preferences.
- Exactly one current sidebar destination on Home and direct project pages.
- Composer, send control and focus states remain distinguishable in light/dark; preview labels stay readable.
- Real project previews visible before scrolling at 1440/834/390/320; no page or content overflow.
- Real Ask, request cancellation, canonical routes, no-JS studies, shell navigation and Quick Look continue working.
- Inspect screenshots at desktop/tablet/mobile and both themes. Run existing full release gates before deployment.

## Evidence

`docs/polish/screenshots/` contains the browser matrix, project sections, conversation states, reduced-motion and production smoke evidence. Ask images from the local regression suite contain a visibly labeled fixture; production smoke uses the real Worker. No project facts, thumbnails, public media, generated AI context or Worker code changed. No new dependencies.

Local verification: 37 portfolio tests + 12 Worker tests, lint, TypeScript, production export and static/privacy checks passed. The responsive matrix passed all 56 route/viewport combinations in Chromium and WebKit. Intro tests and shell tests passed in both engines. Settled screenshots were reviewed for Home, Ask, all four primary project openings, selected work, tablet and 320/390 px mobile. Browser fixture content is not public project evidence. Subjective sound quality on physical hardware was not reassessed; the engine and sound mapping were unchanged.
