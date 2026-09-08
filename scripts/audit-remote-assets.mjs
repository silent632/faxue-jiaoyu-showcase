import { writeFileSync, mkdirSync } from 'node:fs';
import { getShowcaseVideoPeriods } from '../lib/showcase-home-videos.js';
const urls = [...new Set(getShowcaseVideoPeriods().flatMap(v => [v.sourceHref, ...(v.segments || []).map(s => s.href)]).filter(u => /^https?:/.test(u || '')))];
const results = [];
for (const url of urls) {
 try {
  const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000), redirect: 'follow' });
  results.push({ url, status: response.status, finalUrl: response.url, type: response.headers.get('content-type'), bytes: response.headers.get('content-length'), checkedAt: new Date().toISOString() });
 } catch (error) { results.push({url,error:error.message,checkedAt:new Date().toISOString()}); }
}
mkdirSync('output', {recursive:true});writeFileSync('output/remote-assets.json', JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
if (results.some(r => !r.status || r.status >= 400 || !/^video\//.test(r.type || ''))) process.exitCode = 1;
