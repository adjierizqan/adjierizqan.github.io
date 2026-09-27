"""Work page media (V1.0.5): readable crops of the same demo-data screens and outputs used elsewhere.
No new captures and no generated imagery; each file is a crop/resize of an existing public asset.
Run from the repo root: python3 docs/design/v105/work_media.py
"""
from PIL import Image

OUT = (1600, 1000)  # 16:10
CROPS = {
    # LabStock "Hari Ini": main content without the sidebar (tasks + today's activity)
    "public/projects/labstock/work.webp": ("public/projects/labstock/hari-ini.webp", (250, 0, 1440, 744)),
    # BDRS patient workstation: episode header, bag workflow and the stepper on the right
    "public/projects/bdrs/work.webp": ("public/projects/bdrs/workstation.webp", (16, 0, 1208, 745)),
}
for dst, (src, box) in CROPS.items():
    im = Image.open(src).convert("RGB").crop(box)
    im.resize(OUT, Image.LANCZOS).save(dst, quality=86)
    print(dst, box)
