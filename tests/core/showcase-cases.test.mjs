import test from "node:test";
import assert from "node:assert/strict";

import {
  getShowcaseCanonicalDemoCaseId,
  getShowcaseCanonicalStudyHref,
  getShowcaseCaseById,
  getShowcaseCaseStudyById,
  loadShowcaseCases,
  selectCanonicalDemoCaseId,
} from "../../lib/showcase-cases.js";

test("showcase cases loader returns normalized source cases", async () => {
  const rows = await loadShowcaseCases();

  assert.ok(rows.length > 100);
  assert.ok(rows[0].id);
  assert.ok(rows[0].title);
  assert.ok(rows[0].caseNumber);
  assert.ok(rows[0].causePath);
  assert.ok(rows[0].causeFocus);
  assert.ok(Array.isArray(rows[0].laws));
});

test("showcase case lookup returns a matching case by id", async () => {
  const rows = await loadShowcaseCases();
  const caseId = selectCanonicalDemoCaseId([...rows].reverse());

  const caseItem = await getShowcaseCaseById(caseId);

  assert.ok(caseItem);
  assert.equal(caseItem.id, caseId);
  assert.ok(caseItem.title);
});

test("showcase study helper returns structured steps for a real case", async () => {
  const rows = await loadShowcaseCases();
  const demoId = selectCanonicalDemoCaseId([...rows].reverse());
  const caseItem = await getShowcaseCaseStudyById(demoId);

  assert.ok(caseItem);
  assert.equal(caseItem.id, demoId);
  assert.equal(caseItem.studySteps.length, 4);
  assert.equal(caseItem.studySteps[1].label, "事实梳理");
  assert.ok(caseItem.studySteps[1].content.length > 0);
});

test("showcase canonical study href is derived from a deterministic demo case", async () => {
  const rows = await loadShowcaseCases();
  const canonicalId = getShowcaseCanonicalDemoCaseId();

  assert.equal(canonicalId, selectCanonicalDemoCaseId([...rows].reverse()));
  assert.equal(getShowcaseCanonicalStudyHref(), `/cases/${canonicalId}/study`);
});
