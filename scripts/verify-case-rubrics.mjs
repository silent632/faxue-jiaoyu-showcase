import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { caseRubrics } from '../lib/case-rubrics.js';
import { validateRepositoryCaseRubrics } from '../lib/content/case-rubrics.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const errors = validateRepositoryCaseRubrics();
let count = 0;
for (const [id, rubric] of Object.entries(caseRubrics)) {
  try {
    const pages = execFileSync('pdftotext', ['-layout', path.join(root, 'public/pdfs', rubric.sourceFile), '-'], { encoding: 'utf8' }).split('\f');
    for (const e of rubric.evidence) {
      count++;
      if (!pages[e.page - 1]?.replace(/\s/gu, '').includes(e.text)) errors.push(`${id}/${e.id}: 指定页找不到引文`);
    }
  } catch (error) { errors.push(`${id}: ${error.message}`); }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${Object.keys(caseRubrics).length} 篇量规、${count} 段依据通过文件指纹、版本与物理页引文校验；不代表教师审定。`);
