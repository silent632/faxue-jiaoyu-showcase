import { isExperimentComplete } from "./experiment-completion.js";
import { listLocalRecordKeys, readLocalRecord } from "./local-record.js";
import { readExperimentArchive as readStoredExperimentArchive } from "./experiment-archive.js";
import {
  STUDY_STEP_DEFINITIONS,
  STUDY_STEP_MIN_CHARS,
  charLen,
  normalizeStudyDraft,
} from "./study-workspace.js";

function normalizeExperimentRecords(experimentRecords) {
  if (Array.isArray(experimentRecords)) {
    return experimentRecords.filter((record) => isExperimentComplete(record?.moduleId, record));
  }
  if (!experimentRecords || typeof experimentRecords !== "object") return [];
  return Object.entries(experimentRecords).filter(([moduleId, record]) => isExperimentComplete(moduleId, record)).map(([, record]) => record);
}

export function deriveCaseLoopState({ studyDraft, experimentRecords } = {}) {
  const draft = normalizeStudyDraft(studyDraft);
  const studySteps = STUDY_STEP_DEFINITIONS.filter(
    (step) => charLen(draft[step.field]) >= STUDY_STEP_MIN_CHARS,
  ).length;
  const experimentsDone = normalizeExperimentRecords(experimentRecords).length;
  const studyDone = studySteps === STUDY_STEP_DEFINITIONS.length;

  return {
    studyDone,
    studySteps,
    experimentsDone,
    closed: studyDone && experimentsDone > 0,
  };
}

export function recommendModulesForCase(caseTags, modules) {
  const tagSet = new Set(Array.isArray(caseTags) ? caseTags : []);

  return (Array.isArray(modules) ? modules : [])
    .map((mod, index) => ({
      id: mod.id,
      shortName: mod.shortName,
      name: mod.name,
      skill: mod.skill,
      hits: (mod.primaryTags || []).filter((tag) => tagSet.has(tag)).length,
      index,
    }))
    .filter((mod) => mod.id && mod.hits > 0)
    .sort((a, b) => b.hits - a.hits || a.index - b.index)
    .map(({ index: _index, ...mod }) => mod);
}

function normalizeLoopStates(loopStates) {
  if (Array.isArray(loopStates)) {
    return loopStates.map((state, index) => ({
      caseId: state.caseId || state.id || String(index),
      ...state,
    }));
  }
  if (!loopStates || typeof loopStates !== "object") return [];
  return Object.entries(loopStates).map(([caseId, state]) => ({
    caseId,
    ...(state || {}),
  }));
}

function sortStatesByActivity(states) {
  return [...states].sort((a, b) => {
    const timeA = activityTime(a.updatedAt || a.ts);
    const timeB = activityTime(b.updatedAt || b.ts);
    return timeB - timeA || String(a.caseId).localeCompare(String(b.caseId), "en");
  });
}

export function recommendNextAction({ loopStates, modules } = {}) {
  const states = sortStatesByActivity(normalizeLoopStates(loopStates));
  const pending = states.flatMap((state) => (state.pendingTasks || []).map((task) => ({ ...task, caseId: state.caseId })))
    .sort((a, b) => activityTime(b.updatedAt) - activityTime(a.updatedAt));
  if (pending.length) {
    const { kind, caseId, moduleId } = pending[0];
    return moduleId ? { kind, caseId, moduleId } : { kind, caseId };
  }
  const partial = states.find((state) => !state.studyDone && (state.studySteps > 0 || state.hasStudyDraft));
  if (partial) return { kind: "study", caseId: partial.caseId };
  const needsExperiment = states.find((state) => state.studyDone && Number(state.experimentsDone || 0) === 0);
  if (needsExperiment) {
    return {
      kind: "experiment",
      caseId: needsExperiment.caseId,
      moduleId: needsExperiment.recommendedModuleIds?.[0] || null,
    };
  }

  const needsStudy = states.find((state) => !state.studyDone && Number(state.experimentsDone || 0) > 0);
  if (needsStudy) {
    return {
      kind: "study",
      caseId: needsStudy.caseId,
    };
  }

  const moduleItems = Array.isArray(modules) ? modules : [];
  if (moduleItems.length) {
    const ranked = moduleItems
      .map((mod, index) => ({
        moduleId: mod.id,
        completedCount: states.filter((state) =>
          Array.isArray(state.completedModuleIds) && state.completedModuleIds.includes(mod.id)
        ).length,
        index,
      }))
      .filter((item) => item.moduleId)
      .sort((a, b) => a.completedCount - b.completedCount || a.index - b.index);

    if (ranked.length) {
      return {
        kind: "module",
        moduleId: ranked[0].moduleId,
        completedCount: ranked[0].completedCount,
      };
    }
  }

  return {
    kind: "cases",
  };
}

function roundScore(value) {
  return Math.round(value * 10) / 10;
}

export function summarizeAbilities(experimentArchive, modules) {
  const archive = experimentArchive && typeof experimentArchive === "object" ? experimentArchive : {};

  return (Array.isArray(modules) ? modules : []).map((mod) => {
    const records = archive[mod.id] && typeof archive[mod.id] === "object"
      ? Object.values(archive[mod.id]).filter(Boolean)
      : [];
    const scores = records.flatMap((record) =>
      Object.values(record.selfScores || {}).filter((score) => Number.isFinite(Number(score)) && Number(score) >= 1 && Number(score) <= 5).map(Number)
    );

    return {
      moduleId: mod.id,
      shortName: mod.shortName,
      skill: mod.skill,
      completedCount: records.filter((record) => isExperimentComplete(mod.id, record)).length,
      averageScore: scores.length ? roundScore(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    };
  });
}

export function readAllStudyRecords(userSid) {
  if (typeof window === "undefined") return {};

  const records = {};
  const prefix = `study_${userSid}_`;

  try {
    for (const key of listLocalRecordKeys()) {
      if (!key || !key.startsWith(prefix)) continue;

      const caseId = key.slice(prefix.length);
      if (!caseId) continue;

      try {
        const state = readLocalRecord(key);
        if (!state.ok || !state.record) continue;
        const parsed = state.record;
        records[caseId] = {
          ...parsed,
          ...normalizeStudyDraft(parsed),
          ts: Number(parsed?.ts) || 0,
        };
      } catch (_error) {
        // 单条草稿损坏时跳过，保留其他可读取记录。
      }
    }
  } catch (_error) {
    return {};
  }

  return records;
}

export function readExperimentArchive() {
  return readStoredExperimentArchive();
}

export function activityTime(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Date.parse(value || "") || 0;
}

export function getLearningActivities(studyRecords, experimentArchive) {
  const items = [];
  for (const [caseId, draft] of Object.entries(studyRecords || {})) {
    if (![draft.fact, draft.issue, draft.analysis].some((text) => typeof text === "string" && text.trim())) continue;
    items.push({ kind: "study", caseId, updatedAt: activityTime(draft.updatedAt || draft.ts), complete: deriveCaseLoopState({ studyDraft: draft }).studyDone });
  }
  for (const [moduleId, records] of Object.entries(experimentArchive || {})) {
    for (const [caseId, record] of Object.entries(records || {})) {
      items.push({ kind: "experiment", moduleId, caseId, updatedAt: activityTime(record.updatedAt || record.ts || record.completedAt), complete: isExperimentComplete(moduleId, record) });
    }
  }
  return items.sort((a, b) => b.updatedAt - a.updatedAt || a.caseId.localeCompare(b.caseId));
}
