"use client";

const STORAGE_KEY = "faxue-experiment-archive";

function readArchive() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeArchive(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded — silent fail
  }
}

export function saveExperimentRecord(moduleId, caseId, record) {
  const archive = readArchive();
  if (!archive[moduleId]) archive[moduleId] = {};
  archive[moduleId][caseId] = {
    ...record,
    updatedAt: new Date().toISOString(),
    completedAt: archive[moduleId][caseId]?.completedAt || new Date().toISOString(),
  };
  writeArchive(archive);
}

export function loadExperimentRecord(moduleId, caseId) {
  const archive = readArchive();
  return archive[moduleId]?.[caseId] || null;
}

export function getModuleProgress(moduleId) {
  const archive = readArchive();
  const modData = archive[moduleId] || {};
  const entries = Object.entries(modData);
  return {
    total: entries.length,
    records: entries.map(([caseId, rec]) => ({
      caseId,
      ...rec,
    })),
  };
}

export function getAllProgress() {
  const archive = readArchive();
  const result = {};
  for (const [moduleId, cases] of Object.entries(archive)) {
    result[moduleId] = Object.keys(cases).length;
  }
  return result;
}

export function deleteExperimentRecord(moduleId, caseId) {
  const archive = readArchive();
  if (archive[moduleId]) {
    delete archive[moduleId][caseId];
    if (Object.keys(archive[moduleId]).length === 0) {
      delete archive[moduleId];
    }
  }
  writeArchive(archive);
}
