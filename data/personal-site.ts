/**
 * Copy and release facts for the v2 personal site (adjie.jagau.id).
 *
 * Project facts still come from data/workspace.ts and data/tomatovision.ts.
 * This module only adds what the new pages need on top of them: the short
 * homepage framing, the release state with its source, and per-project
 * workflow steps. Each release line names the tag or record it comes from;
 * see docs/v2/DISCOVERY.md for how they were checked.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://adjie.jagau.id").replace(/\/$/, "");

export const hero = {
  meta: ["Software and full-stack engineer", "Applied AI and computer vision research", "Open to remote roles"],
  before: "I build software where a correction ",
  replaced: "overwrites",
  replacement: "adds to",
  after: " the record.",
  lead: "Laboratory inventory, blood-bank workflows and temperature logs for a hospital lab, plus a master’s thesis on tomato detection. I own the product decisions, data model, tests and release, and I build with AI coding tools.",
} as const;

export const plainHeadline = `${hero.before}${hero.replacement}${hero.after}`;

export type Release = { state: string; source: string };

/** Release state as shown publicly, with the record it was taken from. */
export const releases: Record<string, Release> = {
  labstock: { state: "In production since 25 September 2026", source: "Release tag prod-2026-09-25 in the LabStock repository" },
  bdrs: { state: "In production; latest release 8 October 2026", source: "GitHub release production-2026-10-08-db90e5f in the BDRS repository" },
  suhulog: { state: "Released v1.2.3", source: "Tag v1.2.3, 16 September 2026, in the SuhuLog repository" },
  "tomato-ripeness": { state: "Master’s thesis, 2026", source: "Thesis results tables" },
  "padel-vision": { state: "Prototype", source: "Portfolio record" },
  "porsche-3d": { state: "Fan project", source: "Portfolio record" },
};

export type HomeEntry = { slug: string; kind: string; summary: string; meta: [string, string][]; link: string };

export const homeEntries: Record<string, HomeEntry> = {
  labstock: {
    slug: "labstock",
    kind: "Laboratory inventory",
    summary: "Moves a lab’s stock records out of spreadsheets without losing where each number came from. Imports keep their workbook, sheet and row. Corrections keep the earlier entry. Reports and Excel exports read the same ledger.",
    meta: [["Role", "Product engineering, data model, release"], ["Built with", "Next.js, TypeScript, PostgreSQL, Drizzle, ExcelJS"], ["State", releases.labstock.state]],
    link: "Read the LabStock case study",
  },
  bdrs: {
    slug: "bdrs",
    kind: "Blood-bank system of record",
    summary: "Replaced twelve Excel workbooks and a Word document with one case workspace. Request, per-bag crossmatch, issue, physical outcome and transfusion reaction stay separate records, so issuing a bag never implies it was used.",
    meta: [["Role", "Product owner and sole developer, AI-assisted implementation"], ["Built with", "Laravel, Inertia, React, SQLite"], ["State", releases.bdrs.state]],
    link: "Read the BDRS case study",
  },
  suhulog: {
    slug: "suhulog",
    kind: "Temperature logging for a hospital lab",
    summary: "A QR label opens the exact fridge or room being recorded. Staff pick the morning or afternoon slot and the server stamps the time. Corrections append a new record instead of overwriting. Monthly Excel and PDF exports read the same records.",
    meta: [["Role", "Product design, full-stack engineering, release"], ["Built with", "TypeScript, Express, SQLite, Chart.js"], ["State", "Released v1.2.3 with 276 automated tests"]],
    link: "Read the SuhuLog case study",
  },
  "tomato-ripeness": {
    slug: "tomato-ripeness",
    kind: "Master’s thesis, computer vision",
    summary: "Detects green, orange and red tomatoes in greenhouse images. I compared a YOLOv11 baseline with Swin Transformer and multi-scale SPPF variants, then fused three models with Weighted Boxes Fusion. Single-model and ensemble results are reported separately.",
    meta: [],
    link: "Read the TomatoVision study",
  },
};

export const workGroups: { title: string; rows: { slug: string; line: string; area: string }[] }[] = [
  {
    title: "Operational software",
    rows: [
      { slug: "labstock", line: "Laboratory inventory from source workbook to final report", area: "Inventory, reporting" },
      { slug: "bdrs", line: "Blood-bank case workspace with separate event records", area: "Blood bank" },
      { slug: "suhulog", line: "QR-based temperature logging with correction history", area: "Monitoring" },
    ],
  },
  { title: "Research", rows: [{ slug: "tomato-ripeness", line: "Tomato maturity detection: baseline, variants and WBF ensemble", area: "Computer vision" }] },
  {
    title: "Experiments",
    rows: [
      { slug: "padel-vision", line: "Player and ball tracking from a single camera", area: "Computer vision" },
      { slug: "porsche-3d", line: "Three.js car viewer with live materials", area: "Interactive 3D" },
    ],
  },
];

