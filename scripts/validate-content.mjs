#!/usr/bin/env node
import { validateContent } from "../lib/content/validate-content.js";
import { getJurisprudenceLearningData, validateJurisprudenceLearning } from "../lib/content/jurisprudence-learning.js";
import { loadShowcaseCases } from "../lib/showcase-cases.js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { statSync } from "node:fs";
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
const learningErrors = validateJurisprudenceLearning(getJurisprudenceLearningData(), cases.map(item => item.id));
for (const link of getJurisprudenceLearningData().caseLinks.filter(item => ['published', 'reviewed'].includes(item.status))) {
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
  try { if (!statSync(join('public', item.href.slice(1))).isFile()) libraryErrors.push(`${item.id}: 资料文件不存在`); }
  catch { libraryErrors.push(`${item.id}: 资料文件不存在`); }
}
if (libraryErrors.length) {
  for (const error of libraryErrors) console.error(`资料专区：${error}`);
  process.exit(1);
}

console.log("Content validation passed.");
