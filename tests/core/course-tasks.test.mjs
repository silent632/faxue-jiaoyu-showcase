import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCourseTasks } from '../../lib/content/course-tasks.js';
import { deriveCourseTaskState } from '../../lib/course-tasks.js';
import { completedRecord } from '../fixtures/experiment-records.mjs';
import { caseRubrics } from '../../lib/case-rubrics.js';
import { createReviewPatch } from '../../lib/experiment-revision.js';

test('八期任务均有独立起点、产出和匹配量规；浏览不计完成', () => {
 const tasks = loadCourseTasks();
 assert.equal(tasks.length, 8);
 for (const task of tasks) {
   assert.ok(task.goal && task.output && task.prerequisite && task.timeEstimate);
   assert.equal(deriveCourseTaskState(task).complete, false);
   assert.match(deriveCourseTaskState(task).href, /study/);
 }
});
test('完成课程需要三步研习、当前量规反思和当前任务版本，旧版保留为历史', () => {
 const task = loadCourseTasks().find(t => t.moduleId === 'exp-reasoning');
 const study = { fact: '事实与证据。'.repeat(30), issue: '争点与主张。'.repeat(30), analysis: '规范对应与分析。'.repeat(30) };
 const base = completedRecord(task.moduleId);
 const record = { ...base, ...createReviewPatch(base), feedbackReference: caseRubrics[task.caseId], revisionNote: '检查依据与论证，保留结论', revisionNoteConfirmed: true, courseTask: { slug: task.slug, version: task.version } };
 const state = (r, studies = { [task.caseId]: study }) => deriveCourseTaskState(task, studies, { [task.moduleId]: { [task.caseId]: r } });
 assert.equal(state(record).complete, true);
 assert.equal(state(record, {}).complete, false);
 assert.equal(state({...record,revisionNoteConfirmed:false}).complete, false);
 const old = state({...record,courseTask:{slug:task.slug,version:'old'}});
 assert.equal(old.complete,false);assert.equal(old.hasHistory,true);
});
