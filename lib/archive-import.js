import { isRubricSnapshot } from "./case-rubrics.js";
import { getExperimentStorageKey, readExperimentRecordState } from "./experiment-archive.js";
import { normalizeExperimentRecord } from "./experiment-completion.js";
import { getStudyStorageKey, normalizeStudyDraft } from "./study-workspace.js";
import { IMPORT_VAULT_KEY, readLocalRecord, recordRevision, writeLocalRecord } from "./local-record.js";

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
const MAX_RECORDS = 2000;
const MODULES = new Set(["exp-reasoning", "exp-argumentation", "exp-norm-retrieval", "exp-interpretation", "exp-value-balancing", "exp-annotation"]);
const unsafeKeys = new Set(["__proto__", "prototype", "constructor"]);
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const validId = (id) => typeof id === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id) && !unsafeKeys.has(id);
const fail = (message) => { throw new Error(message); };

function checkTree(value, depth = 0) {
  if (depth > 24) fail("文件嵌套过深，无法导入。");
  if (typeof value === "string" && value.length > 500000) fail("单个文本过长，无法导入。");
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (unsafeKeys.has(key)) fail("文件包含不支持的字段名。");
      checkTree(child, depth + 1);
    }
  }
}

function normalizeEntry(kind, caseId, record, moduleId) {
  if (!validId(caseId) || (moduleId && !MODULES.has(moduleId))) fail("案例编号或实验模块无法识别。");
  if (!isObject(record)) fail(`${caseId} 的记录必须是对象。`);
  if (record.version !== undefined && ![1, 2].includes(record.version)) fail(`${caseId} 的记录版本不兼容。`);
  if (record.deleted) fail("删除标记不能作为学习记录导入。");
  if (record.ts !== undefined && (typeof record.ts !== "number" || !Number.isFinite(record.ts) || record.ts < 0)) fail(`${caseId} 的时间格式无效。`);
  for (const key of ["updatedAt", "completedAt", "revision", "caseTitle", "output", "revisionNote"]) {
    if (record[key] != null && typeof record[key] !== "string") fail(`${caseId} 的 ${key} 必须是文本。`);
  }
  if (kind === "study") {
    for (const key of ["fact", "issue", "analysis"]) if (record[key] !== undefined && typeof record[key] !== "string") fail(`${caseId} 的研习内容必须是文本。`);
    if (!["fact", "issue", "analysis"].some((key) => Object.hasOwn(record, key))) fail(`${caseId} 缺少研习字段。`);
    return { kind, caseId, record: { ...record, ...normalizeStudyDraft(record) } };
  }
  if (kind !== "experiment" || !moduleId) fail("记录类型无法识别。");
  if (record.courseTask !== undefined && (!isObject(record.courseTask) || typeof record.courseTask.slug !== "string" || typeof record.courseTask.version !== "string")) fail(`${caseId} 的课程任务版本无效。`);
  if (record.courseTaskHistory !== undefined && (!Array.isArray(record.courseTaskHistory) || record.courseTaskHistory.some(item => !isObject(item) || typeof item.slug !== "string" || typeof item.version !== "string"))) fail(`${caseId} 的课程历史格式无效。`);
  if (record.feedbackReference !== undefined && (!isRubricSnapshot(record.feedbackReference) || record.feedbackReference.moduleId !== moduleId || record.feedbackReference.id !== `rubric-${caseId}`)) fail(`${caseId} 的量规快照格式或对应任务无效。`);
  if (record.workflowStage !== undefined && !["task", "review", "eval"].includes(record.workflowStage)) fail(`${caseId} 的实验阶段无效。`);
  if (record.revisionNoteConfirmed !== undefined && typeof record.revisionNoteConfirmed !== "boolean") fail(`${caseId} 的修订确认状态无效。`);
  if (record.initialDraft !== undefined) {
    if (!isObject(record.initialDraft) || typeof record.initialDraft.output !== "string" || typeof record.initialDraft.capturedAt !== "string" || !isObject(record.initialDraft.interactionData)) fail(`${caseId} 的初稿格式无效。`);
    validateInteraction(record.initialDraft.interactionData, caseId);
  }
  if (record.interactionData !== undefined && !isObject(record.interactionData)) fail(`${caseId} 的实验产出格式无效。`);
  if (record.interactionData) validateInteraction(record.interactionData, caseId);
  if (record.selfScores !== undefined && (!isObject(record.selfScores) || Object.values(record.selfScores).some((score) => typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 5))) fail(`${caseId} 的自评格式无效。`);
  if (record.status !== undefined && !["draft", "completed"].includes(record.status)) fail(`${caseId} 的完成状态无法识别。`);
  if (!["output", "interactionData", "completedAt"].some((key) => Object.hasOwn(record, key))) fail(`${caseId} 缺少实验产出字段。`);
  return { kind, caseId, moduleId, record: normalizeExperimentRecord(moduleId, record) };
}

