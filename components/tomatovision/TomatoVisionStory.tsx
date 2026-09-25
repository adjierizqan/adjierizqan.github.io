"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import annotationMaps from "@/data/tomatovision-annotation-maps.json";
import {
  formatMetric,
  tomatoConfigurations,
  tomatoDataset,
  tomatoDemo,
  tomatoMatchedScene,
  tomatoMatchedSceneCount,
  tomatoStatus,
  tomatoTraining,
} from "@/data/tomatovision";
import {
  ArtifactLinks,
  DetectionComparison,
  EditorialSection,
  EvidenceChip,
  Figure,
  MethodDiagram,
  MetricProgression,
  ProjectHero,
  ResearchTable,
} from "@/components/project-story/ProjectStory";
import "./tomatovision.css";

const classColors = ["#22c55e", "#f59e0b", "#ef4444"];
const legend = [
  { label: "green", color: classColors[0] },
  { label: "orange", color: classColors[1] },
  { label: "red", color: classColors[2] },
];
const evidence = {
  thesis: "tv-evidence-thesis",
  results: "tv-evidence-results",
  training: "tv-evidence-training",
  outputs: "tv-evidence-outputs",
  demo: "tv-evidence-demo",
  annotations: "tv-evidence-annotations",
};
const byId = Object.fromEntries(tomatoConfigurations.map((configuration) => [configuration.id, configuration]));
const baseline = byId.yolov11;
const bestSingle = byId["swin-t-mssppf"];
const wbf = byId["combine-4"];
const count = (value: number) => value.toLocaleString("en-US");
const delta = (a: number, b: number) => (a - b).toFixed(3);

type AnnotationMap = { id: string; width: number; height: number; counts: Record<string, number>; boxes: number[][] };

function AnnotationMapFigure({ map, caption }: { map: AnnotationMap; caption: string }) {
  const total = map.boxes.length;
  return (
    <Figure caption={caption}>
      <svg className="tv-annotation-map" viewBox="0 0 1000 750" preserveAspectRatio="none" role="img" aria-label={`${total} annotated fruit boxes from source image ${map.id}`}>
        <rect width="1000" height="750" className="tv-annotation-ground" />
        {map.boxes.map(([cls, x, y, w, h], index) => <rect key={index} x={x} y={y * .75} width={w} height={h * .75} stroke={classColors[cls]} fill={classColors[cls]} className="tv-annotation-box" />)}
      </svg>
    </Figure>
  );
}

function DenseSceneViewer() {
  const [activeId, setActiveId] = useState("combine-4");
  const [position, setPosition] = useState(50);
  const active = byId[activeId];
  const split = activeId !== baseline.id;
  return (
    <div className="tv-scene">
      <div className="tv-scene-tabs" role="tablist" aria-label="Model configuration">
        {tomatoConfigurations.map((configuration) => <button type="button" role="tab" aria-selected={activeId === configuration.id} key={configuration.id} onClick={() => setActiveId(configuration.id)}>{configuration.shortLabel}</button>)}
      </div>
      <div className={"tv-scene-stage" + (split ? " is-split" : "")}>
        <Image src={active.denseSceneImage} alt={`${active.label} detections on a dense public-domain greenhouse photo`} fill sizes="(max-width: 760px) 100vw, 920px" className="object-cover" />
        {split && <>
          <div className="tv-scene-baseline" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}><Image src={baseline.denseSceneImage} alt="" fill sizes="(max-width: 760px) 100vw, 920px" className="object-cover" /></div>
          <i className="tv-scene-handle" aria-hidden="true" style={{ left: position + "%" }}><b /></i>
          <input type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} aria-label={`Divider: YOLOv11 on the left, ${active.label} on the right`} />
        </>}
      </div>
    </div>
  );
}

