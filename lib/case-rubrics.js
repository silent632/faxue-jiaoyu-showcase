import { caseRubrics } from './case-rubric-data.js';
export { caseRubrics };
export function getCaseRubric(caseId, moduleId) {
  const item = Object.hasOwn(caseRubrics, caseId) ? caseRubrics[caseId] : null;
  return item?.moduleId === moduleId ? item : null;
}
export function isRubricSnapshot(value) {
  return Boolean(value && typeof value === 'object' && typeof value.id === 'string' && typeof value.version === 'string'
    && typeof value.moduleId === 'string' && typeof value.title === 'string' && typeof value.task === 'string'
    && ['sourceFile','sourceSha256','caseNumber','courseSlug'].every((key) => typeof value[key] === 'string' && value[key].length > 0)
    && typeof value.reviewStatus === 'string' && typeof value.courseRelation === 'string' && typeof value.revisionRequirement === 'string'
    && Array.isArray(value.evidence) && value.evidence.length && value.evidence.every((e) => e && typeof e.id === 'string' && typeof e.text === 'string' && Number.isInteger(e.page) && e.page > 0)
    && Array.isArray(value.checks) && value.checks.length && value.checks.every((c) => c && ['theory','practice'].includes(c.perspective) && ['id','label','adequate','partial','commonError'].every((key) => typeof c[key] === 'string') && Array.isArray(c.evidenceIds) && c.evidenceIds.every((id) => value.evidence.some((e) => e.id === id)))
    && Array.isArray(value.referenceAnalysis) && value.referenceAnalysis.length && value.referenceAnalysis.every((a) => a && typeof a.text === 'string' && Array.isArray(a.evidenceIds) && a.evidenceIds.every((id) => value.evidence.some((e) => e.id === id))));
}
