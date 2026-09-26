"use client";

import { useEffect, useRef, useState } from "react";
import data from "@/data/padel-analytics.json";
import "./padel.css";

// Portfolio-native views of Padel Vision's own tracking output (data/padel-analytics.json, exported by
// docs/design/padel-vision/export_analytics.py). No broadcast pixels are shown.

type Arc = { t_start: number; horiz_dist_m: number; apex_m: number; flight_s: number; speed_3d_kmh: number; points: number[][] };
type PlayerStats = { team: string; distance_m: number; avg_speed_kmh: number; net_occupation_pct: number };

const W = data.court_m.width;
const L = data.court_m.length;
const SERVICE = data.court_m.service_from_net;
const TEAM_COLOR: Record<string, string> = { Far: "#48bff0", Near: "#f5a623" };
const teamOf = (index: number) => data.players[index].team;

function CourtLines({ scale }: { scale: number }) {
  const s1 = (L / 2 - SERVICE) * scale;
  const s2 = (L / 2 + SERVICE) * scale;
  const mid = (W / 2) * scale;
  return (
    <g className="pv-lines">
      <rect x="0" y="0" width={W * scale} height={L * scale} />
      <line x1="0" x2={W * scale} y1={s1} y2={s1} />
      <line x1="0" x2={W * scale} y1={s2} y2={s2} />
      <line x1={mid} x2={mid} y1={s1} y2={s2} />
      <line className="pv-net" x1="-4" x2={W * scale + 4} y1={(L / 2) * scale} y2={(L / 2) * scale} />
    </g>
  );
}

function Minimap() {
  const scale = 26;
  const frames = data.tracks_m.length;
  const [index, setIndex] = useState(Math.round(frames * 0.42));
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      if (now - last >= (1000 / data.fps) * data.track_step) {
        last = now;
        setIndex((value) => (value + 1) % frames);
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [frames, playing]);
  const trail = 15;
  const seconds = (index * data.track_step) / data.fps;
  return (
    <figure className="pv-figure pv-minimap">
      <svg viewBox={`-12 -12 ${W * scale + 24} ${L * scale + 24}`} role="img" aria-label={`Top-down positions of the four tracked players at ${seconds.toFixed(1)} seconds`}>
        <rect className="pv-surface" x="0" y="0" width={W * scale} height={L * scale} />
        <CourtLines scale={scale} />
        {[0, 1, 2, 3].map((p) => {
          const from = Math.max(0, index - trail);
          const pts = data.tracks_m.slice(from, index + 1).map((frame) => frame[p]);
          const [x, y] = data.tracks_m[index][p];
          return (
            <g key={p}>
              <polyline className="pv-trail" points={pts.map(([px, py]) => `${px * scale},${py * scale}`).join(" ")} stroke={TEAM_COLOR[teamOf(p)]} />
              <circle cx={x * scale} cy={y * scale} r="9" fill={TEAM_COLOR[teamOf(p)]} className="pv-player" />
              <text x={x * scale + 13} y={y * scale + 4} className="pv-player-label">{data.players[p].id}</text>
            </g>
          );
        })}
      </svg>
      <div className="pv-timeline">
        <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Pause replay" : "Play replay"}>{playing ? "Pause" : "Play"}</button>
        <div className="pv-scrub">
          <input type="range" min="0" max={frames - 1} value={index} onChange={(event) => { setPlaying(false); setIndex(Number(event.target.value)); }} aria-label="Replay position" />
          <div className="pv-hits" aria-hidden="true">{data.hits_frame.map((hit) => <i key={hit} style={{ left: `${(hit / data.frames) * 100}%` }} />)}</div>
        </div>
        <span>{seconds.toFixed(1)} / {data.duration_s.toFixed(1)} s</span>
      </div>
      <figcaption>Ticks on the timeline mark the {data.hits_frame.length} detected hits.</figcaption>
    </figure>
  );
}

