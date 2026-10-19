# Personal site v2 — discovery and evidence

Date: 2026-10-20. Branch: `feat/personal-site-v2`, based on `main` at `21444d3`.

Status labels: **VERIFIED** (checked in a source during this pass), **REPORTED** (stated by the owner or an earlier record, not rechecked), **INFERRED**, **UNKNOWN**.

## What was inspected

- Portfolio repository `adjierizqan/adjierizqan.github.io` at `21444d3`. GitHub Pages deployments API lists `21444d3` as the latest `github-pages` deployment (2026-10-08 08:46 UTC). **VERIFIED.** The live site at `adjierizqan.github.io` serves the macOS Workspace shell with six projects. **VERIFIED** (page text only).
- Product repositories through the GitHub API (tags, releases, branches, trees; no clone of hospital data, no database, no production login): `bdrs-system`, `labstock-pk`, `SuhuLog`.
- `jagau-website` (public) at `625d621`.
- Figma file `j0sv5711MVZwaWwwJvuFs7` (JAGAU design foundation), all page names plus the BDRS, LabStock, ELAB pages listed below.
- Reference sites through text extraction only. The browser pane was not linked to this session, so **no reference was inspected visually**, and no interaction or mobile layout was verified on them.

## Release state per product

| Product | Repository | Last confirmed production | Evidence | Later work not confirmed as deployed |
| --- | --- | --- | --- | --- |
| BDRS | `bdrs-system` (private) | `db90e5f`, tag `production-2026-10-08-db90e5f` | GitHub release "BDRS verified production db90e5ff", published 2026-10-08, describes it as a checkpoint of the live release. **VERIFIED** as a release record; the hospital server itself was not checked. | `master` is 343 commits behind that tag; no newer tag. |
| BDRS hemovigilance (HEMO-1) | — | **Not found** | No `hemov*` path in the production tree. Figma page is titled "BDRS · HEMO-1 Hemovigilans — USULAN, belum disetujui owner" (proposal, not approved). The owner-reported October hemovigilance release is **REPORTED, not verified**; it may exist only in a local branch. Transfusion-reaction records (controller, service, workbook export) are in the production tree. **VERIFIED.** | Excluded from public copy. |
| LabStock | `labstock-pk` (private) | tag `prod-2026-09-25` | Annotated tag: "Production release live since 2026-09-25 16:38 WITA … PASS 82/82". **VERIFIED** as a release record. | `main` is 46 commits ahead (receiving, WITA report periods, RBAC — merged 2026-10-16/19). Deployment of these is **UNKNOWN**. |
| SuhuLog | `SuhuLog` (private) | tag `v1.2.3` (2026-09-16) | `main` is one README commit ahead. **VERIFIED.** | none |
| ELAB | no remote repository visible to this session | **UNKNOWN** | Figma pages 05–14 contain document-library designs; pages 13 and 14 (2026-10-19) are labelled proposals not approved by the owner. The earlier inventory records BUILD-09 readiness on a local repo. | Not presented as shipped. |
| KOMED | `simkomed-ci` (private, pushed 2026-10-19) | **UNKNOWN** | Repository exists; contribution, state and media were not reviewed. | Not included. |
| TomatoVision | `tomato-ripeness-yolov11` (private) | Thesis research, not a deployed product | Metrics locked by `data/content-integrity.test.ts` against thesis tables. **VERIFIED** in portfolio data. | — |

Correction for public copy: the BDRS evidence row still names the 19 September 2026 release. The 8 October release is newer. Its notes describe assistant safety fixes and dependency updates with assistant features disabled; it does not change the workflow facts. Keep the September test-gate figures attributed to the September gate.

## Screenshot evidence matrix

Every public product image below is already in the portfolio and byte-identical in `jagau-website/public/projects/` (SHA-1 compared). Provenance is from `docs/release/FINAL_PORTFOLIO_SYSTEM.md`, `media-provenance.json` and `data/workspace.ts` `assetNote`.

