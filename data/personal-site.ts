/**
 * Copy and release facts for the personal site at adjie.jagau.id.
 *
 * Project facts still come from data/workspace.ts and data/tomatovision.ts.
 * This module adds what the pages need on top of them: the first-person
 * introduction, release states with their sources, and per-project steps and
 * decisions. See docs/v2/DISCOVERY.md for how each release line was checked.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://adjie.jagau.id").replace(/\/$/, "");
export const JAGAU_URL = "https://jagau.id/";

export const intro = {
  tagline: "Software engineer, open to remote work",
  first:
    "I build software for a hospital lab: an inventory system, a blood-bank record and a temperature log, all three in production. Before that I spent my master’s at Tamkang University teaching a model to tell ripe tomatoes from green ones.",
  second:
    "What I care about is the unglamorous part being right: imports you can trace, corrections that keep their history, exports that match the screen. I build with AI coding tools and own the decisions, tests and releases.",
};

export type Release = { state: string; source: string };

/** Release state as shown publicly, with the record it was taken from. */
export const releases: Record<string, Release> = {
  labstock: { state: "In production since 25 September 2026", source: "release tag prod-2026-09-25 in the LabStock repository" },
  bdrs: { state: "In production; latest release 8 October 2026", source: "GitHub release production-2026-10-08-db90e5f in the BDRS repository" },
  suhulog: { state: "Released v1.2.3 on 16 September 2026", source: "tag v1.2.3 in the SuhuLog repository" },
  "tomato-ripeness": { state: "Master’s thesis, 2026", source: "thesis results tables" },
  "padel-vision": { state: "Prototype", source: "portfolio record" },
  "porsche-3d": { state: "Fan project", source: "portfolio record" },
};

/** Home page rows. Order is the order on the page. */
export const workRows: { slug: string; kind: string; desc: string; thumb?: string; thumbAlt?: string }[] = [
  { slug: "labstock", kind: "Lab inventory, in production since September 2026", desc: "Imports keep their source row, so every balance traces back to the spreadsheet it came from.", thumb: "/projects/labstock/thumb-reset-a.webp" },
  { slug: "bdrs", kind: "Blood bank, product owner and sole developer", desc: "Request, crossmatch, issue and transfusion stay separate records in one case, so issuing a bag never means it was used.", thumb: "/projects/bdrs/workstation.webp" },
  { slug: "suhulog", kind: "Temperature logging, released v1.2.3", desc: "A QR label opens the right fridge. Corrections add a record instead of overwriting the reading.", thumb: "/projects/suhulog/cover-final.webp" },
  { slug: "tomato-ripeness", kind: "Master’s thesis, computer vision", desc: "A YOLOv11 baseline, two architecture changes and a three-model ensemble, measured separately.", thumb: "/projects/tomato-ripeness/cover-final.webp" },
];

export const experimentRows: { slug: string; kind: string; desc: string }[] = [
  { slug: "padel-vision", kind: "Prototype", desc: "Tracks four players and the ball from one camera and maps them onto the court." },
  { slug: "porsche-3d", kind: "Fan project, car models by Ddiaz Design", desc: "A Three.js car viewer with live paint and camera moves between six models." },
];

export const education: [string, string][] = [
  ["Tamkang University, 2026", "Master’s, Computer Science and Information Engineering"],
  ["Telkom University, 2023", "Bachelor’s, Software Engineering"],
];

type Case = {
  lead: string;
  kind: string;
  hero: { src: string; alt: string; caption: string };
  problem?: string[];
  stepsTitle?: string;
  steps?: string[];
  decisions?: [string, string][];
  screens?: { src: string; alt: string; caption: string; phone?: boolean }[];
  evidence?: string[];
  notShown?: string;
};

