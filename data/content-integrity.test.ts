import { describe, expect, test } from "bun:test";
import aiContext from "./portfolio-ai-context.json";
import { allWorkspaceProjects, featuredWork } from "./workspace";

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
    expect(labstock?.image).toBeUndefined();
    expect(bdrs?.publicLimitations).toContain("No production, deployment, user, compliance, or release claim");
    expect(bdrs?.image).toBeUndefined();
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
