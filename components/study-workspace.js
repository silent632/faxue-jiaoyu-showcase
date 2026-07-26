"use client";

import { useEffect, useState } from "react";

import StudyWorkspaceActions from "@/components/study-workspace-actions";
import StudyWorkspaceOverview from "@/components/study-workspace-overview";
import StudyWorkspaceStepCard from "@/components/study-workspace-step-card";
import useStudyWorkspaceDraft from "@/components/use-study-workspace-draft";
import {
  STUDY_STEP_DEFINITIONS,
  STUDY_STEP_MIN_CHARS,
  charLen,
  exportStudyReport,
  getStudyWorkspaceMetrics,
} from "@/lib/study-workspace";

export default function StudyWorkspace({
  caseItem,
  userSid,
  hasPdf = true,
  mode = "split",
  recommendedModules = [],
  loopCopy,
}) {
  const { draft, saveInfo, updateDraftField } = useStudyWorkspaceDraft({ caseId: caseItem.id, userSid });
  const [exportFeedback, setExportFeedback] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [visibleRefs, setVisibleRefs] = useState({
    fact: false,
    issue: false,
    analysis: false,
  });
  const metrics = getStudyWorkspaceMetrics({ caseItem, draft, hasPdf });

  useEffect(() => {
    setVisibleRefs({
      fact: false,
      issue: false,
      analysis: false,
    });
    setExportFeedback(null);
  }, [caseItem.id]);

  async function handleExport() {
    setExporting(true);
    setExportFeedback(null);
    try {
      const result = await exportStudyReport({ caseItem, draft });
      setExportFeedback(result);
    } finally {
      setExporting(false);
    }
  }

  function toggleRef(field) {
    setVisibleRefs((current) => ({ ...current, [field]: !current[field] }));
  }

  return (
    <div className={`study-workspace-shell study-workspace-shell-${mode}`}>
      <StudyWorkspaceOverview
        hasPdf={hasPdf}
        mode={mode}
        saveInfo={saveInfo}
        doneCount={metrics.doneCount}
        totalChars={metrics.totalChars}
        availableRefCount={metrics.availableRefCount}
        completionText={metrics.completionText}
        actionLabel={metrics.actionLabel}
      />

      {STUDY_STEP_DEFINITIONS.map((step, index) => {
        // 递进锁定：上一步写满最低字数（或本步已有内容）才解锁本步
        const prevStep = index > 0 ? STUDY_STEP_DEFINITIONS[index - 1] : null;
        const prevDone = !prevStep || charLen(draft[prevStep.field]) >= STUDY_STEP_MIN_CHARS;
        const hasOwnContent = charLen(draft[step.field]) > 0;

        if (!prevDone && !hasOwnContent) {
          return (
            <div key={step.field} className="exp-ws3-stage-locked">
              <span className="exp-ws3-lock-num">{step.idx}</span>
              <span>{step.title} · 完成上一步（写满 {STUDY_STEP_MIN_CHARS} 字）后解锁</span>
            </div>
          );
        }

        return (
          <StudyWorkspaceStepCard
            key={step.field}
            idx={step.idx}
            title={step.title}
            prompt={step.prompt}
            value={draft[step.field]}
            onChange={(value) => updateDraftField(step.field, value)}
            showRef={visibleRefs[step.field]}
            onToggleRef={() => toggleRef(step.field)}
            refText={caseItem[step.refKey]}
          />
        );
      })}

      <StudyWorkspaceActions
        caseId={caseItem.id}
        hasPdf={hasPdf}
        mode={mode}
        doneCount={metrics.doneCount}
        recommendedModules={recommendedModules}
        copy={loopCopy?.studyNext}
        exporting={exporting}
        exportFeedback={exportFeedback}
        onExport={handleExport}
      />
    </div>
  );
}
