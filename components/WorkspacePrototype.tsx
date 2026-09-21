"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowUpRightIcon, FileIcon, MailIcon } from "@/components/Icons";
import { site } from "@/data/site";
import {
  allWorkspaceProjects,
  featuredWork,
  labWork,
  type WorkspaceProject,
} from "@/data/workspace";

type WorkspaceMode = "browse" | "ask";

const prompts = [
  {
    label: "Operational systems",
    query: "What has Adjie built for operational teams?",
    answer:
      "Adjie's operational work connects real-world inputs to traceable records and familiar outputs. LabStock, SuhuLog, and BDRS show how he handles workflow, evidence, and reliability together.",
    projects: ["labstock", "suhulog", "bdrs"],
  },
  {
    label: "Applied AI",
    query: "Show me Adjie’s applied AI work.",
    answer:
      "TomatoVision is the clearest evaluated AI case. Padel Vision and ObjectTwin carry the same practical approach into video analytics and image-to-3D systems.",
    projects: ["tomato-ripeness", "padel-vision", "objecttwin"],
  },
  {
    label: "Reliability",
    query: "How does Adjie approach reliability?",
    answer:
      "The recurring pattern is explicit state, one source of truth, reversible corrections, and checks at the boundary a user actually sees.",
    projects: ["suhulog", "labstock"],
  },
];

function Arrow({ direction = "right" }: { direction?: "right" | "up" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={direction === "up" ? "-rotate-45" : ""}>
      <path d="M3.5 10h12.5M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75c.55 4.7 2.55 6.7 7.25 7.25-4.7.55-6.7 2.55-7.25 7.25C11.45 12.55 9.45 10.55 4.75 10 9.45 9.45 11.45 7.45 12 2.75Z" />
      <path d="M18.25 15.5c.2 1.75 1 2.55 2.75 2.75-1.75.2-2.55 1-2.75 2.75-.2-1.75-1-2.55-2.75-2.75 1.75-.2 2.55-1 2.75-2.75Z" />
    </svg>
  );
}

function ProjectVisual({ project, priority = false }: { project: WorkspaceProject; priority?: boolean }) {
  if (!project.image) {
    return (
      <div className="aw-visual aw-visual-placeholder">
        <span>{project.title.slice(0, 2).toUpperCase()}</span>
        <p>Public visual held until a sanitized asset is approved.</p>
      </div>
    );
  }
  return (
    <div className="aw-visual">
      <Image src={project.image} alt="" fill priority={priority}
        sizes="(max-width: 760px) 100vw, (max-width: 1200px) 60vw, 720px"
        className="object-cover object-top" />
      <div className="aw-visual-shade" />
    </div>
  );
}

function ProjectTile({ project, active, index, onPreview, onOpen }: {
  project: WorkspaceProject; active: boolean; index: number; onPreview: () => void; onOpen: () => void;
}) {
  return (
    <button type="button" className={`aw-project-tile ${active ? "is-active" : ""}`}
      onMouseEnter={onPreview} onFocus={onPreview} onClick={onOpen}
      aria-label={`Open ${project.title} case study`}
      style={{ "--tile-index": index } as React.CSSProperties}>
      <ProjectVisual project={project} priority={index === 0} />
      <span className="aw-project-copy">
        <span className="aw-project-meta">{String(index + 1).padStart(2, "0")} · {project.eyebrow}</span>
        <span className="aw-project-title">{project.title}</span>
        <span className="aw-project-summary">{project.summary}</span>
        <span className="aw-project-open">View case <Arrow /></span>
      </span>
    </button>
  );
}

function ProjectStrip({ project, onPreview, onOpen }: {
  project: WorkspaceProject; onPreview: () => void; onOpen: () => void;
}) {
  return (
    <button type="button" className="aw-result-strip" onMouseEnter={onPreview} onFocus={onPreview} onClick={onOpen}>
      <span><span className="aw-label">{project.eyebrow}</span><strong>{project.title}</strong></span>
      <span className="aw-result-summary">{project.summary}</span>
      <span className="aw-round-arrow"><Arrow /></span>
    </button>
  );
}

function ContextPanel({ project, onOpen }: { project: WorkspaceProject; onOpen: () => void }) {
  return (
    <aside className="aw-context" aria-label={`Context for ${project.title}`}>
      <div className="aw-context-top">
        <span className="aw-live-dot" /><span>Selected evidence</span>
        <span className="aw-context-count">{project.evidence.length.toString().padStart(2, "0")}</span>
      </div>
      <div className="aw-context-body" key={project.slug}>
        <div className="aw-context-visual">
          <ProjectVisual project={project} />
          <span className="aw-context-index">{project.year}</span>
        </div>
        <div className="aw-context-heading">
          <p>{project.eyebrow}</p><h2>{project.title}</h2><span>{project.role}</span>
        </div>
        <dl className="aw-evidence-list">
          {project.evidence.map((item) => (
            <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
          ))}
        </dl>
        <button type="button" className="aw-context-open" onClick={onOpen}>Open the full case study <Arrow /></button>
      </div>
      <div className="aw-progressive-edge" aria-hidden="true" />
    </aside>
  );
}

