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

export const education = [
  {
    "institution": "Tamkang University",
    "program": "Computer Science and Information Engineering, master's program; thesis research on TomatoVision. Completion date is not stated in the public record."
  },
  {
    "institution": "Telkom University",
    "program": "S1 Rekayasa Perangkat Lunak (Software Engineering); alumnus"
  }
] as const;

export const coreCapabilities = [
  "Operational software and workflow design",
  "Full-stack web engineering",
  "Computer vision research and evaluation",
  "Source-aware data import and reporting",
  "Interactive 3D web experiences",
  "Release engineering and verification"
] as const;
