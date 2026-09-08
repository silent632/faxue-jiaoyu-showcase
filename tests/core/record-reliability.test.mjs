import test from "node:test";
import assert from "node:assert/strict";
import { saveExperimentRecord } from "../../lib/experiment-archive.js";
import { deriveCaseLoopState } from "../../lib/learning-loop.js";

test("空实验不能使三步研习形成闭环", () => {
  const state = deriveCaseLoopState({
    studyDraft: { fact: "事".repeat(50), issue: "争".repeat(50), analysis: "理".repeat(50) },
    experimentRecords: { "exp-reasoning": { output: "", selfScores: {}, completedAt: "2026-07-26T00:00:00Z" } },
  });
  assert.equal(state.experimentsDone, 0);
  assert.equal(state.closed, false);
});

test("存储拒绝写入时返回失败而非静默成功", () => {
  const storage = { getItem: () => null, setItem: () => { throw new DOMException("full", "QuotaExceededError"); } };
  globalThis.window = { localStorage: storage };
  globalThis.localStorage = storage;
  try {
    const result = saveExperimentRecord("exp-reasoning", "case-test", { output: "测试" });
    assert.equal(result?.ok, false);
    assert.equal(result?.errorCode, "quota");
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});

import { checkExperimentCompletion, isExperimentComplete } from "../../lib/experiment-completion.js";
import { EXPERIMENT_ARCHIVE_STORAGE_KEY, getAllProgress, getExperimentStorageKey, readExperimentArchive, deleteExperimentRecord } from "../../lib/experiment-archive.js";
import { LEGACY_BACKUP_PREFIX, readLocalRecord, writeLocalRecord } from "../../lib/local-record.js";
import { saveStudyDraft } from "../../lib/study-workspace.js";
import { completedRecord, validInteractions } from "../fixtures/experiment-records.mjs";

async function withStorage(run) {
  const items = new Map();
  const storage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    key: (i) => [...items.keys()][i] ?? null,
    get length() { return items.size; },
  };
  globalThis.window = { localStorage: storage };
  try { await run(storage); await Promise.resolve(); } finally { delete globalThis.window; }
}

for (const [moduleId, data] of Object.entries(validInteractions)) {
  test(`${moduleId} 只接受齐备的产出，草稿不等于完成`, () => {
    assert.equal(checkExperimentCompletion(moduleId, data).complete, true);
    assert.equal(checkExperimentCompletion(moduleId, {}).complete, false);
    assert.equal(isExperimentComplete(moduleId, completedRecord(moduleId)), true);
    assert.equal(isExperimentComplete(moduleId, completedRecord(moduleId, { status: "draft" })), false);
    const partial = structuredClone(data);
    delete partial[Object.keys(partial)[0]];
    assert.equal(checkExperimentCompletion(moduleId, partial).complete, false);
  });
}

test("首次编辑保留旧实验原文，完成后删除必要字段回到草稿", () => withStorage((storage) => {
  const legacy = JSON.stringify({ "exp-reasoning": { old: { output: "旧内容", completedAt: "2026-07-26" } } });
  storage.setItem(EXPERIMENT_ARCHIVE_STORAGE_KEY, legacy);
  assert.equal(getAllProgress()["exp-reasoning"], 0);
  const result = saveExperimentRecord("exp-reasoning", "old", { interactionData: validInteractions["exp-reasoning"] }, { complete: true });
  assert.equal(result.ok, true);
  assert.equal(getAllProgress()["exp-reasoning"], 1);
  assert.equal(storage.getItem(EXPERIMENT_ARCHIVE_STORAGE_KEY), legacy);
  const next = saveExperimentRecord("exp-reasoning", "old", { interactionData: {} }, { expectedRevision: result.record.revision });
  assert.equal(next.record.status, "draft");
  assert.equal(next.record.completedAt, result.record.completedAt);
  assert.equal(getAllProgress()["exp-reasoning"], 0);
}));

test("不同案例保存互不覆盖，过期修订号不能覆盖同案记录", () => withStorage(() => {
  const first = saveExperimentRecord("exp-reasoning", "a", { output: "甲" });
  const second = saveExperimentRecord("exp-reasoning", "b", { output: "乙" });
  assert.equal(first.ok && second.ok, true);
  const stale = saveExperimentRecord("exp-reasoning", "a", { output: "过期编辑" }, { expectedRevision: null });
  assert.equal(stale.errorCode, "conflict");
  assert.equal(readExperimentArchive()["exp-reasoning"].a.output, "甲");
  assert.equal(readExperimentArchive()["exp-reasoning"].b.output, "乙");
}));

test("损坏记录不能被新内容覆盖，也不隐藏其他完好实验", () => withStorage((storage) => {
  const key = getExperimentStorageKey("exp-reasoning", "a");
  storage.setItem(key, "broken{");
  saveExperimentRecord("exp-reasoning", "b", { output: "保留" });
  assert.equal(saveExperimentRecord("exp-reasoning", "a", { output: "替换" }).errorCode, "corrupt");
  assert.equal(storage.getItem(key), "broken{");
  assert.equal(readExperimentArchive()["exp-reasoning"].b.output, "保留");
}));

test("三步草稿立即写入且只保存一份旧版备份，备份失败不动旧值", () => withStorage((storage) => {
  const key = "study_public-showcase_a";
  const original = JSON.stringify({ fact: "旧事实", ts: 1 });
  storage.setItem(key, original);
  const first = saveStudyDraft({ storageKey: key, recentStorageKey: "recent", caseId: "a", draft: { fact: "新事实" } });
  assert.equal(first.ok, true);
  assert.equal(readLocalRecord(key).record.fact, "新事实");
  assert.equal(storage.getItem(`${LEGACY_BACKUP_PREFIX}${key}`), original);
  const next = saveStudyDraft({ storageKey: key, recentStorageKey: "recent", caseId: "a", draft: { fact: "再修改" }, expectedRevision: first.record.revision });
  assert.equal(next.ok, true);
  assert.equal(storage.getItem(`${LEGACY_BACKUP_PREFIX}${key}`), original);
  storage.setItem("old", original);
  const setItem = storage.setItem;
  storage.setItem = (k, v) => { if (k.startsWith(LEGACY_BACKUP_PREFIX)) throw new DOMException("full", "QuotaExceededError"); setItem(k, v); };
  assert.equal(writeLocalRecord("old", { fact: "覆盖" }).ok, false);
  assert.equal(storage.getItem("old"), original);
}));

test("删除已迁移实验不会使原始旧记录重新出现", () => withStorage((storage) => {
  storage.setItem(EXPERIMENT_ARCHIVE_STORAGE_KEY, JSON.stringify({ "exp-reasoning": { a: completedRecord() } }));
  assert.equal(deleteExperimentRecord("exp-reasoning", "a").ok, true);
  assert.equal(readExperimentArchive()["exp-reasoning"].a, undefined);
  assert.notEqual(storage.getItem(EXPERIMENT_ARCHIVE_STORAGE_KEY), null);
}));
