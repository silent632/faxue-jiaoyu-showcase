import { caseRubrics } from "../../lib/case-rubrics.js";
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { createStaticServer } from "../../scripts/serve-static.mjs";
import { completedRecord } from "../fixtures/experiment-records.mjs";

let server;
let browser;
let origin;
before(async () => {
  server = createStaticServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
  await mkdir("output/playwright", { recursive: true });
});
after(async () => { await browser?.close(); await new Promise((resolve) => server?.close(resolve)); });

async function withPage(run, options = {}) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try { await run(page, context); assert.deepEqual(errors, [], "页面不得出现未捕获异常"); }
  finally { await context.close(); }
}

const studyKey = "study_public-showcase_case-0001";
const experimentKey = "faxue-experiment-v2:exp-reasoning:case-0001";

test("研习输入后立即站内离开、刷新并恢复三步内容", () => withPage(async (page) => {
  await page.goto(`${origin}/cases/case-0001/study/`);
  const fact = "关键事实与时间关系。".repeat(8);
  const issue = "双方争议及其证据关系。".repeat(8);
  await page.getByRole("textbox").first().fill(fact);
  await page.getByRole("textbox").nth(1).fill(issue);
  await page.getByRole("link", { name: "← 返回详情" }).click();
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), studyKey)).issue, issue);
  await page.goto(`${origin}/cases/case-0001/study/`);
  await page.reload();
  await page.getByRole("textbox").nth(1).waitFor();
  assert.equal(await page.getByRole("textbox").first().inputValue(), fact);
  assert.equal(await page.getByRole("textbox").nth(1).inputValue(), issue);
}));

test("实验空草稿不计完成，完整产出可完成，自评非强制", () => withPage(async (page) => {
  await page.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
  await page.getByRole("button", { name: "保存草稿", exact: true }).click();
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), experimentKey)).status, "draft");
  const next = page.getByRole("button", { name: "完成产出，进入对照指引 →" });
  assert.equal(await next.isEnabled(), false);
  const fields = ["规范适用条件", "事实对应每个要件", "根据对应形成结论", "检查对应是否遗漏"];
  for (let i = 0; i < fields.length; i += 1) await page.getByRole("textbox").nth(i).fill(fields[i]);
  await page.reload();
  await page.getByRole("textbox").first().waitFor();
  // 等待本地草稿恢复，输入框不能停留在服务端初值。
  await page.waitForFunction(() => document.querySelector("textarea")?.value === "规范适用条件");
  await next.click();
  await page.getByRole("button", { name: "对照完成，进入自我评价 →" }).click();
  await page.getByRole("button", { name: "存档铸能，完成本次实验" }).click();
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), experimentKey)).status, "completed");
  await page.getByRole("textbox").first().fill("");
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), experimentKey)).status, "draft");
}));

test("存储容量不足时保留输入并显示失败，无成功假象", () => withPage(async (page) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new DOMException("storage full", "QuotaExceededError"); };
  });
  await page.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
  await page.getByRole("textbox").first().fill("即使失败也保留此输入");
  assert.equal(await page.getByRole("textbox").first().inputValue(), "即使失败也保留此输入");
  assert.match(await page.getByRole("status").innerText(), /存储空间不足/);
  assert.equal(await page.getByText("本次实验已完成并保存", { exact: true }).count(), 0);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出当前实验" }).click();
  assert.match((await downloadPromise).suggestedFilename(), /实验记录.json/);
}));

test("分页深链刷新保持页码，主动搜索才回到第一页", () => withPage(async (page) => {
  await page.goto(`${origin}/cases/?page=3`);
  await page.waitForTimeout(400);
  assert.match(page.url(), /page=3/);
  assert.match(await page.locator("body").innerText(), /第 3 \/ 11 页/);
  await page.reload();
  await page.waitForTimeout(400);
  assert.match(page.url(), /page=3/);
  await page.getByRole("searchbox").fill("张保林");
  await page.waitForTimeout(400);
  assert.doesNotMatch(page.url(), /page=3/);
  assert.match(await page.locator("body").innerText(), /第 1 \/ 1 页/);
}));