function SpeedScatter() {
  const x = (ms: number) => 60 + ((ms - 50) / 42) * 440;
  const y = (map: number) => 22 + ((0.83 - map) / 0.04) * 168;
  const labelled: Record<string, { text: string; dx: number; dy: number; anchor: "start" | "end" }> = {
    yolov11: { text: "YOLOv11", dx: 8, dy: 4, anchor: "start" },
    "swin-t-mssppf": { text: "Best single", dx: 8, dy: -6, anchor: "start" },
    "combine-4": { text: "Combine 4", dx: -8, dy: 4, anchor: "end" },
  };
  return (
    <figure className="tv-scatter">
      <svg viewBox="0 0 540 236" role="img" aria-label="mAP@0.5 against milliseconds per image for all seven configurations; filled points are single models, open points are ensembles">
        <text x="16" y="10" className="tv-axis-title is-wide">y: mAP@0.5 (0.79 – 0.83)</text>
        <text x="524" y="10" className="tv-axis-title is-wide" textAnchor="end">x: ms per image (50 – 92)</text>
        <text x="280" y="232" className="tv-axis-title is-narrow" textAnchor="middle">ms per image</text>
        {[0.79, 0.8, 0.81, 0.82, 0.83].map((tick) => <g key={tick}><line x1="60" x2="500" y1={y(tick)} y2={y(tick)} className="tv-grid" /><text x="52" y={y(tick) + 3} textAnchor="end" className="tv-tick">{tick.toFixed(2)}</text></g>)}
        {[50, 60, 70, 80, 90].map((tick) => <text key={tick} x={x(tick)} y="206" textAnchor="middle" className="tv-tick">{tick}</text>)}
        <line x1="60" x2="60" y1="22" y2="190" className="tv-axis" />
        {tomatoConfigurations.map((configuration) => {
          const label = labelled[configuration.id];
          return <g key={configuration.id}>
            <circle cx={x(configuration.msPerImage)} cy={y(configuration.map50)} r="4" className={configuration.kind === "single" ? "tv-point is-single" : "tv-point is-ensemble"} />
            {label && <text x={x(configuration.msPerImage) + label.dx} y={y(configuration.map50) + label.dy} textAnchor={label.anchor} className="tv-point-label">{label.text}</text>}
          </g>;
        })}
      </svg>
      <figcaption className="tv-scatter-key"><span className="tv-scatter-yaxis">y: mAP@0.5</span><span><i className="is-single" /> single model</span><span><i className="is-ensemble" /> WBF ensemble</span></figcaption>
    </figure>
  );
}

function TomatoAsk({ query, setQuery, ask }: { query: string; setQuery: (value: string) => void; ask: (value?: string) => void }) {
  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) ask();
  }
  const suggestions = ["Why does fusion beat the best single model?", "What makes the orange stage hard?"];
  return (
    <section className="tv-ask" aria-labelledby="tv-ask-title">
      <h2 id="tv-ask-title">Ask about TomatoVision</h2>
      <form onSubmit={submit}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about the models, data or results…" aria-label="Ask about TomatoVision" maxLength={800} />
        <button type="submit" disabled={!query.trim()} aria-label="Send question"><span aria-hidden="true">→</span></button>
      </form>
      <div className="tv-ask-suggestions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}</div>
    </section>
  );
}

