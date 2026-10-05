"use client";

import { useEffect } from "react";
import { allWorkspaceProjects } from "@/data/workspace";
import { projectPath } from "@/lib/projects";

/**
 * Keeps links shared before V2 working. The workspace addressed projects as
 * /?project=<slug>; those now live at /projects/<slug>/. A static host cannot
 * redirect on a query string, so the home page does it once on load, with
 * replace() so Back does not bounce the visitor into a loop. Unknown slugs are
 * ignored and the home page simply shows.
 */
const KNOWN = new Set(allWorkspaceProjects.map((p) => p.slug));

export function LegacyProjectLink() {
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("project");
    if (slug && KNOWN.has(slug)) window.location.replace(projectPath(slug));
  }, []);
  return null;
}