for (const width of [375, 390, 768, 1280]) {
  test(`${width}px 案例标签与课程标题不越界`, () => withPage(async (page) => {
    for (const route of ["/cases/", "/courses/course-period-08/"]) {
      await page.goto(`${origin}${route}`);
      await page.waitForTimeout(350);
      const measure = await page.evaluate(() => ({
        width: innerWidth, scroll: document.documentElement.scrollWidth,
        overflow: [...document.querySelectorAll(".case-card-tags .tag, .course-period-home-actions, .course-detail-hero-copy")].filter((node) => node.getBoundingClientRect().right > innerWidth + 1).map((node) => node.className),
      }));
      assert.ok(measure.scroll <= width + 1, JSON.stringify(measure));
      assert.deepEqual(measure.overflow, []);
      await page.screenshot({ path: `output/playwright/optimized-${route.includes("course") ? "course" : "cases"}-${width}.png` });
    }
  }, { viewport: { width, height: 900 }, colorScheme: width === 768 ? "dark" : "light" }));
}

async function readDownload(page, button) {
  const pending = page.waitForEvent("download");
  await button.click();
  const stream = await (await pending).createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
async function uploadBackup(page, value) {
  await page.getByLabel("备份文件").setInputFiles({ name: "学习备份.json", mimeType: "application/json", buffer: Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value)) });
  await page.getByRole("button", { name: "导入并保留冲突副本" }).waitFor();
}

test("真实导出后在空浏览器导入，研习和实验可恢复续写，重复导入不倍增", () => withPage(async (page) => {
  await page.goto(`${origin}/cases/case-0001/study/`);
  const fact = "从原浏览器导出的事实".repeat(6);
  await page.getByRole("textbox").first().fill(fact);
  await page.getByRole("textbox").nth(1).fill("需要恢复的争点".repeat(9));
  await page.getByRole("textbox").nth(2).fill("需要恢复的分析");
  await page.evaluate(({ key, record }) => localStorage.setItem(key, JSON.stringify(record)), { key: experimentKey, record: completedRecord("exp-reasoning") });
  await page.goto(`${origin}/archive/`);
  const file = await readDownload(page, page.getByRole("button", { name: "导出全部记录" }));
  assert.equal(JSON.parse(file).version, 2);
  await withPage(async (fresh) => {
    await fresh.goto(`${origin}/archive/`);
    await uploadBackup(fresh, file);
    assert.match(await fresh.locator(".archive-import-preview").innerText(), /新增 2 条/);
    await fresh.getByRole("button", { name: "导入并保留冲突副本" }).click();
    await fresh.getByText(/导入完成：新增 2 条/).waitFor();
    await uploadBackup(fresh, file);
    assert.match(await fresh.locator(".archive-import-preview").innerText(), /重复 2 条/);
    await fresh.getByRole("button", { name: "取消导入" }).click();
    await fresh.goto(`${origin}/cases/case-0001/study/`);
    await fresh.waitForFunction((expected) => document.querySelector("textarea")?.value === expected, fact);
    assert.equal(await fresh.getByRole("textbox").nth(2).inputValue(), "需要恢复的分析");
    await fresh.getByRole("textbox").first().fill("恢复后继续写作");
    await fresh.reload();
    await fresh.waitForFunction(() => document.querySelector("textarea")?.value === "恢复后继续写作");
    await fresh.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
    await fresh.waitForFunction(() => document.querySelector("textarea")?.value === "规范的适用条件");
    await fresh.getByRole("textbox").first().fill("恢复实验后继续修改");
    await fresh.reload();
    await fresh.waitForFunction(() => document.querySelector("textarea")?.value === "恢复实验后继续修改");
  });
}));

test("导入冲突可查看和导出副本，未知案例不生成失效链接，手机布局可读", () => withPage(async (page) => {
  await page.goto(`${origin}/archive/`);
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ fact: "保留本地原稿", issue: "", analysis: "" })), studyKey);
  const value = { version: 1, studyRecords: { "case-0001": { fact: "导入的不同原稿" } }, experimentArchive: { "exp-reasoning": { "retired-case": completedRecord("exp-reasoning", { caseTitle: "历史材料" }) } } };
  await uploadBackup(page, value);
  assert.match(await page.locator(".archive-import-preview").innerText(), /冲突副本 1 条 · 未知案例记录 1 条/);
  await page.getByRole("button", { name: "导入并保留冲突副本" }).click();
  await page.getByText(/导入完成：新增 1 条/).waitFor();
  assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fact, studyKey), "保留本地原稿");
  await page.getByRole("button", { name: "查看副本 1" }).click();
  assert.match(await page.getByLabel("副本内容").inputValue(), /导入的不同原稿/);
  const exported = JSON.parse(await readDownload(page, page.getByRole("button", { name: "导出全部记录" })));
  assert.equal(exported.alternatives.length, 1);
  assert.equal(await page.locator('a[href*="retired-case"]').count(), 0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.screenshot({ path: "output/playwright/archive-import-375.png", fullPage: true });
}, { viewport: { width: 375, height: 900 }, colorScheme: "dark" }));

