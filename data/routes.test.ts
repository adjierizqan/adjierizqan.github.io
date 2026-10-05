import { describe, expect, test } from "bun:test";
import { allWorkspaceProjects } from "./workspace";
import { generateStaticParams } from "../app/projects/[slug]/page";

/**
 * Under static export, a project slug that generateStaticParams does not
 * return is simply never built — no error, just a 404 in production. That is
 * exactly how /projects/bdrs/ and /projects/labstock/ shipped broken while both
 * projects appeared on the home page. This test ties the two together.
 */
describe("project routes", () => {
  test("every canonical project gets a static page", () => {
    const routed = generateStaticParams().map((p) => p.slug).sort();
    const canonical = allWorkspaceProjects.map((p) => p.slug).sort();
    expect(routed).toEqual(canonical);
  });

  test("the four primary projects are among them", () => {
    const routed = generateStaticParams().map((p) => p.slug);
    for (const slug of ["labstock", "bdrs", "suhulog", "tomato-ripeness"]) {
      expect(routed).toContain(slug);
    }
  });
});
