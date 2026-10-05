import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { WorkspaceProject } from "@/data/workspace";
import { allWorkspaceProjects } from "@/data/workspace";
import { projectPath } from "@/lib/projects";
import "./case-study.css";

/**
 * A project case study, rendered entirely from canonical project data.
 *
 * A server component on purpose: everything here is in the generated HTML, so
 * a crawler, a link preview and a visitor on a slow connection all get the
 * full case study immediately. The workspace view gates the same content on an
 * animated `responseProgress` value, which is why none of it was reachable
 * without JavaScript and a running timer.
 *
 * `children` is the extension point for project-specific sections — the
 * TomatoVision evaluation, Padel analytics, SuhuLog's phone-to-desktop story.
 * They plug in here rather than becoming a second case-study implementation.
 * They render after "How it works" and before the evidence summary.
 */
export function CaseStudy({ project, children }: { project: WorkspaceProject; children?: ReactNode }) {
  const kicker = [project.eyebrow, project.year, project.status].filter(Boolean).join(" · ");
  const others = allWorkspaceProjects.filter((p) => p.slug !== project.slug);

  return (
    <article className="cs" aria-labelledby="cs-title">
      {/* The site header carries the name now; a breadcrumb repeating it, with
          a "Projects" step that went nowhere, is replaced by one real link. */}
      <nav className="cs-crumbs" aria-label="Breadcrumb">
        <Link href="/#work"><span aria-hidden="true">←</span> All projects</Link>
      </nav>

      <header className="cs-head">
        <p className="cs-kicker">{kicker}</p>
        <h1 id="cs-title" className="cs-title">{project.title}</h1>
        <p className="cs-lede">{project.summary}</p>
        <dl className="cs-facts">
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          {/* BDRS publishes no stack, and an empty labelled row reads as
              missing data rather than as a deliberate omission. */}
          {project.stack.length > 0 && (
            <div>
              <dt>Stack</dt>
              <dd>{project.stack.join(", ")}</dd>
            </div>
          )}
        </dl>
      </header>

      {project.image && (
        <figure className="cs-hero">
          <div className="cs-frame">
            <Image src={project.image} alt={`${project.title}`} fill priority sizes="(max-width: 860px) 100vw, 860px" />
          </div>
        </figure>
      )}

      <section className="cs-section" aria-labelledby="cs-problem">
        <h2 id="cs-problem">Problem</h2>
        <p>{project.problem}</p>
      </section>

      <section className="cs-section" aria-labelledby="cs-solution">
        <h2 id="cs-solution">What was built</h2>
        <p>{project.solution}</p>
      </section>

      <section className="cs-section" aria-labelledby="cs-how">
        <h2 id="cs-how">How it works</h2>
        <ol className="cs-steps">
          {project.howItWorks.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {children}

      <section className="cs-section" aria-labelledby="cs-evidence">
        <h2 id="cs-evidence">Evidence</h2>
        <dl className="cs-evidence">
          {project.evidence.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {project.gallery && project.gallery.length > 0 && (
        <section className="cs-section" aria-labelledby="cs-gallery">
          <h2 id="cs-gallery">Screens</h2>
          <div className="cs-gallery">
            {project.gallery.map((item) => (
              <figure key={item.src}>
                <div className="cs-frame">
                  <Image src={item.src} alt={item.caption} fill sizes="(max-width: 860px) 100vw, 420px" />
                </div>
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {project.video && (
        <section className="cs-section" aria-labelledby="cs-video">
          <h2 id="cs-video">Recording</h2>
          <div className="cs-frame">
            {/* preload="none": the case study must not pay for a video the
                visitor may never play. */}
            <video src={project.video} poster={project.image} controls playsInline preload="none"
                   aria-label={`${project.title} recording`} />
          </div>
        </section>
      )}

      <section className="cs-section" aria-labelledby="cs-why">
        <h2 id="cs-why">Why it matters</h2>
        <p>{project.whyItMatters}</p>
      </section>

      {/* Kept last and quiet: the boundary is a fact about the evidence, not
          the story of the project. */}
      <aside className="cs-boundary" aria-labelledby="cs-boundary">
        <h2 id="cs-boundary">Public boundary</h2>
        <p>{project.publicLimitations}</p>
        {project.assetNote && <p>{project.assetNote}</p>}
      </aside>

      <nav className="cs-more" aria-labelledby="cs-more">
        <h2 id="cs-more">Other projects</h2>
        <ul>
          {others.map((p) => (
            <li key={p.slug}>
              <Link href={projectPath(p.slug)}>
                <span className="cs-more-title">{p.title}</span>
                <span className="cs-more-kicker">{p.eyebrow}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
