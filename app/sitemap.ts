import type { MetadataRoute } from "next";
import { allWorkspaceProjects } from "@/data/workspace";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...allWorkspaceProjects.map((p) => `/projects/${p.slug}/`)].map(
    (path) => ({ url: `https://adjierizqan.github.io${path}` }),
  );
}
