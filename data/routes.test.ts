import { describe, expect, test } from "bun:test";
import { allWorkspaceProjects } from "./workspace";
import { dynamicParams, generateMetadata, generateStaticParams } from "../app/projects/[slug]/page";
import { getProject, projectMetadata, projectPath } from "../lib/projects";

const SIX = ["labstock", "bdrs", "suhulog", "tomato-ripeness", "padel-vision", "porsche-3d"];
const meta = (slug: string) => generateMetadata({ params: Promise.resolve({ slug }) });

/**
 * Under static export a slug generateStaticParams does not return is simply
 * never built — no error, a 404 in production. That is how /projects/bdrs/ and
 * /projects/labstock/ shipped broken while both were on the home page.
 */
describe("project routes", () => {
  test("every canonical project gets a static page", () => {
    const routed = generateStaticParams().map((p) => p.slug).sort();
    expect(routed).toEqual(allWorkspaceProjects.map((p) => p.slug).sort());
  });

  test("all six public projects are routed", () => {
    const routed = generateStaticParams().map((p) => p.slug);
    for (const slug of SIX) expect(routed).toContain(slug);
  });

  test("unknown slugs are not rendered", () => {
    // Static export cannot serve a slug that was not generated; the host 404s.
    expect(dynamicParams).toBe(false);
    expect(getProject("does-not-exist")).toBeUndefined();
  });
});

describe("project metadata", () => {
  test("titles and descriptions are unique per project", async () => {
    const all = await Promise.all(SIX.map(meta));
    expect(new Set(all.map((m) => m.title)).size).toBe(SIX.length);
    expect(new Set(all.map((m) => m.description)).size).toBe(SIX.length);
  });

  test("each page describes itself from canonical data, not restated copy", async () => {
    for (const project of allWorkspaceProjects) {
      const m = await meta(project.slug);
      expect(m.description).toBe(project.summary);
      expect(String(m.title)).toContain(project.title);
    }
  });

  test("each page is canonical to its own URL and indexable", async () => {
    for (const slug of SIX) {
      const m = await meta(slug);
      expect(m.alternates?.canonical).toBe(`/projects/${slug}/`);
      expect(m.robots).toEqual({ index: true, follow: true });
      // The old redirect wrapper pointed canonicals at /?project=…
      expect(String(m.alternates?.canonical)).not.toContain("?project=");
    }
  });

  test("Open Graph and Twitter carry the project's own title, URL and image", async () => {
    for (const project of allWorkspaceProjects) {
      const m = await meta(project.slug);
      const og = m.openGraph as { url?: string; title?: string; images?: { url: string }[] };
      expect(og.url).toBe(projectPath(project.slug));
      expect(og.title).toBe(m.title as string);
      expect(og.images?.[0]?.url).toBe(project.thumb);
      expect((m.twitter as { card?: string }).card).toBe("summary_large_image");
    }
  });

  test("preview images are inside the project's own public folder", () => {
    // Keeps link previews on the same public-safe media the content tests vet.
    for (const project of allWorkspaceProjects) {
      const og = projectMetadata(project).openGraph as { images?: { url: string }[] };
      expect(og.images?.[0]?.url.startsWith(`/projects/${project.slug}/`)).toBe(true);
    }
  });

  test("an unknown slug gets no project metadata", async () => {
    expect(await meta("does-not-exist")).toEqual({});
  });
});
