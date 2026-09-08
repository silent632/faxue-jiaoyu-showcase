import { createHash } from 'node:crypto';
import { getMigratedCourseSlugs, loadCourseContentProfileSource } from './course-content-source.js';
import { caseRubrics } from '../case-rubrics.js';
export function loadCourseTasks() {
  return getMigratedCourseSlugs().map(slug => {
    const profile = loadCourseContentProfileSource(slug);
    const task = profile.learningTask;
    const rubric = caseRubrics[task?.caseId];
    if (!rubric || rubric.moduleId !== task.moduleId || rubric.courseSlug !== slug) throw new Error(`${slug}: 课程任务与量规不匹配`);
    const proof = { ...task, slug, rubricVersion: rubric.version };
    return { ...proof, version: createHash('sha256').update(JSON.stringify(proof)).digest('hex') };
  });
}
