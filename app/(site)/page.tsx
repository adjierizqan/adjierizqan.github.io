import Link from "next/link";
import { featuredWork, labWork } from "@/data/workspace";
import { identity } from "@/data/profile";
import { tomatoConfigurations, tomatoMatchedScene, formatMetric } from "@/data/tomatovision";
import { about, hero, homeEntries, JAGAU_URL } from "@/data/personal-site";
import { Img } from "@/components/site/Img";
import { CopyEmail } from "@/components/site/CopyEmail";

const project = (slug: string) => [...featuredWork, ...labWork].find((p) => p.slug === slug)!;

function Meta({ items }: { items: [string, string][] }) {
  return (
    <dl className="meta-list">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EntryText({ slug, className }: { slug: string; className?: string }) {
  const e = homeEntries[slug];
  return (
    <div className={`entry-text ${className ?? ""}`}>
      <div className="entry-title">
        <h3 className="t-h2">{project(slug).title}</h3>
        <p className="muted">{e.kind}</p>
      </div>
      <p className="t-prose">{e.summary}</p>
      {e.meta.length > 0 && <Meta items={e.meta} />}
      <p><Link href={`/projects/${slug}/`} className="link">{e.link}</Link></p>
    </div>
  );
}

export default function Home() {
  const tomato = Object.fromEntries(tomatoConfigurations.map((c) => [c.id, c]));
  const figures = [
    { scene: tomatoMatchedScene[0], label: "YOLOv11 baseline", value: tomato["yolov11"].map50, note: null },
    { scene: tomatoMatchedScene[1], label: "Best single model", value: tomato["swin-t-mssppf"].map50, note: "Swin-T + MS-SPPF" },
    { scene: tomatoMatchedScene[2], label: "Three-model WBF", value: tomato["combine-4"].map50, note: `${tomato["combine-4"].fps.toFixed(1)} fps vs ${tomato["yolov11"].fps.toFixed(1)} baseline` },
  ];
  return (
    <>
      <section className="wrap hero grid" aria-labelledby="hero-title">
        <ul className="col-margin hero-meta">
          {hero.meta.map((line) => <li key={line}>{line}</li>)}
        </ul>
        <div className="col-main hero-main">
          <h1 id="hero-title" className="t-display hero-title">
            {hero.before}
            <del aria-hidden="true"><span>{hero.replaced}</span></del>{" "}
            <ins>{hero.replacement}</ins>
            {hero.after}
          </h1>
          <p className="t-lead">{hero.lead}</p>
          <div className="actions">
            <a className="button" href={`mailto:${identity.contact.email}`}>Email me</a>
            <a className="link" href={identity.contact.resumeTarget}>Download résumé (PDF)</a>
            <a className="link" href={identity.contact.github}>GitHub</a>
            <a className="link" href={identity.contact.linkedin}>LinkedIn</a>
          </div>
        </div>
      </section>

      <section className="wrap" aria-labelledby="work-title">
        <div className="grid work-head">
          <h2 id="work-title" className="t-h2 col-margin">Selected work</h2>
          <p className="col-main muted">Four projects from 2026. Product screens use demo or synthetic data.</p>
        </div>

        <article className="grid entry entry-labstock">
          <figure className="entry-media mat">
            <Img src="/projects/labstock/thumb-reset-a.webp" alt="LabStock on a laptop and a phone: the Today view and the requisition form, with demo data." sizes="(max-width: 899px) 100vw, 860px" />
          </figure>
          <EntryText slug="labstock" />
        </article>

        <article className="grid entry entry-bdrs">
          <EntryText slug="bdrs" />
          <figure className="entry-media mat bdrs-composite">
            <Img className="workstation" src="/projects/bdrs/workstation.webp" alt="BDRS case workstation for a synthetic patient, showing request lines, bags and the event timeline." sizes="(max-width: 899px) 100vw, 700px" />
            <span className="readiness"><Img src="/projects/bdrs/readiness.webp" alt="Finalisation refused, with named readiness checks that are still open." sizes="214px" /></span>
            <figcaption className="t-caption">Synthetic case. Named readiness checks explain why finalisation is refused.</figcaption>
          </figure>
        </article>

        <article className="grid entry entry-suhulog">
          <figure className="entry-media mat">
            <Img src="/projects/suhulog/device-story.webp" alt="SuhuLog on a phone, recording a reading for a morning slot, and on a laptop, showing a month of readings against configured limits." sizes="(max-width: 899px) 100vw, 1000px" />
          </figure>
          <div className="entry-title s-title">
            <h3 className="t-h2">SuhuLog</h3>
            <p className="muted">{homeEntries.suhulog.kind}</p>
          </div>
          <p className="t-prose s-summary">{homeEntries.suhulog.summary}</p>
          <div className="s-meta">
            <Meta items={homeEntries.suhulog.meta} />
            <p><Link href="/projects/suhulog/" className="link">{homeEntries.suhulog.link}</Link></p>
          </div>
        </article>

        <article className="grid entry entry-tomato">
          <EntryText slug="tomato-ripeness" />
          <div className="tomato-figures">
            <div className="tomato-row">
              {figures.map((f) => (
                <figure key={f.label}>
                  <div className="mat"><Img src={f.scene.src} alt={f.scene.alt} sizes="(max-width: 899px) 33vw, 302px" /></div>
                  <figcaption>
                    <span className="t-small muted" style={{ display: "block" }}>{f.label}</span>
                    <span className="t-figure" style={{ display: "block" }}>{formatMetric(f.value)}</span>
                    {f.note && <span className="t-caption" style={{ display: "block" }}>{f.note}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="t-caption" style={{ marginTop: 16 }}>mAP@0.5 from the thesis results. The photo is a demonstration on a Wikimedia image (Kolforn, CC BY-SA 4.0), not evaluation data.</p>
          </div>
        </article>
      </section>

      <section className="wrap" aria-labelledby="exp-title">
        <div className="grid section">
          <div className="col-margin">
            <h2 id="exp-title" className="t-h3">Experiments</h2>
            <p className="t-small muted" style={{ marginTop: 8 }}>Prototypes, not products.</p>
          </div>
          <div className="col-main exp-list">
            <Link href="/projects/padel-vision/" className="exp">
              <span className="mat"><Img src="/projects/padel-vision/cover-final.webp" alt="Padel court from above with four tracked players and the ball labelled." sizes="176px" /></span>
              <span style={{ display: "grid", gap: 6 }}>
                <span className="exp-title">Padel Vision</span>
                <span className="t-small">Tracks four players and the ball from one camera and projects play onto a court map. Tracking is imperfect and contacts are unmarked.</span>
                <span className="t-caption">Clip: UsaOne Ell, Pexels</span>
              </span>
            </Link>
            <Link href="/projects/porsche-3d/" className="exp">
              <span className="mat"><Img src="/projects/porsche-3d/cover-final.webp" alt="Orange RWB 964 rendered in the site’s Three.js scene." sizes="176px" /></span>
              <span style={{ display: "grid", gap: 6 }}>
                <span className="exp-title">Porsche 3D</span>
                <span className="t-small">A Three.js car viewer with live paint changes and camera transitions between six models. No build step.</span>
                <span className="t-caption">Fan project. Car models by Ddiaz Design.</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="wrap" aria-labelledby="about-title">
        <div className="grid section">
          <h2 id="about-title" className="t-h2 col-margin">About</h2>
          <div className="col-main about-main">
            <div className="about-prose">
              <p className="t-lead">{about.lead}</p>
              <p className="t-prose">
                I run <a className="inline-link" href={JAGAU_URL}>JAGAU</a>, an independent software studio. I work with AI coding tools and take responsibility for what ships: requirements, data model, tests, release and handover documents.
              </p>
            </div>
            <div className="record">
              <section aria-labelledby="edu">
                <h3 id="edu" className="t-small muted">Education</h3>
                <ul>
                  <li><span className="strong">Tamkang University, 2026</span><span className="t-small muted">Master’s, Computer Science and Information Engineering. Thesis: TomatoVision.</span></li>
                  <li><span className="strong">Telkom University, 2023</span><span className="t-small muted">Bachelor’s, Software Engineering</span></li>
                </ul>
              </section>
              <section aria-labelledby="work-record">
                <h3 id="work-record" className="t-small muted">Work</h3>
                <ul>{about.work.map(([a, b]) => <li key={a}><span className="strong">{a}</span><span className="t-small muted">{b}</span></li>)}</ul>
              </section>
              <section aria-labelledby="tools">
                <h3 id="tools" className="t-small muted">What I work with</h3>
                <ul>{about.tools.map(([a, b]) => <li key={a}><span className="strong">{a}</span><span className="t-small muted">{b}</span></li>)}</ul>
              </section>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="wrap" aria-labelledby="contact-title">
        <div className="section contact">
          <h2 id="contact-title" className="t-h1">Hiring for a remote engineering role?</h2>
          <div className="contact-email">
            <a href={`mailto:${identity.contact.email}`}>{identity.contact.email}</a>
            <CopyEmail email={identity.contact.email} />
          </div>
          <div className="actions">
            <a className="link" href={identity.contact.resumeTarget}>Download résumé (PDF)</a>
            <a className="link" href={identity.contact.github}>GitHub</a>
            <a className="link" href={identity.contact.linkedin}>LinkedIn</a>
          </div>
        </div>
      </section>
    </>
  );
}
