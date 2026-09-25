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
} from "react";
import { FileIcon, MailIcon } from "@/components/Icons";
import { TomatoVisionStory } from "@/components/tomatovision/TomatoVisionStory";
import { PadelAnalytics } from "@/components/padel/PadelAnalytics";
import { site } from "@/data/site";
import { streamPortfolioAnswer, type PortfolioChatMessage } from "@/lib/portfolio-ai";
import {
  allWorkspaceProjects,
  featuredWork,
  labWork,
  type WorkspaceProject,
} from "@/data/workspace";

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
    label: "Operational systems",
    query: "Tell me about Adjie’s operational software projects.",
    projects: ["labstock", "suhulog", "bdrs"],
  },
  {
    label: "Applied AI",
    query: "Show me Adjie’s applied AI work.",
    projects: ["tomato-ripeness", "padel-vision", "objecttwin"],
  },
  {
    label: "Reliability",
    query: "How does Adjie approach reliability?",
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

function Glyph({ name }: { name: "home" | "work" | "projects" | "labs" | "book" | "ask" | "more" | "plus" | "search" | "send" | "menu" | "close" | "arrow" | "spark" | "context" | "speaker" | "sun" | "link" | "play" | "pause" }) {
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
    <button className={className + (playing ? " is-playing" : "")} type="button" onClick={play} disabled={!pronunciationTrack} title={pronunciationTrack ? "Hear name pronunciation" : "Pronunciation audio is not yet available"} aria-label={pronunciationTrack ? "Play Adjie Rizqan name pronunciation" : "Pronunciation audio unavailable"}>
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
      <section ref={dialogRef} className="aw-quicklook" role="dialog" aria-modal="true" aria-label="Project image viewer">
        <header><span>{index + 1} / {images.length}</span><p>{image.caption}</p><button type="button" autoFocus onClick={close} aria-label="Close image viewer"><Glyph name="close" /></button></header>
        <div className="aw-quicklook-image" key={image.src}><Image src={image.src} alt={image.caption} fill sizes="100vw" quality={95} className="object-contain" priority /></div>
        {index > 0 && <button type="button" className="aw-quicklook-nav is-previous" onClick={() => navigate(-1)} aria-label="Previous image"><Glyph name="arrow" /></button>}
        {index < images.length - 1 && <button type="button" className="aw-quicklook-nav is-next" onClick={() => navigate(1)} aria-label="Next image"><Glyph name="arrow" /></button>}
      </section>
    </div>,
    document.body,
  );
}

