"use client";

import { useEffect, useRef } from "react";
import type { WorkspaceProject } from "@/data/workspace";
import { playUISound } from "./UISound";
import "./project-opener.css";

// Explicit navigation can replay. History traversal and refresh keep the completed
// state after the first visit. Storage failure only affects this convenience.
let intentionalEntry: string | null = null;
const seen = new Set<string>();
export function requestProjectIntro(slug: string) { intentionalEntry = slug; }

export function ProjectOpener({ project }: { project: WorkspaceProject }) {
  const root = useRef<HTMLElement>(null);
  const animations = useRef<Animation[]>([]);
  const eligible = useRef<boolean | null>(null);
  const { prompt, response } = project.opener;

  function finish() {
    animations.current.forEach(a => a.cancel());
    animations.current = [];
    if (root.current) root.current.dataset.playing = "false";
  }

  function play() {
    finish();
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.playing = "true";
    const characters = [...el.querySelectorAll<HTMLElement>("[data-character]")];
    const typing = Math.min(prompt.length * 22, 1050);
    const sequence = characters.map((character, index) => character.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 1, delay: 180 + index * typing / characters.length, fill: "both" },
    ));
    const answer = el.querySelector(".project-intro-answer")!;
    sequence.push(answer.animate(
      [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
      { duration: 280, delay: 180 + typing + 160, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
    ));
    // Evidence is never hidden or made inert. It settles into place after the answer.
    // Animate only the opening, not a composited layer spanning the entire long study.
    const story = el.nextElementSibling?.querySelector("article > header");
    if (story) sequence.push(story.animate(
      [{ opacity: .75, transform: "translateY(5px)" }, { opacity: 1, transform: "none" }],
      { duration: 280, delay: 180 + typing + 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
    ));
    animations.current = sequence;
    void Promise.all(sequence.map(a => a.finished)).then(() => {
      if (animations.current === sequence) finish();
    }).catch(() => { /* Skip, preference change, unmount or replay cancels presentation only. */ });
  }

  useEffect(() => {
    const key = `aw:intro:${project.slug}`;
    if (eligible.current === null) {
      let visited = seen.has(project.slug);
      try { visited ||= sessionStorage.getItem(key) === "seen"; } catch { /* optional */ }
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      eligible.current = intentionalEntry === project.slug || (!visited && navigation?.type !== "back_forward");
      intentionalEntry = null;
      seen.add(project.slug);
      try { sessionStorage.setItem(key, "seen"); } catch { /* optional */ }
    }
    if (eligible.current) play();
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => { if (preference.matches) finish(); };
    preference.addEventListener("change", changed);
    return () => { finish(); preference.removeEventListener("change", changed); };
    // A project mounts under its slug/navigation key; no content depends on this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.slug]);

  return <section ref={root} className="project-intro" aria-label={`${project.title} project prompt`}>
    <div className="project-intro-meta"><span>Project prompt <span aria-hidden="true">/</span> Scripted introduction</span>
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
    <div className="project-intro-answer"><span>Adjie AI <small>Project introduction</small></span><p>{response}</p></div>
  </section>;
}
