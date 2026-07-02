import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { TechBadge } from "@/components/TechBadge";
import { ArrowUpRightIcon } from "@/components/Icons";
import { VideoPreview } from "@/components/VideoPreview";

function CardLink({ href, label }: { href: string; label: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-accent transition-opacity hover:opacity-70"
    >
      {label}
      <ArrowUpRightIcon className="h-3 w-3" />
    </a>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative flex flex-col gap-5 rounded-xl border border-line bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:flex-row sm:p-5">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg border border-line/60 sm:w-52">
        {project.video ? (
          <VideoPreview
            src={project.video}
            poster={project.image}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, 208px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-2.5">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
          <span>{project.category}</span>
          <span aria-hidden="true">·</span>
          <span>{project.year}</span>
        </div>

        <h3 className="text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
          {/* Stretched link: makes the whole card clickable */}
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-muted">{project.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <TechBadge key={t} label={t} />
          ))}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-4">
          {project.links.demo && <CardLink href={project.links.demo} label="Demo" />}
          {project.links.github && project.links.github !== "#" && (
            <CardLink href={project.links.github} label="GitHub" />
          )}
          {project.links.paper && project.links.paper !== "#" && (
            <CardLink href={project.links.paper} label="Paper" />
          )}
        </div>
      </div>
    </article>
  );
}
