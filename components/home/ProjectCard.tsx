import Image from "next/image";
import Link from "next/link";
import type { WorkspaceProject } from "@/data/workspace";
import { projectPath } from "@/lib/projects";

/**
 * A project on the home page: real product imagery first, then what it is.
 * The whole card is one link to the case study — a real URL, so it opens in a
 * new tab, copies, and works with Back like any other link. The workspace used
 * buttons that rewrote ?project= instead.
 */
export function ProjectCard({ project, size = "primary" }: { project: WorkspaceProject; size?: "primary" | "lab" }) {
  return (
    <Link href={projectPath(project.slug)} className={`pcard pcard-${size}`}>
      {project.thumb && (
        <div className="pcard-media">
          <Image src={project.thumb} alt="" fill sizes={size === "primary" ? "(max-width: 760px) 100vw, 520px" : "(max-width: 760px) 100vw, 340px"} />
        </div>
      )}
      <div className="pcard-body">
        <p className="pcard-kicker">{[project.eyebrow, project.status].filter(Boolean).join(" · ")}</p>
        <h3 className="pcard-title">{project.title}</h3>
        <p className="pcard-summary">{project.summary}</p>
        <span className="pcard-cta">Read the case study <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  );
}
