"use client";

import Image from "next/image";
import Link from "next/link";
import {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowUpRightIcon, FileIcon, MailIcon } from "@/components/Icons";
import { site } from "@/data/site";
import {
  allWorkspaceProjects,
  featuredWork,
  labWork,
  type WorkspaceProject,
} from "@/data/workspace";

type WorkspaceView = "home" | "work" | "projects" | "labs" | "knowledge" | "ask";
type Point = { x: number; y: number };

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
      "The recurring pattern is explicit state, one source of truth, reversible corrections, and checks at the boundary a visitor can inspect.",
    projects: ["suhulog", "labstock"],
  },
];

const projectTones: Record<string, string> = {
  labstock: "#10b981",
  bdrs: "#3b82f6",
  suhulog: "#38bdf8",
  "tomato-ripeness": "#f43f5e",
  "padel-vision": "#8b5cf6",
  objecttwin: "#475569",
  "porsche-3d": "#d97706",
};

function Glyph({ name }: { name: "home" | "work" | "projects" | "labs" | "book" | "ask" | "more" | "plus" | "search" | "send" | "menu" | "close" | "arrow" | "spark" | "context" | "speaker" | "sun" | "link" }) {
  const paths = {
    home: <><path d="m3 10 7-6 7 6" /><path d="M5.5 9v7h9V9" /></>,
    work: <><rect x="3" y="5" width="14" height="11" rx="1.5" /><path d="M7 5V3h6v2M3 9h14" /></>,
    projects: <><rect x="3" y="3" width="5.5" height="5.5" /><rect x="11.5" y="3" width="5.5" height="5.5" /><rect x="3" y="11.5" width="5.5" height="5.5" /><rect x="11.5" y="11.5" width="5.5" height="5.5" /></>,
    labs: <><path d="M7 3h6M8 3v4l-4 7.2A1.2 1.2 0 0 0 5.1 16h9.8a1.2 1.2 0 0 0 1.1-1.8L12 7V3" /><path d="M6.4 11h7.2" /></>,
    book: <><path d="M4 3.5h11.5v13H6.5A2.5 2.5 0 0 0 4 19V3.5Z" /><path d="M6.5 16.5h9" /></>,
    ask: <><path d="M4 4.5h12v9H9l-3.5 3v-3H4z" /><path d="M7 8h6M7 10.5h4" /></>,
    more: <><circle cx="5" cy="10" r=".8" fill="currentColor" stroke="none" /><circle cx="10" cy="10" r=".8" fill="currentColor" stroke="none" /><circle cx="15" cy="10" r=".8" fill="currentColor" stroke="none" /></>,
    plus: <path d="M10 3v14M3 10h14" />,
    search: <><circle cx="8.5" cy="8.5" r="5" /><path d="m12.5 12.5 4 4" /></>,
    send: <><path d="m3 4 14 6-14 6 2.2-6L3 4Z" /><path d="M5.2 10H17" /></>,
    menu: <><path d="M3 6h14M3 10h14M3 14h14" /></>,
    close: <><path d="m5 5 10 10M15 5 5 15" /></>,
    arrow: <><path d="M3.5 10h12.5M11.5 5.5 16 10l-4.5 4.5" /></>,
    spark: <path d="M10 2.5c.45 4.4 2.1 6.05 6.5 6.5-4.4.45-6.05 2.1-6.5 6.5C9.55 11.1 7.9 9.45 3.5 9 7.9 8.55 9.55 6.9 10 2.5Z" />,
    context: <><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M12 3v14" /></>,
    speaker: <><path d="M4 8h3l4-3v10l-4-3H4Z" /><path d="M14 7.5a4 4 0 0 1 0 5M16 5a7 7 0 0 1 0 10" /></>,
    sun: <><circle cx="10" cy="10" r="3" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4" /></>,
    link: <><path d="M8.5 11.5 11.5 8.5" /><path d="M6.5 13.5H5a3 3 0 0 1 0-6h3M11.5 6.5H13a3 3 0 0 1 0 6h-3" /></>,
  };
  return <svg viewBox="0 0 20 20" aria-hidden="true">{paths[name]}</svg>;
}

