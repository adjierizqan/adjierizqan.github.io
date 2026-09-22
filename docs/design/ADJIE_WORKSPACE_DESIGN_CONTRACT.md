# Adjie Workspace — Final Design Contract

Status: **VISUAL DIRECTION APPROVED / IMPLEMENTATION SOURCE OF TRUTH**

## 0. Purpose

Adjie Workspace is a public portfolio presented through the visual language of a calm, modern personal AI workspace.

It is **not** a traditional developer portfolio, not an enterprise dashboard, and not a fake fully-functional AI product.

V1 may use static/deterministic interactions. Real AI/backend functionality can come later.

## 1. Source-of-truth priority

When sources disagree, use this order:

1. `docs/design/reference/screen.png` — owner-approved visual target.
2. `docs/design/reference/code.html` — structural/layout implementation reference.
3. This contract — behavior, implementation boundaries, and anti-drift rules.
4. Existing repository components/tokens, only when they do not conflict with 1–3.
5. Legacy design experiments — reference only; never authoritative.

Do **not** reinterpret the visual direction from scratch.

## 2. Visual direction

Core impression:
- calm
- clean
- polished
- high-quality AI product
- light neutral workspace
- information-dense but not busy
- strong typography
- subtle borders and shadows
- restrained interaction feedback

Avoid:
- AI slop
- purple/blue glow everywhere
- giant 3D orb
- glassmorphism
- bento card soup
- dashboard KPI grids
- fake terminal/code-editor styling
- giant marketing hero
- decorative animations with no purpose
- fake metrics, fake users, fake clients, fake operational claims

## 3. Canonical visual tokens

Use the final HTML reference as the token baseline:

```css
--app-bg: #EBECEF;
--panel: #F8F9FA;
--card: #FFFFFF;
--border: #E3E5E8;
--muted: #717680;
--heading: #15171C;
--accent: #18191B;
```

Typography:
- UI/body: Inter, system sans fallback
- Editorial quote/accent only: Newsreader / Georgia fallback

Depth:
- soft, subtle
- no heavy glow
- window shadow may be stronger because it is a simulated desktop window
- cards should remain quiet

## 4. macOS-inspired desktop shell

The portfolio lives inside a movable application window floating above an original desktop wallpaper.

### Desktop background
- Full viewport.
- Use an original/licensed high-resolution landscape or abstract wallpaper.
- Do not hotlink an Apple wallpaper.
- Do not use Apple logos or imply this is an official macOS product.
- A subtle desktop menubar/dock treatment may be used as decorative framing, but it must remain secondary.

### Application window
- Centered on first load.
- Rounded outer shell.
- macOS-inspired red/yellow/green traffic-light controls.
- Strong but tasteful window shadow.
- The application window is the primary object.

### Window dragging
The application window MUST be draggable on desktop.

Implementation behavior:
- Drag only from the top titlebar / designated drag handle.
- Use Pointer Events, not native HTML5 drag-and-drop.
- Move using CSS transform/translate3d or equivalent performant positioning.
- Preserve normal clicks, text selection, inputs, buttons, and scrolling.
- Interactive descendants in the titlebar must opt out of dragging.
- Clamp movement so the window cannot be completely lost off-screen.
- Keep at least ~80 px of the titlebar reachable.
- Cursor changes to `grab` / `grabbing` on the drag region.
- Persist position only for the current session unless there is a strong reason to store it.
- Double-click titlebar MAY toggle maximize/restore if it can be implemented cleanly.
- On small screens/tablets, disable free dragging and use a normal full-screen responsive layout.
- Respect reduced-motion preferences.

## 5. Main application anatomy

Desktop:
1. top titlebar
2. left navigation rail
3. center workspace
4. right contextual rail

### Left rail
Contains:
- Adjie Rizqan / Adjie Workspace
- pronunciation button
- New Session
- Home
- Work
- Projects
- Labs
- Knowledge
- Ask
- project shortcuts
- search / Cmd+K
- settings
- owner/status footer

Keep it quiet and compact.

### Center workspace
This is the strongest visual region.

Home:
- compact greeting
- Adjie Rizqan identity
- short positioning line
- restrained focus tags
- static/deterministic Ask composer
- a small group of useful starter actions
- Recent area using curated public-safe portfolio/project content

The composer must look like a premium AI composer but does not need a real AI backend in V1.

### Right contextual rail
Context only:
- currently selected project
- real screenshot or verified public-safe evidence
- project links/resources
- related work
- optional curated focus/tools widgets if public-safe

The right rail must not become a second dashboard.

## 6. Portfolio data

Primary work:
1. LabStock
2. BDRS
3. SuhuLog
4. TomatoVision

Secondary:
- THINK IT
- ObjectTwin
- Porsche 3D
- Quantara
- Flutter
- other verified projects

Use real project names and real evidence.

Never fabricate:
- metrics
- client names
- production statuses
- compliance claims
- usage numbers
- commits
- files
- testimonials
- private hospital information

If evidence does not exist, use an intentional text state.

## 7. Delight / interaction layer

The site should feel crafted, inspired by high-quality design-engineer portfolios, but not copied from them.

Approved interaction ideas:
- click speaker icon beside `Adjie Rizqan` to play name pronunciation
- `Cmd/Ctrl + K` command palette
- keyboard navigation shortcuts
- subtle optional click feedback
- project quick-look / contextual rail transition
- tasteful shared-layout transitions
- optional hidden Labs/easter-egg mode
- global sound mute control

Rules:
- sound is off by default or requires first user gesture
- provide mute
- respect `prefers-reduced-motion`
- interactions must improve discovery or personality, not distract
- no auto-playing audio

## 8. V1 functional boundary

Implement now:
- visual shell
- responsive behavior
- draggable desktop window
- local navigation/state
- project selection/context updates
- static/deterministic composer states
- command palette
- name pronunciation if an approved audio asset is available
- real public-safe portfolio assets
- keyboard accessibility

Do not implement now unless already trivial/existing:
- real AI provider/backend
- auth
- database
- cloud sync
- persistence platform
- fake "live" services

## 9. Responsive behavior

Desktop:
- movable window over desktop background
- three-column body

Tablet:
- window fills most viewport
- dragging disabled
- right context becomes collapsible

Mobile:
- no fake desktop wallpaper/chrome requirement
- app becomes normal full-screen responsive UI
- left navigation becomes drawer/sheet
- right context becomes sheet/full-screen detail
- composer remains easy to reach

## 10. Engineering quality

- Preserve current Next.js / React / TypeScript / Tailwind architecture unless a change is clearly justified.
- Prefer existing dependencies/components.
- Do not add a large UI framework for this pass.
- Static export / GitHub Pages compatibility must remain unless owner explicitly changes deployment.
- No external hotlinks for critical visual assets in production.
- Optimize wallpaper/project images.
- No layout shift from unloaded assets.
- Keyboard navigation and focus states must work.
- Respect reduced motion.
- Final implementation must pass lint, TypeScript, production build, and a focused browser smoke test.

## 11. Definition of done

The pass is complete when:
- the approved screenshot is recognizably reproduced in layout and feel
- the app window floats above a tasteful desktop background
- the window can be dragged naturally on desktop
- all primary controls still work while drag exists
- mobile does not inherit awkward desktop dragging
- public content contains no fabricated evidence
- visual hierarchy is calm and consistent
- no redesign has been introduced
- quality gates pass
