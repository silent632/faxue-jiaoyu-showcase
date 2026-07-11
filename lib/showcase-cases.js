import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CASES_JSON_RELATIVE_PATH = path.join("data", "generated", "cases-extracted.json");
// 数据源自包含于仓库内；如需覆盖，使用 SHOWCASE_CASES_JSON_PATH / SHOWCASE_SOURCE_ROOT 环境变量
const DEFAULT_SOURCE_JSON_CANDIDATES = [
  path.join(REPO_ROOT, CASES_JSON_RELATIVE_PATH),
  path.join(REPO_ROOT, "public/generated/cases-extracted.json"),
];

let cachedRows = null;
let cachedRowsPromise = null;

function uniquePaths(values = []) {
  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))];
}

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
    jurisprudenceTags: Array.isArray(row?.jurisprudence_tags) ? row.jurisprudence_tags : [],
  };
}

async function readRowsFromJsonFile(filePath) {
  const raw = await fsPromises.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function readRowsFromJsonFileSync(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export function resolveShowcaseCasesJsonPath({ sourceRoot, jsonPath, env = process.env, cwd = REPO_ROOT } = {}) {
  const dynamicCandidates = [
    jsonPath,
    env.SHOWCASE_CASES_JSON_PATH,
    sourceRoot ? path.join(sourceRoot, CASES_JSON_RELATIVE_PATH) : "",
    env.SHOWCASE_SOURCE_ROOT ? path.join(env.SHOWCASE_SOURCE_ROOT, CASES_JSON_RELATIVE_PATH) : "",
    path.join(cwd, CASES_JSON_RELATIVE_PATH),
    path.join(cwd, "public/generated/cases-extracted.json"),
  ];

  const candidates = uniquePaths([...dynamicCandidates, ...DEFAULT_SOURCE_JSON_CANDIDATES]).map((item) => path.resolve(item));

  return candidates.find((item) => fs.existsSync(item)) || candidates[0] || path.join(cwd, CASES_JSON_RELATIVE_PATH);
}

export async function readShowcaseCaseSourceRows({
  sourceRoot,
  jsonPath = resolveShowcaseCasesJsonPath({ sourceRoot }),
} = {}) {
  const resolvedJsonPath = resolveShowcaseCasesJsonPath({ sourceRoot, jsonPath });

  try {
    return await readRowsFromJsonFile(resolvedJsonPath);
  } catch (_error) {
    return [];
  }
}

function parseJudgmentDate(value) {
  const time = Date.parse(String(value || "").trim());
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

export function selectCanonicalDemoCaseId(rows = []) {
  const candidates = Array.isArray(rows) ? rows.map(normalizeSourceCase).filter((item) => item?.id && item?.title) : [];
  if (!candidates.length) return "";

  return [...candidates]
    .sort((a, b) => {
      const dateA = parseJudgmentDate(a.judgmentDate);
      const dateB = parseJudgmentDate(b.judgmentDate);
      if (dateA !== dateB) return dateA - dateB;
      return String(a.id).localeCompare(String(b.id), "en");
    })[0].id;
}

export function getShowcaseCanonicalDemoCaseId() {
  const rows = readRowsFromJsonFileSync(resolveShowcaseCasesJsonPath());
  return selectCanonicalDemoCaseId(rows);
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

export function getShowcaseCanonicalStudyHref() {
  const canonicalId = getShowcaseCanonicalDemoCaseId();
  return canonicalId ? `/cases/${canonicalId}/study` : "/cases";
}

export async function getShowcaseCaseStaticParams(limit) {
  const rows = await loadShowcaseCases();
  const normalizedLimit = Number(limit);
  const sourceRows = Number.isInteger(normalizedLimit) && normalizedLimit > 0
    ? rows.slice(0, normalizedLimit)
    : rows;

  return sourceRows.map((item) => ({ id: item.id }));
}
