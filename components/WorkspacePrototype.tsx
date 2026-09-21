"use client";

import Image from "next/image";
import Link from "next/link";
import { KeyboardEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowUpRightIcon, FileIcon, MailIcon } from "@/components/Icons";
import { site } from "@/data/site";
import {
  allWorkspaceProjects,
  featuredWork,
  labWork,
  type WorkspaceProject,
} from "@/data/workspace";

type WorkspaceView = "home" | "work" | "labs" | "ask";

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

function Glyph({ name }: { name: "home" | "work" | "labs" | "ask" | "arrow" | "spark" | "menu" | "close" }) {
  const paths = {
    home: <><path d="m3 10 7-6 7 6" /><path d="M5.5 9v7h9V9" /></>,
    work: <><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M7 4V2.8h6V4M3 8h14" /></>,
    labs: <><path d="M7 3h6M8 3v4l-4 7.2A1.2 1.2 0 0 0 5.1 16h9.8a1.2 1.2 0 0 0 1.1-1.8L12 7V3" /><path d="M6.4 11h7.2" /></>,
    ask: <><path d="M4 4.5h12v9H9l-3.5 3v-3H4z" /><path d="M7 8h6M7 10.5h4" /></>,
    arrow: <><path d="M3.5 10h12.5M11.5 5.5 16 10l-4.5 4.5" /></>,
    spark: <path d="M10 2.5c.45 4.4 2.1 6.05 6.5 6.5-4.4.45-6.05 2.1-6.5 6.5C9.55 11.1 7.9 9.45 3.5 9 7.9 8.55 9.55 6.9 10 2.5Z" />,
    menu: <><path d="M3 6h14M3 10h14M3 14h14" /></>,
    close: <><path d="m5 5 10 10M15 5 5 15" /></>,
  };
  return <svg viewBox="0 0 20 20" aria-hidden="true">{paths[name]}</svg>;
}

