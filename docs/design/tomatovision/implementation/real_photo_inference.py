"""Run the three thesis configurations on one real, licensed photograph (V1.0.2 hero).

Photo: "-2020-07-20 Bush tomato plant (Totem), Trimingham, Norfolk (1).JPG" by Kolforn,
Wikimedia Commons, CC BY-SA 4.0 (see real-photo-provenance.md). The detection overlays are an
adaptation and are shared under the same licence.
Pipeline: research repo web_demo/backend (ModelRegistry, infer_single, infer_wbf) with the thesis
weights, unchanged settings. Boxes are drawn by the same code as demo_inference.py.
Usage: <backend venv python> real_photo_inference.py <original.jpg> <out dir>
"""
import json
import sys
from pathlib import Path

BACKEND = Path.home() / "Projects/Labs/tomato-ripeness-yolov11/web_demo/backend"
sys.path.insert(0, str(BACKEND))
from PIL import Image, ImageDraw, ImageOps  # noqa: E402
from draw_utils import BOX_COLORS_BY_CLASS_ID, _font  # noqa: E402
from inference import count_summary, infer_single, infer_wbf  # noqa: E402
from model_loader import WBF_COMBINATIONS, registry  # noqa: E402

CROP = (100, 1150, 3300, 4350)  # square region holding the fruit, in original pixels


def draw_detections(image, detections):
    canvas = image.copy()
    draw = ImageDraw.Draw(canvas)
    line = max(2, round(min(canvas.size) / 420))
    font = _font(max(12, round(min(canvas.size) / 70)))
    for det in sorted(detections, key=lambda d: d["confidence"]):
        color = BOX_COLORS_BY_CLASS_ID.get(int(det["class_id"]), (240, 240, 240))
        x1, y1, x2, y2 = det["box"]
        draw.rectangle([x1, y1, x2, y2], outline=color, width=line)
        label = f"{det['class_name']} {det['confidence']:.2f}"
        l, t, r, b = draw.textbbox((0, 0), label, font=font)
        ty = max(0, y1 - (b - t) - 6)
        draw.rectangle([x1, ty, x1 + (r - l) + 6, ty + (b - t) + 6], fill=color)
        draw.text((x1 + 3, ty + 3 - t), label, font=font, fill=(12, 16, 14))
    return canvas


src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
registry.load_all()
assert not registry.failed_models, registry.failed_models
image = ImageOps.exif_transpose(Image.open(src)).convert("RGB").crop(CROP).resize((1280, 1280), Image.LANCZOS)
image.save(out / "realphoto-input.jpg", quality=92)
runs = {
    "yolov11": infer_single(registry, "yolov11", image),
    "yolov11_swint_mssppf": infer_single(registry, "yolov11_swint_mssppf", image),
    "combine4": infer_wbf(registry, WBF_COMBINATIONS["combine4"]["models"], image),
}
summary = {}
for name, dets in runs.items():
    draw_detections(image, dets).save(out / f"realphoto-{name}.jpg", quality=92)
    summary[name] = count_summary(dets)
    print(name, summary[name])
json.dump({"device": registry.device, "crop": CROP, "detections": summary}, open(out / "realphoto-summary.json", "w"), indent=1)
