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
      : "本页先帮助你判断案件究竟在争什么，再决定是否继续进入全文。",
    whyRead: outcome
      ? `先读裁判结论“${outcome}”，能更快判断这份裁判如何回应争议并是否值得细读。`
      : whyReadFallback
        ? `先读摘要中的裁判理由线索“${whyReadFallback}”，能帮助你判断继续阅读的价值。`
        : "先看导读中的裁判理由线索，再决定是否继续投入时间阅读原文。",
    shouldContinue: "如果你想继续梳理事实、争议焦点与法理分析，就进入案例研习继续推进。",
  };
}

export function buildCaseReadingRoadmap(caseItem = {}) {
  const dispute = buildCoreDispute(caseItem);
  const outcome = buildOutcomeHeadline(caseItem);

  return [
    {
      id: "01",
      title: "先判断读什么",
      description: dispute
        ? `先确认案件围绕“${dispute}”展开，快速把握这份裁判到底在回应什么问题。`
        : "先确认案件争议的核心问题，建立进入原文前的阅读预期。",
    },
    {
      id: "02",
      title: "再判断值不值得细读",
      description: outcome
        ? `把裁判结论“${outcome}”与摘要放在一起看，判断这份文书是否值得继续精读。`
        : "把摘要与裁判信息放在一起看，判断这份文书是否值得继续精读。",
    },
    {
      id: "03",
      title: "最后决定是否进入研习",
      description: "确认值得继续后，可直接进入案例研习，沿着事实、争议焦点与法理分析继续阅读。",
    },
  ];
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
      body: "当前未提供 PDF 预览，但仍可通过 Word 原文继续核对裁判内容。",
    };
  }

  return {
    title: "研习入口",
    body: "当前页面已整理导读判断线索，不影响继续判断是否进入案例研习。",
  };
}
