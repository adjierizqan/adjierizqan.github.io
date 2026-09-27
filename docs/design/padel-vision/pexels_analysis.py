"""Run the Padel Vision pipeline on the licensed Pexels drone clip and render the annotated video.

Input: "Aerial View of Exciting Padel Match" by UsaOne Ell, Pexels video 33444758 (Pexels License),
2560x1440 @ 29.97 fps, 12.9 s, scaled to 1920x1080 before analysis.
Run from the padel-vision repo so its own modules and weights are used unchanged:
    cd ~/Projects/Labs/padel-vision && PYTHONPATH=src .venv/bin/python <this> <clip_1080.mp4> <out_dir>

Project code that runs unchanged: YOLO11-pose player detection (yolo11m-pose.pt, imgsz 1920),
SlotTracker in court metres, the fine-tuned ball detector (yolo11s_ball_1536) with
track_ball.collect_candidates / link_track / interpolate, and detect_hits.ball_turn_candidates.

Added for this clip, because the camera is a slowly drifting drone rather than a fixed broadcast camera:
  * Registration: every frame is registered to frame 0 with SIFT + RANSAC on the whole image, so the
    court calibration and the ball track live in one stable coordinate frame.
  * Calibration (frame 0): four floor points where the two service lines meet the side walls, read from
    the painted lines (same 4-point homography as court.py). Checked against lines not used in the fit.
  * Ball filtering: candidates outside the court's airspace, on the top of a player's box (a white cap
    is detected as a ball), or recurring at one registered spot in 6+ frames (bleacher markings behind
    the far glass, lamps, balls lying on court) are dropped before linking; after linking, detections with
    fewer than 3 linked detections within +-3 frames are dropped as isolated.
  * Hits: ball_turn_candidates runs on the full linked track; a turn counts as a hit only when the ball
    is within reach of a tracked player (0.6 box heights around the box, not below the feet);
    other turns (bounces, wall rebounds) are not labelled.
No audio onsets: the clip has no audio track.
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
PPM = 50  # top-down px per metre, as court.py

cap = cv2.VideoCapture(clip)
fps = cap.get(cv2.CAP_PROP_FPS)
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frames = []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    frames.append(fr)
cap.release()
n = len(frames)

# 0a. calibration in frame 0: service line ends (court metres -> image px)
COURT_M = np.float32([[0, 3.05], [10, 3.05], [10, 16.95], [0, 16.95]])
IMAGE_0 = np.float32([[665, 431], [1247, 430], [1415, 1046], [367, 1029]])
H_img0_from_m, _ = cv2.findHomography(COURT_M, IMAGE_0)
H_m_from_img0 = np.linalg.inv(H_img0_from_m)
def to_img0(pts_m):
    return cv2.perspectiveTransform(np.float32(pts_m).reshape(-1, 1, 2), H_img0_from_m).reshape(-1, 2)
calib_check = {"centre_far_px_err": float(np.hypot(*(to_img0([[5, 3.05]])[0] - [953, 430]))),
               "centre_near_px_err": float(np.hypot(*(to_img0([[5, 16.95]])[0] - [877.5, 1037])))}
print("calibration check (px, not used in fit):", calib_check)

# 0b. registration: frame f -> frame 0
sift = cv2.SIFT_create(4000)
def feats(img):
    g = cv2.cvtColor(cv2.resize(img, (W // 2, H // 2)), cv2.COLOR_BGR2GRAY)
    return sift.detectAndCompute(g, None)
k0, d0 = feats(frames[0])
matcher = cv2.BFMatcher()
S = np.diag([2, 2, 1]).astype(np.float64)
reg = np.zeros((n, 3, 3))
inliers = np.zeros(n)
reg[0] = np.eye(3)
inliers[0] = len(k0)
for f in range(1, n):
    k, d = feats(frames[f])
    good = [m for m, m2 in matcher.knnMatch(d, d0, k=2) if m.distance < 0.7 * m2.distance]
    src = np.float32([k[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
    dst = np.float32([k0[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
    Hh, mask = cv2.findHomography(src, dst, cv2.RANSAC, 2.0)
    reg[f] = S @ Hh @ np.linalg.inv(S)
    inliers[f] = int(mask.sum())
print("registration inliers min/median:", int(inliers[1:].min()), int(np.median(inliers[1:])))
def f_to_0(f, pts):
    return cv2.perspectiveTransform(np.float32(pts).reshape(-1, 1, 2), reg[f]).reshape(-1, 2)
def zero_to_f(f, pts):
    return cv2.perspectiveTransform(np.float32(pts).reshape(-1, 1, 2), np.linalg.inv(reg[f])).reshape(-1, 2)
def img_to_m(f, pts):
    return cv2.perspectiveTransform(f_to_0(f, pts).reshape(-1, 1, 2), H_m_from_img0).reshape(-1, 2)

# registration check: projected service + centre lines must sit on white paint in every frame
hsv_white = lambda img: cv2.inRange(cv2.cvtColor(img, cv2.COLOR_BGR2HSV), (0, 0, 170), (180, 70, 255))
line_samples_m = np.concatenate([np.stack([np.linspace(0.3, 9.7, 40), np.full(40, 3.05)], 1),
                                 np.stack([np.full(30, 5.0), np.linspace(3.4, 9.0, 30)], 1)])
align = []
for f in range(0, n, 5):
    wmask = cv2.dilate(hsv_white(frames[f]), np.ones((7, 7), np.uint8))  # 3 px tolerance
    p = zero_to_f(f, to_img0(line_samples_m)).astype(int)
    okp = (p[:, 0] >= 0) & (p[:, 0] < W) & (p[:, 1] >= 0) & (p[:, 1] < H)
    align.append(float(np.mean(wmask[p[okp, 1], p[okp, 0]] > 0)))
print("line alignment (share of projected line points on paint) min/median:", round(min(align), 3), round(float(np.median(align)), 3))

# 1. players + stable identities in court metres
players_cache = out / "players.npz"
pose = None if players_cache.exists() else YOLO("yolo11m-pose.pt")
tracker = SlotTracker(max_jump_m=1.5, ppm=PPM)
boxes = np.full((n, 4, 4), np.nan, np.float32)
kpts = np.full((n, 4, 17, 3), np.nan, np.float32)
feet_m = np.full((n, 4, 2), np.nan, np.float32)
for f in range(n if pose else 0):
    r = pose.predict(frames[f], conf=0.25, classes=[0], imgsz=1920, device=DEVICE, verbose=False)[0]
    dets = []
    if r.boxes is not None and len(r.boxes):
        bx = r.boxes.xyxy.cpu().numpy()
        kp = r.keypoints.data.cpu().numpy()
        for i in range(len(bx)):
            x1, y1, x2, y2 = bx[i]
            m = img_to_m(f, [[(x1 + x2) / 2, y2]])[0]
            if -0.5 <= m[0] <= 10.5 and -0.5 <= m[1] <= 20.5:  # on court (walls are the boundary)
                dets.append((bx[i], kp[i], m))
    assign = tracker.update([d[2] * PPM for d in dets])
    for slot, di in assign.items():
        boxes[f, slot], kpts[f, slot], feet_m[f, slot] = dets[di]
if pose:
    np.savez(players_cache, boxes=boxes, kpts=kpts, feet_m=feet_m)
else:
    z = np.load(players_cache)
    boxes, kpts, feet_m = z["boxes"], z["kpts"], z["feet_m"]
coverage = [float(np.mean(~np.isnan(boxes[:, s, 0]))) for s in range(4)]
print("player coverage per slot:", [round(c, 2) for c in coverage])

# 2. ball, in registered (frame 0) coordinates
ball_model = YOLO("yolo11s_ball_1536/weights/best.pt")
cache = out / "ball_candidates.npy"
if cache.exists():
    cand = list(np.load(cache, allow_pickle=True))
else:
    cand = collect_candidates(ball_model, clip, n, 1536, DEVICE, 0.1, (0, 0, W, H), cls=0)
    np.save(cache, np.array(cand, dtype=object), allow_pickle=True)
floor0 = to_img0([[0, 0], [10, 0], [10, 20], [0, 20]])
airspace = cv2.convexHull(np.concatenate([floor0, floor0 - [0, 260]]).astype(np.float32))
cand0 = []
for f, cs in enumerate(cand):
    keep = []
    for c in cs:
        # a white cap reads as a ball to the detector: ignore the top of each player's box
        if any(not np.isnan(b[0]) and b[0] - 4 <= c[0] <= b[2] + 4 and b[1] - 6 <= c[1] <= b[1] + 0.28 * (b[3] - b[1]) for b in boxes[f]):
            continue
        x0, y0 = f_to_0(f, [[c[0], c[1]]])[0]
        if cv2.pointPolygonTest(airspace, (float(x0), float(y0)), False) >= 0:
            keep.append((float(x0), float(y0), c[2], c[3]))
    cand0.append(keep)
def drop_static(cand, radius=10.0, min_frames=6):
    # Scene clutter (bleacher markings behind the far glass, lamps, balls lying on court) fires on and off at
    # the same registered spot for the whole clip; the ball in play does not come back to one spot in 6 frames.
    pts = [(f, c[0], c[1]) for f, cs in enumerate(cand) for c in cs]
    static = set()
    for f, x, y in pts:
        span = {g for g, gx, gy in pts if np.hypot(gx - x, gy - y) <= radius}
        if len(span) >= min_frames:
            static.add((f, round(x), round(y)))
    return [[c for c in cs if (f, round(c[0]), round(c[1])) not in static] for f, cs in enumerate(cand)], len(static)
n_raw = sum(len(c) for c in cand)
cand0, n_static = drop_static(cand0)
print("ball candidates:", n_raw, "kept after airspace + static filter:", sum(len(c) for c in cand0), f"(static dropped {n_static})")
raw0 = link_track(cand0, n, max_speed=180 * 30 / fps)
linked0 = interpolate(raw0.copy(), max_gap=int(8 * fps / 30))  # full linked track: used for contacts
# for drawing, a detection needs temporal support: at least 3 linked detections within +-3 frames (itself included)
det = ~np.isnan(raw0[:, 0])
support = np.convolve(det.astype(int), np.ones(7, int), mode="same")
n_isolated = int(np.sum(det & (support < 3)))
raw0[det & (support < 3)] = np.nan
print("isolated detections dropped:", n_isolated)
ball0 = interpolate(raw0, max_gap=int(8 * fps / 30))
print("ball linked frames:", int(np.sum(~np.isnan(raw0[:, 0]))), "/", n, "after interpolation:", int(np.sum(~np.isnan(ball0[:, 0]))))

# 3. hits: trajectory turns within reach of a tracked player (in frame-0 px)
turns = ball_turn_candidates(linked0)[0]  # the ball is only briefly seen at the racket, so use the full track
hits = []
for t in turns:
    for s in range(4):
        b = boxes[t, s]
        if np.isnan(b[0]):
            continue
        corners = f_to_0(t, [[b[0], b[1]], [b[2], b[3]]])
        (x1, y1), (x2, y2) = corners
        h = y2 - y1
        if x1 - 0.6 * h <= linked0[t, 0] <= x2 + 0.6 * h and y1 - 0.6 * h <= linked0[t, 1] <= y2:
            hits.append((int(t), s))
            break
print("trajectory turns:", turns, "-> hits (frame, slot):", hits)

np.savez(out / "pexels_results.npz", boxes=boxes, kpts=kpts, feet_m=feet_m, ball0=ball0, raw0=raw0, linked0=linked0, reg=reg, hits=np.array(hits), fps=fps)
json.dump({"frames": n, "fps": fps, "calibration_check_px": calib_check,
           "registration_inliers_min": int(inliers[1:].min()), "line_alignment_min": min(align), "line_alignment_median": float(np.median(align)),
           "slot_coverage": coverage, "ball_candidates": n_raw, "ball_candidates_kept": sum(len(c) for c in cand0),
           "ball_isolated_dropped": n_isolated, "ball_linked_frames": int(np.sum(~np.isnan(raw0[:, 0]))), "ball_frames_after_interpolation": int(np.sum(~np.isnan(ball0[:, 0]))),
           "trajectory_turns": [int(t) for t in turns], "hits": [{"frame": t, "player": f"P{s + 1}"} for t, s in hits]},
          open(out / "pexels_summary.json", "w"), indent=1)

# 4. render: boxes, pose, IDs, ball + short trail, hit markers, minimap
COL = {0: (240, 191, 72), 1: (120, 220, 90), 2: (35, 166, 245), 3: (200, 120, 240)}  # one colour per ID (BGR)
SKEL = [(5, 7), (7, 9), (6, 8), (8, 10), (5, 6), (5, 11), (6, 12), (11, 12), (11, 13), (13, 15), (12, 14), (14, 16)]
BALL = (80, 232, 248)
HIT = (60, 90, 245)
font = cv2.FONT_HERSHEY_SIMPLEX
MM = 11  # minimap px per metre
mm_w, mm_h, pad = 10 * MM, 20 * MM, 14
def minimap(f):
    c = np.full((mm_h + 2 * pad, mm_w + 2 * pad, 3), (46, 38, 30), np.uint8)
    o = np.array([pad, pad])
    p = lambda x, y: (int(o[0] + x * MM), int(o[1] + y * MM))
    cv2.rectangle(c, p(0, 0), p(10, 20), (150, 110, 60), -1)
    for a, b in [((0, 0), (10, 0)), ((10, 0), (10, 20)), ((10, 20), (0, 20)), ((0, 20), (0, 0)), ((0, 3.05), (10, 3.05)), ((0, 16.95), (10, 16.95)), ((5, 3.05), (5, 16.95))]:
        cv2.line(c, p(*a), p(*b), (235, 235, 235), 1, cv2.LINE_AA)
    cv2.line(c, p(0, 10), p(10, 10), (255, 255, 255), 2, cv2.LINE_AA)
    for t, s in hits:
        if 0 <= f - t < int(1.2 * fps) and not np.isnan(feet_m[t, s, 0]):
            cv2.circle(c, p(*feet_m[t, s]), 9, HIT, 2, cv2.LINE_AA)
    for s in range(4):
        tail = feet_m[max(0, f - int(fps)):f + 1, s]
        tail = tail[~np.isnan(tail[:, 0])]
        for a, b in zip(tail[:-1], tail[1:]):
            cv2.line(c, p(*a), p(*b), COL[s], 1, cv2.LINE_AA)
        if not np.isnan(feet_m[f, s, 0]):
            cv2.circle(c, p(*feet_m[f, s]), 5, COL[s], -1, cv2.LINE_AA)
    return c
vw = cv2.VideoWriter(str(out / "pexels_annotated_raw.mp4"), cv2.VideoWriter_fourcc(*"mp4v"), fps, (W, H))
for f in range(n):
    frame = frames[f].copy()
    for s in range(4):
        b = boxes[f, s]
        if np.isnan(b[0]):
            continue
        c = COL[s]
        x1, y1, x2, y2 = b.astype(int)
        cv2.rectangle(frame, (x1, y1), (x2, y2), c, 2)
        k = kpts[f, s]
        for a, bb in SKEL:
            if k[a, 2] > 0.4 and k[bb, 2] > 0.4:
                cv2.line(frame, tuple(k[a, :2].astype(int)), tuple(k[bb, :2].astype(int)), c, 2, cv2.LINE_AA)
        label = f"P{s + 1}"
        (tw, th), _ = cv2.getTextSize(label, font, 0.7, 2)
        cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw + 10, y1), c, -1)
        cv2.putText(frame, label, (x1 + 5, y1 - 6), font, 0.7, (20, 20, 20), 2, cv2.LINE_AA)
    lo = max(0, f - int(0.35 * fps))
    trail = [zero_to_f(f, [ball0[g]])[0] if not np.isnan(ball0[g, 0]) else None for g in range(lo, f + 1)]
    for a, b in zip(trail[:-1], trail[1:]):
        if a is not None and b is not None:
            cv2.line(frame, tuple(a.astype(int)), tuple(b.astype(int)), BALL, 3, cv2.LINE_AA)
    if trail[-1] is not None and not np.isnan(raw0[f, 0]):  # ring only on frames with a detection
        cv2.circle(frame, tuple(trail[-1].astype(int)), 11, BALL, 2, cv2.LINE_AA)
    for t, s in hits:
        dt = (f - t) / fps
        if 0 <= dt < 0.6:
            q = zero_to_f(f, [linked0[t]])[0].astype(int)
            cv2.circle(frame, tuple(q), int(14 + dt * 90), HIT, 3, cv2.LINE_AA)
            cv2.putText(frame, f"HIT P{s + 1}", (int(q[0]) - 40, int(q[1]) + 44), font, 0.75, HIT, 2, cv2.LINE_AA)
    m = minimap(f)
    mh, mw = m.shape[:2]
    frame[H - mh - 24:H - 24, 24:24 + mw] = m  # bottom-left: outside the court in this shot, clear of the player controls
    cv2.rectangle(frame, (24, 24), (800, 88), (20, 20, 20), -1)
    cv2.putText(frame, f"Padel Vision  |  players {int(np.sum(~np.isnan(boxes[f, :, 0])))}  |  ball  |  hits  |  court map", (40, 66), font, 0.8, (240, 240, 240), 2, cv2.LINE_AA)
    vw.write(frame)
vw.release()
print("rendered", n, "frames")
