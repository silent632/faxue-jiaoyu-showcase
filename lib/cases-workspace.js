export const PAGE_SIZE = 20;

export const SORT_OPTIONS = [
  { value: "date-desc", label: "日期 新→旧" },
  { value: "date-asc", label: "日期 旧→新" },
  { value: "relevance", label: "相关度" },
];

const COURT_LEVEL_ORDER = ["最高", "高级", "中级", "基层", "专门"];
const DOC_TYPE_ORDER = ["判决书", "裁定书", "调解书", "决定书", "通知书"];
const PROCEDURE_ORDER = ["一审", "二审", "再审", "执行"];
const MULTI_VALUE_FIELDS = ["courtLevel", "docType", "procedure", "province", "result", "lawName", "lawArticle"];

function asArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatLawNameForDisplay(value) {
  return String(value || "").trim().replace(/中华人民共和国/gu, "").replace(/最高人民法院/gu, "最高法");
}

function normalizeCase(item) {
  const laws = Array.isArray(item?.laws)
    ? item.laws
        .map((law) => ({
          law: String(law?.law || "").trim(),
          article: String(law?.article || "").trim(),
          displayLaw: formatLawNameForDisplay(law?.displayLaw || law?.law || ""),
        }))
        .filter((law) => law.law || law.article)
    : [];

  return {
    id: String(item?.id || "").trim(),
    title: String(item?.title || "").trim(),
    caseNumber: String(item?.caseNumber || "").trim(),
    causeL1: String(item?.causeL1 || "").trim(),
    causeL2: String(item?.causeL2 || "").trim(),
    causeL3: String(item?.causeL3 || "").trim(),
    causePath: String(item?.causePath || "").trim(),
    causeFocus: String(item?.causeFocus || item?.causeL3 || item?.causeL2 || item?.causeL1 || "").trim(),
    courtLevel: String(item?.courtLevel || "").trim(),
    courtName: String(item?.courtName || "").trim(),
    judgmentDate: String(item?.judgmentDate || "").trim(),
    docType: String(item?.docType || "").trim(),
    procedure: String(item?.procedure || "").trim(),
    province: String(item?.province || "").trim(),
    result: String(item?.result || "").trim(),
    resultText: String(item?.resultText || "").trim(),
    summary: String(item?.summary || "").trim(),
    laws,
  };
}

export function normalizeCaseRows(cases = []) {
  return cases.map(normalizeCase).filter((item) => item.id && item.title);
}

export function normalizeInitialCaseFilters(initialFilters = {}) {
  return {
    keyword: String(initialFilters.keyword || initialFilters.q || "").trim(),
    causeL1: String(initialFilters.causeL1 || "").trim(),
    causeL2: String(initialFilters.causeL2 || "").trim(),
    causeL3: String(initialFilters.causeL3 || "").trim(),
    courtLevel: asArray(initialFilters.courtLevel),
    year: String(initialFilters.year || "").trim(),
    docType: asArray(initialFilters.docType),
    procedure: asArray(initialFilters.procedure),
    province: asArray(initialFilters.province),
    result: asArray(initialFilters.result),
    lawName: asArray(initialFilters.lawName).map((item) => formatLawNameForDisplay(item)).filter(Boolean),
    lawArticle: asArray(initialFilters.lawArticle),
  };
}

export function resolveSortMode(initialSort) {
  return SORT_OPTIONS.some((item) => item.value === initialSort) ? initialSort : "date-desc";
}

export function resolvePageNumber(initialPage) {
  const next = Number(initialPage);
  return Number.isFinite(next) && next > 0 ? next : 1;
}

function countOptions(values, { order = [], sortBy = "alpha" } = {}) {
  const counts = new Map();
  for (const value of values) {
    const next = String(value || "").trim();
    if (!next) continue;
    counts.set(next, (counts.get(next) || 0) + 1);
  }

  const rank = new Map(order.map((value, index) => [value, index]));
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => {
      const rankA = rank.has(a.value) ? rank.get(a.value) : Number.MAX_SAFE_INTEGER;
      const rankB = rank.has(b.value) ? rank.get(b.value) : Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      if (sortBy === "count" && b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value, "zh-CN");
    });
}

function keywordScore(item, keyword) {
  const lowerKeyword = String(keyword || "").toLowerCase();
  if (!lowerKeyword) return 0;
  const title = item.title.toLowerCase();
  const cause = item.causePath.toLowerCase();
  const court = item.courtName.toLowerCase();
  const summary = item.summary.toLowerCase();
  let score = 0;
  if (title.includes(lowerKeyword)) score += 5;
  if (cause.includes(lowerKeyword)) score += 3;
  if (court.includes(lowerKeyword)) score += 2;
  if (summary.includes(lowerKeyword)) score += 1;
  return score;
}

