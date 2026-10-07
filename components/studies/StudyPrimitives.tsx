"use client";
import Image from "next/image";
import type { WorkspaceProject } from "@/data/workspace";
import { playUISound } from "@/components/workspace/UISound";
import "./studies.css";
export type StudyProps = { project: WorkspaceProject; openImage: (index: number, trigger: HTMLElement) => void };
export function Media({ project, index, openImage, className = "", priority = false }: StudyProps & { index: number; className?: string; priority?: boolean }) {
  const item = index === 0 ? { src: project.image!, caption: project.title + " · public product evidence" } : project.gallery![index - 1];
  return <figure className={`study-media ${className}`}><a href={item.src} onClick={e => { e.preventDefault(); openImage(index, e.currentTarget); }} aria-label={`Quick Look: ${item.caption}`}><Image src={item.src} alt={item.caption} width={1440} height={1000} sizes="(max-width: 760px) 100vw, 1120px" style={{width:"100%",height:"auto"}} preload={priority || undefined}/><span aria-hidden="true">↗</span></a><figcaption>{item.caption}</figcaption></figure>;
}
export function Record({ project }: { project: WorkspaceProject }) { return <dl className="study-record"><div><dt>My contribution</dt><dd>{project.role}</dd></div><div><dt>Built with</dt><dd>{project.stack.join(" · ")}</dd></div></dl>; }
export function Brief({ project }: { project: WorkspaceProject }) { return <section className="study-brief"><div><span className="study-label">The problem</span><h2>Start with the work.</h2><p>{project.problem}</p></div><div><span className="study-label">What I built</span><p>{project.solution}</p></div></section>; }
export function Proof({ project }: { project: WorkspaceProject }) { return <section className="study-proof" id="study-evidence"><header><span className="study-label">Evidence / verification</span><h2>The public record.</h2></header><dl>{project.evidence.map(e=><div key={e.label}><dt>{e.label}</dt><dd>{e.value}</dd></div>)}</dl></section>; }
export function Boundary({ project }: { project: WorkspaceProject }) { return <aside className="study-boundary"><h2>About the evidence</h2><div><p>{project.publicLimitations}</p>{project.assetNote&&<p>{project.assetNote}</p>}</div></aside>; }
export function Steps({ items, active, setActive }: {items:string[];active:number;setActive:(n:number)=>void}) {return <div className="study-controls" role="group" aria-label="Inspect the workflow">{items.map((s,i)=><button key={s} type="button" aria-pressed={i===active} onClick={()=>{playUISound("tap");setActive(i);}}><small>0{i+1}</small>{s}</button>)}</div>;}
