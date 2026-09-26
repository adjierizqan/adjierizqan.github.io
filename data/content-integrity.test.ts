import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import aiContext from "./portfolio-ai-context.json";
import { allWorkspaceProjects, featuredWork } from "./workspace";
import { projects as legacyProjects } from "./projects";
import annotationMaps from "./tomatovision-annotation-maps.json";
import { tomatoConfigurations, tomatoDataset, tomatoMatchedScene, tomatoStatus } from "./tomatovision";

const primarySlugs = ["labstock", "bdrs", "suhulog", "tomato-ripeness"];
const forbiddenMarketing = /\b(innovative|cutting-edge|seamless|revolutionary|game-changing|world-class)\b/i;

function aiRecord(project: (typeof allWorkspaceProjects)[number]) {
  return {
    id: project.slug,
    name: project.title,
    workspaceTarget: project.slug,
    category: project.eyebrow,
    ...(project.status ? { publicStatus: project.status } : {}),
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    howItWorks: project.howItWorks,
    role: project.role,
    stack: project.stack,
    verifiedEvidence: project.evidence,
    whyItMatters: project.whyItMatters,
    publicLimitations: project.publicLimitations,
    askSuggestion: project.askSuggestion,
  };
}

describe("portfolio content integrity", () => {
  test("every primary project has the required professional content fields", () => {
    const primary = primarySlugs.map((slug) => featuredWork.find((project) => project.slug === slug));
    expect(primary.every(Boolean)).toBe(true);
    for (const project of primary) {
      expect(project?.summary.trim().length).toBeGreaterThan(40);
      expect(project?.problem.trim().length).toBeGreaterThan(40);
      expect(project?.solution.trim().length).toBeGreaterThan(40);
      expect(project?.role.trim().length).toBeGreaterThan(5);
      expect(project?.evidence.length).toBeGreaterThanOrEqual(2);
      expect(project?.whyItMatters.trim().length).toBeGreaterThan(30);
      expect(project?.publicLimitations.trim().length).toBeGreaterThan(30);
      expect(project?.askSuggestion.endsWith("?")).toBe(true);
      expect(project?.howItWorks.length).toBeGreaterThanOrEqual(project?.slug === "bdrs" ? 2 : 3);
      expect(project?.howItWorks.length).toBeLessThanOrEqual(5);
    }
  });

  test("summaries are unique and avoid placeholder marketing language", () => {
    const summaries = allWorkspaceProjects.map((project) => project.summary);
    expect(new Set(summaries).size).toBe(summaries.length);
    for (const project of allWorkspaceProjects) {
      expect(JSON.stringify(project)).not.toMatch(forbiddenMarketing);
    }
  });

  test("AI project context exactly mirrors canonical Workspace content", () => {
    expect(aiContext.projects).toEqual(allWorkspaceProjects.map(aiRecord));
  });

  test("conservative projects expose their public evidence boundaries", () => {
    const labstock = featuredWork.find((project) => project.slug === "labstock");
    const bdrs = featuredWork.find((project) => project.slug === "bdrs");
    expect(labstock?.publicLimitations).toContain("Production infrastructure");
    expect(bdrs?.publicLimitations).toContain("No production, deployment, user, compliance, or release claim");
    // Screens are shown only from recorded synthetic sources, and say so.
    for (const project of [labstock, bdrs]) {
      const media = [project?.image, ...(project?.gallery ?? []).map((item) => item.src)];
      expect(media.every((src) => src?.startsWith(`/projects/${project?.slug}/`))).toBe(true);
      expect(project?.assetNote).toMatch(/demo|fixtures/i);
    }
  });

  test("authoritative TomatoVision metrics remain distinct and exact", () => {
    const tomato = featuredWork.find((project) => project.slug === "tomato-ripeness");
    expect(tomato?.evidence).toEqual([
      { label: "YOLOv11 baseline", value: "0.795 mAP@0.5" },
      { label: "Best modified model", value: "0.807 mAP@0.5" },
      { label: "Three-model WBF", value: "0.824 mAP@0.5" },
      { label: "WBF stricter metric", value: "0.499 mAP@0.5:0.95" },
    ]);
  });
});

