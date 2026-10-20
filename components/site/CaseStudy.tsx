import Link from "next/link";
import type { WorkspaceProject } from "@/data/workspace";
import { identity } from "@/data/profile";
import { cases, ORDER, releases } from "@/data/personal-site";
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
import { Footer } from "@/components/site/Footer";

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="facts">
      {items.map(([l, v]) => (
        <div key={l}><dt>{l}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section col">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Figure({ src, alt, caption, phone, priority }: { src: string; alt: string; caption: string; phone?: boolean; priority?: boolean }) {
  return (
    <figure className={`figure wide${phone ? " phone" : ""}`}>
      <div className="frame"><Img src={src} alt={alt} priority={priority} sizes={phone ? "320px" : "(max-width: 1000px) 100vw, 960px"} /></div>
      <figcaption className="caption">{caption}</figcaption>
    </figure>
  );
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
  const n = (x: number) => x.toLocaleString("en-US");
  const b = tomatoDataset.boxes;
  return (
    <>
      <div className="col">
        <TomatoFigure
          options={options}
          caption={`The same photo through three configurations: a demonstration on a Wikimedia image by Kolforn (CC BY-SA 4.0), ${tomatoDemo.settings}. Not evaluation data. One red fruit is misclassified and shown unchanged.`}
        />
      </div>
      <Section title="What I compared">
        <p>Greenhouse tomatoes overlap, hide behind leaves and appear at very different sizes. I started from a YOLOv11 baseline, swapped in a Swin Transformer backbone, added multi-scale SPPF, then fused three models with Weighted Boxes Fusion. Each step is measured on its own, so architecture gains and ensemble gains are not mixed into one number.</p>
      </Section>
      <section className="section col">
        <h2 id="results">All seven configurations</h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="results">
          <table className="results">
            <thead><tr><th scope="col">Configuration</th><th scope="col">Precision</th><th scope="col">Recall</th><th scope="col">mAP@0.5</th><th scope="col">mAP@0.5:0.95</th><th scope="col">fps</th></tr></thead>
            <tbody>
              {tomatoConfigurations.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.kind === "ensemble" ? `${c.label}: ${c.members}` : c.label}</th>
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
        <p className="caption">From the thesis results tables. The best value in each column is in bold.</p>
      </section>
      <Section title="What it shows">
        <p>Architecture changes alone moved mAP@0.5 from {formatMetric(byId["yolov11"].map50)} to {formatMetric(byId["swin-t-mssppf"].map50)} at single-model speed. The three-model ensemble reached {formatMetric(byId["combine-4"].map50)}, and the best stricter score of {formatMetric(byId["combine-4"].map5095)}, but ran at {byId["combine-4"].fps.toFixed(1)} frames per second against {byId["yolov11"].fps.toFixed(1)} for the baseline. Reporting them separately keeps that trade-off visible.</p>
      </Section>
      <Section title="Data and training">
        <ul className="bullets">
          <li>{n(tomatoDataset.sourceImages)} greenhouse images from {tomatoDataset.source}, with {n(b.green + b.orange + b.red)} labelled boxes: {n(b.green)} green, {n(b.orange)} orange and {n(b.red)} red.</li>
          <li>Split: {tomatoDataset.split}.</li>
          <li>Training: image size {tomatoTraining.imgsz}, batch {tomatoTraining.batch}, up to {tomatoTraining.epochs} epochs with patience {tomatoTraining.patience}.</li>
        </ul>
      </Section>
      <Section title="What is not claimed">
        <p>{project.publicLimitations} The photos on this page are demonstrations.</p>
      </Section>
    </>
  );
}

export function CaseStudy({ project, all }: { project: WorkspaceProject; all: WorkspaceProject[] }) {
  const s = project.slug;
  const c = cases[s];
  const nextSlug = ORDER[(ORDER.indexOf(s) + 1) % ORDER.length];
  const next = all.find((p) => p.slug === nextSlug)!;
  const facts: [string, string][] =
    s === "tomato-ripeness"
      ? [["Type", "Master’s thesis, Tamkang University, 2026"], ["Role", "Research, model development, evaluation"], ["Built with", project.stack.join(", ")]]
      : [["Role", project.role.replaceAll(" · ", ", ")], ["State", releases[s].state], ["Built with", project.stack.join(", ")]];
  const lead = s === "tomato-ripeness"
    ? "How much of a detection gain comes from changing the architecture, and how much needs an ensemble? My master’s thesis on detecting green, orange and red tomatoes in greenhouse images."
    : c.lead;

  return (
    <article>
      <div className="col">
        <Link href="/" className="home-link">{identity.name}</Link>
        <header className="case-head">
          <h1>{project.title}</h1>
          <p className="lead">{lead}</p>
          <Facts items={facts} />
        </header>
      </div>

      {s === "tomato-ripeness" ? (
        <Tomato project={project} />
      ) : (
        <>
          <Figure {...c.hero} priority />

          {c.problem && (
            <Section title="The problem">
              {c.problem.map((p) => <p key={p}>{p}</p>)}
            </Section>
          )}

          {(s === "padel-vision" || s === "porsche-3d") && (
            <Section title="What it does">
              <p>{project.solution}</p>
              <ul className="bullets">{project.howItWorks.map((h) => <li key={h}>{h}</li>)}</ul>
            </Section>
          )}

          {c.steps && (
            <Section title={c.stepsTitle!}>
              <ol className="steps">{c.steps.map((t) => <li key={t}>{t}</li>)}</ol>
            </Section>
          )}

          {(c.decisions || project.decisions) && s !== "padel-vision" && s !== "porsche-3d" && (
            <Section title="Decisions">
              <div className="decisions">
                {(c.decisions ?? project.decisions!.map((d) => [d.title, d.detail] as [string, string])).map(([a, b]) => (
                  <p key={a}><b>{a}</b> {b}</p>
                ))}
              </div>
            </Section>
          )}

          {s === "padel-vision" && project.video && (
            <figure className="figure wide">
              <video className="frame" controls preload="none" playsInline poster="/projects/padel-vision/analytics/replay-poster.webp">
                <source src={project.video} type="video/mp4" />
              </video>
              <figcaption className="caption">The analysed clip. It plays only when you start it. Source footage by UsaOne Ell on Pexels.</figcaption>
            </figure>
          )}

          {c.screens && (
            <>
              <section className="section col"><h2>Screens</h2></section>
              {c.screens.map((sc) => <Figure key={sc.src} {...sc} />)}
            </>
          )}

          {c.evidence && (
            <Section title="Evidence">
              {c.evidence.map((e) => <p key={e}>{e}</p>)}
            </Section>
          )}

          {c.notShown && (
            <Section title={s === "padel-vision" || s === "porsche-3d" ? "Limits and credits" : "What is not shown"}>
              <p>{c.notShown}</p>
            </Section>
          )}
        </>
      )}

      <div className="col">
        <p className="next">
          <span className="caption">Next</span>
          <Link href={`/projects/${nextSlug}/`}>{next.title}</Link>
          <span className="small muted">{cases[nextSlug]?.kind ?? "Computer vision thesis"}</span>
        </p>
        <Footer />
      </div>
    </article>
  );
}
