# TomatoVision hero photo — provenance (V1.0.2)

The hero comparison (Baseline / Best single / WBF), the project thumbnail and card image use one
real photograph, run through the three thesis configurations with `real_photo_inference.py`.

| Field | Value |
|---|---|
| SOURCE_URL | https://commons.wikimedia.org/wiki/File:-2020-07-20_Bush_tomato_plant_(Totem),_Trimingham,_Norfolk_(1).JPG |
| FILE_URL | https://upload.wikimedia.org/wikipedia/commons/d/dc/-2020-07-20_Bush_tomato_plant_%28Totem%29%2C_Trimingham%2C_Norfolk_%281%29.JPG |
| AUTHOR | Kolforn (Wikimedia Commons user; "Own work") |
| LICENSE | CC BY-SA 4.0 |
| LICENSE_URL | https://creativecommons.org/licenses/by-sa/4.0/ |
| TAKEN | 2020-07-20, Trimingham, Norfolk, England (camera photo, EXIF date) |
| DOWNLOAD_DATE | 2026-09-26 |
| SHA-256 (original) | d7f6ea6d93f370c083cd9b2c8be1874716d7fe0e4b4331db20ff0c8356b045c0 |

Licence obligations: the page credits the author with links to the source and licence, states that
detections were overlaid, and the overlaid images (an adaptation) are shared under CC BY-SA 4.0.
The author's file description also asks to be emailed about use outside Wikimedia; that is a
courtesy request, not a licence condition, and no email was sent on the owner's behalf.

Inference: square crop (100, 1150)–(3300, 4350) of the original, resized to 1280 px; research repo
web-demo pipeline, thesis weights, 960 px, display threshold 0.25, WBF IoU 0.6, on MPS.
Detections (real-photo-summary.json): YOLOv11 14 (11 green, 3 orange), Swin-T + MS-SPPF 16
(13 green, 3 orange), three-model WBF 15 (12 green, 3 orange). The models call the red fruit
"orange" here: domain shift, shown as is. This image is not part of the thesis dataset or
evaluation; every metric on the page comes from thesis validation.

Replaced: the earlier hero ("Tomatoes on the Vine (Unsplash)", CC0), which the owner found
artificial-looking.
