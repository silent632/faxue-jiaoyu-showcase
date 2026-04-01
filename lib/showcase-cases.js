import fs from "node:fs/promises";

const SOURCE_CASES_JSON = "/Users/silent/Projects/faxue-jiaoyu/data/generated/cases-extracted.json";

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

async function readSourceCaseRows() {
  const raw = await fs.readFile(SOURCE_CASES_JSON, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

export async function loadShowcaseCases() {
  if (cachedRows) return cachedRows;
  if (cachedRowsPromise) return cachedRowsPromise;

  cachedRowsPromise = (async () => {
    const rows = await readSourceCaseRows();
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

export async function getShowcaseCaseStaticParams(limit = 24) {
  const rows = await loadShowcaseCases();
  return rows.slice(0, limit).map((item) => ({ id: item.id }));
}
