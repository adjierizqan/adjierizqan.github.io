import type { WorkspaceProject } from "@/data/workspace";
/** Public UI is English; canonical values need no mutable translation pass. */
export const localizeProject = (project: WorkspaceProject) => project;
