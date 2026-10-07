"use client";

import Image from "next/image";
import dimensions from "@/data/media-dimensions.json";
import dynamic from "next/dynamic";
import { ProjectOpener, requestProjectIntro, markProjectHistoryNavigation } from "@/components/workspace/ProjectOpener";
import { WorkspaceHome } from "@/components/workspace/WorkspaceHome";
const LabStockCaseStudy = dynamic(() => import("@/components/labstock/LabStockCaseStudy").then(m => m.LabStockCaseStudy));
const SuhuLogStudy = dynamic(() => import("@/components/studies/SuhuLogStudy"));
const BdrsStudy = dynamic(() => import("@/components/studies/BdrsStudy"));
const TomatoStudy = dynamic(() => import("@/components/studies/TomatoStudy"));
const LabsStudy = dynamic(() => import("@/components/studies/LabsStudy"));
import { SoundButton, playUISound } from "@/components/workspace/UISound";
import { createPortal, flushSync } from "react-dom";
import {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useId,
  useState,
  useSyncExternalStore,
} from "react";
import { FileIcon, MailIcon } from "@/components/Icons";
import { L, t, tk } from "@/lib/i18n";
import { localizeProject } from "@/lib/localize-project";
import { site } from "@/data/site";
import { streamPortfolioAnswer } from "@/lib/portfolio-ai";
import { contextHistory, groupTurns, type AskTurn } from "@/lib/ask-context";
import {
  allWorkspaceProjects as rawAll,
  featuredWork as rawFeatured,
  labWork as rawLabs,
  type WorkspaceProject,
} from "@/data/workspace";

// Project copy in the active language (see lib/i18n.ts). Slugs, media and numbers are unchanged.
const allProjects = () => rawAll.map(localizeProject);
const featuredProjects = () => rawFeatured.map(localizeProject);
const labProjects = () => rawLabs.map(localizeProject);

type WorkspaceView = "home" | "work" | "projects" | "labs" | "knowledge" | "ask" | "project";
type Point = { x: number; y: number };
type WindowState = "open" | "minimized" | "closed";
type QuickLookImage = { src: string; caption: string };
type AskStatus = "idle" | "sending" | "streaming" | "complete" | "error";


function withViewTransition(update: () => void) {
  if (typeof document === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => unknown };
  if (transitionDocument.startViewTransition) transitionDocument.startViewTransition(() => flushSync(update));
  else update();
}

const prompts = [
  {
    label: tk("Operational systems"),
    query: tk("Tell me about Adjie’s operational software projects."),
    projects: ["labstock", "suhulog", "bdrs"],
  },
  {
    label: tk("Applied AI"),
    query: tk("Show me Adjie’s applied AI work."),
    projects: ["tomato-ripeness", "padel-vision"],
  },
  {
    label: tk("Reliability"),
    query: tk("How does Adjie approach reliability?"),
    projects: ["suhulog", "labstock"],
  },
];

const projectTones: Record<string, string> = {
  labstock: "#10b981",
  bdrs: "#3b82f6",
  suhulog: "#38bdf8",
  "tomato-ripeness": "#f43f5e",
  "padel-vision": "#8b5cf6",
  "porsche-3d": "#d97706",
};

function Glyph({ name }: { name: "home" | "work" | "projects" | "labs" | "book" | "ask" | "more" | "plus" | "search" | "send" | "menu" | "close" | "arrow" | "spark" | "context" | "speaker" | "sun" | "moon" | "music" | "link" | "play" | "pause" }) {
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
    music: <><path d="M8 15.5V4.5l8-1.5v10.5" /><circle cx="6" cy="15.5" r="2" /><circle cx="14" cy="13" r="2" /></>,
    moon: <path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1Z" />,
    sun: <><circle cx="10" cy="10" r="3" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M15.7 4.3l-1.4 1.4M5.7 14.3l-1.4 1.4" /></>,
    link: <><path d="M8.5 11.5 11.5 8.5" /><path d="M6.5 13.5H5a3 3 0 0 1 0-6h3M11.5 6.5H13a3 3 0 0 1 0 6h-3" /></>,
    play: <path d="m7 4 9 6-9 6Z" fill="currentColor" stroke="none" />,
    pause: <><path d="M7 5v10M13 5v10" strokeWidth="2.4" /></>,
  };
  return <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function QuickLook({ images, index, close, navigate }: {
  images: QuickLookImage[];
  index: number;
  close: () => void;
  navigate: (direction: number) => void;
}) {
  const image = images[index];
  const [zoomed, setZoomed] = useState(false);
  const allowZoom = Boolean(image);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const desktop = document.querySelector<HTMLElement>(".aw-desktop");
    const wasInert = desktop?.hasAttribute("inert") ?? false;
    const previousOverflow = document.body.style.overflow;
    desktop?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") close();
      if (!(event.target as HTMLElement).closest(".is-actual-size") && index > 0 && event.key === "ArrowLeft") navigate(-1);
      if (!(event.target as HTMLElement).closest(".is-actual-size") && index < images.length - 1 && event.key === "ArrowRight") navigate(1);
      if (event.key === "Tab") {
        const controls = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), [tabindex='0']") ?? [])];
        if (!controls.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (!wasInert) desktop?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
    };
  }, [close, images.length, index, navigate]);

  if (!image) return null;

  return createPortal(
    <div className="aw-quicklook-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section ref={dialogRef} className={"aw-quicklook" + (allowZoom ? " aw-quicklook-inspectable" : "")} role="dialog" aria-modal="true" aria-label={t("Project image viewer")}>
        <header><span>{index + 1} / {images.length}</span><p>{image.caption}</p>{allowZoom && <button type="button" className="aw-zoom-button" aria-pressed={zoomed} onClick={() => { playUISound("tap"); setZoomed(!zoomed); }}>{zoomed ? L("Fit image", "Sesuaikan") : L("Actual size", "Ukuran asli")}</button>}<button type="button" autoFocus onClick={close} aria-label={t("Close image viewer")}><Glyph name="close" /></button></header>
        <div className={"aw-quicklook-image" + (allowZoom && zoomed ? " is-actual-size" : "")} key={image.src} tabIndex={allowZoom && zoomed ? 0 : undefined} role={allowZoom && zoomed ? "region" : undefined} aria-label={allowZoom && zoomed ? L("Full resolution image; scroll to inspect", "Gambar resolusi penuh; gulir untuk memeriksa") : undefined}>
          {allowZoom && zoomed ? <Image src={image.src} alt={image.caption} width={dimensions[image.src as keyof typeof dimensions]?.width ?? 1440} height={dimensions[image.src as keyof typeof dimensions]?.height ?? 1024} priority /> : <Image src={image.src} alt={image.caption} fill sizes="100vw" quality={95} className="object-contain" priority />}
        </div>
        {index > 0 && <button type="button" className="aw-quicklook-nav is-previous" onClick={() => navigate(-1)} aria-label={t("Previous image")}><Glyph name="arrow" /></button>}
        {index < images.length - 1 && <button type="button" className="aw-quicklook-nav is-next" onClick={() => navigate(1)} aria-label={t("Next image")}><Glyph name="arrow" /></button>}
      </section>
    </div>,
    document.body,
  );
}

