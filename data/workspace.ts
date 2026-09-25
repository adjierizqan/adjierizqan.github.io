export type WorkspaceProject = {
  slug: string;
  title: string;
  eyebrow: string;
  year: string;
  status?: string;
  summary: string;
  problem: string;
  solution: string;
  howItWorks: string[];
  role: string;
  stack: string[];
  evidence: { label: string; value: string }[];
  whyItMatters: string;
  publicLimitations: string;
  askSuggestion: string;
  image?: string;
  video?: string;
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
    status: "Closed · maintenance",
    summary: "A laboratory inventory system that turns source workbooks into a traceable stock ledger, monthly and yearly reports, and template-compatible Excel exports.",
    problem: "Spreadsheet inventory data had to move through import, stock ledger, website reporting, and export without losing source traceability or turning corrections into silent rewrites.",
    solution: "Adjie built a source-aware import and reporting workflow that preserves workbook provenance, supports idempotent re-import, and keeps corrections auditable across the ledger, website reports, and exported workbooks.",
    howItWorks: [
      "Maps imported records to workbook, sheet, and source row evidence.",
      "Maps source records to the effective item identities used by reports and exports.",
      "Recognizes a repeated import instead of duplicating its ledger movements.",
      "Keeps monthly and yearly web reports and exported workbooks on the same ledger data.",
    ],
    role: "Product engineering · data correctness · release engineering",
    stack: ["Next.js 16", "TypeScript", "PostgreSQL", "Drizzle ORM", "ExcelJS"],
    evidence: [
      { label: "Workflow", value: "Import → ledger → report → export" },
      { label: "Import safety", value: "Idempotent re-import" },
      { label: "Corrections", value: "Auditable · history-preserving" },
      { label: "Monthly output", value: "Detail + recap workbook" },
    ],
    whyItMatters: "The system keeps inventory movements and familiar reporting outputs connected to the evidence they came from.",
    publicLimitations: "Public material is limited to workflow-level evidence. Production infrastructure, hospital data, URLs, and unsanitized screenshots are withheld.",
    askSuggestion: "How does LabStock keep imports and reports traceable?",
    assetNote: "No demonstrably sanitized LabStock product screenshot is available in the portfolio, so this case uses a text evidence state.",
  },
  {
    slug: "bdrs",
    title: "BDRS",
    eyebrow: "Operational software",
    year: "2026",
    summary: "A blood-bank operations system designed around domain workflows; its public technical and release evidence is still being reconciled.",
    problem: "Blood-bank operations require workflow-specific software rather than a generic administration dashboard, but the current public record is not complete enough for detailed operational claims.",
    solution: "Adjie designed and implemented a workflow-oriented system while keeping patient data, production details, and unverified release claims outside the public case study.",
    howItWorks: [
      "Organizes the application around operational workflows rather than generic dashboard modules.",
      "Keeps the public case-study boundary separate from private operational data.",
    ],
    role: "Product engineering · workflow design",
    stack: [],
    evidence: [
      { label: "Implemented", value: "Workflow-oriented system structure" },
      { label: "Under review", value: "Technical and release evidence" },
      { label: "Withheld", value: "Patient and production data" },
    ],
    whyItMatters: "The project demonstrates domain-first product thinking while preserving a strict public evidence boundary.",
    publicLimitations: "No production, deployment, user, compliance, or release claim is published until the latest evidence is reconciled; no public-safe screenshot is currently available.",
    askSuggestion: "What is currently verified about BDRS?",
    assetNote: "The BDRS case remains text-only until its public evidence is reconciled and a synthetic or demonstrably sanitized screenshot set is available.",
  },
  {
    slug: "suhulog",
    title: "SuhuLog",
    eyebrow: "Operational software",
    year: "2026",
    summary: "A hospital laboratory temperature-logging system for QR-based entry, exception monitoring, auditable corrections, and official monthly exports.",
    problem: "Manual refrigerator and room-temperature records had to become faster to capture without losing the laboratory's twice-daily slots, correction history, configured limits, or official workbook format.",
    solution: "Adjie designed, built, and released a focused web application that opens the correct monitoring point from a QR label and produces charts, Excel, PDF, and ZIP reports from the same effective records.",
    howItWorks: [
      "A QR label opens the entry form for one exact monitoring point.",
      "Server time assigns the Pagi or Sore slot; each slot has one effective record.",
      "Configured ranges flag out-of-range readings without blocking or clamping them.",
      "Corrections append a new record and supersede the prior value instead of overwriting history.",
      "Monthly views, charts, Excel, PDF, and ZIP exports read the same stored records.",
    ],
    role: "Product design · full-stack engineering · release engineering",
    stack: ["TypeScript", "Node.js", "Express 5", "SQLite", "EJS", "Chart.js", "Nginx"],
    evidence: [
      { label: "Release", value: "v1.2.3" },
      { label: "Quality gate", value: "276 automated tests" },
      { label: "Exports", value: "Official Excel · PDF · ZIP" },
      { label: "Operations", value: "HTTPS · systemd · verified backups" },
    ],
    whyItMatters: "SuhuLog replaces a fragile manual handoff while preserving the reporting format and audit history the laboratory relies on.",
    publicLimitations: "Only sanitized portfolio screenshots and public-safe system behavior are shown; operational records and hospital-identifying data are excluded.",
    askSuggestion: "How does SuhuLog preserve trustworthy temperature records?",
    image: "/projects/suhulog.jpg",
    gallery: [
      { src: "/projects/suhulog-catat-suhu.jpg", caption: "Entry for one monitoring point and period; out-of-range values remain recorded and visibly flagged." },
      { src: "/projects/suhulog-monitoring.jpg", caption: "Monthly monitoring curve with configured limits and explicit exceptions." },
      { src: "/projects/suhulog-laporan.jpg", caption: "Report preview backed by the same effective records used for Excel and PDF export." },
      { src: "/projects/suhulog-label-qr.jpg", caption: "Printable QR labels that open the exact monitoring point's entry flow." },
    ],
    href: "/projects/suhulog",
  },
  {
    slug: "tomato-ripeness",
    title: "TomatoVision",
    eyebrow: "Applied AI",
    year: "2026",
    summary: "A computer-vision study that detects three greenhouse tomato maturity stages and compares a YOLOv11 baseline with modified models and a three-model WBF ensemble.",
    problem: "Greenhouse tomatoes overlap, hide behind leaves, and appear at different scales, making maturity detection difficult for a single detector configuration.",
    solution: "Adjie evaluated a YOLOv11 baseline, Swin Transformer and multi-scale SPPF variants, then fused their predictions with Weighted Boxes Fusion while reporting single-model and ensemble results separately.",
    howItWorks: [
      "Detects green, orange, and red maturity classes in greenhouse imagery.",
      "Uses the YOLOv11 result as the evaluation baseline.",
      "Tests Swin Transformer and multi-scale SPPF architectural variants.",
      "Combines three model outputs with Weighted Boxes Fusion.",
    ],
    role: "Computer vision research · model development · evaluation",
    stack: ["YOLOv11", "Swin Transformer", "PyTorch", "OpenCV", "Weighted Boxes Fusion"],
    evidence: [
      { label: "YOLOv11 baseline", value: "0.795 mAP@0.5" },
      { label: "Best modified model", value: "0.807 mAP@0.5" },
      { label: "Three-model WBF", value: "0.824 mAP@0.5" },
      { label: "WBF stricter metric", value: "0.499 mAP@0.5:0.95" },
    ],
    whyItMatters: "The study shows which gains come from a single architecture and which require ensemble inference, rather than merging them into one headline result.",
    publicLimitations: "The portfolio reports evaluated research results and public project media; it does not claim a deployed agricultural product.",
    askSuggestion: "How were the TomatoVision models evaluated?",
    image: "/projects/tomato-ripeness/research/demo1-combine4.webp",
    href: "/projects/tomato-ripeness",
  },
];

