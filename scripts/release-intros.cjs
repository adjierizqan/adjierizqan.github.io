/* eslint-disable @typescript-eslint/no-require-imports */
const {chromium, webkit, expect} = require('@playwright/test');
const fs = require('node:fs');
const base = process.env.QA_BASE || 'http://127.0.0.1:4182';
const dir = process.env.QA_OUTPUT || 'docs/release/screenshots';
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await engine.launch();
  try {
   const context=await browser.newContext({viewport:{width:1440,height:900}});
   await context.addInitScript(()=>{
    window.__introAudio=0;
    const original=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(...args){window.__introAudio++;return original.apply(this,args);};
   });
   const page=await context.newPage(); let requests=0;
   page.on('request',r=>{if(r.url().includes('workers.dev/ask'))requests++;});
   const html=await (await page.goto(base+'/projects/labstock/',{waitUntil:'domcontentloaded'})).text();
   expect(html).toContain('How do you keep inventory traceable');
   expect(html).toContain('The workbook is the entry point.');
   await expect(page.getByRole('button',{name:'Audio settings',exact:true}).filter({visible:true})).toHaveCount(1);
   await expect(page.getByRole('button',{name:'Play music',exact:true})).toBeHidden();
   const intro=page.locator('.project-intro');
   await expect(intro).toHaveAttribute('data-playing','true');
   expect(await intro.evaluate(e=>Math.max(...e.getAnimations({subtree:true}).map(a=>a.effect.getComputedTiming().endTime)))).toBeLessThanOrEqual(1800);
   // Pause actual browser animations at a defined presentation moment for a repeatable capture.
   await page.locator('.aw-center').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=650;}));
   await expect(page.locator('.project-intro-answer .project-story > article')).toHaveCount(1);
   await expect(page.locator('.project-story')).toBeVisible();
   await expect(page.locator('.project-story > article > header')).toHaveCSS('opacity','0');
   await expect(page.getByText('Example conversation',{exact:true})).toHaveCount(0);
   await expect(intro).toHaveAccessibleDescription(/Scripted introduction/);
   await page.screenshot({path:`${dir}/${name}-intro-mid.png`});
   await page.locator('.aw-center').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>{a.currentTime=1400;}));
   await expect(page.locator('.project-intro-answer')).toBeVisible();
   await expect(page.locator('.project-story')).toBeVisible();
   await page.screenshot({path:`${dir}/${name}-intro-answer.png`});
   // WebKit intentionally does not focus buttons on pointer click; test keyboard focus retention.
   await page.getByRole('button',{name:'Skip animation',exact:true}).focus();
   await page.keyboard.press('Enter');
   await expect(intro).toHaveAttribute('data-playing','false');
   await expect(page.locator('.project-story')).toBeVisible();
   await expect(page.getByRole('button',{name:'Replay intro ↺',exact:true})).toBeFocused();
   expect(await page.evaluate(()=>window.__introAudio)).toBe(0);
   await page.keyboard.press('Enter');
   await expect(intro).toHaveAttribute('data-playing','true');
   await expect(intro).toHaveAttribute('data-playing','false');
   await expect(page.getByRole('button',{name:'Replay intro ↺',exact:true})).toBeFocused();
   expect(await page.evaluate(()=>window.__introAudio)).toBe(1);
   expect(requests).toBe(0);
   await page.reload({waitUntil:'networkidle'});
   await expect(intro).toHaveAttribute('data-playing','true');
   await expect(page.locator('.project-story')).toBeVisible();
   await expect(intro).toHaveAttribute('data-playing','false');
   expect(await page.evaluate(()=>window.__introAudio)).toBe(0);
   await page.getByRole('button',{name:'← Work',exact:true}).click();
   await page.goBack();
   await expect(intro).not.toHaveAttribute('data-playing','true');
   await page.goForward();
   await expect(intro).toHaveCount(0);
   await page.goto(base+'/');
   await page.locator('.home-project').first().click();
   await expect(intro).toHaveAttribute('data-playing','true');
   await page.emulateMedia({reducedMotion:'reduce'});
   await expect(intro).toHaveAttribute('data-playing','false');
   await expect(page.locator('.project-intro-controls')).toBeHidden();
   await expect(page.locator('.project-answer-lead')).toHaveCSS('opacity','1');
   await page.screenshot({path:`${dir}/${name}-intro-reduced.png`});
   const reduced=await browser.newPage({reducedMotion:'reduce',viewport:{width:320,height:900}});
   await reduced.goto(base+'/projects/suhulog/');
   expect(await reduced.locator('.project-intro').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
   await expect(reduced.locator('.project-answer-lead')).toBeVisible();
   await reduced.close();
   await page.goto(base+'/');
   const submissions=[];
   await page.route('**/ask',async route=>{
    submissions.push(route.request().postDataJSON().message);
    await route.fulfill({contentType:'text/event-stream',body:'data: {"response":"Home starter reached the real Ask transport."}\n\ndata: [DONE]\n\n'});
   });
   await page.getByRole('button',{name:'Start with the work'}).click();
   await expect(page.locator('.aw-message').last()).toContainText('Home starter reached the real Ask transport.');
   expect(requests).toBe(1);
   await page.goto(base+'/');
   await page.locator('.home-start textarea').fill('How does LabStock preserve source identity?');
   await page.locator('.home-start textarea').press('Enter');
   await expect(page.locator('.aw-message').last()).toContainText('Home starter reached the real Ask transport.');
   expect(requests).toBe(2);
   expect(submissions).toEqual(["Which of Adjie's projects should I look at first?", 'How does LabStock preserve source identity?']);
   // A visitor can return Home while inference is pending. Keep the shared busy/Stop state.
   await page.goto(base+'/');
   await page.unroute('**/ask');
   await page.route('**/ask',()=>{});
   await page.getByRole('button',{name:'Start with the work'}).click();
   await page.getByRole('button',{name:'Home',exact:true}).click();
   await expect(page.locator('.home-start textarea')).toBeDisabled();
   await expect(page.getByRole('button',{name:'Start with the work'})).toBeDisabled();
   await page.getByRole('button',{name:'Stop response',exact:true}).click();
   await expect(page.locator('.home-start textarea')).toBeEnabled();
   await expect(page.getByRole('button',{name:'Start with the work'})).toBeEnabled();
   await context.close();
   console.log(`${name}: silent automatic intro, semantic HTML, skip/replay focus, gesture sound, refresh/history, intentional entry, reduced motion, Home starter PASS`);
  } finally {await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