function compareSuggestionCount(a, b) {
  const aWithinPage = a.count <= PAGE_SIZE;
  const bWithinPage = b.count <= PAGE_SIZE;
  if (aWithinPage !== bWithinPage) return aWithinPage ? -1 : 1;
  if (aWithinPage && bWithinPage && b.count !== a.count) return b.count - a.count;
  if (!aWithinPage && !bWithinPage && a.count !== b.count) return a.count - b.count;
  return a.label.localeCompare(b.label, "zh-CN");
}

export function buildFilterOptions(rows, filters) {
  const causeL1 = countOptions(rows.map((item) => item.causeL1), { sortBy: "count" }).map((item) => item.value);
  const causeL2 = countOptions(rows.filter((item) => !filters.causeL1 || item.causeL1 === filters.causeL1).map((item) => item.causeL2), { sortBy: "count" }).map((item) => item.value);
  const causeL3 = countOptions(
    rows.filter((item) => (!filters.causeL1 || item.causeL1 === filters.causeL1) && (!filters.causeL2 || item.causeL2 === filters.causeL2)).map((item) => item.causeL3),
    { sortBy: "count" }
  ).map((item) => item.value);

  const year = countOptions(rows.map((item) => item.judgmentDate.slice(0, 4)).filter((value) => /^\d{4}$/.test(value)), { sortBy: "count" })
    .map((item) => item.value)
    .sort((a, b) => Number(b) - Number(a));

  return {
    causeL1,
    causeL2,
    causeL3,
    year,
    courtLevel: countOptions(rows.map((item) => item.courtLevel), { order: COURT_LEVEL_ORDER }),
    docType: countOptions(rows.map((item) => item.docType), { order: DOC_TYPE_ORDER }),
    procedure: countOptions(rows.map((item) => item.procedure), { order: PROCEDURE_ORDER }),
    province: countOptions(rows.map((item) => item.province), { sortBy: "count" }),
    result: countOptions(rows.map((item) => item.result), { sortBy: "count" }),
    lawName: countOptions(rows.flatMap((item) => item.laws.map((law) => law.displayLaw || law.law)), { sortBy: "count" }).map((item) => ({
      ...item,
      label: item.value,
      fullLabel: item.value,
    })),
    lawArticle: countOptions(
      rows
        .flatMap((item) => item.laws)
        .filter((law) => !filters.lawName.length || filters.lawName.includes(law.displayLaw || law.law))
        .map((law) => law.article),
      { sortBy: "count" }
    ),
  };
}

function matchCase(item, filters) {
  if (filters.causeL1 && item.causeL1 !== filters.causeL1) return false;
  if (filters.causeL2 && item.causeL2 !== filters.causeL2) return false;
  if (filters.causeL3 && item.causeL3 !== filters.causeL3) return false;
  if (filters.courtLevel.length && !filters.courtLevel.includes(item.courtLevel)) return false;
  if (filters.year && !item.judgmentDate.startsWith(filters.year)) return false;
  if (filters.docType.length && !filters.docType.includes(item.docType)) return false;
  if (filters.procedure.length && !filters.procedure.includes(item.procedure)) return false;
  if (filters.province.length && !filters.province.includes(item.province)) return false;
  if (filters.result.length && !filters.result.includes(item.result)) return false;
  if (filters.lawName.length && !item.laws.some((law) => filters.lawName.includes(law.displayLaw || law.law))) return false;
  if (filters.lawArticle.length && !item.laws.some((law) => filters.lawArticle.includes(law.article))) return false;
  if (filters.keyword) {
    const source = `${item.caseNumber}${item.title}${item.summary}${item.courtName}${item.causePath}`.toLowerCase();
    if (!source.includes(filters.keyword.toLowerCase())) return false;
  }
  return true;
}

export function getFilteredRows(rows, filters, sortMode) {
  const list = rows.filter((item) => matchCase(item, filters));
  if (sortMode === "date-asc") return [...list].sort((a, b) => a.judgmentDate.localeCompare(b.judgmentDate));
  if (sortMode === "relevance" && filters.keyword) return [...list].sort((a, b) => keywordScore(b, filters.keyword) - keywordScore(a, filters.keyword));
  return [...list].sort((a, b) => b.judgmentDate.localeCompare(a.judgmentDate));
}

export function getKeywordSuggestions(rows, keywordInput) {
  const keyword = String(keywordInput || "").trim().toLowerCase();
  if (!keyword) return [];
  return rows.filter((item) => `${item.title}${item.caseNumber}${item.courtName}`.toLowerCase().includes(keyword)).slice(0, 5);
}

