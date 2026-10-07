# Workspace V2 project presentation

Status: LabStock reset approved by the owner in the final end-to-end brief. The final system is authoritative at [FINAL_PORTFOLIO_SYSTEM.md](../release/FINAL_PORTFOLIO_SYSTEM.md). Earlier LabStock-only stop conditions below are historical and superseded.

## Authority and scope

The existing ADJIE_WORKSPACE_DESIGN_CONTRACT.md remains authoritative for the shell: wallpaper, floating draggable window, traffic lights, left navigation, dock, command palette, theme, Ask AI, mobile transformation and Quick Look. This addendum overrides project-content rules only where they conflict. LabStock is the sole benchmark in this pass. Other projects and their evidence boundaries are unchanged.

## Presentation

Editorial engineering case study, with neutral surfaces, precise typography and thin rules. Keep the existing font family. Reading measures stay near 740px; media spans the available window canvas. No giant project-colored containers, card grids, fabricated metrics, fake browser chrome or miniature evidence collages. Original desktop/phone silhouettes are allowed in the cover when they make the real product more recognizable. Headings establish hierarchy without excessive uppercase labels.

Narrative: product identity and desktop/phone cover, concise brief, spatial system diagram, engineering spread, three operational scenes, evidence index, demonstrated capability and public boundary. Compose each section around its content rather than repeating a single article layout. Show real software early. Walkthroughs may use documented content crops to improve readability. Every crop links to the complete original capture, with Quick Look access. The phone cover/detail uses a genuine viewport crop; the full-page original is never squeezed into a fictitious tall device. Public screenshots demonstrate interface behavior, not independent proof of backend correctness.

LabStock renders one LabStockCaseStudy component both from Workspace navigation and the statically exported /projects/labstock/ route. The route provides its project to the initial server render; all content exists immediately, before hydration. Metadata remains canonical and indexable. Old query links remain readable, but new LabStock navigation uses /projects/labstock/. Other direct project routes remain intact.

Facts stay in data/workspace.ts, including typed presentation flow and decisions. AI context remains derived. No data/projects.ts and no separate case-study facts file. Translations are translations of this source, not a second evidence record.

## Motion

Shared CSS tokens: fast 120ms, normal 220ms, slow 360ms; easing cubic-bezier(.2,.8,.2,1). Existing native View Transitions remain in use. Button presses, project entry and dialogs use restrained opacity/transform feedback. No animation dependency added.

One signature interaction: the user can trace source → validation → ledger → output. Stages receive sequential emphasis and connectors progress. Everything is already visible before activation. No looping or autoplay. Reduced motion hides the optional trigger, skips View Transitions and removes shared animation. Complete labels, movement types and correction/repeat-import branches remain visible.

LabStock has no fake prompt, response stream, Replay Demo, or content timer. Ask AI is a separate user-initiated action.

## Sound

UISound owns short filtered-noise transients: tap 35ms, open 75ms, close 50ms, success 90ms. Peak gain is 0.045 before low-pass filtering; a short attack and exponential decay avoid sharp edges. Original Web Audio generation; no downloaded samples or licensing dependency. Success is available but unused because this pass has no qualifying successful transaction.

AudioContext is created only from a directly activated meaningful control. No effects, load, hover, scroll or typing sounds. Project/Quick Look/palette opening and closing use semantic sounds; navigation and theme controls use tap. Visible desktop/mobile mute control persists aw-ui-muted locally; memory fallback works when storage is unavailable. Audio errors are caught and never prevent navigation. Sound supplements visible state. Ambient music remains independent and only starts from its explicit button, even when a previous visit saved an enabled preference.

## Media and privacy

Use existing verified public-safe captures only. No generated application UI, private data, internal URLs or production infrastructure. Neutral thumbnail composition may crop for a clear focal point, with exact provenance and transforms recorded. No upscaling or baked-in marketing text. WebP for website, JPEG for link previews. Preserve the old candidate for comparison.

See labstock-reset/README.md for current provenance, QA and screenshots. workspace-v2-labstock/README.md is the rejected historical candidate. Owner review of LabStock is required before redesigning another project. Passing tests does not constitute visual approval.
