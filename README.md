# Adjie Workspace

My portfolio, built with Next.js and hosted on GitHub Pages.

It has six project case studies and an optional Ask AI feature. The AI endpoint runs separately on Cloudflare Workers.

[View the site](https://adjierizqan.github.io/)

## Local setup

Use Node.js 22 and Bun for the test and build scripts.

```bash
npm ci
npm run dev
```

The site works without the AI endpoint. To use Ask AI, set `NEXT_PUBLIC_ASK_API_URL` to the Worker URL before building.

## Checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:static
```

Browser checks need the exported `out/` directory served at `http://127.0.0.1:4182`.

```bash
QA_WEBKIT=1 npm run test:browser
npm run test:shell
```

GitHub Actions runs the release checks before deploying `main` to GitHub Pages. Browser tests don't make live Ask AI requests.

## Where to look

- `data/workspace.ts`: project content and metadata
- `data/profile.ts`: profile and education
- `data/tomatovision.ts`: research results
- `components/studies/`: individual project layouts
- `cloudflare/ask-worker/`: Ask AI backend

Run `npm run ai-context` after changing profile or project facts. It generates `data/portfolio-ai-context.json`, which should not be edited by hand.

The résumé is at `public/muhammad-rizqan-nur-adjie-cv-2026.pdf`. Run `bun scripts/build-resume.ts` to generate its HTML, then print it to PDF with Chromium at A4 size with backgrounds enabled.

Shared dark-theme styles are generated with `node scripts/build-dark-theme.mjs`.

## Documentation

- [Ask AI setup and deployment](docs/ASK_AI.md)
- [Release notes and screenshot sources](docs/release/FINAL_PORTFOLIO_SYSTEM.md)

Public screenshots use synthetic or sanitized data. Private hospital records and deployment details are not included.
