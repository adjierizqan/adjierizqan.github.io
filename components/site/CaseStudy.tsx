import Link from "next/link";
import type { WorkspaceProject } from "@/data/workspace";
import {
  constraints,
  labstockLedger,
  myPart,
  releases,
  workflows,
} from "@/data/personal-site";
import {
  formatMetric,
  tomatoConfigurations,
  tomatoDataset,
  tomatoDemo,
  tomatoMatchedScene,
  tomatoTraining,
} from "@/data/tomatovision";
import { Img } from "@/components/site/Img";
import { TomatoFigure, type TomatoOption } from "@/components/site/TomatoFigure";

const ORDER = ["labstock", "bdrs", "suhulog", "tomato-ripeness", "padel-vision", "porsche-3d"];

type Next = { slug: string; title: string; kind: string; image: string };

export const leads: Record<string, string> = {
  labstock: "Laboratory inventory where every balance can be traced back to the workbook row it came from, and every correction leaves the earlier entry in place.",
  bdrs: "A blood-bank system of record that keeps request, crossmatch, issue, outcome and transfusion as separate records in one case workspace.",
  suhulog: "Temperature logging where a QR label picks the monitoring point and a correction adds a record instead of replacing one.",
  "tomato-ripeness": "How much of a detection gain comes from changing the architecture, and how much needs an ensemble? A study of greenhouse tomato maturity in three classes: green, orange and red.",
  "padel-vision": "Can one moving broadcast camera become inspectable match data? A prototype pipeline from detections in the frame to positions on the court.",
  "porsche-3d": "How far a plain HTML and ES module page can go with a real-time 3D scene: six cars, orbit controls, live paint and camera transitions.",
};

const kinds: Record<string, string> = {
  labstock: "Laboratory inventory",
  bdrs: "Blood-bank system of record",
  suhulog: "Temperature logging",
  "tomato-ripeness": "Computer vision thesis",
  "padel-vision": "Computer vision prototype",
  "porsche-3d": "Interactive 3D fan project",
};

const heroes: Record<string, { src: string; alt: string; caption: string }> = {
  labstock: { src: "/projects/labstock/thumb-reset-a.webp", alt: "LabStock on a laptop and a phone with demo data.", caption: "LabStock on desktop and phone. Screens from a demo database with generic items, rooms, requesters and users." },
  bdrs: { src: "/projects/bdrs/cover-final.webp", alt: "BDRS case workstation on desktop and phone for a synthetic patient.", caption: "The case workstation for a synthetic patient, on desktop and phone. Sidebar cropped; no hospital mark." },
  suhulog: { src: "/projects/suhulog/device-story.webp", alt: "SuhuLog entry on a phone and monthly monitoring on a laptop.", caption: "Entry on a phone and monitoring on a laptop. Sanitised captures; scannable labels are not published." },
  "padel-vision": { src: "/projects/padel-vision/analytics/court-control.webp", alt: "Padel court from above with tracked players, the ball and a court minimap.", caption: "Analysed frame from a Pexels clip by UsaOne Ell. Tracking is imperfect; contacts are not marked." },
  "porsche-3d": { src: "/projects/porsche-3d/cinematic/01-rwb964-hero.webp", alt: "RWB 964 rendered in the Three.js scene.", caption: "Render from the site’s own Three.js scene. Car model by Ddiaz Design on Sketchfab; no affiliation with Porsche." },
};

const nextImage: Record<string, string> = {
  labstock: "/projects/labstock/thumb-reset-a.webp",
  bdrs: "/projects/bdrs/workstation.webp",
  suhulog: "/projects/suhulog/cover-final.webp",
  "tomato-ripeness": "/projects/tomato-ripeness/cover-final.webp",
  "padel-vision": "/projects/padel-vision/cover-final.webp",
  "porsche-3d": "/projects/porsche-3d/cover-final.webp",
};

