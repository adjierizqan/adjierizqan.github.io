import { site } from "@/data/site";

/** Contact, repeated at the end of every page so nobody has to scroll back up. */
export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer-inner">
        <p className="site-footer-name">{site.name}</p>
        <ul className="site-footer-links">
          <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
          <li><a href={site.github} rel="me">GitHub</a></li>
          <li><a href={site.linkedin} rel="me">LinkedIn</a></li>
          <li><a href={site.cv}>Résumé (PDF)</a></li>
        </ul>
      </div>
    </footer>
  );
}
