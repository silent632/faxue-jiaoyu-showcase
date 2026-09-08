"use client";

import { getCaseRubric } from "../lib/case-rubrics.js";
import { useEffect, useRef, useState } from "react";
import { getExperimentStorageKey, readExperimentRecordState, saveExperimentRecord } from "@/lib/experiment-archive";
import { createReviewPatch, checkRevisionCompletion } from "../lib/experiment-revision.js";
import { checkExperimentCompletion, isExperimentComplete } from "@/lib/experiment-completion";
import { recordRevision, storageErrorMessage, subscribeRecords } from "@/lib/local-record";

export default function useExperimentDraft(mod, caseItem) {
  const [record, setRecord] = useState({ output: "", selfScores: {}, interactionData: null });
  const [saveInfo, setSaveInfo] = useState("正在读取本地记录");
  const [restoreKey, setRestoreKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState("task");
  const [failed, setFailed] = useState(false);
  const current = useRef({ record: {}, revision: null, dirty: false });
  const key = getExperimentStorageKey(mod.id, caseItem.id);

  function load() {
    const state = readExperimentRecordState(mod.id, caseItem.id);
    if (!state.ok) { setSaveInfo(storageErrorMessage(state.errorCode)); setFailed(true); return; }
    const next = state.record?.deleted ? {} : state.record || {};
    current.current = { record: next, revision: recordRevision(state.record), dirty: false };
    setRecord(next);
    setLoaded(Boolean(state.record && !state.record.deleted));
    setStage(isExperimentComplete(mod.id, next) ? "eval" : checkExperimentCompletion(mod.id, next.interactionData).complete && next.initialDraft && ["review", "eval"].includes(next.workflowStage) ? next.workflowStage : "task");
    setRestoreKey((value) => value + 1);
    setSaveInfo(state.record ? "已读取本地记录" : "输入后自动保存草稿");
    setFailed(false);
  }

  useEffect(() => {
    load();
    return subscribeRecords((changedKey) => {
      if (changedKey !== null && changedKey !== key && changedKey !== "faxue-experiment-archive") return;
      const state = readExperimentRecordState(mod.id, caseItem.id);
      if (state.ok && recordRevision(state.record) === current.current.revision) return;
      if (current.current.dirty) {
        setSaveInfo(storageErrorMessage(state.ok ? "conflict" : state.errorCode));
        setFailed(true);
      } else load();
    });
  }, [key]);

  function persist(patch = {}, complete = false) {
    const next = { ...current.current.record, ...patch, caseTitle: caseItem.title, dimensionCount: mod.selfEvaluation?.dimensions?.length || 0 };
    current.current.record = next;
    current.current.dirty = true;
    const result = saveExperimentRecord(mod.id, caseItem.id, next, { expectedRevision: current.current.revision, complete });
    if (result.ok) {
      current.current = { record: result.record, revision: result.record.revision, dirty: false };
      setRecord(result.record);
      setFailed(false);
      setSaveInfo(result.record.status === "completed" ? "本次实验已完成并保存" : "草稿已本地保存");
    } else {
      setRecord(next);
      setFailed(true);
      setSaveInfo(result.errorCode === "incomplete" ? `请补充：${result.missing.join("、")}` : storageErrorMessage(result.errorCode));
    }
    return result;
  }

  useEffect(() => {
    const flush = () => { if (current.current.dirty) persist(); };
    const beforeUnload = (event) => {
      flush();
      if (current.current.dirty) { event.preventDefault(); event.returnValue = ""; }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [key]);

  function exportCurrent() {
    const data = { version: 1, exportedAt: new Date().toISOString(), studyRecords: {}, experimentArchive: { [mod.id]: { [caseItem.id]: current.current.record } } };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${caseItem.id}-${mod.id}-实验记录.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    output: record.output || "", selfScores: record.selfScores || {}, interactionData: record.interactionData || null,
    saved: !failed && isExperimentComplete(mod.id, record), loaded, stage, setStage, restoreKey, saveInfo, failed,
    hasUnsavedWork: current.current.dirty,
    reviewRubric: record.feedbackReference || getCaseRubric(caseItem.id, mod.id),
    initialDraft: record.initialDraft || null, revisionNote: record.revisionNote || "",
    revisionCheck: checkRevisionCompletion(record),
    enterReview: () => {
      if (!checkExperimentCompletion(mod.id, current.current.record.interactionData).complete) return false;
      const result = persist({ ...createReviewPatch(current.current.record), ...(getCaseRubric(caseItem.id, mod.id) ? { feedbackReference: current.current.record.feedbackReference || getCaseRubric(caseItem.id, mod.id) } : {}) });
      if (result.ok) setStage("review");
      return result.ok;
    },
    enterEvaluation: () => {
      const result = persist({ workflowStage: "eval" });
      if (result.ok) setStage("eval");
      return result.ok;
    },
    handleRevisionNoteChange: (revisionNote) => persist({ revisionNote, revisionNoteConfirmed: true }),
    handleOutputChange: (output, interactionData) => persist({ output, interactionData, revisionNoteConfirmed: false }),
    handleScoreChange: (id, value) => persist({ selfScores: { ...current.current.record.selfScores, [id]: value } }),
    handleSaveDraft: () => persist(), handleSave: () => {
      const contract = mod.courseTasks?.[caseItem.id];
      const previous = current.current.record.courseTask;
      const history = current.current.record.courseTaskHistory || [];
      return persist(contract ? { courseTask: contract, courseTaskHistory: previous && previous.version !== contract.version ? [...history, { ...previous, completedAt: current.current.record.completedAt || null }] : history } : {}, true);
    }, exportCurrent,
  };
}
