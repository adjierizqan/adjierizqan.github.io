"use client";
import Image from "next/image";
import { featuredWork, labWork, type WorkspaceProject } from "@/data/workspace";
import { identity, education } from "@/data/profile";
import { site } from "@/data/site";
import "./home.css";
export function WorkspaceHome({
  selectProject,
  openAsk,
}: {
  selectProject: (p: WorkspaceProject) => void;
  openAsk: () => void;
}) {
  return (
    <main className="aw-center workspace-home aw-enter">
      <header className="home-intro">
        <p>Adjie Rizqan / Software engineer</p>
        <h1>
          Useful software.
          <br />
          <em>Carefully engineered.</em>
        </h1>
        <div>
          <p>{identity.positioning}</p>
          <a href={site.cv} target="_blank" rel="noreferrer">
            Résumé ↗
          </a>
        </div>
      </header>
      <section className="home-selected" aria-labelledby="home-work">
        <header>
          <h2 id="home-work">Selected work</h2>
          <span>Product, systems & research / 2026</span>
        </header>
        <div className="home-work-list">
          {featuredWork.map((p, i) => (
            <a
              href={`/projects/${p.slug}/`}
              key={p.slug}
              onClick={(e) => {
                e.preventDefault();
                selectProject(p);
              }}
              className={`home-project home-project-${i}`}
            >
              <figure>
                <Image
                  src={p.thumb!}
                  alt={p.title + " public project evidence"}
                  width={1600}
                  height={1000}
                  sizes="(max-width:760px) 100vw, 700px"
                  preload={i === 0}
                />
              </figure>
              <div>
                <span>
                  0{i + 1} / {p.eyebrow}
                </span>
                <h3>
                  {p.title}
                  <b aria-hidden="true">↗</b>
                </h3>
                <p>{p.summary}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="home-ask">
        <div>
          <h2>There’s more behind each screen.</h2>
          <p>Ask about the architecture, decisions or evidence.</p>
        </div>
        <button type="button" onClick={openAsk}>
          Ask AI ↗
        </button>
      </section>
      <section className="home-labs">
        <header>
          <h2>From the lab</h2>
          <p>Smaller experiments in perception and interaction.</p>
        </header>
        <div>
          {labWork.map((p) => (
            <a
              href={`/projects/${p.slug}/`}
              key={p.slug}
              onClick={(e) => {
                e.preventDefault();
                selectProject(p);
              }}
            >
              <Image
                src={p.thumb!}
                alt={p.title}
                width={800}
                height={500}
                sizes="(max-width:760px) 100vw, 500px"
              />
              <h3>{p.title} ↗</h3>
              <p>{p.eyebrow}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="home-about">
        <div>
          <h2>Engineering, with context.</h2>
          <p>
            I work across product workflows, data correctness and the interfaces
            people use. My research adds a second perspective: testing models
            and being precise about what the results can support.
          </p>
          <nav aria-label="Contact">
            <a href={`mailto:${site.email}`}>Email ↗</a>
            <a href={site.github}>GitHub ↗</a>
            <a href={site.linkedin}>LinkedIn ↗</a>
          </nav>
        </div>
        <dl>
          {education.map((e) => (
            <div key={e.institution}>
              <dt>{e.institution}</dt>
              <dd>{e.program}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
