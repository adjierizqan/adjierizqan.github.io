"use client";

import Image from "next/image";
import { useState } from "react";
import "./product-evidence.css";

// Real product screens with a stated data source. One large frame, a list of screens beside it.
export type EvidenceFrame = { src: string; label: string; caption: string; quickIndex: number; portrait?: boolean };

export function ProductEvidence({ title, heading, source, frames, openImage }: {
  title: string;
  heading: string;
  source: string;
  frames: EvidenceFrame[];
  openImage: (index: number, trigger: HTMLElement) => void;
}) {
  const [active, setActive] = useState(0);
  const frame = frames[active];
  return (
    <section className="aw-evidence" aria-label={title}>
      <header><span>{title}</span><h2>{heading}</h2></header>
      <div className="aw-evidence-grid">
        <button type="button" className={"aw-evidence-stage" + (frame.portrait ? " is-portrait" : "")} onClick={(event) => openImage(frame.quickIndex, event.currentTarget)} aria-label={"Quick Look: " + frame.label}>
          <span key={frame.src}><Image src={frame.src} alt={frame.label + " screen, demo data"} fill sizes="(max-width: 760px) 100vw, 760px" className={frame.portrait ? "object-contain" : "object-cover object-left-top"} /></span>
        </button>
        <div role="tablist" aria-label={title + " screens"}>
          {frames.map((item, index) => (
            <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} key={item.src} onClick={() => setActive(index)}>
              <small>{String(index + 1).padStart(2, "0")}</small><strong>{item.label}</strong><p>{item.caption}</p>
            </button>
          ))}
        </div>
      </div>
      <p className="aw-evidence-source">{source}</p>
    </section>
  );
}