export const labWork: WorkspaceProject[] = [
  {
    slug: "padel-vision",
    title: "Padel Vision",
    eyebrow: "Computer vision experiment",
    year: "2026",
    summary: "A monocular match-analysis pipeline that tracks four players and the ball, projects play onto a court minimap, and renders annotated video.",
    problem: "Broadcast footage provides one moving camera view, while useful match analysis needs stable player, ball, and court coordinates.",
    solution: "Adjie built a video pipeline combining fine-tuned ball detection, player pose tracking, court homography, and match overlays.",
    howItWorks: ["Detects and tracks the ball at high resolution.", "Tracks four players with pose estimation.", "Projects detections through court homography.", "Renders trajectories, identities, speed estimates, and match annotations."],
    role: "Computer vision research",
    stack: ["YOLOv11", "PyTorch", "OpenCV", "Pose Estimation", "Homography"],
    evidence: [{ label: "Input", value: "Single broadcast camera" }, { label: "Output", value: "Annotated video · court minimap" }],
    whyItMatters: "The experiment turns ordinary match footage into inspectable spatial and motion data without a multi-camera setup.",
    publicLimitations: "The portfolio presents an experiment and public media, not a production analytics service.",
    askSuggestion: "How does Padel Vision analyze one broadcast camera?",
    image: "/projects/padel-vision/analytics/court-control.webp",
    href: "/projects/padel-vision",
  },
  {
    slug: "objecttwin",
    title: "ObjectTwin",
    eyebrow: "3D pipeline experiment",
    year: "2026",
    summary: "An image-to-3D workflow with swappable generation backends, stage-level progress, browser inspection, and visible output-quality scoring.",
    problem: "Single-image 3D generation can produce inconsistent results while hiding which pipeline stage or quality dimension failed.",
    solution: "Adjie built a Next.js and FastAPI workflow that runs pluggable GPU adapters, cleans and scores generated meshes, and exposes progress and GLB inspection in the browser.",
    howItWorks: ["Routes jobs through pluggable Hunyuan3D, InstantMesh, or TRELLIS adapters.", "Reports stage-by-stage progress and logs.", "Scores silhouette, geometry, texture, complexity, and pipeline reliability.", "Loads the resulting GLB in an interactive browser viewer."],
    role: "Full-stack and ML systems engineering",
    stack: ["Next.js", "TypeScript", "Three.js", "Python", "FastAPI"],
    evidence: [{ label: "Backends", value: "Hunyuan3D · InstantMesh · TRELLIS" }, { label: "Inspection", value: "Visible score · browser GLB viewer" }],
    whyItMatters: "The workflow makes generative 3D output quality and pipeline progress inspectable instead of treating generation as a black box.",
    publicLimitations: "The portfolio presents an experimental pipeline and public media, not a hosted generation service.",
    askSuggestion: "How does ObjectTwin evaluate generated 3D models?",
    image: "/projects/objecttwin/showcase/hero.webp",
    video: "/projects/objecttwin.mp4",
    gallery: [
      { src: "/projects/objecttwin/source-captures/01-source-workspace.png", caption: "ObjectTwin source and pipeline workspace." },
      { src: "/projects/objecttwin/source-captures/02-generation.png", caption: "Completed generation stages beside the browser 3D viewer." },
      { src: "/projects/objecttwin/source-captures/03-inspection.png", caption: "Generated GLB inspected from another browser-viewer angle." },
    ],
    href: "/projects/objecttwin",
  },
  {
    slug: "porsche-3d",
    title: "Porsche 3D",
    eyebrow: "Interactive web experiment",
    year: "2026",
    summary: "A fan-made real-time 3D car configurator with orbit interaction, live paint changes, and animated transitions between six models.",
    problem: "The project explores how a static vehicle collection can become an interactive, browser-based product experience without an application framework.",
    solution: "Adjie built a plain-HTML Three.js experience with live materials, orbit controls, and GSAP-driven camera movement.",
    howItWorks: ["Loads six car models in a real-time WebGL scene.", "Provides orbit controls and live material changes.", "Uses GSAP for camera transitions between models.", "Runs as HTML and ES modules without a build step."],
    role: "Creative development",
    stack: ["Three.js", "GSAP", "JavaScript", "WebGL"],
    evidence: [{ label: "Models", value: "Six interactive cars" }, { label: "Runtime", value: "Three.js · WebGL · no build step" }],
    whyItMatters: "The experiment demonstrates purposeful 3D interaction and material control in a lightweight web runtime.",
    publicLimitations: "This is a fan project; 3D models are credited to Ddiaz Design on Sketchfab.",
    askSuggestion: "How was the Porsche 3D interaction built?",
    image: "/projects/porsche-3d/cinematic/01-rwb964-hero.webp",
    video: "/projects/porsche-3d.mp4",
    gallery: [
      { src: "/projects/porsche-3d/cinematic/02-918-profile.webp", caption: "918 Spyder Weissach, side on, rendered in the site's Three.js scene." },
      { src: "/projects/porsche-3d/cinematic/03-lineup.webp", caption: "All six models from the site in one scene." },
      { src: "/projects/porsche-3d/cinematic/05-gt3-metallic.webp", caption: "911 GT3 in GT Silver, metallic finish." },
      { src: "/projects/porsche-3d/cinematic/05-gt3-gloss.webp", caption: "911 GT3 in Guards Red, gloss finish." },
      { src: "/projects/porsche-3d/cinematic/05-gt3-matte.webp", caption: "911 GT3 in Jet Black, matte finish." },
      { src: "/projects/porsche-3d/cinematic/06-rwb964-wheel.webp", caption: "RWB 964 wheel and brake detail." },
      { src: "/projects/porsche-3d/cinematic/06-rwb964-wing.webp", caption: "RWB 964 rear wing." },
      { src: "/projects/porsche-3d/cinematic/06-rwb964-light.webp", caption: "RWB 964 headlights." },
    ],
    href: "/projects/porsche-3d",
  },
];

export const allWorkspaceProjects = [...featuredWork, ...labWork];
