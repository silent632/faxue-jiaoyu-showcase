"use client";

import Link from "next/link";
import ArchiveImportPanel from "@/components/archive-import-panel";
import { readImportAlternatives } from "@/lib/archive-import";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EXPERIMENT_ARCHIVE_STORAGE_KEY, EXPERIMENT_RECORD_PREFIX } from "@/lib/experiment-archive";
import {
  deriveCaseLoopState,
  getLearningActivities,
  readAllStudyRecords,
  readExperimentArchive,
  recommendModulesForCase,
  recommendNextAction,
  summarizeAbilities,
} from "@/lib/learning-loop";
import { isExperimentComplete } from "@/lib/experiment-completion";
import { IMPORT_VAULT_KEY, LEGACY_BACKUP_PREFIX, notifyRecordChanged, subscribeRecords, storageErrorMessage, storageErrorCode } from "@/lib/local-record";
import { getRecentStudyStorageKey } from "@/lib/study-workspace";

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `裁判文书研习档案-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildCaseRecords({ studyRecords, experimentArchive, caseIndex, modules }) {
  const activities = getLearningActivities(studyRecords, experimentArchive);
  const caseMap = new Map(caseIndex.map((item) => [item.id, item]));
  const caseIds = new Set(Object.keys(studyRecords));

  for (const moduleRecords of Object.values(experimentArchive)) {
    for (const caseId of Object.keys(moduleRecords || {})) caseIds.add(caseId);
  }

  return [...caseIds]
    .map((caseId) => {
      const caseItem = caseMap.get(caseId) || { id: caseId };
      const completedModuleIds = modules
        .filter((mod) => isExperimentComplete(mod.id, experimentArchive[mod.id]?.[caseId]))
        .map((mod) => mod.id);
      const experimentRecords = Object.fromEntries(
        completedModuleIds.map((moduleId) => [moduleId, experimentArchive[moduleId][caseId]]),
      );
      const loopState = deriveCaseLoopState({
        studyDraft: studyRecords[caseId],
        experimentRecords,
      });
      const allExperimentRecords = Object.values(experimentArchive).map((records) => records?.[caseId]).filter(Boolean);
      const experimentTimes = allExperimentRecords
        .map((record) => Date.parse(record.updatedAt || record.completedAt || "") || 0);
      const updatedAt = Math.max(Number(studyRecords[caseId]?.ts) || 0, ...experimentTimes, 0);
      const fallbackTitle = allExperimentRecords.find((record) => record.caseTitle)?.caseTitle;
      const recommendedModuleIds = recommendModulesForCase(caseItem.jurisprudenceTags, modules)
        .map((item) => item.id);

      return {
        ...caseItem,
        title: caseItem.title || fallbackTitle || caseId,
        ...loopState,
        completedModuleIds,
        pendingTasks: activities.filter((task) => task.caseId === caseId && !task.complete),
        knownCase: caseMap.has(caseId),
        recommendedModuleIds,
        updatedAt,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id, "en"));
}

function resolveRecommendation(action, records, modules, copy) {
  const record = records.find((item) => item.id === action.caseId);

  if (action.kind === "experiment" && record) {
    const moduleId = action.moduleId || record.recommendedModuleIds[0];
    return {
      text: copy.experimentText,
      label: record.title,
      href: moduleId ? `/experiments/${moduleId}?case=${record.id}` : `/cases/${record.id}`,
    };
  }
  if (action.kind === "study" && record) {
    return {
      text: copy.studyText,
      label: record.title,
      href: `/cases/${record.id}/study`,
    };
  }
  if (action.kind === "module") {
    const mod = modules.find((item) => item.id === action.moduleId);
    return {
      text: copy.moduleText,
      label: mod?.name || copy.actionLabel,
      href: mod ? `/experiments/${mod.id}` : "/experiments",
    };
  }
  return {
    text: copy.casesText,
    label: copy.actionLabel,
    href: "/cases",
  };
}

export default function ArchiveWorkspace({ caseIndex, modules, copy, userSid }) {
  const [studyRecords, setStudyRecords] = useState({});
  const [experimentArchive, setExperimentArchive] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState("");
  const [hasCopies, setHasCopies] = useState(false);

  const refreshRecords = useCallback(() => {
    setStudyRecords(readAllStudyRecords(userSid));
    setExperimentArchive(readExperimentArchive());
    try { setHasCopies(readImportAlternatives(userSid).length > 0); } catch { /* 导入面板单独提示异常。 */ }
    setHydrated(true);
  }, [userSid]);

  useEffect(() => {
    refreshRecords();
    return subscribeRecords(refreshRecords);
  }, [refreshRecords]);

  const records = useMemo(
    () => buildCaseRecords({ studyRecords, experimentArchive, caseIndex, modules }),
    [caseIndex, experimentArchive, modules, studyRecords],
  );
  const abilities = useMemo(
    () => summarizeAbilities(experimentArchive, modules),
    [experimentArchive, modules],
  );
  const experimentCount = abilities.reduce((sum, item) => sum + item.completedCount, 0);
  const closedCount = records.filter((item) => item.closed).length;
  const hasRecords = records.length > 0;
  const loopStates = Object.fromEntries(records.filter((item) => item.knownCase).map((item) => [item.id, {
    pendingTasks: item.pendingTasks,
    studySteps: item.studySteps,
    studyDone: item.studyDone,
    experimentsDone: item.experimentsDone,
    completedModuleIds: item.completedModuleIds,
    recommendedModuleIds: item.recommendedModuleIds,
    updatedAt: item.updatedAt,
  }]));
  const nextAction = recommendNextAction({ loopStates, modules });
  const recommendation = resolveRecommendation(nextAction, records, modules, copy.recommendation);

  function handleExport() {
    try {
    downloadJson({
      version: 2,
      exportedAt: new Date().toISOString(),
      studyRecords: readAllStudyRecords(userSid),
      experimentArchive: readExperimentArchive(),
      alternatives: readImportAlternatives(userSid),
    });
    setNotice(copy.actions.exportedMessage);
    } catch (error) { setNotice(error.message || "导出失败，请重试。"); }
  }

  function handleClear() {
    if (!window.confirm(copy.actions.clearConfirm)) return;

    try {
    const prefix = `study_${userSid}_`;
    const keysToRemove = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix) || key?.startsWith(EXPERIMENT_RECORD_PREFIX) || key?.startsWith(`${LEGACY_BACKUP_PREFIX}${prefix}`)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    window.localStorage.removeItem(getRecentStudyStorageKey(userSid));
    window.localStorage.removeItem(EXPERIMENT_ARCHIVE_STORAGE_KEY);
    window.localStorage.removeItem(IMPORT_VAULT_KEY);
    setNotice(copy.actions.clearedMessage);
    notifyRecordChanged(null);
    refreshRecords();
    } catch (error) { setNotice(storageErrorMessage(storageErrorCode(error))); }
  }

  if (!hydrated) {
    return <div className="archive-shell" aria-busy="true" />;
  }

  return (
    <div className="archive-shell fade-in">
      <header className="archive-hero">
        <span className="section-eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>

      {!hasRecords ? (
        <section className="showcase-card archive-empty">
          <div className="archive-empty-mark" aria-hidden="true">○</div>
          <h2>{copy.empty.title}</h2>
          <p>{copy.empty.description}</p>
          <div className="archive-empty-actions">
            <Link className="btn btn-primary" href="/courses">{copy.empty.courseLabel}</Link>
            <Link className="btn btn-outline" href="/cases">{copy.empty.casesLabel}</Link>
            <Link className="btn btn-ghost" href="/experiments">{copy.empty.experimentsLabel}</Link>
          </div>
        </section>
      ) : (
        <>
          <section className="archive-overview" aria-label="研习概览">
            <article>
              <strong>{Object.keys(studyRecords).length}</strong>
              <span>{copy.overview.studyLabel} · {copy.overview.caseUnit}</span>
            </article>
            <article>
              <strong>{experimentCount}</strong>
              <span>{copy.overview.experimentLabel} · {copy.overview.experimentUnit}</span>
            </article>
            <article className="is-closed">
              <strong>{closedCount}</strong>
              <span>{copy.overview.closedLabel} · {copy.overview.caseUnit}</span>
            </article>
          </section>

          <section className="showcase-card archive-recommendation">
            <div>
              <span className="section-eyebrow">{copy.recommendation.eyebrow}</span>
              <h2>{copy.recommendation.title}</h2>
              <p>{recommendation.text}</p>
            </div>
            <Link className="btn btn-accent" href={recommendation.href}>
              {recommendation.label} →
            </Link>
          </section>

          <section className="showcase-card archive-abilities">
            <div className="archive-section-head">
              <span className="section-eyebrow">{copy.abilities.eyebrow}</span>
              <h2>{copy.abilities.title}</h2>
            </div>
            <div className="archive-ability-grid">
              {abilities.map((item) => {
                const scorePercent = item.averageScore == null ? 0 : (item.averageScore / 5) * 100;
                return (
                  <article key={item.moduleId} className="archive-ability-card">
                    <div className="archive-ability-title">
                      <span>{item.shortName}</span>
                      <strong>{item.skill}</strong>
                    </div>
                    <div className="archive-ability-meta">
                      <span>{copy.abilities.completedLabel} {item.completedCount}</span>
                      <span>
                        {item.averageScore == null
                          ? copy.abilities.emptyScore
                          : `${copy.abilities.scoreLabel} ${item.averageScore}/5`}
                      </span>
                    </div>
                    <div className="archive-ability-track" aria-hidden="true">
                      <span style={{ "--archive-ability-score": `${scorePercent}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="showcase-card archive-records">
            <div className="archive-section-head">
              <span className="section-eyebrow">{copy.records.eyebrow}</span>
              <h2>{copy.records.title}</h2>
            </div>
            <div className="archive-record-list">
              {records.map((item) => (
                <article key={item.id} className={`archive-record${item.closed ? " is-closed" : ""}`}>
                  <div className="archive-record-main">
                    <div className="archive-record-kicker">
                      <span>{item.causeFocus || item.caseNumber || item.id}</span>
                      {item.closed ? <strong>{copy.records.closedLabel}</strong> : null}
                    </div>
                    {item.knownCase ? <Link href={`/cases/${item.id}/study`}>{item.title}</Link> : <strong>{item.title}（历史记录）</strong>}
                    <small>{item.caseNumber}</small>
                  </div>
                  <div className="archive-record-progress">
                    <span>{copy.records.studyLabel} {item.studySteps}/3</span>
                    <div>
                      {item.completedModuleIds.map((moduleId) => {
                        const mod = modules.find((entry) => entry.id === moduleId);
                        return (
                          item.knownCase ? <Link key={moduleId} className="tag" href={`/experiments/${moduleId}?case=${item.id}`}>
                            {mod?.shortName || moduleId}
                          </Link> : <span key={moduleId} className="tag">{mod?.shortName || moduleId}</span>
                        );
                      })}
                    </div>
                  </div>
                  {item.knownCase ? <Link className="btn btn-outline" href={item.pendingTasks[0]?.kind === "experiment" ? `/experiments/${item.pendingTasks[0].moduleId}?case=${item.id}` : `/cases/${item.id}/study`}>
                    {copy.records.continueLabel}
                  </Link> : null}
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="showcase-card archive-actions">
        <div>
          <span className="section-eyebrow">{copy.actions.eyebrow}</span>
          <h2>{copy.actions.title}</h2>
          <p>{copy.actions.description}</p>
          {notice ? <strong role="status">{notice}</strong> : null}
        </div>
        <div className="archive-action-buttons">
          <button className="btn btn-primary" type="button" onClick={handleExport}>
            {copy.actions.exportLabel}
          </button>
          {hasRecords || hasCopies ? (
            <button className="btn btn-outline" type="button" onClick={handleClear}>
              {copy.actions.clearLabel}
            </button>
          ) : null}
        </div>
      </section>
      <ArchiveImportPanel caseIndex={caseIndex} userSid={userSid} downloadJson={downloadJson} />
    </div>
  );
}
