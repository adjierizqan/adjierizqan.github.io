"use client";
import { useState } from "react";
import { VisibilityVideo } from "./VisibilityVideo";
import {
  Boundary,
  Brief,
  Media,
  Proof,
  Record,
  Steps,
  type StudyProps,
} from "./StudyPrimitives";
export default function LabsStudy(props: StudyProps) {
  const { project: p } = props;
  const [finish, setFinish] = useState(0);
  const car = p.slug === "porsche-3d";
  return (
    <article className={`study ${car ? "study-porsche" : "study-padel"}`}>
      <header className="labs-opener">
        <p className="study-label">
          Labs / {p.eyebrow} / {p.year}
        </p>
        <h1>{p.title}</h1>
        <h2>
          {car ? "Light. Material. Motion." : "From pixels to court space."}
        </h2>
        <p>{p.summary}</p>
      </header>
      {car ? (
        <Media {...props} index={0} priority />
      ) : (
        <figure className="study-video">
          <video
            controls
            playsInline
            preload="metadata"
            poster="/projects/padel-vision/real/pexels-analyzed-poster.webp"
            aria-label="Padel Vision annotated licensed match clip"
          >
            <source
              src="/projects/padel-vision/real/pexels-analyzed.mp4"
              type="video/mp4"
            />
          </video>
          <figcaption>
            Pipeline output on licensed drone footage · visitor-controlled
            playback
          </figcaption>
        </figure>
      )}
      <Record project={p} />
      <Brief project={p} />
      <section className="study-section">
        <header className="study-heading">
          <span className="study-label">01 / The pipeline</span>
          <h2>
            {car
              ? "A scene you can change."
              : "A moving camera. A stable reference."}
          </h2>
        </header>
        <ol className="labs-pipeline">
          {p.howItWorks.map((s, i) => (
            <li key={s}>
              <span>0{i + 1}</span>
              <p>{s}</p>
            </li>
          ))}
        </ol>
      </section>
      {car ? (
        <section className="study-section">
          <header className="study-heading">
            <span className="study-label">02 / Material study</span>
            <h2>
              Same model.
              <br />
              <em>Different surface.</em>
            </h2>
            <p>
              Captured in the original Three.js scene. Select a finish to
              inspect its rendered result.
            </p>
          </header>
          <Steps
            items={[
              "GT Silver · metallic",
              "Guards Red · gloss",
              "Jet Black · matte",
            ]}
            active={finish}
            setActive={setFinish}
          />
          <Media {...props} index={finish + 3} />
          <figure className="study-recording">
            <VisibilityVideo src={p.video!} poster={p.image} />
            <figcaption>Original configurator recording · material and camera transitions</figcaption>
          </figure>
        </section>
      ) : (
        <section className="study-section padel-observation">
          <span className="study-label">02 / What the clip can show</span>
          <h2>
            Inspect the output.
            <br />
            <em>Keep the uncertainty.</em>
          </h2>
          <p>
            Player identities, ball tracking and the court inset are generated
            by the pipeline. Camera drift is registered against the first frame
            before projection. Hit markers require a ball turn within a player’s
            reach; some contacts remain unmarked.
          </p>
          <p>
            Footage by{" "}
            <a href="https://www.pexels.com/video/aerial-view-of-exciting-padel-match-33444758/">
              UsaOne Ell
            </a>
            , used under the{" "}
            <a href="https://www.pexels.com/license/">Pexels License</a>. This
            public demonstration uses licensed drone footage; development
            broadcast footage is not published.
          </p>
        </section>
      )}
      <Proof project={p} />
      <Boundary project={p} />
      {car && (
        <p className="study-credit">
          Models: <a href="https://sketchfab.com/ddiaz-design">Ddiaz Design</a>,
          non-commercial terms. Fan-made project; no Porsche affiliation.
          Porsche marks belong to their respective owner.
        </p>
      )}
    </article>
  );
}