function Composer({ query, setQuery, submit, autoFocus = false }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  autoFocus?: boolean;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="ws-composer">
      <textarea
        autoFocus={autoFocus}
        rows={2}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about Adjie, his work, or how something was built…"
        aria-label="Ask about Adjie, his work, or how something was built"
      />
      <div className="ws-composer-foot">
        <span><Glyph name="spark" /> Answers use approved public project evidence</span>
        <button type="button" onClick={submit} disabled={!query.trim()} aria-label="Submit question">
          <Glyph name="arrow" />
        </button>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, mobileOpen, closeMobile }: {
  view: WorkspaceView;
  setView: (view: WorkspaceView) => void;
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const items: { id: WorkspaceView; label: string; icon: "home" | "work" | "labs" | "ask" }[] = [
    { id: "home", label: "Home", icon: "home" },
    { id: "work", label: "Featured work", icon: "work" },
    { id: "labs", label: "Labs", icon: "labs" },
    { id: "ask", label: "Ask", icon: "ask" },
  ];

  return (
    <>
      <aside className={`ws-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="ws-brand">
          <button type="button" onClick={() => { setView("home"); closeMobile(); }} aria-label="Adjie Workspace home">A</button>
          <span><strong>Adjie Workspace</strong><small>Work and evidence</small></span>
          <button className="ws-sidebar-close" type="button" onClick={closeMobile} aria-label="Close navigation"><Glyph name="close" /></button>
        </div>
        <nav aria-label="Workspace navigation">
          {items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={view === item.id ? "is-active" : ""}
              onClick={() => { setView(item.id); closeMobile(); }}
            >
              <Glyph name={item.icon} /><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="ws-sidebar-note">
          <span>Available for thoughtful product and engineering work.</span>
        </div>
        <div className="ws-sidebar-links">
          <a href={`mailto:${site.email}`}><MailIcon className="size-4" /> Contact</a>
          <a href={site.cv} target="_blank" rel="noopener noreferrer"><FileIcon className="size-4" /> Résumé</a>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="ws-nav-scrim" onClick={closeMobile} aria-label="Close navigation" />}
    </>
  );
}

function HomeView({ query, setQuery, submit, openProject }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  openProject: (project: WorkspaceProject) => void;
}) {
  return (
    <main className="ws-home ws-reveal">
      <section className="ws-home-inner">
        <header className="ws-identity">
          <span>Adjie Rizqan · Product engineer</span>
          <h1>Operational software and applied AI systems.</h1>
          <p>Explore the work, or ask how a system was built.</p>
        </header>
        <Composer query={query} setQuery={setQuery} submit={submit} />
        <div className="ws-project-prompts" aria-label="Featured projects">
          <span>Start with a project</span>
          {featuredWork.map((project, index) => (
            <button type="button" key={project.slug} onClick={() => openProject(project)}>
              <small>0{index + 1}</small>
              <span><strong>{project.title}</strong><em>{project.eyebrow}</em></span>
              <Glyph name="arrow" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function LibraryView({ kind, openProject }: { kind: "work" | "labs"; openProject: (project: WorkspaceProject) => void }) {
  const projects = kind === "work" ? featuredWork : labWork;
  return (
    <main className="ws-library ws-reveal">
      <header>
        <span>{kind === "work" ? "Selected systems" : "Labs and experiments"}</span>
        <h1>{kind === "work" ? "Featured work" : "Explorations with public evidence"}</h1>
        <p>{kind === "work" ? "Operational software and applied AI, chosen for product depth and verifiable evidence." : "Smaller investigations in vision, 3D, and interactive systems."}</p>
      </header>
      <div className="ws-library-list">
        {projects.map((project, index) => (
          <button type="button" key={project.slug} onClick={() => openProject(project)}>
            <small>0{index + 1}</small>
            <span><strong>{project.title}</strong><em>{project.summary}</em></span>
            {project.image ? (
              <span className="ws-list-image"><Image src={project.image} alt="" fill sizes="180px" className="object-cover object-top" /></span>
            ) : <span className="ws-list-mark">{project.title.slice(0, 2).toUpperCase()}</span>}
            <Glyph name="arrow" />
          </button>
        ))}
      </div>
    </main>
  );
}

function ArtifactPane({ project, close }: { project: WorkspaceProject; close: () => void }) {
  return (
    <aside className="ws-artifact ws-artifact-reveal" aria-label={`${project.title} artifact`}>
      <header className="ws-artifact-head">
        <div><span>Project artifact</span><strong>{project.title}</strong></div>
        <button type="button" onClick={close} aria-label="Close project artifact"><Glyph name="close" /></button>
      </header>
      <div className="ws-artifact-scroll">
        {project.image ? (
          <figure className="ws-artifact-visual">
            <Image src={project.image} alt={`${project.title} verified project preview`} fill priority sizes="(max-width: 760px) 100vw, 48vw" className="object-cover object-top" />
          </figure>
        ) : (
          <section className="ws-artifact-text">
            <span>{project.eyebrow} · {project.year}</span>
            <h2>{project.title}</h2>
          </section>
        )}

        <section className="ws-artifact-section">
          <span>System framing</span>
          <p>{project.summary}</p>
          <dl><dt>Adjie’s role</dt><dd>{project.role}</dd></dl>
        </section>

        <section className="ws-artifact-section">
          <span>Evidence</span>
          <div className="ws-artifact-evidence">
            {project.evidence.map((item) => <dl key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></dl>)}
          </div>
        </section>

        <section className="ws-artifact-section">
          <span>Implementation highlights</span>
          <ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        {project.gallery && (
          <section className="ws-artifact-gallery">
            {project.gallery.slice(0, 3).map((item) => (
              <figure key={item.src}>
                <div><Image src={item.src} alt={item.caption} fill sizes="(max-width: 760px) 100vw, 42vw" className="object-cover object-top" /></div>
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </section>
        )}

        {project.assetNote && <p className="ws-asset-boundary">{project.assetNote}</p>}

        <footer className="ws-artifact-actions">
          {project.href && <Link href={project.href}>Full case study <ArrowUpRightIcon className="size-4" /></Link>}
          <a href={`mailto:${site.email}`}>Discuss this work</a>
        </footer>
      </div>
    </aside>
  );
}

function ActiveWorkspace({ project, answer, query, results, setQuery, submit, selectProject, close }: {
  project: WorkspaceProject;
  answer: string | null;
  query: string;
  results: WorkspaceProject[];
  setQuery: (value: string) => void;
  submit: () => void;
  selectProject: (project: WorkspaceProject) => void;
  close: () => void;
}) {
  const suggestions = results.length > 1 ? results : featuredWork;

  return (
    <main className="ws-active-workspace ws-reveal">
      <section className="ws-active-context">
        <header className="ws-context-head">
          <button type="button" onClick={close}><ArrowLeftIcon className="size-4" /> Workspace</button>
          <span>Approved public content</span>
        </header>
        <div className="ws-context-thread">
          <div className="ws-context-query">
            <span>You</span>
            <p>{answer ? query : `Show me ${project.title}.`}</p>
          </div>
          <div className="ws-context-answer">
            <span>Adjie Workspace</span>
            <p>{answer ?? project.summary}</p>
            <small>The project artifact is open beside this conversation.</small>
          </div>
          <div className="ws-context-projects" aria-label="Related projects">
            {suggestions.map((item) => (
              <button type="button" key={item.slug} className={item.slug === project.slug ? "is-active" : ""} onClick={() => selectProject(item)}>
                <span><strong>{item.title}</strong><small>{item.eyebrow}</small></span>
                <Glyph name="arrow" />
              </button>
            ))}
          </div>
        </div>
        <div className="ws-context-composer"><Composer query={query} setQuery={setQuery} submit={submit} /></div>
      </section>
      <ArtifactPane project={project} close={close} />
    </main>
  );
}

function AskView({ query, setQuery, answer, results, submit, choose, openProject }: {
  query: string;
  setQuery: (value: string) => void;
  answer: string | null;
  results: WorkspaceProject[];
  submit: () => void;
  choose: (value: string) => void;
  openProject: (project: WorkspaceProject) => void;
}) {
  return (
    <main className="ws-ask ws-reveal">
      <div className="ws-ask-inner">
        {!answer ? (
          <section className="ws-ask-empty">
            <span>Ask Adjie Workspace</span>
            <h1>What would you like to understand?</h1>
            <p>Answers are deterministic and limited to approved public project content.</p>
            <Composer query={query} setQuery={setQuery} submit={submit} autoFocus />
            <div className="ws-ask-suggestions">
              {prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => choose(prompt.query)}>{prompt.label}<Glyph name="arrow" /></button>)}
            </div>
          </section>
        ) : (
          <section className="ws-thread">
            <div className="ws-user-message"><span>You</span><p>{query}</p></div>
            <div className="ws-answer"><span>Adjie Workspace</span><p>{answer}</p></div>
            <div className="ws-answer-projects">
              {results.map((project) => <button type="button" key={project.slug} onClick={() => openProject(project)}><span><strong>{project.title}</strong><small>{project.eyebrow}</small></span><Glyph name="arrow" /></button>)}
            </div>
            <Composer query={query} setQuery={setQuery} submit={submit} />
          </section>
        )}
      </div>
    </main>
  );
}

export function WorkspacePrototype() {
  const [view, setView] = useState<WorkspaceView>("home");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [resultSlugs, setResultSlugs] = useState<string[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("workspace-active");
    return () => document.body.classList.remove("workspace-active");
  }, []);

  const opened = allWorkspaceProjects.find((project) => project.slug === openSlug);
  const navigationView: WorkspaceView = opened
    ? labWork.some((project) => project.slug === opened.slug) ? "labs" : "work"
    : view;
  const results = useMemo(() => resultSlugs.map((slug) => allWorkspaceProjects.find((project) => project.slug === slug)).filter(Boolean) as WorkspaceProject[], [resultSlugs]);

  function changeView(next: WorkspaceView) {
    setView(next);
    setOpenSlug(null);
    if (next !== "ask") setAnswer(null);
  }

  function openProject(project: WorkspaceProject) {
    setOpenSlug(project.slug);
  }

  function runAsk(value = query) {
    const clean = value.trim();
    if (!clean) return;
    const normalized = clean.toLowerCase();
    const match = normalized.includes("ai") || normalized.includes("vision") ? prompts[1]
      : normalized.includes("reliab") || normalized.includes("quality") || normalized.includes("safe") ? prompts[2]
        : prompts[0];
    setQuery(clean);
    setAnswer(match.answer);
    setResultSlugs(match.projects);
    setOpenSlug(match.projects[0]);
    setView("ask");
  }

  return (
    <div className="ws-app">
      <Sidebar view={navigationView} setView={changeView} mobileOpen={mobileNavOpen} closeMobile={() => setMobileNavOpen(false)} />
      <section className="ws-stage">
        <header className="ws-mobile-head">
          <button type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Glyph name="menu" /></button>
          <span>Adjie Workspace</span>
        </header>
        {opened ? <ActiveWorkspace project={opened} answer={view === "ask" ? answer : null} query={query} results={results}
            setQuery={setQuery} submit={() => runAsk()} selectProject={openProject} close={() => setOpenSlug(null)} />
          : view === "home" ? <HomeView query={query} setQuery={setQuery} submit={() => runAsk()} openProject={openProject} />
            : view === "ask" ? <AskView query={query} setQuery={setQuery} answer={answer} results={results} submit={() => runAsk()} choose={runAsk} openProject={openProject} />
              : <LibraryView kind={view} openProject={openProject} />}
      </section>
    </div>
  );
}
