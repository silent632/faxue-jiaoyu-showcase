"use client";

import { deriveCourseTaskState } from "../lib/course-tasks.js";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  deriveCaseLoopState,
  getLearningActivities,
  readAllStudyRecords,
  readExperimentArchive,
} from "@/lib/learning-loop";
import { subscribeRecords } from "@/lib/local-record";

export default function HomeContinueCard({ caseIndex, copy, userSid, courseTasks = [] }) {
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    const refresh = () => {
    const studyRecords = readAllStudyRecords(userSid);
    const archive = readExperimentArchive();
    const activities = getLearningActivities(studyRecords, archive).filter((task) => caseIndex.some((item) => item.id === task.caseId));
    const latest = activities.find((task) => !task.complete) || activities[0];
    if (latest?.complete) {
      for (const activity of activities) {
        const records = Object.fromEntries(Object.entries(archive).filter(([, values]) => values?.[activity.caseId]).map(([key, values]) => [key, values[activity.caseId]]));
        const state = deriveCaseLoopState({ studyDraft: studyRecords[activity.caseId], experimentRecords: records });
        if (!state.studyDone || !state.experimentsDone) {
          const item = caseIndex.find(item => item.id === activity.caseId);
          setRecent({ ...state, caseId: activity.caseId, title: item.title, href: !state.studyDone ? `/cases/${activity.caseId}/study/` : `/cases/${activity.caseId}/`, caseNumber: item.caseNumber });
          return;
        }
      }
    }
    if (!latest) { setRecent(null); return; }
    if (latest.complete) {
      const pending = courseTasks.map(task => ({ task, state: deriveCourseTaskState(task, studyRecords, archive) })).find(item => !item.state.complete);
      if (pending) { setRecent({ caseId: pending.task.caseId, title: pending.task.title, href: `/courses/${pending.task.slug}/`, studySteps: pending.state.studyDone ? 3 : 0, experimentsDone: pending.state.experimentDone ? 1 : 0, fromCourse: true }); return; }
    }
    const caseId = latest.caseId;
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
      title: caseItem?.title || caseId,
      href: latest.kind === "experiment" ? `/experiments/${latest.moduleId}?case=${caseId}` : `/cases/${caseId}/study`,
      caseNumber: caseItem?.caseNumber || "",
      ...loopState,
    });
    };
    refresh();
    return subscribeRecords(refresh);
  }, [caseIndex, userSid, courseTasks]);

  if (!recent) return (
    <section className="home-continue-card" aria-label="开始学习">
      <div className="home-continue-copy">
        <h2>开始研习</h2>
        <p>跟着一期课程做练习，或挑一件感兴趣的案例。</p>
      </div>
      <div className="home-continue-actions">
        <Link className="btn btn-accent" href="/courses/">选择课程</Link>
        <Link className="btn btn-outline" href="/cases/">查找案例</Link>
      </div>
    </section>
  );

  return (
    <section className="home-continue-card" aria-label={copy.eyebrow}>
      <div className="home-continue-copy">

        <h2>{recent.fromCourse && !recent.studySteps && !recent.experimentsDone ? "从课程开始" : "继续研习"}</h2>
        <strong>{recent.title}</strong>
        {recent.caseNumber ? <small>{recent.caseNumber}</small> : null}
        <div className="home-continue-progress">
          <span>{copy.studyProgressLabel} {recent.studySteps}/3</span>
          <span>{copy.experimentProgressLabel} {recent.experimentsDone}</span>
        </div>
      </div>
      <div className="home-continue-actions">
        <Link className="btn btn-accent" href={recent.href}>
          {recent.fromCourse ? "进入本期课程" : copy.continueLabel}
        </Link>
        <Link className="btn btn-outline" href="/archive">
          {copy.archiveLabel}
        </Link>
      </div>
    </section>
  );
}
