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

test("periods 02 to 04 expose dedicated content instead of fallback skeletons", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");
  const period03 = getCoursePackagePeriodBySlug("course-period-03");
  const period04 = getCoursePackagePeriodBySlug("course-period-04");

  assert.equal(period02.courseContentProfile.coreQuestions.length >= 3, true);
  assert.equal(period03.courseContentProfile.coreQuestions.length >= 3, true);
  assert.equal(period04.courseContentProfile.coreQuestions.length >= 3, true);

  assert.match(period02.courseContentProfile.periodSummary.lead, /权利义务相一致/u);
  assert.match(period02.courseContentProfile.caseStudy.mainCases.join(" "), /小马奔腾/u);
  assert.equal(
    period02.courseContentProfile.studentOutcomes.reportFindings.some((item) => /孙瑞轩|夫妻共同债务|受益者负担/u.test(item)),
    true
  );

  assert.match(period03.courseContentProfile.periodSummary.lead, /商事仲裁|多元纠纷解决/u);
  assert.equal(
    period03.courseContentProfile.caseStudy.controversies.some((item) => /仲裁协议|诉讼|管辖/u.test(item)),
    true
  );
  assert.equal(
    period03.courseContentProfile.studentOutcomes.reportFindings.some((item) => /张楠|仲裁条款|终局/u.test(item)),
    true
  );

  assert.match(period04.courseContentProfile.periodSummary.lead, /诉讼时效|沉睡的权利/u);
  assert.equal(
    period04.courseContentProfile.caseStudy.mainCases.some((item) => /罗州镇|毕节|工程款|次门内/u.test(item)),
    true
  );
  assert.equal(
    period04.courseContentProfile.studentOutcomes.reportFindings.some((item) => /赵伟|政府违约|诉讼时效/u.test(item)),
    true
  );
});
