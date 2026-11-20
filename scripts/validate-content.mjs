#!/usr/bin/env node
import { validateContent } from "../lib/content/validate-content.js";
import { getJurisprudenceLearningData, validateJurisprudenceLearning } from "../lib/content/jurisprudence-learning.js";
import { loadShowcaseCases } from "../lib/showcase-cases.js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { statSync } from "node:fs";
import caseReadingSources from "../content/case-reading-sources.json" with { type: "json" };
import lawLibrary from "../content/law-library.json" with { type: "json" };
import { getLibraryData, validateLibrary } from "../lib/content/library.js";

const result = validateContent();

if (!result.ok) {
  console.error("Content validation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const cases = await loadShowcaseCases();
const learning = getJurisprudenceLearningData();
const learningErrors = validateJurisprudenceLearning(learning, cases.map(item => item.id));
for (const topic of learning.topics.filter(item => ['published', 'reviewed'].includes(item.status))) {
  if (!topic.revisionSections?.length) learningErrors.push(`公开节点缺少课件正文：${topic.id}`);
}
for (const link of getJurisprudenceLearningData().caseLinks.filter(item => ['published', 'reviewed'].includes(item.status))) {
  if (link.pages.some(page => page > (caseReadingSources[link.caseId]?.pages ?? 0))) learningErrors.push(`案例证据超出 PDF 页数：${link.caseId}`);
  if (!link.sourceFile || basename(link.sourceFile) !== link.sourceFile) { learningErrors.push('案例原文文件名无效'); continue; }
  if (cases.find(item => item.id === link.caseId)?.pdfFile !== link.sourceFile) { learningErrors.push(`案例与原文不匹配：${link.caseId}`); continue; }
  try {
    const hash = createHash('sha256').update(readFileSync(join('public/pdfs', link.sourceFile))).digest('hex');
    if (hash !== link.sourceSha256) learningErrors.push(`案例原文指纹不一致：${link.caseId}`);
  } catch { learningErrors.push(`找不到案例原文：${link.caseId}`); }
}
if (learningErrors.length) {
  for (const error of learningErrors) console.error(`法理学习数据：${error}`);
  process.exit(1);
}

const library = getLibraryData();
const libraryErrors = validateLibrary(library, getJurisprudenceLearningData().topics.map(item => item.id));
for (const item of library.items.filter(item => item.status === 'published' && item.href?.startsWith('/library/'))) {
  try {
    const path = join('public', item.href.slice(1));
    if (!statSync(path).isFile()) libraryErrors.push(`${item.id}: 资料文件不存在`);
    else if (item.reading && createHash('sha256').update(readFileSync(path)).digest('hex') !== item.reading.sha256) {
      libraryErrors.push(`${item.id}: 经验全文文件指纹不一致`);
    }
  }
  catch { libraryErrors.push(`${item.id}: 资料文件不存在`); }
}
if (libraryErrors.length) {
  for (const error of libraryErrors) console.error(`资料专区：${error}`);
  process.exit(1);
}

const slugs = new Set();
for (const law of lawLibrary) {
  if (!law.slug || slugs.has(law.slug) || !law.title || !law.version || !/^\d{4}-\d{2}-\d{2}$/u.test(law.effective)
    || (law.repealed && (!/^\d{4}-\d{2}-\d{2}$/u.test(law.repealed) || law.repealed <= law.effective))
    || !/^https:\/\//u.test(law.source) || !law.articles.length ||
    law.articles.some((article, index) => article.number !== index + 1 || !article.label || !article.paragraphs.length || article.paragraphs.some(text => !text.trim()))) {
    console.error(`法规全文结构或来源无效：${law.title}`);
    process.exitCode = 1;
  }
  slugs.add(law.slug);
}
if (!process.exitCode) console.log("Content validation passed.");
