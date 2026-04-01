import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCaseStudyById, loadShowcaseCases } from "../../lib/showcase-cases.js";

test("showcase study helper returns a real case with structured study steps", async () => {
  const rows = await loadShowcaseCases();
  const caseItem = await getShowcaseCaseStudyById(rows[0].id);

  assert.ok(caseItem);
  assert.equal(caseItem.id, rows[0].id);
  assert.equal(caseItem.title, rows[0].title);
  assert.ok(Array.isArray(caseItem.studySteps));
  assert.equal(caseItem.studySteps.length, 4);
});
