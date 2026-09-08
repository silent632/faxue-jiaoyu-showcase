import test from 'node:test';
import assert from 'node:assert/strict';
import { annotationTasks, createAnnotation, isAnnotationCurrent, restoreAnnotationDraft } from '../../lib/annotation.js';
import { annotationSourceVersion, validateRepositoryAnnotationEvidence } from '../../lib/content/annotation-evidence.js';
import { checkExperimentCompletion } from '../../lib/experiment-completion.js';
const caseId = 'case-0001';
const task = annotationTasks[caseId];
const valid = { caseId, sourceVersion: task.sourceVersion, annotations: [createAnnotation(task.paragraphs[0], 'major-premise')], evaluation: '结合事实和规范检查推理。' };

test('原文批注具备来源、段落与评价时才能完成', () => {
  assert.equal(checkExperimentCompletion('exp-annotation', valid).complete, true);
  for (const patch of [{ caseId: 'constructor', sourceVersion: undefined }, { sourceVersion: 'old' }, { caseId: 'case-0002' }, { annotations: [] }, { annotations: [{ paraIndex: 0, tagId: 'major-premise' }] }, { annotations: [{ ...valid.annotations[0], text: '被替换的文本' }] }, { annotations: [{ ...valid.annotations[0], tagId: 'invalid' }] }, { annotations: [valid.annotations[0], valid.annotations[0]] }, { evaluation: '' }]) {
    assert.equal(checkExperimentCompletion('exp-annotation', { ...valid, ...patch }).complete, false);
  }
});
test('原文摘录重排不改变版本和标注目标，改文后必须重新复核', () => {
  const reordered = { ...task, paragraphs: [...task.paragraphs].reverse() };
  assert.equal(annotationSourceVersion(reordered), task.sourceVersion);
  assert.equal(isAnnotationCurrent(valid, { [caseId]: reordered }), true);
  const changed = structuredClone(task);
  changed.paragraphs[0].text += '更改';
  assert.notEqual(annotationSourceVersion(changed), task.sourceVersion);
  assert.equal(isAnnotationCurrent(valid, { [caseId]: changed }), false);
});
test('旧下标与过期原文均进入历史，原文快照不丢失且再次恢复不重复', () => {
  const stale = { ...valid, sourceVersion: 'previous-source' };
  const restored = restoreAnnotationDraft(stale, caseId);
  assert.equal(restored.annotations.length, 0);
  assert.equal(restored.historicalAnnotations[0].annotations[0].text, task.paragraphs[0].text);
  assert.deepEqual(restoreAnnotationDraft(restored, caseId).historicalAnnotations, restored.historicalAnnotations);
  const legacy = restoreAnnotationDraft({ annotations: [{ paraIndex: 0, tagId: 'conclusion' }], evaluation: '旧评价' }, caseId);
  assert.equal(legacy.annotations.length, 0);
  assert.equal(legacy.evaluation, '旧评价');
  assert.equal(legacy.historicalAnnotations[0].annotations[0].paraIndex, 0);
});
test('批注来源文件与稳定段落编号通过校验', () => assert.deepEqual(validateRepositoryAnnotationEvidence(), []));