function Composer({ query, setQuery, submit, stop, busy = false, placeholder, suggestions = true }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  stop?: () => void;
  busy?: boolean;
  placeholder?: string;
  suggestions?: boolean;
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
        placeholder={placeholder ?? t("Ask anything about my work…")}
        aria-label={t("Ask anything about Adjie’s work")}
        maxLength={800}
        disabled={busy}
      />
      <div className="aw-composer-tools">
        {suggestions && <div>
          <button type="button" onClick={() => setQuery(t("Show me Adjie’s operational systems."))}><Glyph name="search" /> {t("Projects")}</button>
          <button type="button" onClick={() => setQuery(t("What evidence is available for Adjie’s work?"))}><Glyph name="book" /> {t("Evidence")}</button>
          <button type="button" onClick={() => setQuery(t("How does Adjie approach reliability?"))}><Glyph name="spark" /> {t("Build notes")}</button>
        </div>}
        <div className="aw-composer-submit"><span>{t("Adjie AI")}</span><button className="aw-send" type="button" onClick={busy ? stop : submit} disabled={busy ? !stop : !query.trim()} aria-label={busy ? t("Stop response") : t("Send query")}><Glyph name={busy ? "close" : "send"} /></button></div>
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
    { label: tk("Home"), view: "home", icon: "home" },
    { label: tk("Work"), view: "work", icon: "work" },
    { label: tk("Projects"), view: "projects", icon: "projects" },
    { label: tk("Labs"), view: "labs", icon: "labs" },
    { label: tk("Knowledge"), view: "knowledge", icon: "book" },
    { label: tk("Ask"), view: "ask", icon: "ask" },
  ];

  return (
    <>
      <aside className={"aw-sidebar " + (open ? "is-open" : "")}>
        <div className="aw-sidebar-scroll">
          <header className="aw-profile">
            <span className="aw-avatar is-light">a.</span>
            <span><strong>{t("Adjie Rizqan")}</strong><small>{t("Software engineer")}</small></span>

            <button className="aw-mobile-close" type="button" onClick={close} aria-label={t("Close navigation")}><Glyph name="close" /></button>
          </header>

          <button className="aw-new-session" type="button" onClick={() => { newSession(); close(); }}>
            <span><Glyph name="plus" /> {t("New Session")}</span><kbd>⌘ N</kbd>
          </button>

          <nav className="aw-primary-nav" aria-label={t("Workspace")}>
            {nav.map((item) => (
              <button
                type="button"
                key={item.label}
                className={view === item.view ? "is-active" : ""}
                aria-current={view === item.view ? "page" : undefined}
                onClick={() => { setView(item.view); close(); }}
              >
                <Glyph name={item.icon} /><span>{t(item.label)}</span>
              </button>
            ))}
            <button type="button" onClick={openPalette}><Glyph name="more" /><span>{t("More")}</span></button>
          </nav>

          <section className="aw-project-shortcuts">
            <header><span>{t("Projects")}</span></header>
            {allProjects().map((project) => (
              <button
                type="button"
                key={project.slug}
                className={view === "project" && selected.slug === project.slug ? "is-selected" : ""}
                aria-current={view === "project" && selected.slug === project.slug ? "page" : undefined}
                onClick={() => { selectProject(project); close(); }}
              >
                <i style={{ backgroundColor: projectTones[project.slug] ?? "#94a3b8" }} />
                <span>{project.title}</span>
              </button>
            ))}
          </section>
        </div>

        <footer className="aw-sidebar-footer">
          <button type="button" className="aw-search-trigger" onClick={openPalette}><span><Glyph name="search" /> {t("Search")}</span><kbd>⌘ K</kbd></button>
          <div className="aw-contact-links">
            <a href={"mailto:" + site.email}><MailIcon /> {t("Contact")}</a>
            <a href={site.cv} target="_blank" rel="noopener noreferrer"><FileIcon /> {t("Résumé")}</a>
          </div>
          <div className="aw-owner"><span className="aw-avatar">a.</span><span><strong>{t("Adjie Rizqan")}</strong><small>{t("Software · Systems · Research")}</small></span></div>
        </footer>
      </aside>
      {open && <button className="aw-drawer-scrim" type="button" onClick={close} aria-label={t("Close navigation")} />}
    </>
  );
}

