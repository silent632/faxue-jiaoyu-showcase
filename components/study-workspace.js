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
  submitStudyWorkspace,
} from "@/lib/study-workspace";

export default function StudyWorkspace({ caseItem, userSid }) {
  const { draft, saveInfo, updateDraftField } = useStudyWorkspaceDraft({ caseId: caseItem.id, userSid });
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [exportFeedback, setExportFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [visibleRefs, setVisibleRefs] = useState({
    fact: false,
    issue: false,
    analysis: false,
  });
  const metrics = getStudyWorkspaceMetrics({ caseItem, draft });

  useEffect(() => {
    setVisibleRefs({
      fact: false,
      issue: false,
      analysis: false,
    });
    setSubmitFeedback(null);
    setExportFeedback(null);
  }, [caseItem.id]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitFeedback(null);
    try {
      const result = await submitStudyWorkspace({ caseItem, draft });
      setSubmitFeedback(result);
    } finally {
      setSubmitting(false);
    }
  }

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
    <div className="study-workspace-shell">
      <StudyWorkspaceOverview
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
        exporting={exporting}
        submitting={submitting}
        exportFeedback={exportFeedback}
        submitFeedback={submitFeedback}
        onExport={handleExport}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