test("导入容量不足和非法版本不会破坏已有记录", () => withPage(async (page) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "faxue-import-v1") throw new DOMException("full", "QuotaExceededError");
      return set.call(this, key, value);
    };
  });
  await page.goto(`${origin}/archive/`);
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ fact: "不可丢失", issue: "", analysis: "" })), studyKey);
  const value = { version: 1, studyRecords: { "case-0002": { fact: "新内容" } }, experimentArchive: {} };
  await uploadBackup(page, value);
  await page.getByRole("button", { name: "导入并保留冲突副本" }).click();
  await page.getByRole("alert").filter({ hasText: "存储空间不足" }).waitFor();
  assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fact, studyKey), "不可丢失");
  assert.equal(await page.evaluate(() => localStorage.getItem("faxue-import-v1")), null);
  await page.getByLabel("备份文件").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ ...value, version: 99 })) });
  await page.getByRole("alert").filter({ hasText: "版本不兼容" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "导入并保留冲突副本" }).count(), 0);
}));

test("PDF 引用页深链、文字选择复制、全文查找和缩放使用真实文书", () => withPage(async (page) => {
  await page.goto(`${origin}/cases/case-0001/#page=14`);
  await page.waitForFunction(() => document.querySelector(".pdf-text-layer")?.textContent.replace(/\s+/g, "").includes("二〇二〇年十二月十七日"));
  assert.equal(await page.getByLabel("跳转页码").inputValue(), "14");
  const copy = await page.evaluate(() => {
    const span = document.querySelector(".pdf-text-layer span");
    const range = document.createRange(); range.selectNodeContents(span);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    const clipboardData = new DataTransfer();
    span.dispatchEvent(new ClipboardEvent("copy", { bubbles: true, cancelable: true, clipboardData }));
    return clipboardData.getData("text/plain");
  });
  assert.match(copy, /\(2020\)湘04刑初60号，PDF 第 14 页/);
  await page.getByLabel("跳转页码").fill("1");
  await page.getByRole("button", { name: "跳转", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".pdf-text-layer")?.getAttribute("aria-label") === "PDF 第 1 页文字" && document.querySelectorAll(".pdf-text-layer span").length > 0);
  await page.getByLabel("查找 PDF 原文").fill("二〇二〇年十二月十七日");
  await page.getByRole("button", { name: "查找全文", exact: true }).click();
  await page.getByRole("button", { name: "定位到第 14 页", exact: true }).click();
  await page.locator(".pdf-text-match").first().waitFor();
  await page.getByRole("button", { name: "放大", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector(".pdf-rendering-badge") && document.querySelectorAll(".pdf-text-layer span").length > 0);
  const dimensions = await page.evaluate(() => {
    const canvas = document.querySelector(".pdf-canvas").getBoundingClientRect();
    const layer = document.querySelector(".pdf-text-layer").getBoundingClientRect();
    return { dx: Math.abs(canvas.x - layer.x), dy: Math.abs(canvas.y - layer.y), width: Math.abs(canvas.width - layer.width), height: Math.abs(canvas.height - layer.height), overflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  assert.ok(dimensions.dx < 1 && dimensions.dy < 1 && dimensions.width < 1 && dimensions.height < 1, JSON.stringify(dimensions));
  assert.equal(dimensions.overflow, false);
  await page.getByRole("button", { name: "整页预览", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector(".pdf-rendering-badge"));
  assert.ok(await page.evaluate(() => document.querySelector(".pdf-canvas").getBoundingClientRect().width <= document.querySelector(".pdf-frame-wrap").getBoundingClientRect().width), "手机整页预览应适配阅读区宽度");
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.waitForFunction(() => !document.querySelector(".pdf-rendering-badge") && document.querySelectorAll(".pdf-text-match").length > 0);
  await page.locator(".pdf-page-surface").screenshot({ path: "output/playwright/pdf-text-page14.png" });
  await page.getByLabel("查找 PDF 原文").fill("没有此检索词XYZ123");
  await page.getByRole("button", { name: "查找全文", exact: true }).click();
  await page.getByText("找到 0 页匹配结果。", { exact: true }).waitFor();
  assert.equal(await page.locator(".pdf-text-match").count(), 0);
  assert.equal(await page.getByRole("link", { name: "下载 PDF", exact: true }).count(), 1);
}, { viewport: { width: 390, height: 900 } }));

test("PDF 没有文字层时明确提示，全文查找不伪造识别结果", () => withPage(async (page) => {
  // 测试专用空白 PDF，模拟没有可提取文字的页面；不替换仓库中的原始材料。
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << >> /Contents 4 0 R >>", "<< /Length 0 >>\nstream\n\nendstream"];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 5\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  await page.route("**/pdfs/**", (route) => route.fulfill({ contentType: "application/pdf", body: Buffer.from(pdf) }));
  await page.goto(`${origin}/cases/case-0001/#page=1`);
  await page.getByText(/本页没有可选择文字/).waitFor();
  await page.getByLabel("查找 PDF 原文").fill("法院");
  await page.getByRole("button", { name: "查找全文", exact: true }).click();
  await page.getByText("找到 0 页匹配结果。1 页没有可检索文字。", { exact: true }).waitFor();
  assert.equal(await page.locator(".pdf-text-layer span").count(), 0);
}));

test("规范对照保存恢复、修改失效及待核查案例阻止完成", () => withPage(async (page) => {
  await page.goto(`${origin}/experiments/exp-norm-retrieval/?case=case-0001`);
  await page.getByRole('button', { name: '中华人民共和国刑法', exact: true }).click();
  await page.getByLabel('选择理由与其他规范依据').fill('先核对犯罪构成与刑事责任，再检查程序规范。');
  await page.getByRole('button', { name: '查看原文依据并对照', exact: true }).click();
  await page.getByText('与已核对段落对照', { exact: true }).waitFor();
  const next = page.getByRole('button', { name: '完成产出，进入对照指引 →' });
  assert.equal(await next.isEnabled(), true);
  await page.reload();
  await page.getByText('与已核对段落对照', { exact: true }).waitFor();
  assert.equal(await next.isEnabled(), true);
  await page.getByLabel('选择理由与其他规范依据').fill('修改后应重新核对。');
  assert.equal(await next.isEnabled(), false);
  assert.equal(await page.locator('.exp-norm-chip').evaluateAll((buttons) => buttons.every((button) => button.getBoundingClientRect().right <= innerWidth)), true);
  await page.screenshot({ path: 'output/playwright/norm-375.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.goto(`${origin}/experiments/exp-norm-retrieval/?case=case-0081`);
  await page.getByText(/本案例原文依据待核查/).waitFor();
  assert.equal(await page.getByRole('button', { name: '查看原文依据并对照', exact: true }).isEnabled(), false);
}, { viewport: { width: 375, height: 812 } }));

test("旧版规范简称保留为历史选择，重新对照后可以完成存档", () => withPage(async (page) => {
  const key = 'faxue-experiment-v2:exp-norm-retrieval:case-0001';
  await page.goto(`${origin}/experiments/exp-norm-retrieval/?case=case-0001`);
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 2, status: 'draft', interactionData: { selected: ['刑法', '最高人民法院司法解释'], reason: '旧版理由保留' } })), key);
  await page.reload();
  await page.getByText(/旧版选择已保留：刑法、最高人民法院司法解释/).waitFor();
  assert.equal(await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).isEnabled(), false);
  await page.getByRole('button', { name: '中华人民共和国刑法', exact: true }).click();
  await page.getByRole('button', { name: '查看原文依据并对照', exact: true }).click();
  const record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  assert.deepEqual(record.interactionData.legacySelection, ['刑法', '最高人民法院司法解释']);
  assert.equal(record.interactionData.reason, '旧版理由保留');
  await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).click();
  await page.getByRole('button', { name: '对照完成，进入自我评价 →' }).click();
  await page.getByRole('button', { name: '存档铸能，完成本次实验', exact: true }).click();
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key)).status, 'completed');
}));

test('原文批注支持键盘、取消、刷新恢复、页码引用与完成存档', () => withPage(async (page) => {
  const key = 'faxue-experiment-v2:exp-annotation:case-0001';
  await page.goto(`${origin}/experiments/exp-annotation/?case=case-0001`);
  const paragraph = page.getByRole('button', { name: /^标注摘录 1/ });
  await paragraph.focus();
  await page.keyboard.press('Enter');
  assert.equal(await paragraph.getAttribute('aria-pressed'), 'true');
  await page.keyboard.press('Space');
  assert.equal(await paragraph.getAttribute('aria-pressed'), 'false');
  await page.getByRole('button', { name: '结论', exact: true }).click();
  await paragraph.click();
  await page.getByLabel('整体说理评价', { exact: true }).fill('该句把事实判断与犯罪构成结论联系起来，还需结合完整说理检查规范前提。');
  const next = page.getByRole('button', { name: '完成产出，进入对照指引 →' });
  assert.equal(await next.isEnabled(), true);
  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  assert.equal(saved.interactionData.annotations[0].page, 12);
  assert.match(saved.interactionData.annotations[0].text, /^本院认为/);
  assert.equal(saved.interactionData.annotations[0].paraIndex, undefined);
  await page.reload();
  await page.getByRole('button', { name: '标注摘录 1，已标为结论', exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: /原文第 12 页 · 摘录 1/ }).getAttribute('href'), '/cases/case-0001/#page=12');
  assert.equal(await page.locator('.exp-annotation-para').evaluateAll((nodes) => nodes.every((node) => node.getBoundingClientRect().right <= innerWidth)), true);
  await page.screenshot({ path: 'output/playwright/annotation-375.png', fullPage: true });
  await next.click();
  await page.getByRole('button', { name: '对照完成，进入自我评价 →' }).click();
  await page.getByRole('button', { name: '存档铸能，完成本次实验' }).click();
  assert.equal((await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key)).status, 'completed');
}, { viewport: { width: 375, height: 812 } }));

test('旧批注保留历史但不贴到新原文，无摘录案例不能完成', () => withPage(async (page) => {
  const key = 'faxue-experiment-v2:exp-annotation:case-0001';
  await page.goto(`${origin}/experiments/exp-annotation/?case=case-0001`);
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 2, status: 'completed', interactionData: { annotations: [{ paraIndex: 0, tagId: 'major-premise' }], evaluation: '此前对教学整理的评价' } })), key);
  await page.reload();
  await page.getByText('旧批注待复核（1 组）', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: '标注摘录 1', exact: true }).getAttribute('aria-pressed'), 'false');
  assert.equal(await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).isEnabled(), false);
  await page.getByRole('button', { name: '标注摘录 1', exact: true }).click();
  await page.reload();
  await page.getByText('旧批注待复核（1 组）', { exact: true }).waitFor();
  const record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  assert.equal(record.interactionData.historicalAnnotations.length, 1);
  assert.deepEqual(record.interactionData.historicalAnnotations[0].annotations, [{ paraIndex: 0, tagId: 'major-premise' }]);
  assert.equal(record.interactionData.evaluation, '此前对教学整理的评价');
  record.interactionData.sourceVersion = 'previous-pdf-version';
  await page.evaluate(({ key, record }) => localStorage.setItem(key, JSON.stringify(record)), { key, record });
  await page.reload();
  await page.getByText('旧批注待复核（2 组）', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: '标注摘录 1', exact: true }).getAttribute('aria-pressed'), 'false');
  await page.getByRole('button', { name: '标注摘录 1', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出当前实验', exact: true }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8'));
  const history = exported.experimentArchive['exp-annotation']['case-0001'].interactionData.historicalAnnotations;
  assert.equal(history.length, 2);
  assert.equal(history[1].annotations[0].text, record.interactionData.annotations[0].text);
  await page.goto(`${origin}/experiments/exp-annotation/?case=case-0002`);
  await page.getByText('本案原文摘录待核查', { exact: true }).waitFor();
  await page.getByLabel('整体说理评价', { exact: true }).fill('待核查材料的笔记');
  assert.equal(await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).isEnabled(), false);
}));

test('对照留存初稿，修订说明、阶段和导出在刷新后保持一致', () => withPage(async (page) => {
  await page.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
  const originals = ['初稿规范条件', '初稿事实对应', '初稿结论', '初稿推导疑点'];
  for (let i = 0; i < 4; i++) await page.getByRole('textbox').nth(i).fill(originals[i]);
  await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).click();
  await page.getByRole('heading', { name: '对照指引', exact: true }).waitFor();
  await page.getByRole('textbox').nth(2).fill('修订稿补充了事实与结论的对应');
  await page.getByRole('button', { name: '对照完成，进入自我评价 →' }).click();
  const finish = page.getByRole('button', { name: '存档铸能，完成本次实验' });
  assert.equal(await finish.isEnabled(), false);
  const note = page.getByLabel('修改说明与依据', { exact: true });
  await note.fill('根据原文第12页补充了推导步骤。');
  assert.equal(await finish.isEnabled(), true);
  await page.getByRole('textbox').nth(2).fill('再次修改后的推导结论');
  assert.equal(await note.inputValue(), '根据原文第12页补充了推导步骤。');
  assert.equal(await finish.isEnabled(), false);
  await page.getByRole('button', { name: '确认说明适用于当前稿', exact: true }).click();
  await page.reload();
  await page.getByRole('heading', { name: '自我评价', exact: true }).waitFor();
  assert.equal(await finish.isEnabled(), true);
  const record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), experimentKey);
  assert.equal(record.initialDraft.interactionData.conclusion, '初稿结论');
  assert.equal(record.interactionData.conclusion, '再次修改后的推导结论');
  assert.equal(record.revisionNote, '根据原文第12页补充了推导步骤。');
  await page.getByText('查看对照前初稿', { exact: true }).click();
  await page.screenshot({ path: 'output/playwright/revision-390.png', fullPage: true });
  await page.locator('.exp-revision-panel').screenshot({ path: 'output/playwright/revision-panel-390.png' });
  await finish.click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出当前实验', exact: true }).click();
  const download = await downloadPromise;
  const exported = JSON.parse(await readFile(await download.path(), 'utf8')).experimentArchive['exp-reasoning']['case-0001'];
  assert.equal(exported.status, 'completed');
  assert.deepEqual(exported.initialDraft, record.initialDraft);
  assert.equal(exported.revisionNoteConfirmed, true);
}, { viewport: { width: 390, height: 844 } }));

test('初稿保存失败不会进入对照阶段或覆盖已存产出', () => withPage(async (page) => {
  await page.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
  for (let i = 0; i < 4; i++) await page.getByRole('textbox').nth(i).fill('可验证的产出内容');
  const before = await page.evaluate((key) => localStorage.getItem(key), experimentKey);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).click();
  assert.equal(await page.getByRole('heading', { name: '对照指引', exact: true }).count(), 0);
  assert.equal(await page.evaluate((key) => localStorage.getItem(key), experimentKey), before);
}));

test('八篇精选案例进入对应模块即可看到不同的专属任务', () => withPage(async (page) => {
  for (const [caseId, rubric] of Object.entries(caseRubrics)) {
    await page.goto(`${origin}/experiments/${rubric.moduleId}/?case=${caseId}`);
    await page.getByRole('heading', { name: `本案专属任务 · ${rubric.title}`, exact: true }).waitFor();
    assert.equal(await page.locator('.exp-case-task').getByText(rubric.task, { exact: true }).count(), 1);
  }
  assert.equal(await page.getByRole('button', { name: '标注摘录 1', exact: true }).count(), 1);
}));

test('案例量规要求反思并保留版本、依据和历史副本', () => withPage(async (page) => {
  const caseId = 'case-0012';
  const key = 'faxue-experiment-v2:exp-norm-retrieval:case-0012';
  await page.goto(`${origin}/experiments/exp-norm-retrieval/?case=${caseId}`);
  await page.getByRole('button', { name: '中华人民共和国合同法', exact: true }).click();
  await page.getByLabel('选择理由与其他规范依据').fill('先依据合同约定识别问题，再核对实体和程序规范各自作用。');
  await page.getByRole('button', { name: '查看原文依据并对照', exact: true }).click();
  await page.getByRole('button', { name: '完成产出，进入对照指引 →' }).click();
  await page.getByRole('region', { name: '案例专属量规' }).waitFor();
  await page.getByText('查看原文依据与页码', { exact: true }).click();
  assert.equal(await page.locator('.exp-case-rubric').getByRole('link', { name: /原文第 7 页/ }).getAttribute('href'), '/cases/case-0012/#page=7');
  await page.getByText('查看原文依据与页码', { exact: true }).click();
  await page.locator('.exp-case-rubric').screenshot({ path: 'output/playwright/case-rubric-390.png' });
  await page.getByRole('button', { name: '对照完成，进入自我评价 →' }).click();
  const finish = page.getByRole('button', { name: '存档铸能，完成本次实验' });
  assert.equal(await finish.isEnabled(), false);
  await page.getByLabel('修改说明与依据', { exact: true }).fill('核对第7页条款序号与类案文本后，保留合同解释路径，并补查第8页时间效力依据。');
  await finish.click();
  const record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), key);
  assert.equal(record.status, 'completed');
  assert.equal(record.feedbackReference.version, caseRubrics[caseId].version);
  assert.equal(record.feedbackReference.evidence.length, 2);
  record.feedbackReference.version = 'historical-test-version';
  await page.evaluate(({ key, record }) => localStorage.setItem(key, JSON.stringify(record)), { key, record });
  await page.reload();
  await page.getByText(/当前显示本次作答留存的旧量规/).waitFor();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出当前实验', exact: true }).click();
  const downloaded = await downloadPromise;
  const result = JSON.parse(await readFile(await downloaded.path(), 'utf8')).experimentArchive['exp-norm-retrieval'][caseId];
  assert.equal(result.feedbackReference.version, 'historical-test-version');
  assert.deepEqual(result.feedbackReference.evidence, record.feedbackReference.evidence);
}, { viewport: { width: 390, height: 844 } }));

test('跨标签页同步与失败草稿冲突保护', () => withPage(async (page, context) => {
 const other=await context.newPage();
 await page.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
 await other.goto(`${origin}/experiments/exp-reasoning/?case=case-0001`);
 await page.getByRole('textbox').first().fill('第一页面保存的规范');
 await other.waitForFunction(()=>document.querySelector('textarea')?.value==='第一页面保存的规范');
 await page.evaluate(()=>{window.realSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError')};});
 await page.getByRole('textbox').first().fill('失败但须保留的本地草稿');
 await other.getByRole('textbox').first().fill('另一页面的新版本');
 await page.waitForFunction(()=>document.querySelector('.exp-save-notice')?.textContent.includes('另一页面'));
 assert.equal(await page.getByRole('textbox').first().inputValue(),'失败但须保留的本地草稿');
 assert.equal((await other.evaluate(key=>JSON.parse(localStorage.getItem(key)),experimentKey)).interactionData.majorPremise,'另一页面的新版本');
 await page.evaluate(()=>{Storage.prototype.setItem=window.realSetItem});
}));

test('课程完成从学习产出衔接返回课程与档案，浏览页面不计完成', () => withPage(async(page)=>{
 await page.goto(`${origin}/courses/course-period-02/`);
 assert.doesNotMatch(await page.locator('.course-task-card').innerText(),/本期任务已完成/);
 await page.goto(`${origin}/cases/case-0030/study/`);
 for(let i=0;i<3;i++) await page.getByRole('textbox').nth(i).fill('根据原文梳理规范事实和争点之间的对应关系。'.repeat(10));
 await page.goto(`${origin}/experiments/exp-reasoning/?case=case-0030`);
 for(let i=0;i<4;i++)await page.getByRole('textbox').nth(i).fill(['规范条件','事实对应','个人结论','推导反思'][i]);
 await page.getByRole('button',{name:'完成产出，进入对照指引 →'}).click();
 await page.getByLabel('修改说明与依据').fill('根据对照材料复查连带责任的规范基础，保留有依据的结论。');
 await page.getByRole('button',{name:'对照完成，进入自我评价 →'}).click();
 await page.getByRole('button',{name:'存档铸能，完成本次实验'}).click();
 await page.getByRole('link',{name:'返回本期课程查看进度'}).click();
 await page.getByText('本期任务已完成',{exact:true}).waitFor();
 await page.getByRole('link',{name:'查看学习档案',exact:true}).click();
 await page.waitForURL(/archive/);
 assert.match(page.url(),/archive/);
}));