function WorkspaceHeader({ eyebrow, title, copy, meta }: { eyebrow: string; title: string; copy: string; meta?: string }) {
  eyebrow = t(eyebrow); title = t(title); copy = t(copy);
  return (
    <header className="aw-page-header">
      <div><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
      {meta && <small>{meta}</small>}
    </header>
  );
}

// Work media: one readable, project-specific visual per case (crops from docs/design/v105/work_media.py or the
// project's own outputs). Projects uses the device thumbnails; Work shows the product itself, larger.
function WorkCase({ project, selectProject, lead = false }: { project: WorkspaceProject; selectProject: (project: WorkspaceProject) => void; lead?: boolean }) {
  const media = {src: project.thumb ?? project.image ?? "", alt: project.title};
  return (
    <button type="button" className={"aw-work-case" + (lead ? " is-lead" : "")} onClick={() => selectProject(project)}>
      <figure>{media && <Image src={media.src} alt={t(media.alt)} fill sizes={lead ? "(max-width: 1000px) 100vw, 900px" : "(max-width: 1000px) 100vw, 620px"} className="object-cover object-top" priority={lead} />}</figure>
      <section>
        <span>{project.eyebrow} · {project.year}{project.status ? " · " + project.status : ""}</span>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <strong>{t("Open case")} <Glyph name="arrow" /></strong>
      </section>
    </button>
  );
}

function WorkWorkspace({ selectProject }: { selectProject: (project: WorkspaceProject) => void }) {
  const [lead, ...rest] = featuredProjects();
  return (
    <main className="aw-center aw-work aw-enter">
      <WorkspaceHeader eyebrow={tk("Selected systems")} title={tk("Work")} copy={tk("Operational software and applied AI, organized around inspectable project evidence.")} meta={L("4 featured cases", "4 kasus unggulan")} />
      <div className="aw-work-cases">
        <WorkCase project={lead} selectProject={selectProject} lead />
        {rest.map((project) => <WorkCase key={project.slug} project={project} selectProject={selectProject} />)}
      </div>
      <section className="aw-work-lab" aria-labelledby="aw-work-lab-title">
        <h2 id="aw-work-lab-title">{t("From the lab")}</h2>
        <div>{labProjects().map((project) => <WorkCase key={project.slug} project={project} selectProject={selectProject} />)}</div>
      </section>
    </main>
  );
}

type ProjectViewProps = {
  project: WorkspaceProject;
  query: string;
  setQuery: (value: string) => void;
  ask: (value?: string) => void;
  back: () => void;
  openImage: (index: number, trigger: HTMLElement) => void;
};

function ProjectWorkspace({project, openImage, back, ask}: ProjectViewProps) {
 const props = {project,openImage};
 return <main className={"aw-center aw-project-detail aw-labstock-v2 aw-enter"}>
  <button type="button" className="aw-project-back" onClick={back}>← Work</button>
  <ProjectOpener project={project} />
  <div className="project-story">
  {project.slug === "labstock" ? <LabStockCaseStudy {...props}/> : project.slug === "suhulog" ? <SuhuLogStudy {...props}/> : project.slug === "bdrs" ? <BdrsStudy {...props}/> : project.slug === "tomato-ripeness" ? <TomatoStudy {...props}/> : <LabsStudy {...props}/>}
  <footer className="ls-ask"><span>Want to go deeper?</span><button type="button" onClick={()=>ask(project.askSuggestion)}>Ask AI about {project.title} ↗</button></footer>
  </div>
 </main>;
}

function ProjectDirectory({ projects, title, copy, selectProject }: {
  projects: WorkspaceProject[];
  title: string;
  copy: string;
  selectProject: (project: WorkspaceProject) => void;
}) {
  return (
    <main className="aw-center aw-directory aw-enter">
      <WorkspaceHeader eyebrow="Adjie Workspace" title={title} copy={copy} meta={L(`${projects.length} projects`, `${projects.length} proyek`)} />
      <div className="aw-project-objects">
        {projects.map((project) => (
          <button type="button" key={project.slug} onClick={() => selectProject(project)}>
            {project.thumb ?? project.image ? <figure><Image src={project.thumb ?? project.image ?? ""} alt={project.title} fill sizes="(max-width: 760px) 100vw, 480px" className="object-cover object-center" /></figure> : <div className="aw-object-evidence">{project.evidence.slice(0, 2).map((item) => <dl key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></dl>)}</div>}
            <section><span>{project.eyebrow}{project.status ? " · " + project.status : ""}</span><strong>{project.title}<Glyph name="arrow" /></strong><p>{project.summary}</p></section>
          </button>
        ))}
      </div>
    </main>
  );
}

