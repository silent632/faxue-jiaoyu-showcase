import { deriveCaseLoopState } from './learning-loop.js';
import { isExperimentComplete } from './experiment-completion.js';
export function deriveCourseTaskState(task, studies = {}, archive = {}) {
  const record = archive[task.moduleId]?.[task.caseId];
  const studyDone = deriveCaseLoopState({ studyDraft: studies[task.caseId] }).studyDone;
  const experimentDone = isExperimentComplete(task.moduleId, record) && Boolean(record.initialDraft && record.feedbackReference?.version === task.rubricVersion && record.revisionNoteConfirmed && record.revisionNote?.trim());
  const currentVersion = record?.courseTask?.version === task.version;
  return { studyDone, experimentDone, complete: studyDone && experimentDone && currentVersion,
    hasHistory: Boolean(record?.courseTask && !currentVersion),
    href: !studyDone ? `/cases/${task.caseId}/study/` : `/experiments/${task.moduleId}/?case=${task.caseId}` };
}
