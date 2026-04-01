import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCaseById, getShowcaseCaseStudyById, loadShowcaseCases } from "../../lib/showcase-cases.js";

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
  const first = rows[0];

  const caseItem = await getShowcaseCaseById(first.id);

  assert.ok(caseItem);
  assert.equal(caseItem.id, first.id);
  assert.equal(caseItem.title, first.title);
});

test("showcase study helper returns structured steps for a real case", async () => {
  const rows = await loadShowcaseCases();
  const caseItem = await getShowcaseCaseStudyById(rows[0].id);

  assert.ok(caseItem);
  assert.equal(caseItem.id, rows[0].id);
  assert.equal(caseItem.studySteps.length, 4);
  assert.equal(caseItem.studySteps[1].label, "事实梳理");
  assert.ok(caseItem.studySteps[1].content.length > 0);
});