function KnowledgeWorkspace({ selectProject }: { selectProject: (project: WorkspaceProject) => void }) {
  return (
    <main className="aw-center aw-knowledge aw-enter">
      <WorkspaceHeader eyebrow={tk("Public project record")} title={tk("Knowledge")} copy={tk("What each project can show, and where its public boundary sits. Open a row for the full case.")} meta={L(`${allProjects().length} projects`, `${allProjects().length} proyek`)} />
      <div className="aw-knowledge-list">
        {allProjects().map((project) => (
          <button type="button" key={project.slug} onClick={() => selectProject(project)} aria-label={L(`Open ${project.title}`, `Buka ${project.title}`)}>
            {project.thumb ?? project.image ? <figure><Image src={project.thumb ?? project.image ?? ""} alt="" fill sizes="(max-width: 760px) 100vw, 320px" className="object-cover object-center" /></figure> : <figure />}
            <div className="aw-knowledge-body">
              <span className="aw-knowledge-name"><strong>{project.title}</strong><small>{project.eyebrow} · {project.year}{project.status ? " · " + project.status : ""}</small></span>
              <dl>{project.evidence.slice(0, 3).map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
              <p className="aw-knowledge-boundary"><b>{t("Public boundary")}</b> {project.publicLimitations}</p>
            </div>
            <Glyph name="arrow" />
          </button>
        ))}
      </div>
    </main>
  );
}

const contextName = (projectId: string | null) => (projectId ? allProjects().find((project) => project.slug === projectId)?.title ?? projectId : t("General"));

// The project context the next question is asked in. A plain select: General or one project.
function AskContextBar({ context, setContext, busy }: { context: string | null; setContext: (projectId: string | null) => void; busy: boolean }) {
  return (
    <label className="aw-ask-context">
      <span>{t("Context")}</span>
      <select value={context ?? ""} onChange={(event) => setContext(event.target.value || null)} disabled={busy}>
        <option value="">{t("General")}</option>
        {allProjects().map((project) => <option key={project.slug} value={project.slug}>{project.title}</option>)}
      </select>
    </label>
  );
}

type AskRow = AskTurn & { live?: boolean };

function AskWorkspace({ query, setQuery, turns, current, answer, status, error, context, setContext, submit, stop, choose, openProjects }: {
  query: string;
  setQuery: (value: string) => void;
  turns: AskTurn[];
  current: { projectId: string | null; question: string } | null;
  answer: string | null;
  status: AskStatus;
  error: string | null;
  context: string | null;
  setContext: (projectId: string | null) => void;
  submit: () => void;
  stop: () => void;
  choose: (value: string) => void;
  openProjects: () => void;
}) {
  const active = status === "sending" || status === "streaming";
  const hasConversation = turns.length > 0 || current !== null || error !== null;
  const rows: AskRow[] = [...turns, ...(current ? [{ ...current, answer: answer ?? "", live: true }] : [])];
  const groups = groupTurns(rows);
  return (
    <main className={`aw-center aw-ask aw-enter ${hasConversation ? "is-conversation" : "is-empty"}`}>
      {!hasConversation ? (
        <section className="aw-ask-empty">
          <span>{t("Ask Adjie Workspace")}</span>
          <h1>{t("What would you like to understand?")}</h1>
          <p>{t("Answers use the verified public portfolio context.")}</p>
          <AskContextBar context={context} setContext={setContext} busy={active} />
          <Composer query={query} setQuery={setQuery} submit={submit} stop={stop} busy={active} />
          <div>{prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => choose(t(prompt.query))}>{t(prompt.label)}<Glyph name="arrow" /></button>)}</div>
        </section>
      ) : (
        <section className="aw-conversation">
          {groups.map((group, groupIndex) => (
            <div className="aw-ask-group" key={groupIndex}>
              {groupIndex > 0 && <p className="aw-ask-switch" role="separator"><span>{L(`Context switched to ${contextName(group.projectId)}`, `Konteks beralih ke ${contextName(group.projectId)}`)}</span></p>}
              <p className="aw-ask-label">{contextName(group.projectId)}{group.projectId && rawAll.some(p => p.slug === group.projectId) && <> · <a href={`/projects/${group.projectId}/`}>Open case study ↗</a></>}</p>
              {group.turns.map((turn, index) => (
                <div className="aw-ask-turn" key={index} data-project={turn.projectId ?? "general"}>
                  <div className="aw-message is-user"><span>{t("You")}</span><p>{turn.question}</p></div>
                  {turn.live
                    ? (answer !== null || active || error) && <div className="aw-message"><span>{t("Workspace")}{active ? " · " + t("responding") : ""}</span><p aria-live="polite">{answer || (active ? t("Thinking…") : error)}</p></div>
                    : <div className="aw-message"><span>{t("Workspace")}</span><p>{turn.answer}</p></div>}
                </div>
              ))}
            </div>
          ))}
          {error && <div className="aw-result-list"><button type="button" onClick={openProjects}><span><strong>{t("Explore projects")}</strong><small>{t("Browse without AI")}</small></span><Glyph name="arrow" /></button><a href={site.cv} target="_blank" rel="noopener noreferrer"><span><strong>{t("Résumé")}</strong><small>{t("Open PDF")}</small></span><Glyph name="arrow" /></a><a href={"mailto:" + site.email}><span><strong>{t("Contact")}</strong><small>{t("Email Adjie")}</small></span><Glyph name="arrow" /></a></div>}
          <AskContextBar context={context} setContext={setContext} busy={active} />
          <Composer query={query} setQuery={setQuery} submit={submit} stop={stop} busy={active} />
        </section>
      )}
    </main>
  );
}

