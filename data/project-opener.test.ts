import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { allWorkspaceProjects } from "./workspace";
import LabsStudy from "../components/studies/LabsStudy";
import { ProjectOpener } from "../components/workspace/ProjectOpener";

describe("Transparent project introductions", () => {
  test("each public project has a distinct engineering question and complete static answer", () => {
    expect(allWorkspaceProjects).toHaveLength(6);
    expect(new Set(allWorkspaceProjects.map(p => p.opener.prompt)).size).toBe(6);
    for (const project of allWorkspaceProjects) {
      const html = renderToStaticMarkup(createElement(ProjectOpener, { project }, createElement("article", null, createElement("h1", null, project.title))));
      expect(project.opener.prompt.endsWith("?")).toBe(true);
      expect(html).toContain(project.opener.prompt);
      expect(html).toContain(project.opener.response);
      expect(html).toContain("Scripted introduction");
      expect(html).not.toContain("Example conversation");
      expect(html).toMatch(/class="project-intro-answer"[^>]*>[\s\S]*<article><h1>/);
      expect(html.match(/<article>/g)).toHaveLength(1);
      expect(html).not.toMatch(/Thinking|aria-busy|>You</);
    }
  });
});

describe("Inline Porsche evidence", () => {
  test("the original recording is present with controls and without an expansion gate", () => {
    const project = allWorkspaceProjects.find(p => p.slug === "porsche-3d")!;
    const html = renderToStaticMarkup(createElement(LabsStudy, { project, openImage: () => {} }));
    expect(html).toContain('class="study-recording"');
    expect(html).toContain('aria-label="Porsche 3D original configurator recording"');
    expect(html).toContain('controls=""');
    expect(html).toContain(project.video!);
    expect(html).not.toContain("<details");
    expect(html).not.toContain("autoPlay");
  });
});
