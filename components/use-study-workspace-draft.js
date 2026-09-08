"use client";

import { useEffect, useRef, useState } from "react";
import { createEmptyStudyDraft, getRecentStudyStorageKey, getStudyStorageKey, normalizeStudyDraft, saveStudyDraft } from "@/lib/study-workspace";
import { readLocalRecord, recordRevision, storageErrorMessage, subscribeRecords } from "@/lib/local-record";

export default function useStudyWorkspaceDraft({ caseId, userSid }) {
  const [draft, setDraft] = useState(createEmptyStudyDraft);
  const [saveInfo, setSaveInfo] = useState("正在读取本地草稿");
  const storageKey = getStudyStorageKey(userSid, caseId);
  const recentStorageKey = getRecentStudyStorageKey(userSid);
  const latest = useRef({ draft: createEmptyStudyDraft(), revision: null, dirty: false, ready: false });

  useEffect(() => {
    function load() {
      const state = readLocalRecord(storageKey);
      const next = normalizeStudyDraft(state.record);
      latest.current = { draft: next, revision: recordRevision(state.record), dirty: false, ready: state.ok };
      setDraft(next);
      setSaveInfo(state.ok ? (state.record ? "已读取本地草稿" : "输入后自动保存") : storageErrorMessage(state.errorCode));
    }
    load();
    const unsubscribe = subscribeRecords((key) => {
      if (key !== null && key !== storageKey) return;
      const state = readLocalRecord(storageKey);
      if (state.ok && recordRevision(state.record) === latest.current.revision) return;
      if (latest.current.dirty) {
        setSaveInfo(storageErrorMessage(state.ok ? "conflict" : state.errorCode));
      } else load();
    });
    return unsubscribe;
  }, [storageKey]);

  function persist() {
    const current = latest.current;
    if (!current.dirty) return;
    const result = saveStudyDraft({ storageKey, recentStorageKey, caseId, draft: current.draft, expectedRevision: current.revision });
    if (result.ok) {
      current.revision = recordRevision(result.record);
      current.dirty = false;
      setSaveInfo(`已本地保存 ${new Date(result.savedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`);
    } else setSaveInfo(storageErrorMessage(result.errorCode));
  }

  useEffect(() => {
    const flush = () => persist();
    const beforeUnload = (event) => {
      persist();
      if (latest.current.dirty) { event.preventDefault(); event.returnValue = ""; }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [storageKey, recentStorageKey, caseId]);

  function updateDraftField(field, value) {
    const next = { ...latest.current.draft, [field]: value };
    latest.current.draft = next;
    latest.current.dirty = true;
    setDraft(next);
    persist();
  }

  return { draft, saveInfo, updateDraftField };
}
