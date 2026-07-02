export type ProjectLinks = {
  demo?: string;
  github?: string;
  paper?: string;
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
  tech: string[];
  features: string[];
  links: ProjectLinks;
};

export const projects: Project[] = [
  {
    slug: "tomato-ripeness",
    title:
      "Tomato Maturity Detection with YOLOv11, Swin Transformer, Multi-Scale SPPF & Weighted Boxes Fusion",
    category: "Research",
    year: "2026",
    description:
      "Three-class tomato ripeness detection combining a YOLOv11 baseline with a Swin Transformer backbone, multi-scale SPPF, and WBF ensembling for higher mAP on small and occluded fruit.",
    longDescription:
      "This research explores architectural improvements for tomato maturity detection in real greenhouse conditions. Starting from a YOLOv11 baseline, the model is enhanced with a Swin Transformer backbone for stronger global context, a multi-scale SPPF module for better small-object representation, and Weighted Boxes Fusion to ensemble predictions across models. The system classifies tomatoes into three ripeness stages and is evaluated against occlusion, overlap, and lighting variation.",
    image: "/projects/tomato-ripeness.jpg",
    video: "/projects/tomato-ripeness.mp4",
    tech: ["YOLOv11", "Swin Transformer", "PyTorch", "OpenCV", "Weighted Boxes Fusion"],
    features: [
      "Three-class ripeness detection (green, orange, ripe)",
      "Swin Transformer backbone for global feature context",
      "Multi-scale SPPF for small and occluded fruit",
      "WBF ensembling across model variants",
      "Evaluated on real greenhouse imagery with heavy occlusion",
    ],
    links: {
      github: "https://github.com/adjierizqan/tomato-ripeness-yolov11",
      // paper: add the URL here once the paper is published
    },
  },
  {
    slug: "padel-vision",
    title: "Padel Vision — Monocular Padel Match Analytics",
    category: "Research",
    year: "2026",
    description:
      "Computer-vision pipeline that turns a single broadcast camera into full padel analytics: player tracking, ball trajectory, shot speed, and a live tactical minimap.",
    longDescription:
      "Padel Vision analyzes professional padel matches from a single monocular broadcast feed. A fine-tuned YOLOv11 model detects the ball at high resolution while pose models track all four players; court homography maps everything onto a top-down tactical minimap. The system estimates ball speed, recognizes shot types, and renders an annotated output video with live trajectories, player IDs, and match statistics.",
    image: "/projects/padel-vision.jpg",
    video: "/projects/padel-vision.mp4",
    tech: ["YOLOv11", "PyTorch", "OpenCV", "Pose Estimation", "Homography"],
    features: [
      "Ball detection and trajectory tracking from broadcast video",
      "Four-player tracking with pose estimation",
      "Court calibration and top-down tactical minimap",
      "Ball speed and shot-type recognition",
      "Fully annotated output video rendering",
    ],
    links: {
      github: "https://github.com/adjierizqan/padel-vision",
    },
  },
  {
    slug: "objecttwin",
    title: "ObjectTwin — Image-to-3D Reconstruction Pipeline",
    category: "Web App",
    year: "2026",
    description:
      "End-to-end image-to-3D platform with pluggable GPU adapters, transparent quality evaluation, and a web-based 3D model inspector.",
    longDescription:
      "ObjectTwin turns product photos into inspectable 3D models. The backend orchestrates image-to-3D generation through pluggable GPU adapters, runs a transparent quality-evaluation stage on every result, and exposes job progress through an API. The Next.js frontend provides a full workflow: upload, pipeline monitoring, quality reports, and an interactive in-browser 3D inspector for the generated models.",
    image: "/projects/objecttwin.jpg",
    video: "/projects/objecttwin.mp4",
    tech: ["Next.js", "TypeScript", "Three.js", "Python", "FastAPI"],
    features: [
      "Image-to-3D generation with pluggable GPU adapters",
      "Automated quality evaluation with visual reports",
      "Job pipeline with real-time progress tracking",
      "Web-based interactive 3D model inspector",
    ],
    links: {
      github: "https://github.com/adjierizqan/objecttwin",
    },
  },
  {
    slug: "porsche-3d",
    title: "Porsche Collector — Interactive 3D Configurator",
    category: "Website",
    year: "2026",
    description:
      "Fan-made interactive Porsche showcase: six legendary models rendered in real-time 3D with orbit controls, repainting, and cinematic GSAP transitions.",
    longDescription:
      "A fan-made digital atelier celebrating six decades of Porsche design. Each car is rendered in real time with Three.js — visitors can orbit, switch between six legendary models, and repaint them live. Transitions between cars are choreographed with GSAP for a cinematic, showroom-like feel, while the editorial UI keeps specs and stories readable around the 3D centerpiece.",
    image: "/projects/porsche-3d.jpg",
    video: "/projects/porsche-3d.mp4",
    tech: ["Three.js", "GSAP", "JavaScript", "WebGL"],
    features: [
      "Six real-time 3D Porsche models",
      "Orbit interaction and live repainting",
      "Cinematic GSAP transitions between cars",
      "Editorial spec panels framing the 3D hero",
    ],
    links: {
      github: "https://github.com/adjierizqan/porsche_3d",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
