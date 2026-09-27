"use client";

import Image from "next/image";
import { createPortal, flushSync } from "react-dom";
import {
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { FileIcon, MailIcon } from "@/components/Icons";
import { TomatoVisionStory } from "@/components/tomatovision/TomatoVisionStory";
import { PadelAnalytics } from "@/components/padel/PadelAnalytics";
import { L, t, tk, setActiveLocale, setLocale, subscribeToLocale, readLocale, readLocaleOnServer, type Locale } from "@/lib/i18n";
import { localizeProject } from "@/lib/localize-project";
import { ProductEvidence, type EvidenceFrame } from "@/components/evidence/ProductEvidence";
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

const pronunciationTrack: string | null = null;

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
  return <svg viewBox="0 0 20 20" aria-hidden="true">{paths[name]}</svg>;
}

function PronunciationButton({ className = "" }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    const audio = audioRef.current;
    if (!pronunciationTrack || !audio) return;
    audio.currentTime = 0;
    void audio.play();
  }

  return (
    <button className={className + (playing ? " is-playing" : "")} type="button" onClick={play} disabled={!pronunciationTrack} title={pronunciationTrack ? t("Hear name pronunciation") : t("Pronunciation audio is not yet available")} aria-label={pronunciationTrack ? t("Play Adjie Rizqan name pronunciation") : t("Pronunciation audio unavailable")}>
      {pronunciationTrack && <audio ref={audioRef} src={pronunciationTrack} onPlay={() => setPlaying(true)} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} preload="none" />}
      <Glyph name="speaker" />
      <span className="aw-audio-response" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}

