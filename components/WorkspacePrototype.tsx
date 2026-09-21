"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useRef, useState } from "react";
import { site } from "@/data/site";
import {
  allWorkspaceProjects,
  featuredWork,
  labWork,
  type WorkspaceProject,
} from "@/data/workspace";
import { ArrowLeftIcon, ArrowUpRightIcon, FileIcon, MailIcon } from "@/components/Icons";

type WorkspaceMode = "browse" | "ask";

const askOptions = [
  {
    label: "Operational systems",
    query: "What has Adjie built for operational teams?",
    answer:
      "Adjie's operational work connects real-world inputs to traceable records and familiar outputs. Start with LabStock for inventory correctness, SuhuLog for focused daily recording, and BDRS for workflow design under evidence review.",
    projects: ["labstock", "suhulog", "bdrs"],
  },
  {
    label: "Applied AI",
    query: "Show me Adjie’s applied AI work.",
    answer:
      "TomatoVision is the clearest evaluated AI case: the baseline, best single model, and ensemble are reported separately. Padel Vision and ObjectTwin extend that work into video analytics and image-to-3D systems.",
    projects: ["tomato-ripeness", "padel-vision", "objecttwin"],
  },
  {
    label: "Reliability approach",
    query: "How does Adjie approach reliability?",
    answer:
      "The recurring pattern is explicit state, one source of truth, reversible corrections, and output checks at the user boundary. SuhuLog and LabStock show that approach most directly.",
    projects: ["suhulog", "labstock"],
  },
];

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 10h12m-4-4 4 4-4 4" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="m12.3 12.3 4 4" />
    </svg>
  );
}

function ProjectRow({
  project,
  active,
  onOpen,
  onPreview,
}: {
  project: WorkspaceProject;
  active: boolean;
  onOpen: () => void;
  onPreview: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onFocus={onPreview}
      onMouseEnter={onPreview}
      className={`workspace-project-row group ${active ? "workspace-project-row-active" : ""}`}
      aria-label={`Open ${project.title} case study`}
    >
      <span className="min-w-0">
        <span className="workspace-kicker">
          {project.eyebrow} <span aria-hidden="true">/</span> {project.year}
        </span>
        <span className="mt-2 block text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl">
          {project.title}
        </span>
        <span className="mt-2 block max-w-2xl text-left text-sm leading-6 text-muted">
          {project.summary}
        </span>
      </span>
      <span className="workspace-row-action" aria-hidden="true">
        <ArrowIcon className="size-4" />
      </span>
    </button>
  );
}

