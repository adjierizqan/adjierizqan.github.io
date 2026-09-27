# Padel Vision: real play clip (provenance)

The main video on the Padel Vision page (`public/projects/padel-vision/real/rn7-analyzed.mp4`) is the
Padel Vision pipeline's own output on a 7.7 s, muted cut of a licensed news report. The FIP broadcast
footage used during development is still not used anywhere public.

| Field | Value |
|---|---|
| SOURCE_URL | https://commons.wikimedia.org/wiki/File:Padel_Nations_Cup_moet_harten_veroveren_op_Plein_%2744.webm |
| AUTHOR | RN7 (regional broadcaster, Nijmegen); uploaded from RN7's YouTube channel |
| LICENSE | CC BY 3.0 |
| LICENSE_URL | https://creativecommons.org/licenses/by/3.0/ |
| RECORDED | 2018-08-20, Padel Nations Cup, Plein '44, Nijmegen |
| DOWNLOAD_DATE | 2026-09-26 |
| SHA-256 (source .webm) | 731837fd051371e67110563de82e019cfd5496636038b4efc0edf9ca94d9992d |
| Cut | 21.5 s – 29.2 s (one continuous rally shot, no captions); scaled to 1280 px, audio removed, H.264 |

Attribution is shown in the figure caption (author, licence, link to source); the RN7 corner mark is kept.
Players in the shot are athletes at a public sports event filmed by a broadcaster.
No search found owner-recorded padel footage on this machine (every clip in the research repo is FIP broadcast).

## Analysis run (V1.0.4)

`rn7_analysis.py` (this folder) runs the research repo's code (`~/Projects/Labs/padel-vision` at `e782193`)
on the full-resolution cut (1920x1080, 50 fps, 385 frames) and renders the overlay. Nothing is drawn by hand.

| Stage | Ran | Shown | Result on this clip |
|---|---|---|---|
| Player detection + pose (YOLO11m-pose, imgsz 1920) | yes | yes | boxes + skeletons |
| ID assignment (`SlotTracker`, Hungarian, image space) | yes | yes (P1–P4) | slot coverage 0.27 / 0.87 / 0.86 / 0.83; P1 is the near player, often cut by the frame edge |
| Ball detection + tracking (yolo11s_ball_1536) | yes | **no** | ball in 190 / 385 frames after dropping static candidates; the track follows glass reflections and fence points and misses a visible ball |
| Hit markers (ball turn candidates) | yes | **no** | 12 "hits" in 7.7 s, not credible; derived from the unreliable ball track |
| Court homography / minimap | no | no | the camera is low, behind the glass, and the near half of the court is out of frame, so the court cannot be calibrated honestly |

Per-frame numbers: `rn7-summary.json`. Output: 1280 px, 30 fps H.264, SHA-256
`ad3622770a7dc45b2cec133082486dea2e1d78292b3fee3878f39262e754c95a`. The minimap / court-control replay below
the video comes from the development run, not from this clip.