function CourtControl() {
  const scale = 26;
  const rows = data.control_far.length;
  const cols = data.control_far[0].length;
  const cw = (W * scale) / cols;
  const ch = (L * scale) / rows;
  const mix = (far: number) => {
    const a = [72, 191, 240]; const b = [245, 166, 35];
    return `rgb(${a.map((v, i) => Math.round(v * far + b[i] * (1 - far))).join(" ")})`;
  };
  return (
    <figure className="pv-figure pv-control">
      <svg viewBox={`-12 -12 ${W * scale + 24} ${L * scale + 24}`} role="img" aria-label={`Court control map; the far team controls ${data.far_control_pct}% of the court`}>
        {data.control_far.map((row, r) => row.map((far, c) => <rect key={`${r}-${c}`} x={c * cw} y={r * ch} width={cw + .5} height={ch + .5} fill={mix(far)} />))}
        <CourtLines scale={scale} />
      </svg>
      <div className="pv-readout">
        <p><strong style={{ color: TEAM_COLOR.Far }}>{data.far_control_pct}%</strong><span>Far team (P1, P2)</span></p>
        <p><strong style={{ color: TEAM_COLOR.Near }}>{(100 - data.far_control_pct).toFixed(1)}%</strong><span>Near team (P3, P4)</span></p>
        <small>Share of court cells whose nearest player is on each team, averaged over {data.duration_s} s.</small>
      </div>
    </figure>
  );
}

function Heatmaps() {
  const scale = 12;
  return (
    <figure className="pv-figure pv-heat">
      <div>
        {data.heat.map((grid, p) => {
          const rows = grid.length; const cols = grid[0].length;
          const cw = (W * scale) / cols; const ch = (L * scale) / rows;
          const color = TEAM_COLOR[teamOf(p)];
          return (
            <svg key={p} viewBox={`-6 -6 ${W * scale + 12} ${L * scale + 12}`} role="img" aria-label={`Occupancy heatmap for ${data.players[p].id}`}>
              <rect className="pv-surface" x="0" y="0" width={W * scale} height={L * scale} />
              {grid.map((row, r) => row.map((v, c) => v > 0.02 ? <rect key={`${r}-${c}`} x={c * cw} y={r * ch} width={cw + .3} height={ch + .3} fill={color} fillOpacity={Math.min(1, v * 1.1)} /> : null))}
              <CourtLines scale={scale} />
              <text x={W * scale - 4} y={L * scale - 8} textAnchor="end" className="pv-heat-label">{data.players[p].id}</text>
            </svg>
          );
        })}
      </div>
      <figcaption>Brighter means more time spent there. P1 and P2 play the far half, P3 and P4 the near half.</figcaption>
    </figure>
  );
}

