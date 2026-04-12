import test from "node:test";
import assert from "node:assert/strict";

import { getCoursePackagePeriodBySlug } from "../../lib/course-package.js";

test("priority periods expose a complete courseContentProfile", () => {
  for (const slug of [
    "course-period-01",
    "course-period-05",
    "course-period-06",
    "course-period-07",
    "course-period-08",
  ]) {
    const period = getCoursePackagePeriodBySlug(slug);
    const profile = period.courseContentProfile;

    assert.ok(profile);
    assert.ok(profile.periodSummary);
    assert.ok(Array.isArray(profile.coreQuestions));
    assert.equal(profile.coreQuestions.length >= 3, true);
    assert.ok(Array.isArray(profile.contentFlow));
    assert.equal(profile.contentFlow.length >= 4, true);
    assert.ok(profile.caseStudy);
    assert.ok(profile.materialsInterpretation);
    assert.ok(profile.studentOutcomes);
    assert.ok(profile.teachingDesign);
  }
});
