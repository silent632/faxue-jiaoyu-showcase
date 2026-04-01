"use client";

import { useEffect, useRef, useState } from "react";
import {
  STUDY_AUTOSAVE_INTERVAL_MS,
  createEmptyStudyDraft,
  getRecentStudyStorageKey,
  getStudyStorageKey,
  readStudyDraft,
  saveStudyDraft,
  serializeStudyDraft,
} from "@/lib/study-workspace";

export default function useStudyWorkspaceDraft({ caseId, userSid }) {
  const [draft, setDraft] = useState(createEmptyStudyDraft);
  const [saveInfo, setSaveInfo] = useState("草稿尚未保存");
  const storageKey = getStudyStorageKey(userSid, caseId);
  const recentStorageKey = getRecentStudyStorageKey(userSid);
  const lastSavedDraftRef = useRef(serializeStudyDraft(createEmptyStudyDraft()));

  useEffect(() => {
    const emptyDraft = createEmptyStudyDraft();
    setDraft(emptyDraft);
    setSaveInfo("草稿尚未保存");
    lastSavedDraftRef.current = serializeStudyDraft(emptyDraft);

    const loadedDraft = readStudyDraft(storageKey);
    if (!loadedDraft) return;

    setDraft(loadedDraft);
    setSaveInfo("已读取本地草稿");
    lastSavedDraftRef.current = serializeStudyDraft(loadedDraft);
  }, [storageKey]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const serializedDraft = serializeStudyDraft(draft);
      if (serializedDraft === lastSavedDraftRef.current) return;

      const didSave = saveStudyDraft({ storageKey, recentStorageKey, caseId, draft });
      if (!didSave) {
        setSaveInfo("本地保存失败，请稍后重试");
        return;
      }

      lastSavedDraftRef.current = serializedDraft;
      setSaveInfo(`已本地保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
    }, STUDY_AUTOSAVE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [caseId, draft, recentStorageKey, storageKey]);

  function updateDraftField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return {
    draft,
    saveInfo,
    updateDraftField,
  };
}
