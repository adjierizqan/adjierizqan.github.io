# Porsche 3D — cinematic captures

Everything in `public/projects/porsche-3d/cinematic/` was rendered by the Porsche site's own renderer. Nothing was
painted over or composited from other sources.

- `capture.html` loads `site/src/car3d.js` (`CarStage`: same GLB models, studio lighting, tone mapping and
  configurator finishes) without the site UI. It widens the orbit limits so the camera can get close for details.
- `shoot.cjs` takes the stills at 2560×1440 in Chromium with WebGL on the GPU (ANGLE Metal).
  - Stills: RWB 964 hero, 918 profile, three close-ups (wheel, wing, lights).
  - Finishes: 911 GT3 in GT Silver/metallic, Guards Red/gloss and Jet Black/matte. These are the site's own
    swatches and `_finishProps()`.
  - Line-up: clones of the six loaded models in one scene, shot with a long lens.
- `clip.cjs` renders the switch transition frame by frame on a virtual clock. The motion is copied from `main.js`
  `switchCar()`. Frames are encoded to H.264.

To run: serve a folder that holds `capture.html` plus symlinks `src` → `porsche_3d/site/src` and `public` →
`porsche_3d/site/public`, on port 4180.

Models: Ddiaz Design on Sketchfab, non-commercial terms. Fan-made; Porsche marks belong to Dr. Ing. h.c. F. Porsche AG.
