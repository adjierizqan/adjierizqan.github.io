# Adjie Workspace — P0 prototype record

## Boundary

- Route: `/workspace/`
- Baseline: `e2ee01cfb611b7f511376f7f2e029837b31f141d`
- Branch: `feat/adjie-workspace-p0`
- No LLM, API, database, hosting, or deployment change.
- The existing home page and project routes remain available.

## Observable acceptance

- Visitors can browse Featured Work and Labs without using Ask.
- Ask uses local deterministic responses and visibly changes the selected work set.
- Any listed project opens into a richer workspace case-study view.
- SuhuLog includes an evidence gallery using the existing sanitized portfolio assets.
- Contact and Resume remain reachable in both workspace modes.
- Desktop uses a rail, main workspace, and reactive evidence panel; mobile uses a project-first flow with a compact Ask dock.
- Keyboard focus is visible and reduced-motion preferences disable transition motion.

## Donor record

- `rollacode/ai-portfolio` (MIT): state-derived browse/ask workspace, reactive content selection, contextual panel, and compact mobile conversation entry.
- Motion Primitives (MIT): transition-panel pacing, staggered content reveal, and progressive edge treatment.

Both donors informed interaction patterns. Their branding, content, visual identity, and application structure were not copied. The prototype keeps this repository's content model and local deterministic Ask behavior.

## Public content boundary

| Work | Content basis | P0 publication decision |
|---|---|---|
| LabStock | Owner-provided direction plus verified import/report/export repository history through `3197d66` | Publish workflow-level claims only. Withhold production URL, infrastructure, data, and screenshots. |
| BDRS | Owner-provided positioning; current public status still needs latest-remote evidence reconciliation | Include a deliberately limited entry. Withhold release/deployment claims and screenshots. |
| SuhuLog | Existing case study and sanitized screenshots at the inspected portfolio baseline | Reuse the existing factual substance and assets. |
| TomatoVision | Owner-provided authoritative metric distinction | Report baseline `0.795`, best single `0.807`, WBF `0.824`, and WBF mAP@0.5:0.95 `0.499` separately. |
| Labs | Existing portfolio project records and media | Reuse short summaries and existing media only. |

## Assets still required

- LabStock: a synthetic or demonstrably sanitized product screenshot set.
- BDRS: reconciled public case-study copy plus synthetic/sanitized screenshots.