function EvidencePanel({ project }: { project: WorkspaceProject }) {
  return (
    <aside className="workspace-evidence" aria-label={`Evidence for ${project.title}`}>
      <div>
        <p className="workspace-kicker">Context / evidence</p>
        <h2 className="mt-3 text-lg font-semibold tracking-tight">{project.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{project.role}</p>
      </div>

      {project.image ? (
        <div className="relative aspect-[4/3] overflow-hidden border-y border-line bg-[#e9ece8]">
          <Image
            src={project.image}
            alt=""
            fill
            sizes="320px"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <div className="workspace-asset-placeholder">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            Public asset pending
          </span>
          <p className="mt-3 text-sm leading-6">Evidence first. Private operational screens stay private.</p>
        </div>
      )}

      <dl className="divide-y divide-line border-y border-line">
        {project.evidence.map((item) => (
          <div key={item.label} className="py-4 first:pt-0 last:pb-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {item.label}
            </dt>
            <dd className="mt-1.5 text-sm font-medium leading-5">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function ProjectDetail({ project, onBack }: { project: WorkspaceProject; onBack: () => void }) {
  return (
    <article className="workspace-detail" aria-labelledby="project-title">
      <button type="button" onClick={onBack} className="workspace-back-link">
        <ArrowLeftIcon className="size-4" />
        All work
      </button>

      <header className="mt-8 max-w-3xl">
        <p className="workspace-kicker">
          {project.eyebrow} <span aria-hidden="true">/</span> {project.year}
        </p>
        <h1 id="project-title" className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
          {project.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-foreground/75">{project.summary}</p>
      </header>

      {project.image && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden border border-line bg-[#e9ece8]">
          <Image
            src={project.image}
            alt={`${project.title} project preview`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 760px"
            className="object-cover object-top"
          />
        </div>
      )}

      <div className="mt-10 grid gap-10 border-t border-line pt-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="workspace-kicker">Adjie’s role</p>
          <p className="mt-3 text-sm leading-6">{project.role}</p>
        </div>
        <div>
          <p className="workspace-kicker">What the work demonstrates</p>
          <ul className="mt-3 divide-y divide-line">
            {project.scope.map((item) => (
              <li key={item} className="py-3 first:pt-0 text-sm leading-6 text-foreground/80">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {project.gallery && (
        <section className="mt-12" aria-labelledby="gallery-title">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="workspace-kicker">Selected evidence</p>
              <h2 id="gallery-title" className="mt-2 text-2xl font-semibold tracking-tight">
                Product in use
              </h2>
            </div>
            <span className="font-mono text-xs text-muted">{project.gallery.length} views</span>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {project.gallery.map((shot, index) => (
              <figure key={shot.src} className={index === 0 ? "sm:col-span-2" : ""}>
                <div className="relative aspect-[16/10] overflow-hidden border border-line bg-[#e9ece8]">
                  <Image
                    src={shot.src}
                    alt={shot.caption}
                    fill
                    sizes={index === 0 ? "(max-width: 1024px) 100vw, 760px" : "380px"}
                    className="object-cover object-top"
                  />
                </div>
                <figcaption className="mt-2 max-w-xl text-xs leading-5 text-muted">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {project.assetNote && (
        <section className="mt-10 border-l-2 border-accent bg-accent-soft px-5 py-4">
          <p className="workspace-kicker">Asset requirement</p>
          <p className="mt-2 text-sm leading-6 text-foreground/75">{project.assetNote}</p>
        </section>
      )}

      <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-line pt-7">
        {project.href && (
          <Link href={project.href} className="workspace-primary-action">
            Full case study <ArrowUpRightIcon className="size-4" />
          </Link>
        )}
        <a href={`mailto:${site.email}`} className="workspace-secondary-action">
          Discuss this work
        </a>
      </div>
    </article>
  );
}

export function WorkspacePrototype() {
  const [mode, setMode] = useState<WorkspaceMode>("browse");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [resultSlugs, setResultSlugs] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("labstock");
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const askInput = useRef<HTMLInputElement>(null);

  const selectedProject =
    allWorkspaceProjects.find((project) => project.slug === selectedSlug) ?? featuredWork[0];
  const openProject = allWorkspaceProjects.find((project) => project.slug === openSlug);
  const resultProjects = useMemo(
    () => resultSlugs.map((slug) => allWorkspaceProjects.find((project) => project.slug === slug)).filter(Boolean) as WorkspaceProject[],
    [resultSlugs],
  );

  function switchMode(nextMode: WorkspaceMode) {
    setMode(nextMode);
    setOpenSlug(null);
    if (nextMode === "ask") {
      window.setTimeout(() => askInput.current?.focus(), 0);
    }
  }

  function runAsk(nextQuery: string) {
    const normalized = nextQuery.toLowerCase();
    const match = normalized.includes("ai") || normalized.includes("vision")
      ? askOptions[1]
      : normalized.includes("reliab") || normalized.includes("quality") || normalized.includes("safe")
        ? askOptions[2]
        : askOptions[0];
    setQuery(nextQuery);
    setAnswer(match.answer);
    setResultSlugs(match.projects);
    setSelectedSlug(match.projects[0]);
  }

  function submitAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    runAsk(query.trim());
  }

  function openProjectDetail(project: WorkspaceProject) {
    setSelectedSlug(project.slug);
    setOpenSlug(project.slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="workspace-shell">
      <nav className="workspace-rail" aria-label="Workspace sections">
        <div>
          <p className="workspace-rail-mark" aria-label="Adjie Workspace">
            AW
          </p>
          <div className="workspace-mode-switch" aria-label="Workspace mode">
            <button
              type="button"
              onClick={() => switchMode("browse")}
              className={mode === "browse" ? "workspace-mode-active" : ""}
              aria-pressed={mode === "browse"}
            >
              Browse
            </button>
            <button
              type="button"
              onClick={() => switchMode("ask")}
              className={mode === "ask" ? "workspace-mode-active" : ""}
              aria-pressed={mode === "ask"}
            >
              Ask
            </button>
          </div>
        </div>
        <div className="workspace-rail-links">
          <a href={`mailto:${site.email}`}>
            <MailIcon className="size-4" />
            <span>Contact</span>
          </a>
          <a href={site.cv} target="_blank" rel="noopener noreferrer">
            <FileIcon className="size-4" />
            <span>Resume</span>
          </a>
        </div>
      </nav>

      <main className="workspace-main">
        {openProject ? (
          <ProjectDetail project={openProject} onBack={() => setOpenSlug(null)} />
        ) : mode === "browse" ? (
          <div className="workspace-view-enter">
            <section className="workspace-intro" aria-labelledby="workspace-title">
              <p className="workspace-kicker">Adjie Workspace / selected work</p>
              <h1 id="workspace-title">Adjie builds operational software and applied AI systems.</h1>
              <p>
                Browse the work directly, or ask a focused question. The portfolio remains useful
                without an AI service or account.
              </p>
              <button type="button" onClick={() => switchMode("ask")} className="workspace-ask-cta">
                <SearchIcon className="size-4" />
                Ask about Adjie’s work
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-muted">
                  Local prototype
                </span>
              </button>
            </section>

            <section className="mt-16" aria-labelledby="featured-title">
              <div className="workspace-section-heading">
                <div>
                  <p className="workspace-kicker">01 / Featured work</p>
                  <h2 id="featured-title">Systems with an operational job to do</h2>
                </div>
                <p>Selected for product depth, evidence, and real-world constraints.</p>
              </div>
              <div className="mt-6 border-t border-line">
                {featuredWork.map((project) => (
                  <ProjectRow
                    key={project.slug}
                    project={project}
                    active={selectedProject.slug === project.slug}
                    onPreview={() => setSelectedSlug(project.slug)}
                    onOpen={() => openProjectDetail(project)}
                  />
                ))}
              </div>
            </section>

            <section className="mt-16" aria-labelledby="labs-title">
              <div className="workspace-section-heading">
                <div>
                  <p className="workspace-kicker">02 / Labs</p>
                  <h2 id="labs-title">Focused experiments</h2>
                </div>
                <p>Smaller explorations with enough evidence to show the idea.</p>
              </div>
              <div className="mt-6 border-t border-line">
                {labWork.map((project) => (
                  <ProjectRow
                    key={project.slug}
                    project={project}
                    active={selectedProject.slug === project.slug}
                    onPreview={() => setSelectedSlug(project.slug)}
                    onOpen={() => openProjectDetail(project)}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="workspace-view-enter">
            <section className="workspace-intro" aria-labelledby="ask-title">
              <p className="workspace-kicker">Ask / approved public work</p>
              <h1 id="ask-title">What would you like to understand?</h1>
              <p>
                This P0 interaction uses deterministic, approved portfolio content. It does not call
                an LLM or send your question anywhere.
              </p>
              <form onSubmit={submitAsk} className="workspace-ask-form">
                <SearchIcon className="size-5 shrink-0 text-muted" />
                <label htmlFor="workspace-question" className="sr-only">
                  Ask about Adjie’s work
                </label>
                <input
                  ref={askInput}
                  id="workspace-question"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ask about operational systems, applied AI, or reliability…"
                />
                <button type="submit" aria-label="Submit question">
                  <ArrowIcon className="size-4" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
                {askOptions.map((option) => (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => runAsk(option.query)}
                    className="workspace-prompt-chip"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <div aria-live="polite">
              {answer ? (
                <section className="mt-12" aria-labelledby="answer-title">
                  <p className="workspace-kicker">Workspace response</p>
                  <h2 id="answer-title" className="sr-only">
                    Answer
                  </h2>
                  <p className="workspace-answer">{answer}</p>
                  <div className="mt-10 border-t border-line">
                    {resultProjects.map((project) => (
                      <ProjectRow
                        key={project.slug}
                        project={project}
                        active={selectedProject.slug === project.slug}
                        onPreview={() => setSelectedSlug(project.slug)}
                        onOpen={() => openProjectDetail(project)}
                      />
                    ))}
                  </div>
                </section>
              ) : (
                <section className="workspace-empty-answer" aria-label="How asking works">
                  <span className="font-mono text-xs text-muted">01</span>
                  <p>Ask a focused question.</p>
                  <span className="font-mono text-xs text-muted">02</span>
                  <p>The workspace selects relevant, evidence-backed work.</p>
                  <span className="font-mono text-xs text-muted">03</span>
                  <p>Open the case study and inspect the evidence.</p>
                </section>
              )}
            </div>
          </div>
        )}
      </main>

      <EvidencePanel project={selectedProject} />
    </div>
  );
}