export function TomatoVisionStory({ progress, query, setQuery, ask }: { progress: number; query: string; setQuery: (value: string) => void; ask: (value?: string) => void }) {
  const maps = annotationMaps as AnnotationMap[];
  const dense = maps.find((map) => map.id === "IMG_4246") ?? maps[3];
  const totalBoxes = tomatoDataset.boxes.green + tomatoDataset.boxes.orange + tomatoDataset.boxes.red;
  const strongest = (key: "precision" | "recall" | "map50" | "map5095") => tomatoConfigurations.reduce((best, item) => item[key] > best[key] ? item : best).id;
  const reveal = (at: number) => progress >= at;

  return (
    <div className="tv-story">
      <ProjectHero
        eyebrow="Research · Computer Vision · Master’s thesis"
        title="TomatoVision"
        summary="Three-class tomato maturity detection in a crowded greenhouse — a YOLOv11 baseline, two architecture changes, and a three-model Weighted Boxes Fusion ensemble."
        status={tomatoStatus}
      />

      {reveal(.08) && <div className="aw-stream-structure"><DetectionComparison
        items={tomatoMatchedScene}
        defaultId="wbf"
        legend={legend}
        caption={<>Portfolio demo: one public-domain photo, outside the thesis dataset, through the three trained models. Every number on this page comes from thesis validation, not from these images. <EvidenceChip label="Demo inference" target={evidence.demo} /></>}
      /></div>}

      {reveal(.16) && <div className="aw-stream-structure"><MetricProgression
        unit="mAP@0.5"
        steps={[
          { value: formatMetric(baseline.map50), label: "YOLOv11" },
          { value: formatMetric(bestSingle.map50), label: "Best single" },
          { value: formatMetric(wbf.map50), label: "Three-model WBF" },
        ]}
      >Architecture changes add {delta(bestSingle.map50, baseline.map50)} mAP@0.5; fusing three detectors adds a further {delta(wbf.map50, bestSingle.map50)}. <EvidenceChip label="Paper Table II" target={evidence.results} /> <EvidenceChip label="Paper Table III" target={evidence.results} /></MetricProgression></div>}

      {reveal(.26) && <EditorialSection index="01" title="The problem" className="aw-stream-structure">
        <p className="ps-lede">Fruit grow in dense clusters, hide behind leaves and stems, and are lit unevenly. The change from green to orange to red is gradual, so the orange stage is the hardest to call.</p>
        <div className="tv-problem-figures">
          <AnnotationMapFigure map={dense} caption={`${count(dense.boxes.length)} annotated fruit in one image · annotation boxes`} />
          <Figure className="tv-problem-secondary" caption="Orange-stage fruit · Combine 4 on a public-domain demo photo">
            <div className="ps-frame is-landscape"><Image src="/projects/tomato-ripeness/research/demo3-combine4.webp" alt="Combine 4 detections on orange-stage tomatoes in a public-domain photo" fill sizes="(max-width: 760px) 100vw, 450px" className="object-cover" /></div>
          </Figure>
        </div>
      </EditorialSection>}

      {reveal(.36) && <EditorialSection index="02" title="What changed" className="aw-stream-structure tv-method" aside={<EvidenceChip label="Training config" target={evidence.training} />}>
        <MethodDiagram label="Detection pipeline" steps={[
          { label: "Input 1280×1280" },
          { label: "YOLOv11 baseline" },
          { label: "Swin-T backbone", detail: "shifted-window attention" },
          { label: "Multi-scale SPPF", detail: "multi-scale features for small, occluded fruit" },
          { label: "three detectors" },
          { label: "Weighted Boxes Fusion", detail: "confidence-weighted box averaging" },
          { label: "Detections" },
        ]} />
        <div className="tv-method-chip"><EvidenceChip label="Training config" target={evidence.training} /></div>
      </EditorialSection>}

      {reveal(.46) && <EditorialSection index="03" title="Same scene, different models" className="aw-stream-structure">
        <DenseSceneViewer />
        <p className="ps-caption">A dense public-domain greenhouse photo through all seven configurations; a qualitative demo, not part of the evaluation. <EvidenceChip label="Demo inference" target={evidence.demo} /></p>
      </EditorialSection>}

      {reveal(.56) && <EditorialSection index="04" title="Experiments" className="aw-stream-structure">
        <ResearchTable
          label="Validation results for all seven configurations"
          secondaryToggle="precision and recall"
          columns={[
            { key: "configuration", label: "Configuration" },
            { key: "precision", label: "Precision", numeric: true, secondary: true },
            { key: "recall", label: "Recall", numeric: true, secondary: true },
            { key: "map50", label: "mAP@0.5", numeric: true },
            { key: "map5095", label: "mAP@0.5:0.95", numeric: true },
          ]}
          strong={{ precision: strongest("precision"), recall: strongest("recall"), map50: strongest("map50"), map5095: strongest("map5095") }}
          rows={tomatoConfigurations.map((item) => ({
            key: item.id,
            emphasis: item.id === wbf.id,
            cells: {
              configuration: <>{item.label}{item.members && <span className="tv-members"> · {item.members}</span>}</>,
              precision: formatMetric(item.precision),
              recall: formatMetric(item.recall),
              map50: formatMetric(item.map50),
              map5095: formatMetric(item.map5095),
            },
          }))}
        />
        <p className="ps-caption">Validation setting: 960 px, conf 0.05, IoU 0.6. <EvidenceChip label="Paper Table II" target={evidence.results} /> <EvidenceChip label="Paper Table III" target={evidence.results} /></p>
      </EditorialSection>}

      {reveal(.66) && <EditorialSection index="05" title="Accuracy vs speed" className="aw-stream-structure">
        <div className="tv-speed">
          <SpeedScatter />
          <ResearchTable
            label="Throughput for the baseline, best single model and Combine 4"
            columns={[{ key: "model", label: "Model" }, { key: "fps", label: "FPS", numeric: true }, { key: "ms", label: "ms", numeric: true }]}
            rows={[{ id: baseline.id, label: "YOLOv11" }, { id: bestSingle.id, label: "Best single" }, { id: wbf.id, label: "Combine 4" }].map(({ id, label }) => ({
              key: id,
              emphasis: id === wbf.id,
              cells: { model: label, fps: byId[id].fps.toFixed(3), ms: byId[id].msPerImage.toFixed(2) },
            }))}
          />
        </div>
        <p className="ps-caption">Throughput at batch 8, FP16, RTX 5090 — not single-image latency. <EvidenceChip label="Paper Table IV" target={evidence.results} /></p>
      </EditorialSection>}

      {reveal(.76) && <EditorialSection index="06" title="Dataset" className="aw-stream-structure">
        <p className="tv-dataset-facts">
          <b>{count(tomatoDataset.sourceImages)} source images</b><i aria-hidden="true"> · </i>
          <b>{count(totalBoxes)} annotated fruit</b><i aria-hidden="true"> · </i>
          <span>green {count(tomatoDataset.boxes.green)}<i aria-hidden="true"> · </i>orange {count(tomatoDataset.boxes.orange)}<i aria-hidden="true"> · </i>red {count(tomatoDataset.boxes.red)}</span><i aria-hidden="true"> · </i>
          <span>{tomatoDataset.source}</span><i aria-hidden="true"> · </i>
          <span>{tomatoDataset.split}</span>
        </p>
        <div className="tv-dataset-maps">
          {maps.map((map) => {
            const classes = Object.entries(map.counts).filter(([, value]) => value > 0);
            return <AnnotationMapFigure key={map.id} map={map} caption={classes.length === 1 ? `${map.boxes.length} ${classes[0][0]}` : `${map.boxes.length} mixed`} />;
          })}
        </div>
        <p className="ps-caption">Annotation boxes drawn from the source label files; the field photographs are not reproduced here. <EvidenceChip label="Annotation files" target={evidence.annotations} /></p>
      </EditorialSection>}

      {reveal(.84) && <EditorialSection index="07" title="What I learned" className="aw-stream-structure">
        <ol className="tv-learned">
          <li>Swin-T gave the largest single-model gain: +{delta(byId["swin-t"].map50, baseline.map50)} mAP@0.5.</li>
          <li>Multi-scale SPPF added +{delta(bestSingle.map50, byId["swin-t"].map50)} and was the fastest single model ({bestSingle.msPerImage.toFixed(2)} ms).</li>
          <li>Fusion helped most: +{delta(wbf.map50, bestSingle.map50)} over the best single model — at {wbf.msPerImage.toFixed(2)} ms instead of {bestSingle.msPerImage.toFixed(2)} ms.</li>
          <li>Limits: one farm, a 160-image validation split, per-model visualisation thresholds; a research result, not a deployed product.</li>
        </ol>
      </EditorialSection>}

      {reveal(.9) && <EditorialSection index="08" title="Evidence" className="aw-stream-structure">
        <ArtifactLinks items={[
          { id: evidence.thesis, label: "Master’s thesis", detail: "research, 2026" },
          { id: "tv-evidence-code", label: "Code", detail: "private research repository" },
          { id: evidence.results, label: "Results tables", detail: "from the validation runs (thesis Tables II–IV)" },
          { id: evidence.training, label: "Training configs", detail: `imgsz ${tomatoTraining.imgsz}, batch ${tomatoTraining.batch}, ${tomatoTraining.epochs} epochs, patience ${tomatoTraining.patience} (args.yaml ×3)` },
          { id: evidence.outputs, label: "Thesis model outputs", detail: `${tomatoMatchedSceneCount} matched scenes × ${tomatoConfigurations.length} configurations; not published (field photos without reuse permission)` },
          { id: evidence.demo, label: "Demo inference", detail: `${tomatoDemo.photos} through the thesis weights; ${tomatoDemo.settings}` },
          { id: evidence.annotations, label: "Annotation files", detail: `${count(tomatoDataset.sourceImages)} Pascal VOC files; the box counts on this page are counted from them` },
        ]} />
      </EditorialSection>}

      {reveal(.96) && <div className="aw-stream-structure"><TomatoAsk query={query} setQuery={setQuery} ask={ask} /></div>}
    </div>
  );
}
