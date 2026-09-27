"""Run the Padel Vision pipeline on the licensed RN7 clip and render the annotated video.

Input: RN7 "Padel Nations Cup moet harten veroveren op Plein '44" (CC BY 3.0), 21.5-29.2 s, 1920x1080 @ 50 fps.
Run from the padel-vision repo so its own modules and weights are used unchanged:
    cd ~/Projects/Labs/padel-vision && PYTHONPATH=src .venv/bin/python <this> <clip.mp4> <out_dir>

What runs (project code): YOLO11-pose player detection (yolo11m-pose.pt, imgsz 1920), SlotTracker for
stable P1-P4 identities, the fine-tuned ball detector (yolo11s_ball_1536/weights/best.pt) with
track_ball.link_track + interpolate, and detect_hits.ball_turn_candidates for contact events.

What does NOT run, and why: the court homography, top-down projection and minimap. The pipeline's
calibration is for the FIP broadcast camera; this clip is filmed from a low corner behind the side
glass and the near half of the court is out of frame, so four floor corners cannot be read without
guessing. The slot tracker therefore matches players by image-space foot position instead of court
metres (same Hungarian matching). Audio onsets are not used: the clip's audio is a news voice-over.
The only hand-set input is the image region that counts as the court (people behind the side glass
on the left are spectators and players of other matches).
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

from detect_hits import ball_turn_candidates
from slot_tracker import SlotTracker
from track_ball import collect_candidates, interpolate, link_track

clip, out = sys.argv[1], Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
DEVICE = "mps"
# Playing area in this camera view (image px): right of the side glass edge, below the back fence.
COURT = np.array([[250, 560], [1920, 560], [1920, 1080], [250, 1080]], np.int32).reshape(-1, 1, 2)

cap = cv2.VideoCapture(clip)
fps = cap.get(cv2.CAP_PROP_FPS)
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
cap.release()

# 1. players + stable identities
pose = YOLO("yolo11m-pose.pt")
tracker = SlotTracker(max_jump_m=8.0, ppm=6)  # 48 px/frame gate in image space
boxes = np.full((n, 4, 4), np.nan, np.float32)
kpts = np.full((n, 4, 17, 3), np.nan, np.float32)
cap = cv2.VideoCapture(clip)
for f in range(n):
    ok, frame = cap.read()
    if not ok:
        break
    r = pose.predict(frame, conf=0.25, classes=[0], imgsz=1920, device=DEVICE, verbose=False)[0]
    dets = []
    if r.boxes is not None and len(r.boxes):
        bx = r.boxes.xyxy.cpu().numpy()
        kp = r.keypoints.data.cpu().numpy()
        for i in range(len(bx)):
            x1, y1, x2, y2 = bx[i]
            foot = np.array([(x1 + x2) / 2, y2])
            if cv2.pointPolygonTest(COURT, (float(foot[0]), float(foot[1])), False) < 0 or (y2 - y1) < 120:
                continue
            dets.append((bx[i], kp[i], foot))
    assign = tracker.update([d[2] for d in dets])
    for slot, di in assign.items():
        boxes[f, slot] = dets[di][0]
        kpts[f, slot] = dets[di][1]
cap.release()
print("player coverage per slot:", [round(float(np.mean(~np.isnan(boxes[:, s, 0]))), 2) for s in range(4)])

# 2. ball
ball_model = YOLO("yolo11s_ball_1536/weights/best.pt")
cand = collect_candidates(ball_model, clip, n, 1536, DEVICE, 0.1, (0, 0, W, H), cls=0)
# Balls lying on the court are real detections but not the ball in play: drop candidates that stay
# within 8 px of the same spot for more than 0.6 s before linking (documented filter, not a hand edit).
def drop_static(cand, radius=8.0, min_frames=int(0.6 * fps)):
    pts = [(f, c[0], c[1]) for f, cs in enumerate(cand) for c in cs]
    static = set()
    for f, x, y in pts:
        span = [g for g, gx, gy in pts if abs(g - f) <= min_frames and np.hypot(gx - x, gy - y) <= radius]
        if len(set(span)) > min_frames:
            static.add((f, round(x), round(y)))
    return [[c for c in cs if (f, round(c[0]), round(c[1])) not in static] for f, cs in enumerate(cand)], len(static)
cand, n_static = drop_static(cand)
print("static ball candidates dropped:", n_static)
raw = link_track(cand, n, max_speed=180 * 30 / fps * 1.0)
ball = interpolate(raw, max_gap=int(12 * fps / 30))
print("ball detected frames:", int(np.sum(~np.isnan(raw[:, 0]))), "/", n, "after interpolation:", int(np.sum(~np.isnan(ball[:, 0]))))

# 3. contacts (ball-trajectory turns only)
hits = ball_turn_candidates(ball)[0]  # on the linked track; gaps are not bridged beyond interpolate()
print("hits:", hits)

np.savez(out / "rn7_results.npz", boxes=boxes, kpts=kpts, ball=ball, ball_raw=raw, hits=np.array(hits), fps=fps)
json.dump({"frames": n, "fps": fps, "slot_coverage": [float(np.mean(~np.isnan(boxes[:, s, 0]))) for s in range(4)],
           "ball_detected_frames": int(np.sum(~np.isnan(raw[:, 0]))), "hits": [int(h) for h in hits]},
          open(out / "rn7_summary.json", "w"), indent=1)

# 4. render
# Ball and hit overlays are NOT drawn for this clip. Checked frame by frame: after the static filter the
# linked track still jumps to glass reflections and fence, misses the ball in plain view, and yields
# 12 "hits" in 7.7 s. The ball detector was trained on the high broadcast angle; this low view behind
# the glass is outside its domain. Players (boxes, pose, P1-P4) are tracked reliably and are shown.
RENDER_BALL = False
COL = {0: (240, 191, 72), 1: (120, 220, 90), 2: (35, 166, 245), 3: (200, 120, 240)}  # one colour per ID (BGR); no team claim in image space
SKEL = [(5, 7), (7, 9), (6, 8), (8, 10), (5, 6), (5, 11), (6, 12), (11, 12), (11, 13), (13, 15), (12, 14), (14, 16)]
cap = cv2.VideoCapture(clip)
vw = cv2.VideoWriter(str(out / "rn7_annotated_raw.mp4"), cv2.VideoWriter_fourcc(*"mp4v"), fps, (W, H))
font = cv2.FONT_HERSHEY_SIMPLEX
for f in range(n):
    ok, frame = cap.read()
    if not ok:
        break
    for s in range(4):
        b = boxes[f, s]
        if np.isnan(b[0]):
            continue
        c = COL[s]
        x1, y1, x2, y2 = b.astype(int)
        cv2.rectangle(frame, (x1, y1), (x2, y2), c, 3)
        k = kpts[f, s]
        for a, bb in SKEL:
            if k[a, 2] > 0.4 and k[bb, 2] > 0.4:
                cv2.line(frame, tuple(k[a, :2].astype(int)), tuple(k[bb, :2].astype(int)), c, 2, cv2.LINE_AA)
        label = f"P{s + 1}"
        (tw, th), _ = cv2.getTextSize(label, font, 0.9, 2)
        cv2.rectangle(frame, (x1, y1 - th - 14), (x1 + tw + 14, y1), c, -1)
        cv2.putText(frame, label, (x1 + 7, y1 - 8), font, 0.9, (20, 20, 20), 2, cv2.LINE_AA)
    # ball trail (last 0.4 s) and position (disabled, see above)
    for g in (range(max(0, f - int(0.4 * fps)), f) if RENDER_BALL else ()):
        p, q = ball[g], ball[g + 1]
        if not (np.isnan(p[0]) or np.isnan(q[0])):
            cv2.line(frame, tuple(p.astype(int)), tuple(q.astype(int)), (80, 232, 248), 3, cv2.LINE_AA)
    if RENDER_BALL and not np.isnan(ball[f, 0]):
        cv2.circle(frame, tuple(ball[f].astype(int)), 14, (80, 232, 248), 3, cv2.LINE_AA)
    for h in (hits if RENDER_BALL else ()):
        dt = (f - h) / fps
        if 0 <= dt < 0.5 and not np.isnan(ball[h, 0]):
            r = int(18 + dt * 120)
            cv2.circle(frame, tuple(ball[h].astype(int)), r, (60, 166, 245), 3, cv2.LINE_AA)
            cv2.putText(frame, "HIT", (int(ball[h, 0]) + 22, int(ball[h, 1]) - 22), font, 0.9, (60, 166, 245), 2, cv2.LINE_AA)
    cv2.rectangle(frame, (24, 24), (640, 96), (20, 20, 20), -1)
    cv2.putText(frame, f"Padel Vision  |  players tracked {int(np.sum(~np.isnan(boxes[f, :, 0])))}  |  pose + ID", (40, 70), font, 0.85, (240, 240, 240), 2, cv2.LINE_AA)
    vw.write(frame)
cap.release()
vw.release()
print("rendered", n, "frames")
