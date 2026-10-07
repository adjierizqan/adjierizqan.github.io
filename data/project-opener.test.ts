import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { allWorkspaceProjects } from "./workspace";
import { ProjectOpener } from "../components/workspace/ProjectOpener";

describe("Transparent project introductions", () => {
  test("each public project has a distinct engineering question and complete static answer", () => {
    expect(allWorkspaceProjects).toHaveLength(6);
    expect(new Set(allWorkspaceProjects.map(p => p.opener.prompt)).size).toBe(6);
    for (const project of allWorkspaceProjects) {
      const html = renderToStaticMarkup(createElement(ProjectOpener, { project }));
      expect(project.opener.prompt.endsWith("?")).toBe(true);
      expect(html).toContain(project.opener.prompt);
      expect(html).toContain(project.opener.response);
      expect(html).toContain("Scripted introduction");
      expect(html).not.toMatch(/Thinking|aria-busy|>You</);
    }
  });
});
