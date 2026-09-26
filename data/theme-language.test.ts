import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
// @ts-expect-error plain ESM build script without type declarations
import { build, OUTPUT } from "../scripts/build-dark-theme.mjs";

describe("theme", () => {
  test("the committed dark layer matches the current stylesheets", () => {
    expect(readFileSync(OUTPUT, "utf8")).toBe(build());
  });

  test("the theme is applied before paint and persisted under one key", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain('import "./theme-dark.css"');
    expect(layout).toContain("prefers-color-scheme: dark");
    expect(layout).toContain('k="aw-theme"');
  });
});

describe("language", () => {
  // Indonesian function words that would signal a mixed-language sentence. Product and domain
  // terms shown in screenshots (Amprah, Stok, Hari Ini, Pagi, Sore) are allowed as names.
  const INDONESIAN = /\b(yang|dan|untuk|dengan|ini|itu|apa|bagaimana|sudah|masih|secara|dapat|adalah|tidak|akan|atau|dari|pada|sekarang|jelaskan)\b/i;
  const files = ["components/WorkspacePrototype.tsx", "components/tomatovision/TomatoVisionStory.tsx", "components/padel/PadelAnalytics.tsx",
    "components/evidence/ProductEvidence.tsx", "components/project-story/ProjectStory.tsx", "data/workspace.ts", "data/tomatovision.ts"];
  test("English source strings contain no Indonesian", () => {
    const offenders: string[] = [];
    for (const file of files) {
      // The Indonesian side of L(en, id) / tx(en, id) is intentional; check only the English side.
      const source = readFileSync(file, "utf8").replace(/\b(L|tx)\((`[^`]*`|"[^"]*"),\s*(`[^`]*`|"[^"]*")\)/g, "$1($2)");
      for (const match of source.matchAll(/"([^"\n]{12,})"|`([^`\n]{12,})`|>([^<>{}\n]{12,})</g)) {
        const text = (match[1] ?? match[2] ?? match[3]).replace(/hari[ -]ini/gi, "");
        if (INDONESIAN.test(text)) offenders.push(`${file}: ${text.slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("Indonesian translation", () => {
  test("every UI string and project text field has an Indonesian entry", async () => {
    // @ts-expect-error plain ESM script without type declarations
    const { uiKeys, projectKeys, SAME } = await import("../scripts/i18n-keys.mjs");
    const { ID } = await import("../lib/i18n-id");
    const { allWorkspaceProjects } = await import("./workspace");
    const tv = await import("./tomatovision");
    const extra = [tv.tomatoStatus, tv.tomatoDataset.split, tv.tomatoDemo.photos, ...tv.tomatoMatchedScene.flatMap((s) => [s.tab, s.label, s.alt]),
      ...tv.tomatoConfigurations.map((c) => c.members).filter(Boolean), "green", "orange", "red"];
    const keys: string[] = [...new Set([...uiKeys(), ...projectKeys(allWorkspaceProjects, extra)])] as string[];
    const missing = keys.filter((key) => !(key in ID) && !SAME.has(key));
    expect(missing).toEqual([]);
  });
});
