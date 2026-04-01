import test from "node:test";
import assert from "node:assert/strict";

import { getShowcaseCanonicalDemoCaseId, getShowcaseCaseStudyById } from "../../lib/showcase-cases.js";

test("showcase study helper returns a real case with structured study steps", async () => {
  const canonicalId = getShowcaseCanonicalDemoCaseId();
  const caseItem = await getShowcaseCaseStudyById(canonicalId);

  assert.ok(caseItem);
  assert.equal(caseItem.id, canonicalId);
  assert.ok(caseItem.title);
  assert.ok(Array.isArray(caseItem.studySteps));
  assert.equal(caseItem.studySteps.length, 4);
});
