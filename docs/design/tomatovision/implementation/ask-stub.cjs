/* Node QA script (CommonJS), run outside the app. */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('/Users/adjie/Projects/labstock-pk/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  let body = null;
  await page.route('**/ask', async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body: 'data: {"response":"STUB-ANSWER streamed"}\n\ndata: [DONE]\n\n' });
  });
  await page.goto('http://localhost:4173/workspace/', { waitUntil: 'networkidle' });
  await page.locator('.aw-project-shortcuts button', { hasText: 'TomatoVision' }).click();
  await page.waitForSelector('.tv-ask');
  await page.locator('.tv-ask input').fill('How was the dataset split?');
  await page.locator('.tv-ask input').press('Enter');
  await page.waitForSelector('text=STUB-ANSWER', { timeout: 10000 });
  console.log('request body:', JSON.stringify({ message: body.message, projectId: body.projectId }));
  console.log('answer rendered:', await page.locator('.aw-conversation').innerText().then((t) => t.includes('STUB-ANSWER streamed')));
  await browser.close();
})();