export const about = {
  lead: "I’m a software engineer with a master’s in computer science and information engineering from Tamkang University and a bachelor’s in software engineering from Telkom University. Most of my recent work is operational software for a hospital laboratory, where the hard part is keeping imports, corrections and reports consistent with each other.",
  body: "I run JAGAU, an independent software studio. I work with AI coding tools and take responsibility for what ships: requirements, data model, tests, release and handover documents.",
  work: [
    ["Founder, JAGAU", "Independent software studio, jagau.id"],
    ["LabStock, SuhuLog, BDRS", "Operational software for a hospital laboratory, 2026"],
  ] as [string, string][],
  tools: [
    ["Product and data", "Domain modelling, source-aware imports, correction history, reports and Excel exports"],
    ["Engineering", "TypeScript, Next.js, Node and Express, Laravel and PHP, React, PostgreSQL, SQLite, automated tests, release"],
    ["Applied AI", "PyTorch, YOLOv11, Swin Transformer, OpenCV, ensemble evaluation"],
  ] as [string, string][],
};

export const JAGAU_URL = "https://jagau.id/";
export const PROVENANCE_NOTE = "Product screens use demo or synthetic data. No hospital records or infrastructure details are shown.";

/** Workflow figures for case studies. Steps are a sequence, so they are numbered. */
export const workflows: Record<string, { title: string; intro: string; steps: { title: string; items: string[] }[] }> = {
  labstock: {
    title: "How a balance is made",
    intro: "Four steps from the lab’s workbook to its monthly report. Every movement keeps the source it came from.",
    steps: [
      { title: "Source", items: ["Workbook", "Sheet", "Source row"] },
      { title: "Validate", items: ["Item identity", "Unit", "Period", "Source mapping"] },
      { title: "Ledger", items: [] },
      { title: "Output", items: ["Monthly report", "Yearly report", "Excel export"] },
    ],
  },
  bdrs: {
    title: "One case, separate records",
    intro: "Each event in a request’s life is its own record. Issuing a bag does not mean it was used, and a used bag does not imply a recorded transfusion episode.",
    steps: [
      { title: "Request", items: ["Service and patient", "Component and quantity"] },
      { title: "Stock", items: ["Receipt confirmed", "Unconfirmed delivery is not stock"] },
      { title: "Crossmatch", items: ["Per bag and patient", "Incompatible bags cannot be issued"] },
      { title: "Issue", items: ["Bag leaves the bank"] },
      { title: "Outcome", items: ["Physical outcome", "Transfusion episode", "Reaction record"] },
      { title: "Finalise", items: ["Seven blockers, two warnings", "Rechecked inside the transaction"] },
    ],
  },
  suhulog: {
    title: "From label to monthly report",
    intro: "The point being measured is chosen by scanning, not by memory. The period is chosen by staff; the time is stamped by the server.",
    steps: [
      { title: "Scan", items: ["QR label opens one monitoring point"] },
      { title: "Record", items: ["Pagi or Sore slot", "Server timestamp", "One effective record per point, date and slot"] },
      { title: "Flag", items: ["Configured range", "Out-of-range readings are flagged, never clamped"] },
      { title: "Correct", items: ["New record supersedes the old", "Previous value kept"] },
      { title: "Report", items: ["Monthly view and chart", "Excel, PDF and ZIP exports"] },
    ],
  },
};

export const labstockLedger: { kind: string; qty: string; superseded?: boolean }[] = [
  { kind: "OPENING", qty: "120" },
  { kind: "IN", qty: "+40" },
  { kind: "OUT", qty: "−12", superseded: true },
  { kind: "REVERSAL", qty: "+12" },
  { kind: "OUT", qty: "−10" },
];

export const constraints: Record<string, string[]> = {
  labstock: [
    "The same source workbook can be imported more than once.",
    "A correction must not erase what was recorded before it.",
    "The monthly output is a detail and recap workbook, so the Excel export is a first-class output.",
    "Public screens must use fictional items, rooms, requesters and users.",
  ],
  bdrs: [
    "The previous process spread one request across twelve workbooks and a Word document.",
    "Compatibility is decided per bag and patient, not once per request.",
    "Daily staff and administrators need different powers, enforced on the server.",
    "No patient record, hospital identity or infrastructure detail may appear in public material.",
  ],
  suhulog: [
    "The laboratory keeps two readings a day, morning (Pagi) and afternoon (Sore).",
    "Out-of-range readings must be recorded as measured.",
    "Monthly output has to follow the official workbook format.",
    "Scannable labels with real destinations stay private.",
  ],
};

export const myPart: Record<string, string> = {
  labstock: "I was responsible for the data model, the import, correction and reporting flows, the implementation and the release. I built it with AI coding tools; the decisions below are mine.",
  bdrs: "I was product owner and the only developer: domain model, full-stack implementation, tests and release, with AI-assisted implementation.",
  suhulog: "I designed, built and released it: the entry flow, monitoring, correction rules and the exports, plus the server setup and backups.",
};
