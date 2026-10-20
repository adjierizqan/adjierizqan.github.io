import { describe, expect, test } from "bun:test";
import { allWorkspaceProjects } from "./workspace";
import { cases, experimentRows, intro, releases, workRows } from "./personal-site";
import { tomatoConfigurations } from "./tomatovision";

describe("personal site content", () => {
  test("every public project has a release state with a named source", () => {
    for (const p of allWorkspaceProjects) {
      expect(releases[p.slug]?.state.length).toBeGreaterThan(0);
      expect(releases[p.slug]?.source.length).toBeGreaterThan(0);
    }
  });

  test("the home page lists each public project exactly once", () => {
    const listed = [...workRows, ...experimentRows].map((r) => r.slug).sort();
    expect(listed).toEqual(allWorkspaceProjects.map((p) => p.slug).sort());
  });

  test("every project except the thesis has case copy and a hero", () => {
    for (const p of allWorkspaceProjects.filter((p) => p.slug !== "tomato-ripeness")) {
      expect(cases[p.slug]?.hero.src).toMatch(/^\/projects\//);
    }
  });

  test("TomatoVision figures match the locked research record", () => {
    const byId = Object.fromEntries(tomatoConfigurations.map((c) => [c.id, c.map50]));
    expect([byId["yolov11"], byId["swin-t-mssppf"], byId["combine-4"]]).toEqual([0.795, 0.807, 0.824]);
  });

  test("copy has no em dashes and no unverified or uncleared work", () => {
    const text = JSON.stringify({ intro, releases, workRows, experimentRows, cases });
    expect(text).not.toContain("\u2014");
    expect(text.toLowerCase()).not.toContain("hemovigil");
    expect(text.toLowerCase()).not.toContain("elab");
  });
});
