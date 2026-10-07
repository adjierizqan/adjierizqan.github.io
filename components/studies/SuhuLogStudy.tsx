"use client";
import { useState } from "react";
import {
  Boundary,
  Brief,
  Media,
  Proof,
  Record,
  Steps,
  type StudyProps,
} from "./StudyPrimitives";
export default function SuhuLogStudy(props: StudyProps) {
  const { project: p } = props;
  const [step, setStep] = useState(0);
  const indices = [4, 1, 2, 3];
  return (
    <article className="study study-suhu">
      <header className="suhu-opener">
        <div>
          <p className="study-label">Operational software / {p.year}</p>
          <h1>SuhuLog</h1>
          <h2>
            At the point of work.
            <br />
            <em>In the monthly record.</em>
          </h2>
          <p>{p.summary}</p>
          <a href="#suhu-loop">Follow a reading ↓</a>
        </div>
        <Media {...props} index={1} priority className="suhu-phone" />
      </header>
      <Record project={p} />
      <Brief project={p} />
      <section id="suhu-loop" className="study-section">
        <header className="study-heading">
          <span className="study-label">01 / From capture to review</span>
          <h2>
            One reading.
            <br />
            <em>Two working scales.</em>
          </h2>
          <p>
            The phone captures the reading. The larger screen makes the month
            inspectable.
          </p>
        </header>
        <Steps
          items={["QR entry", "Record", "Monitor", "Report"]}
          active={step}
          setActive={setStep}
        />
        <div className="suhu-inspector">
          <div>
            <h3>
              {
                [
                  "The right point, already resolved.",
                  "Pagi or Sore. One effective entry.",
                  "Exceptions stay visible.",
                  "The same records, ready to hand over.",
                ][step]
              }
            </h3>
            <p>{p.howItWorks[[0, 1, 2, 4][step]]}</p>
            <p className="study-note">
              Select a stage to inspect the workflow.
            </p>
          </div>
          {step === 0 ? (
            <div
              className="suhu-qr-route"
              aria-label="QR entry resolves the exact monitoring point"
            >
              <span>QR label</span>
              <b aria-hidden="true">↓</b>
              <span>Exact monitoring point</span>
              <b aria-hidden="true">↓</b>
              <span>Authenticated entry</span>
              <p className="study-note">
                Workflow diagram · no scannable destination published
              </p>
            </div>
          ) : (
            <Media
              {...props}
              index={indices[step]}
              className={step === 1 ? "suhu-phone" : ""}
            />
          )}
        </div>
        <ol className="suhu-rules">
          {p.howItWorks.map((rule, i) => (
            <li key={rule}>
              <span>0{i + 1}</span>
              <p>{rule}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="study-section">
        <header className="study-heading">
          <span className="study-label">02 / Desktop monitoring</span>
          <h2>
            Read the month.
            <br />
            <em>Keep the exceptions.</em>
          </h2>
          <p>
            Configured limits provide context. An out-of-range measurement
            remains a measurement; it is never clamped into a reassuring number.
          </p>
        </header>
        <Media {...props} index={2} />
      </section>
      <section className="suhu-correction study-section">
        <span className="study-label">03 / Engineering decision</span>
        <h2>
          Correct the record.
          <br />
          <em>Keep its history.</em>
        </h2>
        <div className="correction-line">
          <span>Original reading</span>
          <b aria-hidden="true">→</b>
          <span>Reason + attribution</span>
          <b aria-hidden="true">→</b>
          <span>Effective replacement</span>
        </div>
        <p>{p.howItWorks[3]}</p>
      </section>
      <section className="study-section">
        <header className="study-heading">
          <span className="study-label">04 / Reporting</span>
          <h2>A report people can use.</h2>
          <p>{p.howItWorks[4]}</p>
        </header>
        <Media {...props} index={3} />
      </section>
      <Proof project={p} />
      <Boundary project={p} />
    </article>
  );
}
