"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LearningContextLink from "@/components/learning-context-link";

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
  allowedTopics,
  fullText = false,
}) {
  const { draft, saveInfo, updateDraftField } = useStudyWorkspaceDraft({ caseId: caseItem.id, userSid });
  const [exportFeedback, setExportFeedback] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [visibleRefs, setVisibleRefs] = useState({
    fact: false,
    issue: false,
    analysis: false,
  });
  const stepKey = `study-step:${userSid}:${caseItem.id}`;
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    if (!fullText) return;
    try {
      const remembered = Number(window.localStorage.getItem(stepKey));
      if (Number.isInteger(remembered) && STUDY_STEP_DEFINITIONS[remembered]) setStepIndex(remembered);
    } catch { /* 草稿仍可使用 */ }
  }, [fullText, stepKey]);

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

  if (fullText) {
    const step = STUDY_STEP_DEFINITIONS[stepIndex];
    const labels = ["事实梳理", "争议焦点", "法理分析"];
    const prompts = caseItem.id === "case-0012" ? [
      "从文书里找出签约、付款和产权登记的经过，记下约定面积、登记面积与差额。",
      "分别写出买受人和开发商主张的结算办法，并指出各自依据的合同条款。",
      "结合合同条款和相关规范说明你会如何结算，并用裁判原文核对自己的理由。",
    ] : STUDY_STEP_DEFINITIONS.map(item => item.prompt);
    return (
      <div className="pilot-writing">
        <header className="pilot-section-heading">
          <h2>研习笔记</h2>
          <span role="status">{saveInfo}</span>
        </header>
        <div className="pilot-steps" role="group" aria-label="研习步骤">
          {labels.map((label, index) => (
            <button type="button" key={label} aria-pressed={index === stepIndex} onClick={() => {
              setStepIndex(index);
              try { window.localStorage.setItem(stepKey, String(index)); } catch { /* 仍可切换步骤 */ }
            }}>{index + 1}. {label}</button>
          ))}
        </div>
        <section className="pilot-write-step" aria-labelledby="pilot-step-label">
          <label id="pilot-step-label" htmlFor="pilot-step-input">{labels[stepIndex]}</label>
          <p id="pilot-step-prompt">{prompts[stepIndex]}</p>
          <textarea id="pilot-step-input" className="input" value={draft[step.field]} aria-describedby="pilot-step-prompt"
            onChange={(event) => updateDraftField(step.field, event.target.value)} />
          {caseItem[step.refKey] && charLen(draft[step.field]) >= STUDY_STEP_MIN_CHARS &&
            <button className="btn btn-outline" type="button" aria-expanded={visibleRefs[step.field]}
              onClick={() => toggleRef(step.field)}>{visibleRefs[step.field] ? "收起参考要点" : "查看参考要点"}</button>}
          {visibleRefs[step.field] && charLen(draft[step.field]) >= STUDY_STEP_MIN_CHARS &&
            <p className="pilot-reference">{caseItem[step.refKey]}</p>}
        </section>
        <footer className="pilot-actions">
          <Link href="/archive/">查看研习档案 →</Link>
          <button className="btn btn-outline" type="button" disabled={exporting || !metrics.totalChars}
            onClick={handleExport}>导出研习笔记</button>
          {exportFeedback?.message && <p role="status">{exportFeedback.message}</p>}
        </footer>
        {metrics.doneCount === 3 && recommendedModules.length > 0 && (
          <details className="pilot-practice">
            <summary>继续练习</summary>
            <ul>{recommendedModules.map(item => <li key={item.id}>
              <LearningContextLink carrySource href={`/experiments/${item.id}/?case=${caseItem.id}`}>{item.shortName}</LearningContextLink>
            </li>)}</ul>
          </details>
        )}
      </div>
    );
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
        allowedTopics={allowedTopics}
        copy={loopCopy?.studyNext}
        exporting={exporting}
        exportFeedback={exportFeedback}
        onExport={handleExport}
      />
    </div>
  );
}
