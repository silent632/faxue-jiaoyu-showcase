"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  deriveCaseLoopState,
  readAllStudyRecords,
  readExperimentArchive,
} from "@/lib/learning-loop";
import { getRecentStudyStorageKey } from "@/lib/study-workspace";

function findLatestExperimentCase(archive) {
  let latest = null;

  for (const records of Object.values(archive)) {
    for (const [caseId, record] of Object.entries(records || {})) {
      const time = Date.parse(record.updatedAt || record.completedAt || "") || 0;
      if (!latest || time > latest.time) {
        latest = { caseId, time, caseTitle: record.caseTitle };
      }
    }
  }

  return latest;
}

export default function HomeContinueCard({ caseIndex, copy, userSid }) {
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    const studyRecords = readAllStudyRecords(userSid);
    const archive = readExperimentArchive();
    let recentStudy = null;

    try {
      const raw = window.localStorage.getItem(getRecentStudyStorageKey(userSid));
      recentStudy = raw ? JSON.parse(raw) : null;
    } catch (_error) {
      recentStudy = null;
    }

    const latestExperiment = findLatestExperimentCase(archive);
    const caseId = recentStudy?.id || latestExperiment?.caseId;
    if (!caseId) return;

    const caseItem = caseIndex.find((item) => item.id === caseId);
    const experimentRecords = Object.fromEntries(
      Object.entries(archive)
        .filter(([, records]) => records?.[caseId])
        .map(([moduleId, records]) => [moduleId, records[caseId]]),
    );
    const loopState = deriveCaseLoopState({
      studyDraft: studyRecords[caseId],
      experimentRecords,
    });

    setRecent({
      caseId,
      title: caseItem?.title || latestExperiment?.caseTitle || caseId,
      caseNumber: caseItem?.caseNumber || "",
      ...loopState,
    });
  }, [caseIndex, userSid]);

  if (!recent) return null;

  return (
    <section className="home-continue-card" aria-label={copy.eyebrow}>
      <div className="home-continue-marker" aria-hidden="true">
        <span>{recent.studySteps}</span>
        <small>/3</small>
      </div>
      <div className="home-continue-copy">
        <span className="section-eyebrow">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <strong>{recent.title}</strong>
        {recent.caseNumber ? <small>{recent.caseNumber}</small> : null}
      </div>
      <div className="home-continue-progress">
        <span>{copy.studyProgressLabel} {recent.studySteps}/3</span>
        <span>{copy.experimentProgressLabel} {recent.experimentsDone}</span>
      </div>
      <div className="home-continue-actions">
        <Link className="btn btn-accent" href={`/cases/${recent.caseId}/study`}>
          {copy.continueLabel}
        </Link>
        <Link className="btn btn-outline" href="/archive">
          {copy.archiveLabel}
        </Link>
      </div>
    </section>
  );
}
