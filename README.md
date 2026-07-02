# Adjie Rizqan — Portfolio

Personal portfolio website: AI research, computer vision, and interactive web projects.

Built with Next.js (App Router), TypeScript, and Tailwind CSS. Fully static — no backend.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content

All content lives in two files — no component changes needed:

- **`data/site.ts`** — name, role, bio, email, GitHub, LinkedIn, CV path.
- **`data/projects.ts`** — the project list. Each project has a title, description, tech stack, features, links (GitHub / demo / paper), and a preview.

### Project previews

Preview media lives in `public/projects/`:

- `<slug>.mp4` — looping video preview (referenced by the `video` field)
- `<slug>.jpg` — poster/fallback image (referenced by the `image` field)

To update a preview from a screen recording:

```bash
ffmpeg -i recording.mov -vf "scale=960:-2" -c:v libx264 -crf 27 \
  -an -pix_fmt yuv420p -movflags +faststart public/projects/<slug>.mp4
ffmpeg -ss 3 -i public/projects/<slug>.mp4 -frames:v 1 public/projects/<slug>.jpg
```

### CV

Replace `public/cv.pdf` to update the CV download.
