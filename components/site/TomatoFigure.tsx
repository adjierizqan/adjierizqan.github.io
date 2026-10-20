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

/** The same photo through three configurations, switched in place. */
export function TomatoFigure({ options, caption }: { options: TomatoOption[]; caption: string }) {
  const [active, setActive] = useState(options[options.length - 1].id);
  const current = options.find((o) => o.id === active)!;
  return (
    <figure className="figure">
      <div className="switch" role="group" aria-label="Model configuration">
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={o.id === active} onClick={() => setActive(o.id)}>
            {o.tab}
          </button>
        ))}
      </div>
      <div className="frame stage">
        {options.map((o) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={o.id} src={o.src} alt={o.alt} width={960} height={960} data-active={o.id === active} aria-hidden={o.id !== active} loading={o.id === active ? "eager" : "lazy"} decoding="async" />
        ))}
      </div>
      <dl className="metrics col" aria-live="polite" style={{ margin: 0 }}>
        <div><dt>Configuration</dt><dd>{current.label}</dd></div>
        <div><dt>mAP@0.5</dt><dd>{formatMetric(current.map50)}</dd></div>
        <div><dt>mAP@0.5:0.95</dt><dd>{formatMetric(current.map5095)}</dd></div>
        <div><dt>Precision and recall</dt><dd>{formatMetric(current.precision)} and {formatMetric(current.recall)}</dd></div>
        <div><dt>Speed</dt><dd>{current.fps.toFixed(1)} fps, {current.ms.toFixed(1)} ms per image</dd></div>
      </dl>
      <figcaption className="caption">{caption}</figcaption>
    </figure>
  );
}
