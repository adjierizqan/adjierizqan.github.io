"""Build data/tomatovision-annotation-maps.json from the source Pascal VOC files.

The page shows annotation geometry instead of the Known-You Seed Co. photographs,
whose public reuse permission is not verified. Input: the four XML files from
Combined1051images_Trang.zip (label/). Coordinates are normalised to 0-1000.
Usage: python3 make_annotation_maps.py <xml_dir> <out_json>
"""
import json, sys, xml.etree.ElementTree as ET
from collections import Counter

IDS = ["0032_110sp_1013_L4", "0199_110sp_1047_L7", "0005_110sp_1004_L3", "IMG_4246"]
CLASSES = {"green": 0, "orange": 1, "red": 2}

out = []
for image_id in IDS:
    root = ET.parse(f"{sys.argv[1]}/{image_id}.xml").getroot()
    w = int(root.find("size/width").text); h = int(root.find("size/height").text)
    boxes, counts = [], Counter()
    for obj in root.iter("object"):
        name = obj.find("name").text.strip()
        if name not in CLASSES:
            continue
        b = obj.find("bndbox")
        x1, y1, x2, y2 = (float(b.find(k).text) for k in ("xmin", "ymin", "xmax", "ymax"))
        boxes.append([CLASSES[name], round(x1 / w * 1000), round(y1 / h * 1000), round((x2 - x1) / w * 1000), round((y2 - y1) / h * 1000)])
        counts[name] += 1
    out.append({"id": image_id, "width": w, "height": h, "counts": {k: counts[k] for k in CLASSES}, "boxes": boxes})
    print(image_id, w, h, dict(counts), len(boxes))

with open(sys.argv[2], "w") as f:
    json.dump(out, f, separators=(",", ":"))
