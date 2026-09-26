"""Export Padel Vision analytics for portfolio-native rendering (no broadcast pixels).

Run from the padel-vision repo so its own modules are used unchanged:
    cd ~/Projects/Labs/padel-vision && PYTHONPATH=src .venv/bin/python <this file> <out.json>

Everything comes from outputs/results.npz (per-frame player court positions, ball, hits) through the
project's functions: analytics.smooth_track / compute_stats, tactical.court_control,
reconstruct_3d.reconstruct. The exported numbers are checked against the committed JSON outputs.
"""
import json
import sys

import numpy as np
from scipy.ndimage import gaussian_filter

import court as C
from analytics import compute_stats, smooth_track
from reconstruct_3d import reconstruct
from tactical import court_control, smoothed_tracks

d = np.load("outputs/results.npz")
court, ball, hits, fps = d["court"], d["ball"], d["hits"], float(d["fps"])
n = len(court)
tracks = smoothed_tracks(court)                      # (n,4,2) top-down px
far_share, _ = court_control(tracks)

# control grid, same cells as tactical.court_control (20 x 40)
gx, gy = 20, 40
xs = (np.arange(gx) + 0.5) * C.TOP_W / gx
ys = (np.arange(gy) + 0.5) * C.TOP_H / gy
GX, GY = np.meshgrid(xs, ys)
cells = np.stack([GX.ravel(), GY.ravel()], axis=1)
far_wins = np.zeros(len(cells)); valid = 0
for f in range(n):
    pts = tracks[f]
    if np.any(np.isnan(pts)):
        continue
    valid += 1
    dfar = np.minimum(np.linalg.norm(cells - pts[0], axis=1), np.linalg.norm(cells - pts[1], axis=1))
    dnear = np.minimum(np.linalg.norm(cells - pts[2], axis=1), np.linalg.norm(cells - pts[3], axis=1))
    far_wins += dfar < dnear
control = (far_wins / max(valid, 1)).reshape(gy, gx)

# heatmaps: same accumulation as analytics.heatmap before the colour map, sampled on a 25 x 50 grid
heat = []
for s in range(4):
    acc = np.zeros((C.TOP_H, C.TOP_W), np.float32)
    for x, y in smooth_track(court[:, s, :]):
        xi, yi = int(round(x)), int(round(y))
        if 0 <= xi < C.TOP_W and 0 <= yi < C.TOP_H:
            acc[yi, xi] += 1
    acc = gaussian_filter(acc, sigma=18)
    acc /= acc.max() or 1
    heat.append(np.round(acc.reshape(50, 20, 25, 20).mean(axis=(1, 3)), 3).tolist())

arcs, arc_stats = reconstruct(ball, hits, C.homography(), fps)
stats = compute_stats(court, fps)

# consistency with the committed outputs
committed_tactical = json.load(open("outputs/tactical.json"))
committed_stats = json.load(open("outputs/stats.json"))
committed_arcs = json.load(open("outputs/trajectory_3d.json"))
assert round(far_share * 100, 1) == committed_tactical["far_court_control_pct"], (far_share, committed_tactical)
assert stats == committed_stats, "stats differ from outputs/stats.json"
assert sorted(a["f_start"] for a in arc_stats) == sorted(a["f_start"] for a in committed_arcs)

step = 3
out = {
    "source": "padel-vision outputs/results.npz via the project's analytics, tactical and reconstruct_3d modules",
    "fps": fps, "frames": n, "duration_s": round(n / fps, 1),
    "court_m": {"width": C.COURT_W_M, "length": C.COURT_L_M, "service_from_net": 6.95},
    "players": [{"id": f"P{s+1}", "team": "Far" if s < 2 else "Near"} for s in range(4)],
    "track_step": step,
    "tracks_m": [[[round(float(v) / C.PPM, 2) for v in tracks[f, s]] for s in range(4)] for f in range(0, n, step)],
    "hits_frame": [int(h) for h in sorted(hits)],
    "control_far": np.round(control, 3).tolist(),
    "far_control_pct": round(far_share * 100, 1),
    "heat": heat,
    "arcs": [{**st, "points": [[round(float(v), 2) for v in p] for p in arc[:: max(1, len(arc) // 16)]] + [[round(float(v), 2) for v in arc[-1]]]}
             for arc, st in zip(arcs, arc_stats)],
    "stats": stats,
}
json.dump(out, open(sys.argv[1], "w"), separators=(",", ":"))
print("frames", n, "fps", fps, "far control", out["far_control_pct"], "arcs", len(arcs), "bytes", len(json.dumps(out)))
