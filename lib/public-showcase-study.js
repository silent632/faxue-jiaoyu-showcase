const DEFAULT_FEEDBACK = Object.freeze({
  ok: true,
  tone: "soft",
  title: "研习说明",
  message: "可继续完善三步内容，填写结果会保存在当前浏览器中，可随时查看与整理。",
});

export function getPublicStudyActionState() {
  return {
    canSubmit: false,
    canAutosave: false,
    submitMessage: "本站支持继续记录研习内容，线上提交入口暂未开放。",
    autosaveMessage: "如需保留研习内容，可在整理完成后导出记录。",
  };
}

export function getPublicStudyHeadNote({ hasPdf } = {}) {
  return hasPdf
    ? "围绕同一份裁判文书完成阅读、梳理与分析，研习内容可继续保存在当前浏览器中。"
    : "先结合案例导读把握事实与争点，再进入结构化研习并完成三步写作。";
}

export function getPublicStudyReaderNote({ hasPdf }) {
  if (hasPdf) {
    return "结合原文版式与关键段落继续阅读，可与右侧研习内容相互参照。";
  }

  return "可先结合案例导读、事实要点与争议焦点建立判断，再继续推进后续研习。";
}

export function getPublicStudyWriterNote({ hasPdf } = {}) {
  return hasPdf
    ? "围绕事实梳理、争议焦点与法理分析逐步展开，写作内容会保存在当前浏览器中。"
    : "围绕导读建立的判断继续展开三步写作，填写内容会保存在当前浏览器中。";
}

export function getPublicStudyOverviewDescription({ hasPdf } = {}) {
  return hasPdf
    ? "先形成自己的判断，再结合参考要点继续补充和修订，逐步完成三步研习。"
    : "先根据导读完成自己的初稿，再逐步对照参考要点补齐事实梳理、争议焦点与法理分析。";
}

export function getPublicStudyDefaultFeedback() {
  return DEFAULT_FEEDBACK;
}

export function normalizePublicStudyFeedback(item) {
  if (!item) return null;
  if (item.ok && item.tone === "success") return item;

  if (item.tone === "warning" || /公开展示模式|真实提交|展示模式/u.test(String(item.message || ""))) {
    return {
      ...item,
      title: "研习说明",
      message: "可继续填写并导出研习内容，线上提交入口暂未开放。",
    };
  }

  return item;
}
