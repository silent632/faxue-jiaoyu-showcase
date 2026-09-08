import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './content-paths.js';
import { caseRubrics, isRubricSnapshot } from '../case-rubrics.js';
export function rubricVersion(value) {
  const { version, ...content } = value;
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
export function validateRepositoryCaseRubrics() {
  const errors = [];
  const rows = JSON.parse(readFileSync(path.join(REPO_ROOT, 'data/generated/cases-extracted.json'), 'utf8'));
  for (const [id, rubric] of Object.entries(caseRubrics)) {
    const row = rows.find((r) => r.case_id === id);
    if (!row || row.pdf_file !== rubric.sourceFile || row.case_number !== rubric.caseNumber || !isRubricSnapshot(rubric)) errors.push(`${id}: 案例量规结构或来源不匹配`);
    if (rubricVersion(rubric) !== rubric.version) errors.push(`${id}: 量规修改后必须更新版本`);
    try {
      const sha = createHash('sha256').update(readFileSync(path.join(REPO_ROOT, 'public/pdfs', rubric.sourceFile))).digest('hex');
      if (sha !== rubric.sourceSha256) errors.push(`${id}: PDF 已变化，量规依据须重新核对`);
      const course = JSON.parse(readFileSync(path.join(REPO_ROOT, 'content/courses', `${rubric.courseSlug}.json`), 'utf8'));
      if (!course.recommendedCases.some((c) => c.caseId === id)) errors.push(`${id}: 未列入对应课程推荐案例`);
    } catch { errors.push(`${id}: 无法读取量规的来源或课程`); }
  }
  return errors;
}