function AskComposer({ query, setQuery, onSubmit, compact = false }: {
  query: string; setQuery: (value: string) => void; onSubmit: () => void; compact?: boolean;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }
  return (
    <div className={`aw-composer ${compact ? "is-compact" : ""}`}>
      <div className="aw-composer-mark"><SparkIcon /></div>
      <label htmlFor={compact ? "aw-question-mobile" : "aw-question"} className="sr-only">Ask about Adjie’s work</label>
      <textarea id={compact ? "aw-question-mobile" : "aw-question"} rows={1} value={query}
        onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown}
        placeholder="Ask about the work…" />
      <button type="button" onClick={onSubmit} aria-label="Submit question" disabled={!query.trim()}><Arrow direction="up" /></button>
    </div>
  );
}

function CaseStudy({ project, onBack }: { project: WorkspaceProject; onBack: () => void }) {
  return (
    <article className="aw-case" aria-labelledby="aw-case-title">
      <button type="button" onClick={onBack} className="aw-case-back"><ArrowLeftIcon className="size-4" /> Back to workspace</button>
      <header className="aw-case-hero">
        <div><p className="aw-label">{project.eyebrow} · {project.year}</p><h1 id="aw-case-title">{project.title}</h1></div>
        <p>{project.summary}</p>
      </header>
      <div className="aw-case-image"><ProjectVisual project={project} priority /></div>
      <section className="aw-case-facts" aria-label="Project evidence">
        <div><p className="aw-label">Adjie’s role</p><p>{project.role}</p></div>
        <div><p className="aw-label">What it demonstrates</p><ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>
      <section className="aw-case-evidence">
        <div className="aw-section-title"><div><p className="aw-label">Evidence</p><h2>Proof over promises.</h2></div></div>
        <div className="aw-case-metrics">
          {project.evidence.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}
        </div>
      </section>
      {project.gallery && (
        <section className="aw-gallery" aria-label="Project gallery">
          {project.gallery.map((shot, index) => (
            <figure key={shot.src} className={index === 0 ? "is-wide" : ""}>
              <div><Image src={shot.src} alt={shot.caption} fill sizes="(max-width: 760px) 100vw, 760px" className="object-cover object-top" /></div>
              <figcaption><span>0{index + 1}</span>{shot.caption}</figcaption>
            </figure>
          ))}
        </section>
      )}
      {project.assetNote && <p className="aw-asset-note">{project.assetNote}</p>}
      <footer className="aw-case-footer">
        {project.href && <Link href={project.href}>Read the published case <ArrowUpRightIcon className="size-4" /></Link>}
        <a href={`mailto:${site.email}`}>Discuss this work</a>
      </footer>
    </article>
  );
}

