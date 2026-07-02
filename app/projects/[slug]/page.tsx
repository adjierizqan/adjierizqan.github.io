import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { projects, getProject } from "@/data/projects";
import { TechBadge } from "@/components/TechBadge";
import { ArrowLeftIcon, ArrowUpRightIcon, GitHubIcon } from "@/components/Icons";
import { VideoPreview } from "@/components/VideoPreview";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const hasDemo = project.links.demo && project.links.demo !== "#";
  const hasGitHub = project.links.github && project.links.github !== "#";
  const hasPaper = project.links.paper && project.links.paper !== "#";

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to home
      </Link>

      <div className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
        <span>{project.category}</span>
        <span aria-hidden="true">·</span>
        <span>{project.year}</span>
      </div>

      <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {project.title}
      </h1>

      <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-line">
        {project.video ? (
          <VideoPreview
            src={project.video}
            poster={project.image}
            controls
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        )}
      </div>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-foreground/80">
        <p>{project.longDescription}</p>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Key Features
          </h2>
          <ul className="mt-4 space-y-2.5">
            {project.features.map((feature) => (
              <li key={feature} className="flex gap-2.5 text-sm leading-relaxed">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Tech Stack
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <TechBadge key={t} label={t} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        {hasDemo && (
          <a
            href={project.links.demo}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-md"
          >
            View Demo
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        )}
        {hasGitHub && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-sm"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        )}
        {hasPaper && (
          <a
            href={project.links.paper}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-sm"
          >
            Read Paper
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
