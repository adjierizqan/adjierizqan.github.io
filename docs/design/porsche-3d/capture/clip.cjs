/* Node capture script (CommonJS), run outside the app. */
/* eslint-disable @typescript-eslint/no-require-imports */
// Frame-exact clip: virtual clock drives rAF + GSAP; one screenshot per 1/30 s.
const { chromium } = require('/Users/adjie/Projects/labstock-pk/node_modules/@playwright/test');
const OUT = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.goto('http://127.0.0.1:4180/capture.html');
  await p.waitForFunction(() => window.ready, null, { timeout: 60000 });
  await p.evaluate(() => stage.preload(['rwb964.glb', '918.glb', 'gt3rs.glb'].map((f) => './public/models/' + f)));
  await p.evaluate(() => window.shot('rwb964.glb', { pos: [4.6 * Math.sin(0.7), 0.95, 4.6 * Math.cos(0.7)], tgt: [0, 0.56, 0], rot: 0 }));
  await p.evaluate(() => { stage.pivot.rotation.y = stage.idleBase; const a = (28.6 + 40) * Math.PI / 180; stage.camera.position.set(4.7 * Math.sin(a), 1.0, 4.7 * Math.cos(a)); stage.controls.target.set(0, 0.56, 0); stage.controls.update(); });
  await p.clock.install();
  let n = 0;
  const grab = async (count) => { for (let i = 0; i < count; i++) { await p.clock.runFor(1000 / 30); await p.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png` }); } };
  await p.evaluate(() => { const a = (28.6 + 34) * Math.PI / 180; gsap.to(stage.camera.position, { x: 4.3 * Math.sin(a), y: 0.92, z: 4.3 * Math.cos(a), duration: 1.4, ease: 'power2.inOut' }); });
  await grab(45);
  await p.evaluate(() => { window.switchTo('918.glb'); });
  await grab(60);
  await p.evaluate(() => { window.switchTo('gt3rs.glb'); });
  await grab(66);
  console.log('frames', n);
  await b.close();
})();
