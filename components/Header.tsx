import Link from "next/link";
import { site } from "@/data/site";

export function Header() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-line/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[90rem] items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight transition-colors hover:text-accent"
        >
          Adjie Rizqan
        </Link>
        <nav className="flex items-center gap-3 text-sm text-muted sm:gap-5" aria-label="Primary">
          <Link
            href="/#projects"
            className="hidden transition-colors hover:text-foreground sm:inline"
          >
            Projects
          </Link>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden transition-colors hover:text-foreground sm:inline"
          >
            GitHub
          </a>
          <a
            href={`mailto:${site.email}`}
            className="rounded-full border border-line bg-card px-3.5 py-1.5 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
