import type { Metadata } from "next";
import { allWorkspaceProjects } from "@/data/workspace";
import { releases, workGroups } from "@/data/personal-site";
import { WorkIndex, type IndexGroup } from "@/components/site/WorkIndex";

const description = "Six projects by Adjie Rizqan: three operational systems for a hospital laboratory, a computer vision thesis and two experiments.";

export const metadata: Metadata = {
  title: "Work — Adjie Rizqan",
  description,
  alternates: { canonical: "/work/" },
  openGraph: { type: "website", url: "/work/", title: "Work — Adjie Rizqan", description, images: ["/projects/labstock/thumb-reset-a.jpg"] },
};

const shortState: Record<string, string> = {
  labstock: "In production",
  bdrs: "In production",
  suhulog: "Released v1.2.3",
  "tomato-ripeness": "Master’s thesis",
  "padel-vision": releases["padel-vision"].state,
  "porsche-3d": releases["porsche-3d"].state,
};

const preview: Record<string, { image: string; caption: string }> = {
  labstock: { image: "/projects/labstock/thumb-reset-a.webp", caption: "LabStock on desktop and phone. Demo database." },
  bdrs: { image: "/projects/bdrs/cover-final.webp", caption: "BDRS case workstation and phone view. Synthetic case." },
  suhulog: { image: "/projects/suhulog/cover-final.webp", caption: "SuhuLog entry and monitoring. Sanitised capture." },
  "tomato-ripeness": { image: "/projects/tomato-ripeness/cover-final.webp", caption: "Baseline and WBF on the same photo. Demonstration, not evaluation data." },
  "padel-vision": { image: "/projects/padel-vision/cover-final.webp", caption: "Analysed frame. Clip by UsaOne Ell, Pexels." },
  "porsche-3d": { image: "/projects/porsche-3d/cover-final.webp", caption: "Render from the site’s Three.js scene. Model by Ddiaz Design." },
};

export default function WorkPage() {
  const groups: IndexGroup[] = workGroups.map((g) => ({
    title: g.title,
    rows: g.rows.map((r) => {
      const p = allWorkspaceProjects.find((x) => x.slug === r.slug)!;
      return { slug: r.slug, title: p.title, line: r.line, area: r.area, year: p.year, state: shortState[r.slug], image: preview[r.slug].image, alt: "", caption: preview[r.slug].caption };
    }),
  }));
  return (
    <div className="wrap">
      <header className="grid page-head">
        <h1 className="t-h1 col-margin">Work</h1>
        <p className="t-lead col-main">Six projects. The first four have full case studies; the experiments are short write-ups.</p>
      </header>
      <WorkIndex groups={groups} />
    </div>
  );
}
