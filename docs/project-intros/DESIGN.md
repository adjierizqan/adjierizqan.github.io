# AI start screen and project prompts

Owner decision, 7 October 2026: restore conversational **presentation** for all six projects. Earlier prohibitions on fake conversations were too broad. Honest scripted introductions are intentional; fabricated visitor turns, artificial inference, and timer-created content remain prohibited. Home should feel like an AI start screen inside the existing Workspace.

## Acceptance

- Home has a usable real Ask composer and suggested questions, identity, and visible product evidence. No request is sent until a visitor submits or chooses a question.
- Every canonical project has its own engineering prompt and concise factual answer in initial HTML, followed by its existing complete case study.
- Automatic presentation is silent and short; Skip is immediate, Replay is voluntary. Reduced motion and no JavaScript show the complete content.
- Real Ask is separate from the clearly labelled scripted introduction. No scripted answer is fetched.
- All six routes, shell interactions, keyboard focus, sound preference, responsive layouts and existing release gates remain intact.

## Home

The previous Home led with a prewritten answer. The new opening gives the visitor the controls: a central composer, three questions grounded in the work, and the existing portfolio beneath. The same Composer and `runAsk` transport serve Home and Ask; no second chat implementation or backend is introduced. The previous example is available through a native disclosure, explicitly labelled. Project covers, selected-work order, profile facts and inventory are unchanged.

## Project introduction

`data/workspace.ts` owns typed `opener.prompt` and `opener.response` for each project. These are presentation copy derived from its existing record, not new claims. Padel's question says “one camera” because the published clip is not the development broadcast. SuhuLog asks about simplifying entry without claiming a measured speed improvement.

`ProjectOpener` is shared by direct URLs and internal navigation. It precedes, rather than replaces, each existing study. Prompt words preserve wrapping; a complete screen-reader text is available immediately. Character spans are an aria-hidden visual presentation. Response and study are rendered in full.

Web Animations API: 180 ms settling; typing capped at 1,050 ms; 160 ms pause; 280 ms answer transition. Evidence is never fully hidden and settles over 280 ms. Total maximum ~1.8 seconds. No new dependency, looping animation, spinner, inference call or live-region chatter. Animations are cancelled on unmount or reduced-motion preference changes.

Skip and Replay share a stable button so keyboard focus remains in place. Automatic playback calls no audio code. Replay calls the existing quiet tap synchronously from its click handler. Mute and failure handling remain in the existing sound controller.

Intentional project selection requests an intro. Direct first visits play once per project per tab; refresh and history return show the completed state. Session storage is optional and backed by an in-memory set. Browser `back_forward` navigation does not automatically play. Replay is always available except under reduced motion; no-JS uses the complete static presentation.

## Scope and evidence

No six-study implementation, thumbnail, project inventory, original screenshot, credential, private endpoint, or Worker source changed. The AI-context generator was run: its output is unchanged because these intros restate existing facts and its public factual mapping is unchanged. Worker redeployment is unnecessary.

## Verification

`npm test`, lint, TypeScript, production build, static/privacy checks; four-width Chromium/WebKit route and visual checks; existing shell suites; new `npm run test:intros`. CI includes the new interaction suite before Pages deployment. The focused suite checks initial HTML, silent automatic sequence, zero scripted Ask requests, Skip/Replay focus, gesture audio, refresh/history, intentional re-entry, live reduced-motion changes and Home starter submission.

Screenshots are under `docs/project-intros/screenshots/`. Full matrices are local/CI artifacts; selected review captures are committed. Visual inspection is a separate check from test results. Physical-device subjective sound quality remains unverified; the existing sound engine is unchanged.

Local results: 37 portfolio tests + 12 Worker tests passed; lint, TypeScript, build and six-route static checks passed. The public text scan covered 103 files. The responsive matrix covered 56 route/viewport/browser combinations with zero overflow, broken images or console/page errors. Existing shell suites passed in both engines. No public media changed, and the generated AI context is byte-identical to the baseline.

Visual review covered the four primary project openings, desktop/tablet/phone Home, 320 px layouts, dark Home, the typing midpoint and reduced-motion state. The question has balanced line wrapping; product heroes retain their existing composition. Only the opening header participates in the evidence transition, avoiding animation of the entire long case study.

CI caught the first project image 2 px beyond the 760 px Home evidence threshold in Linux WebKit at 320 px. Mobile spacing was reduced by 32 px; the assertion was retained unchanged. The older presentation addendum now explicitly records the owner’s restored project-conversation decision.
