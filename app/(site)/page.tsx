import Link from "next/link";
import { allWorkspaceProjects } from "@/data/workspace";
import { identity } from "@/data/profile";
import { education, experimentRows, intro, workRows } from "@/data/personal-site";
import { Img } from "@/components/site/Img";
import { AskBox } from "@/components/site/AskBox";
import { CopyEmail } from "@/components/site/CopyEmail";
import { Footer } from "@/components/site/Footer";

const title = (slug: string) => allWorkspaceProjects.find((p) => p.slug === slug)!.title;

export default function Home() {
  return (
    <div className="col">
      <header className="me">
        {/* Initials stand in until a real photo is approved. */}
        <span className="avatar" aria-hidden="true">AR</span>
        <div>
          <h1>{identity.name}</h1>
          <p className="small muted">{intro.tagline}</p>
        </div>
      </header>

      <div className="intro">
        <p>{intro.first}</p>
        <p>{intro.second}</p>
      </div>

      <p className="links">
        <a href={`mailto:${identity.contact.email}`}>{identity.contact.email}</a>
        <CopyEmail email={identity.contact.email} />
        <a href={identity.contact.resumeTarget}>Résumé (PDF)</a>
        <a href={identity.contact.github}>GitHub</a>
        <a href={identity.contact.linkedin}>LinkedIn</a>
      </p>

      <AskBox email={identity.contact.email} />

      <h2 className="label">Work</h2>
      <ul className="list">
        {workRows.map((r) => (
          <li key={r.slug}>
            <Link href={`/projects/${r.slug}/`} className="item">
              <span className="thumb">{r.thumb && <Img src={r.thumb} alt="" sizes="132px" />}</span>
              <span>
                <span className="name">{title(r.slug)}</span>
                <span className="kind">{r.kind}</span>
                <span className="desc">{r.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="label">Experiments</h2>
      <ul className="list">
        {experimentRows.map((r) => (
          <li key={r.slug}>
            <Link href={`/projects/${r.slug}/`} className="item no-thumb">
              <span>
                <span className="name">{title(r.slug)}</span>
                <span className="kind">{r.kind}</span>
                <span className="desc">{r.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="label">Education</h2>
      <ul className="edu">
        {education.map(([a, b]) => (
          <li key={a}><span className="strong">{a}</span><br /><span className="small muted">{b}</span></li>
        ))}
      </ul>

      <Footer />
    </div>
  );
}