function validateInteraction(data, caseId) {
  const textFields = ["majorPremise", "minorPremise", "conclusion", "subsumption", "plaintiff", "defendant", "judgment", "reason", "bestMethod", "bestReason", "leftValue", "rightValue", "leftArg", "rightArg", "evaluation", "sourceVersion", "otherBasis", "caseId", "sourceFile", "sourceSha256", "caseNumber"];
  for (const key of textFields) if (data[key] !== undefined && typeof data[key] !== "string") fail(`${caseId} 的 ${key} 必须是文本。`);
  for (const key of ["selected", "usedChips", "referenceIds", "legacySelection"]) if (data[key] !== undefined && (!Array.isArray(data[key]) || data[key].some((value) => typeof value !== "string"))) fail(`${caseId} 的 ${key} 必须是文本列表。`);
  if (data.columns !== undefined && (!isObject(data.columns) || Object.values(data.columns).some((value) => typeof value !== "string"))) fail(`${caseId} 的解释列必须是文本。`);
  if (data.slider !== undefined && (typeof data.slider !== "number" || !Number.isFinite(data.slider) || data.slider < 0 || data.slider > 100)) fail(`${caseId} 的衡量位置无效。`);
  if (data.compared !== undefined && typeof data.compared !== "boolean") fail(`${caseId} 的对照状态无效。`);
  if (data.historicalAnnotations !== undefined && (!Array.isArray(data.historicalAnnotations) || data.historicalAnnotations.some((entry) => !isObject(entry)))) fail(`${caseId} 的历史批注必须是记录列表。`);
  if (data.annotations !== undefined && (!Array.isArray(data.annotations) || data.annotations.some((entry) => !isObject(entry) || typeof entry.tagId !== "string" || (entry.paraIndex !== undefined && (!Number.isInteger(entry.paraIndex) || entry.paraIndex < 0)) || (entry.paragraphId !== undefined && typeof entry.paragraphId !== "string")))) fail(`${caseId} 的批注格式无效。`);
}

export function parseArchiveImport(text) {
  if (typeof text !== "string" || new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) fail("文件不得超过 2 MB。");
  let payload;
  try { payload = JSON.parse(text); } catch { fail("文件不是有效的 JSON，原记录未改变。"); }
  checkTree(payload);
  if (!isObject(payload) || ![1, 2].includes(payload.version)) fail("备份版本不兼容，支持版本 1 和 2。");
  if (!isObject(payload.studyRecords) || !isObject(payload.experimentArchive)) fail("备份缺少研习或实验档案结构。");
  const entries = [];
  for (const [caseId, record] of Object.entries(payload.studyRecords)) entries.push(normalizeEntry("study", caseId, record));
  for (const [moduleId, cases] of Object.entries(payload.experimentArchive)) {
    if (!MODULES.has(moduleId) || !isObject(cases)) fail("实验模块或档案结构无法识别。");
    for (const [caseId, record] of Object.entries(cases)) entries.push(normalizeEntry("experiment", caseId, record, moduleId));
  }
  if (payload.alternatives !== undefined) {
    if (!Array.isArray(payload.alternatives)) fail("冲突副本结构无效。");
    for (const entry of payload.alternatives) {
      if (!isObject(entry)) fail("冲突副本结构无效。");
      entries.push({ ...normalizeEntry(entry.kind, entry.caseId, entry.record, entry.moduleId), alternative: true });
    }
  }
  if (entries.length > MAX_RECORDS) fail("一次最多导入 2000 条记录。");
  return entries;
}

// 忽略本地写入修订和保存时间，避免恢复后自动保存造成重复副本；学习内容和完成状态仍参与比较。
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
}
function contentKey(record) {
  const { revision, ts, updatedAt, version, ...content } = record;
  return JSON.stringify(canonical(content));
}
function entryKey(entry, userSid) {
  return entry.kind === "study" ? getStudyStorageKey(userSid, entry.caseId) : getExperimentStorageKey(entry.moduleId, entry.caseId);
}
function readVault() {
  const state = readLocalRecord(IMPORT_VAULT_KEY);
  if (!state.ok) fail("导入副本无法读取，原数据已保留，请先备份。");
  if (state.record && (!isObject(state.record.records) || !Array.isArray(state.record.alternatives))) fail("导入副本结构异常，原数据已保留。");
  return state;
}