| Asset set | Source / capture | Data | Matches released UI? | Status | Decision |
| --- | --- | --- | --- | --- | --- |
| LabStock `stok`, `hari-ini`, `amprah`, `amprah-mobile`, `laporan`, `thumb-reset-a` | Final release against `labstock_pk_demo` DB (assetNote) | Demo users, 22 generic items | Release at capture time **REPORTED** as the final release; post-09-25 UI changes are not in these images | VERIFIED_SAFE_PUBLIC_ASSET | Reuse. Do not imply receiving/Penerimaan features. |
| LabStock Figma `04 · LabStock / Showcase candidate` | Figma frames, `REFERENCE` components wrap the same captures | Same | — | APPROVED_DESIGN_ONLY (labelled CANDIDATE) | Reference only. |
| BDRS `workstation`, `dashboard`, `pengeluaran`, `inventaris`, `episode`, `laporan` | Sidebar-cropped derivatives of the final UI archive, synthetic fixtures | "DEMO PASIEN" synthetic | Captured from the September UI archive `6a98164` | VERIFIED_SAFE_PUBLIC_ASSET | Reuse. |
| BDRS `readiness`, `mobile` | Element-scoped originals, same archive | Synthetic, no hospital mark | Same | VERIFIED_SAFE_PUBLIC_ASSET | Reuse. |
| BDRS HEMO-1 Figma frames | Figma proposal | Synthetic | Not released | CANDIDATE_NOT_RELEASED | Exclude. |
| BDRS `qa/jagau-synthetic-recapture` branch (2026-10-09) | Workflow for isolated synthetic capture | Synthetic | Outputs are Actions artifacts, not in any repo | UNKNOWN | Not used; artifacts not inspected. |
| SuhuLog `device-story`, `phone-catat-suhu`, `desktop-monitoring`, `desktop-laporan` | Existing sanitized portfolio captures | Sanitized | v1.2.x UI | VERIFIED_SAFE_PUBLIC_ASSET | Reuse. |
| SuhuLog legacy QR label image | — | Encoded unverified URLs | — | PRIVATE_RESTRICTED | Stays removed. |
| SuhuLog root `public/projects/suhulog*.jpg` (4 files) | Older captures, not referenced by current data | Unreviewed in this pass | — | OUTDATED | Do not use; leave in place. |
| TomatoVision `real1-*`, `demo2-*` | Thesis weights on Wikimedia photos (Kolforn CC BY-SA 4.0; Alabama Extension, Pascal Kings CC0) | Demo, not evaluation | — | VERIFIED_SAFE_PUBLIC_ASSET | Reuse with attribution and "demo, not evaluation" label. |
| Padel Vision poster/clip | UsaOne Ell / Pexels clip analysed by the pipeline | Public stock | — | VERIFIED_SAFE_PUBLIC_ASSET | Reuse with credit. |
| Porsche 3D renders | Own Three.js scene; models by Ddiaz Design (Sketchfab, non-commercial) | — | — | VERIFIED_SAFE_PUBLIC_ASSET | Reuse with credit, "fan project". |
| ELAB Figma pages 05–14, reference browser capture | Figma, synthetic data | Synthetic | Release unknown | APPROVED_DESIGN_ONLY (09 batches) / CANDIDATE_NOT_RELEASED (13, 14) | Not used in v2. |
| THINK IT, ObjectTwin, BADUM/Warung Senja | — | — | — | UNKNOWN | Not used (see inventory). |

## Project selection

- **Featured:** LabStock, BDRS, SuhuLog (operational software); TomatoVision (applied AI research). Strongest evidence, released or examined work, safe media.
- **Experiments:** Padel Vision, Porsche 3D. Licensed media, clearly prototypes.
- **Not included:** ELAB (no confirmed release, contribution not reconciled), KOMED (not reviewed), THINK IT, ObjectTwin, BADUM, earlier coursework. Reasons are recorded in `docs/portfolio/PROJECT_INVENTORY.md`.
- **JAGAU:** appears once as the founder line and in the footer, linking to `jagau.id`. Its own site reuses the macOS Workspace look, so the new personal site deliberately does not.

## Domain facts

- `jagau.id` serves "JAGAU — Independent Software Studio". **VERIFIED** (page text, 2026-10-20). `jagau-website` docs record DNS on Rumahweb with mail records to preserve; the hosting of the live site was not confirmed here.
- `adjie.jagau.id`: a text fetch was refused by robots rules, so something may answer on that host (possibly a wildcard). **UNKNOWN.** Public DNS lookups are blocked from this session; the zone has not been inspected.