function CommandPalette({ open, close, setView, selectProject }: {
  open: boolean;
  close: () => void;
  setView: (view: WorkspaceView) => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  const paletteRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selectProjectStable = useCallback((project: WorkspaceProject) => selectProject(project), [selectProject]);
  const commands = useMemo(() => [
    { label: t("Go home"), run: () => setView("home") },
    { label: t("Browse featured work"), run: () => setView("work") },
    { label: t("Open projects"), run: () => setView("projects") },
    { label: t("Open Labs"), run: () => setView("labs") },
    { label: t("Open Knowledge"), run: () => setView("knowledge") },
    { label: t("Ask about Adjie"), run: () => setView("ask") },
    { label: t("Open résumé"), run: () => window.open(site.cv, "_blank", "noopener,noreferrer") },
    { label: t("Contact Adjie"), run: () => window.open("mailto:" + site.email, "_self") },
    ...allProjects().map((project) => ({ label: L(`Open ${project.title}`, `Buka ${project.title}`), run: () => selectProjectStable(project) })),
  ].filter((item) => item.label.toLowerCase().includes(filter.toLowerCase())), [filter, selectProjectStable, setView]);

  useEffect(() => {
    if (!open) return;
    paletteRef.current?.querySelector("button.is-active")?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  useEffect(() => {
    if (!open) return;
    const desktop = document.querySelector<HTMLElement>(".aw-desktop");
    const wasInert = desktop?.hasAttribute("inert") ?? false;
    desktop?.setAttribute("inert", "");
    return () => { if (!wasInert) desktop?.removeAttribute("inert"); };
  }, [open]);

  if (!open) return null;

  function run(index: number) {
    commands[index]?.run();
    close();
  }

  return createPortal(
    <div className="aw-palette-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section ref={paletteRef} className="aw-palette" role="dialog" aria-modal="true" aria-label={t("Command palette")} onKeyDown={(event) => {
        if (event.key === "Escape") { event.stopPropagation(); close(); }
        if (event.key !== "Tab") return;
        const controls = [...(paletteRef.current?.querySelectorAll<HTMLElement>("input, button") ?? [])];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}>
        <label><Glyph name="search" /><input autoFocus value={filter} onChange={(event) => { setFilter(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((value) => Math.min(value + 1, commands.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((value) => Math.max(value - 1, 0)); }
          if (event.key === "Enter") { event.preventDefault(); run(activeIndex); }
          if (event.key === "Escape") { event.stopPropagation(); close(); }
        }} placeholder={t("Search projects and actions…")} /></label>
        <div>{commands.map((command, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} aria-current={index === activeIndex ? "true" : undefined} key={command.label} onMouseEnter={() => setActiveIndex(index)} onClick={() => run(index)}>{command.label}<span>↵</span></button>)}</div>
      </section>
    </div>,
    document.body,
  );
}

// Theme: html[data-theme] is set before paint by app/layout.tsx; this reads and switches it.
const THEME_KEY = "aw-theme";
type Theme = "light" | "dark";
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const readTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const readThemeOnServer = (): Theme => "light";
function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* private mode: the choice lasts for this page */ }
}

// LabStock uses its canonical path; legacy workspace query links remain readable.
const URL_CHANGE_EVENT = "aw:urlchange";
function subscribeToUrl(onChange: () => void) {
  const historyChange = () => { markProjectHistoryNavigation(); onChange(); };
  window.addEventListener("popstate", historyChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", historyChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
}
const readProjectParam = () => window.location.pathname.match(/^\/projects\/([^/]+)\/?$/)?.[1] ?? new URLSearchParams(window.location.search).get("project");
function writeProjectParam(slug: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  url.pathname = slug ? `/projects/${slug}/` : "/";
  url.hash = "";
  if (url.href === window.location.href) return;
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

// Background music: CC0 ambient track (docs/design/audio-provenance.md). One player for the whole page.
// Playback starts only from the music button, including on return visits.
const MUSIC_SRC = "/audio/ambient-wilfredor-cc0.m4a";
const MUSIC_KEY = "aw-music";
const MUSIC_VOLUME_KEY = "aw-music-volume";
type MusicState = "off" | "on" | "blocked";
const music = { audio: null as HTMLAudioElement | null, state: "off" as MusicState, listeners: new Set<() => void>() };
const emitMusic = () => music.listeners.forEach((listener) => listener());
function musicAudio() {
  if (!music.audio) {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    let volume = 0.2;
    try { const saved = Number(localStorage.getItem(MUSIC_VOLUME_KEY)); if (saved > 0 && saved <= 1) volume = saved; else localStorage.setItem(MUSIC_VOLUME_KEY, String(volume)); } catch { /* default */ }
    audio.volume = volume;
    audio.onplay = () => { music.state = "on"; emitMusic(); };
    music.audio = audio;
  }
  return music.audio;
}
function playMusic(remember: boolean) {
  if (remember) { try { localStorage.setItem(MUSIC_KEY, "on"); } catch { /* ignore */ } }
  return musicAudio().play().then(() => true, () => { music.state = "blocked"; emitMusic(); return false; });
}
function stopMusic() {
  try { localStorage.setItem(MUSIC_KEY, "off"); } catch { /* ignore */ }
  music.audio?.pause();
  music.state = "off";
  emitMusic();
}
const subscribeToMusic = (onChange: () => void) => { music.listeners.add(onChange); return () => { music.listeners.delete(onChange); }; };
function useMusic() {
  return useSyncExternalStore(subscribeToMusic, () => music.state, () => "off" as MusicState);
}
function MusicButton({ className = "" }: { className?: string }) {
  const state = useMusic();
  const label = state === "on" ? t("Pause music") : state === "blocked" ? t("Resume music") : t("Play music");
  return <button type="button" className={"aw-music " + className + (state === "on" ? " is-playing" : state === "blocked" ? " is-waiting" : "")} onClick={() => (state === "on" ? stopMusic() : void playMusic(true))} aria-pressed={state === "on"} aria-label={label} title={label}><Glyph name="music" /></button>;
}

function AudioControls() {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  return <>
    <button type="button" className="aw-audio-trigger" aria-label="Audio settings" title="Audio settings" popoverTarget={id} onClick={event => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (panel.current) {
        panel.current.style.top = `${rect.bottom + 8}px`;
        panel.current.style.left = `${Math.max(8, Math.min(innerWidth - 232, rect.right - 224))}px`;
      }
    }}><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8h3l4-3v10l-4-3H3Z M13 7a5 5 0 0 1 0 6m3-8a8 8 0 0 1 0 10" /></svg></button>
    <div ref={panel} id={id} popover="auto" className="aw-audio-panel" role="group" aria-label="Audio settings">
      <div><span>Interface sounds</span><SoundButton /></div>
      <div><span>Ambient music</span><MusicButton /></div>
    </div>
  </>;
}

export function WorkspacePrototype({ initialProject = null }: { initialProject?: string | null }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; start: Point; origin: Point } | null>(null);
  const restorePositionRef = useRef<Point>({ x: 0, y: 0 });
  const quickLookReturnFocusRef = useRef<HTMLElement | null>(null);
  const paletteReturnFocusRef = useRef<HTMLElement | null>(null);
  const askAbortRef = useRef<AbortController | null>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [baseView, setBaseView] = useState<Exclude<WorkspaceView, "project">>("home");
  const urlProject = useSyncExternalStore(subscribeToUrl, readProjectParam, () => initialProject);
  const urlProjectValid = allProjects().some((project) => project.slug === urlProject);
  const view: WorkspaceView = urlProjectValid ? "project" : baseView;
  const selectedSlug = urlProjectValid && urlProject ? urlProject : "labstock";
  const setView = useCallback((next: WorkspaceView) => {
    if (next === "project") return;
    playUISound("tap");
    writeProjectParam(null);
    setBaseView(next);
  }, []);
  const [query, setQuery] = useState("");
  const [askTurns, setAskTurns] = useState<AskTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<{ projectId: string | null; question: string } | null>(null);
  const [askContext, setAskContext] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [askStatus, setAskStatus] = useState<AskStatus>("idle");
  const [askError, setAskError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, readThemeOnServer);
  useEffect(() => {
    const legacy = new URLSearchParams(window.location.search).get("project");
    if (legacy && rawAll.some(p => p.slug === legacy)) {
      window.history.replaceState(null, "", `/projects/${legacy}/`);
      window.dispatchEvent(new Event(URL_CHANGE_EVENT));
    }
  }, []);
  const [windowState, setWindowState] = useState<WindowState>("open");
  const [maximized, setMaximized] = useState(false);
  const [quickLookIndex, setQuickLookIndex] = useState<number | null>(null);
  const [projectRevision, setProjectRevision] = useState(0);

  const selected = allProjects().find((project) => project.slug === selectedSlug) ?? featuredProjects()[0];
  const quickLookImages = useMemo<QuickLookImage[]>(() => [
    ...(selected.image ? [{ src: selected.image, caption: selected.title }] : []),
    ...(selected.gallery ?? []),
  ], [selected]);

  useEffect(() => {
    const project = rawAll.find(p => p.slug === urlProject);
    const title = project ? `${project.title} — Adjie Rizqan` : "Adjie Rizqan — Software Engineer";
    const url = `https://adjierizqan.github.io${project ? `/projects/${project.slug}/` : "/"}`;
    document.title = title;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    const description = project?.summary ?? "Explore Adjie Rizqan's operational software and applied AI work inside Adjie Workspace.";
    for (const [selector, value] of [["meta[name='description']", description], ["meta[property='og:title']", title], ["meta[property='og:description']", description], ["meta[property='og:url']", url], ["meta[name='twitter:title']", title], ["meta[name='twitter:description']", description], ["meta[property='og:image']", `https://adjierizqan.github.io${project?.socialImage ?? "/projects/labstock/thumb-reset-a.jpg"}`], ["meta[name='twitter:image']", `https://adjierizqan.github.io${project?.socialImage ?? "/projects/labstock/thumb-reset-a.jpg"}`]]) document.querySelector(selector)?.setAttribute("content", value);
  }, [urlProject]);

  const openPalette = useCallback(() => {
    paletteReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    playUISound("open");
    setPaletteOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    playUISound("close");
    setPaletteOpen(false);
    window.requestAnimationFrame(() => paletteReturnFocusRef.current?.focus());
  }, []);

  useEffect(() => {
    document.body.classList.add("workspace-active");
    return () => document.body.classList.remove("workspace-active");
  }, []);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (paletteOpen) closePalette();
        else openPalette();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        askAbortRef.current?.abort();
        setView("home");
        setQuery("");
        setAskTurns([]);
        setCurrentTurn(null);
        setAskContext(null);
        setAnswer(null);
        setAskStatus("idle");
        setAskError(null);
      }
      if (event.key === "Escape") {
        if (paletteOpen) closePalette();
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePalette, openPalette, paletteOpen, setView]);

  useEffect(() => {
    function resetForViewport() {
      setPosition({ x: 0, y: 0 });
    }
    window.addEventListener("resize", resetForViewport);
    return () => window.removeEventListener("resize", resetForViewport);
  }, []);

  const selectProject = useCallback((project: WorkspaceProject) => {
    playUISound("open");
    requestProjectIntro(project.slug);
    withViewTransition(() => {
      writeProjectParam(project.slug);
      setQuickLookIndex(null);
      setProjectRevision((value) => value + 1);
    });
  }, []);

  function openQuickLook(index: number, trigger: HTMLElement) {
    if (!quickLookImages[index]) return;
    playUISound("open");
    quickLookReturnFocusRef.current = trigger;
    setQuickLookIndex(index);
  }

  const closeQuickLook = useCallback(() => {
    playUISound("close");
    setQuickLookIndex(null);
    window.requestAnimationFrame(() => quickLookReturnFocusRef.current?.focus());
  }, []);

  const navigateQuickLook = useCallback((direction: number) => {
    setQuickLookIndex((current) => current === null ? null : Math.min(Math.max(current + direction, 0), quickLookImages.length - 1));
  }, [quickLookImages.length]);

  function newSession() {
    askAbortRef.current?.abort();
    setView("home");
    setQuery("");
    setAskTurns([]);
    setCurrentTurn(null);
    setAskContext(null);
    setAnswer(null);
    setAskStatus("idle");
    setAskError(null);
  }

  function stopAsk() {
    askAbortRef.current?.abort();
  }

  // Every turn is asked in one context (a project slug, or null for General) and keeps it afterwards.
  async function runAsk(value: string, projectId: string | null) {
    const clean = value.trim();
    if (!clean || askStatus === "sending" || askStatus === "streaming") return;
    const turns = currentTurn && answer ? [...askTurns, { ...currentTurn, answer }] : askTurns;
    const priorHistory = contextHistory(turns, projectId);
    const controller = new AbortController();
    askAbortRef.current = controller;
    setAskTurns(turns);
    setAskContext(projectId);
    setCurrentTurn({ projectId, question: clean });
    setQuery("");
    setAnswer("");
    setAskError(null);
    setAskStatus("sending");
    setView("ask");

    let partial = "";
    try {
      const completed = await streamPortfolioAnswer({
        message: clean,
        projectId: projectId ?? undefined,
        history: priorHistory,
        signal: controller.signal,
        onToken(token) {
          partial += token;
          setAnswer(partial);
          setAskStatus("streaming");
        },
      });
      if (!completed.trim()) throw new Error("Empty AI response");
      setAnswer(completed);
      setAskStatus("complete");
    } catch {
      if (controller.signal.aborted) {
        setAnswer(partial || null);
        setAskStatus(partial ? "complete" : "idle");
      } else {
        setAnswer(partial || null);
        setAskError(t("Adjie AI is temporarily unavailable. You can still explore the projects directly."));
        setAskStatus("error");
      }
    } finally {
      if (askAbortRef.current === controller) askAbortRef.current = null;
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (window.innerWidth < 1100 || maximized || event.button !== 0 || (event.target as HTMLElement).closest("[data-no-drag]")) return;
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

  function toggleMaximize() {
    if (window.innerWidth < 1100) return;
    if (maximized) {
      setMaximized(false);
      setPosition(restorePositionRef.current);
    } else {
      restorePositionRef.current = position;
      setPosition({ x: 0, y: 0 });
      setMaximized(true);
      setWindowState("open");
    }
  }

  function openWorkspace(nextView?: WorkspaceView) {
    if (nextView) setView(nextView);
    setWindowState("open");
  }

  const windowTransform = "translate3d(" + position.x + "px, " + position.y + "px, 0)" + (windowState === "open" ? " scale(1)" : " scale(.94)");

  return (
    <div className="aw-desktop">
      <div className="aw-wallpaper" aria-hidden="true" />
      <div
        ref={windowRef}
        className={"aw-window " + (dragging ? "is-dragging " : "") + (maximized ? "is-maximized " : "") + (windowState === "minimized" ? "is-hidden is-minimized " : windowState === "closed" ? "is-hidden is-closed " : "")}
        style={{ transform: windowTransform }}
        aria-hidden={windowState !== "open"}
      >
        <header
          className="aw-titlebar"
          data-drag-handle
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("[data-no-drag]")) toggleMaximize(); }}
        >
          <div className="aw-traffic" aria-label={t("Window controls")} data-no-drag>
            <button type="button" className="is-close" onClick={() => setWindowState("closed")} aria-label={t("Close workspace")} title={t("Close")} />
            <button type="button" className="is-minimize" onClick={() => setWindowState("minimized")} aria-label={t("Minimize workspace")} title={t("Minimize")} />
            <button type="button" className="is-maximize" onClick={toggleMaximize} aria-label={maximized ? t("Restore workspace") : t("Maximize workspace")} title={maximized ? t("Restore") : t("Maximize")} />
          </div>
          <div className="aw-title-actions" data-no-drag>
            <span>{t("Software · Systems · Research")}</span>
            <button type="button" onClick={openPalette}><kbd>⌘ K</kbd></button>

            <AudioControls />
            <button type="button" className="aw-appearance" onClick={() => { playUISound("tap"); setTheme(theme === "dark" ? "light" : "dark"); }} aria-pressed={theme === "dark"} aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")} title={theme === "dark" ? t("Light mode") : t("Dark mode")}><Glyph name={theme === "dark" ? "sun" : "moon"} /></button>
            <span className="aw-avatar">a.</span>
          </div>
        </header>

        <div className="aw-body">
          <Sidebar view={view} selected={selected} setView={setView} newSession={newSession} selectProject={selectProject} openPalette={openPalette} open={sidebarOpen} close={() => setSidebarOpen(false)} />

          <section className="aw-stage">
            <header className="aw-mobile-header">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label={t("Open navigation")}><Glyph name="menu" /></button>
              <strong>{t("Adjie Workspace")}</strong>

              <AudioControls />
              <button type="button" className="aw-mobile-theme" onClick={() => { playUISound("tap"); setTheme(theme === "dark" ? "light" : "dark"); }} aria-pressed={theme === "dark"} aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}><Glyph name={theme === "dark" ? "sun" : "moon"} /></button>
            </header>
            {view === "home" ? <WorkspaceHome selectProject={selectProject} openAsk={() => setView("ask")} busy={askStatus === "sending" || askStatus === "streaming"} askQuestion={(question) => void runAsk(question, null)} composer={<Composer suggestions={false} query={query} setQuery={setQuery} submit={() => void runAsk(query, null)} busy={askStatus === "sending" || askStatus === "streaming"} stop={stopAsk} />} />
              : view === "work" ? <WorkWorkspace selectProject={selectProject} />
                : view === "projects" ? <ProjectDirectory projects={allProjects()} title={tk("Projects")} copy={tk("A single workspace index for featured systems and focused experiments.")} selectProject={selectProject} />
                  : view === "labs" ? <ProjectDirectory projects={labProjects()} title={tk("Labs")} copy={tk("Focused experiments in computer vision, 3D pipelines, and interactive systems.")} selectProject={selectProject} />
                    : view === "knowledge" ? <KnowledgeWorkspace selectProject={selectProject} />
                      : view === "project" ? <ProjectWorkspace key={selected.slug + "-" + projectRevision} project={selected} query={query} setQuery={setQuery} ask={(question) => void runAsk(question ?? query, selected.slug)} back={() => setView("work")} openImage={openQuickLook} />
                        : <AskWorkspace query={query} setQuery={setQuery} turns={askTurns} current={currentTurn} answer={answer} status={askStatus} error={askError} context={askContext} setContext={setAskContext} submit={() => void runAsk(query, askContext)} stop={stopAsk} choose={(question) => void runAsk(question, askContext)} openProjects={() => setView("projects")} />}
          </section>
        </div>
      </div>

      <nav className="aw-dock" aria-label={t("Workspace dock")}>
        {([
          { label: tk("Workspace"), icon: "home", view: undefined },
          { label: tk("Work"), icon: "work", view: "work" },
          { label: tk("Projects"), icon: "projects", view: "projects" },
          { label: tk("Labs"), icon: "labs", view: "labs" },
          { label: tk("Ask"), icon: "ask", view: "ask" },
        ] as { label: string; icon: "home" | "work" | "projects" | "labs" | "ask"; view?: WorkspaceView }[]).map((item) => {
          const active = windowState === "open" && (item.view ? view === item.view : view === "home");
          const open = item.label === "Workspace" && windowState !== "closed";
          return <button type="button" className={(active ? "is-active " : "") + (open ? "is-open " : "") + (item.label === "Workspace" && windowState === "minimized" ? "is-minimized" : "")} key={item.label} onClick={() => openWorkspace(item.view)} aria-label={t(item.label)}><Glyph name={item.icon} /><span className="aw-dock-tooltip" role="tooltip">{t(item.label)}</span><i /></button>;
        })}
      </nav>

      {paletteOpen && <CommandPalette open close={closePalette} setView={setView} selectProject={selectProject} />}
      {quickLookIndex !== null && <QuickLook images={quickLookImages} index={quickLookIndex} close={closeQuickLook} navigate={navigateQuickLook} />}
    </div>
  );
}
