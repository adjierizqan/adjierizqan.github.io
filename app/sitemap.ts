import type { MetadataRoute } from "next";
import { allWorkspaceProjects } from "@/data/workspace";
import { SITE_URL } from "@/data/personal-site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...allWorkspaceProjects.map((p) => `/projects/${p.slug}/`)].map((path) => ({ url: `${SITE_URL}${path}` }));
}
