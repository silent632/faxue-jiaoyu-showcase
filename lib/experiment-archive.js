import { checkRevisionCompletion } from "./experiment-revision.js";
import { checkExperimentCompletion, isExperimentComplete, normalizeExperimentRecord } from "./experiment-completion.js";
import { listLocalRecordKeys, readLocalRecord, recordRevision, storageErrorCode, writeLocalRecord } from "./local-record.js";

export const EXPERIMENT_ARCHIVE_STORAGE_KEY = "faxue-experiment-archive";
export const EXPERIMENT_RECORD_PREFIX = "faxue-experiment-v2:";
export const getExperimentStorageKey = (moduleId, caseId) => `${EXPERIMENT_RECORD_PREFIX}${encodeURIComponent(moduleId)}:${encodeURIComponent(caseId)}`;

// 旧档案原样保留，v2 按案例单独写入，避免不同案例互相覆盖。
export function readExperimentRecordState(moduleId, caseId) {
  const current = readLocalRecord(getExperimentStorageKey(moduleId, caseId));
  if (!current.ok || current.record) return current;
  const legacy = readLocalRecord(EXPERIMENT_ARCHIVE_STORAGE_KEY);
  if (!legacy.ok) return legacy;
  return { ok: true, record: legacy.record?.[moduleId]?.[caseId] || null, legacy: true };
}

export function readExperimentArchive() {
  const result = {};
  const legacy = readLocalRecord(EXPERIMENT_ARCHIVE_STORAGE_KEY);
  for (const [moduleId, cases] of Object.entries(legacy.record || {})) {
    if (!cases || typeof cases !== "object" || Array.isArray(cases)) continue;
    result[moduleId] = {};
    for (const [caseId, record] of Object.entries(cases)) {
      const normalized = normalizeExperimentRecord(moduleId, record);
      if (normalized) result[moduleId][caseId] = normalized;
    }
  }
  if (typeof window === "undefined") return result;
  try {
    for (const key of listLocalRecordKeys()) {
      if (!key?.startsWith(EXPERIMENT_RECORD_PREFIX)) continue;
      const [moduleId, caseId] = key.slice(EXPERIMENT_RECORD_PREFIX.length).split(":").map(decodeURIComponent);
      if (!moduleId || !caseId) continue;
      const state = readLocalRecord(key);
      // 新记录损坏或被删除时，不展示旧记录为最新已完成状态。
      if (!result[moduleId]) result[moduleId] = {};
      delete result[moduleId][caseId];
      if (state.ok && !state.record?.deleted) {
        const normalized = normalizeExperimentRecord(moduleId, state.record);
        if (normalized) result[moduleId][caseId] = normalized;
      }
    }
  } catch { /* 读取失败时仍保留其他已读取记录。 */ }
  return result;
}

export function saveExperimentRecord(moduleId, caseId, record, { expectedRevision, complete = false } = {}) {
  const state = readExperimentRecordState(moduleId, caseId);
  if (!state.ok) return state;
  if (expectedRevision !== undefined && recordRevision(state.record) !== expectedRevision) return { ok: false, errorCode: "conflict" };
  const structure = checkExperimentCompletion(moduleId, record.interactionData);
  const revision = checkRevisionCompletion(record);
  const check = { complete: structure.complete && revision.complete, missing: [...structure.missing, ...revision.missing] };
  if (complete && !check.complete) return { ok: false, errorCode: "incomplete", missing: check.missing };
  const status = check.complete && (complete || isExperimentComplete(moduleId, state.record)) ? "completed" : "draft";
  return writeLocalRecord(getExperimentStorageKey(moduleId, caseId), {
    ...state.record,
    ...record,
    deleted: false,
    status,
    completedAt: state.record?.completedAt || (status === "completed" ? new Date().toISOString() : null),
  }, { expectedRevision: state.legacy ? null : recordRevision(state.record), backupLegacy: false });
}

export function loadExperimentRecord(moduleId, caseId) {
  const state = readExperimentRecordState(moduleId, caseId);
  return state.ok && !state.record?.deleted ? normalizeExperimentRecord(moduleId, state.record) : null;
}

export function getModuleProgress(moduleId) {
  const entries = Object.entries(readExperimentArchive()[moduleId] || {});
  return { total: entries.filter(([, record]) => isExperimentComplete(moduleId, record)).length, records: entries.map(([caseId, record]) => ({ caseId, ...record })) };
}

export function getAllProgress() {
  return Object.fromEntries(Object.entries(readExperimentArchive()).map(([moduleId, cases]) => [moduleId, Object.values(cases).filter((record) => isExperimentComplete(moduleId, record)).length]));
}

export function deleteExperimentRecord(moduleId, caseId) {
  try {
    return writeLocalRecord(getExperimentStorageKey(moduleId, caseId), { deleted: true }, { backupLegacy: false });
  } catch (error) { return { ok: false, errorCode: storageErrorCode(error) }; }
}
