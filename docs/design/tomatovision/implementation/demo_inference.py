import json, sys
from pathlib import Path
BACKEND = Path.home() / 'Projects/Labs/tomato-ripeness-yolov11/web_demo/backend'
sys.path.insert(0, str(BACKEND))
from PIL import Image, ImageOps
from model_loader import registry, WBF_COMBINATIONS
from inference import infer_single, infer_wbf, count_summary, IMAGE_SIZE, CONFIDENCE, WBF_FINAL_CONF, WBF_IOU, WBF_SKIP, WBF_INFERENCE_CONFIDENCE, IOU_THRESHOLD
from PIL import ImageDraw
from draw_utils import BOX_COLORS_BY_CLASS_ID, _font


def draw_detections(image, detections):
    # Same colours and labels as web_demo/draw_utils.py, with thinner lines and smaller labels
    # so dense scenes stay readable at portfolio size.
    canvas = image.copy()
    draw = ImageDraw.Draw(canvas)
    line = max(2, round(min(canvas.size) / 420))
    font = _font(max(12, round(min(canvas.size) / 70)))
    for det in sorted(detections, key=lambda d: d['confidence']):
        color = BOX_COLORS_BY_CLASS_ID.get(int(det['class_id']), (240, 240, 240))
        x1, y1, x2, y2 = det['box']
        draw.rectangle([x1, y1, x2, y2], outline=color, width=line)
        label = f"{det['class_name']} {det['confidence']:.2f}"
        l, t, r, b = draw.textbbox((0, 0), label, font=font)
        pad = 3
        ty = max(0, y1 - (b - t) - pad * 2)
        draw.rectangle([x1, ty, x1 + (r - l) + pad * 2, ty + (b - t) + pad * 2], fill=color)
        draw.text((x1 + pad, ty + pad - t), label, font=font, fill=(12, 16, 14))
    return canvas


HERE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent  # folder with img/ (downloaded CC0 photos)
OUT = HERE / 'out'; OUT.mkdir(exist_ok=True)
registry.load_all()
print('device', registry.device, 'failed', registry.failed_models, 'framework', registry.framework_error)

def square(path):
    im = ImageOps.exif_transpose(Image.open(path)).convert('RGB')
    s = min(im.size); l = (im.width - s) // 2; t = (im.height - s) // 2
    return im.crop((l, t, l + s, t + s)).resize((1280, 1280), Image.LANCZOS)

runs = {
  'demo1': ('img/c15.jpg', ['single:yolov11', 'single:yolov11_swint_mssppf', 'wbf:combine4']),
  'demo2': ('img/c02.jpg', ['single:yolov11', 'single:yolov11_swint', 'single:yolov11_swint_mssppf', 'wbf:combine1', 'wbf:combine2', 'wbf:combine3', 'wbf:combine4']),
  'demo3': ('img/c03.jpg', ['wbf:combine4']),
}
summary = {'settings': {'imgsz': IMAGE_SIZE, 'single_conf': CONFIDENCE, 'nms_iou': IOU_THRESHOLD, 'wbf_member_conf': WBF_INFERENCE_CONFIDENCE, 'wbf_iou': WBF_IOU, 'wbf_skip': WBF_SKIP, 'wbf_final_conf': WBF_FINAL_CONF}, 'runs': {}}
for name, (src, jobs) in runs.items():
    image = square(HERE / src)
    image.save(OUT / f'{name}-input.jpg', quality=92)
    for job in jobs:
        kind, key = job.split(':')
        dets = infer_single(registry, key, image) if kind == 'single' else infer_wbf(registry, WBF_COMBINATIONS[key]['models'], image)
        draw_detections(image, dets).save(OUT / f'{name}-{key}.jpg', quality=92)
        summary['runs'][f'{name}-{key}'] = count_summary(dets)
        print(name, key, count_summary(dets))
json.dump(summary, open(OUT / 'summary.json', 'w'), indent=1)
