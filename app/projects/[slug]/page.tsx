import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/case-study/CaseStudy";
import { allWorkspaceProjects } from "@/data/workspace";
import { getProject, projectMetadata } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

/**
 * A real, statically generated case study per project.
 *
 * This replaces a client-side redirect to `/?project=<slug>`, which made every
 * project URL a noindex hop into the workspace and left /projects/bdrs/ and
 * /projects/labstock/ without a page at all. The page reads the canonical
 * project data directly — it does not mount the workspace with a hidden
 * selection.
 *
 * dynamicParams is false because static export cannot render a slug that
 * generateStaticParams did not return; an unknown slug is a 404 from the host.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return allWorkspaceProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? projectMetadata(project) : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
