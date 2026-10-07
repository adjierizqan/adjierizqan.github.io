import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { WorkspaceHome } from "../components/workspace/WorkspaceHome";
import { identity } from "./profile";
import { featuredWork } from "./workspace";

describe("Honest Workspace introduction", () => {
  test("original HTML identifies the example and contains its complete answer and evidence", () => {
    const html = renderToStaticMarkup(createElement(WorkspaceHome, { selectProject: () => {}, openAsk: () => {} }));
    expect(html).toContain('aria-label="Example conversation"');
    expect(html).toContain(identity.introduction.lead);
    expect(html).toContain(identity.introduction.answer);
    expect(html).toContain("Software / full-stack engineer");
    expect(html).toContain("Ask your own question");
    expect(html).toContain('href="#home-work"');
    for (const project of featuredWork) expect(html).toContain(`href="/projects/${project.slug}/"`);
    expect(html).not.toMatch(/aria-busy="true"|Thinking…|Adjie AI · Preview/);
  });
});
