"use client";

import { useEffect, useState } from "react";

import StudyWorkspaceActions from "@/components/study-workspace-actions";
import StudyWorkspaceOverview from "@/components/study-workspace-overview";
import StudyWorkspaceStepCard from "@/components/study-workspace-step-card";
import useStudyWorkspaceDraft from "@/components/use-study-workspace-draft";
import {
  STUDY_STEP_DEFINITIONS,
  exportStudyReport,
  getStudyWorkspaceMetrics,
} from "@/lib/study-workspace";

export default function StudyWorkspace({ caseItem, userSid, hasPdf = true, mode = "split" }) {
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

      {STUDY_STEP_DEFINITIONS.map((step) => (
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
      ))}

      <StudyWorkspaceActions
        hasPdf={hasPdf}
        mode={mode}
        exporting={exporting}
        exportFeedback={exportFeedback}
        onExport={handleExport}
      />
    </div>
  );
}
