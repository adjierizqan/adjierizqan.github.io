import type { Metadata } from "next";
import { RedirectTo } from "@/components/RedirectTo";
import { allWorkspaceProjects } from "@/data/workspace";

type Props = { params: Promise<{ slug: string }> };

/**
 * Every project gets a static page, derived from the canonical project data.
 *
 * This used to enumerate the legacy data/projects.ts list, which held only four
 * of the six projects. Under static export a slug that generateStaticParams
 * does not return is never built, so /projects/bdrs/ and /projects/labstock/
 * were 404 in production while both appeared in the workspace.
 *
 * The page still forwards to the workspace view for now; replacing the
 * redirect with a real, indexable case study is the next phase.
 */
export function generateStaticParams() {
  return allWorkspaceProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { robots: { index: false }, alternates: { canonical: `/?project=${slug}` } };
}

export default async function ProjectRedirect({ params }: Props) {
  const { slug } = await params;
  return <RedirectTo href={`/?project=${slug}`} />;
}
