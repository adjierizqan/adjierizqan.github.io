"""Build the V1.0.1 portfolio assets from verified synthetic / owner-made sources.

Sources (each with a recorded synthetic-data provenance):
- LabStock: ~/Projects/labstock-pk/docs/design/labstock-final-correction-qa/ — captured from the
  `labstock_pk_demo` database (users "... Demo", items/rooms/requesters marked demo, no MIG rows).
- BDRS: ~/Projects/bdrs-v2/docs/evidence/final-ui/desktop/ — INDEX.md: seeded e2e fixtures only
  (KLINIS DEMO…, DEMO-BAG…, E2E staff); the sidebar badge naming the hospital is cropped out here.
- SuhuLog: ~/Projects/SuhuLog-presentation/screenshots/ — closure/MANIFEST.md: synthetic fixture
  (ADMIN DEMO, PETUGAS DEMO). 05b-monitoring-full is not used (its footer names the hospital).
- TomatoVision / Porsche 3D: assets already in public/ (CC0 demo inference; own renders).
Usage: python3 build_assets.py <portfolio repo root>
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HOME = Path.home()
ROOT = Path(sys.argv[1])
PUB = ROOT / "public" / "projects"
LS = HOME / "Projects/labstock-pk/docs/design/labstock-final-correction-qa"
BD = HOME / "Projects/bdrs-v2/docs/evidence/final-ui/desktop"
SL = HOME / "Projects/SuhuLog-presentation/screenshots"
THUMB = (1600, 1000)  # one thumbnail system: 16:10 everywhere


def save(im, path, q=86):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(path, quality=q, method=6)
    print(path.relative_to(ROOT), im.size)


def fit(im, size):
    """Cover-crop to size, anchored top-left (UI screens read from the top-left)."""
    w, h = size
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    return im.crop((0, 0, w, h))


def rounded(im, r):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = Image.new("RGBA", im.size)
    out.paste(im, (0, 0), mask)
    return out


def shadow(canvas, box, r, blur=28, alpha=70, offset=(0, 18)):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    x0, y0, x1, y1 = box
    ImageDraw.Draw(layer).rounded_rectangle((x0 + offset[0], y0 + offset[1], x1 + offset[0], y1 + offset[1]), r, fill=(20, 24, 32, alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


# ---- LabStock: final screens, full frames for the page + a content-crop thumbnail
ls_out = PUB / "labstock"
for src, name in [("04-stok-1440", "stok"), ("05-amprah-di-lab", "amprah"), ("01-hari-ini-1440", "hari-ini"),
                  ("07-laporan-bulanan", "laporan"), ("06-amprah-keluar-lab", "amprah-keluar")]:
    save(Image.open(LS / f"{src}.png"), ls_out / f"{name}.webp")
save(Image.open(LS / "09-amprah-mobile-390.png"), ls_out / "amprah-mobile.webp")
stok = Image.open(LS / "04-stok-1440.png").convert("RGB")
save(fit(stok.crop((256, 60, 1440, 800)), THUMB), ls_out / "thumb.webp")

# ---- BDRS: crop the sidebar (hospital badge) off every frame
bd_out = PUB / "bdrs"
SIDEBAR = 232
for src, name in [("01-dashboard", "dashboard"), ("03-workstation-overview", "workstation"), ("11-pengeluaran", "pengeluaran"),
                  ("10-inventaris", "inventaris"), ("12-episode-transfusi-register", "episode"), ("14-laporan", "laporan")]:
    im = Image.open(BD / f"{src}.png").convert("RGB")
    save(im.crop((SIDEBAR, 0, im.width, im.height)), bd_out / f"{name}.webp")
dash = Image.open(BD / "03-workstation-overview.png").convert("RGB")
save(fit(dash.crop((SIDEBAR, 0, 1440, 760)), THUMB), bd_out / "thumb.webp")

# ---- SuhuLog: phone entry + laptop monitoring in one composition
sl_out = PUB / "suhulog"
phone_src = Image.open(SL / "mobile/03-catat-suhu.png").convert("RGB")      # 390x844 @2x
laptop_src = Image.open(SL / "desktop/05-monitoring-chart.png").convert("RGB")  # 1440x900 @2x


def device_story(size):
    W, H = size
    k = W / 1600
    c = Image.new("RGBA", size, (236, 239, 243, 255))
    # laptop
    lw = round(1180 * k); lh = round(lw * 900 / 1440)
    lx = round(330 * k); ly = round(70 * k)
    bez = round(14 * k)
    shadow(c, (lx - bez, ly - bez, lx + lw + bez, ly + lh + bez), round(22 * k), blur=round(30 * k))
    ImageDraw.Draw(c).rounded_rectangle((lx - bez, ly - bez, lx + lw + bez, ly + lh + bez), round(22 * k), fill=(28, 31, 38, 255))
    c.paste(laptop_src.resize((lw, lh), Image.LANCZOS), (lx, ly))
    by = ly + lh + bez
    ImageDraw.Draw(c).polygon([(lx - bez - round(70 * k), by + round(26 * k)), (lx + lw + bez + round(70 * k), by + round(26 * k)),
                               (lx + lw + bez, by), (lx - bez, by)], fill=(196, 200, 207, 255))
    # phone, in front on the left
    ph = round(780 * k); pw = round(ph * 390 / 844)
    px = round(110 * k); py = H - ph - round(60 * k)
    frame = round(12 * k)
    shadow(c, (px - frame, py - frame, px + pw + frame, py + ph + frame), round(56 * k), blur=round(26 * k), alpha=95)
    ImageDraw.Draw(c).rounded_rectangle((px - frame, py - frame, px + pw + frame, py + ph + frame), round(56 * k), fill=(20, 22, 27, 255))
    c.alpha_composite(rounded(phone_src.resize((pw, ph), Image.LANCZOS).convert("RGBA"), round(44 * k)), (px, py))
    return c


save(device_story((1600, 1000)), sl_out / "device-story.webp")
save(device_story(THUMB), sl_out / "thumb.webp")
save(phone_src, sl_out / "phone-catat-suhu.webp")
save(laptop_src.resize((1440, 900), Image.LANCZOS), sl_out / "desktop-monitoring.webp")
save(Image.open(SL / "desktop/06-laporan-bulanan.png").convert("RGB").resize((1440, 900), Image.LANCZOS), sl_out / "desktop-laporan.webp")

# ---- TomatoVision: baseline | WBF on the same CC0 photo, split down the middle
tv = PUB / "tomato-ripeness/research"
base = Image.open(tv / "real1-yolov11.webp").convert("RGB")
wbf = Image.open(tv / "real1-combine4.webp").convert("RGB")
t = Image.new("RGB", THUMB, (0, 0, 0))
half = (THUMB[0] // 2, THUMB[1])
t.paste(fit(base.crop((0, 60, 960, 900)), half), (0, 0))
t.paste(fit(wbf.crop((0, 60, 960, 900)), half), (half[0], 0))
d = ImageDraw.Draw(t)
d.line((half[0], 0, half[0], THUMB[1]), fill=(255, 255, 255), width=4)
from PIL import ImageFont
font = ImageFont.truetype("/System/Library/Fonts/SFNSMono.ttf", 34) if Path("/System/Library/Fonts/SFNSMono.ttf").exists() else ImageFont.load_default()
for x, label in [(28, "YOLOv11 baseline"), (half[0] + 28, "Three-model WBF")]:
    l, tp, r, b = d.textbbox((0, 0), label, font=font)
    d.rectangle((x - 12, THUMB[1] - 88, x + r - l + 12, THUMB[1] - 88 + b - tp + 24), fill=(21, 23, 28))
    d.text((x, THUMB[1] - 76 - tp), label, font=font, fill=(255, 255, 255))
save(t, tv / "thumb.webp")

# ---- Porsche: cinematic hero at the thumbnail ratio
hero = Image.open(PUB / "porsche-3d/cinematic/01-rwb964-hero.webp").convert("RGB")
w = hero.height * 1.6
save(hero.crop((round((hero.width - w) / 2) + 60, 0, round((hero.width + w) / 2) + 60, hero.height)).resize(THUMB, Image.LANCZOS), PUB / "porsche-3d/cinematic/thumb.webp")
