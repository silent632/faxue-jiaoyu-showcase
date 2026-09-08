import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normTasks } from '../lib/norm-comparison.js';
import { validateRepositoryNormEvidence } from '../lib/content/norm-evidence.js';

// 需要本机 pdftotext；校验物理页原文及文件指纹，不代替人工语义审核。
const root = fileURLToPath(new URL('../', import.meta.url));
const errors = validateRepositoryNormEvidence();
for (const [id, task] of Object.entries(normTasks)) {
  try {
    const pages = execFileSync('pdftotext', ['-layout', path.join(root, 'public/pdfs', task.sourceFile), '-'], { encoding: 'utf8' }).split('\f');
    if (!pages[task.page - 1]?.replace(/\s/gu, '').includes(task.quote.replace(/\s/gu, ''))) errors.push(`${id}: 指定页找不到引文`);
  } catch (error) { errors.push(`${id}: 文本核验失败：${error.message}`); }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`${Object.keys(normTasks).length} 个规范依据通过文件指纹、来源版本与物理页引文校验。`);
