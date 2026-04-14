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

test("period 02 exposes material-level rich content instead of summary-only copy", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");
  const { sectionRichContent } = period02.courseContentProfile;

  assert.ok(sectionRichContent);
  assert.equal(Array.isArray(sectionRichContent.materials), true);
  assert.equal(Array.isArray(sectionRichContent.outcomes), true);
  assert.equal(Array.isArray(sectionRichContent.teaching), true);

  assert.equal(
    sectionRichContent.materials.some((section) => section.title.includes("双师合作互评问卷")),
    true
  );
  assert.equal(
    sectionRichContent.materials.flatMap((section) => section.cards || []).some((card) =>
      Array.isArray(card.scoreItems) && card.scoreItems.some((item) => /理论导师在课前准备中投入了充分的时间和精力/u.test(item.label))
    ),
    true
  );
  assert.equal(
    sectionRichContent.outcomes.flatMap((section) => section.cards || []).some((card) =>
      /陈佳琪/u.test(card.title) && Array.isArray(card.meta) && card.meta.some((item) => item.value === "2023214243004")
    ),
    true
  );
  assert.equal(
    sectionRichContent.teaching.flatMap((section) => section.cards || []).some((card) =>
      Array.isArray(card.paragraphs) && card.paragraphs.some((item) => /穿插一个实务小问题/u.test(item))
    ),
    true
  );
});

test("period 02 introduction cards show full mentor names with units", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");
  const introductionBullets = period02.courseContentProfile.sectionRichContent.introduction.flatMap((section) =>
    (section.cards || []).flatMap((card) => card.bullets || [])
  );

  assert.equal(introductionBullets.includes("理论导师：朱腾伟（广东技术师范大学）。"), true);
  assert.equal(introductionBullets.includes("实务导师：刘宏（广东炜衡律师事务所）。"), true);
});
