/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium, webkit, expect} = require('@playwright/test');
const fs = require('node:fs');
const base = process.env.QA_BASE || 'http://127.0.0.1:4182';
const dir = process.env.QA_OUTPUT || 'docs/release/screenshots';
fs.mkdirSync(dir,{recursive:true});
async function instrument(context, rejectPlayback = false) {
 await context.addInitScript(({rejectPlayback}) => {
  window.__sectionScrolls=[]; window.__mediaAttempts=[];
  const scroll=Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView=function(options){window.__sectionScrolls.push({id:this.id,...options});return scroll.call(this,options);};
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){window.__mediaAttempts.push({muted:this.muted,label:this.getAttribute('aria-label')});return rejectPlayback?Promise.reject(new DOMException('Autoplay blocked','NotAllowedError')):play.call(this);};
 },{rejectPlayback});
}
async function settle(page){await page.locator('.aw-desktop').evaluate(e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{}))));}
(async()=>{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch();
  try {
   const errors=[];
   for(const width of [1440,834,390,320]){
    const context=await browser.newContext({viewport:{width,height:width===834?1112:900}});
    await instrument(context);
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/',{waitUntil:'networkidle'});await settle(page);
    await expect(page.getByText('Example conversation',{exact:true})).toHaveCount(0);
    await page.screenshot({path:`${dir}/${name}-${width}-home-before-scroll.png`});
    await page.evaluate(()=>{window.__scrollSamples=[];const el=document.querySelector('.aw-center');const desktop=getComputedStyle(el).overflowY!=='visible';(desktop?el:window).addEventListener('scroll',()=>window.__scrollSamples.push(desktop?el.scrollTop:window.scrollY));});
    await page.getByRole('link',{name:'Explore the work ↓',exact:true}).click();
    await expect(page.locator('#home-work')).toBeFocused();
    await expect.poll(()=>page.locator('#home-work').evaluate(e=>Math.round(e.getBoundingClientRect().top-(getComputedStyle(e.closest('.aw-center')).overflowY==='visible'?0:e.closest('.aw-center').getBoundingClientRect().top)))).toBe(width<=760?76:24);
    const scrolls=await page.evaluate(()=>window.__sectionScrolls);
    expect(scrolls.at(-1)).toMatchObject({id:'home-work',behavior:'smooth',block:'start'});
    if(width>760) expect(await page.evaluate(()=>window.scrollY)).toBe(0);
    else expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(0);
    const samples=await page.evaluate(()=>window.__scrollSamples);
    expect(new Set(samples.map(Math.round)).size).toBeGreaterThan(2);
    await page.screenshot({path:`${dir}/${name}-${width}-home-after-scroll.png`});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.aw-center').evaluate(e=>(getComputedStyle(e).overflowY==='visible'?window:e).scrollTo({top:0,behavior:'instant'}));
    await page.getByRole('link',{name:'Explore the work ↓',exact:true}).click();
    expect((await page.evaluate(()=>window.__sectionScrolls)).at(-1).behavior).toBe('instant');
    await page.goto(base+'/projects/suhulog/',{waitUntil:'networkidle'});
    await page.getByRole('link',{name:'Follow a reading ↓',exact:true}).click();
    expect((await page.evaluate(()=>window.__sectionScrolls)).at(-1)).toMatchObject({id:'suhu-loop',behavior:'instant'});
    await expect(page.locator('#suhu-loop')).toBeFocused();
    await page.goto(base+'/projects/labstock/',{waitUntil:'networkidle'});
    for(const link of await page.locator('.ls-study a[href^="#"]').all()){
     const id=(await link.getAttribute('href')).slice(1);
     await link.click();
     expect((await page.evaluate(()=>window.__sectionScrolls)).at(-1)).toMatchObject({id,behavior:'instant'});
     await expect(page.locator('#'+id)).toBeFocused();
    }
    await context.close();
   }
   const context=await browser.newContext({viewport:{width:1440,height:900}});await instrument(context);
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/projects/porsche-3d/',{waitUntil:'networkidle'});await settle(page);
   const video=page.getByLabel('Porsche 3D original configurator recording');
   await expect(page.locator('details.study-recording')).toHaveCount(0);
   await expect(video).toHaveAttribute('controls','');await expect(video).toHaveAttribute('playsinline','');
   expect(await page.evaluate(()=>window.__mediaAttempts.length)).toBe(0);
   await video.scrollIntoViewIfNeeded();
   await expect.poll(()=>page.evaluate(()=>window.__mediaAttempts.length)).toBe(1);
   expect(await video.evaluate(v=>({muted:v.muted,loop:v.loop}))).toEqual({muted:true,loop:false});
   await page.screenshot({path:`${dir}/${name}-porsche-recording.png`});
   await page.locator('.aw-center').evaluate(e=>e.scrollTo({top:0,behavior:'instant'}));
   await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(true);
   await video.scrollIntoViewIfNeeded();await page.waitForTimeout(200);
   expect(await page.evaluate(()=>window.__mediaAttempts.length)).toBe(1);
   // Changing motion preference during playback also pauses the video.
   await video.evaluate(v=>v.play().catch(()=>{}));await page.emulateMedia({reducedMotion:'reduce'});
   await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(true);
   await context.close();
   const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:900}});await instrument(reduced);
   const rp=await reduced.newPage();await rp.goto(base+'/projects/porsche-3d/',{waitUntil:'networkidle'});
   const rv=rp.getByLabel('Porsche 3D original configurator recording');await rv.scrollIntoViewIfNeeded();await rp.waitForTimeout(200);
   expect(await rp.evaluate(()=>window.__mediaAttempts.length)).toBe(0);expect(await rv.evaluate(v=>v.paused)).toBe(true);
   await rp.screenshot({path:`${dir}/${name}-390-porsche-reduced.png`});await reduced.close();
   const blocked=await browser.newContext();await instrument(blocked,true);
   const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));
   await bp.goto(base+'/projects/porsche-3d/',{waitUntil:'networkidle'});const bv=bp.getByLabel('Porsche 3D original configurator recording');
   await bv.scrollIntoViewIfNeeded();await expect.poll(()=>bp.evaluate(()=>window.__mediaAttempts.length)).toBe(1);
   await expect(bv).toBeVisible();expect(await bv.evaluate(v=>v.controls&&v.paused&&v.muted)).toBe(true);
   await blocked.close();expect(errors).toEqual([]);
   console.log(`${name}: nested smooth scroll, instant reduced motion, shared section links, inline muted one-shot video, offscreen pause and rejected autoplay PASS`);
  } finally {await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