describe("TomatoVision case study record", () => {
  const maps = annotationMaps as { id: string; counts: Record<string, number>; boxes: number[][] }[];

  test("metrics match the verified validation tables exactly", () => {
    expect(tomatoConfigurations.map(({ label, precision, recall, map50, map5095, fps, msPerImage }) => [label, precision, recall, map50, map5095, fps, msPerImage])).toEqual([
      ["YOLOv11", 0.758, 0.753, 0.795, 0.470, 18.089, 55.28],
      ["+ Swin-T", 0.768, 0.771, 0.805, 0.474, 18.706, 53.46],
      ["+ Swin-T + MS-SPPF", 0.775, 0.772, 0.807, 0.477, 18.951, 52.77],
      ["Combine 1", 0.756, 0.786, 0.814, 0.490, 14.311, 69.88],
      ["Combine 2", 0.777, 0.767, 0.817, 0.492, 14.415, 69.37],
      ["Combine 3", 0.789, 0.757, 0.812, 0.487, 14.888, 67.17],
      ["Combine 4", 0.767, 0.796, 0.824, 0.499, 11.245, 88.93],
    ]);
  });

  test("dataset counts are the source-annotation counts, not the unverified 50,040", () => {
    expect(tomatoDataset.sourceImages).toBe(1051);
    expect(tomatoDataset.boxes).toEqual({ green: 12168, orange: 14640, red: 13989 });
    expect(JSON.stringify(tomatoDataset)).not.toContain("50,040");
  });

  test("status makes no publication claim", () => {
    expect(tomatoStatus).toBe("Master’s thesis research · 2026");
    expect(tomatoStatus).not.toMatch(/published|manuscript|preparation/i);
  });

  test("annotation maps carry the counts shown in their captions", () => {
    expect(maps.map((map) => [map.id, map.boxes.length, map.counts])).toEqual([
      ["0032_110sp_1013_L4", 12, { green: 12, orange: 0, red: 0 }],
      ["0199_110sp_1047_L7", 12, { green: 0, orange: 0, red: 12 }],
      ["0005_110sp_1004_L3", 10, { green: 0, orange: 10, red: 0 }],
      ["IMG_4246", 625, { green: 244, orange: 78, red: 303 }],
    ]);
  });
});

describe("TomatoVision public media", () => {
  const research = "public/projects/tomato-ripeness/research";

  test("page images are the CC0 demo outputs and exist on disk", () => {
    const paths = [
      ...tomatoConfigurations.map((item) => item.denseSceneImage),
      ...tomatoMatchedScene.map((item) => item.src),
      featuredWork.find((project) => project.slug === "tomato-ripeness")?.image ?? "",
    ];
    for (const path of paths) {
      expect(path).toMatch(/^\/projects\/tomato-ripeness\/research\/(demo|real)\d-[\w]+\.webp$/);
      expect(existsSync("public" + path)).toBe(true);
    }
  });

  test("no thesis-dataset imagery is published", () => {
    // thumb.webp is a split of real1-yolov11 and real1-combine4 (docs/design/v101/build_assets.py)
    expect(readdirSync(research).every((file) => file.startsWith("demo") || file.startsWith("real") || file === "thumb.webp")).toBe(true);
    expect(readdirSync("public/projects/tomato-ripeness")).toEqual(["research"]);
  });
});

describe("Portfolio V1 scope", () => {
  test("parked projects are absent from the workspace, legacy pages and AI context", () => {
    for (const slug of ["objecttwin", "think-it"]) {
      expect(allWorkspaceProjects.some((project) => project.slug === slug)).toBe(false);
      expect(aiContext.projects.some((project) => project.id === slug)).toBe(false);
      expect(legacyProjects.some((project) => project.slug === slug)).toBe(false);
    }
  });
});

describe("V1.0.1 media", () => {
  test("every project has an existing 16:10 thumbnail and its gallery files exist", () => {
    for (const project of allWorkspaceProjects) {
      expect(project.thumb).toBeTruthy();
      for (const src of [project.thumb, project.image, project.video, ...(project.gallery ?? []).map((item) => item.src)].filter(Boolean)) {
        expect(existsSync("public" + src)).toBe(true);
      }
    }
  });
});
