import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { REPO_ROOT } from './content-paths.js';
import { annotationTasks } from '../annotation.js';

export function annotationSourceVersion(task) {
  const proof = { sourceFile: task.sourceFile, sourceSha256: task.sourceSha256, caseNumber: task.caseNumber,
    paragraphs: [...task.paragraphs].sort((a, b) => a.id.localeCompare(b.id)) };
  return createHash('sha256').update(JSON.stringify(proof)).digest('hex');
}
export function validateRepositoryAnnotationEvidence() {
  const errors = [];
  const rows = JSON.parse(readFileSync(path.join(REPO_ROOT, 'data/generated/cases-extracted.json'), 'utf8'));
  for (const [id, task] of Object.entries(annotationTasks)) {
    const row = rows.find((entry) => entry.case_id === id);
    if (!row || row.pdf_file !== task.sourceFile || row.case_number !== task.caseNumber) errors.push(`${id}: 批注来源不匹配`);
    if (!task.paragraphs.length || new Set(task.paragraphs.map((p) => p.id)).size !== task.paragraphs.length) errors.push(`${id}: 批注段落为空或编号重复`);
    for (const p of task.paragraphs) {
      const expected = 'excerpt-' + createHash('sha256').update(`${id}:${p.page}:${p.text}`).digest('hex').slice(0, 20);
      if (p.id !== expected || !p.text || !Number.isInteger(p.page) || p.page < 1) errors.push(`${id}: 批注段落编号、页码或原文不一致`);
    }
    if (annotationSourceVersion(task) !== task.sourceVersion) errors.push(`${id}: 批注材料变化后必须更新版本`);
    try {
      const sha = createHash('sha256').update(readFileSync(path.join(REPO_ROOT, 'public/pdfs', task.sourceFile))).digest('hex');
      if (sha !== task.sourceSha256) errors.push(`${id}: PDF 已变化，批注摘录须重新核对`);
    } catch { errors.push(`${id}: 无法读取批注 PDF`); }
  }
  return errors;
}
