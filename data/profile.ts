/**
 * Profile facts about Adjie: identity, education, core capabilities.
 *
 * Canonical source. These used to exist only inside
 * data/portfolio-ai-context.json, so the AI assistant knew Adjie's education
 * but the site itself had no typed record of it to render. That JSON is now
 * generated from this module and data/workspace.ts — see lib/ai-context.ts and
 * `npm run ai-context`. Edit facts here, never in the JSON.
 */

export const identity = {
  "name": "Adjie Rizqan",
  "legalName": "Muhammad Rizqan Nur Adjie Adzani",
  "positioning": "Adjie builds operational software and applied AI systems.",
  // Display line under the name. `positioning` is third person because the
  // assistant speaks about Adjie; the page header needs a role, not a sentence
  // about him placed directly under his own name.
  "headline": "Software engineer building operational software and applied AI systems.",
  "focusAreas": [
    "Software engineering",
    "Applied AI and computer vision research",
    "Full-stack web development"
  ],
  "contact": {
    "email": "adjierizqan@gmail.com",
    "github": "https://github.com/adjierizqan",
    "linkedin": "https://www.linkedin.com/in/muhammadrizqan/",
    "resumeTarget": "/muhammad-rizqan-nur-adjie-cv-2026.pdf"
  }
} as const;

/**
 * Display fields, from which the AI context sentence is composed
 * (lib/ai-context.ts). `status` is set only where the record states one; with
 * no status the assistant is told the completion date is not stated, so it can
 * never claim a degree was completed.
 */
export type EducationRecord = {
  institution: string;
  degree: string;
  field: string;
  detail?: string;
  status?: string;
};

export const education: readonly EducationRecord[] = [
  {
    institution: "Tamkang University",
    degree: "Master's program",
    field: "Computer Science and Information Engineering",
    detail: "Thesis research on TomatoVision",
  },
  {
    institution: "Telkom University",
    degree: "S1 (bachelor's)",
    field: "Software Engineering (Rekayasa Perangkat Lunak)",
    status: "Alumnus",
  },
];

export const coreCapabilities = [
  "Operational software and workflow design",
  "Full-stack web engineering",
  "Computer vision research and evaluation",
  "Source-aware data import and reporting",
  "Interactive 3D web experiences",
  "Release engineering and verification"
] as const;
