"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { WorkspaceProject } from "@/data/workspace";
import { playUISound } from "./UISound";
import "./project-opener.css";

// Direct entries and explicit project selection play the conversation. Browser
// history traversal restores the complete result instead of forcing another intro.
let intentionalEntry: string | null = null;
let historyNavigation = false;
export function requestProjectIntro(slug: string) { intentionalEntry = slug; historyNavigation = false; }
export function markProjectHistoryNavigation() { historyNavigation = true; intentionalEntry = null; }

export function ProjectOpener({ project, children }: { project: WorkspaceProject; children?: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const animations = useRef<Animation[]>([]);
  const eligible = useRef<boolean | null>(null);
  const { prompt, response } = project.opener;

  function finish() {
    animations.current.forEach(a => a.cancel());
    animations.current = [];
    if (root.current) {
      root.current.dataset.playing = "false";
    }
  }

  function play() {
    finish();
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.playing = "true";
    const characters = [...el.querySelectorAll<HTMLElement>("[data-character]")];
    const typing = Math.min(prompt.length * 18, 900);
    const sequence = characters.map((character, index) => character.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 1, delay: 100 + index * typing / characters.length, fill: "both" },
    ));
    // Only the opening elements unfold. The answer container and the long study
    // never become hidden/inert; readers can inspect any section immediately.
    const opening = el.querySelectorAll(".project-ai-identity, .project-answer-lead, .project-story > article > header");
    opening.forEach((element, index) => sequence.push(element.animate(
      [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
      { duration: 240, delay: 100 + typing + 100 + index * 70, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
    )));
    animations.current = sequence;
    void Promise.all(sequence.map(a => a.finished)).then(() => {
      if (animations.current === sequence) finish();
    }).catch(() => { /* Skip, preference change, unmount or replay cancels presentation only. */ });
  }

  useEffect(() => {
    if (eligible.current === null) {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      eligible.current = intentionalEntry === project.slug || (!historyNavigation && navigation?.type !== "back_forward");
      intentionalEntry = null;
    }
    if (eligible.current) play();
    else finish();
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => { if (preference.matches) finish(); };
    preference.addEventListener("change", changed);
    return () => { finish(); preference.removeEventListener("change", changed); };
    // A project mounts under its slug/navigation key; no content depends on this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.slug]);

  return <section ref={root} className="project-intro" aria-label={`${project.title} project conversation`} aria-describedby={`${project.slug}-intro-note`}>
    <p id={`${project.slug}-intro-note`} className="sr-only">Scripted introduction. The project study is Adjie AI’s prepared answer; use Ask AI for your own questions.</p>
    <div className="project-question">
      <p className="project-intro-prompt">
        <span className="sr-only">{prompt}</span>
        {prompt.split(" ").map((word, i) => <span className="intro-word" aria-hidden="true" key={i}>{[...word].map((letter, j) => <span data-character key={j}>{letter}</span>)}{" "}</span>)}
      </p>
      <div className="project-intro-controls">
        <button type="button" onClick={() => {
          if (root.current?.dataset.playing === "true") finish();
          else { playUISound("tap"); play(); }
        }}><span className="intro-skip">Skip animation</span><span className="intro-replay">Replay intro ↺</span></button>
      </div>
    </div>
    <section className="project-intro-answer" aria-labelledby={`${project.slug}-answer-label`}>
      <div className="project-ai-identity"><span aria-hidden="true">a.</span><strong id={`${project.slug}-answer-label`}>Adjie AI</strong></div>
      <p className="project-answer-lead">{response}</p>
      <div className="project-story">{children}</div>
    </section>
  </section>;
}
