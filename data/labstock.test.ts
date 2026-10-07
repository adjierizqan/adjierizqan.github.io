import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { LabStockCaseStudy } from "../components/labstock/LabStockCaseStudy";
import { featuredWork } from "./workspace";

const project = featuredWork.find(p => p.slug === "labstock")!;

describe("LabStock public presentation", () => {
  test("initial HTML contains the full case, product media and boundary without timers", () => {
    const html = renderToStaticMarkup(createElement(LabStockCaseStudy, { project, openImage: () => {} }));
    for (const id of ["ls-title", "ls-problem", "ls-system", "ls-decisions", "ls-product", "ls-evidence", "ls-demonstrates", "ls-boundary"]) {
      expect(html).toContain(`id="${id}"`);
    }
    for (const frame of project.gallery ?? []) expect(decodeURIComponent(html)).toContain(frame.src);
    expect(html).toContain(project.publicLimitations);
    expect(html).not.toMatch(/Replay Demo|responseProgress|aria-busy="true"|You · prompt/);
  });

  test("the static flow preserves source identity, ledger types, outputs and safety branches", () => {
    expect(project.presentation?.flow.map(s => s.title)).toEqual(["Source", "Validate", "Ledger", "Output"]);
    expect(project.presentation?.flow[2].items).toEqual(["OPENING", "IN", "OUT", "ADJUSTMENT", "REVERSAL"]);
    expect(project.presentation?.decisions.map(d => d.title)).toEqual(["Source identity", "Repeat import", "Correction"]);
  });
});