function Composer({ query, setQuery, submit }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="aw-composer">
      <textarea
        rows={2}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask anything about my work…"
        aria-label="Ask anything about Adjie’s work"
      />
      <div className="aw-composer-tools">
        <div>
          <button type="button" aria-label="Add project context"><Glyph name="plus" /></button>
          <button type="button" onClick={() => setQuery("Show me Adjie’s operational systems.")}><Glyph name="search" /> Projects</button>
          <button type="button" onClick={() => setQuery("What evidence is available for Adjie’s work?")}><Glyph name="book" /> Evidence</button>
          <button type="button" onClick={() => setQuery("How does Adjie approach reliability?")}><Glyph name="spark" /> Build notes</button>
        </div>
        <div className="aw-composer-submit"><span>Adjie AI · Preview</span><button className="aw-send" type="button" onClick={submit} disabled={!query.trim()} aria-label="Send query"><Glyph name="send" /></button></div>
      </div>
    </div>
  );
}

function Sidebar({ view, selected, setView, newSession, selectProject, openPalette, open, close }: {
  view: WorkspaceView;
  selected: WorkspaceProject;
  setView: (view: WorkspaceView) => void;
  newSession: () => void;
  selectProject: (project: WorkspaceProject) => void;
  openPalette: () => void;
  open: boolean;
  close: () => void;
}) {
  const nav: { label: string; view: WorkspaceView; icon: "home" | "work" | "projects" | "labs" | "book" | "ask" }[] = [
    { label: "Home", view: "home", icon: "home" },
    { label: "Work", view: "work", icon: "work" },
    { label: "Projects", view: "projects", icon: "projects" },
    { label: "Labs", view: "labs", icon: "labs" },
    { label: "Knowledge", view: "knowledge", icon: "book" },
    { label: "Ask", view: "ask", icon: "ask" },
  ];

  return (
    <>
      <aside className={"aw-sidebar " + (open ? "is-open" : "")}>
        <div className="aw-sidebar-scroll">
          <header className="aw-profile">
            <span className="aw-avatar is-light">AR</span>
            <span><strong>Adjie Rizqan</strong><small>Personal AI Workspace</small></span>
            <button className="aw-pronounce" type="button" disabled title="Pronunciation audio is not yet available" aria-label="Pronunciation audio unavailable"><Glyph name="speaker" /></button>
            <button className="aw-mobile-close" type="button" onClick={close} aria-label="Close navigation"><Glyph name="close" /></button>
          </header>

          <button className="aw-new-session" type="button" onClick={() => { newSession(); close(); }}>
            <span><Glyph name="plus" /> New Session</span><kbd>⌘ N</kbd>
          </button>

          <nav className="aw-primary-nav" aria-label="Workspace">
            {nav.map((item) => (
              <button
                type="button"
                key={item.label}
                className={view === item.view ? "is-active" : ""}
                onClick={() => { setView(item.view); close(); }}
              >
                <Glyph name={item.icon} /><span>{item.label}</span>
              </button>
            ))}
            <button type="button" onClick={openPalette}><Glyph name="more" /><span>More</span></button>
          </nav>

          <section className="aw-project-shortcuts">
            <header><span>Projects</span></header>
            {allWorkspaceProjects.map((project) => (
              <button
                type="button"
                key={project.slug}
                className={selected.slug === project.slug ? "is-selected" : ""}
                onClick={() => { selectProject(project); close(); }}
              >
                <i style={{ backgroundColor: projectTones[project.slug] ?? "#94a3b8" }} />
                <span>{project.title}</span>
              </button>
            ))}
          </section>
        </div>

        <footer className="aw-sidebar-footer">
          <button type="button" className="aw-search-trigger" onClick={openPalette}><span><Glyph name="search" /> Search</span><kbd>⌘ K</kbd></button>
          <div className="aw-contact-links">
            <a href={"mailto:" + site.email}><MailIcon /> Contact</a>
            <a href={site.cv} target="_blank" rel="noopener noreferrer"><FileIcon /> Résumé</a>
          </div>
          <div className="aw-owner"><span className="aw-avatar">AR</span><span><strong>Adjie Rizqan</strong><small>Build · Solve · Improve</small></span></div>
        </footer>
      </aside>
      {open && <button className="aw-drawer-scrim" type="button" onClick={close} aria-label="Close navigation" />}
    </>
  );
}

