import { caseRubrics } from "../../lib/case-rubrics.js";
import test from "node:test";
import assert from "node:assert/strict";
import { commitArchiveImport, parseArchiveImport, previewArchiveImport, readImportAlternatives, MAX_IMPORT_BYTES } from "../../lib/archive-import.js";
import { IMPORT_VAULT_KEY, readLocalRecord } from "../../lib/local-record.js";
import { getStudyStorageKey, saveStudyDraft } from "../../lib/study-workspace.js";
import { readAllStudyRecords } from "../../lib/learning-loop.js";
import { getAllProgress, getExperimentStorageKey, loadExperimentRecord, saveExperimentRecord } from "../../lib/experiment-archive.js";
import { completedRecord, validInteractions } from "../fixtures/experiment-records.mjs";

const sid = "public-showcase";
const caseId = "case-0001";
const studyKey = getStudyStorageKey(sid, caseId);
const options = { userSid: sid, knownCaseIds: [caseId] };
const locks = { request: async (_name, run) => run() };
const backup = (fact = "待恢复事实") => ({ version: 1, studyRecords: { [caseId]: { fact, issue: "争议", analysis: "分析", ts: 1 } }, experimentArchive: { "exp-reasoning": { [caseId]: completedRecord("exp-reasoning") } } });
const plan = (value) => previewArchiveImport(parseArchiveImport(JSON.stringify(value)), options);

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
  try { await run(storage, items); await Promise.resolve(); } finally { delete globalThis.window; }
}

test("旧版备份整批恢复后能读取、继续编辑和统计，重复导入不重复写入", () => withStorage(async (storage) => {
  const preview = plan(backup());
  assert.deepEqual(preview.counts, { new: 2, duplicate: 0, conflict: 0, unknown: 0 });
  assert.equal((await commitArchiveImport(preview, locks)).ok, true);
  assert.equal(readAllStudyRecords(sid)[caseId].fact, "待恢复事实");
  assert.equal(loadExperimentRecord("exp-reasoning", caseId).status, "completed");
  assert.equal(getAllProgress()["exp-reasoning"], 1);
  const raw = storage.getItem(IMPORT_VAULT_KEY);
  assert.equal(plan(backup()).counts.duplicate, 2);
  await commitArchiveImport(plan(backup()), locks);
  assert.equal(storage.getItem(IMPORT_VAULT_KEY), raw);
  const current = readLocalRecord(studyKey);
  assert.equal(saveStudyDraft({ storageKey: studyKey, draft: { ...current.record, fact: "恢复后修改" }, expectedRevision: JSON.stringify(current.record) }).ok, true);
  assert.equal(readAllStudyRecords(sid)[caseId].fact, "恢复后修改");
  assert.equal(readImportAlternatives(sid)[0].record.fact, "待恢复事实");
  assert.equal(plan(backup()).counts.duplicate, 2, "导入原版已在快照中保留，修改后再导入也不增加同内容副本");
  const experiment = loadExperimentRecord("exp-reasoning", caseId);
  assert.equal(saveExperimentRecord("exp-reasoning", caseId, { ...experiment, interactionData: validInteractions["exp-reasoning"] }).ok, true);
}));

test("冲突默认保留本地主记录和可恢复的导入副本", () => withStorage(async (storage) => {
  const original = JSON.stringify({ fact: "本地原稿", issue: "", analysis: "" });
  storage.setItem(studyKey, original);
  const preview = plan(backup());
  assert.equal(preview.counts.conflict, 1);
  assert.equal((await commitArchiveImport(preview, locks)).ok, true);
  assert.equal(storage.getItem(studyKey), original);
  assert.equal(readImportAlternatives(sid)[0].record.fact, "待恢复事实");
  const repeat = plan(backup());
  assert.equal(repeat.counts.duplicate, 2);
}));

test("容量不足整批不生效，已有数据和导入快照逐字不变", () => withStorage(async (storage, items) => {
  await commitArchiveImport(plan(backup()), locks);
  const before = [...items];
  const preview = plan(backup("另一个版本"));
  storage.setItem = () => { throw new DOMException("full", "QuotaExceededError"); };
  const result = await commitArchiveImport(preview, locks);
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "quota");
  assert.deepEqual([...items], before);
  assert.equal(readImportAlternatives(sid).length, 0);
}));

test("预览后本地改变须刷新预览，缺少并发锁不写入", () => withStorage(async (storage) => {
  const preview = plan(backup());
  storage.setItem(studyKey, JSON.stringify({ fact: "其他页面更新", issue: "", analysis: "" }));
  const result = await commitArchiveImport(preview, locks);
  assert.equal(result.errorCode, "conflict");
  assert.equal(result.preview.counts.conflict, 1);
  assert.equal(storage.getItem(IMPORT_VAULT_KEY), null);
  assert.equal((await commitArchiveImport(result.preview, {})).errorCode, "unsupported");
}));

test("损坏本地单条不被导入覆盖，未知案例仍保留内容", () => withStorage(async (storage) => {
  storage.setItem(studyKey, "{broken");
  const value = backup();
  value.studyRecords["retired-case"] = { fact: "旧案例文本" };
  const preview = plan(value);
  assert.equal(preview.counts.unknown, 1);
  assert.equal(preview.counts.conflict, 1);
  await commitArchiveImport(preview, locks);
  assert.equal(storage.getItem(studyKey), "{broken");
  assert.equal(readAllStudyRecords(sid)["retired-case"].fact, "旧案例文本");
}));

