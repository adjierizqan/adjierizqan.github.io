/* Node capture script (CommonJS), run outside the app. */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('/Users/adjie/Projects/labstock-pk/node_modules/@playwright/test');
const OUT = process.argv[2]; const ONLY = process.argv[3];
const W = 2560, Hh = 1440;
// Camera by azimuth (deg from the car's nose, +z at rot 0), distance, height; target [x,y,z]
const cam = (az, d, h, tgt) => ({ pos: [d * Math.sin(az * Math.PI / 180), h, d * Math.cos(az * Math.PI / 180)], tgt, rot: 0 });
const shots = {
  'rwb964-hero':     ['rwb964.glb', cam(40, 4.25, 0.9, [0, 0.56, 0])],
  '918-profile':     ['918.glb',    cam(90, 4.5, 0.75, [0, 0.52, 0])],
  'rwb964-wheel':    ['rwb964.glb', { pos: [2.15, 0.5, 2.2], tgt: [0.75, 0.36, 1.1], rot: 0 }],
  'rwb964-wing':     ['rwb964.glb', { pos: [2.1, 1.75, -3.1], tgt: [0, 1.0, -1.35], rot: 0 }],
  'rwb964-light':    ['rwb964.glb', { pos: [1.35, 0.8, 3.05], tgt: [0.5, 0.6, 1.55], rot: 0 }],
  'gt3-metallic':    ['gt3.glb',    { ...cam(40, 4.9, 1.0, [0, 0.58, 0]), color: '#c8ccd0', finish: 'metallic' }],
  'gt3-gloss':       ['gt3.glb',    { ...cam(40, 4.9, 1.0, [0, 0.58, 0]), color: '#c5132a', finish: 'gloss' }],
  'gt3-matte':       ['gt3.glb',    { ...cam(40, 4.9, 1.0, [0, 0.58, 0]), color: '#15171b', finish: 'matte' }],
};
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: W, height: Hh }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('pageerror', e.message));
  await p.goto('http://127.0.0.1:4180/capture.html');
  await p.waitForFunction(() => window.ready, null, { timeout: 60000 });
  console.log(await p.evaluate(() => { const gl = document.createElement('canvas').getContext('webgl2'); const d = gl.getExtension('WEBGL_debug_renderer_info'); return gl.getParameter(d.UNMASKED_RENDERER_WEBGL); }));
  for (const [name, [file, opts]] of Object.entries(shots)) {
    if (ONLY && !name.startsWith(ONLY)) continue;
    await p.evaluate(([f, o]) => window.shot(f, o), [file, opts]);
    await p.screenshot({ path: `${OUT}/${name}.png` });
    console.log('shot', name);
  }
  if (!ONLY || ONLY === 'lineup') {
    await p.evaluate(() => window.lineup(['gt4rs.glb', 'gt3.glb', 'rwb964.glb', '918.glb', 'gt3rs.glb', 'panamera.glb']));
    await p.evaluate(() => { stage.camera.fov = 13; stage.camera.updateProjectionMatrix(); stage.camera.position.set(10.2, 5.6, 38.5); stage.controls.target.set(0, 0.55, 0); stage.controls.update(); });
    await p.evaluate(() => window.frames(40));
    await p.screenshot({ path: `${OUT}/lineup.png` });
    console.log('shot lineup');
  }
  await b.close();
})();
