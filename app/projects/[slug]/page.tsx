import type { Metadata } from "next";
import { RedirectTo } from "@/components/RedirectTo";
import { projects } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

// Old standalone project URLs. Each forwards to its dossier in the portfolio.
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { robots: { index: false }, alternates: { canonical: `/?project=${slug}` } };
}

export default async function LegacyProjectRedirect({ params }: Props) {
  const { slug } = await params;
  return <RedirectTo href={`/?project=${slug}`} />;
}
