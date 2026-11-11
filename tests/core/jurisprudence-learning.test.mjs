import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPublicJurisprudenceLearning, getJurisprudenceLearningData, getPublicJurisprudenceLearning, validateJurisprudenceLearning } from '../../lib/content/jurisprudence-learning.js';
import { normalizeCaseRows, normalizeInitialCaseFilters, getFilteredRows, buildCasesQueryString, resolveCasesStateFromSearchParams } from '../../lib/cases-workspace.js';
import { resolveTaskLearningTopic } from '../../lib/task-learning-topic.js';
import { learningContextHref } from '../../lib/learning-context.js';

test('公开知识点和案例具备数据与原文依据', () => {
  const data = getJurisprudenceLearningData();
  assert.equal(data.chapters.length, 9);
  assert.deepEqual(validateJurisprudenceLearning(data, ['case-0093', 'case-0020', 'case-0012']), []);
  const published = getPublicJurisprudenceLearning();
  assert.equal(published.chapters.length, 9); assert.equal(published.topics.length, 19); assert.equal(published.caseLinks.length, 3);
});

test('案例关联必须指向真实案例且已复核关联必须有依据和审阅记录', () => {
  const data = { chapters: [{ id:'c', title:'章节', order:1, source:'图.jpg', status:'reviewed' }], topics: [{ id:'t', chapterId:'c', title:'知识点', source:'图.jpg', description:'说明', reviewer:'教师', reviewedAt:'2026-11-10', status:'reviewed' }], caseLinks: [{ caseId:'case-1', topicId:'t', type:'observation', status:'reviewed', reason:'用于分析', question:'如何理解？', evidence:'原文第 1 页', sourceFile:'案例.pdf', sourceSha256:'a'.repeat(64), pages:[1], reviewer:'教师', reviewedAt:'2026-11-10' }] };
  assert.deepEqual(validateJurisprudenceLearning(data, ['case-1']), []);
  assert.ok(validateJurisprudenceLearning(data, []).length);
  data.caseLinks[0].evidence = '';
  assert.ok(validateJurisprudenceLearning(data, ['case-1']).length);
});

test('只有发布或复核的完整层级进入公共知识与案例列表', () => {
  const input={chapters:[{id:'reviewed',status:'reviewed'},{id:'draft',status:'pending'}],topics:[{id:'visible',chapterId:'reviewed',status:'reviewed'},{id:'hidden',chapterId:'reviewed',status:'pending'},{id:'wrong-parent',chapterId:'draft',status:'reviewed'}],caseLinks:[{caseId:'a',topicId:'visible',status:'reviewed'},{caseId:'b',topicId:'visible',status:'pending'},{caseId:'c',topicId:'hidden',status:'reviewed'},{caseId:'d',topicId:'wrong-parent',status:'reviewed'}]};
  const result=filterPublicJurisprudenceLearning(input);
  assert.deepEqual(result.topics.map(item=>item.id),['visible']);assert.deepEqual(result.caseLinks.map(item=>item.caseId),['a']);
});

test('禁止知识点层级循环', () => {
  const data = { chapters: [{id:'c',title:'章',order:1,source:'图',status:'candidate'}], topics: [{id:'a',chapterId:'c',title:'甲',source:'图',status:'candidate',parentId:'b'}, {id:'b',chapterId:'c',title:'乙',source:'图',status:'candidate',parentId:'a'}], caseLinks: [] };
  assert.ok(validateJurisprudenceLearning(data).some(error => error.includes('循环')));
});

test('知识点筛选可与其他条件组合并通过 URL 恢复', () => {
  const rows = normalizeCaseRows([{id:'case-1',title:'案例一',causeL1:'民事',learningTopics:['rights']}, {id:'case-2',title:'案例二',causeL1:'刑事',learningTopics:['rights']}, {id:'case-3',title:'案例三',causeL1:'民事',learningTopics:[]}]);
  const filters = normalizeInitialCaseFilters({topic:'rights',causeL1:'民事'});
  assert.deepEqual(getFilteredRows(rows, filters, 'date-desc').map(item => item.id), ['case-1']);
  const query = buildCasesQueryString({filters,sortMode:'date-desc',currentPage:1});
  assert.deepEqual(resolveCasesStateFromSearchParams(new URLSearchParams(query)).filters, filters);
});

test('教师任务仅接受匹配案例的知识点并保留阅读依据快照', () => {
  const learning={topics:[{id:'rights',title:'权利与义务'}],caseLinks:[{caseId:'case-1',topicId:'rights',reason:'学习角度',question:'如何分析？',evidence:'文书第2页'}]};
  const snapshot=resolveTaskLearningTopic('rights','case-1',learning);
  assert.deepEqual(snapshot,{id:'rights',title:'权利与义务',reason:'学习角度',question:'如何分析？',evidence:'文书第2页'});
  learning.topics[0].title='更新后标题';learning.caseLinks[0].question='更新后的问题';
  assert.equal(snapshot.title,'权利与义务');assert.equal(snapshot.question,'如何分析？');
  assert.equal(resolveTaskLearningTopic('rights','case-2',learning),null);
  assert.equal(resolveTaskLearningTopic('absent','case-1',learning),null);
});

test('学习路径仅传递该案例已审核知识点，并保留检索上下文', () => {
  const search='?returnTo='+encodeURIComponent('/cases/?topic=rights&page=3');
  const result=learningContextHref('/experiments/exp-reasoning?case=case-1',search,['rights']);
  const url=new URL(result,'https://example.org');
  assert.equal(url.searchParams.get('case'),'case-1');assert.equal(url.searchParams.get('topic'),'rights');assert.equal(url.searchParams.get('returnTo'),'/cases/?topic=rights&page=3');
  assert.equal(learningContextHref('/cases/case-2/study',search,[]),'/cases/case-2/study');
  assert.equal(learningContextHref('/cases/case-1/study','?returnTo='+encodeURIComponent('//external.invalid/?topic=rights'),['rights']),'/cases/case-1/study');
});
