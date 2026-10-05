import Link from "next/link";
import { GitHubIcon, LinkedInIcon } from "@/components/Icons";
import { site } from "@/data/site";
import { ThemeToggle } from "./ThemeToggle";

/**
 * One header for every page. Replaces the workspace's window chrome, sidebar,
 * dock and command palette — four overlapping ways to reach the same places —
 * with the few destinations a visitor actually needs, always visible.
 *
 * The name is set as text rather than the old "AR" circles, which identified
 * no one. A designed wordmark or monogram belongs to the identity phase.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-wordmark">{site.name}</Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <a href={site.cv}>Résumé</a>
          <a href={site.github} className="site-icon-link" aria-label="GitHub" rel="me">
            <GitHubIcon className="site-icon" />
          </a>
          <a href={site.linkedin} className="site-icon-link" aria-label="LinkedIn" rel="me">
            <LinkedInIcon className="site-icon" />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
