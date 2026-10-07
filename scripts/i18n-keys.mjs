// Lists every English string that must have an Indonesian entry in lib/i18n-id.ts:
// literal t("…") calls in the UI, plus the project copy fields that lib/localize-project.ts translates.
import { readFileSync } from "node:fs";

const SOURCES = ["components/labstock/LabStockCaseStudy.tsx", "components/workspace/UISound.tsx", "components/WorkspacePrototype.tsx", "components/tomatovision/TomatoVisionStory.tsx", "components/padel/PadelAnalytics.tsx",
  "components/project-story/ProjectStory.tsx", "components/evidence/ProductEvidence.tsx"];
// Kept in English in both languages: brand, established technical terms and proper nouns.
export const SAME = new Set(["Adjie Workspace", "Adjie Rizqan", "Computer Vision", "Applied AI", "Software Engineering", "Quick Look", "Projects", "Labs",
  "LabStock", "BDRS", "SuhuLog", "TomatoVision", "Padel Vision", "Porsche 3D", "YOLOv11", "Combine 4", "Weighted Boxes Fusion", "Model", "Minimap", "Heatmaps",
  "Home", "Work", "Knowledge", "Ask", "Workspace", "Adjie AI · Preview", "Build · Solve · Improve", "Personal AI Workspace", "Dashboard", "Line-up", "Detail", "Profile", "Camera", "Material"]);

export function uiKeys() {
  const keys = new Set();
  for (const file of SOURCES) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/\bt[kx]?\("((?:[^"\\]|\\.)*)"\)/g)) keys.add(JSON.parse(`"${m[1]}"`));
  }
  return [...keys];
}

export function projectKeys(projects, extra = []) {
  const keys = new Set(extra);
  for (const p of projects) {
    if (p.presentation) {
      keys.add(p.presentation.stockCaption);
      keys.add(p.presentation.headline); keys.add(p.presentation.category); keys.add(p.presentation.hero.caption);
      p.presentation.walkthrough.forEach(s => { keys.add(s.title); keys.add(s.detail); });
      for (const step of p.presentation.flow) { keys.add(step.title); step.items.forEach(v => keys.add(v)); }
      for (const decision of p.presentation.decisions) { keys.add(decision.title); keys.add(decision.detail); }
    }
    for (const v of [p.eyebrow, p.status, p.summary, p.problem, p.solution, ...p.howItWorks, p.role, p.whyItMatters, p.publicLimitations, p.askSuggestion,
      ...p.evidence.flatMap((e) => [e.label, e.value]), ...(p.gallery ?? []).map((g) => g.caption)]) if (v) keys.add(v);
  }
  return [...keys];
}
