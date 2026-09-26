"""Render the Padel Vision replay loop from the project's own tracking output (no broadcast pixels).

Input: data/padel-analytics.json (exported by export_analytics.py from outputs/results.npz).
Everything drawn is measured data: player court positions, detected hit frames, reconstructed 3D
ball arcs, and the instantaneous court-control share computed from the four positions per frame
(same nearest-team rule as tactical.court_control). Playback is 5x real time.
Usage: python3 render_replay.py <repo root> <frames dir>
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT, FRAMES = Path(sys.argv[1]), Path(sys.argv[2])
FRAMES.mkdir(parents=True, exist_ok=True)
d = json.load(open(ROOT / "data/padel-analytics.json"))

W, H = 1600, 900
BG, SURFACE, LINE, TEXT, MUTED = (6, 24, 42), (13, 58, 92), (206, 226, 238), (238, 248, 255), (137, 165, 180)
FAR, NEAR, HIT = (72, 191, 240), (245, 166, 35), (245, 166, 35)
SPEEDUP, FPS = 5, 30
S, OX, OY = 52, 90, 200  # court: length (20 m) along x, width (10 m) along y


def font(size, mono=False):
    for p in (["/System/Library/Fonts/SFNSMono.ttf"] if mono else []) + ["/System/Library/Fonts/SFNS.ttf", "/System/Library/Fonts/Helvetica.ttc"]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


F_TITLE, F_BIG, F_LABEL, F_SMALL = font(34), font(64, True), font(22), font(20, True)
tracks = np.array(d["tracks_m"], dtype=float)  # (n, 4, 2) metres, x=width, y=length
step, src_fps, frames_total = d["track_step"], d["fps"], d["frames"]
team = [p["team"] for p in d["players"]]
hits = np.array(d["hits_frame"])
arcs = d["arcs"]
duration = d["duration_s"]


def court_xy(x, y):
    return OX + y * S, OY + x * S


def pos_at(t):
    """Player positions at time t (s), linear between track samples."""
    f = t * src_fps / step
    i = min(int(f), len(tracks) - 2)
    a = f - i
    return tracks[i] * (1 - a) + tracks[i + 1] * a


gx, gy = np.meshgrid((np.arange(20) + .5) * 0.5, (np.arange(40) + .5) * 0.5)  # 0.5 m cells: x width, y length
cells = np.stack([gx.ravel(), gy.ravel()], 1)


def far_share(p):
    dfar = np.minimum(np.linalg.norm(cells - p[0], axis=1), np.linalg.norm(cells - p[1], axis=1))
    dnear = np.minimum(np.linalg.norm(cells - p[2], axis=1), np.linalg.norm(cells - p[3], axis=1))
    return float((dfar < dnear).mean())


def draw_court(dr):
    x0, y0 = court_xy(0, 0); x1, y1 = court_xy(10, 20)
    dr.rectangle((x0, y0, x1, y1), fill=SURFACE)
    dr.rectangle((x0, y0, x1, y1), outline=LINE, width=2)
    for yl in (10 - 6.95, 10 + 6.95):
        a, b = court_xy(0, yl); c, e = court_xy(10, yl)
        dr.line((a, b, c, e), fill=LINE, width=2)
    a, b = court_xy(5, 10 - 6.95); c, e = court_xy(5, 10 + 6.95)
    dr.line((a, b, c, e), fill=LINE, width=2)
    a, b = court_xy(-0.2, 10); c, e = court_xy(10.2, 10)
    dr.line((a, b, c, e), fill=TEXT, width=4)


n_out = int(duration / SPEEDUP * FPS)
fade = 12
for k in range(n_out):
    t = (k % n_out) / FPS * SPEEDUP
    im = Image.new("RGB", (W, H), BG)
    dr = ImageDraw.Draw(im, "RGBA")
    dr.text((OX, 60), "Padel Vision · tracking replay", font=F_TITLE, fill=TEXT)
    dr.text((OX, 108), "Top-down court from one broadcast camera · 5× speed · drawn from the pipeline's own output", font=F_LABEL, fill=MUTED)
    draw_court(dr)
    p = pos_at(t)
    # trails: last 1.5 s
    for s in range(4):
        pts = [court_xy(*pos_at(max(0, t - back / 10))[s]) for back in range(15, -1, -1)]
        col = FAR if team[s] == "Far" else NEAR
        dr.line(pts, fill=col + (140,), width=5, joint="curve")
    # ball arcs in flight: ground track + ball (size shows height)
    for arc in arcs:
        t0, t1 = arc["t_start"], arc["t_start"] + arc["flight_s"]
        if t0 - 0.2 <= t <= t1 + 0.35:
            pts = arc["points"]
            dr.line([court_xy(q[0], q[1]) for q in pts], fill=HIT + (110,), width=2)
            u = min(max((t - t0) / (t1 - t0), 0), 1)
            j = u * (len(pts) - 1); i = min(int(j), len(pts) - 2); a = j - i
            q = [pts[i][c] * (1 - a) + pts[i + 1][c] * a for c in range(3)]
            cx, cy = court_xy(q[0], q[1])
            dr.ellipse((cx - 6, cy - 3, cx + 6, cy + 3), fill=(0, 0, 0, 90))
            r = 6 + q[2] * 3
            dr.ellipse((cx - r, cy - r - q[2] * 22, cx + r, cy + r - q[2] * 22), fill=(248, 232, 80))
    # hit flashes: a ring where a rebuilt shot starts, for 0.6 s after the detected hit
    frame_now = t * src_fps
    for arc in arcs:
        dt = (frame_now - arc["f_start"]) / src_fps
        if 0 <= dt < 0.6:
            hx, hy = court_xy(arc["points"][0][0], arc["points"][0][1])
            r = 14 + dt * 60
            dr.ellipse((hx - r, hy - r, hx + r, hy + r), outline=HIT + (int(255 * (1 - dt / 0.6)),), width=3)
    for s in range(4):
        cx, cy = court_xy(*p[s])
        col = FAR if team[s] == "Far" else NEAR
        dr.ellipse((cx - 14, cy - 14, cx + 14, cy + 14), fill=col, outline=BG, width=3)
        dr.text((cx + 18, cy - 12), d["players"][s]["id"], font=F_SMALL, fill=TEXT)
    # right panel: time, hits so far, instantaneous control
    share = far_share(p)
    px = 1230
    dr.text((px, 200), "Clip time", font=F_LABEL, fill=MUTED)
    dr.text((px, 228), f"{t:4.1f} s", font=F_BIG, fill=TEXT)
    n_hits = int((hits <= frame_now).sum())
    dr.text((px, 330), "Hits detected", font=F_LABEL, fill=MUTED)
    dr.text((px, 358), f"{n_hits:2d} / {len(hits)}", font=F_BIG, fill=TEXT)
    dr.text((px, 460), "Court control now", font=F_LABEL, fill=MUTED)
    bw = 290
    dr.rectangle((px, 500, px + bw, 530), fill=NEAR)
    dr.rectangle((px, 500, px + round(bw * share), 530), fill=FAR)
    dr.text((px, 544), f"Far {share * 100:4.1f}%", font=F_SMALL, fill=FAR)
    dr.text((px + bw, 544), f"Near {100 - share * 100:4.1f}%", font=F_SMALL, fill=NEAR, anchor="ra")
    dr.text((px, 610), "Players", font=F_LABEL, fill=MUTED)
    dr.ellipse((px, 648, px + 18, 666), fill=FAR); dr.text((px + 28, 644), "Far team · P1, P2", font=F_LABEL, fill=TEXT)
    dr.ellipse((px, 684, px + 18, 702), fill=NEAR); dr.text((px + 28, 680), "Near team · P3, P4", font=F_LABEL, fill=TEXT)
    dr.ellipse((px, 720, px + 18, 738), fill=(248, 232, 80)); dr.text((px + 28, 716), "Ball, rebuilt arc", font=F_LABEL, fill=TEXT)
    # timeline with hit ticks
    tx0, tx1, ty = OX, OX + 20 * S, 780
    dr.line((tx0, ty, tx1, ty), fill=(255, 255, 255, 60), width=4)
    for h in hits:
        x = tx0 + (tx1 - tx0) * h / frames_total
        dr.line((x, ty - 10, x, ty + 10), fill=HIT, width=2)
    x = tx0 + (tx1 - tx0) * t / duration
    dr.line((tx0, ty, x, ty), fill=FAR, width=4)
    dr.ellipse((x - 8, ty - 8, x + 8, ty + 8), fill=TEXT)
    im.save(FRAMES / f"f{k:04d}.png")
# seamless loop: blend the last frames toward frame 0
first = Image.open(FRAMES / "f0000.png")
for i in range(fade):
    k = n_out - fade + i
    Image.blend(Image.open(FRAMES / f"f{k:04d}.png"), first, (i + 1) / (fade + 1)).save(FRAMES / f"f{k:04d}.png")
print("frames", n_out, "seconds", n_out / FPS)
