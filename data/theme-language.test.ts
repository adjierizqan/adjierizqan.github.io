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
  const files = ["components/WorkspacePrototype.tsx", "components/studies/SuhuLogStudy.tsx", "components/studies/BdrsStudy.tsx", "components/studies/TomatoStudy.tsx", "components/studies/LabsStudy.tsx", "components/workspace/WorkspaceHome.tsx", "data/workspace.ts", "data/tomatovision.ts"];
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

describe("public language boundary", () => {
  test("English-only UI has no mutable translation state or partial language toggle", () => {
    const ui = readFileSync("components/WorkspacePrototype.tsx", "utf8");
    expect(ui).not.toContain("LanguageSwitch");
    expect(readFileSync("lib/i18n.ts", "utf8")).not.toContain("let active");
    expect(readFileSync("app/layout.tsx", "utf8")).toContain('lang="en"');
  });
});
