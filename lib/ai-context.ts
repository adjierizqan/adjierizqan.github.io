import { allWorkspaceProjects, type WorkspaceProject } from "@/data/workspace";
import { coreCapabilities, education, identity, type EducationRecord } from "@/data/profile";

/**
 * The one mapping from canonical portfolio data to what the Ask worker reads.
 *
 * data/portfolio-ai-context.json is a build artifact of this function, not a
 * second place to edit facts. It exists as a file only because the Cloudflare
 * worker bundles it at deploy time (cloudflare/ask-worker/src/core.ts). The
 * mapping previously lived inside a test, which meant the JSON was edited by
 * hand and the test merely noticed when it drifted.
 *
 * Regenerate with `npm run ai-context`. content-integrity.test.ts fails if the
 * committed file differs from this function's output.
 */
export function aiProjectRecord(project: WorkspaceProject) {
  return {
    id: project.slug,
    name: project.title,
    workspaceTarget: project.slug,
    category: project.eyebrow,
    ...(project.status ? { publicStatus: project.status } : {}),
    summary: project.summary,
    problem: project.problem,
    solution: project.solution,
    howItWorks: project.howItWorks,
    role: project.role,
    stack: project.stack,
    verifiedEvidence: project.evidence,
    whyItMatters: project.whyItMatters,
    publicLimitations: project.publicLimitations,
    askSuggestion: project.askSuggestion,
  };
}

/**
 * One sentence per education record for the assistant. The completion guard is
 * derived, not hand-written: absent a recorded status, the assistant is told
 * the date is not stated.
 */
export function aiEducationRecord(record: EducationRecord) {
  const parts = [`${record.field}, ${record.degree}`];
  if (record.detail) parts.push(record.detail.charAt(0).toLowerCase() + record.detail.slice(1));
  const tail = record.status ? `${record.status}.` : "Completion date is not stated in the public record.";
  return { institution: record.institution, program: `${parts.join("; ")}. ${tail}` };
}

export function buildAiContext() {
  return {
    identity,
    education: education.map(aiEducationRecord),
    coreCapabilities,
    projects: allWorkspaceProjects.map(aiProjectRecord),
  };
}
