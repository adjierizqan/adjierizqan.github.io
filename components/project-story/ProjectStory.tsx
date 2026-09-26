"use client";

import Image from "next/image";
import { MouseEvent, ReactNode, useId, useState } from "react";
import "./project-story.css";

// Editorial primitives for project case studies. TomatoVision is the pilot; other projects keep their own layouts.

function scrollToTarget(event: MouseEvent<HTMLAnchorElement>, target: string) {
  const element = document.getElementById(target);
  if (!element) return;
  event.preventDefault();
  element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  element.focus({ preventScroll: true });
}

export function EvidenceChip({ label, target }: { label: string; target: string }) {
  return <a className="ps-chip" href={"#" + target} onClick={(event) => scrollToTarget(event, target)}>[{label}]</a>;
}

export function ProjectHero({ eyebrow, title, summary, status }: { eyebrow: string; title: ReactNode; summary: ReactNode; status: string }) {
  return (
    <header className="ps-hero">
      <p className="ps-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="ps-hero-summary">{summary}</p>
      <p className="ps-hero-status">{status}</p>
    </header>
  );
}

export function MetricProgression({ steps, unit, children }: { steps: { value: string; label: string }[]; unit: string; children?: ReactNode }) {
  return (
    <section className="ps-progression" aria-label={unit + " progression"}>
      <ol>
        {steps.map((step, index) => (
          <li key={step.label}>
            {index > 0 && <span className="ps-progression-arrow" aria-hidden="true" />}
            <div><strong>{step.value}</strong><span>{step.label}</span></div>
          </li>
        ))}
        <li className="ps-progression-unit">{unit}</li>
      </ol>
      {children && <p className="ps-progression-note">{children}</p>}
    </section>
  );
}

export type DetectionItem = { id: string; tab: string; label: string; src: string; alt: string };

export function DetectionComparison({ items, defaultId, legend, caption }: { items: DetectionItem[]; defaultId: string; legend?: { label: string; color: string }[]; caption?: ReactNode }) {
  const [active, setActive] = useState(defaultId);
  const baseId = useId();
  return (
    <section className="ps-detections" aria-label="Same scene across models">
      <div className="ps-segmented" role="tablist" aria-label="Choose a model">
        {items.map((item) => (
          <button type="button" role="tab" id={baseId + item.id} aria-selected={active === item.id} aria-controls={baseId + item.id + "-panel"} key={item.id} onClick={() => setActive(item.id)}>{item.tab}</button>
        ))}
      </div>
      <div className="ps-detection-grid">
        {items.map((item) => (
          <figure key={item.id} id={baseId + item.id + "-panel"} className={active === item.id ? "is-active" : ""} aria-labelledby={baseId + item.id}>
            <figcaption>{item.label}</figcaption>
            <div className="ps-frame is-square"><Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 100vw, 320px" className="object-cover" /></div>
          </figure>
        ))}
      </div>
      {legend && <ul className="ps-legend" aria-label="Class colours">{legend.map((entry) => <li key={entry.label}><i style={{ background: entry.color }} />{entry.label}</li>)}</ul>}
      {caption && <p className="ps-caption">{caption}</p>}
    </section>
  );
}

export function EditorialSection({ index, title, aside, children, className = "" }: { index: string; title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={"ps-section " + className} aria-labelledby={"ps-section-" + index}>
      <header>
        <h2 id={"ps-section-" + index}>{index} — {title}</h2>
        {aside && <div className="ps-section-aside">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

export function Figure({ children, caption, className = "" }: { children: ReactNode; caption?: ReactNode; className?: string }) {
  return <figure className={"ps-figure " + className}>{children}{caption && <FigureCaption>{caption}</FigureCaption>}</figure>;
}

export function FigureCaption({ children }: { children: ReactNode }) {
  return <figcaption className="ps-figure-caption">{children}</figcaption>;
}

export type ResearchColumn = { key: string; label: string; numeric?: boolean; secondary?: boolean };
export type ResearchRow = { key: string; cells: Record<string, ReactNode>; emphasis?: boolean };

export function ResearchTable({ label, columns, rows, strong = {}, secondaryToggle }: {
  label: string;
  columns: ResearchColumn[];
  rows: ResearchRow[];
  strong?: Record<string, string>;
  secondaryToggle?: string;
}) {
  const [showSecondary, setShowSecondary] = useState(false);
  const hasSecondary = columns.some((column) => column.secondary);
  return (
    <div className={"ps-table" + (showSecondary ? " shows-secondary" : "")}>
      <div className="ps-table-scroll">
        <table aria-label={label}>
          <thead><tr>{columns.map((column) => <th scope="col" key={column.key} className={(column.numeric ? "is-numeric " : "") + (column.secondary ? "is-secondary" : "")}>{column.label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={row.emphasis ? "is-emphasis" : ""}>
                {columns.map((column, index) => {
                  const className = (column.numeric ? "is-numeric " : "") + (column.secondary ? "is-secondary " : "") + (strong[column.key] === row.key ? "is-strong" : "");
                  return index === 0 ? <th scope="row" key={column.key} className={className}>{row.cells[column.key]}</th> : <td key={column.key} className={className}>{row.cells[column.key]}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasSecondary && secondaryToggle && <button type="button" className="ps-table-toggle" aria-expanded={showSecondary} onClick={() => setShowSecondary((value) => !value)}>{showSecondary ? "Hide " : "Show "}{secondaryToggle}<span aria-hidden="true">{showSecondary ? " ↑" : " ↓"}</span></button>}
    </div>
  );
}

export function MethodDiagram({ steps, label }: { steps: { label: string; detail?: string }[]; label: string }) {
  return (
    <ol className="ps-method" aria-label={label}>
      {steps.map((step, index) => (
        <li key={step.label}>
          <div><strong>{step.label}</strong>{step.detail && <span><b aria-hidden="true"> · </b>{step.detail}</span>}</div>
          {index < steps.length - 1 && <i aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

export function ArtifactLinks({ items }: { items: { id: string; label: string; detail: string; href?: string }[] }) {
  return (
    <ul className="ps-artifacts">
      {items.map((item) => (
        <li key={item.id} id={item.id} tabIndex={-1}>
          {item.href
            ? <a href={item.href} target="_blank" rel="noopener noreferrer"><span><b>{item.label}</b> — {item.detail}</span><i aria-hidden="true">↗</i></a>
            : <span><b>{item.label}</b> — {item.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
