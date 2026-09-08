import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { annotationTasks } from '../lib/annotation.js';
import { validateRepositoryAnnotationEvidence } from '../lib/content/annotation-evidence.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const errors = validateRepositoryAnnotationEvidence();
let count = 0;
for (const [id, task] of Object.entries(annotationTasks)) {
  try {
    const pages = execFileSync('pdftotext', ['-layout', path.join(root, 'public/pdfs', task.sourceFile), '-'], { encoding: 'utf8' }).split('\f');
    for (const paragraph of task.paragraphs) {
      count += 1;
      if (!pages[paragraph.page - 1]?.replace(/\s/gu, '').includes(paragraph.text)) errors.push(`${id}/${paragraph.id}: 指定物理页找不到原文`);
    }
  } catch (error) { errors.push(`${id}: PDF 核验失败：${error.message}`); }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${Object.keys(annotationTasks).length} 个案例、${count} 段原文通过物理页、文件指纹和来源版本校验。`);
