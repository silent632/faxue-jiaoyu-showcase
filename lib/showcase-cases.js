import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_SOURCE_ROOT = "/Users/silent/Projects/faxue-jiaoyu";
const SOURCE_CASES_JSON = process.env.SHOWCASE_CASES_JSON_PATH || path.join(process.env.SHOWCASE_SOURCE_ROOT || DEFAULT_SOURCE_ROOT, "data/generated/cases-extracted.json");

const STUDY_DEMO_STEPS = [
  {
    id: "reading",
    label: "原文阅读",
    title: "先通读，再定位关键事实",
    prompt: "先从摘要、案号、法院和裁判结果建立阅读预期，再进入原文或研习页。",
    refField: "summary",
  },
  {
    id: "fact",
    label: "事实梳理",
    title: "提炼人物、行为和时间线",
    prompt: "抓取当事人、关键行为、时间节点和结果，再判断哪些事实对裁判最关键。",
    refField: "refFact",
  },
  {
    id: "issue",
    label: "争议焦点",
    title: "围绕争点组织讨论",
    prompt: "把双方主张、反驳和证据链放在一起，找出真正决定裁判方向的问题。",
    refField: "refIssue",
  },
  {
    id: "analysis",
    label: "法理分析",
    title: "把规范、事实与结论串起来",
    prompt: "以法条前提、事实涵摄和裁判结论的顺序完成结构化表达。",
    refField: "refLegal",
  },
];

let cachedRows = null;
let cachedRowsPromise = null;

function parseLaws(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((item) => ({
        law: String(item?.law || "").trim(),
        article: String(item?.article || "").trim(),
        displayLaw: String(item?.displayLaw || "").trim(),
      }))
      .filter((item) => item.law || item.article || item.displayLaw);
  }

  if (typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parseLaws(parsed);
  } catch (_error) {
    return [];
  }
}

function normalizeSourceCase(row) {
  const causeL1 = String(row?.cause_l1 || row?.causeL1 || "").trim();
  const causeL2 = String(row?.cause_l2 || row?.causeL2 || "").trim();
  const causeL3 = String(row?.cause_l3 || row?.causeL3 || "").trim();
  const laws = parseLaws(row?.laws_json ?? row?.laws);

  return {
    id: String(row?.case_id || row?.id || "").trim(),
    title: String(row?.title || "").trim(),
    caseNumber: String(row?.case_number || row?.caseNumber || "").trim(),
    causeL1,
    causeL2,
    causeL3,
    causePath: [causeL1, causeL2, causeL3].filter(Boolean).join(" / "),
    causeFocus: causeL3 || causeL2 || causeL1,
    courtName: String(row?.court_name || row?.courtName || "").trim(),
    courtLevel: String(row?.court_level || row?.courtLevel || "").trim(),
    judgmentDate: String(row?.judgment_date || row?.judgmentDate || "").trim(),
    docType: String(row?.doc_type || row?.docType || "").trim(),
    procedure: String(row?.procedure || "").trim(),
    province: String(row?.province || "").trim(),
    result: String(row?.result || "").trim(),
    resultText: String(row?.resultText || row?.result_text || "").trim(),
    summary: String(row?.summary || "").trim(),
    pdfFile: String(row?.pdf_file || row?.pdfFile || "").trim(),
    wordFile: String(row?.word_file || row?.wordFile || "").trim(),
    refFact: String(row?.ref_fact || row?.refFact || "").trim(),
    refIssue: String(row?.ref_issue || row?.refIssue || "").trim(),
    refLegal: String(row?.ref_legal || row?.refLegal || "").trim(),
    laws,
  };
}

async function readRowsFromJsonFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export async function readShowcaseCaseSourceRows({
  sourceRoot = process.env.SHOWCASE_SOURCE_ROOT || DEFAULT_SOURCE_ROOT,
  jsonPath = process.env.SHOWCASE_CASES_JSON_PATH || path.join(sourceRoot, "data/generated/cases-extracted.json"),
} = {}) {
  try {
    return await readRowsFromJsonFile(jsonPath);
  } catch (_error) {
    return [];
  }
}

export async function loadShowcaseCases() {
  if (cachedRows) return cachedRows;
  if (cachedRowsPromise) return cachedRowsPromise;

  cachedRowsPromise = (async () => {
    const rows = await readShowcaseCaseSourceRows();
    const normalizedRows = rows.map((row) => normalizeSourceCase(row)).filter((item) => item?.id && item?.title);
    cachedRows = normalizedRows;
    return normalizedRows;
  })();

  try {
    return await cachedRowsPromise;
  } finally {
    cachedRowsPromise = null;
  }
}

export async function getShowcaseCaseById(id) {
  if (!id) return null;

  const rows = await loadShowcaseCases();
  return rows.find((item) => item.id === id) || null;
}

export async function getShowcaseCaseStudyById(id) {
  const caseItem = await getShowcaseCaseById(id);
  if (!caseItem) return null;

  return {
    ...caseItem,
    studySteps: STUDY_DEMO_STEPS.map((step) => ({
      ...step,
      content: String(caseItem?.[step.refField] || "").trim(),
    })),
  };
}

export async function getShowcaseCaseStaticParams(limit = 24) {
  const rows = await loadShowcaseCases();
  return rows.slice(0, limit).map((item) => ({ id: item.id }));
}
