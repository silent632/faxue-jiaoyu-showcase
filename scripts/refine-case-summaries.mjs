#!/usr/bin/env node

/**
 * 案例摘要去模板化：用 ref_fact（事实）+ ref_issue（争点）为每篇案例
 * 生成差异化摘要，替换原先全站同构的模板 summary，并清除数据中
 * 面向开发者的内部指令句。
 *
 * 用法：
 *   node scripts/refine-case-summaries.mjs            # 生成并写入
 *   node scripts/refine-case-summaries.mjs --dry-run  # 预览不写入
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CASES_PATH = path.join(ROOT, "data", "generated", "cases-extracted.json");

const dryRun = process.argv.includes("--dry-run");

/** 数据中不允许出现的内部指令/后台话术句式 */
const INTERNAL_SENTENCE_PATTERNS = [
  /详情页仅保留导读信息/u,
  /请结合\s*PDF\s*原文阅读/u,
  /结合PDF原文阅读/u,
  /页面保留/u,
  /公开展示模式/u,
  /课堂提问/u,
];

/** 争点开头的课堂教案口吻，替换为面向读者的表述 */
const ISSUE_PREFIX_REWRITES = [
  [/^课堂可聚焦[^：:]*[：:]\s*/u, "本案可聚焦："],
  [/^本案课堂讨论[^：:]*[：:]\s*/u, "本案争点在于："],
  [/^课堂讨论[^：:]*[：:]\s*/u, "本案争点在于："],
  [/^本案可讨论的[^：:]*[：:]\s*/u, "本案争点在于："],
];

function compact(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/　/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function splitSentences(text) {
  return (compact(text).match(/[^。；！？]+[。；！？]?/gu) || [])
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripInternalSentences(text) {
  return splitSentences(text)
    .filter((sentence) => !INTERNAL_SENTENCE_PATTERNS.some((pattern) => pattern.test(sentence)))
    .join("");
}

/** 取句子直到长度达到 limit（至少取一句），句尾补句号 */
function takeSentences(text, limit) {
  const sentences = splitSentences(text);
  if (!sentences.length) return "";

  let out = "";
  for (const sentence of sentences) {
    if (out && out.length + sentence.length > limit) break;
    out += sentence;
    if (out.length >= limit * 0.6) break;
  }

  out = out.trim();
  if (out && !/[。；！？]$/u.test(out)) out += "。";
  return out.replace(/；$/u, "。");
}

function buildFactPart(refFact) {
  const cleaned = compact(refFact).replace(/^文书记载，/u, "");
  return takeSentences(cleaned, 110);
}

function buildIssuePart(refIssue) {
  let cleaned = compact(refIssue);
  for (const [pattern, replacement] of ISSUE_PREFIX_REWRITES) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement);
      break;
    }
  }
  return takeSentences(cleaned, 90);
}

function buildSummary(caseRow) {
  const factPart = buildFactPart(caseRow.ref_fact);
  const issuePart = buildIssuePart(caseRow.ref_issue);
  const summary = [factPart, issuePart].filter(Boolean).join(" ").trim();
  return summary || stripInternalSentences(caseRow.summary);
}

const cases = JSON.parse(readFileSync(CASES_PATH, "utf8"));

let rewritten = 0;
const seen = new Map();

for (const caseRow of cases) {
  const next = buildSummary(caseRow);
  if (next && next !== caseRow.summary) {
    caseRow.summary = next;
    rewritten += 1;
  }
  // 其余长文本字段仅做内部指令句清除
  for (const field of ["ref_fact", "ref_issue", "ref_legal"]) {
    const cleaned = stripInternalSentences(caseRow[field]);
    if (cleaned && cleaned !== compact(caseRow[field])) {
      caseRow[field] = cleaned;
    }
  }
  seen.set(caseRow.summary, (seen.get(caseRow.summary) || 0) + 1);
}

const duplicates = [...seen.values()].filter((count) => count > 1).length;
const lengths = cases.map((caseRow) => caseRow.summary.length).sort((a, b) => a - b);
const leaked = cases.filter((caseRow) =>
  INTERNAL_SENTENCE_PATTERNS.some((pattern) => pattern.test(caseRow.summary))
).length;

console.log("=== 摘要重写统计 ===");
console.log(`案例总数：${cases.length}`);
console.log(`重写摘要：${rewritten}`);
console.log(`重复摘要组：${duplicates}`);
console.log(`残留内部指令句：${leaked}`);
console.log(`摘要长度 min/med/max：${lengths[0]}/${lengths[Math.floor(lengths.length / 2)]}/${lengths[lengths.length - 1]}`);
console.log("\n样例：");
for (const caseRow of cases.slice(0, 3)) {
  console.log(`- [${caseRow.case_id}] ${caseRow.summary}`);
}

if (duplicates > 0 || leaked > 0) {
  console.error("\n✗ 校验未通过（存在重复摘要或内部指令句），未写入。");
  process.exit(1);
}

if (dryRun) {
  console.log("\n(dry-run 模式，未写入文件)");
} else {
  writeFileSync(CASES_PATH, JSON.stringify(cases, null, 2) + "\n", "utf8");
  console.log(`\n✓ 已写入 ${CASES_PATH}`);
}
