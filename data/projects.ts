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