export function WorkspacePrototype() {
  const [mode, setMode] = useState<WorkspaceMode>("browse");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [resultSlugs, setResultSlugs] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("suhulog");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const selectedProject = allWorkspaceProjects.find((item) => item.slug === selectedSlug) ?? featuredWork[0];
  const openProject = allWorkspaceProjects.find((item) => item.slug === openSlug);
  const results = useMemo(
    () => resultSlugs.map((slug) => allWorkspaceProjects.find((item) => item.slug === slug)).filter(Boolean) as WorkspaceProject[],
    [resultSlugs],
  );

  function switchMode(next: WorkspaceMode) { setMode(next); setOpenSlug(null); }
  function runAsk(value = query) {
    const clean = value.trim();
    if (!clean) return;
    const normalized = clean.toLowerCase();
    const match = normalized.includes("ai") || normalized.includes("vision") ? prompts[1]
      : normalized.includes("reliab") || normalized.includes("quality") || normalized.includes("safe") ? prompts[2] : prompts[0];
    setQuery(clean); setAnswer(match.answer); setResultSlugs(match.projects); setSelectedSlug(match.projects[0]); setMode("ask");
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); runAsk(); }
  function open(project: WorkspaceProject) {
    setSelectedSlug(project.slug); setOpenSlug(project.slug); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={`aw-shell mode-${mode} ${openProject ? "has-case" : ""}`}>
      <nav className="aw-rail" aria-label="Workspace navigation">
        <button className="aw-monogram" type="button" onClick={() => switchMode("browse")} aria-label="Adjie Workspace home">AR</button>
        <div className="aw-mode-switch">
          <button type="button" className={mode === "browse" ? "is-active" : ""} onClick={() => switchMode("browse")} aria-pressed={mode === "browse"}><span>01</span>Browse</button>
          <button type="button" className={mode === "ask" ? "is-active" : ""} onClick={() => switchMode("ask")} aria-pressed={mode === "ask"}><span>02</span>Ask</button>
        </div>
        <div className="aw-rail-links">
          <a href={`mailto:${site.email}`} aria-label="Contact Adjie"><MailIcon className="size-4" /><span>Contact</span></a>
          <a href={site.cv} target="_blank" rel="noopener noreferrer" aria-label="Open résumé"><FileIcon className="size-4" /><span>Résumé</span></a>
        </div>
      </nav>
      <main className="aw-stage">
        <div className="aw-stage-bar"><span>Adjie Workspace</span><span className="aw-stage-position">Operational software × applied AI</span><span>Makassar · ID</span></div>
        {openProject ? <CaseStudy project={openProject} onBack={() => setOpenSlug(null)} /> : mode === "browse" ? (
          <div className="aw-view aw-browse-view">
            <section className="aw-intro" aria-labelledby="aw-title">
              <p className="aw-label">Product engineer · AI systems</p>
              <h1 id="aw-title">Work built for the moment it meets reality.</h1>
              <div className="aw-intro-lower">
                <p>Adjie builds operational software and applied AI systems. Browse the work, inspect the evidence, or ask a focused question.</p>
                <button type="button" onClick={() => switchMode("ask")}><SparkIcon /> Ask the workspace <Arrow /></button>
              </div>
            </section>
            <section className="aw-featured" aria-labelledby="aw-featured-title">
              <div className="aw-section-title">
                <div><p className="aw-label">01 · Featured work</p><h2 id="aw-featured-title">Systems with a job to do.</h2></div>
                <p>Selected for operational depth, evidence, and real-world constraints.</p>
              </div>
              <div className="aw-project-grid">
                {featuredWork.map((project, index) => (
                  <ProjectTile key={project.slug} project={project} index={index} active={selectedSlug === project.slug}
                    onPreview={() => setSelectedSlug(project.slug)} onOpen={() => open(project)} />
                ))}
              </div>
            </section>
            <section className="aw-labs" aria-labelledby="aw-labs-title">
              <div className="aw-section-title"><div><p className="aw-label">02 · Labs</p><h2 id="aw-labs-title">Focused experiments.</h2></div></div>
              <div className="aw-lab-list">
                {labWork.map((project, index) => (
                  <button type="button" key={project.slug} onMouseEnter={() => setSelectedSlug(project.slug)}
                    onFocus={() => setSelectedSlug(project.slug)} onClick={() => open(project)}>
                    <span>0{index + 1}</span><strong>{project.title}</strong><em>{project.eyebrow}</em><Arrow />
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="aw-view aw-ask-view">
            <section className="aw-ask-head" aria-labelledby="aw-ask-title">
              <p className="aw-label">Ask · approved public work</p>
              <h1 id="aw-ask-title">Start with what you want to understand.</h1>
              <form onSubmit={submit}><AskComposer query={query} setQuery={setQuery} onSubmit={() => runAsk()} /></form>
              <div className="aw-prompt-list" aria-label="Suggested questions">
                {prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => runAsk(prompt.query)}>{prompt.label}<Arrow /></button>)}
              </div>
            </section>
            <section className={`aw-response ${answer ? "has-answer" : ""}`} aria-live="polite">
              {answer ? (
                <><div className="aw-response-mark"><SparkIcon /></div><div className="aw-response-copy">
                  <p className="aw-label">Workspace response</p><h2>{answer}</h2>
                  <div className="aw-results">
                    {results.map((project) => <ProjectStrip key={project.slug} project={project}
                      onPreview={() => setSelectedSlug(project.slug)} onOpen={() => open(project)} />)}
                  </div>
                </div></>
              ) : (
                <div className="aw-ask-empty"><span>01</span><p>Ask a focused question.</p><span>02</span><p>See relevant work selected from approved content.</p><span>03</span><p>Open a case and inspect the evidence.</p></div>
              )}
            </section>
          </div>
        )}
      </main>
      {!openProject && <ContextPanel project={selectedProject} onOpen={() => open(selectedProject)} />}
      {!openProject && (
        <div className="aw-mobile-dock">
          <div><span>Ask Adjie Workspace</span><small>Local approved content</small></div>
          <button type="button" onClick={() => switchMode(mode === "ask" ? "browse" : "ask")}><SparkIcon /></button>
          {mode === "ask" && <AskComposer compact query={query} setQuery={setQuery} onSubmit={() => runAsk()} />}
        </div>
      )}
    </div>
  );
}
