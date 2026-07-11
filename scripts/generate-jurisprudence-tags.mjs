#!/usr/bin/env node

/**
 * 为 210 篇案例生成法理知识点标签（双索引第二套）。
 *
 * 用法：
 *   node scripts/generate-jurisprudence-tags.mjs              # 仅规则检测
 *   node scripts/generate-jurisprudence-tags.mjs --dry-run     # 预览不写入
 *   node scripts/generate-jurisprudence-tags.mjs --stats       # 只输出统计
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CASES_PATH = path.join(ROOT, "data", "generated", "cases-extracted.json");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "cases-extracted.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const statsOnly = args.includes("--stats");

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

function parseLaws(lawsJson) {
  try {
    return JSON.parse(lawsJson || "[]");
  } catch {
    return [];
  }
}

function uniqueLawNames(laws) {
  return [...new Set(laws.map((l) => l.law))];
}

function classifyDomain(lawName) {
  if (/刑法|刑事|犯罪|减刑|假释|死刑/.test(lawName)) return "criminal";
  if (/民法|民事|合同|侵权|婚姻|继承|物权|担保|劳动|消费|食品|产品|房屋|租赁|保险|公司|破产|商标|专利|著作权|知识产权/.test(lawName)) return "civil";
  if (/行政|治安|政府|规划|环境|土地|拆迁|城乡|许可|处罚|复议|监察|国家赔偿/.test(lawName)) return "admin";
  return "other";
}

function isJudicialInterpretation(lawName) {
  return /最高|解释|规定|意见|批复|纪要/.test(lawName);
}

function fullText(c) {
  return [c.ref_fact, c.ref_issue, c.ref_legal, c.summary].filter(Boolean).join("\n");
}

// ---------------------------------------------------------------------------
// 规则检测器（每个函数返回 true/false）
// ---------------------------------------------------------------------------

const ruleDetectors = {
  // 推理结构完整且规范数量适中——适合从头搭建三段论的案例
  "syllogism-clear"(c) {
    const lawCount = uniqueLawNames(parseLaws(c.laws_json)).length;
    const legal = c.ref_legal || "";
    return legal.length >= 310 && lawCount >= 2 && lawCount <= 3 && /大前提|小前提/.test(legal);
  },

  "multi-norm-reasoning"(c) {
    return uniqueLawNames(parseLaws(c.laws_json)).length >= 5;
  },

  // 争点必须是结构化多点争议（列举式），而非仅有一段争点描述
  "clear-dispute"(c) {
    const t = c.ref_issue || "";
    const enumerated = /其一|其二|第一|第二|首先|其次/u.test(t);
    const multiClause = (t.match(/；/gu) || []).length >= 2;
    return enumerated && multiClause;
  },

  "appellate-reversal"(c) {
    if (c.procedure !== "二审") return false;
    return /撤销|改判/.test(c.result || "");
  },

  "burden-of-proof"(c) {
    const t = fullText(c);
    return /举证责任|证明责任|谁主张/.test(t);
  },

  // 规范竞合需要文本中有竞合/请求权基础信号，而非单纯法条数量
  "norm-competition"(c) {
    const t = fullText(c);
    if (/竞合|请求权基础|择一|规范冲突|法条选择/u.test(t)) return true;
    const laws = parseLaws(c.laws_json);
    const substantive = uniqueLawNames(laws).filter((n) => !isJudicialInterpretation(n));
    return substantive.length >= 4;
  },

  "cross-domain"(c) {
    const laws = parseLaws(c.laws_json);
    const domains = new Set(uniqueLawNames(laws).map(classifyDomain));
    domains.delete("other");
    return domains.size >= 2;
  },

  // 需要不止一部司法解释，或司法解释在争议中被明确讨论
  "judicial-interpretation"(c) {
    const laws = parseLaws(c.laws_json);
    const interpretations = uniqueLawNames(laws).filter(isJudicialInterpretation);
    if (interpretations.length >= 2) return true;
    return interpretations.length === 1 && /解释|批复|纪要/u.test(c.ref_issue || "");
  },

  // 概念边界之争需要多个界定信号——单次“是否构成”几乎人人都有
  "concept-boundary"(c) {
    const t = fullText(c);
    const matches = t.match(/是否属于|是否构成|如何认定|应否认定|能否认定|界定|边界/gu) || [];
    return matches.length >= 2;
  },

  "guiding-case"(c) {
    const laws = parseLaws(c.laws_json);
    return uniqueLawNames(laws).some((n) => /案例指导|类案检索/.test(n));
  },

  "value-tension"(c) {
    const t = fullText(c);
    const hasValueWord = /利益|权益|价值|公平|正义/.test(t);
    const hasConflictSignal = /冲突|平衡|衡量|优先|让步|牺牲|对立|矛盾|兼顾/.test(t)
      || /过错.*责任|责任.*分担|比例/.test(t);
    if (hasValueWord && hasConflictSignal) return true;
    if (/利益衡量|利益平衡|价值冲突|价值判断|价值选择|比例原则/.test(t)) return true;
    return false;
  },

  "principle-clause"(c) {
    const t = fullText(c);
    if (/诚实信用|公序良俗|公平原则|权利不得滥用|禁止权利滥用|信赖利益/.test(t)) return true;
    if (/基本原则|法律原则|一般条款|帝王条款/.test(t)) return true;
    return false;
  },

  "public-interest"(c) {
    const t = fullText(c);
    return /公共利益|社会利益|国家利益|社会公共/.test(t);
  },

  "reasoning-rich"(c) {
    return (c.ref_legal || "").length > 335;
  },

  "reasoning-contested"(c) {
    if (c.procedure === "再审" && /撤销|改判/.test(c.result || "")) return true;
    if (c.procedure === "二审" && /撤销|改判/.test(c.result || "")) return true;
    return false;
  },

  "discretion-explicit"(c) {
    const t = fullText(c);
    return /自由裁量|裁量|酌定|酌情/.test(t);
  },
};

// ---------------------------------------------------------------------------
// 执行
// ---------------------------------------------------------------------------

const cases = JSON.parse(readFileSync(CASES_PATH, "utf8"));
const tagStats = {};
const tagIds = Object.keys(ruleDetectors);
tagIds.forEach((id) => { tagStats[id] = 0; });

for (const c of cases) {
  const tags = [];
  for (const tagId of tagIds) {
    if (ruleDetectors[tagId](c)) {
      tags.push(tagId);
      tagStats[tagId]++;
    }
  }
  c.jurisprudence_tags = tags;
}

// ---------------------------------------------------------------------------
// 统计输出
// ---------------------------------------------------------------------------

console.log("=== 法理知识点标签生成统计 ===\n");
console.log(`案例总数：${cases.length}`);
console.log("");

const groupNames = {
  reasoning: "A 组 · 推理结构",
  argumentation: "B 组 · 争点论证",
  "norm-retrieval": "C 组 · 规范检索",
  interpretation: "D 组 · 解释方法",
  "value-balancing": "E 组 · 价值衡量",
  annotation: "F 组 · 说理质量",
};

const tagGroups = {
  "syllogism-clear": "reasoning",
  "multi-norm-reasoning": "reasoning",
  "clear-dispute": "argumentation",
  "appellate-reversal": "argumentation",
  "burden-of-proof": "argumentation",
  "norm-competition": "norm-retrieval",
  "cross-domain": "norm-retrieval",
  "judicial-interpretation": "norm-retrieval",
  "concept-boundary": "interpretation",
  "guiding-case": "interpretation",
  "value-tension": "value-balancing",
  "principle-clause": "value-balancing",
  "public-interest": "value-balancing",
  "reasoning-rich": "annotation",
  "reasoning-contested": "annotation",
  "discretion-explicit": "annotation",
};

const tagLabels = {
  "syllogism-clear": "三段论结构清晰",
  "multi-norm-reasoning": "多法条协同推理",
  "clear-dispute": "争点明确",
  "appellate-reversal": "二审改判",
  "burden-of-proof": "举证责任争议",
  "norm-competition": "规范竞合",
  "cross-domain": "跨部门法交叉",
  "judicial-interpretation": "司法解释援引",
  "concept-boundary": "概念边界争议",
  "guiding-case": "指导性案例参照",
  "value-tension": "价值冲突显现",
  "principle-clause": "原则条款援引",
  "public-interest": "公共利益考量",
  "reasoning-rich": "说理充分",
  "reasoning-contested": "说理存疑",
  "discretion-explicit": "自由裁量显现",
};

let currentGroup = "";
for (const tagId of tagIds) {
  const group = tagGroups[tagId];
  if (group !== currentGroup) {
    currentGroup = group;
    console.log(`\n${groupNames[group]}`);
  }
  const count = tagStats[tagId];
  const pct = ((count / cases.length) * 100).toFixed(1);
  const bar = "█".repeat(Math.round(count / cases.length * 30));
  console.log(`  ${tagLabels[tagId].padEnd(12)} ${String(count).padStart(4)} 篇 (${pct.padStart(5)}%) ${bar}`);
}

// 每案例标签数分布
const tagCounts = cases.map((c) => c.jurisprudence_tags.length);
const minTags = Math.min(...tagCounts);
const maxTags = Math.max(...tagCounts);
const avgTags = (tagCounts.reduce((a, b) => a + b, 0) / tagCounts.length).toFixed(1);
const zeroCases = tagCounts.filter((n) => n === 0).length;

console.log(`\n=== 覆盖质量 ===`);
console.log(`每案例标签数：最少 ${minTags}，最多 ${maxTags}，平均 ${avgTags}`);
console.log(`零标签案例数：${zeroCases}`);

// 每模块可用案例数
const moduleTagMap = {
  "模块一 · 推理构建": ["syllogism-clear", "multi-norm-reasoning"],
  "模块二 · 争点论证": ["clear-dispute", "appellate-reversal", "burden-of-proof"],
  "模块三 · 规范检索": ["norm-competition", "cross-domain", "judicial-interpretation"],
  "模块四 · 解释对比": ["concept-boundary", "guiding-case"],
  "模块五 · 价值衡量": ["value-tension", "principle-clause", "public-interest"],
  "模块六 · 文书批注": ["reasoning-rich", "reasoning-contested", "discretion-explicit"],
};

console.log(`\n=== 各模块可用案例数 ===`);
for (const [mod, modTags] of Object.entries(moduleTagMap)) {
  const eligible = cases.filter((c) =>
    c.jurisprudence_tags.some((t) => modTags.includes(t))
  ).length;
  console.log(`  ${mod}：${eligible} 篇`);
}

// ---------------------------------------------------------------------------
// 写入
// ---------------------------------------------------------------------------

if (!statsOnly && !dryRun) {
  writeFileSync(OUTPUT_PATH, JSON.stringify(cases, null, 2) + "\n", "utf8");
  console.log(`\n✓ 已写入 ${OUTPUT_PATH}`);
} else if (dryRun) {
  console.log(`\n(dry-run 模式，未写入文件)`);
} else {
  console.log(`\n(stats 模式，未写入文件)`);
}
