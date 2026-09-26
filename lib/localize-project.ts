import type { WorkspaceProject } from "@/data/workspace";
import { activeLocale, t } from "@/lib/i18n";

/** The project's copy in the active language. Slugs, media, dates and figures stay as they are. */
export function localizeProject(project: WorkspaceProject): WorkspaceProject {
  if (activeLocale() === "en") return project;
  return {
    ...project,
    eyebrow: t(project.eyebrow),
    status: project.status && t(project.status),
    summary: t(project.summary),
    problem: t(project.problem),
    solution: t(project.solution),
    howItWorks: project.howItWorks.map(t),
    role: t(project.role),
    evidence: project.evidence.map((item) => ({ label: t(item.label), value: t(item.value) })),
    whyItMatters: t(project.whyItMatters),
    publicLimitations: t(project.publicLimitations),
    askSuggestion: t(project.askSuggestion),
    gallery: project.gallery?.map((item) => ({ ...item, caption: t(item.caption) })),
  };
}