function Composer({ query, setQuery, submit, stop, busy = false, placeholder = "Ask anything about my work…" }: {
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
        placeholder={placeholder}
        aria-label="Ask anything about Adjie’s work"
        maxLength={800}
        disabled={busy}
      />
      <div className="aw-composer-tools">
        <div>
          <button type="button" aria-label="Add project context"><Glyph name="plus" /></button>
          <button type="button" onClick={() => setQuery("Show me Adjie’s operational systems.")}><Glyph name="search" /> Projects</button>
          <button type="button" onClick={() => setQuery("What evidence is available for Adjie’s work?")}><Glyph name="book" /> Evidence</button>
          <button type="button" onClick={() => setQuery("How does Adjie approach reliability?")}><Glyph name="spark" /> Build notes</button>
        </div>
        <div className="aw-composer-submit"><span>Adjie AI · Preview</span><button className="aw-send" type="button" onClick={busy ? stop : submit} disabled={busy ? !stop : !query.trim()} aria-label={busy ? "Stop response" : "Send query"}><Glyph name={busy ? "close" : "send"} /></button></div>
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
            <PronunciationButton className="aw-pronounce" />
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

function HomeWorkspace({ query, setQuery, submit, ask, setView, selectProject }: {
  query: string;
  setQuery: (value: string) => void;
  submit: () => void;
  ask: (question: string) => void;
  setView: (view: WorkspaceView) => void;
  selectProject: (project: WorkspaceProject) => void;
}) {
  const suggestions = [
    { label: "Explore my projects", prompt: "What are Adjie’s main projects?", icon: "work" as const },
    { label: "How does SuhuLog work?", prompt: "How does SuhuLog work?", icon: "ask" as const },
    { label: "Show applied AI work", prompt: "What applied AI and computer vision work has Adjie done?", icon: "spark" as const },
    { label: "Show verified evidence", prompt: "What evidence is available for Adjie’s work?", icon: "book" as const },
  ];

  return (
    <main className="aw-center aw-home aw-enter">
      <section className="aw-identity">
        <div>
          <span>Good evening,</span>
          <div className="aw-name"><h1>Adjie Rizqan</h1><PronunciationButton /></div>
          <p>Turn ideas into useful systems.</p>
        </div>
        <blockquote>“A more capable me,<br />for a more useful tomorrow.”</blockquote>
      </section>

      <div className="aw-focus-tags">
        {["Software Engineering", "Applied AI", "Healthcare Systems", "Computer Vision", "Automation"].map((tag) => <span key={tag}>{tag}</span>)}
      </div>

      <Composer query={query} setQuery={setQuery} submit={submit} />

      <section className="aw-suggestions" aria-label="Suggested questions">
        <h2>Try asking</h2>
        <div>{suggestions.map((item) => (
          <button type="button" key={item.label} onClick={() => ask(item.prompt)}>
            <span><Glyph name={item.icon} /></span>
            <strong>{item.label}</strong>
            <Glyph name="arrow" />
          </button>
        ))}</div>
      </section>

      <section className="aw-recent">
        <header><div><strong>Recent work</strong><span><button className="is-active" type="button">Featured</button><button type="button" onClick={() => setView("work")}>Systems</button><button type="button" onClick={() => setView("labs")}>Labs</button></span></div><button type="button" onClick={() => setView("work")}>View all <Glyph name="arrow" /></button></header>
        <div>
          {featuredWork.map((project) => (
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

type ProjectViewProps = {
  project: WorkspaceProject;
  query: string;
  setQuery: (value: string) => void;
  ask: (value?: string) => void;
  back: () => void;
  openImage: (index: number, trigger: HTMLElement) => void;
};

const PROJECT_DEMO_PROMPTS: Record<string, string> = {
  labstock: "Jelaskan project LabStock ini secara ringkas. Apa masalahnya, solusinya, fitur utama, dan status sekarang?",
  bdrs: "Apa yang sudah dibangun di BDRS, dan apa yang masih dalam tahap pengembangan atau perencanaan?",
  suhulog: "Bagaimana SuhuLog mengubah pencatatan suhu menjadi workflow yang cepat dan tetap dapat diaudit?",
  "tomato-ripeness": "What did TomatoVision test, and what do the evaluation results actually show?",
  "padel-vision": "How does Padel Vision turn one broadcast camera into an inspectable match-analysis pipeline?",
  objecttwin: "How does ObjectTwin turn one image into a generated 3D result that can be evaluated and inspected?",
  "porsche-3d": "How was Porsche 3D built as a real-time WebGL interaction study?",
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
    <section className="aw-project-session" aria-label={title + " scripted project prompt"}>
      <header>
        <div><i /><span>You · prompt</span><small>Project opener</small></div>
        <button type="button" onClick={replay} aria-label={"Replay " + title + " project presentation"}>↻ Replay Demo</button>
      </header>
      <div className="aw-session-query">
        <span aria-hidden="true">Q</span>
        <div>
          <small>Project query</small>
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
        <div><dt>Role</dt><dd>{project.role}</dd></div>
        {project.stack.length > 0 && <div><dt>Stack</dt><dd>{project.stack.join(" · ")}</dd></div>}
        <div><dt>Project record</dt><dd>{project.year}{project.status ? " · " + project.status : ""}</dd></div>
      </dl>
    </>
  );
}

function EvidenceTable({ project, visibleRows = project.evidence.length }: { project: WorkspaceProject; visibleRows?: number }) {
  return (
    <div className="aw-evidence-table-wrap">
      <table className="aw-evidence-table">
        <thead><tr><th scope="col">Behavior</th><th scope="col">Public evidence</th></tr></thead>
        <tbody>{project.evidence.slice(0, visibleRows).map((item) => <tr className="aw-stream-structure" key={item.label}><th scope="row">{item.label}</th><td>{item.value}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function ProjectAsk({ project, query, setQuery, ask }: Pick<ProjectViewProps, "project" | "query" | "setQuery" | "ask">) {
  return (
    <section className="aw-project-ask aw-editorial-ask">
      <header><span>Ask about {project.title}</span><button type="button" onClick={() => ask(project.askSuggestion)}>Use suggested question</button></header>
      <Composer query={query} setQuery={setQuery} submit={() => ask()} placeholder={"Ask anything about " + project.title + "…"} />
    </section>
  );
}

function ProjectMedia({ project, openImage, lead = false }: Pick<ProjectViewProps, "project" | "openImage"> & { lead?: boolean }) {
  if (!project.image) return null;
  return (
    <section className={lead ? "aw-editorial-media is-lead" : "aw-editorial-media"} aria-label={project.title + " public project media"}>
      <button type="button" className="aw-editorial-media-lead" onClick={(event) => openImage(0, event.currentTarget)} aria-label={"Quick Look: " + project.title + " project view"}>
        <Image src={project.image} alt={project.title + " public project view"} fill sizes="(max-width: 760px) 100vw, 1000px" className="object-cover object-top" />
        <span>Open in Quick Look</span>
      </button>
      {project.gallery && project.gallery.length > 0 && <div className="aw-editorial-gallery">{project.gallery.map((item, index) => <figure key={item.src}><button type="button" onClick={(event) => openImage(index + 1, event.currentTarget)} aria-label={"Quick Look: " + item.caption}><Image src={item.src} alt={item.caption} fill sizes="(max-width: 760px) 90vw, 300px" className="object-cover object-top" /></button><figcaption>{item.caption}</figcaption></figure>)}</div>}
    </section>
  );
}

function ObjectTwinStudio({ project, openImage }: Pick<ProjectViewProps, "project" | "openImage">) {
  const views = [
    { label: "Generation", src: "/projects/objecttwin/web/02-generation.webp", note: "Pipeline progress, cleanup and quality evaluation stay inspectable." },
    { label: "3D inspection", src: "/projects/objecttwin/web/03-inspection.webp", note: "The generated GLB opens in the browser viewer for visual inspection." },
  ];
  const [active, setActive] = useState(1);
  const current = views[active];
  return (
    <section className="aw-twin-studio" aria-label="ObjectTwin source to 3D inspection">
      <header><div><span>Image → generated object</span><h2>The result gets the largest surface.</h2></div><nav aria-label="ObjectTwin result views">{views.map((view, index) => <button type="button" aria-pressed={active === index} key={view.label} onClick={() => setActive(index)}>{view.label}</button>)}</nav></header>
      <div className="aw-twin-workbench">
        <button type="button" className="aw-twin-source" onClick={(event) => openImage(1, event.currentTarget)} aria-label="Quick Look: ObjectTwin source image"><span><Image src="/projects/objecttwin/web/01-source-workspace.webp" alt="ObjectTwin source-image workspace" fill sizes="320px" className="object-cover object-bottom" /></span><small>01 · Source image</small><strong>One image starts the job.</strong></button>
        <button type="button" className="aw-twin-viewport" onClick={(event) => openImage(active + 2, event.currentTarget)} aria-label={"Quick Look: " + current.label}>
          <span key={current.src}><Image src={current.src} alt={current.label + " from the ObjectTwin workflow"} fill sizes="(max-width: 760px) 100vw, 820px" className="object-cover object-center" /></span>
          <b>Inspect result</b>
        </button>
      </div>
      <div className="aw-twin-caption"><strong>{current.label}</strong><p>{current.note}</p></div>
      {project.video && <figure className="aw-signature-video"><video controls playsInline preload="metadata" poster={views[1].src} aria-label="ObjectTwin browser inspection sequence"><source src={project.video} type="video/mp4" /></video><figcaption>Real browser-viewer sequence · visitor-controlled playback.</figcaption></figure>}
    </section>
  );
}

type PorscheFrame = { src: string; label: string; quickIndex: number };
const porscheCinematic = "/projects/porsche-3d/cinematic/";

function PorscheSequence({ openImage }: Pick<ProjectViewProps, "openImage">) {
  const views: { label: string; note: string; frames?: PorscheFrame[]; video?: string }[] = [
    { label: "Model", note: "The RWB 964 in the site's studio set.", frames: [{ src: porscheCinematic + "01-rwb964-hero.webp", label: "911 RWB (964)", quickIndex: 0 }] },
    { label: "Profile", note: "918 Spyder Weissach in its Martini livery, side on.", frames: [{ src: porscheCinematic + "02-918-profile.webp", label: "918 Spyder", quickIndex: 1 }] },
    { label: "Line-up", note: "All six models from the site in one scene.", frames: [{ src: porscheCinematic + "03-lineup.webp", label: "Six models", quickIndex: 2 }] },
    { label: "Camera", note: "The site's switch transition: one car turns away, the next arrives.", video: porscheCinematic + "04-transition.mp4" },
    { label: "Material", note: "One car, three finishes from the configurator.", frames: [
      { src: porscheCinematic + "05-gt3-metallic.webp", label: "GT Silver · metallic", quickIndex: 3 },
      { src: porscheCinematic + "05-gt3-gloss.webp", label: "Guards Red · gloss", quickIndex: 4 },
      { src: porscheCinematic + "05-gt3-matte.webp", label: "Jet Black · matte", quickIndex: 5 },
    ] },
    { label: "Detail", note: "Close range on the RWB 964.", frames: [
      { src: porscheCinematic + "06-rwb964-wheel.webp", label: "Wheel and brake", quickIndex: 6 },
      { src: porscheCinematic + "06-rwb964-wing.webp", label: "Rear wing", quickIndex: 7 },
      { src: porscheCinematic + "06-rwb964-light.webp", label: "Headlights", quickIndex: 8 },
    ] },
  ];
  const [active, setActive] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const current = views[active];
  const frame = current.frames?.[Math.min(frameIndex, current.frames.length - 1)];
  return (
    <section className="aw-porsche-sequence" aria-label="Porsche 3D renders">
      <header><span>Rendered from the site&apos;s own Three.js scene</span><small>{String(active + 1).padStart(2, "0")} / {String(views.length).padStart(2, "0")}</small></header>
      <div className="aw-porsche-stage">
        {frame ? <button type="button" onClick={(event) => openImage(frame.quickIndex, event.currentTarget)} aria-label={"Quick Look: " + frame.label}><span key={frame.src}><Image src={frame.src} alt={frame.label + " rendered in Porsche 3D"} fill sizes="(max-width: 760px) 100vw, 1100px" className="object-cover object-center" priority={active === 0} /></span></button>
          : <video key={current.video} controls playsInline preload="metadata" poster={porscheCinematic + "04-transition-poster.webp"} aria-label="Porsche 3D model switch transition"><source src={current.video} type="video/mp4" /></video>}
      </div>
      <div className="aw-porsche-caption">
        <p><strong>{frame?.label ?? current.label}</strong> {current.note}</p>
        {current.frames && current.frames.length > 1 && <div role="group" aria-label={current.label + " frames"}>{current.frames.map((item, index) => <button type="button" aria-pressed={frameIndex === index} key={item.src} onClick={() => setFrameIndex(index)}>{item.label}</button>)}</div>}
      </div>
      <div className="aw-porsche-controls" role="tablist" aria-label="Porsche 3D views">{views.map((view, index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} key={view.label} onClick={() => { setActive(index); setFrameIndex(0); }}><small>{String(index + 1).padStart(2, "0")}</small><strong>{view.label}</strong></button>)}</div>
    </section>
  );
}

function ProjectMetaLine({ project }: { project: WorkspaceProject }) {
  return <dl className="aw-project-meta-line" aria-label={project.title + " project metadata"}><div><dt>Role</dt><dd>{project.role}</dd></div>{project.stack.length > 0 && <div><dt>Built with</dt><dd>{project.stack.join(" · ")}</dd></div>}<div><dt>Record</dt><dd>{project.year}{project.status ? " · " + project.status : ""}</dd></div></dl>;
}

function LabStockSystemCanvas() {
  return (
    <section className="aw-labstock-canvas" id="labstock-data-flow" aria-label="LabStock source to export system map">
      <header><span>One traceable path</span><h2>Workbook evidence enters once. Every report leaves from the same ledger.</h2></header>
      <div className="aw-ledger-map">
        <div className="aw-ledger-source"><small>Source</small><strong>Monthly workbook</strong><span>file · sheet · row · period</span></div>
        <div className="aw-ledger-gate"><small>Validate</small><strong>Identity + unit + overlap</strong><span>conflicts stop before posting</span></div>
        <div className="aw-ledger-core"><i /><small>Canonical record</small><strong>Stock ledger</strong><span>one effective item identity</span></div>
        <div className="aw-ledger-output"><small>Read</small><strong>Monthly / yearly report</strong><span>same stored movements</span></div>
        <div className="aw-ledger-export"><small>Deliver</small><strong>Detail + recap Excel</strong><span>template-compatible output</span></div>
      </div>
      <div className="aw-ledger-rules"><p><b>Same source returns</b><span>Recognized before posting</span><strong>No duplicate movement</strong></p><p><b>A correction is needed</b><span>Prior record stays traceable</span><strong>Auditable supersession</strong></p><p><b>A report is exported</b><span>Website and workbook read one ledger</span><strong>Consistent balance</strong></p></div>
    </section>
  );
}

function BdrsOperationalMap({ project }: { project: WorkspaceProject }) {
  const lanes = [
    { state: "Implemented", title: project.evidence[0]?.value ?? "Workflow structure", detail: "Operational work is organized around the domain flow." },
    { state: "Current", title: project.evidence[1]?.value ?? "Evidence review", detail: "Technical and release evidence remains under review." },
    { state: "Planned / withheld", title: project.evidence[2]?.value ?? "Private evidence", detail: "Integration, production, and patient claims stay outside the public case." },
  ];
  return <section className="aw-bdrs-map" aria-label="BDRS implementation boundary"><header><span>Public implementation boundary</span><h2>What exists, what is being checked, and what is not claimed.</h2></header><div>{lanes.map((lane,index)=><article key={lane.state} className={index===0?"is-done":index===1?"is-current":"is-next"}><small>{String(index+1).padStart(2,"0")}</small><span>{lane.state}</span><strong>{lane.title}</strong><p>{lane.detail}</p></article>)}</div><footer><span>Workflow intent</span><p>Blood request → domain workflow → traceable record → operational reporting</p></footer></section>;
}

function SuhuLogShowcase({ project, openImage }: Pick<ProjectViewProps, "project" | "openImage">) {
  const frames = [
    ...(project.image ? [{ src: project.image, caption: "SuhuLog workspace overview." }] : []),
    ...(project.gallery ?? []),
  ];
  const labels = ["Overview", "Record", "Monitor", "Report", "QR entry"];
  const [activeFrame, setActiveFrame] = useState(0);
  const active = frames[activeFrame];
  if (!active) return null;
  return (
    <section className="aw-suhulog-showcase" aria-label="SuhuLog product walkthrough">
      <div className="aw-suhulog-showcase-grid">
        <button type="button" className="aw-suhulog-stage" onClick={(event) => openImage(activeFrame, event.currentTarget)} aria-label={"Quick Look: " + active.caption}>
          <span className="aw-suhulog-frame" key={active.src}><Image src={active.src} alt={active.caption} fill sizes="(max-width: 760px) 100vw, 860px" className="object-cover object-top" /></span>
          <span className="aw-suhulog-stage-copy"><small>Real product evidence · {String(activeFrame + 1).padStart(2,"0")}</small><strong>{labels[activeFrame]}</strong><p>{active.caption}</p></span>
          <span className="aw-suhulog-quicklook">Quick Look ↗</span>
        </button>
        <div className="aw-suhulog-steps" role="tablist" aria-label="SuhuLog workflow views">{frames.map((frame,index)=><button type="button" role="tab" aria-selected={activeFrame===index} className={activeFrame===index?"is-active":""} key={frame.src} onClick={()=>setActiveFrame(index)}><span>{String(index+1).padStart(2,"0")}</span><strong>{labels[index]??"Evidence"}</strong><p>{frame.caption}</p></button>)}</div>
      </div>
    </section>
  );
}

function LabStockDossier({ project, query, setQuery, ask, back }: ProjectViewProps) {
  const prompt = PROJECT_DEMO_PROMPTS.labstock;
  const { projectViewportRef, typedPrompt, responseVisible, responseProgress, runPresentation } = useProjectPresentation(prompt);
  return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-flagship aw-labstock-dossier aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Work</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)} />{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
    <header className="aw-labstock-lead"><div><span>{project.eyebrow}</span><h1><StreamingText text={project.title} progress={responseProgress} start={0} end={.05}/></h1><p><StreamingText text={project.summary} progress={responseProgress} start={.05} end={.16}/></p></div><aside><small>Current record</small><strong>{project.status}</strong><p>Public-safe product capture pending</p></aside></header>
    {responseProgress>=.14&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}
    {responseProgress>=.22&&<div className="aw-stream-structure"><LabStockSystemCanvas/></div>}
    {responseProgress>=.55&&<section className="aw-labstock-decisions aw-stream-structure"><header><span>Three constraints shaped the build</span><h2>The source stays identifiable, re-import stays safe, and corrections do not erase history.</h2></header><ol><li><b>Source-aware import</b><p>Workbook, sheet, row, item identity, unit, and period travel together.</p></li><li><b>Idempotent posting</b><p>A repeated source is recognized before it can create another stock movement.</p></li><li><b>History-preserving correction</b><p>Supersession records the change while retaining the earlier ledger evidence.</p></li></ol></section>}
    {responseProgress>=.78&&<section className="aw-labstock-proof aw-stream-structure"><div><span>What can be checked</span><h2>Behavior over screenshots.</h2><p>{project.whyItMatters}</p></div><EvidenceTable project={project}/></section>}
    {responseProgress>=.92&&<footer className="aw-project-boundary aw-stream-structure"><div><span>Public boundary</span><strong>{project.status}</strong></div><p>{project.publicLimitations}</p></footer>}
    {responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>;
}

function BdrsDossier({ project, query, setQuery, ask, back }: ProjectViewProps) {
  const prompt=PROJECT_DEMO_PROMPTS.bdrs; const {projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);
  return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-flagship aw-bdrs-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Work</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
    <header className="aw-bdrs-lead"><div><span>Blood-bank workflow system</span><h1><StreamingText text={project.title} progress={responseProgress} start={0} end={.05}/></h1></div><p><StreamingText text={project.summary} progress={responseProgress} start={.05} end={.18}/></p></header>
    {responseProgress>=.18&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}
    {responseProgress>=.30&&<div className="aw-stream-structure"><BdrsOperationalMap project={project}/></div>}
    {responseProgress>=.68&&<section className="aw-bdrs-note aw-stream-structure"><span>Why the boundary matters</span><div><h2>Serious workflow software should state less when the public record is incomplete.</h2><p>{project.problem}</p><p>{project.solution}</p></div></section>}
    {responseProgress>=.90&&<footer className="aw-project-boundary aw-stream-structure"><div><span>Not claimed</span><strong>Production · compliance · completed integration</strong></div><p>{project.publicLimitations}</p></footer>}
    {responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>;
}

function SuhuLogDossier({project,query,setQuery,ask,back,openImage}:ProjectViewProps){const prompt=PROJECT_DEMO_PROMPTS.suhulog;const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-flagship aw-suhulog-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Work</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
  <header className="aw-suhulog-lead"><div><span>Released operational software</span><h1><StreamingText text={project.title} progress={responseProgress} start={0} end={.05}/></h1></div><p><StreamingText text={project.summary} progress={responseProgress} start={.05} end={.16}/></p></header>
  {responseProgress>=.14&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}
  {responseProgress>=.20&&<div className="aw-stream-structure"><SuhuLogShowcase project={project} openImage={openImage}/></div>}
  {responseProgress>=.58&&<section className="aw-suhulog-workflow aw-stream-structure"><div><span>One operational loop</span><h2>Scan. Record. Review. Correct. Export.</h2><p>{project.problem}</p></div><ol>{project.howItWorks.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol></section>}
  {responseProgress>=.82&&<section className="aw-suhulog-release aw-stream-structure"><div><span>Released record</span><h2>{project.evidence[0]?.value}</h2><p>{project.whyItMatters}</p></div><dl>{project.evidence.slice(1).map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>}
  {responseProgress>=.94&&<footer className="aw-project-boundary aw-stream-structure"><div><span>Public boundary</span><strong>Sanitized evidence only</strong></div><p>{project.publicLimitations}</p></footer>}{responseProgress>=.97&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}

function TomatoVisionDossier({project,query,setQuery,ask,back}:ProjectViewProps){const prompt=PROJECT_DEMO_PROMPTS["tomato-ripeness"];const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-tomato-story aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Work</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
  <TomatoVisionStory progress={responseProgress} query={query} setQuery={setQuery} ask={ask}/></article>}</main>}

function PadelVisionResponse({project,query,setQuery,ask,back}:ProjectViewProps){const prompt=PROJECT_DEMO_PROMPTS[project.slug];const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-compact-project aw-padel-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Labs</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
  <header className="aw-padel-lead"><div><span>Sports computer vision</span><h1>{project.title}</h1><p>{project.summary}</p></div><dl>{project.evidence.map(item=><div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></header>
  {responseProgress>=.24&&<div className="aw-stream-structure"><PadelAnalytics/></div>}
  {responseProgress>=.78&&<section className="aw-padel-notes aw-stream-structure"><div><span>Constraint</span><p>{project.problem}</p></div><div><span>Build</span><p>{project.solution}</p></div><div><span>Boundary</span><p>{project.publicLimitations}</p></div></section>}{responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}

function ObjectTwinResponse({project,query,setQuery,ask,back,openImage}:ProjectViewProps){const prompt=PROJECT_DEMO_PROMPTS[project.slug];const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-compact-project aw-twin-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Labs</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
  <header className="aw-twin-lead"><span>3D creation experiment</span><h1>{project.title}</h1><p>{project.summary}</p></header>
  {responseProgress>=.18&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}{responseProgress>=.25&&<div className="aw-stream-structure"><ObjectTwinStudio project={project} openImage={openImage}/></div>}
  {responseProgress>=.78&&<section className="aw-twin-record aw-stream-structure"><div><span>Pipeline</span><p>{project.solution}</p></div><ol>{project.howItWorks.map(item=><li key={item}>{item}</li>)}</ol></section>}{responseProgress>=.92&&<footer className="aw-project-boundary aw-stream-structure"><div><span>Experiment boundary</span><strong>Inspectable prototype</strong></div><p>{project.publicLimitations}</p></footer>}{responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}

function PorscheResponse({project,query,setQuery,ask,back,openImage}:ProjectViewProps){const prompt=PROJECT_DEMO_PROMPTS[project.slug];const{projectViewportRef,typedPrompt,responseVisible,responseProgress,runPresentation}=useProjectPresentation(prompt);return <main ref={projectViewportRef} className="aw-center aw-project-detail aw-compact-project aw-porsche-project aw-enter"><button type="button" className="aw-project-back" onClick={back}>← Labs</button><ProjectSession title={project.title} prompt={prompt} typedPrompt={typedPrompt} replay={()=>runPresentation(true)}/>{responseVisible&&<article className={"aw-dossier-response aw-streamed-response"+(responseProgress<1?" is-streaming":"")} aria-busy={responseProgress<1}><div className="aw-dossier-response-label"><i/><span>Workspace response</span></div>
  <header className="aw-porsche-title"><span>Interactive WebGL experiment</span><h1>{project.title}</h1><p>{project.summary}</p></header>
  {responseProgress>=.06&&<div className="aw-stream-structure"><PorscheSequence openImage={openImage}/></div>}
  {responseProgress>=.72&&<div className="aw-stream-structure"><ProjectMetaLine project={project}/></div>}{responseProgress>=.78&&<section className="aw-porsche-record aw-stream-structure"><p>{project.solution}</p><ol>{project.howItWorks.map(item=><li key={item}>{item}</li>)}</ol></section>}{responseProgress>=.86&&project.video&&<figure className="aw-signature-video aw-porsche-site-video aw-stream-structure"><video controls playsInline preload="metadata" poster={porscheCinematic+"03-lineup.webp"} aria-label="Recording of the live Porsche 3D site"><source src={project.video} type="video/mp4"/></video><figcaption>Recording of the live site, interface included · visitor-controlled playback.</figcaption></figure>}{responseProgress>=.92&&<footer className="aw-project-boundary aw-stream-structure"><div><span>Creative boundary</span><strong>Fan-made interaction study</strong></div><p>{project.publicLimitations}</p></footer>}{responseProgress>=.96&&<ProjectAsk project={project} query={query} setQuery={setQuery} ask={ask}/>}</article>}</main>}


function CompactProjectResponse({ project, query, setQuery, ask, back, openImage }: ProjectViewProps) {
  return (
    <main className="aw-center aw-project-detail aw-compact-project aw-enter">
      <button type="button" className="aw-project-back" onClick={back}>← Work</button>
      <ProjectOpening project={project} />
      <ProjectMedia project={project} openImage={openImage} lead />
      <section className="aw-compact-record"><div><span>What it explores</span><p>{project.problem}</p><p>{project.solution}</p></div><div><span>Technical outline</span><ul>{project.howItWorks.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <EvidenceTable project={project} />
      <footer className="aw-project-boundary"><div><span>Status</span><strong>{project.eyebrow}</strong></div><p>{project.publicLimitations}</p></footer>
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
  if (props.project.slug === "objecttwin") return <ObjectTwinResponse {...props} />;
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

function AskWorkspace({ query, setQuery, history, currentQuestion, answer, status, error, submit, stop, choose, openProjects }: {
  query: string;
  setQuery: (value: string) => void;
  history: PortfolioChatMessage[];
  currentQuestion: string | null;
  answer: string | null;
  status: AskStatus;
  error: string | null;
  submit: () => void;
  stop: () => void;
  choose: (value: string) => void;
  openProjects: () => void;
}) {
  const active = status === "sending" || status === "streaming";
  const hasConversation = history.length > 0 || currentQuestion !== null || answer !== null || error !== null;
  return (
    <main className={`aw-center aw-ask aw-enter ${hasConversation ? "is-conversation" : "is-empty"}`}>
      {!hasConversation ? (
        <section className="aw-ask-empty">
          <span>Ask Adjie Workspace</span>
          <h1>What would you like to understand?</h1>
          <p>Answers use the verified public portfolio context.</p>
          <Composer query={query} setQuery={setQuery} submit={submit} stop={stop} busy={active} />
          <div>{prompts.map((prompt) => <button type="button" key={prompt.label} onClick={() => choose(prompt.query)}>{prompt.label}<Glyph name="arrow" /></button>)}</div>
        </section>
      ) : (
        <section className="aw-conversation">
          {history.map((message, index) => <div className={"aw-message " + (message.role === "user" ? "is-user" : "")} key={message.role + index}><span>{message.role === "user" ? "You" : "Workspace"}</span><p>{message.content}</p></div>)}
          {currentQuestion && <div className="aw-message is-user"><span>You</span><p>{currentQuestion}</p></div>}
          {(answer !== null || active || error) && <div className="aw-message"><span>Workspace{active ? " · responding" : ""}</span><p aria-live="polite">{answer || (active ? "Thinking…" : error)}</p></div>}
          {error && <div className="aw-result-list"><button type="button" onClick={openProjects}><span><strong>Explore projects</strong><small>Browse without AI</small></span><Glyph name="arrow" /></button><a href={site.cv} target="_blank" rel="noopener noreferrer"><span><strong>Résumé</strong><small>Open PDF</small></span><Glyph name="arrow" /></a><a href={"mailto:" + site.email}><span><strong>Contact</strong><small>Email Adjie</small></span><Glyph name="arrow" /></a></div>}
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
    { label: "Go home", run: () => setView("home") },
    { label: "Browse featured work", run: () => setView("work") },
    { label: "Open projects", run: () => setView("projects") },
    { label: "Open Labs", run: () => setView("labs") },
    { label: "Open Knowledge", run: () => setView("knowledge") },
    { label: "Ask about Adjie", run: () => setView("ask") },
    { label: "Open résumé", run: () => window.open(site.cv, "_blank", "noopener,noreferrer") },
    { label: "Contact Adjie", run: () => window.open("mailto:" + site.email, "_self") },
    ...allWorkspaceProjects.map((project) => ({ label: "Open " + project.title, run: () => selectProjectStable(project) })),
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
      <section ref={paletteRef} className="aw-palette" role="dialog" aria-modal="true" aria-label="Command palette">
        <label><Glyph name="search" /><input autoFocus value={filter} onChange={(event) => { setFilter(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((value) => Math.min(value + 1, commands.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((value) => Math.max(value - 1, 0)); }
          if (event.key === "Enter") { event.preventDefault(); run(activeIndex); }
          if (event.key === "Escape") close();
        }} placeholder="Search projects and actions…" /></label>
        <div>{commands.map((command, index) => <button type="button" className={index === activeIndex ? "is-active" : ""} aria-current={index === activeIndex ? "true" : undefined} key={command.label} onMouseEnter={() => setActiveIndex(index)} onClick={() => run(index)}>{command.label}<span>↵</span></button>)}</div>
      </section>
    </div>,
    document.body,
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
  const [view, setView] = useState<WorkspaceView>("home");
  const [selectedSlug, setSelectedSlug] = useState("labstock");
  const [query, setQuery] = useState("");
  const [askHistory, setAskHistory] = useState<PortfolioChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [askStatus, setAskStatus] = useState<AskStatus>("idle");
  const [askError, setAskError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [strongContrast, setStrongContrast] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>("open");
  const [maximized, setMaximized] = useState(false);
  const [quickLookIndex, setQuickLookIndex] = useState<number | null>(null);
  const [projectRevision, setProjectRevision] = useState(0);

  const selected = allWorkspaceProjects.find((project) => project.slug === selectedSlug) ?? featuredWork[0];
  const quickLookImages = useMemo<QuickLookImage[]>(() => [
    ...(selected.image ? [{ src: selected.image, caption: selected.title + " project view" }] : []),
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
        setAskHistory([]);
        setCurrentQuestion(null);
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
  }, [closePalette, openPalette, paletteOpen]);

  useEffect(() => {
    function resetForViewport() {
      setPosition({ x: 0, y: 0 });
    }
    window.addEventListener("resize", resetForViewport);
    return () => window.removeEventListener("resize", resetForViewport);
  }, []);

  const selectProject = useCallback((project: WorkspaceProject) => {
    withViewTransition(() => {
      setSelectedSlug(project.slug);
      setView("project");
      setQuickLookIndex(null);
      setProjectRevision((value) => value + 1);
    });
  }, []);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("project");
    const project = allWorkspaceProjects.find((item) => item.slug === slug);
    if (project) selectProject(project);
  }, [selectProject]);

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
    setAskHistory([]);
    setCurrentQuestion(null);
    setAnswer(null);
    setAskStatus("idle");
    setAskError(null);
  }

  function stopAsk() {
    askAbortRef.current?.abort();
  }

  async function runAsk(value = query, projectId?: string) {
    const clean = value.trim();
    if (!clean || askStatus === "sending" || askStatus === "streaming") return;
    const priorHistory = [
      ...askHistory,
      ...(currentQuestion && answer ? [
        { role: "user" as const, content: currentQuestion },
        { role: "assistant" as const, content: answer },
      ] : []),
    ].slice(-6);
    const controller = new AbortController();
    askAbortRef.current = controller;
    setAskHistory(priorHistory);
    setCurrentQuestion(clean);
    setQuery("");
    setAnswer("");
    setAskError(null);
    setAskStatus("sending");
    setView("ask");

    let partial = "";
    try {
      const completed = await streamPortfolioAnswer({
        message: clean,
        projectId,
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
        setAskError("Adjie AI is temporarily unavailable. You can still explore the projects directly.");
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
    <div className={"aw-desktop " + (strongContrast ? "is-strong-contrast" : "")}>
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
          <div className="aw-traffic" aria-label="Window controls" data-no-drag>
            <button type="button" className="is-close" onClick={() => setWindowState("closed")} aria-label="Close workspace" title="Close" />
            <button type="button" className="is-minimize" onClick={() => setWindowState("minimized")} aria-label="Minimize workspace" title="Minimize" />
            <button type="button" className="is-maximize" onClick={toggleMaximize} aria-label={maximized ? "Restore workspace" : "Maximize workspace"} title={maximized ? "Restore" : "Maximize"} />
          </div>
          <div className="aw-title-actions" data-no-drag>
            <span>Build · Solve · Improve</span>
            <button type="button" onClick={openPalette}><kbd>⌘ K</kbd></button>
            <button type="button" className="aw-appearance" onClick={() => setStrongContrast((value) => !value)} aria-pressed={strongContrast} aria-label="Toggle interface contrast"><Glyph name="sun" /></button>
            <span className="aw-avatar">AR</span>
          </div>
        </header>

        <div className="aw-body">
          <Sidebar view={view} selected={selected} setView={setView} newSession={newSession} selectProject={selectProject} openPalette={openPalette} open={sidebarOpen} close={() => setSidebarOpen(false)} />

          <section className="aw-stage">
            <header className="aw-mobile-header">
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Glyph name="menu" /></button>
              <strong>Adjie Workspace</strong>
              <span className="aw-mobile-header-spacer" aria-hidden="true" />
            </header>
            {view === "home" ? <HomeWorkspace query={query} setQuery={setQuery} submit={() => void runAsk()} ask={(question) => void runAsk(question)} setView={setView} selectProject={selectProject} />
              : view === "work" ? <WorkWorkspace selectProject={selectProject} />
                : view === "projects" ? <ProjectDirectory projects={allWorkspaceProjects} title="Projects" copy="A single workspace index for featured systems and focused experiments." selectProject={selectProject} />
                  : view === "labs" ? <ProjectDirectory projects={labWork} title="Labs" copy="Focused experiments in computer vision, 3D pipelines, and interactive systems." selectProject={selectProject} />
                    : view === "knowledge" ? <KnowledgeWorkspace selectProject={selectProject} />
                      : view === "project" ? <ProjectWorkspace key={selected.slug + "-" + projectRevision} project={selected} query={query} setQuery={setQuery} ask={(question) => void runAsk(question ?? query, selected.slug)} back={() => setView("work")} openImage={openQuickLook} />
                        : <AskWorkspace query={query} setQuery={setQuery} history={askHistory} currentQuestion={currentQuestion} answer={answer} status={askStatus} error={askError} submit={() => void runAsk()} stop={stopAsk} choose={(question) => void runAsk(question)} openProjects={() => setView("projects")} />}
          </section>
        </div>
      </div>

      <nav className="aw-dock" aria-label="Workspace dock">
        {([
          { label: "Workspace", icon: "home", view: undefined },
          { label: "Work", icon: "work", view: "work" },
          { label: "Projects", icon: "projects", view: "projects" },
          { label: "Labs", icon: "labs", view: "labs" },
          { label: "Ask", icon: "ask", view: "ask" },
        ] as { label: string; icon: "home" | "work" | "projects" | "labs" | "ask"; view?: WorkspaceView }[]).map((item) => {
          const active = windowState === "open" && (item.view ? view === item.view : view === "home");
          const open = item.label === "Workspace" && windowState !== "closed";
          return <button type="button" className={(active ? "is-active " : "") + (open ? "is-open " : "") + (item.label === "Workspace" && windowState === "minimized" ? "is-minimized" : "")} key={item.label} onClick={() => openWorkspace(item.view)} aria-label={item.label}><Glyph name={item.icon} /><span className="aw-dock-tooltip" role="tooltip">{item.label}</span><i /></button>;
        })}
      </nav>

      {paletteOpen && <CommandPalette open close={closePalette} setView={setView} selectProject={selectProject} />}
      {quickLookIndex !== null && <QuickLook images={quickLookImages} index={quickLookIndex} close={closeQuickLook} navigate={navigateQuickLook} />}
    </div>
  );
}
