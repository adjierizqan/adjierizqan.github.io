// Verified TomatoVision record. Sources: thesis results tables II–IV (= the research repo README),
// yolo_Training/*/args.yaml, the per-model output folders, and the 1,051 VOC files of the source dataset.
// Page images are a portfolio demo, not evaluation data: CC0 photos run through the thesis weights
// (docs/design/tomatovision/implementation/demo-media.json). data/content-integrity.test.ts locks these values.

export type TomatoConfiguration = {
  id: string;
  label: string;
  shortLabel: string;
  members?: string;
  kind: "single" | "ensemble";
  precision: number;
  recall: number;
  map50: number;
  map5095: number;
  fps: number;
  msPerImage: number;
  denseSceneImage: string;
};

const research = "/projects/tomato-ripeness/research";

export const tomatoConfigurations: TomatoConfiguration[] = [
  { id: "yolov11", label: "YOLOv11", shortLabel: "YOLOv11", kind: "single", precision: 0.758, recall: 0.753, map50: 0.795, map5095: 0.470, fps: 18.089, msPerImage: 55.28, denseSceneImage: `${research}/demo2-yolov11.webp` },
  { id: "swin-t", label: "+ Swin-T", shortLabel: "+ Swin-T", kind: "single", precision: 0.768, recall: 0.771, map50: 0.805, map5095: 0.474, fps: 18.706, msPerImage: 53.46, denseSceneImage: `${research}/demo2-yolov11_swint.webp` },
  { id: "swin-t-mssppf", label: "+ Swin-T + MS-SPPF", shortLabel: "+ Swin-T + MS-SPPF", kind: "single", precision: 0.775, recall: 0.772, map50: 0.807, map5095: 0.477, fps: 18.951, msPerImage: 52.77, denseSceneImage: `${research}/demo2-yolov11_swint_mssppf.webp` },
  { id: "combine-1", label: "Combine 1", shortLabel: "Combine 1", members: "YOLOv11 + Swin-T", kind: "ensemble", precision: 0.756, recall: 0.786, map50: 0.814, map5095: 0.490, fps: 14.311, msPerImage: 69.88, denseSceneImage: `${research}/demo2-combine1.webp` },
  { id: "combine-2", label: "Combine 2", shortLabel: "Combine 2", members: "YOLOv11 + Swin-T+MS-SPPF", kind: "ensemble", precision: 0.777, recall: 0.767, map50: 0.817, map5095: 0.492, fps: 14.415, msPerImage: 69.37, denseSceneImage: `${research}/demo2-combine2.webp` },
  { id: "combine-3", label: "Combine 3", shortLabel: "Combine 3", members: "Swin-T + Swin-T+MS-SPPF", kind: "ensemble", precision: 0.789, recall: 0.757, map50: 0.812, map5095: 0.487, fps: 14.888, msPerImage: 67.17, denseSceneImage: `${research}/demo2-combine3.webp` },
  { id: "combine-4", label: "Combine 4", shortLabel: "Combine 4", members: "all three", kind: "ensemble", precision: 0.767, recall: 0.796, map50: 0.824, map5095: 0.499, fps: 11.245, msPerImage: 88.93, denseSceneImage: `${research}/demo2-combine4.webp` },
];

export const tomatoMatchedScene = [
  { id: "baseline", tab: "Baseline", label: "YOLOv11 baseline", src: `${research}/demo1-yolov11.webp`, alt: "YOLOv11 baseline detections on a public-domain photo of tomatoes on the vine" },
  { id: "best", tab: "Best single", label: "Best single · Swin-T + MS-SPPF", src: `${research}/demo1-yolov11_swint_mssppf.webp`, alt: "Swin-T plus multi-scale SPPF detections on the same scene" },
  { id: "wbf", tab: "WBF", label: "Three-model WBF", src: `${research}/demo1-combine4.webp`, alt: "Three-model Weighted Boxes Fusion detections on the same scene" },
];

export const tomatoDataset = {
  sourceImages: 1051,
  boxes: { green: 12168, orange: 14640, red: 13989 },
  source: "Known-You Seed Co., Pingtung, Taiwan",
  split: "exported 2,193 train (augmented) / 160 val / 160 test at 1280×1280",
};

export const tomatoDemo = {
  photos: "three CC0 photos from Wikimedia Commons (Dan Gold; Alabama Extension; Pascal Kings)",
  settings: "960 px, display threshold 0.25, WBF IoU 0.6",
};

export const tomatoTraining = { imgsz: 1088, batch: 4, epochs: 400, patience: 100 };
export const tomatoMatchedSceneCount = 157;
export const tomatoStatus = "Master’s thesis research · 2026";

export function formatMetric(value: number) {
  return value.toFixed(3);
}
