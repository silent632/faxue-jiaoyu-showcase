import test from 'node:test';
import assert from 'node:assert/strict';
import { createReviewPatch, hasExperimentRevision, checkRevisionCompletion } from '../../lib/experiment-revision.js';
import { isExperimentComplete } from '../../lib/experiment-completion.js';
import { completedRecord } from '../fixtures/experiment-records.mjs';

test('首次对照冻结完整初稿，再次进入不会覆盖，也不共享可变引用', () => {
  const record = { output: '初稿', interactionData: { reason: '原始理由' } };
  const patch = createReviewPatch(record, '2026-09-07T00:00:00Z');
  record.interactionData.reason = '修改理由';
  assert.equal(patch.initialDraft.interactionData.reason, '原始理由');
  assert.deepEqual(createReviewPatch({ ...record, ...patch }).initialDraft, patch.initialDraft);
});
test('只改评分或键顺序不算改稿；实际改稿必须确认修改说明', () => {
  const record = { output: '原产出', interactionData: { a: '1', b: '2' } };
  Object.assign(record, createReviewPatch(record));
  assert.equal(hasExperimentRevision({ ...record, interactionData: { b: '2', a: '1' }, selfScores: { a: 4 } }), false);
  const changed = { ...record, output: '修改后的产出' };
  assert.equal(checkRevisionCompletion(changed).complete, false);
  assert.equal(checkRevisionCompletion({ ...changed, revisionNote: '说明依据', revisionNoteConfirmed: true }).complete, true);
  assert.equal(checkRevisionCompletion({ ...changed, revisionNote: '说明依据', revisionNoteConfirmed: false }).complete, false);
});
test('完成计数排除缺少修订说明的修改稿，但不改写旧记录的完成契约', () => {
  const old = completedRecord();
  assert.equal(isExperimentComplete('exp-reasoning', old), true);
  const reviewed = { ...old, ...createReviewPatch(old) };
  reviewed.interactionData = { ...reviewed.interactionData, conclusion: '修订后的结论' };
  assert.equal(isExperimentComplete('exp-reasoning', reviewed), false);
  assert.equal(isExperimentComplete('exp-reasoning', { ...reviewed, revisionNote: '依据材料更正了结论', revisionNoteConfirmed: true }), true);
});