export const cases: Record<string, Case> = {
  labstock: {
    lead: "Laboratory inventory where every balance traces back to the workbook row it came from, and a correction never erases what was there before.",
    kind: "Lab inventory",
    hero: { src: "/projects/labstock/thumb-reset-a.webp", alt: "LabStock on a laptop showing the Today view and on a phone showing the requisition form, with demo data.", caption: "LabStock on a laptop and a phone. Demo database with generic items, rooms, requesters and users." },
    problem: [
      "The lab kept its stock in spreadsheets. Moving that into an application is only half the job: when a workbook is imported again, a quantity is corrected or a month is exported back to Excel, someone still has to be able to say where each balance came from.",
      "I was responsible for the data model, the import, correction and reporting flows, and the release. I built it with AI coding tools; the decisions below are mine.",
    ],
    stepsTitle: "How a balance is made",
    steps: [
      "Each imported row keeps its workbook, sheet and row number.",
      "Validation checks item identity, unit and period before anything is written.",
      "Stock changes are ledger entries: opening, in, out, adjustment, reversal.",
      "Monthly and yearly reports, and the Excel export, read that same ledger.",
    ],
    decisions: [
      ["Source identity travels with the row.", "Workbook, sheet, row, item, unit and period are stored together, so a balance can be traced to the cell it came from."],
      ["A repeated import is recognised.", "Before an import writes stock movements, LabStock checks whether that source was already applied, so importing the same workbook twice does not double the stock."],
      ["Corrections supersede.", "A correction records the change and keeps the earlier ledger entry. Reports show the effective value; the history stays available."],
    ],
    screens: [
      { src: "/projects/labstock/hari-ini.webp", alt: "LabStock Today view with low stock, expiry warnings, recent requisitions and movements.", caption: "Hari Ini (Today): low stock, expiry, recent requisitions and movements in one view." },
      { src: "/projects/labstock/amprah-mobile.webp", alt: "LabStock requisition form on a phone.", caption: "Amprah (requisition) on a phone: room and requester for items leaving the lab.", phone: true },
      { src: "/projects/labstock/laporan.webp", alt: "LabStock monthly report with corrections and the Excel export button.", caption: "Monthly report read from the ledger, with corrections beside the closing balance and the Excel export." },
    ],
    evidence: [
      "Release tag prod-2026-09-25, live since 25 September 2026. Receiving and report-period fixes merged in October are not shown here.",
    ],
    notShown: "Screens come from a demo database. Production infrastructure, hospital data and URLs are withheld, and no usage or efficiency figures are claimed.",
  },
  bdrs: {
    lead: "A blood-bank system of record. Request, crossmatch, issue, outcome and transfusion are separate records, brought together in one case.",
    kind: "Blood-bank system of record",
    hero: { src: "/projects/bdrs/cover-final.webp", alt: "BDRS case workstation for a synthetic patient on desktop and on a phone.", caption: "The case workstation for a synthetic patient, on desktop and phone. Sidebar cropped; no hospital mark." },
    problem: [
      "The lab’s process spread one request across twelve Excel workbooks and a Word document. Producing the monthly report meant copying between files, and nothing held the full life of a request or a single bag of blood.",
      "I was product owner and the only developer: domain model, full-stack implementation, tests and release, with AI-assisted implementation.",
    ],
    stepsTitle: "One case, separate records",
    steps: [
      "A request records the service, the patient and the components needed.",
      "Delivered bags become stock only after receipt is confirmed.",
      "Crossmatch is recorded per bag and patient; an incompatible bag cannot be issued.",
      "Issue, physical outcome, transfusion episode and reaction are each their own record.",
      "Finalisation checks seven blockers and two warnings, and rechecks open episodes inside the transaction.",
    ],
    screens: [
      { src: "/projects/bdrs/episode.webp", alt: "BDRS list of transfusion episodes for synthetic cases.", caption: "Transfusion episodes traced from request to result." },
      { src: "/projects/bdrs/readiness.webp", alt: "BDRS finalisation refused, with the named checks that are still open.", caption: "Finalisation refused, with named checks that say what is unresolved.", phone: true },
      { src: "/projects/bdrs/laporan.webp", alt: "BDRS monthly report centre with the lab's workbook templates.", caption: "Monthly report centre for the lab’s workbook templates." },
    ],
    evidence: [
      "GitHub release production-2026-10-08-db90e5f, published 8 October 2026 as a checkpoint of the live release.",
      "At the 19 September 2026 release gate: 2,672 unit and feature tests passed (74 skipped, 3 incomplete) and 44 end-to-end tests passed, with owner acceptance testing. These are recorded results, not a fresh audit.",
    ],
    notShown: "Screens use synthetic fixtures only; patient records, hospital identity and infrastructure stay private. No compliance, penetration-test, efficiency or cost claim is made. The restore rehearsal used a schema-complete, record-empty database.",
  },
  suhulog: {
    lead: "Temperature logging for a hospital lab. A QR label picks the fridge or room, and a correction adds a record instead of replacing one.",
    kind: "Temperature logging",
    hero: { src: "/projects/suhulog/device-story.webp", alt: "SuhuLog recording a reading on a phone and showing a month of readings on a laptop.", caption: "Entry on a phone and monitoring on a laptop. Sanitised captures; scannable labels are not published." },
    problem: [
      "Fridge and room temperatures were recorded manually, twice a day. Capturing them faster could not cost the lab its morning and afternoon slots, its correction history, its configured limits or the official monthly workbook.",
      "I designed, built and released it: the entry flow, monitoring, correction rules and exports, plus the server setup and backups.",
    ],
    stepsTitle: "From label to monthly report",
    steps: [
      "A QR label opens the entry form for one monitoring point.",
      "Staff choose the morning (Pagi) or afternoon (Sore) slot; the server stamps the time.",
      "Readings outside the configured range are flagged, never clamped.",
      "A correction adds a new record that supersedes the old one.",
      "Monthly views, charts and the Excel, PDF and ZIP exports read the same records.",
    ],
    screens: [
      { src: "/projects/suhulog/desktop-monitoring.webp", alt: "SuhuLog monthly chart of readings with configured limits and exceptions.", caption: "Monthly curve per monitoring point, with configured limits and exceptions." },
      { src: "/projects/suhulog/phone-catat-suhu.webp", alt: "SuhuLog reading entry on a phone with the Pagi and Sore slots.", caption: "Recording a reading: pick the point and the Pagi or Sore slot.", phone: true },
    ],
    evidence: ["Tag v1.2.3, 16 September 2026, with 276 automated tests at release. HTTPS, systemd and verified backups on the lab server."],
    notShown: "Only sanitised screenshots are shown. Operational records, hospital identity and scannable labels with real destinations are withheld.",
  },
  "padel-vision": {
    lead: "Can one moving broadcast camera become match data you can inspect? A prototype that goes from detections in the frame to positions on the court.",
    kind: "Computer vision prototype",
    hero: { src: "/projects/padel-vision/analytics/court-control.webp", alt: "Padel court from above with four tracked players, the ball and a court minimap.", caption: "Analysed frame from a Pexels clip by UsaOne Ell. Tracking is imperfect and contacts are not marked." },
    notShown: "This is an experiment run on public footage, not an analytics service.",
  },
  "porsche-3d": {
    lead: "How far a plain HTML page with ES modules can go with a real-time 3D scene: six cars, orbit controls, live paint and camera moves.",
    kind: "Interactive 3D fan project",
    hero: { src: "/projects/porsche-3d/cinematic/01-rwb964-hero.webp", alt: "Orange RWB 964 rendered in the Three.js scene.", caption: "Render from the site’s own Three.js scene. Car model by Ddiaz Design on Sketchfab; no affiliation with Porsche." },
    screens: [
      { src: "/projects/porsche-3d/cinematic/03-lineup.webp", alt: "All six car models side by side in one scene.", caption: "All six models in one scene." },
      { src: "/projects/porsche-3d/cinematic/05-gt3-matte.webp", alt: "911 GT3 in matte black.", caption: "Live material change: 911 GT3 in matte Jet Black." },
    ],
    notShown: "A fan project. The car models are by Ddiaz Design; the scene, interaction and camera work are mine.",
  },
};

export const ORDER = ["labstock", "bdrs", "suhulog", "tomato-ripeness", "padel-vision", "porsche-3d"];
