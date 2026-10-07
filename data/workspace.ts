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
  thumb?: string;
  socialImage?: string;
  decisions?: { title: string; detail: string }[];
  presentation?: {
    flow: { title: string; items: string[] }[];
    decisions: { title: string; detail: string }[];
    stockCaption: string;
    headline: string;
    category: string;
    hero: { src: string; caption: string };
    walkthrough: { title: string; detail: string }[];
  };
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
    summary: "Laboratory inventory, from the source workbook to the final report. One ledger connects stock movements, corrections and Excel exports.",
    problem: "Moving inventory out of spreadsheets is only half the problem. The source of each balance still needs to be identifiable when data is imported again, corrected, or exported.",
    solution: "I built LabStock around a stock movement ledger. Source-aware validation and repeat-import checks protect the input; history-preserving corrections keep reports and exported workbooks connected to that record.",
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
    whyItMatters: "A usable operational product and a traceable data model, designed together—from source identity to the workbook people need at the end.",
    publicLimitations: "Screens shown come from a demo database with synthetic items, rooms, requesters, and users. Production infrastructure, hospital data, URLs, and unsanitized screenshots are withheld.",
    askSuggestion: "How does LabStock keep imports and reports traceable?",
    assetNote: "Screens were captured from the final release running against the labstock_pk_demo database: demo users, 22 generic items, rooms and requesters marked demo, no migrated hospital rows.",
    image: "/projects/labstock/stok.webp",
    thumb: "/projects/labstock/thumb-reset-a.webp",
    socialImage: "/projects/labstock/thumb-reset-a.jpg",
    presentation: {
      headline: "Every movement has a source.",
      category: "Laboratory inventory",
      hero: { src: "/projects/labstock/thumb-reset-a.webp", caption: "LabStock on desktop and phone. Existing demo screens; mobile view cropped for the cover." },
      walkthrough: [
        { title: "Know what needs attention.", detail: "Today brings low stock, expiry, recent requisitions and recorded movements into one operational view." },
        { title: "One request. Every item recorded.", detail: "Amprah collects the items in a single requisition. The phone view keeps room and requester alongside items leaving the lab." },
        { title: "Close the loop in Excel.", detail: "Monthly and yearly reporting reads from the ledger. The monthly screen exposes corrections alongside the closing balance and Excel export." },
      ],
      stockCaption: "The Stok screen: usable stock per item with expiry and condition, derived from the ledger.",
      flow: [
        { title: "Source", items: ["Workbook", "Sheet", "Source row"] },
        { title: "Validate", items: ["Item identity", "Unit", "Period", "Source mapping"] },
        { title: "Ledger", items: ["OPENING", "IN", "OUT", "ADJUSTMENT", "REVERSAL"] },
        { title: "Output", items: ["Monthly report", "Yearly report", "Excel export"] },
      ],
      decisions: [
        { title: "Source identity", detail: "Workbook, sheet, row, item identity, unit, and period travel together." },
        { title: "Repeat import", detail: "A repeated source is recognized before it can create another stock movement." },
        { title: "Correction", detail: "Supersession records the change while retaining the earlier ledger evidence." },
      ],
    },
    gallery: [
      { src: "/projects/labstock/hari-ini.webp", caption: "The Hari Ini (Today) screen: what needs action, recent requisitions and movements." },
      { src: "/projects/labstock/amprah.webp", caption: "Amprah, the lab's requisition form: one request posts every item to the stock ledger in one step." },
      { src: "/projects/labstock/amprah-mobile.webp", caption: "The requisition form on a phone: room and requester for items leaving the lab." },
      { src: "/projects/labstock/laporan.webp", caption: "Monthly report read from the same ledger, ready as the Excel workbook." },
    ],
  },
  {
    slug: "bdrs",
    title: "BDRS",
    eyebrow: "Operational software",
    year: "2026",
    status: "Closed · maintenance",
    summary: "A blood-bank system of record: requests, per-bag crossmatch, issue and outcomes connected in one case workspace.",
    problem: "The original process spanned 12 Excel workbooks and a Word document. Producing the monthly report meant manually transcribing between files; the lifecycle of a request and each blood unit needed a shared record.",
    solution: "I designed and built a domain-led system with one case workstation, separate state machines for service, crossmatch and transfusion, and controlled finalisation. Product decisions, full-stack implementation, testing and release were my responsibility, with AI-assisted implementation.",
    howItWorks: [
      "Receipt confirmation brings units into inventory; unconfirmed deliveries are not stock.",
      "Crossmatch belongs to a specific bag–patient pairing. An incompatible bag cannot be issued.",
      "Issue, physical outcome, transfusion episode and reaction remain separate recorded events.",
      "Finalisation evaluates seven blockers and two warnings; the open-episode check runs again inside the transaction.",
      "Corrections and controlled reopening preserve history with a recorded reason.",
    ],
    decisions: [
      { title: "One case. Separate truths.", detail: "Issuing a bag does not mean it was used. A used bag does not imply a recorded transfusion episode. Each event keeps its own meaning." },
      { title: "Compatibility belongs to the pairing.", detail: "Crossmatch is per bag, never a single verdict for the request. An incompatible result leaves the request line short." },
      { title: "A refusal must be actionable.", detail: "Named readiness checks explain what is unresolved and where to resolve it. Warnings remain distinct from blockers." },
      { title: "Enforce the boundary on the server.", detail: "Staff handle daily transactions; administration and correction require the super-admin role. Policies enforce the distinction beyond visible buttons." },
    ],
    role: "Product owner · sole developer · QA and release",
    stack: ["Laravel 13", "PHP 8.4", "Inertia 3", "React 19", "Tailwind 4", "SQLite"],
    evidence: [
      { label: "Recorded release", value: "19 September 2026 · owner UAT passed" },
      { label: "Unit / feature suite", value: "2,672 passed · 74 skipped · 3 incomplete" },
      { label: "End-to-end suite", value: "44 passed" },
      { label: "Handover", value: "Operator manual + technical maintenance package" },
    ],
    whyItMatters: "Domain modelling, traceable corrections and release discipline are part of the product—not work left behind the interface.",
    publicLimitations: "Release figures are the recorded September 2026 gate, not a fresh backend audit. No compliance, penetration-test, efficiency or cost claim is made. Restore rehearsal used a schema-complete, record-empty database. Public screens contain synthetic fixtures only; patient records, hospital identity and infrastructure remain private.",
    askSuggestion: "Why does BDRS separate issue, physical outcome and transfusion?",
    assetNote: "Existing public workstation views are sidebar-cropped derivatives of the final UI archive captured with synthetic fixtures. Readiness and mobile captures are element-scoped originals from the same archive, with no hospital mark. Canonical captures remain unmodified.",
    image: "/projects/bdrs/workstation.webp",
    thumb: "/projects/bdrs/cover-final.webp",
    socialImage: "/projects/bdrs/cover-final.jpg",
    gallery: [
      { src: "/projects/bdrs/readiness.webp", caption: "Synthetic case: named blockers explain why finalisation is refused." },
      { src: "/projects/bdrs/mobile.webp", caption: "The synthetic case workstation at phone width." },
      { src: "/projects/bdrs/dashboard.webp", caption: "Operational summary: active services, items needing action, stock condition." },
      { src: "/projects/bdrs/pengeluaran.webp", caption: "Issue register: bags leaving the bank and their outcome." },
      { src: "/projects/bdrs/inventaris.webp", caption: "Inventory by component and blood group, with expiry." },
      { src: "/projects/bdrs/episode.webp", caption: "Transfusion episodes traced from request to result." },
      { src: "/projects/bdrs/laporan.webp", caption: "Monthly report centre for the lab's workbook templates." },
    ],
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
      "Staff select Pagi or Sore; the server stamps the recording time. Each point, date and period has one effective ordinary record.",
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
    image: "/projects/suhulog/device-story.webp",
    thumb: "/projects/suhulog/cover-final.webp",
    socialImage: "/projects/suhulog/cover-final.jpg",
    gallery: [
      { src: "/projects/suhulog/phone-catat-suhu.webp", caption: "On a phone: staff pick the monitoring point and the morning (Pagi) or afternoon (Sore) slot, then enter the reading." },
      { src: "/projects/suhulog/desktop-monitoring.webp", caption: "On a laptop: the monthly curve per point, with configured limits and exceptions." },
      { src: "/projects/suhulog/desktop-laporan.webp", caption: "Monthly report backed by the same records used for the Excel and PDF export." },
    ],
    assetNote: "Existing sanitized portfolio captures; no hospital-identifying operational records. Scannable labels are withheld; the QR entry stage is explained without publishing an encoded destination.",
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
    image: "/projects/tomato-ripeness/research/real1-combine4.webp",
    thumb: "/projects/tomato-ripeness/cover-final.webp",
    socialImage: "/projects/tomato-ripeness/cover-final.jpg",
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
    thumb: "/projects/padel-vision/cover-final.webp",
    socialImage: "/projects/padel-vision/cover-final.jpg",
    video: "/projects/padel-vision/analytics/replay.mp4",
    href: "/projects/padel-vision",
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
    thumb: "/projects/porsche-3d/cover-final.webp",
    socialImage: "/projects/porsche-3d/cover-final.jpg",
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

featuredWork.sort((a, b) => ["labstock", "suhulog", "tomato-ripeness", "bdrs"].indexOf(a.slug) - ["labstock", "suhulog", "tomato-ripeness", "bdrs"].indexOf(b.slug));
export const allWorkspaceProjects = [...featuredWork, ...labWork];
