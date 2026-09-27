"""LabStock "One traceable path" end frame (V1.0.6): a native-resolution crop of the public Laporan screen
(demo database), showing the Excel download and the KOREKSI column. No upscaling, no edits.
Run from the repo root: python3 docs/design/v106/labstock_trace_media.py
"""
from PIL import Image

SRC = "public/projects/labstock/laporan.webp"   # 1440x1024 capture, demo data
BOX = (996, 216, 1418, 506)                        # Unduh Excel + Keluar / Koreksi / Saldo akhir, first four rows
DST = "public/projects/labstock/trace-report.webp"
Image.open(SRC).convert("RGB").crop(BOX).save(DST, quality=90)
print(DST, BOX)
