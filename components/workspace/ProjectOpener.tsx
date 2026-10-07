"use client";

import { useEffect, useRef } from "react";
import type { WorkspaceProject } from "@/data/workspace";
import { playUISound } from "./UISound";
import "./project-opener.css";

// Direct entries and explicit project selection play the conversation. Browser
// history traversal restores the complete result instead of forcing another intro.
let intentionalEntry: string | null = null;
let historyNavigation = false;
export function requestProjectIntro(slug: string) { intentionalEntry = slug; historyNavigation = false; }
export function markProjectHistoryNavigation() { historyNavigation = true; intentionalEntry = null; }

export function ProjectOpener({ project }: { project: WorkspaceProject }) {
  const root = useRef<HTMLElement>(null);
  const animations = useRef<Animation[]>([]);
  const eligible = useRef<boolean | null>(null);
  const { prompt, response } = project.opener;

  function finish() {
    animations.current.forEach(a => a.cancel());
    animations.current = [];
    if (root.current) {
      root.current.dataset.playing = "false";
      root.current.parentElement!.dataset.introReady = "true";
    }
  }

  function play() {
    finish();
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.playing = "true";
    const characters = [...el.querySelectorAll<HTMLElement>("[data-character]")];
    const typing = Math.min(prompt.length * 25, 1350);
    const sequence = characters.map((character, index) => character.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 1, delay: 180 + index * typing / characters.length, fill: "both" },
    ));
    const answer = el.querySelector(".project-intro-answer")!;
    sequence.push(answer.animate(
      [{ opacity: 0, visibility: "hidden", transform: "translateY(6px)" }, { opacity: 1, visibility: "visible", transform: "none" }],
      { duration: 280, delay: 180 + typing + 160, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
    ));
    // Keep the full result in HTML, but do not show it before the conversational answer.
    // Visibility avoids compositing a layer spanning the entire long article.
    const story = el.nextElementSibling;
    const resultAt = 180 + typing + 160 + 320;
    if (story) sequence.push(story.animate(
      [{ visibility: "hidden" }, { visibility: "visible" }],
      { duration: 1, delay: resultAt, fill: "both" },
    ));
    const hero = story?.querySelector("article > header");
    if (hero) sequence.push(hero.animate(
      [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
      { duration: 300, delay: resultAt, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
    ));
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

  return <section ref={root} className="project-intro" aria-label={`${project.title} project prompt`}>
    <div className="project-intro-meta"><span>Example conversation <span className="sr-only">— Scripted introduction</span></span>
      <div className="project-intro-controls">
        <button type="button" onClick={() => {
          if (root.current?.dataset.playing === "true") finish();
          else { playUISound("tap"); play(); }
        }}><span className="intro-skip">Skip animation</span><span className="intro-replay">Replay intro ↺</span></button>
      </div>
    </div>
    <p className="project-intro-prompt">
      <span className="sr-only">{prompt}</span>
      {prompt.split(" ").map((word, i) => <span className="intro-word" aria-hidden="true" key={i}>{[...word].map((letter, j) => <span data-character key={j}>{letter}</span>)}{" "}</span>)}
    </p>
    <div className="project-intro-answer"><div className="project-ai-identity"><span aria-hidden="true">a.</span><strong>Adjie AI</strong></div><p>{response}</p></div>
  </section>;
}
