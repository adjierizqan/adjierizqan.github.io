import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allWorkspaceProjects } from "@/data/workspace";
import { getProject, projectMetadata } from "@/lib/projects";
import { CaseStudy } from "@/components/site/CaseStudy";

type Props = { params: Promise<{ slug: string }> };

// Static export cannot render a slug generateStaticParams did not return,
// so unknown slugs are a 404 from the host.
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
  return <CaseStudy project={project} all={allWorkspaceProjects} />;
}
