import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import {
  MailIcon,
  GitHubIcon,
  LinkedInIcon,
  FileIcon,
} from "@/components/Icons";

function ContactLink({
  href,
  label,
  icon,
  external = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent hover:shadow-sm"
    >
      {icon}
      {label}
    </a>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      {/* Intro */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Portfolio
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="mt-3 text-base font-medium text-muted sm:text-lg">
          {site.role}
        </p>

        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/80">
          {site.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ContactLink
            href={`mailto:${site.email}`}
            label="Email"
            icon={<MailIcon className="h-4 w-4" />}
          />
          <ContactLink
            href={site.github}
            label="GitHub"
            icon={<GitHubIcon className="h-4 w-4" />}
            external
          />
          <ContactLink
            href={site.linkedin}
            label="LinkedIn"
            icon={<LinkedInIcon className="h-4 w-4" />}
            external
          />
          <ContactLink
            href={site.cv}
            label="CV"
            icon={<FileIcon className="h-4 w-4" />}
            external
          />
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="scroll-mt-20 pb-20 sm:pb-28">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Selected Projects
        </h2>
        <p className="mt-2 text-sm text-muted">
          Research and web projects in computer vision, machine learning, and
          interactive 3D.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
