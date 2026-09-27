# Padel Vision: real play clip (provenance)

The main video on the Padel Vision page (`public/projects/padel-vision/real/pexels-analyzed.mp4`) is the
Padel Vision pipeline's own output on a licensed stock clip. The FIP broadcast footage used during
development is still not used anywhere public.

| Field | Value |
|---|---|
| SOURCE_URL | https://www.pexels.com/video/aerial-view-of-exciting-padel-match-33444758/ |
| FILE | https://videos.pexels.com/video-files/33444758/14232219_2560_1440_30fps.mp4 |
| AUTHOR | UsaOne Ell (Pexels) |
| LICENSE | Pexels License (free use and modification, attribution not required; credited anyway) |
| LICENSE_URL | https://www.pexels.com/license/ |
| DOWNLOAD_DATE | 2026-09-27 |
| SHA-256 (source .mp4) | 194451a208ac4c274b113ae3d8ffc49ccf6cf0a67d7260185fa92fbb48066888 |
| Cut | whole clip, 12.9 s, 2560x1440 @ 29.97 fps, no audio; analysed at 1920x1080 |

Players are recreational players on an outdoor club court filmed by drone; the page does not name them or
comment on their play.

## Analysis run (V1.0.5)

`pexels_analysis.py` (this folder) runs the research repo's code (`~/Projects/Labs/padel-vision` at `e782193`)
and renders the overlay. Nothing is drawn by hand. Per-frame numbers: `pexels-summary.json`.

| Stage | Shown | Result on this clip |
|---|---|---|
| Registration to frame 0 (SIFT + RANSAC; the drone drifts) | used everywhere | ≥509 inliers per frame; projected service and centre lines land on paint in ≥90% of sample points in every 5th frame (median 97%) |
| Court calibration (4 service-line ends, frame 0) | court map | independent check: centre line ends 0.7 px and 5.4 px from the projected points |
| Player detection + pose (YOLO11m-pose, imgsz 1920) | yes | boxes + skeletons |
| IDs (`SlotTracker`, court metres) | P1–P4 | coverage 1.00 / 1.00 / 1.00 / 0.84 (P4 is the near player, partly behind the near fence) |
| Ball (yolo11s_ball_1536 + `link_track` / `interpolate`) | yes | 3553 raw candidates → 239 after airspace, cap and recurring-spot filters → 160 linked frames (187 with gaps ≤ 8 frames filled). Spot check of every third drawn detection: 51 of 54 on the ball |
| Hits (`ball_turn_candidates` + player-reach gate) | 2, both P2 | turns at frames 92, 227, 279, 307, 341. 92 and 341 are verified P2 contacts. 307 (a P2 overhead) falls outside the reach gate; 227 (near player, box missing that frame) and 279 (bounce) are not labelled. Some contacts in the rally are therefore unmarked. |
| Court map (inset) | yes | player feet projected through registration + calibration |

Output: 1280x720, 29.97 fps H.264, 12.9 s.

## Superseded: RN7 clip (V1.0.4)

V1.0.4 used a 7.7 s cut of an RN7 news report (CC BY 3.0,
https://commons.wikimedia.org/wiki/File:Padel_Nations_Cup_moet_harten_veroveren_op_Plein_%2744.webm,
SHA-256 of the source 731837fd051371e67110563de82e019cfd5496636038b4efc0edf9ca94d9992d). The camera was low and
behind the side glass: players tracked, but the ball track followed reflections and 12 "hits" in 7.7 s were not
credible, and the court could not be calibrated. That run is kept as `rn7_analysis.py` and `rn7-summary.json`;
its video is no longer published.