function HomeWorkspace({ query, setQuery, submit, setView, selectProject }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  setView: (view: WorkspaceView) => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  const starters = [
    { title: "Explore my projects", detail: "See what I’ve built", icon: "work" as const, action: () => setView("work") },
    { title: "Ask about my work", detail: "Technical context", icon: "ask" as const, action: () => setView("ask") },
    { title: "Operational systems", detail: "Workflows and reliability", icon: "projects" as const, action: () => selectProject(featuredWork[0]) },
    { title: "Applied AI", detail: "Research and evaluation", icon: "spark" as const, action: () => selectProject(featuredWork[3]) },
  ];

  return (
    <main className="aw-center aw-enter">
      <section className="aw-identity">
        <div>
          <span>Good evening,</span>
          <div className="aw-name"><h1>Adjie Rizqan</h1><button type="button" disabled title="Pronunciation audio is not yet available" aria-label="Pronunciation audio unavailable"><Glyph name="speaker" /></button></div>
          <p>Turn ideas into useful systems.</p>
        </div>
        <blockquote>“A more capable me,<br />for a more useful tomorrow.”</blockquote>
      </section>

      <div className="aw-focus-tags">
        {["Software Engineering", "Applied AI", "Healthcare Systems", "Computer Vision", "Automation"].map((tag) => <span key={tag}>{tag}</span>)}
      </div>

      <Composer query={query} setQuery={setQuery} submit={submit} />

      <section className="aw-starters">
        <h2>Start with</h2>
        <div>{starters.map((item) => (
          <button type="button" key={item.title} onClick={item.action}>
            <span><Glyph name={item.icon} /></span>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </button>
        ))}</div>
      </section>

      <section className="aw-recent">
        <header><div><strong>Recent</strong><span><button className="is-active" type="button">Projects</button><button type="button" onClick={() => setView("work")}>Systems</button><button type="button" onClick={() => setView("labs")}>Labs</button></span></div><button type="button" onClick={() => setView("work")}>View all <Glyph name="arrow" /></button></header>
        <div>
          {featuredWork.map((project) => (
            <button type="button" key={project.slug} onClick={() => selectProject(project)}>
              <span className="aw-row-icon"><Glyph name={project.slug === "tomato-ripeness" ? "spark" : "ask"} /></span>
              <span><strong>{project.title}</strong><small>{project.summary}</small></span>
              <Glyph name="arrow" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function WorkspaceHeader({ eyebrow, title, copy, meta }: { eyebrow: string; title: string; copy: string; meta?: string }) {
  return (
    <header className="aw-page-header">
      <div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
      {meta && <small>{meta}</small>}
    </header>
  );
}

function WorkWorkspace({ selectProject }: { selectProject: (project: WorkspaceProject) => void }) {
  const primary = featuredWork[0];
  const secondary = featuredWork.slice(1);

  return (
    <main className="aw-center aw-work aw-enter">
      <WorkspaceHeader eyebrow="Selected systems" title="Work" copy="Operational software and applied AI, organized around inspectable project evidence." meta="4 featured cases" />

      <button type="button" className="aw-primary-work" onClick={() => selectProject(primary)}>
        <section>
          <span>Primary workspace artifact · {primary.year}</span>
          <h2>{primary.title}</h2>
          <p>{primary.summary}</p>
          <strong>Open context <Glyph name="arrow" /></strong>
        </section>
        <div className="aw-system-artifact">
          <header><span>Verified system boundary</span><small>Evidence-led</small></header>
          <div className="aw-system-flow">
            {primary.evidence.map((item, index) => <div key={item.label}><small>0{index + 1}</small><span>{item.label}</span><strong>{item.value}</strong></div>)}
          </div>
          <footer>No production screenshot is published without a verified sanitized asset.</footer>
        </div>
      </button>

      <section className="aw-secondary-work" aria-label="More featured work">
        {secondary.map((project) => (
          <button type="button" key={project.slug} onClick={() => selectProject(project)}>
            {project.image ? (
              <figure><Image src={project.image} alt={project.title + " verified preview"} fill sizes="(max-width: 760px) 100vw, 300px" className="object-cover object-top" /></figure>
            ) : (
              <div className="aw-evidence-preview">
                <span>Evidence state</span>
                {project.evidence.map((item) => <dl key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></dl>)}
              </div>
            )}
            <section><span>{project.eyebrow}</span><h3>{project.title}</h3><p>{project.summary}</p><strong>Inspect project <Glyph name="arrow" /></strong></section>
          </button>
        ))}
      </section>
    </main>
  );
}

function ProjectDirectory({ projects, title, copy, selectProject }: {
  projects: WorkspaceProject[];
  title: string;
  copy: string;
  selectProject: (project: WorkspaceProject) => void;
}) {
  return (
    <main className="aw-center aw-directory aw-enter">
      <WorkspaceHeader eyebrow="Adjie Workspace" title={title} copy={copy} meta={projects.length + " project objects"} />
      <div className="aw-project-objects">
        {projects.map((project) => (
          <button type="button" key={project.slug} onClick={() => selectProject(project)}>
            {project.image ? <figure><Image src={project.image} alt={project.title + " verified preview"} fill sizes="(max-width: 760px) 100vw, 280px" className="object-cover object-top" /></figure> : <div className="aw-object-evidence">{project.evidence.slice(0, 2).map((item) => <dl key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></dl>)}</div>}
            <section><span>{project.eyebrow}</span><strong>{project.title}</strong><p>{project.summary}</p><small>Open context <Glyph name="arrow" /></small></section>
          </button>
        ))}
      </div>
    </main>
  );
}

function KnowledgeWorkspace({ selectProject }: { selectProject: (project: WorkspaceProject) => void }) {
  return (
    <main className="aw-center aw-knowledge aw-enter">
      <WorkspaceHeader eyebrow="Public project record" title="Knowledge" copy="Verified signals and implementation boundaries from Adjie’s published work." meta="Evidence only" />
      <div className="aw-knowledge-list">
        {featuredWork.map((project) => (
          <button type="button" key={project.slug} onClick={() => selectProject(project)}>
            <span><i style={{ backgroundColor: projectTones[project.slug] }} /><strong>{project.title}</strong><small>{project.role}</small></span>
            <div>{project.evidence.map((item) => <dl key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></dl>)}</div>
          </button>
        ))}
      </div>
    </main>
  );
}

function AskWorkspace({ query, setQuery, answer, results, submit, choose, selectProject }: {
  query: string;
  setQuery: (value: string) => void;
  answer: string | null;
  results: WorkspaceProject[];
  submit: () => void;
  choose: (value: string) => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  return (
    <main className="aw-center aw-ask aw-enter">
      {!answer ? (
        <section className="aw-ask-empty">
          <span>Ask Adjie Workspace</span>
          <h1>What would you like to understand?</h1>
          <p>Answers use approved public project content and deterministic V1 responses.</p>
          <Composer query={query} setQuery={setQuery} submit={submit} />
          <div>{prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => choose(prompt.query)}>{prompt.label}<Glyph name="arrow" /></button>)}</div>
        </section>
      ) : (
        <section className="aw-conversation">
          <div className="aw-message is-user"><span>You</span><p>{query}</p></div>
          <div className="aw-message"><span>Workspace</span><p>{answer}</p></div>
          <div className="aw-result-list">{results.map((project) => <button type="button" key={project.slug} onClick={() => selectProject(project)}><span><strong>{project.title}</strong><small>{project.eyebrow}</small></span><Glyph name="arrow" /></button>)}</div>
          <Composer query={query} setQuery={setQuery} submit={submit} />
        </section>
      )}
    </main>
  );
}

function ContextRail({ project, open, close, selectProject }: {
  project: WorkspaceProject;
  open: boolean;
  close: () => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  const related = featuredWork.filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <>
      <aside className={"aw-context " + (open ? "is-open" : "")}>
        <header className="aw-context-title"><span><i /> Current Context</span><button type="button" onClick={close} aria-label="Close context"><Glyph name="close" /></button></header>
        <div className="aw-context-scroll">
          <section className="aw-context-project">
            <header className="aw-context-identity">
              <span className="aw-project-symbol" style={{ color: projectTones[project.slug] ?? "#64748b" }}>{project.title.slice(0, 2).toUpperCase()}</span>
              <span><strong>{project.title}</strong><small>{project.eyebrow}</small></span>
            </header>
            {project.image ? (
              <figure><Image src={project.image} alt={project.title + " verified project preview"} fill sizes="320px" className="object-cover object-top" /></figure>
            ) : (
              <div className="aw-text-preview">
                <span>Evidence-led case</span>
                <strong>{project.title}</strong>
                <small>{project.assetNote}</small>
              </div>
            )}
            <p className="aw-context-framing">{project.summary}</p>
            <div className="aw-context-evidence-block">
              <header>Verified evidence</header>
              <dl className="aw-context-evidence">
                {project.evidence.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
              </dl>
            </div>
            <div className="aw-context-actions">
              {project.href && <Link href={project.href}>Open case study <ArrowUpRightIcon /></Link>}
              <a href={"mailto:" + site.email}>Discuss this work</a>
            </div>
          </section>

          <section className="aw-context-section">
            <header>Focus</header>
            <ul>{project.scope.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section className="aw-context-section aw-quick-links">
            <header>Quick links</header>
            <div>
              <a href={site.github} target="_blank" rel="noopener noreferrer"><Glyph name="link" /> GitHub</a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer"><Glyph name="link" /> LinkedIn</a>
              <a href={site.cv} target="_blank" rel="noopener noreferrer"><FileIcon /> Résumé</a>
              <a href={"mailto:" + site.email}><MailIcon /> Contact</a>
            </div>
            <div className="aw-related"><span>Related work</span>{related.map((item) => <button type="button" key={item.slug} onClick={() => selectProject(item)}><i style={{ backgroundColor: projectTones[item.slug] }} /><span>{item.title}</span><Glyph name="arrow" /></button>)}</div>
          </section>
        </div>
      </aside>
      {open && <button className="aw-context-scrim" type="button" onClick={close} aria-label="Close context" />}
    </>
  );
}

function CommandPalette({ open, close, setView, selectProject }: {
  open: boolean;
  close: () => void;
  setView: (view: WorkspaceView) => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selectProjectStable = useCallback((project: WorkspaceProject) => selectProject(project), [selectProject]);
  const commands = useMemo(() => [
    { label: "Go home", run: () => setView("home") },
    { label: "Browse featured work", run: () => setView("work") },
    { label: "Open Labs", run: () => setView("labs") },
    { label: "Ask about Adjie", run: () => setView("ask") },
    ...allWorkspaceProjects.map((project) => ({ label: "Open " + project.title, run: () => selectProjectStable(project) })),
  ].filter((item) => item.label.toLowerCase().includes(filter.toLowerCase())), [filter, selectProjectStable, setView]);

  if (!open) return null;

  function run(index: number) {
    commands[index]?.run();
    close();
  }

  return (
    <div className="aw-palette-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="aw-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <label><Glyph name="search" /><input autoFocus value={filter} onChange={(event) => { setFilter(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((value) => Math.min(value + 1, commands.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((value) => Math.max(value - 1, 0)); }
          if (event.key === "Enter") { event.preventDefault(); run(activeIndex); }
          if (event.key === "Escape") close();
        }} placeholder="Search projects and actions…" /></label>
        <div>{commands.map((command, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} key={command.label} onMouseEnter={() => setActiveIndex(index)} onClick={() => run(index)}>{command.label}<span>↵</span></button>)}</div>
      </section>
    </div>
  );
}

export function WorkspacePrototype() {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; start: Point; origin: Point } | null>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState<WorkspaceView>("home");
  const [selectedSlug, setSelectedSlug] = useState("labstock");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [resultSlugs, setResultSlugs] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [strongContrast, setStrongContrast] = useState(false);

  const selected = allWorkspaceProjects.find((project) => project.slug === selectedSlug) ?? featuredWork[0];
  const results = useMemo(() => resultSlugs.map((slug) => allWorkspaceProjects.find((project) => project.slug === slug)).filter(Boolean) as WorkspaceProject[], [resultSlugs]);

  useEffect(() => {
    document.body.classList.add("workspace-active");
    return () => document.body.classList.remove("workspace-active");
  }, []);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setView("home");
        setQuery("");
        setAnswer(null);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setSidebarOpen(false);
        setContextOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function resetForViewport() {
      setPosition({ x: 0, y: 0 });
    }
    window.addEventListener("resize", resetForViewport);
    return () => window.removeEventListener("resize", resetForViewport);
  }, []);

  const selectProject = useCallback((project: WorkspaceProject) => {
    setSelectedSlug(project.slug);
    if (window.innerWidth < 1100) setContextOpen(true);
  }, []);

  function newSession() {
    setView("home");
    setQuery("");
    setAnswer(null);
    setResultSlugs([]);
  }

  function runAsk(value = query) {
    const clean = value.trim();
    if (!clean) return;
    const normalized = clean.toLowerCase();
    const match = normalized.includes("ai") || normalized.includes("vision") || normalized.includes("tomato") ? prompts[1]
      : normalized.includes("reliab") || normalized.includes("quality") || normalized.includes("safe") ? prompts[2]
        : prompts[0];
    setQuery(clean);
    setAnswer(match.answer);
    setResultSlugs(match.projects);
    setSelectedSlug(match.projects[0]);
    setView("ask");
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (window.innerWidth < 1100 || event.button !== 0 || (event.target as HTMLElement).closest("[data-no-drag]")) return;
    dragRef.current = { pointerId: event.pointerId, start: { x: event.clientX, y: event.clientY }, origin: position };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    const element = windowRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !element) return;

    const rect = element.getBoundingClientRect();
    const baseLeft = rect.left - position.x;
    const baseTop = rect.top - position.y;
    const nextX = drag.origin.x + event.clientX - drag.start.x;
    const nextY = drag.origin.y + event.clientY - drag.start.y;
    const minX = 80 - baseLeft - rect.width;
    const maxX = window.innerWidth - 80 - baseLeft;
    const minY = -baseTop;
    const maxY = window.innerHeight - 80 - baseTop;

    setPosition({
      x: Math.min(Math.max(nextX, minX), maxX),
      y: Math.min(Math.max(nextY, minY), maxY),
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className={"aw-desktop " + (strongContrast ? "is-strong-contrast" : "")}>
      <div className="aw-wallpaper" aria-hidden="true" />
      <div
        ref={windowRef}
        className={"aw-window " + (dragging ? "is-dragging" : "")}
        style={{ transform: "translate3d(" + position.x + "px, " + position.y + "px, 0)" }}
      >
        <header
          className="aw-titlebar"
          data-drag-handle
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="aw-traffic" aria-label="Window controls"><i /><i /><i /></div>
          <div className="aw-title-actions" data-no-drag>
            <span>Build · Solve · Improve</span>
            <button type="button" onClick={() => setContextOpen(true)} className="aw-context-toggle"><Glyph name="context" /> Context</button>
            <button type="button" onClick={() => setPaletteOpen(true)}><kbd>⌘ K</kbd></button>
            <button type="button" className="aw-appearance" onClick={() => setStrongContrast((value) => !value)} aria-pressed={strongContrast} aria-label="Toggle interface contrast"><Glyph name="sun" /></button>
            <span className="aw-avatar">AR</span>
          </div>
        </header>

        <div className="aw-body">
          <Sidebar view={view} selected={selected} setView={setView} newSession={newSession} selectProject={selectProject} openPalette={() => setPaletteOpen(true)} open={sidebarOpen} close={() => setSidebarOpen(false)} />

          <section className="aw-stage">
            <header className="aw-mobile-header">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Glyph name="menu" /></button>
              <strong>Adjie Workspace</strong>
              <button type="button" onClick={() => setContextOpen(true)} aria-label="Open current context"><Glyph name="context" /></button>
            </header>
            {view === "home" ? <HomeWorkspace query={query} setQuery={setQuery} submit={() => runAsk()} setView={setView} selectProject={selectProject} />
              : view === "work" ? <WorkWorkspace selectProject={selectProject} />
                : view === "projects" ? <ProjectDirectory projects={allWorkspaceProjects} title="Projects" copy="A single workspace index for featured systems and focused experiments." selectProject={selectProject} />
                  : view === "labs" ? <ProjectDirectory projects={labWork} title="Labs" copy="Focused experiments in computer vision, 3D pipelines, and interactive systems." selectProject={selectProject} />
                    : view === "knowledge" ? <KnowledgeWorkspace selectProject={selectProject} />
                      : <AskWorkspace query={query} setQuery={setQuery} answer={answer} results={results} submit={() => runAsk()} choose={runAsk} selectProject={selectProject} />}
          </section>

          <ContextRail project={selected} open={contextOpen} close={() => setContextOpen(false)} selectProject={selectProject} />
        </div>
      </div>

      <CommandPalette open={paletteOpen} close={() => setPaletteOpen(false)} setView={setView} selectProject={selectProject} />
    </div>
  );
}
