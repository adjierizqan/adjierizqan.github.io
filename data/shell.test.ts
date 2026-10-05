import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { identity, education } from "./profile";
import { site } from "./site";
import { aiEducationRecord } from "../lib/ai-context";

/** Phase 3 shell: one source for contact facts, honest education, no OS chrome. */
describe("profile is the single source of contact facts", () => {
  test("site links are derived from the profile, not restated", () => {
    expect(site.email).toBe(identity.contact.email);
    expect(site.github).toBe(identity.contact.github);
    expect(site.linkedin).toBe(identity.contact.linkedin);
    expect(site.cv).toBe(identity.contact.resumeTarget);
    expect(readFileSync("data/site.ts", "utf8")).not.toMatch(/@gmail\.com|github\.com|linkedin\.com/);
  });
});

describe("education never implies a completion it does not record", () => {
  test("a record without a status tells the assistant the completion is not stated", () => {
    for (const record of education.filter((e) => !e.status)) {
      expect(aiEducationRecord(record).program).toContain("Completion date is not stated");
    }
  });

  test("a record with a status states it and claims nothing more", () => {
    for (const record of education.filter((e) => e.status)) {
      const { program } = aiEducationRecord(record);
      expect(program).toContain(record.status!);
      expect(program).not.toContain("Completion date is not stated");
    }
  });
});

/** Source without comments: these files explain what they replaced, by name. */
const code = (path: string) =>
  readFileSync(path, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("home page is not the macOS workspace", () => {
  const home = code("app/page.tsx");

  test("the home route no longer mounts the workspace", () => {
    expect(home).not.toContain("WorkspacePrototype");
  });

  test("removed copy and chrome stay removed", () => {
    for (const phrase of ["Good evening", "A more capable me", "Build · Solve · Improve", "Preview"]) {
      expect(home).not.toContain(phrase);
    }
  });

  test("project cards link to real case-study URLs", () => {
    const card = code("components/home/ProjectCard.tsx");
    expect(card).toContain("projectPath(project.slug)");
    expect(card).not.toContain("?project=");
  });

  test("the Ask evidence link is built from the canonical slug, never model output", () => {
    const ask = code("components/home/AskPanel.tsx");
    expect(ask).toContain("href={projectPath(turn.projectId)}");
  });
});