export function readImportAlternatives(userSid) {
  const vault = readVault().record;
  const copies = (vault?.alternatives || []).filter((entry) => entry.userSid === userSid).map(({ userSid: _sid, ...entry }) => entry);
  // 导入后普通编辑优先；被编辑记录遮住的导入原版仍须可导出，包括并发编辑的情况。
  for (const [key, record] of Object.entries(vault?.records || {})) {
    const raw = window.localStorage.getItem(key);
    if (raw === null) continue;
    const studyPrefix = `study_${userSid}_`;
    let entry;
    if (key.startsWith(studyPrefix)) entry = { kind: "study", caseId: key.slice(studyPrefix.length), record };
    else if (key.startsWith("faxue-experiment-v2:")) {
      const [moduleId, caseId] = key.slice("faxue-experiment-v2:".length).split(":").map(decodeURIComponent);
      entry = { kind: "experiment", caseId, moduleId, record };
    } else continue;
    const current = readLocalRecord(key);
    if (current.ok && contentKey(current.record) === contentKey(record)) continue;
    if (!copies.some((copy) => entryKey(copy, userSid) === key && contentKey(copy.record) === contentKey(record))) copies.push(entry);
  }
  return copies;
}

export function previewArchiveImport(entries, { userSid, knownCaseIds }) {
  const state = readVault();
  const records = { ...state.record?.records };
  const alternatives = [...(state.record?.alternatives || [])];
  const known = new Set(knownCaseIds);
  const rows = [];
  const expected = [];
  for (const entry of entries) {
    const key = entryKey(entry, userSid);
    const current = entry.kind === "experiment" ? readExperimentRecordState(entry.moduleId, entry.caseId) : readLocalRecord(key);
    expected.push([key, current.ok, current.raw, recordRevision(current.record)]);
    // 同一备份内出现多个版本时，首个主记录保持主记录，后续差异作为副本。
    const local = current.record || records[key];
    const normalized = local && (entry.kind === "study" ? { ...local, ...normalizeStudyDraft(local) } : normalizeExperimentRecord(entry.moduleId, local));
    const same = (normalized && contentKey(normalized) === contentKey(entry.record)) || (records[key] && contentKey(records[key]) === contentKey(entry.record));
    const existingCopy = alternatives.some((copy) => copy.userSid === userSid && entryKey(copy, userSid) === key && contentKey(copy.record) === contentKey(entry.record));
    let action;
    if (same || existingCopy) action = "duplicate";
    else if (!entry.alternative && current.ok && !local) {
      action = "new";
      records[key] = entry.record;
    } else {
      action = "conflict";
      alternatives.push({ kind: entry.kind, caseId: entry.caseId, ...(entry.moduleId ? { moduleId: entry.moduleId } : {}), record: entry.record, userSid });
    }
    rows.push({ ...entry, action, unknown: !known.has(entry.caseId) });
  }
  const counts = { new: 0, duplicate: 0, conflict: 0, unknown: 0 };
  for (const row of rows) { counts[row.action] += 1; if (row.unknown) counts.unknown += 1; }
  return { rows, counts, entries, options: { userSid, knownCaseIds: [...known] }, expected: JSON.stringify(expected), vaultRevision: recordRevision(state.record), value: { records, alternatives } };
}

export async function commitArchiveImport(preview, locks = globalThis.navigator?.locks) {
  if (!locks?.request) return { ok: false, errorCode: "unsupported" };
  try {
    return await locks.request(IMPORT_VAULT_KEY, () => {
      const fresh = previewArchiveImport(preview.entries, preview.options);
      if (fresh.vaultRevision !== preview.vaultRevision || fresh.expected !== preview.expected) return { ok: false, errorCode: "conflict", preview: fresh };
      if (!fresh.counts.new && !fresh.counts.conflict) return { ok: true, counts: fresh.counts };
      const result = writeLocalRecord(IMPORT_VAULT_KEY, fresh.value, { expectedRevision: fresh.vaultRevision, backupLegacy: false });
      return { ...result, counts: fresh.counts };
    });
  } catch (error) { return { ok: false, errorCode: "unavailable", message: error.message }; }
}

export function archiveFromAlternative(entry) {
  return {
    version: 2,
    studyRecords: entry.kind === "study" ? { [entry.caseId]: entry.record } : {},
    experimentArchive: entry.kind === "experiment" ? { [entry.moduleId]: { [entry.caseId]: entry.record } } : {},
  };
}