export function buildCasesQueryString({ filters, sortMode, currentPage }) {
  const params = new URLSearchParams();
  if (filters.keyword) params.set("q", filters.keyword);
  if (filters.causeL1) params.set("causeL1", filters.causeL1);
  if (filters.causeL2) params.set("causeL2", filters.causeL2);
  if (filters.causeL3) params.set("causeL3", filters.causeL3);
  if (filters.courtLevel.length) params.set("courtLevel", filters.courtLevel.join(","));
  if (filters.year) params.set("year", filters.year);
  if (filters.docType.length) params.set("docType", filters.docType.join(","));
  if (filters.procedure.length) params.set("procedure", filters.procedure.join(","));
  if (filters.province.length) params.set("province", filters.province.join(","));
  if (filters.result.length) params.set("result", filters.result.join(","));
  if (filters.lawName.length) params.set("lawName", filters.lawName.join(","));
  if (filters.lawArticle.length) params.set("lawArticle", filters.lawArticle.join(","));
  if (sortMode !== "date-desc") params.set("sort", sortMode);
  if (currentPage > 1) params.set("page", String(currentPage));
  return params.toString();
}

function getFilterValueLabel(field, value) {
  return field === "lawName" ? formatLawNameForDisplay(value) : value;
}

export function buildActiveFilterDescriptors(filters) {
  const chips = [];
  if (filters.keyword) chips.push({ key: `keyword:${filters.keyword}`, field: "keyword", value: "", label: `关键词：${filters.keyword}` });
  if (filters.causeL1) chips.push({ key: `causeL1:${filters.causeL1}`, field: "causeL1", value: "", label: `案件类型：${filters.causeL1}` });
  if (filters.causeL2) chips.push({ key: `causeL2:${filters.causeL2}`, field: "causeL2", value: "", label: `案由门类：${filters.causeL2}` });
  if (filters.causeL3) chips.push({ key: `causeL3:${filters.causeL3}`, field: "causeL3", value: "", label: `具体案由：${filters.causeL3}` });
  if (filters.year) chips.push({ key: `year:${filters.year}`, field: "year", value: "", label: `年份：${filters.year}` });

  for (const field of MULTI_VALUE_FIELDS) {
    for (const value of filters[field]) {
      chips.push({ key: `${field}:${value}`, field, value, label: getFilterValueLabel(field, value) });
    }
  }
  return chips;
}

function uniqueActions(actions) {
  return actions.filter((item, index, list) => list.findIndex((next) => next.key === item.key) === index);
}

export function buildStarterActions({ filtered, rows, filters }) {
  const scopeRows = filtered.length ? filtered : rows;
  const actions = [];
  const pushCandidates = (field, values, formatter = (value) => value) => {
    for (const item of countOptions(values, { sortBy: "count" }).slice(0, 3)) {
      const label = formatter(item.value);
      if (!label) continue;
      actions.push({ key: `${field}:${item.value}`, field, value: item.value, label, helper: `${item.count} 条` });
    }
  };

  if (!filters.year) {
    pushCandidates(scopeRows.map((item) => item.judgmentDate.slice(0, 4)).filter((value) => /^\d{4}$/.test(value)), "year");
  }
  if (!filters.causeL1) pushCandidates("causeL1", scopeRows.map((item) => item.causeL1));
  if (!filters.courtLevel.length) pushCandidates("courtLevel", scopeRows.map((item) => item.courtLevel));

  return uniqueActions(actions).slice(0, 8);
}

export function buildNarrowingSuggestions({ filtered, filters }) {
  if (filtered.length <= PAGE_SIZE) return [];
  const suggestions = [];
  const pushCandidates = (field, fieldLabel, values, formatter = (value) => value) => {
    const counted = countOptions(values, { sortBy: "count" });
    for (const item of counted) {
      const label = formatter(item.value);
      if (!label || item.count >= filtered.length) continue;
      suggestions.push({ key: `${field}:${item.value}`, field, fieldLabel, value: item.value, label, count: item.count });
    }
  };

  if (!filters.year) pushCandidates("year", "年份", filtered.map((item) => item.judgmentDate.slice(0, 4)).filter((value) => /^\d{4}$/.test(value)), (value) => `${value}年`);
  if (!filters.causeL1) pushCandidates("causeL1", "案件类型", filtered.map((item) => item.causeL1));
  else if (!filters.causeL2) pushCandidates("causeL2", "案由门类", filtered.map((item) => item.causeL2));
  else if (!filters.causeL3) pushCandidates("causeL3", "具体案由", filtered.map((item) => item.causeL3));
  if (!filters.courtLevel.length) pushCandidates("courtLevel", "法院层级", filtered.map((item) => item.courtLevel));
  if (!filters.docType.length) pushCandidates("docType", "文书类型", filtered.map((item) => item.docType));
  if (!filters.procedure.length) pushCandidates("procedure", "审理程序", filtered.map((item) => item.procedure));
  if (!filters.province.length) pushCandidates("province", "省份", filtered.map((item) => item.province));
  if (!filters.result.length) pushCandidates("result", "裁判结果", filtered.map((item) => item.result));

  if (!filters.lawName.length) {
    pushCandidates(
      "lawName",
      "法律名称",
      filtered.flatMap((item) => item.laws.map((law) => law.displayLaw || law.law)),
      (value) => formatLawNameForDisplay(value)
    );
  }

  return uniqueActions(suggestions).sort(compareSuggestionCount).slice(0, 6);
}
