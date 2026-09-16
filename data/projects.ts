export type ProjectLinks = {
  demo?: string;
  github?: string;
  paper?: string;
};

export type ProjectShot = {
  src: string;
  caption: string;
};

export type ProjectSection = {
  heading: string;
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  category: "Research" | "Web App" | "Website";
  year: string;
  description: string;
  longDescription: string;
  image: string;
  video?: string;
  /** Extra prose sections shown under the overview. */
  sections?: ProjectSection[];
  /** Captioned screenshots shown below the feature list. */
  gallery?: ProjectShot[];
  tech: string[];
  features: string[];
  links: ProjectLinks;
};

export const projects: Project[] = [
  {
    slug: "tomato-ripeness",
    title:
      "Tomato Maturity Detection with YOLOv11, Swin Transformer, Multi-Scale SPPF and Weighted Boxes Fusion",
    category: "Research",
    year: "2026",
    description:
      "Detects three ripeness stages of greenhouse tomatoes. A YOLOv11 baseline is compared against Swin Transformer and multi-scale SPPF variants, then ensembled with Weighted Boxes Fusion, which raises mAP@0.5 from 0.795 to 0.824.",
    longDescription:
      "Greenhouse tomato detection is hard because fruit overlap, hide behind leaves, and sit at very different distances from the camera. This project starts from a YOLOv11 baseline and tests two architectural changes: a Swin Transformer backbone for wider context, and a multi-scale SPPF block for small fruit. Predictions from the three models are then combined with Weighted Boxes Fusion. The best ensemble reaches 0.824 mAP@0.5 on a three-class ripeness dataset (green, orange, red), up from 0.795 for the baseline.",
    image: "/projects/tomato-ripeness.jpg",
    video: "/projects/tomato-ripeness.mp4",
    tech: ["YOLOv11", "Swin Transformer", "PyTorch", "OpenCV", "Weighted Boxes Fusion"],
    features: [
      "Three ripeness classes: green, orange, red",
      "Swin Transformer backbone variant",
      "Multi-scale SPPF variant for small fruit",
      "Weighted Boxes Fusion across the three models",
      "Evaluated on real greenhouse photos with heavy occlusion",
    ],
    links: {
      github: "https://github.com/adjierizqan/tomato-ripeness-yolov11",
      // paper: add the URL here once the paper is published
    },
  },
  {
    slug: "padel-vision",
    title: "Padel Vision: Monocular Padel Match Analytics",
    category: "Research",
    year: "2026",
    description:
      "Reads a professional padel match from one broadcast camera: it tracks all four players and the ball, estimates shot speed, and draws a live top-down minimap.",
    longDescription:
      "Padel Vision takes a single broadcast clip and turns it into match data. A fine-tuned YOLOv11 model finds the ball at high resolution, pose models follow the four players, and a court homography projects everything onto a top-down minimap. On top of the tracking it estimates ball speed, classifies shot types, and renders an annotated video with trajectories, player identities, and match statistics.",
    image: "/projects/padel-vision.jpg",
    video: "/projects/padel-vision.mp4",
    tech: ["YOLOv11", "PyTorch", "OpenCV", "Pose Estimation", "Homography"],
    features: [
      "Ball detection and trajectory tracking from broadcast video",
      "Tracking of all four players with pose estimation",
      "Court calibration and top-down minimap",
      "Ball speed estimation and shot classification",
      "Annotated output video",
    ],
    links: {
      github: "https://github.com/adjierizqan/padel-vision",
    },
  },
  {
    slug: "suhulog",
    title: "SuhuLog: Hospital Laboratory Temperature Logging",
    category: "Web App",
    year: "2026",
    description:
      "An internal web app for a hospital laboratory to record refrigerator and room temperatures twice a day, and to produce the monthly report in the lab's official Excel workbook.",
    longDescription:
      "SuhuLog runs in production for a hospital laboratory. Staff log the temperature of each refrigerator and room in the morning (Pagi) and again in the evening (Sore), and admins export the month as the official Excel workbook, a PDF, or a ZIP of every monitoring point. It is a small app with a narrow job, so most of the work went into the parts that are easy to get wrong: making sure one slot means one reading, that a correction never erases what was there before, and that the monthly export keeps the exact shape of the workbook the lab already reports in. I did the product design, the full-stack build, and the deployment and release engineering.",
    image: "/projects/suhulog.jpg",
    sections: [
      {
        heading: "The problem",
        body: "The lab recorded temperatures manually, and the official report is a supplied Excel workbook that has to keep its exact sheets, layout and print setup. A replacement had to make recording quicker at the fridge door, keep a trustworthy history of every value, and still produce that same workbook at the end of the month.",
      },
      {
        heading: "The solution",
        body: "Each monitoring point carries a printed QR label. Scanning it opens the entry form already fixed to that point, so staff do not have to pick it from a list. The recording time is set by the server, not typed in. Every point has its own configured range, and a value outside it is saved and clearly flagged rather than blocked or clamped. The dashboard shows which morning and evening slots are still empty today, and the monthly report, the curve and the Excel export are all built from the same stored records.",
      },
      {
        heading: "Technical implementation",
        body: "Express 5 on Node.js 22 with server-rendered EJS views and SQLite through better-sqlite3, deliberately without a client framework. Chart.js draws the monthly curve, xlsx-populate fills the official worksheet template, pdfkit renders the PDF and jszip bundles them. Sessions use express-session with bcryptjs password hashing, and the two roles, staff and admin, are separated at the route level. History is append-only: corrections add a new record and the older one is superseded rather than overwritten, a soft delete requires a reason, and sign-ins and sensitive changes are written to an append-only audit log.",
      },
      {
        heading: "Production and releases",
        body: "The current release is v1.2.3, running on a VPS behind Nginx with HTTPS and systemd. Daily SQLite backups are checked with an isolated test restore rather than assumed to work, and each release in this cycle started from a freshly verified backup. The suite is 276 automated tests, with typecheck and a production build as release gates. Releases are fast-forward only, and the commit SHA is checked to match across local, origin and production.",
      },
    ],
    gallery: [
      {
        src: "/projects/suhulog-catat-suhu.jpg",
        caption:
          "Entry form: point, period, temperature. Values outside the configured range are still saved.",
      },
      {
        src: "/projects/suhulog-monitoring.jpg",
        caption:
          "Monthly curve for one point, with the configured range drawn in and out-of-range readings marked.",
      },
      {
        src: "/projects/suhulog-laporan.jpg",
        caption:
          "Report preview showing the daily rows that go into the Excel and PDF export.",
      },
      {
        src: "/projects/suhulog-label-qr.jpg",
        caption:
          "Printable QR labels. Each one opens the entry form for that exact monitoring point.",
      },
    ],
    tech: [
      "TypeScript",
      "Node.js",
      "Express 5",
      "SQLite",
      "EJS",
      "Chart.js",
      "Nginx",
    ],
    features: [
      "QR label per monitoring point that opens the form for that point",
      "Per-point temperature range with an explicit out-of-range status",
      "One effective record per daily slot, Pagi and Sore",
      "Corrections appended instead of overwriting history",
      "Soft delete requires a reason; append-only audit log",
      "Monthly export as the official Excel workbook, a PDF, or a ZIP of every point",
      "Separate staff and admin roles",
    ],
    links: {},
  },
  {
    slug: "objecttwin",
    title: "ObjectTwin: Image-to-3D Reconstruction Pipeline",
    category: "Web App",
    year: "2026",
    description:
      "Turns one product photo into a 3D model you can inspect in the browser. Every generation gets a quality score, and the GPU model backends are swappable.",
    longDescription:
      "ObjectTwin generates 3D models from single photos and is honest about how good each result is. The backend runs generation through pluggable GPU adapters (Hunyuan3D, InstantMesh, TRELLIS), cleans the mesh, and scores every output on silhouette match, geometry health, textures, complexity, and pipeline reliability. The Next.js frontend covers the whole workflow: upload, stage-by-stage progress, the quality report, and an interactive GLB viewer.",
    image: "/projects/objecttwin.jpg",
    video: "/projects/objecttwin.mp4",
    tech: ["Next.js", "TypeScript", "Three.js", "Python", "FastAPI"],
    features: [
      "Pluggable image-to-3D adapters (Hunyuan3D, InstantMesh, TRELLIS)",
      "Weighted quality score with the reasoning visible",
      "Job pipeline with per-stage progress and logs",
      "In-browser GLB inspector with orbit controls",
    ],
    links: {
      github: "https://github.com/adjierizqan/objecttwin",
    },
  },
  {
    slug: "porsche-3d",
    title: "Porsche Collector: Interactive 3D Configurator",
    category: "Website",
    year: "2026",
    description:
      "A fan-made Porsche site. Six cars rendered in real time with Three.js; you can orbit each one, repaint it, and switch between models with animated camera moves.",
    longDescription:
      "A fan project about Porsche design. Six models, from the 1991 RWB 964 to the 2022 718 Cayman GT4 RS, are rendered in real time with Three.js. Visitors orbit each car, change its paint, and move between models through GSAP camera transitions. The site is plain HTML with ES modules, so there is no build step. 3D models by Ddiaz Design on Sketchfab.",
    image: "/projects/porsche-3d.jpg",
    video: "/projects/porsche-3d.mp4",
    tech: ["Three.js", "GSAP", "JavaScript", "WebGL"],
    features: [
      "Six real-time 3D Porsche models",
      "Orbit interaction and live repainting",
      "GSAP camera transitions between cars",
      "No build step: plain HTML and ES modules",
    ],
    links: {
      github: "https://github.com/adjierizqan/porsche_3d",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
