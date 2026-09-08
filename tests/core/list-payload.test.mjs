import test from 'node:test';
import assert from 'node:assert/strict';
import { loadShowcaseCases } from '../../lib/showcase-cases.js';
import { normalizeCaseRows, normalizeInitialCaseFilters, getFilteredRows, buildFilterOptions } from '../../lib/cases-workspace.js';
test('列表精简不会改变检索、各类筛选与日期排序结果', async()=>{
 const original=await loadShowcaseCases();const compact=normalizeCaseRows(original);const before=normalizeCaseRows(original),after=normalizeCaseRows(compact);
 assert.deepEqual(after,before);
 assert.equal('refLegal' in compact[0],false);
 const empty=normalizeInitialCaseFilters({});const options=buildFilterOptions(before,empty);
 assert.deepEqual(buildFilterOptions(after,empty),options);
 for(const keyword of ['','张保林','最高','合同','第一百']) for(const sort of ['date-desc','date-asc','relevance']) {
 const filters=normalizeInitialCaseFilters({keyword});assert.deepEqual(getFilteredRows(after,filters,sort),getFilteredRows(before,filters,sort));
 }
});
