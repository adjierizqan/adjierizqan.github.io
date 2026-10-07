# Adjie Workspace

A software-engineering portfolio inside a macOS-inspired workspace. Static Next.js frontend; a separately deployed Cloudflare Worker provides optional, public-context Ask AI.

## Development and release gates

```sh
npm ci
npm run dev
npm test          # portfolio + Worker tests; requires Bun
npm run lint
npm run typecheck
npm run build
npm run test:static
# Serve out/ on 127.0.0.1:4182, then:
QA_WEBKIT=1 npm run test:browser
npm run test:shell
```

CI runs these gates before GitHub Pages deployment from main. No browser test sends a real Ask request; production connectivity is verified separately.

## Source of truth

- `data/workspace.ts`: six canonical projects and public evidence boundaries.
- `data/profile.ts`: identity, positioning, education.
- `data/tomatovision.ts`: detailed verified research evaluation.
- `npm run ai-context`: regenerates the Worker context; never edit the JSON manually.
- `data/site.ts`: public contact destinations.
- `components/labstock/`: approved benchmark.
- `components/studies/`: distinct project compositions and shared evidence primitives.
- `components/WorkspacePrototype.tsx`: preserved shell and navigation.

All six project URLs export real content at `/projects/<slug>/`. Legacy query URLs normalize to canonical paths. English-only UI; Ask follows visitor language.

## Assets and documentation

Only sanitized/synthetic or licensed public media may be published. See [final system and provenance](docs/release/FINAL_PORTFOLIO_SYSTEM.md). `docs/release/media.cjs` generates curated covers; `scripts/media-dimensions.cjs` derives native image sizes.

The single résumé is `public/muhammad-rizqan-nur-adjie-cv-2026.pdf`. `bun scripts/build-resume.ts` generates its HTML from canonical data; print that HTML with Chromium at A4 with backgrounds. Prior résumé versions remain in Git history.

Shared shell dark styles are generated with `node scripts/build-dark-theme.mjs`; new project/Home styles use semantic dark-mode tokens. Sound is original Web Audio, direct-gesture-only, with persisted global mute. Music never autoplays.

Worker deployment: [Ask AI operations](docs/ASK_AI.md). Frontend endpoint: `NEXT_PUBLIC_ASK_API_URL`, a public URL rather than a secret.
