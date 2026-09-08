import test from 'node:test';
import assert from 'node:assert/strict';
import { caseRubrics, getCaseRubric, isRubricSnapshot } from '../../lib/case-rubrics.js';
import { rubricVersion, validateRepositoryCaseRubrics } from '../../lib/content/case-rubrics.js';
import { loadShowcaseCases } from '../../lib/showcase-cases.js';
import { filterCasesForModule } from '../../lib/experiments.js';
import { checkRevisionCompletion } from '../../lib/experiment-revision.js';

test('八篇量规覆盖八期与六模块，指定案例确实支持该模块', async () => {
  const cases = await loadShowcaseCases();
  assert.equal(Object.keys(caseRubrics).length, 8);
  assert.equal(new Set(Object.values(caseRubrics).map(r => r.courseSlug)).size, 8);
  assert.equal(new Set(Object.values(caseRubrics).map(r => r.moduleId)).size, 6);
  for (const [id, r] of Object.entries(caseRubrics)) {
    assert.equal(filterCasesForModule(cases, r.moduleId).some(c => c.id === id), true);
    assert.equal(r.checks.length, 2);
    assert.equal(r.reviewStatus.includes('待教师审阅'), true);
  }
  assert.match(caseRubrics['case-0093'].courseRelation, /不是 AI/);
});
test('每篇量规任务不同，检查点与分析均指向真实依据，版本随内容变化', () => {
  assert.deepEqual(validateRepositoryCaseRubrics(), []);
  assert.equal(new Set(Object.values(caseRubrics).map(r => r.task)).size, 8);
  for (const r of Object.values(caseRubrics)) {
    assert.equal(isRubricSnapshot(r), true);
    assert.notEqual(rubricVersion({ ...r, task: r.task + '修订' }), r.version);
    assert.equal(isRubricSnapshot({ ...r, evidence: [] }), false);
  }
  assert.equal(getCaseRubric('constructor', 'exp-reasoning'), null);
  assert.equal(getCaseRubric('case-0012', 'exp-annotation'), null);
});
test('使用专属量规后即使保留原稿，也必须确认反思说明', () => {
  const record = { output: '原稿', interactionData: {}, initialDraft: { output: '原稿', interactionData: {} }, feedbackReference: caseRubrics['case-0012'] };
  assert.equal(checkRevisionCompletion(record).complete, false);
  assert.equal(checkRevisionCompletion({ ...record, revisionNote: '核对第7页后保留原判断，理由是合同文本可以相互印证。', revisionNoteConfirmed: true }).complete, true);
});
