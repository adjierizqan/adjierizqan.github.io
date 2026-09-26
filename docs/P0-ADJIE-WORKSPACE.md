# Adjie Workspace — V1 milestone record

## Current status

| Milestone | Status | Evidence |
| --- | --- | --- |
| Workspace core | DONE | Static-export workspace shell, responsive navigation, window controls, dock, command palette, and project routing are implemented. |
| Ask AI | DONE | Static frontend streams project-scoped answers through the isolated Cloudflare Worker architecture. Production deployment remains a separate release gate. |
| Home V1 | DONE | Identity, composer, compact suggestions, and featured work use the widened workspace canvas. |
| Craft curation | DONE | `docs/design/CRAFT_MOTION_CURATION.md` defines one bounded signature interaction per project. |
| SuhuLog pilot | DONE | Five sanitized screenshots form an intent-driven walkthrough with Quick Look. |
| LabStock V1 | DONE WITH MEDIA GAP | Interactive source → import → ledger → report → export explanation is complete. Public-safe product capture is pending. |
| BDRS V1 | DONE WITH MEDIA GAP | Implemented → current → planned evidence progression is complete. Public-safe product capture remains unavailable. |
| TomatoVision V1 | DONE | Research narrative, real media, and exact baseline/single-model/WBF comparison are implemented. |
| Padel Vision V1 | DONE | Seekable vision-pipeline story uses existing public image and video output. |
| ObjectTwin V1 | DONE | Input → generation → evaluation → browser inspection story uses existing public image and video output. |
| Porsche 3D V1 | DONE | Controlled still/interaction showcase uses existing public image and video output. |

## Public content boundary

- LabStock exposes workflow-level evidence only. Production infrastructure, operational data, private URLs, and unsanitized screenshots remain withheld.
- BDRS publishes only reconciled workflow-level facts. Production, deployment, compliance, integration, and user claims remain unpublished unless canonical evidence supports them.
- SuhuLog uses the existing sanitized portfolio captures and public-safe behavior.
- TomatoVision keeps baseline `0.795`, best single modified model `0.807`, WBF `0.824`, and WBF mAP@0.5:0.95 `0.499` distinct.
- Padel Vision, ObjectTwin, and Porsche 3D remain clearly labeled experiments.

## Deferred candidates

THINK IT, E-Library, Document Template Generator, Adjie Core, Quantara, Affiliate Automation, and other small projects remain future candidates and are not published in Workspace V1.

## Remaining media gaps

- LabStock: synthetic or demonstrably sanitized product screenshot set.
- BDRS: synthetic or demonstrably sanitized product screenshot set after canonical public evidence is reconciled.

## Release boundary

This record describes the local V1 candidate on `feat/adjie-workspace-p0`. Production Worker and frontend deployment, production CORS/API configuration, and production smoke remain separate approved release steps.
