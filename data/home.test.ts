import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { WorkspaceHome } from "../components/workspace/WorkspaceHome";
import { identity } from "./profile";
import { featuredWork } from "./workspace";

describe("Workspace Home", () => {
  test("original HTML keeps real Ask and project evidence without the removed introduction", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceHome, { selectProject: () => {}, openAsk: () => {}, askQuestion: () => {}, composer: createElement("textarea", { "aria-label": "Ask anything about Adjie’s work" }) }));
    expect(html).not.toContain('aria-label="Scripted introduction"');
    expect(html).not.toContain('A quick introduction');
    expect(html).not.toContain(identity.introduction.lead);
    expect(html).not.toContain("Example conversation");
    expect(html).toContain("What would you like to know?");
    expect(html).toContain("<textarea");
    expect(html).toContain("Start with the work");
    expect(html).not.toContain(identity.introduction.answer);
    expect(html).toContain("Software / full-stack engineer");
    expect(html).toContain('aria-label="Open a project"');
    expect(html).toContain('href="#home-work"');
    for (const project of featuredWork) expect(html).toContain(`href="/projects/${project.slug}/"`);
    expect(html).not.toMatch(/aria-busy="true"|Thinking…|Adjie AI · Preview/);
  });
});