test("损坏 JSON、未知版本、非法类型、危险字段及超大文件拒绝导入", () => {
  assert.throws(() => parseArchiveImport("{"), /有效的 JSON/);
  assert.throws(() => parseArchiveImport(JSON.stringify({ ...backup(), version: 9 })), /版本不兼容/);
  assert.throws(() => parseArchiveImport('{"version":1,"studyRecords":{"__proto__":{}},"experimentArchive":{}}'), /字段名/);
  const value = backup(); value.studyRecords[caseId].fact = 99;
  assert.throws(() => parseArchiveImport(JSON.stringify(value)), /必须是文本/);
  assert.throws(() => parseArchiveImport(" ".repeat(MAX_IMPORT_BYTES + 1)), /2 MB/);
  value.studyRecords[caseId].fact = "正常文本";
  value.studyRecords[caseId].version = 3;
  assert.throws(() => parseArchiveImport(JSON.stringify(value)), /记录版本不兼容/);
});

test("旧版空实验仍为草稿，携带副本的新版备份重复导入保持幂等", () => withStorage(async () => {
  const value = backup();
  value.version = 2;
  value.experimentArchive["exp-reasoning"][caseId] = { output: "", completedAt: "2026-01-01" };
  value.alternatives = [{ kind: "study", caseId, record: { fact: "不同副本", issue: "", analysis: "" } }];
  await commitArchiveImport(plan(value), locks);
  assert.equal(getAllProgress()["exp-reasoning"], 0);
  assert.equal(plan(value).counts.duplicate, 3);
  assert.equal(readImportAlternatives(sid).length, 1);
  assert.equal(readLocalRecord(getExperimentStorageKey("exp-reasoning", caseId)).record.status, "draft");
}));

test("六模块产出均可导入，不能把会使输入界面崩溃的类型写入", () => {
  for (const [moduleId, data] of Object.entries(validInteractions)) {
    const value = { version: 2, studyRecords: {}, experimentArchive: { [moduleId]: { [caseId]: { output: "草稿", interactionData: data } } } };
    assert.equal(parseArchiveImport(JSON.stringify(value)).length, 1);
  }
  for (const data of [{ plaintiff: {} }, { selected: [{}] }, { usedChips: {} }, { columns: { literal: [] } }, { annotations: [null] }, { slider: "abc" }]) {
    const value = { version: 2, studyRecords: {}, experimentArchive: { "exp-reasoning": { [caseId]: { interactionData: data } } } };
    assert.throws(() => parseArchiveImport(JSON.stringify(value)), /必须|格式|位置/);
  }
});

test("规范旧选择字段必须是文本列表，拒绝导致恢复界面崩溃的值", () => {
  const value = { version: 2, studyRecords: {}, experimentArchive: { 'exp-norm-retrieval': { [caseId]: completedRecord('exp-norm-retrieval') } } };
  value.experimentArchive['exp-norm-retrieval'][caseId].interactionData.legacySelection = {};
  assert.throws(() => plan(value), /legacySelection/);
});

test('原文快照和历史批注可以导入恢复，历史字段格式错误时拒绝', () => withStorage(async () => {
  const record = completedRecord('exp-annotation');
  record.interactionData.historicalAnnotations = [{ annotations: [{ paraIndex: 0, tagId: 'major-premise' }], evaluation: '旧评价' }];
  const value = { version: 2, studyRecords: {}, experimentArchive: { 'exp-annotation': { [caseId]: record } } };
  await commitArchiveImport(plan(value), locks);
  const loaded = loadExperimentRecord('exp-annotation', caseId);
  assert.deepEqual(loaded.interactionData, record.interactionData);
  assert.equal(loaded.status, 'completed');
  record.interactionData.historicalAnnotations = {};
  assert.throws(() => plan(value), /历史批注/);
}));

test('初稿、修订稿和说明可以完整导入，畸形初稿拒绝导入', () => withStorage(async () => {
  const record = completedRecord();
  record.output = '修订后的产出';
  record.initialDraft = { output: '最初的产出', interactionData: structuredClone(record.interactionData), capturedAt: '2026-09-07T00:00:00Z' };
  record.revisionNote = '补充事实对应';
  record.revisionNoteConfirmed = true;
  record.workflowStage = 'eval';
  const value = { version: 2, studyRecords: {}, experimentArchive: { 'exp-reasoning': { [caseId]: record } } };
  await commitArchiveImport(plan(value), locks);
  const restored = loadExperimentRecord('exp-reasoning', caseId);
  assert.deepEqual(restored.initialDraft, record.initialDraft);
  assert.equal(restored.revisionNote, record.revisionNote);
  assert.equal(restored.status, 'completed');
  record.initialDraft.output = {};
  assert.throws(() => plan(value), /初稿格式/);
}));

test('量规快照随学习记录导入，关联其他案例或缺失原文的快照拒绝', () => withStorage(async () => {
  const id = 'case-0030';
  const record = completedRecord();
  record.feedbackReference = structuredClone(caseRubrics[id]);
  record.revisionNote = '核对第18页后保留责任基础的判断。';
  record.revisionNoteConfirmed = true;
  const value = { version: 2, studyRecords: {}, experimentArchive: { 'exp-reasoning': { [id]: record } } };
  await commitArchiveImport(plan(value), locks);
  assert.deepEqual(loadExperimentRecord('exp-reasoning', id).feedbackReference, record.feedbackReference);
  record.feedbackReference.evidence = [];
  assert.throws(() => plan(value), /量规快照/);
}));
