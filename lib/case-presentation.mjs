function compactText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u3000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstSentence(value) {
  const text = compactText(value);
  if (!text) return "";

  const sentence = text.match(/[^。！？；!?;]+[。！？；!?;]?/u);
  return sentence ? sentence[0].trim() : text;
}

function isInternalSummarySentence(value) {
  return /详情页仅保留|页面保留|公开展示模式|课堂提问|结合 PDF 原文阅读|结合PDF原文阅读/u.test(value);
}

export function sanitizeSummaryForReading(value) {
  const text = compactText(value);
  if (!text) return "";

  const sentences = text.match(/[^。！？；!?;]+[。！？；!?;]?/gu) || [text];
  const cleaned = sentences.map((item) => item.trim()).filter(Boolean).filter((item) => !isInternalSummarySentence(item));
  return cleaned.join(" ").trim();
}

export function formatLawNameForDisplay(value) {
  return String(value || "").replace(/[（(].*?[)）]/g, "").trim();
}

export function buildOutcomeHeadline(caseItem = {}) {
  const resultText = compactText(caseItem.resultText);
  if (resultText) {
    return firstSentence(resultText);
  }

  const result = compactText(caseItem.result);
  if (result) return result;

  return firstSentence(sanitizeSummaryForReading(caseItem.summary));
}

export function buildCoreDispute(caseItem = {}) {
  const causeFocus = compactText(caseItem.causeFocus);
  if (causeFocus) return causeFocus;

  const causePath = compactText(caseItem.causePath);
  if (causePath) {
    const segments = causePath.split("/").map((item) => item.trim()).filter(Boolean);
    if (segments.length) return segments[segments.length - 1];
  }

  return compactText(caseItem.title);
}

export function buildCaseReadingJudgment(caseItem = {}) {
  const dispute = buildCoreDispute(caseItem);
  const outcome = buildOutcomeHeadline(caseItem);
  const cleanSummary = sanitizeSummaryForReading(caseItem.summary);
  const whyReadFallback = firstSentence(cleanSummary);

  return {
    about: dispute ? `本案围绕“${dispute}”展开，进入全文前可先据此判断案件的核心争议。`
      : "先判断案件争议的核心问题，再决定是否继续进入全文。",
    whyRead: outcome
      ? "先看这句裁判结论如何回应上面的争议，再决定是否投入时间精读原文的论证过程。"
      : whyReadFallback
        ? `摘要中的裁判理由线索是：${whyReadFallback}可据此判断继续阅读的价值。`
        : "先看导读中的裁判理由线索，再决定是否继续投入时间阅读原文。",
    shouldContinue: "如果你想继续梳理事实、争议焦点与法理分析，就进入案例研习继续推进。",
  };
}

export function buildPrimaryContinuation(caseItem = {}) {
  return {
    href: `/cases/${caseItem.id}/study`,
    label: "进入案例研习",
    description: "先完成导读判断，再进入事实梳理、争议焦点与法理分析。",
  };
}

export function buildMissingPdfNote({ hasPdf = false, hasWord = false } = {}) {
  if (hasPdf) {
    return {
      title: "原文入口",
      body: "PDF 已就绪，可在导读判断后直接对照原文继续阅读。",
    };
  }

  if (hasWord) {
    return {
      title: "原文入口",
      body: "当前未提供 PDF 预览，仍可通过 Word 原文查看裁判内容。",
    };
  }

  return {
    title: "研习入口",
    body: "当前已提供导读判断线索，可继续进入案例研习。",
  };
}