function QuickLook({ images, index, close, navigate }: {
  images: QuickLookImage[];
  index: number;
  close: () => void;
  navigate: (direction: number) => void;
}) {
  const image = images[index];
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const desktop = document.querySelector<HTMLElement>(".aw-desktop");
    const wasInert = desktop?.hasAttribute("inert") ?? false;
    const previousOverflow = document.body.style.overflow;
    desktop?.setAttribute("inert", "");
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") close();
      if (index > 0 && event.key === "ArrowLeft") navigate(-1);
      if (index < images.length - 1 && event.key === "ArrowRight") navigate(1);
      if (event.key === "Tab") {
        const controls = [...(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
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
      <section ref={dialogRef} className="aw-quicklook" role="dialog" aria-modal="true" aria-label={t("Project image viewer")}>
        <header><span>{index + 1} / {images.length}</span><p>{image.caption}</p><button type="button" autoFocus onClick={close} aria-label={t("Close image viewer")}><Glyph name="close" /></button></header>
        <div className="aw-quicklook-image" key={image.src}><Image src={image.src} alt={image.caption} fill sizes="100vw" quality={95} className="object-contain" priority /></div>
        {index > 0 && <button type="button" className="aw-quicklook-nav is-previous" onClick={() => navigate(-1)} aria-label={t("Previous image")}><Glyph name="arrow" /></button>}
        {index < images.length - 1 && <button type="button" className="aw-quicklook-nav is-next" onClick={() => navigate(1)} aria-label={t("Next image")}><Glyph name="arrow" /></button>}
      </section>
    </div>,
    document.body,
  );
}

function Composer({ query, setQuery, submit, stop, busy = false, placeholder }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  stop?: () => void;
  busy?: boolean;
  placeholder?: string;
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
        <div>
          <button type="button" aria-label={t("Add project context")}><Glyph name="plus" /></button>
          <button type="button" onClick={() => setQuery(t("Show me Adjie’s operational systems."))}><Glyph name="search" /> {t("Projects")}</button>
          <button type="button" onClick={() => setQuery(t("What evidence is available for Adjie’s work?"))}><Glyph name="book" /> {t("Evidence")}</button>
          <button type="button" onClick={() => setQuery(t("How does Adjie approach reliability?"))}><Glyph name="spark" /> {t("Build notes")}</button>
        </div>
        <div className="aw-composer-submit"><span>{t("Adjie AI · Preview")}</span><button className="aw-send" type="button" onClick={busy ? stop : submit} disabled={busy ? !stop : !query.trim()} aria-label={busy ? t("Stop response") : t("Send query")}><Glyph name={busy ? "close" : "send"} /></button></div>
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
            <span className="aw-avatar is-light">AR</span>
            <span><strong>{t("Adjie Rizqan")}</strong><small>{t("Personal AI Workspace")}</small></span>
            <PronunciationButton className="aw-pronounce" />
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
          <button type="button" className="aw-search-trigger" onClick={openPalette}><span><Glyph name="search" /> {t("Search")}</span><kbd>⌘ K</kbd></button>
          <div className="aw-contact-links">
            <a href={"mailto:" + site.email}><MailIcon /> {t("Contact")}</a>
            <a href={site.cv} target="_blank" rel="noopener noreferrer"><FileIcon /> {t("Résumé")}</a>
          </div>
          <div className="aw-owner"><span className="aw-avatar">AR</span><span><strong>{t("Adjie Rizqan")}</strong><small>{t("Build · Solve · Improve")}</small></span></div>
        </footer>
      </aside>
      {open && <button className="aw-drawer-scrim" type="button" onClick={close} aria-label={t("Close navigation")} />}
    </>
  );
}

function HomeWorkspace({ query, setQuery, submit, ask, setView, selectProject }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  ask: (question: string) => void;
  setView: (view: WorkspaceView) => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  const suggestions = [
    { label: tk("Explore my projects"), prompt: tk("What are Adjie’s main projects?"), icon: "work" as const },
    { label: tk("How does SuhuLog work?"), prompt: tk("How does SuhuLog work?"), icon: "ask" as const },
    { label: tk("Show applied AI work"), prompt: tk("What applied AI and computer vision work has Adjie done?"), icon: "spark" as const },
    { label: tk("Show verified evidence"), prompt: tk("What evidence is available for Adjie’s work?"), icon: "book" as const },
  ];

  return (
    <main className="aw-center aw-home aw-enter">
      <section className="aw-identity">
        <div>
          <span>{t("Good evening,")}</span>
          <div className="aw-name"><h1>{t("Adjie Rizqan")}</h1><PronunciationButton /></div>
          <p>{t("Turn ideas into useful systems.")}</p>
        </div>
        <blockquote>{t("“A more capable me,")}<br />{t("for a more useful tomorrow.”")}</blockquote>
      </section>

      <div className="aw-focus-tags">
        {["Software Engineering", "Applied AI", tk("Healthcare Systems"), "Computer Vision", tk("Automation")].map((tag) => <span key={tag}>{t(tag)}</span>)}
      </div>

      <Composer query={query} setQuery={setQuery} submit={submit} />

      <section className="aw-suggestions" aria-label={t("Suggested questions")}>
        <h2>{t("Try asking")}</h2>
        <div>{suggestions.map((item) => (
          <button type="button" key={item.label} onClick={() => ask(t(item.prompt))}>
            <span><Glyph name={item.icon} /></span>
            <strong>{t(item.label)}</strong>
            <Glyph name="arrow" />
          </button>
        ))}</div>
      </section>

      <section className="aw-recent">
        <header><div><strong>{t("Recent work")}</strong><span><button className="is-active" type="button">{t("Featured")}</button><button type="button" onClick={() => setView("work")}>{t("Systems")}</button><button type="button" onClick={() => setView("labs")}>{t("Labs")}</button></span></div><button type="button" onClick={() => setView("work")}>{t("View all")} <Glyph name="arrow" /></button></header>
        <div>
          {featuredProjects().map((project) => (
            <button type="button" key={project.slug} onClick={() => selectProject(project)}>
              <span className="aw-recent-identity"><strong>{project.title}</strong><small>{project.eyebrow}{project.status ? " · " + project.status : ""}</small></span>
              <p>{project.summary}</p>
              <Glyph name="arrow" />
            </button>
          ))}
        </div>
      </section>
    </main>
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
const WORK_MEDIA: Record<string, { src: string; alt: string }> = {
  labstock: { src: "/projects/labstock/work.webp", alt: tk("LabStock Today screen: items needing action and today's stock movements, demo data") },
  bdrs: { src: "/projects/bdrs/work.webp", alt: tk("BDRS patient workstation: blood request, cross-match step and service workflow, demo data") },
  suhulog: { src: "/projects/suhulog/device-story.webp", alt: tk("SuhuLog on phone for entry and on desktop for monitoring, demo data") },
  "tomato-ripeness": { src: "/projects/tomato-ripeness/research/thumb.webp", alt: tk("The same tomato plant: YOLOv11 baseline next to three-model WBF detections") },
  "padel-vision": { src: "/projects/padel-vision/analytics/thumb.webp", alt: tk("Padel Vision frame: player boxes, IDs, ball and a marked hit on a real rally") },
  "porsche-3d": { src: "/projects/porsche-3d/cinematic/01-rwb964-hero.webp", alt: tk("RWB 964 render from the Porsche 3D configurator") },
};

function WorkCase({ project, selectProject, lead = false }: { project: WorkspaceProject; selectProject: (project: WorkspaceProject) => void; lead?: boolean }) {
  const media = WORK_MEDIA[project.slug];
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

const PROJECT_DEMO_PROMPTS: Record<string, string> = {
  labstock: tk("Give me a short overview of LabStock: the problem, the solution, the main features, and where it stands now."),
  bdrs: tk("What has been built in BDRS, and what is still in development or planning?"),
  suhulog: tk("How does SuhuLog turn temperature logging into a fast workflow that stays auditable?"),
  "tomato-ripeness": tk("What did TomatoVision test, and what do the evaluation results actually show?"),
  "padel-vision": tk("How does Padel Vision turn one broadcast camera into an inspectable match-analysis pipeline?"),
  "porsche-3d": tk("How was Porsche 3D built as a real-time WebGL interaction study?"),
};

function useProjectPresentation(prompt: string) {
  const projectViewportRef = useRef<HTMLElement>(null);
  const presentationTimersRef = useRef<{ start?: number; typing?: number; reveal?: number; streaming?: number }>({});
  const [typedPrompt, setTypedPrompt] = useState("");
  const [responseVisible, setResponseVisible] = useState(false);
  const [responseProgress, setResponseProgress] = useState(0);

  const clearPresentationTimers = useCallback(() => {
    const { start, typing, reveal, streaming } = presentationTimersRef.current;
    if (start !== undefined) window.clearTimeout(start);
    if (typing !== undefined) window.clearInterval(typing);
    if (reveal !== undefined) window.clearTimeout(reveal);
    if (streaming !== undefined) window.clearInterval(streaming);
    presentationTimersRef.current = {};
  }, []);

  const runPresentation = useCallback((scrollToTop = false) => {
    clearPresentationTimers();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (scrollToTop) projectViewportRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });

    if (reducedMotion) {
      setTypedPrompt(prompt);
      setResponseVisible(true);
      setResponseProgress(1);
      return;
    }

    setTypedPrompt("");
    setResponseVisible(false);
    setResponseProgress(0);
    let nextLength = 0;
    presentationTimersRef.current.typing = window.setInterval(() => {
      nextLength += 1;
      setTypedPrompt(prompt.slice(0, nextLength));
      if (nextLength >= prompt.length) {
        if (presentationTimersRef.current.typing !== undefined) {
          window.clearInterval(presentationTimersRef.current.typing);
          presentationTimersRef.current.typing = undefined;
        }
        presentationTimersRef.current.reveal = window.setTimeout(() => {
          setResponseVisible(true);
          const startedAt = performance.now();
          const duration = 4000;
          setResponseProgress(.001);
          presentationTimersRef.current.streaming = window.setInterval(() => {
            const progress = Math.min((performance.now() - startedAt) / duration, 1);
            setResponseProgress(progress);
            if (progress >= 1 && presentationTimersRef.current.streaming !== undefined) {
              window.clearInterval(presentationTimersRef.current.streaming);
              presentationTimersRef.current.streaming = undefined;
            }
          }, 40);
          presentationTimersRef.current.reveal = undefined;
        }, 440);
      }
    }, 18);
  }, [clearPresentationTimers, prompt]);

  useEffect(() => {
    presentationTimersRef.current.start = window.setTimeout(() => runPresentation(), 0);
    return clearPresentationTimers;
  }, [clearPresentationTimers, runPresentation]);

  return { projectViewportRef, typedPrompt, responseVisible, responseProgress, runPresentation };
}

function StreamingText({ text, progress, start, end }: { text: string; progress: number; start: number; end: number }) {
  if (progress < start) return null;
  const localProgress = Math.min(Math.max((progress - start) / (end - start), 0), 1);
  const visibleLength = Math.max(1, Math.ceil(text.length * localProgress));
  const streaming = localProgress < 1;
  return <>{text.slice(0, visibleLength)}{streaming && <span className="aw-response-caret" aria-hidden="true" />}</>;
}

function ProjectSession({ prompt, typedPrompt, replay, title }: {
  prompt: string;
  typedPrompt: string;
  replay: () => void;
  title: string;
}) {
  return (
    <section className="aw-project-session" aria-label={L(`${title} scripted project prompt`, `Prompt proyek ${title}`)}>
      <header>
        <div><i /><span>{t("You · prompt")}</span><small>{t("Project opener")}</small></div>
        <button type="button" onClick={replay} aria-label={L(`Replay ${title} project presentation`, `Putar ulang presentasi ${title}`)}>{t("↻ Replay Demo")}</button>
      </header>
      <div className="aw-session-query">
        <span aria-hidden="true">Q</span>
        <div>
          <small>{t("Project query")}</small>
          <p aria-label={prompt}>{typedPrompt}{typedPrompt.length < prompt.length && <span className="aw-typing-caret" aria-hidden="true" />}</p>
        </div>
      </div>
    </section>
  );
}

function ProjectOpening({ project, action }: { project: WorkspaceProject; action?: { label: string; run: () => void } }) {
  return (
    <>
      <header className="aw-dossier-header">
        <div className="aw-dossier-heading">
          <div><span>{project.eyebrow}</span>{project.status && <small>{project.status}</small>}</div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
        </div>
        {action && <div className="aw-dossier-actions"><button type="button" onClick={action.run}>{action.label}</button></div>}
      </header>
      <dl className="aw-dossier-metadata" aria-label={project.title + " project metadata"}>
        <div><dt>{t("Role")}</dt><dd>{project.role}</dd></div>
        {project.stack.length > 0 && <div><dt>{t("Stack")}</dt><dd>{project.stack.join(" · ")}</dd></div>}
        <div><dt>{t("Project record")}</dt><dd>{project.year}{project.status ? " · " + project.status : ""}</dd></div>
      </dl>
    </>
  );
}

function EvidenceTable({ project, visibleRows = project.evidence.length }: { project: WorkspaceProject; visibleRows?: number }) {
  return (
    <div className="aw-evidence-table-wrap">
      <table className="aw-evidence-table">
        <thead><tr><th scope="col">{t("Behavior")}</th><th scope="col">{t("Public evidence")}</th></tr></thead>
        <tbody>{project.evidence.slice(0, visibleRows).map((item) => <tr className="aw-stream-structure" key={item.label}><th scope="row">{item.label}</th><td>{item.value}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function ProjectAsk({ project, query, setQuery, ask }: Pick<ProjectViewProps, "project" | "query" | "setQuery" | "ask">) {
  return (
    <section className="aw-project-ask aw-editorial-ask">
      <header><span>{L(`Ask about ${project.title}`, `Tanya tentang ${project.title}`)}</span><button type="button" onClick={() => ask(project.askSuggestion)}>{t("Use suggested question")}</button></header>
      <Composer query={query} setQuery={setQuery} submit={() => ask()} placeholder={L(`Ask anything about ${project.title}…`, `Tanya apa saja tentang ${project.title}…`)} />
    </section>
  );
}

function ProjectMedia({ project, openImage, lead = false }: Pick<ProjectViewProps, "project" | "openImage"> & { lead?: boolean }) {
  if (!project.image) return null;
  return (
    <section className={lead ? "aw-editorial-media is-lead" : "aw-editorial-media"} aria-label={project.title + " public project media"}>
      <button type="button" className="aw-editorial-media-lead" onClick={(event) => openImage(0, event.currentTarget)} aria-label={"Quick Look: " + project.title + " project view"}>
        <Image src={project.image} alt={project.title + " public project view"} fill sizes="(max-width: 760px) 100vw, 1000px" className="object-cover object-top" />
        <span>{t("Open in Quick Look")}</span>
      </button>
      {project.gallery && project.gallery.length > 0 && <div className="aw-editorial-gallery">{project.gallery.map((item, index) => <figure key={item.src}><button type="button" onClick={(event) => openImage(index + 1, event.currentTarget)} aria-label={"Quick Look: " + item.caption}><Image src={item.src} alt={item.caption} fill sizes="(max-width: 760px) 90vw, 300px" className="object-cover object-top" /></button><figcaption>{item.caption}</figcaption></figure>)}</div>}
    </section>
  );
}

type PorscheFrame = { src: string; label: string; quickIndex: number };
const porscheCinematic = "/projects/porsche-3d/cinematic/";

function PorscheSequence({ openImage }: Pick<ProjectViewProps, "openImage">) {
  const views: { label: string; note: string; frames?: PorscheFrame[]; video?: string }[] = [
    { label: tk("Model"), note: tk("The RWB 964 in the site's studio set."), frames: [{ src: porscheCinematic + "01-rwb964-hero.webp", label: tk("911 RWB (964)"), quickIndex: 0 }] },
    { label: tk("Profile"), note: tk("918 Spyder Weissach in its Martini livery, side on."), frames: [{ src: porscheCinematic + "02-918-profile.webp", label: tk("918 Spyder"), quickIndex: 1 }] },
    { label: tk("Line-up"), note: tk("All six models from the site in one scene."), frames: [{ src: porscheCinematic + "03-lineup.webp", label: tk("Six models"), quickIndex: 2 }] },
    { label: tk("Camera"), note: tk("The site's switch transition: one car turns away, the next arrives."), video: porscheCinematic + "04-transition.mp4" },
    { label: tk("Material"), note: tk("One car, three finishes from the configurator."), frames: [
      { src: porscheCinematic + "05-gt3-metallic.webp", label: tk("GT Silver · metallic"), quickIndex: 3 },
      { src: porscheCinematic + "05-gt3-gloss.webp", label: tk("Guards Red · gloss"), quickIndex: 4 },
      { src: porscheCinematic + "05-gt3-matte.webp", label: tk("Jet Black · matte"), quickIndex: 5 },
    ] },
    { label: tk("Detail"), note: tk("Close range on the RWB 964."), frames: [
      { src: porscheCinematic + "06-rwb964-wheel.webp", label: tk("Wheel and brake"), quickIndex: 6 },
      { src: porscheCinematic + "06-rwb964-wing.webp", label: tk("Rear wing"), quickIndex: 7 },
      { src: porscheCinematic + "06-rwb964-light.webp", label: tk("Headlights"), quickIndex: 8 },
    ] },
  ];
  const [active, setActive] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const current = views[active];
  const frame = current.frames?.[Math.min(frameIndex, current.frames.length - 1)];
  return (
    <section className="aw-porsche-sequence" aria-label={t("Porsche 3D renders")}>
      <header><span>{t("Rendered from the site's own Three.js scene")}</span><small>{String(active + 1).padStart(2, "0")} / {String(views.length).padStart(2, "0")}</small></header>
      <div className="aw-porsche-stage">
        {frame ? <button type="button" onClick={(event) => openImage(frame.quickIndex, event.currentTarget)} aria-label={"Quick Look: " + t(frame.label)}><span key={frame.src}><Image src={frame.src} alt={t(frame.label)} fill sizes="(max-width: 760px) 100vw, 1100px" className="object-cover object-center" priority={active === 0} /></span></button>
          : <video key={current.video} controls playsInline preload="metadata" poster={porscheCinematic + "04-transition-poster.webp"} aria-label={t("Porsche 3D model switch transition")}><source src={current.video} type="video/mp4" /></video>}
      </div>
      <div className="aw-porsche-caption">
        <p><strong>{t(frame?.label ?? current.label)}</strong> {t(current.note)}</p>
        {current.frames && current.frames.length > 1 && <div role="group" aria-label={t(current.label)}>{current.frames.map((item, index) => <button type="button" aria-pressed={frameIndex === index} key={item.src} onClick={() => setFrameIndex(index)}>{t(item.label)}</button>)}</div>}
      </div>
      <div className="aw-porsche-controls" role="tablist" aria-label={t("Porsche 3D views")}>{views.map((view, index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} key={view.label} onClick={() => { setActive(index); setFrameIndex(0); }}><small>{String(index + 1).padStart(2, "0")}</small><strong>{t(view.label)}</strong></button>)}</div>
    </section>
  );
}

function ProjectMetaLine({ project }: { project: WorkspaceProject }) {
  return <dl className="aw-project-meta-line" aria-label={project.title + " project metadata"}><div><dt>{t("Role")}</dt><dd>{project.role}</dd></div>{project.stack.length > 0 && <div><dt>{t("Built with")}</dt><dd>{project.stack.join(" · ")}</dd></div>}<div><dt>{t("Record")}</dt><dd>{project.year}{project.status ? " · " + project.status : ""}</dd></div></dl>;
}

function LabStockSystemCanvas() {
  return (
    <section className="aw-labstock-canvas" id="labstock-data-flow" aria-label={t("LabStock source to export system map")}>
      <header><span>{t("One traceable path")}</span><h2>{t("Workbook evidence enters once. Every report leaves from the same ledger.")}</h2></header>
      <div className="aw-ledger-map">
        <div className="aw-ledger-source"><small>{t("Source")}</small><strong>{t("Monthly workbook")}</strong><span>{t("file · sheet · row · period")}</span></div>
        <div className="aw-ledger-gate"><small>{t("Validate")}</small><strong>{t("Identity + unit + overlap")}</strong><span>{t("conflicts stop before posting")}</span></div>
        <div className="aw-ledger-core"><i /><small>{t("Canonical record")}</small><strong>{t("Stock ledger")}</strong><span>{t("one effective item identity")}</span></div>
        <div className="aw-ledger-output"><small>{t("Read")}</small><strong>{t("Monthly / yearly report")}</strong><span>{t("same stored movements")}</span></div>
        <div className="aw-ledger-export"><small>{t("Deliver")}</small><strong>{t("Detail + recap Excel")}</strong><span>{t("template-compatible output")}</span></div>
      </div>
      <div className="aw-ledger-rules"><p><b>{t("Same source returns")}</b><span>{t("Recognized before posting")}</span><strong>{t("No duplicate movement")}</strong></p><p><b>{t("A correction is needed")}</b><span>{t("Prior record stays traceable")}</span><strong>{t("Auditable supersession")}</strong></p><p><b>{t("A report is exported")}</b><span>{t("Website and workbook read one ledger")}</span><strong>{t("Consistent balance")}</strong></p></div>
    </section>
  );
}

function BdrsOperationalMap({ project }: { project: WorkspaceProject }) {
  const lanes = [
    { state: tk("Implemented"), title: project.evidence[0]?.value ?? "Workflow structure", detail: tk("Operational work is organized around the domain flow.") },
    { state: tk("Current"), title: project.evidence[1]?.value ?? "Evidence review", detail: tk("Technical and release evidence remains under review.") },
    { state: tk("Planned / withheld"), title: project.evidence[2]?.value ?? "Private evidence", detail: tk("Integration, production, and patient claims stay outside the public case.") },
  ];
  return <section className="aw-bdrs-map" aria-label={t("BDRS implementation boundary")}><header><span>{t("Public implementation boundary")}</span><h2>{t("What exists, what is being checked, and what is not claimed.")}</h2></header><div>{lanes.map((lane,index)=><article key={lane.state} className={index===0?"is-done":index===1?"is-current":"is-next"}><small>{String(index+1).padStart(2,"0")}</small><span>{t(lane.state)}</span><strong>{t(lane.title)}</strong><p>{t(lane.detail)}</p></article>)}</div><footer><span>{t("Workflow intent")}</span><p>{t("Blood request → domain workflow → traceable record → operational reporting")}</p></footer></section>;
}

function SuhuLogShowcase({ project, openImage }: Pick<ProjectViewProps, "project" | "openImage">) {
  const frames = [
    ...(project.image ? [{ src: project.image, caption: t("Staff record Pagi and Sore readings on a phone; the laptop shows the month, limits and reports.") }] : []),
    ...(project.gallery ?? []),
  ];
  const labels = [tk("Phone to desktop"), tk("Phone entry"), tk("Monitoring"), tk("Report"), tk("QR entry")];
  const [activeFrame, setActiveFrame] = useState(0);
  const active = frames[activeFrame];
  if (!active) return null;
  return (
    <section className="aw-suhulog-showcase" aria-label={t("SuhuLog product walkthrough")}>
      <div className="aw-suhulog-showcase-grid">
        <button type="button" className="aw-suhulog-stage" onClick={(event) => openImage(activeFrame, event.currentTarget)} aria-label={"Quick Look: " + active.caption}>
          <span className={"aw-suhulog-frame" + (active.src.includes("phone") || active.src.includes("device-story") ? " is-contained" : "")} key={active.src}><Image src={active.src} alt={active.caption} fill sizes="(max-width: 760px) 100vw, 860px" className={active.src.includes("phone") || active.src.includes("device-story") ? "object-contain" : "object-cover object-top"} /></span>
          <span className="aw-suhulog-stage-copy"><small>{t("Real product evidence")} · {String(activeFrame + 1).padStart(2,"0")}</small><strong>{t(labels[activeFrame])}</strong><p>{active.caption}</p></span>
          <span className="aw-suhulog-quicklook">{t("Quick Look ↗")}</span>
        </button>
        <div className="aw-suhulog-steps" role="tablist" aria-label={t("SuhuLog workflow views")}>{frames.map((frame,index)=><button type="button" role="tab" aria-selected={activeFrame===index} className={activeFrame===index?"is-active":""} key={frame.src} onClick={()=>setActiveFrame(index)}><span>{String(index+1).padStart(2,"0")}</span><strong>{t(labels[index]??"Evidence")}</strong><p>{frame.caption}</p></button>)}</div>
      </div>
    </section>
  );
}

const EVIDENCE_LABELS: Record<string, string[]> = {
  labstock: [tk("Stock"), tk("Today"), tk("Requisitions"), tk("Requisitions on a phone"), tk("Monthly report")],
  bdrs: [tk("Service workstation"), tk("Dashboard"), tk("Issue register"), tk("Inventory"), tk("Transfusion episodes"), tk("Reports")],
};

function evidenceFrames(project: WorkspaceProject): EvidenceFrame[] {
  const labels = EVIDENCE_LABELS[project.slug] ?? [];
  const items = [...(project.image ? [{ src: project.image, caption: labels[0] ?? project.title }] : []), ...(project.gallery ?? [])];
  const first: Record<string, string> = {
    labstock: tk("The Stok screen: usable stock per item with expiry and condition, derived from the ledger."),
    bdrs: tk("Service workstation: one patient's request, crossmatch, bags and finalisation checklist."),
  };
  return items.map((item, index) => ({
    src: item.src,
    label: t(labels[index] ?? "Screen"),
    caption: (index === 0 ? t(first[project.slug] ?? item.caption) : item.caption).replace(/^[^:]{2,30}:\s*/, (prefix) => (labels[index] && prefix.toLowerCase().startsWith(labels[index].toLowerCase()) ? "" : prefix)).replace(/^./, (c) => c.toUpperCase()),
    quickIndex: index,
    portrait: item.src.includes("mobile"),
  }));
}

function LabStockDossier({ project, query, setQuery, ask, back, openImage }: ProjectViewProps) {
  const prompt = PROJECT_DEMO_PROMPTS.labstock;
  const { projectViewportRef, typedPrompt, responseVisible, responseProgress, runPresentation } = useProjectPresentation(prompt);
  return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-flagship aw-labstock-dossier aw-enter"><button type="button" className="aw-project-back" onClick={back}>{t("← Work")}</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)} />{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>{t("Workspace response")}</span></div>
    <header className="aw-labstock-lead"><div><span>{project.eyebrow}</span><h1><StreamingText text={project.title} progress={responseProgress} start={0} end={.05}/></h1><p><StreamingText text={project.summary} progress={responseProgress} start={.05} end={.16}/></p></div><aside><small>{t("Current record")}</small><strong>{project.status}</strong><p>{t("Screens from a demo database")}</p></aside></header>
    {responseProgress>=.14&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}
    {responseProgress>=.22&&<div className="aw-stream-structure"><LabStockSystemCanvas/></div>}
    {responseProgress>=.4&&<div className="aw-stream-structure"><ProductEvidence title={t("The final product")} heading="Stock, requests and reports on one ledger." source="Captured from the final release running against a demo database: synthetic items, rooms, requesters and users." frames={evidenceFrames(project)} openImage={openImage}/></div>}
    {responseProgress>=.55&&<section className="aw-labstock-decisions aw-stream-structure"><header><span>{t("Three constraints shaped the build")}</span><h2>{t("The source stays identifiable, re-import stays safe, and corrections do not erase history.")}</h2></header><ol><li><b>{t("Source-aware import")}</b><p>{t("Workbook, sheet, row, item identity, unit, and period travel together.")}</p></li><li><b>{t("Idempotent posting")}</b><p>{t("A repeated source is recognized before it can create another stock movement.")}</p></li><li><b>{t("History-preserving correction")}</b><p>{t("Supersession records the change while retaining the earlier ledger evidence.")}</p></li></ol></section>}
    {responseProgress>=.78&&<section className="aw-labstock-proof aw-stream-structure"><div><span>{t("What can be checked")}</span><h2>{t("Behavior over screenshots.")}</h2><p>{project.whyItMatters}</p></div><EvidenceTable project={project}/></section>}
    {responseProgress>=.92&&<footer className="aw-project-boundary aw-stream-structure"><div><span>{t("Public boundary")}</span><strong>{project.status}</strong></div><p>{project.publicLimitations}</p></footer>}
    {responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>;
}

function BdrsDossier({ project, query, setQuery, ask, back, openImage }: ProjectViewProps) {
  const prompt=PROJECT_DEMO_PROMPTS.bdrs; const {projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);
  return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-flagship aw-bdrs-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>{t("← Work")}</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>{t("Workspace response")}</span></div>
    <header className="aw-bdrs-lead"><div><span>{t("Blood-bank workflow system")}</span><h1><StreamingText text={project.title} progress={responseProgress} start={0} end={.05}/></h1></div><p><StreamingText text={project.summary} progress={responseProgress} start={.05} end={.18}/></p></header>
    {responseProgress>=.18&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}
    {responseProgress>=.30&&<div className="aw-stream-structure"><BdrsOperationalMap project={project}/></div>}
    {responseProgress>=.5&&<div className="aw-stream-structure"><ProductEvidence title={t("The system")} heading="From request to bag to transfusion, each step on record." source="Seeded demo environment: synthetic patients (KLINIS DEMO), bags (DEMO-BAG) and staff (E2E). No production data was used; the sidebar naming the hospital is cropped out." frames={evidenceFrames(project)} openImage={openImage}/></div>}
    {responseProgress>=.68&&<section className="aw-bdrs-note aw-stream-structure"><span>{t("Why the boundary matters")}</span><div><h2>{t("Serious workflow software should state less when the public record is incomplete.")}</h2><p>{project.problem}</p><p>{project.solution}</p></div></section>}
    {responseProgress>=.90&&<footer className="aw-project-boundary aw-stream-structure"><div><span>{t("Not claimed")}</span><strong>{t("Production · compliance · completed integration")}</strong></div><p>{project.publicLimitations}</p></footer>}
    {responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>;
}

function SuhuLogDossier({project,query,setQuery,ask,back,openImage}:ProjectViewProps){const prompt=PROJECT_DEMO_PROMPTS.suhulog;const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-flagship aw-suhulog-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>{t("← Work")}</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>{t("Workspace response")}</span></div>
  <header className="aw-suhulog-lead"><div><span>{t("Released operational software")}</span><h1><StreamingText text={project.title} progress={responseProgress} start={0} end={.05}/></h1></div><p><StreamingText text={project.summary} progress={responseProgress} start={.05} end={.16}/></p></header>
  {responseProgress>=.14&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}
  {responseProgress>=.20&&<div className="aw-stream-structure"><SuhuLogShowcase project={project} openImage={openImage}/></div>}
  {responseProgress>=.58&&<section className="aw-suhulog-workflow aw-stream-structure"><div><span>{t("One operational loop")}</span><h2>{t("Scan. Record. Review. Correct. Export.")}</h2><p>{project.problem}</p></div><ol>{project.howItWorks.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol></section>}
  {responseProgress>=.82&&<section className="aw-suhulog-release aw-stream-structure"><div><span>{t("Released record")}</span><h2>{project.evidence[0]?.value}</h2><p>{project.whyItMatters}</p></div><dl>{project.evidence.slice(1).map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>}
  {responseProgress>=.94&&<footer className="aw-project-boundary aw-stream-structure"><div><span>{t("Public boundary")}</span><strong>{t("Sanitized evidence only")}</strong></div><p>{project.publicLimitations}</p></footer>}{responseProgress>=.97&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}

function TomatoVisionDossier({project,query,setQuery,ask,back}:ProjectViewProps){const prompt=t(PROJECT_DEMO_PROMPTS["tomato-ripeness"]);const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-tomato-story aw-enter"><button type="button" className="aw-project-back" onClick={back}>{t("← Work")}</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>{t("Workspace response")}</span></div>
  <TomatoVisionStory progress={responseProgress} query={query} setQuery={setQuery} ask={ask}/></article>}</main>}

function PadelReplay({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // `muted` must be set before play() for autoplay policies (Safari reads the attribute).
    video.muted = true;
    video.setAttribute("muted", "");
    let raf = 0;
    const tick = () => {
      if (barRef.current && video.duration) barRef.current.style.transform = `scaleX(${video.currentTime / video.duration})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => undefined);
    return () => cancelAnimationFrame(raf);
  }, []);
  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }
  const clock = (value: number) => `0:${String(Math.floor(value)).padStart(2, "0")}`;
  return (
    <figure className={"aw-padel-replay" + (playing ? " is-playing" : " is-paused")}>
      <div className="aw-padel-replay-stage">
        <video ref={videoRef} src={src} poster="/projects/padel-vision/analytics/replay-poster.webp" muted loop playsInline preload="auto"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onClick={toggle}
          aria-label={t("Padel Vision tracking replay: players, hits, ball arcs and court control over the 55-second clip at five times speed")} />
        {!playing && <button type="button" className="aw-padel-replay-start" onClick={toggle}><Glyph name="play" /> {t("Play replay")}</button>}
      </div>
      <div className="aw-padel-replay-bar">
        <button type="button" onClick={toggle} aria-label={playing ? t("Pause replay") : t("Play replay")} aria-pressed={playing}><Glyph name={playing ? "pause" : "play"} /><span>{playing ? t("Pause") : t("Play")}</span></button>
        <span className="aw-padel-replay-track" aria-hidden="true"><span ref={barRef} /></span>
        <span className="aw-padel-replay-time">{clock(time)} / {clock(duration || 11)}</span>
        <span className="aw-padel-replay-tag">{t("Replay · 5× speed")}</span>
      </div>
      <figcaption>{t("Tracking replay drawn from the pipeline's own positions, hits and ball arcs. No broadcast footage.")}</figcaption>
    </figure>
  );
}

// Pipeline output on real play: a licensed drone clip (UsaOne Ell, Pexels License) run through Padel Vision
// (docs/design/padel-vision/pexels_analysis.py). The broadcast-clip analytics follow in the dark panel.
function PadelRealClip() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute("muted", "");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => undefined);
  }, []);
  const toggle = () => { const video = videoRef.current; if (!video) return; if (video.paused) void video.play().catch(() => undefined); else video.pause(); };
  return (
    <figure className="aw-padel-real">
      <div className="aw-padel-real-stage">
        <video ref={videoRef} src="/projects/padel-vision/real/pexels-analyzed.mp4" poster="/projects/padel-vision/real/pexels-analyzed-poster.webp" muted loop playsInline preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onClick={toggle} aria-label={t("Padel Vision tracking players, ball and hits on a real rally filmed by drone")} />
        <button type="button" onClick={toggle} aria-pressed={playing} aria-label={playing ? t("Pause") : t("Play")}><Glyph name={playing ? "pause" : "play"} /></button>
      </div>
      <figcaption><strong>{t("Padel Vision on real play")}</strong> {t("Player boxes, P1–P4 IDs, the ball track, hit markers and the court map are the pipeline's own output. The drone drifts, so every frame is registered to the first before the court is mapped. A hit is marked only where the ball turns within a player's reach, so some contacts go unmarked.")} {t("Footage: UsaOne Ell, Pexels.")} <a href="https://www.pexels.com/video/aerial-view-of-exciting-padel-match-33444758/" target="_blank" rel="noopener noreferrer">{t("Source")}</a> · <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">{t("Pexels License")}</a></figcaption>
    </figure>
  );
}

function PadelVisionResponse({project,query,setQuery,ask,back}:ProjectViewProps){const prompt=t(PROJECT_DEMO_PROMPTS[project.slug]);const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-compact-project aw-padel-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>{t("← Labs")}</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>{t("Workspace response")}</span></div>
  <header className="aw-padel-lead"><div><span>{t("Sports computer vision")}</span><h1>{project.title}</h1><p>{project.summary}</p></div><dl>{project.evidence.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></header>
  {responseProgress>=.14&&<div className="aw-stream-structure"><PadelRealClip/></div>}
  {responseProgress>=.24&&<div className="aw-stream-structure"><PadelAnalytics replay={project.video?<PadelReplay src={project.video}/>:null}/></div>}
  {responseProgress>=.78&&<section className="aw-padel-notes aw-stream-structure"><div><span>{t("Constraint")}</span><p>{project.problem}</p></div><div><span>{t("Build")}</span><p>{project.solution}</p></div><div><span>{t("Boundary")}</span><p>{project.publicLimitations}</p></div></section>}{responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}

function PorscheResponse({project,query,setQuery,ask,back,openImage}:ProjectViewProps){const prompt=t(PROJECT_DEMO_PROMPTS[project.slug]);const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-compact-project aw-porsche-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>{t("← Labs")}</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>{t("Workspace response")}</span></div>
  <header className="aw-porsche-title"><span>{t("Interactive WebGL experiment")}</span><h1>{project.title}</h1><p>{project.summary}</p></header>
  {responseProgress>=.06&&<div className="aw-stream-structure"><PorscheSequence openImage={openImage}/></div>}
  {responseProgress>=.72&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}{responseProgress>=.78&&<section className="aw-porsche-record aw-stream-structure"><p>{project.solution}</p><ol>{project.howItWorks.map(item=><li key={item}>{item}</li>)}</ol></section>}{responseProgress>=.86&&project.video&&<figure className="aw-signature-video aw-porsche-site-video aw-stream-structure"><video controls playsInline preload="metadata" poster={porscheCinematic+"03-lineup.webp"} aria-label={t("Recording of the live Porsche 3D site")}><source src={project.video} type="video/mp4"/></video><figcaption>{t("Recording of the live site, interface included · visitor-controlled playback.")}</figcaption></figure>}{responseProgress>=.92&&<footer className="aw-project-boundary aw-stream-structure"><div><span>{t("Creative boundary")}</span><strong>{t("Fan-made interaction study")}</strong></div><p>{project.publicLimitations}</p></footer>}{responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}


function CompactProjectResponse({ project, query, setQuery, ask, back, openImage }: ProjectViewProps) {
  return (
    <main className="aw-center aw-project-detail aw-compact-project aw-enter">
      <button type="button" className="aw-project-back" onClick={back}>{t("← Work")}</button>
      <ProjectOpening project={project} />
      <ProjectMedia project={project} openImage={openImage} lead />
      <section className="aw-compact-record"><div><span>{t("What it explores")}</span><p>{project.problem}</p><p>{project.solution}</p></div><div><span>{t("Technical outline")}</span><ul>{project.howItWorks.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <EvidenceTable project={project} />
      <footer className="aw-project-boundary"><div><span>{t("Status")}</span><strong>{project.eyebrow}</strong></div><p>{project.publicLimitations}</p></footer>
      <ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask} />
    </main>
  );
}

function ProjectWorkspace(props: ProjectViewProps) {
  if (props.project.slug === "labstock") return <LabStockDossier {...props} />;
  if (props.project.slug === "bdrs") return <BdrsDossier {...props} />;
  if (props.project.slug === "suhulog") return <SuhuLogDossier {...props} />;
  if (props.project.slug === "tomato-ripeness") return <TomatoVisionDossier {...props} />;
  if (props.project.slug === "padel-vision") return <PadelVisionResponse {...props} />;
  if (props.project.slug === "porsche-3d") return <PorscheResponse {...props} />;
  return <CompactProjectResponse {...props} />;
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
              <p className="aw-ask-label">{contextName(group.projectId)}</p>
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
      <section ref={paletteRef} className="aw-palette" role="dialog" aria-modal="true" aria-label={t("Command palette")}>
        <label><Glyph name="search" /><input autoFocus value={filter} onChange={(event) => { setFilter(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((value) => Math.min(value + 1, commands.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((value) => Math.max(value - 1, 0)); }
          if (event.key === "Enter") { event.preventDefault(); run(activeIndex); }
          if (event.key === "Escape") close();
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

// Project deep links: ?project=<slug> in the URL is the source of truth for which dossier is open.
const URL_CHANGE_EVENT = "aw:urlchange";
function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
}
const readProjectParam = () => new URLSearchParams(window.location.search).get("project");
const readProjectParamOnServer = () => null;
function writeProjectParam(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set("project", slug);
  else url.searchParams.delete("project");
  if (url.href === window.location.href) return;
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event(URL_CHANGE_EVENT));
}

// Background music: CC0 ambient track (docs/design/audio-provenance.md). One player for the whole page.
// Off until the visitor turns it on. After that the choice is remembered and, on later visits, playback
// is attempted on load; if the browser blocks it, it resumes on the visitor's first click or key press
// (a user gesture, as autoplay policy requires) and the button shows it is waiting.
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
function useMusicResume() {
  useEffect(() => {
    let wanted = false;
    try { wanted = localStorage.getItem(MUSIC_KEY) === "on"; } catch { /* ignore */ }
    if (!wanted || music.state === "on") return;
    let armed = false;
    const disarm = () => {
      if (!armed) return;
      armed = false;
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
    const resume = () => { disarm(); void playMusic(false); };
    void playMusic(false).then((ok) => {
      if (ok) return;
      armed = true;
      window.addEventListener("pointerdown", resume);
      window.addEventListener("keydown", resume);
    });
    return disarm;
  }, []);
}

function MusicButton({ className = "" }: { className?: string }) {
  const state = useMusic();
  const label = state === "on" ? t("Pause music") : state === "blocked" ? t("Resume music") : t("Play music");
  return <button type="button" className={"aw-music " + className + (state === "on" ? " is-playing" : state === "blocked" ? " is-waiting" : "")} onClick={() => (state === "on" ? stopMusic() : void playMusic(true))} aria-pressed={state === "on"} aria-label={label} title={label}><Glyph name="music" /></button>;
}

function LanguageSwitch({ locale, className = "" }: { locale: Locale; className?: string }) {
  return (
    <span className={"aw-lang " + className} role="group" aria-label={t("Language")}>
      {(["en", "id"] as const).map((code) => <button type="button" key={code} aria-pressed={locale === code} onClick={() => setLocale(code)} lang={code}>{code.toUpperCase()}</button>)}
    </span>
  );
}

export function WorkspacePrototype() {
  const windowRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; start: Point; origin: Point } | null>(null);
  const restorePositionRef = useRef<Point>({ x: 0, y: 0 });
  const quickLookReturnFocusRef = useRef<HTMLElement | null>(null);
  const paletteReturnFocusRef = useRef<HTMLElement | null>(null);
  const askAbortRef = useRef<AbortController | null>(null);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [baseView, setBaseView] = useState<Exclude<WorkspaceView, "project">>("home");
  const urlProject = useSyncExternalStore(subscribeToUrl, readProjectParam, readProjectParamOnServer);
  const urlProjectValid = allProjects().some((project) => project.slug === urlProject);
  const view: WorkspaceView = urlProjectValid ? "project" : baseView;
  const selectedSlug = urlProjectValid && urlProject ? urlProject : "labstock";
  const setView = useCallback((next: WorkspaceView) => {
    if (next === "project") return;
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
  const locale = useSyncExternalStore(subscribeToLocale, readLocale, readLocaleOnServer);
  // Children render after this line in the same pass, so every t()/L() below reads this locale.
  setActiveLocale(locale);
  useMusicResume();
  const [windowState, setWindowState] = useState<WindowState>("open");
  const [maximized, setMaximized] = useState(false);
  const [quickLookIndex, setQuickLookIndex] = useState<number | null>(null);
  const [projectRevision, setProjectRevision] = useState(0);

  const selected = allProjects().find((project) => project.slug === selectedSlug) ?? featuredProjects()[0];
  const quickLookImages = useMemo<QuickLookImage[]>(() => [
    ...(selected.image ? [{ src: selected.image, caption: selected.title }] : []),
    ...(selected.gallery ?? []),
  ], [selected]);

  const openPalette = useCallback(() => {
    paletteReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPaletteOpen(true);
  }, []);

  const closePalette = useCallback(() => {
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
    withViewTransition(() => {
      writeProjectParam(project.slug);
      setQuickLookIndex(null);
      setProjectRevision((value) => value + 1);
    });
  }, []);

  function openQuickLook(index: number, trigger: HTMLElement) {
    if (!quickLookImages[index]) return;
    quickLookReturnFocusRef.current = trigger;
    setQuickLookIndex(index);
  }

  const closeQuickLook = useCallback(() => {
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
        locale,
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
            <span>{t("Build · Solve · Improve")}</span>
            <button type="button" onClick={openPalette}><kbd>⌘ K</kbd></button>
            <LanguageSwitch locale={locale} />
            <MusicButton />
            <button type="button" className="aw-appearance" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-pressed={theme === "dark"} aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")} title={theme === "dark" ? t("Light mode") : t("Dark mode")}><Glyph name={theme === "dark" ? "sun" : "moon"} /></button>
            <span className="aw-avatar">AR</span>
          </div>
        </header>

        <div className="aw-body">
          <Sidebar view={view} selected={selected} setView={setView} newSession={newSession} selectProject={selectProject} openPalette={openPalette} open={sidebarOpen} close={() => setSidebarOpen(false)} />

          <section className="aw-stage">
            <header className="aw-mobile-header">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label={t("Open navigation")}><Glyph name="menu" /></button>
              <strong>{t("Adjie Workspace")}</strong>
              <LanguageSwitch locale={locale} className="aw-mobile-lang" />
              <MusicButton className="aw-mobile-music" />
              <button type="button" className="aw-mobile-theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-pressed={theme === "dark"} aria-label={theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode")}><Glyph name={theme === "dark" ? "sun" : "moon"} /></button>
            </header>
            {view === "home" ? <HomeWorkspace query={query} setQuery={setQuery} submit={() => void runAsk(query, null)} ask={(question) => void runAsk(question, null)} setView={setView} selectProject={selectProject} />
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
