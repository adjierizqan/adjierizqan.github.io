"use client";

import { useState } from "react";
import { formatMetric } from "@/data/tomatovision";

export type TomatoOption = {
  id: string;
  tab: string;
  label: string;
  src: string;
  alt: string;
  map50: number;
  map5095: number;
  precision: number;
  recall: number;
  fps: number;
  ms: number;
};

/** Figure 1: one photograph through three configurations, switched in place. */
export function TomatoFigure({ options, caption }: { options: TomatoOption[]; caption: string }) {
  const [active, setActive] = useState(options[options.length - 1].id);
  const current = options.find((o) => o.id === active)!;
  const others = options.filter((o) => o.id !== active);
  return (
    <div className="grid fig-1">
      <div className="col-margin fig-1-side">
        <div className="switch" role="group" aria-label="Configuration">
          {options.map((o) => (
            <button key={o.id} type="button" aria-pressed={o.id === active} onClick={() => setActive(o.id)}>
              {o.tab}
            </button>
          ))}
        </div>
        <p className="t-h3" aria-live="polite">{current.label}</p>
        <dl className="metric-rows">
          <div><dt>mAP@0.5</dt><dd>{formatMetric(current.map50)}</dd></div>
          <div><dt>mAP@0.5:0.95</dt><dd>{formatMetric(current.map5095)}</dd></div>
          <div><dt>Precision / recall</dt><dd>{formatMetric(current.precision)} / {formatMetric(current.recall)}</dd></div>
          <div><dt>Speed</dt><dd>{current.fps.toFixed(1)} fps, {current.ms.toFixed(1)} ms per image</dd></div>
        </dl>
        <p className="t-caption">{caption}</p>
      </div>
      <div className="col-main fig-1-media">
        <div className="mat stage">
          {options.map((o) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={o.id} src={o.src} alt={o.alt} width={960} height={960} data-active={o.id === active} aria-hidden={o.id !== active} loading={o.id === active ? "eager" : "lazy"} decoding="async" />
          ))}
        </div>
        <div className="others">
          {others.map((o) => (
            <button key={o.id} type="button" onClick={() => setActive(o.id)} aria-label={`Show ${o.label}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <span className="mat"><img src={o.src} alt="" width={960} height={960} loading="lazy" decoding="async" /></span>
              <span className="t-caption">{o.tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
