import type { Metadata } from "next";
import { allWorkspaceProjects, type WorkspaceProject } from "@/data/workspace";
import { identity } from "@/data/profile";

/**
 * Lookup, URL and metadata for project case-study pages.
 *
 * Pure functions over the canonical project data, kept out of the page module
 * so the route, the metadata and the tests all read one mapping. Nothing here
 * restates a project fact: titles, descriptions and images all come from
 * data/workspace.ts.
 */

/** Canonical public path. trailingSlash is on, so the slash is part of it. */
export function projectPath(slug: string): string {
  return `/projects/${slug}/`;
}

export function getProject(slug: string): WorkspaceProject | undefined {
  return allWorkspaceProjects.find((project) => project.slug === slug);
}

export function projectTitle(project: WorkspaceProject): string {
  return `${project.title} — ${identity.name}`;
}

/**
 * Card image for link previews. `thumb` is the curated, public-safe card image
 * every project already has (content tests check it exists). It is WebP;
 * some networks, notably LinkedIn, do not render WebP previews, so a dedicated
 * JPG/PNG preview image is left to the identity/OG work.
 */
function previewImage(project: WorkspaceProject): string | undefined {
  return project.thumb ?? project.image;
}

export function projectMetadata(project: WorkspaceProject): Metadata {
  const url = projectPath(project.slug);
  const title = projectTitle(project);
  const description = project.summary; // 129–161 chars, used verbatim
  const image = previewImage(project);
  const images = image ? [{ url: image, alt: `${project.title} — project image` }] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url,
      siteName: identity.name,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
