import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createStaticServer } from '../../scripts/serve-static.mjs';
const routes = ['/', '/cases/', '/cases/case-0113/', '/cases/case-0001/study/', '/courses/', '/courses/course-period-01/', '/courses/course-period-08/', '/experiments/', '/archive/', '/resources/', '/resources/videos/course-period-01/', '/experiments/exp-reasoning/?case=case-0030', '/experiments/exp-argumentation/?case=case-0067', '/experiments/exp-norm-retrieval/?case=case-0012', '/experiments/exp-interpretation/?case=case-0056', '/experiments/exp-value-balancing/?case=case-0097', '/experiments/exp-annotation/?case=case-0093'];
test('页面类型矩阵：四种宽度、明暗模式、真实操作区边界与导航键盘', async () => {
 const server=createStaticServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
 const failures=[];
 try {
 for(const width of [375,390,768,1280]) for(const colorScheme of ['light','dark']) {
  const context=await browser.newContext({viewport:{width,height:900},colorScheme});await context.addInitScript(()=>localStorage.setItem("faxue-welcome-dismissed","2026-welcome-1"));const page=await context.newPage();
  page.on('pageerror',e=>failures.push(e.message));
  for(const route of routes){
   const response=await page.goto(origin+route,{waitUntil:"domcontentloaded"});assert.equal(response.status(),200,route);
   await page.waitForTimeout(120);
   const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
   if(overflow.scroll>width+2)failures.push(`${width}/${colorScheme}${route}: ${overflow.scroll}`);
   const outside=await page.locator('main button, main input, main textarea, .course-task-actions a').evaluateAll(elements=>elements.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('.sidenav')&&(r.left < -2 || r.right>innerWidth+2)}).map(e=>e.textContent?.trim().slice(0,35)||e.tagName));
   if(outside.length)failures.push(`${width}/${colorScheme}${route}: ${outside.join(',')}`);
  }
  if(width<=768){
   await page.goto(origin+'/');
   const toggle=page.getByRole('button',{name:'打开导航',exact:true});await toggle.click();
   await page.keyboard.press('Tab');assert.equal(await page.locator('.sidenav').evaluate(e=>e.contains(document.activeElement)),true);
   await page.keyboard.press('Escape');await page.waitForTimeout(50);assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
  }
  await context.close();
 }
 assert.deepEqual(failures,[]);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
