"use client";

import Link from "next/link";
import { useState } from "react";
import { Img } from "@/components/site/Img";

export type IndexRow = { slug: string; title: string; line: string; area: string; year: string; state: string; image: string; alt: string; caption: string };
export type IndexGroup = { title: string; rows: IndexRow[] };

/** Work index. Hover or keyboard focus on a row shows its image in the margin column. */
export function WorkIndex({ groups }: { groups: IndexGroup[] }) {
  const rows = groups.flatMap((g) => g.rows);
  const [active, setActive] = useState(rows[0]?.slug);
  const current = rows.find((r) => r.slug === active) ?? rows[0];
  return (
    <div className="grid">
      <div className="col-margin index-preview" aria-hidden="true">
        <div className="frame mat">
          {/* All images stay mounted so switching crossfades instead of popping. */}
          {rows.map((r) => <ActiveImg key={r.slug} active={r.slug === current.slug} src={r.image} />)}
        </div>
        <p className="t-caption">{current.caption}</p>
      </div>
      <div className="col-main index-groups">
        <div className="index-labels" aria-hidden="true">
          <span>Project</span><span>Area</span><span>Year</span><span>State</span>
        </div>
        {groups.map((g) => (
          <section key={g.title} className="index-group" aria-labelledby={`g-${g.title}`}>
            <h2 id={`g-${g.title}`}>{g.title}</h2>
            <ul>
              {g.rows.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/projects/${r.slug}/`}
                    className="index-row"
                    onMouseEnter={() => setActive(r.slug)}
                    onFocus={() => setActive(r.slug)}
                  >
                    <span className="index-thumb"><Img src={r.image} alt="" sizes="96px" /></span>
                    <span>
                      <span className="title">{r.title}</span>
                      <span className="line">{r.line}</span>
                    </span>
                    <span className="col-area">{r.area}</span>
                    <span className="col-year num">{r.year}</span>
                    <span className="col-state">{r.state}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ActiveImg({ active, src }: { active: boolean; src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" data-active={active} loading="lazy" decoding="async" />;
}
