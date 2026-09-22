# Craft and motion curation

One project gets at most one signature interaction. Shared transitions stay quiet, respond to intent, and preserve the complete experience when `prefers-reduced-motion` is enabled.

| Surface | Selected interaction | Reference | Why | Complexity / dependency | Risk and fallback |
| --- | --- | --- | --- | --- | --- |
| Home | Existing restrained state transitions only | Transitions.dev: text state swap, tabs, tooltip | Keeps the launchpad responsive without competing with the composer. | Low / none | Low; instant state changes under reduced motion. |
| Project response | Fast deterministic text stream | Transitions.dev: Streaming Text | Makes the project opener read as a Workspace response while retaining static, truthful content. | Existing / none | Low; content appears immediately under reduced motion. |
| SuhuLog | Intent-driven product walkthrough | ObsidianUI: Split Showcase, adapted as a local two-pane evidence navigator | Connects entry, monitoring, reporting, and QR evidence without a long undifferentiated gallery. | Medium / none | Image decode is the main cost; `next/image` remains in use. Mobile stacks the media and controls; reduced motion removes the crossfade. |
| LabStock | Interactive source-to-ledger progression | Rare UI: Step Player interaction model | Explains import provenance, idempotency, correction, report, and export as one causal flow. | Medium / none planned | No autoplay; a static ordered flow is the fallback. |
| BDRS | Restrained workflow boundary progression | Transitions.dev: panel reveal / text state swap | Separates implemented, current, and planned states without suggesting unsupported completeness. | Low / none planned | Instant panels under reduced motion; full labels remain visible. |
| TomatoVision | Baseline-to-ensemble comparison reveal | Design Spells comparison patterns; Transitions.dev text swap | Lets visitors compare exact research outputs while keeping baseline and ensemble claims distinct. | Medium / none planned | Static side-by-side result table on reduced motion or narrow screens. |
| Padel Vision | Seekable pipeline step player | Rare UI: Step Player | Maps broadcast input through detection, tracking, court projection, and annotated output. | Medium / none planned | User-controlled only; static ordered steps without motion. |
| ObjectTwin | Input-to-generated-result comparison | ObsidianUI split interaction as reference | Makes the relationship between source input and 3D result inspectable. | Medium / none planned | Static paired figures when motion is reduced. |
| Porsche 3D | Controlled horizontal showcase | ObsidianUI horizontal media interactions | Gives the visual experiment one cinematic moment without introducing continuous 3D motion. | Medium / none planned | Native scroll-snap fallback; no scroll hijacking. |

## Shared implementation rules

- Prefer CSS transforms, opacity, native scrolling, and the existing View Transition support.
- Do not add a motion package until a selected interaction cannot be implemented accessibly with the current stack.
- Quick Look remains the common high-resolution evidence viewer.
- Project interactions never autoplay continuously or carry essential meaning through motion alone.
- Media continues to use local public-safe assets and Next.js image optimization behavior.

## Licensing check

- Rare UI documents its registry as MIT licensed. Its interaction models are references only in this milestone; no component source was copied.
- ObsidianUI links its source under MIT. The SuhuLog pilot adapts the Split Showcase idea with original local React/CSS and existing project assets; no donor source or demo asset was copied.
- Transitions.dev publishes copyable free patterns and separately labels Pro material. This milestone uses its public motion principles as references and copies no Pro source.
- Design Spells is used only as a taste and interaction index. No code or visual asset was copied.

Sources checked 2026-09-22: `rareui.com`, `obsidianui.dev`, `transitions.dev`, and `designspells.com`.
