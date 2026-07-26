"use client";

import { useEffect, useState } from "react";

import {
  deriveCaseLoopState,
  readAllStudyRecords,
  readExperimentArchive,
} from "@/lib/learning-loop";

export default function CaseLoopProgress({ caseId, userSid, copy }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const studyRecords = readAllStudyRecords(userSid);
    const archive = readExperimentArchive();
    const experimentRecords = Object.fromEntries(
      Object.entries(archive)
        .filter(([, records]) => records?.[caseId])
        .map(([moduleId, records]) => [moduleId, records[caseId]]),
    );
    const nextState = deriveCaseLoopState({
      studyDraft: studyRecords[caseId],
      experimentRecords,
    });

    if (nextState.studySteps > 0 || nextState.experimentsDone > 0) {
      setState(nextState);
    }
  }, [caseId, userSid]);

  if (!state) return null;

  return (
    <div className="case-loop-progress" aria-label="本地学习进度">
      <span>{copy.studyLabel} {state.studySteps}/3</span>
      <span>{copy.experimentLabel} {state.experimentsDone}</span>
      {state.closed ? <strong>{copy.closedLabel}</strong> : null}
    </div>
  );
}
