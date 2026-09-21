export type WorkspaceProject = {
  slug: string;
  title: string;
  eyebrow: string;
  year: string;
  summary: string;
  role: string;
  scope: string[];
  evidence: { label: string; value: string }[];
  image?: string;
  gallery?: { src: string; caption: string }[];
  href?: string;
  assetNote?: string;
};

export const featuredWork: WorkspaceProject[] = [
  {
    slug: "labstock",
    title: "LabStock",
    eyebrow: "Operational software",
    year: "2026",
    summary:
      "A laboratory inventory workspace connecting source-aware workbook import, a canonical stock ledger, monthly and yearly reporting, and Excel export.",
    role: "Product engineering · data correctness · release engineering",
    scope: [
      "Import evidence stays traceable to its workbook, sheet, and row.",
      "Corrections preserve ledger history instead of rewriting it silently.",
      "Reports and exports are derived from the same effective item identities.",
    ],
    evidence: [
      { label: "Workflow", value: "Import → ledger → report → export" },
      { label: "Safety", value: "Idempotent imports and auditable corrections" },
      { label: "Output", value: "Monthly detail + recap workbook" },
    ],
    assetNote:
      "Sanitized product imagery is still required. No hospital production screenshot is used in this prototype.",
  },
  {
    slug: "bdrs",
    title: "BDRS",
    eyebrow: "Operational software",
    year: "2026",
    summary:
      "A blood-bank operations system. The public case study is intentionally limited while the latest repository evidence is reconciled.",
    role: "Product engineering · workflow design",
    scope: [
      "Built around operational workflows rather than a generic administration dashboard.",
      "Public release and deployment claims remain withheld pending evidence review.",
    ],
    evidence: [
      { label: "Public status", value: "Case study evidence in review" },
      { label: "Disclosure", value: "No patient or production data" },
    ],
    assetNote:
      "A synthetic or demonstrably sanitized screenshot set is required before this case study can be published in full.",
  },
  {
    slug: "suhulog",
    title: "SuhuLog",
    eyebrow: "Operational software",
    year: "2026",
    summary:
      "Hospital laboratory temperature logging with QR entry, explicit out-of-range states, append-only corrections, and official monthly exports.",
    role: "Product design · full-stack engineering · release engineering",
    scope: [
      "A QR label opens the entry flow for one exact monitoring point.",
      "Morning and evening readings share one effective-record rule.",
      "The monthly view, chart, Excel, and PDF use the same stored records.",
    ],
    evidence: [
      { label: "Release", value: "v1.2.3" },
      { label: "Quality gate", value: "276 automated tests" },
      { label: "Exports", value: "Official Excel · PDF · ZIP" },
    ],
    image: "/projects/suhulog.jpg",
    gallery: [
      {
        src: "/projects/suhulog-catat-suhu.jpg",
        caption: "Focused entry for one monitoring point and period.",
      },
      {
        src: "/projects/suhulog-monitoring.jpg",
        caption: "Monthly curve with configured limits and explicit exceptions.",
      },
      {
        src: "/projects/suhulog-laporan.jpg",
        caption: "Report preview backed by the same effective records as export.",
      },
    ],
    href: "/projects/suhulog",
  },
  {
    slug: "tomato-ripeness",
    title: "TomatoVision",
    eyebrow: "Applied AI",
    year: "2026",
    summary:
      "A greenhouse tomato maturity detector comparing a YOLOv11 baseline, modified single models, and a three-model Weighted Boxes Fusion ensemble.",
    role: "Computer vision research · evaluation",
    scope: [
      "Three maturity classes across occlusion and scale changes.",
      "Swin Transformer and multi-scale SPPF model variants.",
      "Ensemble results are separated from best-single-model results.",
    ],
    evidence: [
      { label: "YOLOv11 baseline", value: "0.795 mAP@0.5" },
      { label: "Best single model", value: "0.807 mAP@0.5" },
      { label: "Three-model WBF", value: "0.824 / 0.499 mAP" },
    ],
    image: "/projects/tomato-ripeness.jpg",
    href: "/projects/tomato-ripeness",
  },
];

export const labWork: WorkspaceProject[] = [
  {
    slug: "padel-vision",
    title: "Padel Vision",
    eyebrow: "Computer vision experiment",
    year: "2026",
    summary: "Monocular player and ball tracking with court projection and match analytics.",
    role: "Computer vision research",
    scope: ["Ball and player tracking", "Court homography", "Annotated match output"],
    evidence: [{ label: "Input", value: "Single broadcast camera" }],
    image: "/projects/padel-vision.jpg",
    href: "/projects/padel-vision",
  },
  {
    slug: "objecttwin",
    title: "ObjectTwin",
    eyebrow: "3D pipeline experiment",
    year: "2026",
    summary: "Image-to-3D generation with swappable GPU backends and visible quality scoring.",
    role: "Full-stack and ML systems",
    scope: ["Pluggable model adapters", "Stage-by-stage jobs", "Browser GLB inspection"],
    evidence: [{ label: "Interface", value: "Next.js + FastAPI + Three.js" }],
    image: "/projects/objecttwin.jpg",
    href: "/projects/objecttwin",
  },
  {
    slug: "porsche-3d",
    title: "Porsche 3D",
    eyebrow: "Interactive web experiment",
    year: "2026",
    summary: "A real-time 3D configurator with orbit controls, paint changes, and camera transitions.",
    role: "Creative development",
    scope: ["Six 3D models", "Live materials", "Purposeful camera motion"],
    evidence: [{ label: "Runtime", value: "Three.js + WebGL" }],
    image: "/projects/porsche-3d.jpg",
    href: "/projects/porsche-3d",
  },
];

export const allWorkspaceProjects = [...featuredWork, ...labWork];
