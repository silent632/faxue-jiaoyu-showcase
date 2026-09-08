import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { courseInputMode, getCoursePackagePeriods } from '../lib/course-package.js';
const files=[];
function walk(dir){for(const name of readdirSync(dir).sort()){const file=path.join(dir,name);if(statSync(file).isDirectory())walk(file);else files.push({file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});}}
for(const dir of ['content','data/generated','public/pdfs'])walk(dir);
for(const file of ['package-lock.json','lib/course-package.js'])files.push({file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')});
// 不把绝对路径列为可复现内容；有意覆盖外部资料时单列模式。
const periods=getCoursePackagePeriods();
console.log(JSON.stringify({mode:courseInputMode,courseCount:periods.length,courseDataSha256:createHash('sha256').update(JSON.stringify(periods)).digest('hex'),files},null,2));
