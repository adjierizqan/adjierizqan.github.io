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

function Icon({ name }: { name: "home" | "work" | "labs" | "ask" | "panel" | "grid" | "arrow" | "spark" }) {
  const paths = {
    home: <><path d="m3 10 7-6 7 6" /><path d="M5.5 9v7h9V9" /></>,
    work: <><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M7 4V2.8h6V4M3 8h14" /></>,
    labs: <><path d="M7 3h6M8 3v4l-4 7.2A1.2 1.2 0 0 0 5.1 16h9.8a1.2 1.2 0 0 0 1.1-1.8L12 7V3" /><path d="M6.4 11h7.2" /></>,
    ask: <><path d="M4 4.5h12v9H9l-3.5 3v-3H4z" /><path d="M7 8h6M7 10.5h4" /></>,
    panel: <><rect x="2.5" y="3" width="15" height="14" rx="1.5" /><path d="M12.5 3v14" /></>,
    grid: <><rect x="3" y="3" width="5.5" height="5.5" /><rect x="11.5" y="3" width="5.5" height="5.5" /><rect x="3" y="11.5" width="5.5" height="5.5" /><rect x="11.5" y="11.5" width="5.5" height="5.5" /></>,
    arrow: <><path d="M3.5 10h12.5M11.5 5.5 16 10l-4.5 4.5" /></>,
    spark: <><path d="M10 2.5c.45 4.4 2.1 6.05 6.5 6.5-4.4.45-6.05 2.1-6.5 6.5C9.55 11.1 7.9 9.45 3.5 9 7.9 8.55 9.55 6.9 10 2.5Z" /><path d="M16 13.5c.18 1.65.85 2.32 2.5 2.5-1.65.18-2.32.85-2.5 2.5-.18-1.65-.85-2.32-2.5-2.5 1.65-.18 2.32-.85 2.5-2.5Z" /></>,
  };
  return <svg viewBox="0 0 20 20" aria-hidden="true">{paths[name]}</svg>;
}

function ProjectThumb({ project, priority = false }: { project: WorkspaceProject; priority?: boolean }) {
  if (!project.image) {
    return <div className="ws-thumb ws-thumb-empty"><span>{project.title.slice(0, 2).toUpperCase()}</span></div>;
  }
  return (
    <div className="ws-thumb">
      <Image src={project.image} alt="" fill priority={priority} sizes="(max-width: 800px) 40vw, 360px" className="object-cover object-top" />
    </div>
  );
}

function Composer({ query, setQuery, submit, compact = false }: {
  query: string; setQuery: (value: string) => void; submit: () => void; compact?: boolean;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }
  return (
    <div className={`ws-composer ${compact ? "is-compact" : ""}`}>
      <textarea rows={1} value={query} onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown} placeholder="Ask about Adjie’s work" aria-label="Ask about Adjie’s work" />
      <div className="ws-composer-actions">
        <span><Icon name="spark" /> Approved public content</span>
        <button type="button" onClick={submit} disabled={!query.trim()} aria-label="Submit question">
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  );
}

function ProjectRow({ project, selected, onSelect, onOpen }: {
  project: WorkspaceProject; selected: boolean; onSelect: () => void; onOpen: () => void;
}) {
  return (
    <button type="button" className={`ws-project-row ${selected ? "is-selected" : ""}`}
      onMouseEnter={onSelect} onFocus={onSelect} onClick={onOpen}>
      <ProjectThumb project={project} />
      <span className="ws-project-row-copy">
        <span className="ws-project-row-top"><em>{project.eyebrow}</em><small>{project.year}</small></span>
        <strong>{project.title}</strong>
        <span>{project.summary}</span>
      </span>
      <span className="ws-row-arrow"><Icon name="arrow" /></span>
    </button>
  );
}