function BallArcs() {
  // Oblique view: court length runs left to right, width recedes, height rises.
  const k = 26; const lift = 36; // px per metre of height; the tallest arc is ~4.1 m
  const proj = ([x, y, z]: number[]) => [20 + y * k + x * k * 0.3, 285 - x * k * 0.38 - z * lift];
  const arcs = data.arcs as Arc[];
  const speeds = arcs.map((a) => a.speed_3d_kmh);
  const lo = Math.min(...speeds); const hi = Math.max(...speeds);
  const color = (v: number) => {
    const t = (v - lo) / (hi - lo || 1);
    const a = [72, 191, 240]; const b = [245, 166, 35];
    return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * t)).join(" ")})`;
  };
  const corner = (x: number, y: number) => proj([x, y, 0]).join(",");
  const net = [proj([0, L / 2, 0]), proj([W, L / 2, 0]), proj([W, L / 2, 0.88]), proj([0, L / 2, 0.88])];
  const fastest = arcs.reduce((a, b) => (b.speed_3d_kmh > a.speed_3d_kmh ? b : a));
  return (
    <figure className="pv-figure pv-arcs">
      <svg viewBox="0 20 660 300" role="img" aria-label={`${arcs.length} reconstructed ball arcs; the fastest is ${fastest.speed_3d_kmh} km/h`}>
        <polygon className="pv-surface" points={[corner(0, 0), corner(0, L), corner(W, L), corner(W, 0)].join(" ")} />
        <polygon className="pv-court-edge" points={[corner(0, 0), corner(0, L), corner(W, L), corner(W, 0)].join(" ")} />
        {[L / 2 - SERVICE, L / 2 + SERVICE].map((y) => <line key={y} className="pv-court-edge" x1={proj([0, y, 0])[0]} y1={proj([0, y, 0])[1]} x2={proj([W, y, 0])[0]} y2={proj([W, y, 0])[1]} />)}
        <polygon className="pv-netplane" points={net.map((p) => p.join(",")).join(" ")} />
        {arcs.map((arc, i) => <polyline key={i} className="pv-arc" stroke={color(arc.speed_3d_kmh)} points={arc.points.map((p) => proj(p).join(",")).join(" ")} />)}
        <text x={proj([0, 0, 0])[0]} y={proj([0, 0, 0])[1] + 18} className="pv-axis">far baseline</text>
        <text x={proj([W, L, 0])[0]} y={proj([W, L, 0])[1] + 18} textAnchor="end" className="pv-axis">near baseline</text>
      </svg>
      <div className="pv-readout is-row">
        <p><strong>{arcs.length}</strong><span>shots rebuilt</span></p>
        <p><strong>{lo.toFixed(0)}–{hi.toFixed(0)}</strong><span>km/h, 3D launch speed</span></p>
        <p><strong>{fastest.apex_m.toFixed(2)} m</strong><span>apex of the fastest</span></p>
      </div>
      <figcaption>Monocular video has no depth, so each shot between two detected hits is fitted as a gravity parabola; colour runs from slow (blue) to fast (amber).</figcaption>
    </figure>
  );
}

function Movement() {
  const stats = data.stats as unknown as Record<string, PlayerStats>;
  return (
    <figure className="pv-figure pv-movement">
      <table>
        <thead><tr><th scope="col">Player</th><th scope="col">Team</th><th scope="col">Distance</th><th scope="col">Avg pace</th><th scope="col">Near net</th></tr></thead>
        <tbody>{data.players.map((p) => { const s = stats[p.id]; return <tr key={p.id}><th scope="row">{p.id}</th><td><i style={{ background: TEAM_COLOR[s.team] }} />{s.team}</td><td>{s.distance_m} m</td><td>{s.avg_speed_kmh} km/h</td><td>{s.net_occupation_pct}%</td></tr>; })}</tbody>
      </table>
      <figcaption>Over {data.duration_s} s of play. &quot;Near net&quot; is time within 4 m of the net. Metric values rest on a court calibration estimated from the broadcast frame, so treat them as estimates.</figcaption>
    </figure>
  );
}

const views = [
  { label: "Minimap", note: "The four tracked players on the 10 × 20 m court, replayed.", View: Minimap },
  { label: "Court control", note: "Which team is closest to each part of the court.", View: CourtControl },
  { label: "Heatmaps", note: "Where each player spent the clip.", View: Heatmaps },
  { label: "Ball arcs", note: "Shots rebuilt in 3D between detected hits.", View: BallArcs },
  { label: "Movement", note: "Distance, pace and time near the net per player.", View: Movement },
];

export function PadelAnalytics() {
  const [active, setActive] = useState(0);
  const { View } = views[active];
  return (
    <section className="aw-padel-player" aria-label="Padel Vision tracking output">
      <header><div><span>What the system sees</span><h2>One {Math.round(data.duration_s)}-second broadcast clip, rebuilt as court data.</h2></div><small>{String(active + 1).padStart(2, "0")} / {String(views.length).padStart(2, "0")}</small></header>
      <div className="aw-padel-stage-grid">
        <div className="pv-visual" key={active}><View /></div>
        <div role="tablist" aria-label="Tracking output views">{views.map((item, index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} key={item.label} onClick={() => setActive(index)}><small>{String(index + 1).padStart(2, "0")}</small><strong>{item.label}</strong><p>{item.note}</p></button>)}</div>
      </div>
      <p className="pv-boundary">Drawn from the pipeline&apos;s tracking output. Broadcast frames are not shown here; the footage belongs to its rights holder.</p>
    </section>
  );
}