function Meta({ items }: { items: [string, string][] }) {
  return (
    <dl className="meta-list">
      {items.map(([l, v]) => (
        <div key={l}><dt>{l}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  const hid = `s-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <section id={id} className="grid section case-section" aria-labelledby={hid}>
      <h2 id={hid} className="t-h3 col-margin">{title}</h2>
      <div className="col-main">{children}</div>
    </section>
  );
}

function Head({ project }: { project: WorkspaceProject }) {
  const research = project.slug === "tomato-ripeness";
  const meta: [string, string][] = research
    ? [["Type", "Master’s thesis, Tamkang University, 2026"], ["Role", "Research, model development, evaluation"], ["Built with", project.stack.join(", ")]]
    : [["Role", project.role.replaceAll(" · ", ", ")], ["Year", project.year], ["State", releases[project.slug].state], ["Built with", project.stack.join(", ")]];
  return (
    <>
      <p className="back"><Link href="/work/" className="link">All work</Link></p>
      <header className="grid case-head">
        <div className="col-margin"><Meta items={meta} /></div>
        <div className="col-main case-head-main">
          <h1 className="t-display">{project.title}</h1>
          <p className="t-lead">{leads[project.slug]}</p>
        </div>
      </header>
    </>
  );
}

function Hero({ slug }: { slug: string }) {
  const h = heroes[slug];
  return (
    <figure className="case-hero">
      <div className="mat"><Img src={h.src} alt={h.alt} priority sizes="(max-width: 899px) 100vw, 1120px" /></div>
      <figcaption className="t-caption">{h.caption}</figcaption>
    </figure>
  );
}

function Flow({ slug }: { slug: string }) {
  const w = workflows[slug];
  return (
    <section className="section case-section" aria-labelledby="s-flow">
      <div className="grid">
        <h2 id="s-flow" className="t-h3 col-margin">{w.title}</h2>
        <p className="t-prose col-main">{w.intro}</p>
      </div>
      <ol className="flow" style={{ "--steps": w.steps.length } as React.CSSProperties}>
        {w.steps.map((s, i) => (
          <li key={s.title}>
            <p className="flow-label"><span>{i + 1}</span><span>{s.title}</span></p>
            {s.items.length > 0 ? (
              <ul className="t-small">{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
            ) : (
              <>
                <div className="ledger">
                  <table>
                    <thead><tr><th scope="col">Movement</th><th scope="col">Qty</th></tr></thead>
                    <tbody>
                      {labstockLedger.map((r, j) => (
                        <tr key={j} className={r.superseded ? "superseded" : undefined}>
                          <td>{r.kind}{r.superseded && <span className="sr-only"> (superseded)</span>}</td>
                          <td>{r.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="t-caption">Illustration, not a screenshot. A correction adds new rows; the superseded entry stays in the ledger and in the report history.</p>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Decisions({ items, cols = 3 }: { items: { title: string; detail: string }[]; cols?: number }) {
  return (
    <Section title="Decisions">
      <ul className="decisions" style={{ "--cols": cols } as React.CSSProperties}>
        {items.map((d) => (
          <li key={d.title}><h3 className="strong">{d.title}</h3><p>{d.detail}</p></li>
        ))}
      </ul>
    </Section>
  );
}

type Shot = { src: string; caption: string; alt: string; ratio?: string; phone?: boolean };

function Screens({ intro, rows }: { intro: string; rows: { layout: "wide-narrow" | "halves"; shots: Shot[] }[] }) {
  return (
    <section className="section case-section" aria-labelledby="s-screens">
      <div className="grid" style={{ marginBottom: 40 }}>
        <h2 id="s-screens" className="t-h3 col-margin">Screens</h2>
        <p className="t-prose muted col-main">{intro}</p>
      </div>
      <div className="screens">
        {rows.map((row, i) => (
          <div key={i} className={`screens-row ${row.layout}`}>
            {row.shots.map((s) => (
              <figure key={s.src}>
                <div className={`mat crop${s.phone ? " phone" : ""}`} style={{ "--ratio": s.ratio ?? "auto" } as React.CSSProperties}>
                  <Img src={s.src} alt={s.alt} sizes="(max-width: 899px) 100vw, 984px" />
                </div>
                <figcaption className="t-caption">{s.caption}</figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Evidence({ items }: { items: [string, string][] }) {
  return (
    <Section title="Evidence">
      <dl className="meta-list evidence">
        {items.map(([l, v]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
      </dl>
    </Section>
  );
}

function NextCase({ next }: { next: Next }) {
  return (
    <section className="section" aria-label="Next case study">
      <Link href={`/projects/${next.slug}/`} className="next-case">
        <span className="next-text">
          <span className="t-small muted">Next</span>
          <span className="t-h2">{next.title}</span>
          <span className="muted">{next.kind}</span>
        </span>
        <span className="mat"><Img src={next.image} alt="" sizes="420px" /></span>
      </Link>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="bullets t-prose">{items.map((c) => <li key={c}>{c}</li>)}</ul>;
}

function evidenceFor(p: WorkspaceProject): [string, string][] {
  const base = p.evidence.map((e) => [e.label, e.value] as [string, string]);
  const r = releases[p.slug];
  return [...base, ["Release record", `${r.state}. Source: ${r.source}.`]];
}

function Tomato({ project }: { project: WorkspaceProject }) {
  const byId = Object.fromEntries(tomatoConfigurations.map((c) => [c.id, c]));
  const configFor = { baseline: "yolov11", best: "swin-t-mssppf", wbf: "combine-4" } as const;
  const options: TomatoOption[] = tomatoMatchedScene.map((s) => {
    const c = byId[configFor[s.id as keyof typeof configFor]];
    return { id: s.id, tab: s.tab, label: s.label, src: s.src, alt: s.alt, map50: c.map50, map5095: c.map5095, precision: c.precision, recall: c.recall, fps: c.fps, ms: c.msPerImage };
  });
  const best = {
    precision: Math.max(...tomatoConfigurations.map((c) => c.precision)),
    recall: Math.max(...tomatoConfigurations.map((c) => c.recall)),
    map50: Math.max(...tomatoConfigurations.map((c) => c.map50)),
    map5095: Math.max(...tomatoConfigurations.map((c) => c.map5095)),
    fps: Math.max(...tomatoConfigurations.map((c) => c.fps)),
  };
  const chain = [
    ["YOLOv11", "Baseline detector", byId["yolov11"].map50],
    ["+ Swin-T", "Transformer backbone", byId["swin-t"].map50],
    ["+ MS-SPPF", "Multi-scale pooling", byId["swin-t-mssppf"].map50],
    ["WBF × 3", "Fused predictions", byId["combine-4"].map50],
  ] as const;
  const total = tomatoDataset.boxes.green + tomatoDataset.boxes.orange + tomatoDataset.boxes.red;
  return (
    <>
      <TomatoFigure
        options={options}
        caption={`Figure 1. The same photograph through three configurations: a demonstration on a Wikimedia image by Kolforn (CC BY-SA 4.0), ${tomatoDemo.settings}. Not evaluation data. One red fruit is misclassified and shown unchanged.`}
      />
      <section className="section" aria-labelledby="s-chain">
        <div className="grid">
          <h2 id="s-chain" className="t-h3 col-margin">From baseline to ensemble</h2>
          <p className="t-prose col-main">Each step adds one change. The first three are single models; the last runs three models and fuses their boxes.</p>
        </div>
        <ol className="chain">
          {chain.map(([a, b, v]) => (
            <li key={a}><span className="strong">{a}</span><span className="t-small muted">{b}</span><span className="t-figure">{formatMetric(v)}</span><span className="t-caption">mAP@0.5</span></li>
          ))}
        </ol>
        <p className="t-caption" style={{ marginTop: 16 }}>Figure 2. mAP@0.5 per configuration from the thesis results tables.</p>
      </section>
      <section className="grid section" aria-labelledby="s-table">
        <div className="col-margin" style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <h2 id="s-table" className="t-h3">All seven configurations</h2>
          <p className="t-caption">Table 1. Best value in each column in bold.</p>
        </div>
        <div className="col-main table-wrap" tabIndex={0} role="region" aria-label="Table 1, all seven configurations (scrolls sideways on small screens)">
          <table className="results">
            <thead><tr><th scope="col">Configuration</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col">mAP@0.5</th><th scope="col">mAP@0.5:0.95</th><th scope="col">fps</th></tr></thead>
            <tbody>
              {tomatoConfigurations.map((c) => (
                <tr key={c.id}>
                  <th scope="row" style={{ fontSize: "0.875rem", color: "var(--ink)", borderBottom: "1px solid var(--rule)", fontWeight: 400 }}>{c.kind === "ensemble" ? `${c.label}: ${c.members}` : c.label}</th>
                  <td className={c.precision === best.precision ? "best" : undefined}>{formatMetric(c.precision)}</td>
                  <td className={c.recall === best.recall ? "best" : undefined}>{formatMetric(c.recall)}</td>
                  <td className={c.map50 === best.map50 ? "best" : undefined}>{formatMetric(c.map50)}</td>
                  <td className={c.map5095 === best.map5095 ? "best" : undefined}>{formatMetric(c.map5095)}</td>
                  <td className={c.fps === best.fps ? "best" : undefined}>{c.fps.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Section title="Data and training">
        <dl className="meta-list evidence" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div><dt>Source images</dt><dd>{tomatoDataset.sourceImages.toLocaleString("en-US")} greenhouse images, {tomatoDataset.source}</dd></div>
          <div><dt>Labelled boxes</dt><dd>{total.toLocaleString("en-US")}: {tomatoDataset.boxes.green.toLocaleString("en-US")} green, {tomatoDataset.boxes.orange.toLocaleString("en-US")} orange, {tomatoDataset.boxes.red.toLocaleString("en-US")} red</dd></div>
          <div><dt>Split</dt><dd>{tomatoDataset.split}</dd></div>
          <div><dt>Training</dt><dd>Image size {tomatoTraining.imgsz}, batch {tomatoTraining.batch}, up to {tomatoTraining.epochs} epochs, patience {tomatoTraining.patience}</dd></div>
        </dl>
      </Section>
      <Section title="What it shows">
        <p className="t-prose">
          Architectural changes alone moved mAP@0.5 from {formatMetric(byId["yolov11"].map50)} to {formatMetric(byId["swin-t-mssppf"].map50)} while keeping single-model speed. The three-model ensemble reached {formatMetric(byId["combine-4"].map50)} and the best stricter score, {formatMetric(byId["combine-4"].map5095)}, but ran at {byId["combine-4"].fps.toFixed(1)} frames per second against {byId["yolov11"].fps.toFixed(1)} for the baseline. Reporting them separately keeps that trade-off visible.
        </p>
        <p className="t-prose muted">{project.publicLimitations} The photos on this page are demonstrations.</p>
      </Section>
    </>
  );
}

function Experiment({ project }: { project: WorkspaceProject }) {
  return (
    <>
      <Section title="What it does">
        <p className="t-prose">{project.solution}</p>
        <List items={project.howItWorks} />
      </Section>
      {project.slug === "padel-vision" && project.video && (
        <Section title="Analysed clip">
          <figure style={{ display: "grid", gap: 10 }}>
            <video className="mat" controls preload="none" playsInline poster="/projects/padel-vision/analytics/replay-poster.webp" style={{ width: "100%", height: "auto" }}>
              <source src={project.video} type="video/mp4" />
            </video>
            <figcaption className="t-caption">Plays only when you start it. Source clip: UsaOne Ell on Pexels.</figcaption>
          </figure>
        </Section>
      )}
      {project.gallery && project.gallery.length > 0 && (
        <Screens intro="Renders from the site’s own scene." rows={[{ layout: "halves", shots: project.gallery.slice(0, 4).map((g) => ({ src: g.src, caption: g.caption, alt: g.caption })) }]} />
      )}
      <Section title="Limits and credits">
        <p className="t-prose">{project.publicLimitations}</p>
      </Section>
    </>
  );
}

export function CaseStudy({ project, all }: { project: WorkspaceProject; all: WorkspaceProject[] }) {
  const i = ORDER.indexOf(project.slug);
  const nextSlug = ORDER[(i + 1) % ORDER.length];
  const nextProject = all.find((p) => p.slug === nextSlug)!;
  const next: Next = { slug: nextSlug, title: nextProject.title, kind: kinds[nextSlug], image: nextImage[nextSlug] };
  const s = project.slug;
  return (
    <div className={s === "tomato-ripeness" ? "wrap research-page" : "wrap"}>
      <Head project={project} />
      {s !== "tomato-ripeness" && <Hero slug={s} />}

      {s === "tomato-ripeness" && <Tomato project={project} />}

      {(s === "labstock" || s === "bdrs" || s === "suhulog") && (
        <>
          <Section title="The problem"><p className="t-prose">{project.problem}</p></Section>
          <Section title="My part"><p className="t-prose">{myPart[s]}</p></Section>
          <Section title="Constraints"><List items={constraints[s]} /></Section>
          <Flow slug={s} />
        </>
      )}

      {s === "labstock" && (
        <>
          <Decisions items={[
            { title: "Source identity travels with the row", detail: "Workbook, sheet, row, item identity, unit and period are stored together, so a balance can be traced to the cell it came from." },
            { title: "A repeated import is recognised", detail: "Before an import writes stock movements, LabStock checks whether that source was already applied, so importing the same workbook twice does not double the stock." },
            { title: "Corrections supersede, they don’t overwrite", detail: "A correction records the change and keeps the earlier ledger entry. Reports show the effective value; the history stays available." },
          ]} />
          <Screens
            intro="From the released application against the demo database."
            rows={[
              { layout: "wide-narrow", shots: [
                { src: "/projects/labstock/hari-ini.webp", alt: "LabStock Today view with low stock, expiry and recent movements.", caption: project.gallery![0].caption, ratio: "984 / 700" },
                { src: "/projects/labstock/amprah-mobile.webp", alt: "LabStock requisition form on a phone.", caption: project.gallery![2].caption, ratio: "304 / 700", phone: true },
              ] },
              { layout: "halves", shots: [
                { src: "/projects/labstock/laporan.webp", alt: "LabStock monthly report with corrections and Excel export.", caption: project.gallery![3].caption, ratio: "1440 / 1024" },
                { src: "/projects/labstock/stok.webp", alt: "LabStock stock list with expiry and condition per item.", caption: project.presentation!.stockCaption, ratio: "1440 / 1024" },
              ] },
            ]}
          />
        </>
      )}

      {s === "bdrs" && (
        <>
          <Decisions items={project.decisions!} cols={2} />
          <Screens
            intro="Synthetic fixtures from the final UI archive. No patient or hospital data."
            rows={[
              { layout: "wide-narrow", shots: [
                { src: "/projects/bdrs/episode.webp", alt: "BDRS transfusion episodes list.", caption: project.gallery![5].caption, ratio: "1208 / 950" },
                { src: "/projects/bdrs/readiness.webp", alt: "BDRS finalisation readiness with named blockers.", caption: project.gallery![0].caption, ratio: "480 / 930", phone: true },
              ] },
              { layout: "halves", shots: [
                { src: "/projects/bdrs/pengeluaran.webp", alt: "BDRS issue register.", caption: project.gallery![3].caption, ratio: "1208 / 950" },
                { src: "/projects/bdrs/laporan.webp", alt: "BDRS monthly report centre.", caption: project.gallery![6].caption, ratio: "1208 / 950" },
              ] },
            ]}
          />
        </>
      )}

      {s === "suhulog" && (
        <>
          <Decisions items={[
            { title: "Staff choose the slot; the server stamps the time", detail: "The morning or afternoon slot is a human decision. The recording time is not, so the server sets it." },
            { title: "Flag, never clamp", detail: "Configured ranges mark out-of-range readings for attention. The measured value is stored as measured." },
            { title: "Corrections append", detail: "A correction adds a record that supersedes the previous one. Monthly views and every export read the same effective records." },
          ]} />
          <Screens
            intro="Existing sanitised portfolio captures."
            rows={[
              { layout: "wide-narrow", shots: [
                { src: "/projects/suhulog/desktop-monitoring.webp", alt: "SuhuLog monthly monitoring chart with limits and exceptions.", caption: project.gallery![1].caption, ratio: "1440 / 900" },
                { src: "/projects/suhulog/phone-catat-suhu.webp", alt: "SuhuLog reading entry on a phone with the Pagi and Sore slots.", caption: project.gallery![0].caption, ratio: "780 / 1688", phone: true },
              ] },
              { layout: "halves", shots: [
                { src: "/projects/suhulog/desktop-laporan.webp", alt: "SuhuLog monthly report.", caption: project.gallery![2].caption },
              ] },
            ]}
          />
        </>
      )}

      {(s === "padel-vision" || s === "porsche-3d") && <Experiment project={project} />}

      {(s === "labstock" || s === "bdrs" || s === "suhulog") && (
        <>
          <Evidence items={evidenceFor(project)} />
          <Section title="What is not shown"><p className="t-prose">{project.publicLimitations}</p></Section>
        </>
      )}

      <NextCase next={next} />
    </div>
  );
}