function Inspector({ project, open, close, onOpen }: {
  project: WorkspaceProject; open: boolean; close: () => void; onOpen: () => void;
}) {
  return (
    <aside className={`ws-inspector ${open ? "is-open" : ""}`} aria-label={`Project context: ${project.title}`}>
      <div className="ws-panel-head">
        <div><Icon name="panel" /><span>Context</span></div>
        <button type="button" onClick={close} aria-label="Close context panel">×</button>
      </div>
      <div className="ws-inspector-scroll" key={project.slug}>
        <div className="ws-inspector-preview"><ProjectThumb project={project} /><span>{project.year}</span></div>
        <div className="ws-inspector-title">
          <span>{project.eyebrow}</span>
          <h2>{project.title}</h2>
          <p>{project.role}</p>
        </div>
        <div className="ws-inspector-section">
          <h3>Evidence</h3>
          <dl>{project.evidence.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
        </div>
        <div className="ws-inspector-section">
          <h3>What it demonstrates</h3>
          <ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        {project.assetNote && <div className="ws-disclosure"><span>Asset boundary</span><p>{project.assetNote}</p></div>}
        <button type="button" className="ws-inspector-open" onClick={onOpen}>Open case study <Icon name="arrow" /></button>
      </div>
    </aside>
  );
}

function BrowseCanvas({ selectedSlug, select, open, ask }: {
  selectedSlug: string; select: (slug: string) => void; open: (project: WorkspaceProject) => void; ask: () => void;
}) {
  return (
    <div className="ws-document ws-enter">
      <header className="ws-document-hero">
        <div>
          <span className="ws-eyebrow">Adjie Rizqan · Product engineer</span>
          <h1>Operational software.<br />Applied AI systems.</h1>
        </div>
        <div className="ws-intro-note">
          <p>Work designed around real inputs, accountable state, and outputs people can use.</p>
          <button type="button" onClick={ask}><Icon name="spark" /> Ask about the work</button>
        </div>
      </header>

      <section className="ws-work-section" aria-labelledby="featured-work">
        <div className="ws-section-head">
          <div><span>01</span><h2 id="featured-work">Featured work</h2></div>
          <p>Four systems selected for product depth and evidence.</p>
        </div>
        <div className="ws-project-list">
          {featuredWork.map((project) => <ProjectRow key={project.slug} project={project}
            selected={selectedSlug === project.slug} onSelect={() => select(project.slug)} onOpen={() => open(project)} />)}
        </div>
      </section>

      <section className="ws-work-section ws-labs-section" aria-labelledby="labs-work">
        <div className="ws-section-head"><div><span>02</span><h2 id="labs-work">Labs</h2></div><p>Focused experiments with public evidence.</p></div>
        <div className="ws-lab-grid">
          {labWork.map((project) => (
            <button type="button" key={project.slug} onMouseEnter={() => select(project.slug)}
              onFocus={() => select(project.slug)} onClick={() => open(project)}>
              <ProjectThumb project={project} />
              <span><em>{project.eyebrow}</em><strong>{project.title}</strong></span>
              <Icon name="arrow" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function AskCanvas({ query, setQuery, answer, results, submit, choose, select, open }: {
  query: string; setQuery: (value: string) => void; answer: string | null; results: WorkspaceProject[];
  submit: () => void; choose: (query: string) => void; select: (slug: string) => void; open: (project: WorkspaceProject) => void;
}) {
  return (
    <div className="ws-chat ws-enter">
      <header className="ws-chat-header">
        <div><span className="ws-presence" /><span>Ask Adjie Workspace</span></div>
        <p>Deterministic answers from approved public content</p>
      </header>
      <div className="ws-conversation">
        {!answer ? (
          <div className="ws-chat-welcome">
            <span className="ws-ai-mark"><Icon name="spark" /></span>
            <h1>What would you like to understand?</h1>
            <p>Ask about operational systems, applied AI, or how Adjie approaches reliability.</p>
            <div className="ws-suggestions">
              {prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => choose(prompt.query)}><span>{prompt.label}</span><Icon name="arrow" /></button>)}
            </div>
          </div>
        ) : (
          <div className="ws-thread">
            <div className="ws-message-user"><span>You</span><p>{query}</p></div>
            <div className="ws-message-assistant">
              <span className="ws-ai-mark"><Icon name="spark" /></span>
              <div><span>Workspace</span><p>{answer}</p>
                <div className="ws-chat-results">
                  {results.map((project) => <ProjectRow key={project.slug} project={project} selected={false}
                    onSelect={() => select(project.slug)} onOpen={() => open(project)} />)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="ws-chat-composer"><Composer query={query} setQuery={setQuery} submit={submit} /></div>
    </div>
  );
}

function CaseCanvas({ project, back }: { project: WorkspaceProject; back: () => void }) {
  return (
    <article className="ws-document ws-case ws-enter">
      <button type="button" className="ws-case-back" onClick={back}><ArrowLeftIcon className="size-4" /> Back to work</button>
      <header className="ws-case-head">
        <div><span className="ws-eyebrow">{project.eyebrow} · {project.year}</span><h1>{project.title}</h1></div>
        <p>{project.summary}</p>
      </header>
      <div className="ws-case-cover"><ProjectThumb project={project} priority /></div>
      <section className="ws-case-body">
        <div><span className="ws-eyebrow">Adjie’s role</span><p>{project.role}</p></div>
        <div><span className="ws-eyebrow">Work demonstrated</span><ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>
      <section className="ws-proof">
        <div className="ws-section-head"><div><span>03</span><h2>Evidence</h2></div><p>Specific signals behind the project.</p></div>
        <div>{project.evidence.map((item) => <dl key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></dl>)}</div>
      </section>
      {project.gallery && (
        <section className="ws-case-gallery">
          {project.gallery.map((shot, index) => <figure key={shot.src} className={index === 0 ? "is-wide" : ""}>
            <div><Image src={shot.src} alt={shot.caption} fill sizes="(max-width: 800px) 100vw, 760px" className="object-cover object-top" /></div>
            <figcaption>{shot.caption}</figcaption>
          </figure>)}
        </section>
      )}
      <footer className="ws-case-actions">
        {project.href && <Link href={project.href}>Published case study <ArrowUpRightIcon className="size-4" /></Link>}
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
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("workspace-active");
    return () => document.body.classList.remove("workspace-active");
  }, []);

  const selected = allWorkspaceProjects.find((project) => project.slug === selectedSlug) ?? featuredWork[0];
  const opened = allWorkspaceProjects.find((project) => project.slug === openSlug);
  const results = useMemo(() => resultSlugs
    .map((slug) => allWorkspaceProjects.find((project) => project.slug === slug))
    .filter(Boolean) as WorkspaceProject[], [resultSlugs]);

  function runAsk(value = query) {
    const clean = value.trim();
    if (!clean) return;
    const normalized = clean.toLowerCase();
    const match = normalized.includes("ai") || normalized.includes("vision") ? prompts[1]
      : normalized.includes("reliab") || normalized.includes("quality") || normalized.includes("safe") ? prompts[2] : prompts[0];
    setQuery(clean);
    setAnswer(match.answer);
    setResultSlugs(match.projects);
    setSelectedSlug(match.projects[0]);
    setMode("ask");
  }
  function openProject(project: WorkspaceProject) {
    setSelectedSlug(project.slug);
    setOpenSlug(project.slug);
    setInspectorOpen(false);
  }
  function setWorkspaceMode(next: WorkspaceMode) {
    setMode(next);
    setOpenSlug(null);
  }

  return (
    <div className="ws-app">
      <nav className="ws-rail" aria-label="Adjie Workspace">
        <button type="button" className="ws-logo" onClick={() => setWorkspaceMode("browse")} aria-label="Adjie Workspace home">A</button>
        <div className="ws-rail-tools">
          <button type="button" className={mode === "browse" && !opened ? "is-active" : ""} onClick={() => setWorkspaceMode("browse")} aria-label="Browse work"><Icon name="home" /><span>Home</span></button>
          <button type="button" className={opened ? "is-active" : ""} onClick={() => setWorkspaceMode("browse")} aria-label="Featured work"><Icon name="work" /><span>Work</span></button>
          <button type="button" onClick={() => { setWorkspaceMode("browse"); window.setTimeout(() => document.getElementById("labs-work")?.scrollIntoView({ behavior: "smooth" }), 0); }} aria-label="Labs"><Icon name="labs" /><span>Labs</span></button>
          <button type="button" className={mode === "ask" ? "is-active" : ""} onClick={() => setWorkspaceMode("ask")} aria-label="Ask workspace"><Icon name="ask" /><span>Ask</span></button>
        </div>
        <div className="ws-rail-bottom">
          <a href={`mailto:${site.email}`} aria-label="Contact Adjie"><MailIcon className="size-4" /><span>Contact</span></a>
          <a href={site.cv} target="_blank" rel="noopener noreferrer" aria-label="Open résumé"><FileIcon className="size-4" /><span>Résumé</span></a>
        </div>
      </nav>

      <section className="ws-workspace">
        <header className="ws-toolbar">
          <div className="ws-breadcrumb"><span>Adjie Workspace</span><b>/</b><strong>{opened ? opened.title : mode === "ask" ? "Ask" : "Featured work"}</strong></div>
          <div className="ws-view-switch" aria-label="Workspace view">
            <button type="button" className={mode === "browse" ? "is-active" : ""} onClick={() => setWorkspaceMode("browse")}><Icon name="grid" /> Browse</button>
            <button type="button" className={mode === "ask" ? "is-active" : ""} onClick={() => setWorkspaceMode("ask")}><Icon name="spark" /> Ask</button>
          </div>
          <button type="button" className="ws-context-toggle" onClick={() => setInspectorOpen(true)}><Icon name="panel" /> Context</button>
        </header>

        <div className="ws-canvas">
          <div className={`ws-canvas-frame ${mode === "ask" && !opened ? "is-chat" : ""}`}>
            <div className="ws-frame-top">
              <div><i /><i /><i /></div>
              <span>{opened ? `Case study / ${opened.title}` : mode === "ask" ? "Ask / approved public work" : "Portfolio / selected work"}</span>
              <em>{mode === "ask" ? "Local response" : "100%"}</em>
            </div>
            <div className="ws-frame-scroll">
              {opened ? <CaseCanvas project={opened} back={() => setOpenSlug(null)} />
                : mode === "ask" ? <AskCanvas query={query} setQuery={setQuery} answer={answer} results={results}
                    submit={() => runAsk()} choose={runAsk} select={setSelectedSlug} open={openProject} />
                  : <BrowseCanvas selectedSlug={selectedSlug} select={setSelectedSlug} open={openProject} ask={() => setWorkspaceMode("ask")} />}
            </div>
          </div>
        </div>
        <footer className="ws-statusbar">
          <div><span className="ws-presence" /> Available for selected product work</div>
          <div><span>Static prototype</span><span>EN</span></div>
        </footer>
      </section>

      <Inspector project={selected} open={inspectorOpen} close={() => setInspectorOpen(false)} onOpen={() => openProject(selected)} />
      {inspectorOpen && <button className="ws-scrim" type="button" onClick={() => setInspectorOpen(false)} aria-label="Close context panel" />}
    </div>
  );
}
