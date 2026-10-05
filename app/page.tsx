import { AskPanel, type AskSuggestion } from "@/components/home/AskPanel";
import { LegacyProjectLink } from "@/components/home/LegacyProjectLink";
import { ProjectCard } from "@/components/home/ProjectCard";
import { GitHubIcon, LinkedInIcon, MailIcon, FileIcon } from "@/components/Icons";
import { coreCapabilities, education, identity } from "@/data/profile";
import { site } from "@/data/site";
import { featuredWork, labWork } from "@/data/workspace";
import "@/components/home/home.css";

/**
 * Home: who Adjie is, a way to ask, and the work — in that order, all visible
 * without the assistant. Server-rendered, so every project, link and fact here
 * is in the HTML; only the Ask panel and the legacy-link handler hydrate.
 *
 * Every fact is read from data/profile.ts and data/workspace.ts. Replaces the
 * macOS-style workspace (window chrome, dock, wallpaper, ambient music, a
 * scripted demo conversation and a hard-coded "Good evening").
 */
export default function Home() {
  // Each primary project's own suggested question, scoped to that project.
  const suggestions: AskSuggestion[] = featuredWork.map((p) => ({
    question: p.askSuggestion,
    projectId: p.slug,
    projectTitle: p.title,
  }));

  return (
    <div className="home">
      <LegacyProjectLink />

      <section className="hero" aria-labelledby="hero-name">
        <h1 id="hero-name" className="hero-name">{identity.name}</h1>
        <p className="hero-lede">{identity.headline}</p>
        <p className="hero-sub">Explore the work below, or ask the portfolio directly.</p>
        <ul className="hero-links" aria-label="Profiles and contact">
          <li><a href={site.cv}><FileIcon className="hero-link-icon" />Résumé</a></li>
          <li><a href={site.github} rel="me"><GitHubIcon className="hero-link-icon" />GitHub</a></li>
          <li><a href={site.linkedin} rel="me"><LinkedInIcon className="hero-link-icon" />LinkedIn</a></li>
          <li><a href={`mailto:${site.email}`}><MailIcon className="hero-link-icon" />Email</a></li>
        </ul>
      </section>

      <AskPanel suggestions={suggestions} />

      <section className="home-section" id="work" aria-labelledby="work-heading">
        <h2 id="work-heading" className="home-heading">Selected work</h2>
        <div className="work-grid">
          {featuredWork.map((project) => <ProjectCard key={project.slug} project={project} />)}
        </div>
      </section>

      <section className="home-section" aria-labelledby="labs-heading">
        <h2 id="labs-heading" className="home-heading">Labs</h2>
        <p className="home-intro">Smaller experiments in computer vision and interactive 3D.</p>
        <div className="labs-grid">
          {labWork.map((project) => <ProjectCard key={project.slug} project={project} size="lab" />)}
        </div>
      </section>

      <section className="home-section about" id="about" aria-labelledby="about-heading">
        <h2 id="about-heading" className="home-heading">About</h2>
        <div className="about-grid">
          <div>
            <h3 className="about-sub">Focus</h3>
            <ul className="about-list">
              {identity.focusAreas.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="about-sub">Capabilities</h3>
            <ul className="about-list">
              {coreCapabilities.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="about-sub">Education</h3>
            <ul className="about-edu">
              {education.map((e) => (
                <li key={e.institution}>
                  <span className="about-edu-school">{e.institution}</span>
                  <span>{e.degree} · {e.field}</span>
                  {e.detail && <span className="about-edu-meta">{e.detail}</span>}
                  {e.status && <span className="about-edu-meta">{e.status}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
