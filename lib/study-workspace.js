export const STUDY_STEP_MIN_CHARS = 50;
export const STUDY_AUTOSAVE_INTERVAL_MS = 3000;

export const STUDY_STEP_DEFINITIONS = [
  {
    field: "fact",
    idx: "01",
    title: "第一步 · 事实梳理",
    prompt: "请提取关键事实：当事人是谁、发生了什么、关键时间点和关键金额分别是什么？",
    refKey: "refFact",
  },
  {
    field: "issue",
    idx: "02",
    title: "第二步 · 争议焦点",
    prompt: "本案真正的争议核心是什么？双方主张、抗辩和证据分别围绕什么展开？",
    refKey: "refIssue",
  },
  {
    field: "analysis",
    idx: "03",
    title: "第三步 · 法理分析",
    prompt: "按三段论来写：先写法条前提，再写事实涵摄，最后写裁判结论，并补一句你自己的评价。",
    refKey: "refLegal",
  },
];

export function createEmptyStudyDraft() {
  return {
    fact: "",
    issue: "",
    analysis: "",
  };
}

export function charLen(value) {
  return String(value || "").trim().length;
}

export function getStudyStorageKey(userSid, caseId) {
  return `study_${userSid}_${caseId}`;
}

export function getRecentStudyStorageKey(userSid) {
  return `study_recent_${userSid}`;
}

export function normalizeStudyDraft(value) {
  return {
    fact: String(value?.fact || ""),
    issue: String(value?.issue || ""),
    analysis: String(value?.analysis || ""),
  };
}

export function serializeStudyDraft(value) {
  return JSON.stringify(normalizeStudyDraft(value));
}

export function readStudyDraft(storageKey) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return normalizeStudyDraft(JSON.parse(raw));
  } catch (_error) {
    return null;
  }
}

export function saveStudyDraft({ storageKey, recentStorageKey, caseId, draft }) {
  if (typeof window === "undefined") return false;
  try {
    const now = Date.now();
    const normalizedDraft = normalizeStudyDraft(draft);
    window.localStorage.setItem(storageKey, JSON.stringify({ ...normalizedDraft, ts: now }));
    window.localStorage.setItem(recentStorageKey, JSON.stringify({ id: caseId, ts: now }));
    return true;
  } catch (_error) {
    return false;
  }
}

export function getStudyWorkspaceMetrics({ caseItem, draft, hasPdf = true }) {
  const normalizedDraft = normalizeStudyDraft(draft);
  const doneCount = STUDY_STEP_DEFINITIONS.filter((step) => charLen(normalizedDraft[step.field]) >= STUDY_STEP_MIN_CHARS).length;
  const totalChars = STUDY_STEP_DEFINITIONS.reduce((sum, step) => sum + charLen(normalizedDraft[step.field]), 0);
  const availableRefCount = STUDY_STEP_DEFINITIONS.filter((step) => caseItem?.[step.refKey]).length;

  return {
    doneCount,
    totalChars,
    availableRefCount,
    completionText:
      doneCount === STUDY_STEP_DEFINITIONS.length
        ? "三步都已完成，可以导出研习记录。"
        : hasPdf
          ? "按照“事实梳理 → 争议焦点 → 法理分析”的顺序继续推进。"
          : "先依据导读完成事实梳理，再进入争议焦点与法理分析。",
    actionLabel: doneCount < STUDY_STEP_DEFINITIONS.length ? "继续完善" : "可导出留档",
  };
}

export function getPublicStudyActionState() {
  return {
    canSubmit: false,
    canAutosave: true,
    submitMessage: "填写内容会保存在当前浏览器中，可继续整理并导出研习记录。",
    autosaveMessage: "填写内容会保存在当前浏览器中，可稍后继续整理。",
  };
}

export async function submitStudyWorkspace() {
  return {
    ok: true,
    tone: "soft",
    title: "研习说明",
    message: "当前支持继续整理并导出研习记录，填写内容会保存在当前浏览器中。",
  };
}

function formatNowForText(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toSafeFileName(text) {
  return String(text || "")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildStudyReportFileName(caseItem) {
  const caseLabel = caseItem?.caseNumber || caseItem?.id || "case";
  const caseTitle = caseItem?.title || "未命名案例";
  return `${toSafeFileName(caseLabel)}-${toSafeFileName(caseTitle)}-研习记录.txt`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportStudyReport({ caseItem, draft }) {
  try {
    const exportTime = formatNowForText(new Date());
    const normalizedDraft = normalizeStudyDraft(draft);
    const lines = [
      "裁判文书研习平台 研习记录",
      "",
      `案号：${caseItem?.caseNumber || "-"}`,
      `案名：${caseItem?.title || "-"}`,
      `法院：${caseItem?.courtName || "-"}`,
      `裁判日期：${caseItem?.judgmentDate || "-"}`,
      "",
      "一、事实梳理",
      normalizedDraft.fact || "（未填写）",
      "",
      "二、争议焦点",
      normalizedDraft.issue || "（未填写）",
      "",
      "三、法理分析",
      normalizedDraft.analysis || "（未填写）",
      "",
      `导出时间：${exportTime}`,
      "说明：本记录依据当前填写内容导出，可作归档和后续整理参考。",
    ];
    const fileName = buildStudyReportFileName(caseItem);
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, fileName);
    return {
      ok: true,
      tone: "success",
      title: "导出成功",
      message: "研习记录已下载到本地。",
    };
  } catch (_error) {
    return {
      ok: false,
      tone: "error",
      title: "导出失败",
      message: "请稍后重试。",
    };
  }
}
