import { describe, expect, test } from "bun:test";
import { allWorkspaceProjects, featuredWork } from "./workspace";
import { homeEntries, releases, workGroups, hero, plainHeadline, constraints, workflows } from "./personal-site";
import { tomatoConfigurations } from "./tomatovision";

describe("v2 site content", () => {
  test("every public project has a release state with a named source", () => {
    for (const p of allWorkspaceProjects) {
      expect(releases[p.slug]?.state.length).toBeGreaterThan(0);
      expect(releases[p.slug]?.source.length).toBeGreaterThan(0);
    }
  });

  test("the work index lists each public project exactly once", () => {
    const listed = workGroups.flatMap((g) => g.rows.map((r) => r.slug)).sort();
    expect(listed).toEqual(allWorkspaceProjects.map((p) => p.slug).sort());
  });

  test("featured work has homepage copy", () => {
    for (const p of featuredWork) expect(homeEntries[p.slug]).toBeDefined();
  });

  test("the headline reads as one sentence without the struck word", () => {
    expect(plainHeadline).toBe("I build software where a correction adds to the record.");
    expect(plainHeadline).not.toContain(hero.replaced);
  });

  test("homepage TomatoVision figures match the locked research record", () => {
    const byId = Object.fromEntries(tomatoConfigurations.map((c) => [c.id, c.map50]));
    expect([byId["yolov11"], byId["swin-t-mssppf"], byId["combine-4"]]).toEqual([0.795, 0.807, 0.824]);
  });

  test("no unverified release or uncleared project is described", () => {
    const text = JSON.stringify({ homeEntries, releases, workGroups, constraints, workflows }).toLowerCase();
    expect(text).not.toContain("hemovigil");
    expect(text).not.toContain("elab");
  });
});
