import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createStaticServer} from '../../scripts/serve-static.mjs';
let server,browser,origin;
before(async()=>{server=createStaticServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function pageWith(run,options={}){const context=await browser.newContext(options);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));try{await run(page,context);assert.deepEqual(errors,[]);}finally{await context.close();}}
test('首次深链访问欢迎所有使用者，Esc关闭、刷新不重复、可手动再次查看',()=>pageWith(async page=>{
 await page.goto(origin+'/courses/course-period-02/');const dialog=page.getByRole('dialog');await dialog.waitFor();
 assert.match(await dialog.innerText(),/法律为什么具有约束力/);assert.doesNotMatch(await dialog.innerText(),/恭喜|新生|新同学/);
 await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement)),true);
 await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.reload();assert.equal(await dialog.isVisible(),false);
 await page.goto(origin+'/help/');const reopen=page.getByRole('button',{name:'再读使用者欢迎'});await reopen.click();await dialog.waitFor();await page.getByRole('button',{name:'关闭使用者欢迎'}).click();assert.equal(await reopen.evaluate(e=>e===document.activeElement),true);
}));
test('欢迎按钮通向使用指南，教程截图与第一期入口可用',()=>pageWith(async page=>{
 await page.goto(origin+'/');await page.getByRole('dialog').getByRole('link',{name:'查看使用指南'}).click();await page.waitForURL(/help\/guide/);
 assert.match(await page.locator('h1').innerText(),/案例/);assert.match(await page.locator('article').innerText(),/不会自动跨设备同步/);
 await page.locator('article img').last().scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('article img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.getByRole('link',{name:'从第一期课程开始 →',exact:true}).click();await page.waitForURL(/course-period-01/);
}));
test('存储被禁用仍能关闭欢迎并继续浏览',()=>pageWith(async page=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError')};});await page.goto(origin+'/help/');await page.getByRole('dialog').waitFor();await page.getByRole('button',{name:'关闭使用者欢迎'}).click();assert.equal(await page.getByRole('dialog').isVisible(),false);assert.equal(await page.locator('body').evaluate(e=>e.style.overflow),'');
}));
for(const colorScheme of ['light','dark'])test(`375px ${colorScheme} 欢迎、帮助、指南、反馈无横向裁切`,()=>pageWith(async page=>{
 await page.goto(origin+'/');const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await page.screenshot({path:`output/playwright/welcome-${colorScheme}-375.png`});await page.keyboard.press('Escape');
 for(const path of ['/help/','/help/guide/','/help/feedback/?from=%2Fcases%2Fcase-0012%2F']){await page.goto(origin+path);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);await page.screenshot({path:`output/playwright/help-${colorScheme}-${path.includes('guide')?'guide':path.includes('feedback')?'feedback':'index'}-375.png`,fullPage:true});}
},{viewport:{width:375,height:812},colorScheme}));
test('反馈带入当前页面、会话草稿可恢复，未接通时绝不显示送达成功',()=>pageWith(async(page)=>{
 await page.goto(origin+'/cases/case-0012/');await page.keyboard.press('Escape');await page.getByRole('link',{name:'反馈此页的使用问题 ↗'}).click();await page.waitForURL(/help\/feedback/);assert.equal(await page.getByLabel('问题所在页面（可修改）').inputValue(),'/cases/case-0012/');
 await page.getByLabel('具体描述').fill('我希望更容易找到法理学术语解释。');await page.reload();await page.waitForFunction(()=>document.querySelector('#feedback-description')?.value.includes('术语解释'));assert.doesNotMatch(await page.locator('.feedback-form').innerText(),/提交成功|已送达/);
}));

test('欢迎信显示反馈邀请与准确邮箱，邮件反馈保留类型、页面及正文',()=>pageWith(async page=>{
 await page.goto(origin+'/help/');const dialog=page.getByRole('dialog');await dialog.waitFor();const contact=dialog.getByRole('link',{name:'yuqingliao486@gmail.com',exact:true});assert.equal(await contact.getAttribute('href'),'mailto:yuqingliao486@gmail.com');assert.match(await dialog.innerText(),/分享你的使用体验、反馈问题/);await contact.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/welcome-contact-375.png'});
 await page.keyboard.press('Escape');await page.goto(origin+'/help/feedback/?from=%2Fcases%2Fcase-0012%2F');await page.getByLabel('具体描述').fill('希望补充权利与义务的概念解释。');const href=await page.getByRole('link',{name:'通过邮件反馈',exact:true}).getAttribute('href');const url=new URL(href);assert.equal(url.pathname,'yuqingliao486@gmail.com');assert.match(url.searchParams.get('body'),/case-0012/);assert.match(url.searchParams.get('body'),/权利与义务/);assert.doesNotMatch(await page.locator('.feedback-form').innerText(),/正在配置|已发送成功/);
 await page.getByLabel('具体描述').fill('需要详细描述的问题。'.repeat(250));const long=new URL(await page.getByRole('link',{name:'通过邮件反馈',exact:true}).getAttribute('href'));assert.equal(long.searchParams.has('body'),false);assert.match(await page.locator('.feedback-form').innerText(),/意见较长，请先复制/);
},{viewport:{width:375,height:812}}));

test('脚本慢加载时先恢复草稿再开放输入，邮件正文不丢失首次输入',()=>pageWith(async page=>{
 await page.addInitScript(()=>localStorage.setItem('faxue-welcome-dismissed','2026-welcome-1'));
 await page.route('**/*.js',async route=>{await new Promise(r=>setTimeout(r,400));await route.continue();});
 await page.goto(origin+'/help/feedback/',{waitUntil:'commit'});
 await page.getByLabel('具体描述').fill('首次输入必须保留');
 await page.waitForTimeout(500);
 assert.equal(await page.getByLabel('具体描述').inputValue(),'首次输入必须保留');
 assert.match(new URL(await page.getByRole('link',{name:'通过邮件反馈',exact:true}).getAttribute('href')).searchParams.get('body'),/首次输入必须保留/);
}));
