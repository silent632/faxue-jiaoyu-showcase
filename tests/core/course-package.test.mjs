import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getCoursePackagePeriodBySlug,
  getCoursePackageStaticParams,
  normalizeCourseMaterialDisplayName,
} from "../../lib/course-package.js";
import { buildCourseArchiveContent } from "../../lib/course-archive-content.js";

test("course package metadata exposes eight detail pages with normalized material names", () => {
  const params = getCoursePackageStaticParams();
  const period01 = getCoursePackagePeriodBySlug("course-period-01");
  const period06 = getCoursePackagePeriodBySlug("course-period-06");

  assert.equal(params.length, 8);
  assert.ok(params.some((item) => item.slug === "course-period-01"));
  assert.ok(params.some((item) => item.slug === "course-period-08"));

  assert.ok(period01);
  assert.equal(period01.period, "第一期");
  assert.equal(period01.detailHref, "/courses/course-period-01");
  assert.ok(Array.isArray(period01.materialGroups));
  assert.ok(period01.materialGroups.some((group) => group.title === "课程资料"));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课程课件：类案检索与法律适用")));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "课件讲义版：类案检索与法律适用")));
  assert.ok(period01.materialGroups.some((group) => group.items.some((item) => item.displayName === "专题阅读：司法裁判的“同”与“不同”")));
  assert.ok(period01.archiveCard);
  assert.equal(typeof period01.archiveCard.lead, "string");
  assert.ok(Array.isArray(period01.archiveCard.keyPoints));
  assert.ok(period01.archiveCard.keyPoints.length >= 2);
  assert.ok(period01.detailContent);
  assert.ok(Array.isArray(period01.detailContent.intro));
  assert.ok(Array.isArray(period01.detailContent.sections));
  assert.ok(period01.detailContent.sections.length >= 3);

  assert.ok(period06);
  assert.equal(period06.period, "第六期");
  assert.match(period06.guide.courseTheme, /个人信息保护与技术治理/u);
  assert.match(period06.guide.teachingTitle, /人脸识别中的同意边界/u);
  assert.ok(period06.outline.length >= 6);
  assert.ok(period06.materialGroups.some((group) => group.title === "佐证材料"));
});

test("course package exposes a period home plus ten standard material pages", () => {
  const period01 = getCoursePackagePeriodBySlug("course-period-01");
  const period05 = getCoursePackagePeriodBySlug("course-period-05");

  for (const period of [period01, period05]) {
    assert.ok(period.periodHome);
    assert.ok(Array.isArray(period.periodHome.entryPanels));
    assert.ok(period.periodHome.entryPanels.length >= 3);
    for (const panel of period.periodHome.entryPanels) {
      assert.equal(typeof panel.title, "string");
      assert.ok(panel.title.length > 0);
      assert.ok(Array.isArray(panel.items));
      assert.ok(panel.items.length > 0);
    }
    assert.ok(Array.isArray(period.periodHome.materialNotes));
    assert.ok(period.periodHome.materialNotes.length >= 3);
    for (const note of period.periodHome.materialNotes) {
      assert.match(note, /.+：.+/u);
      assert.doesNotMatch(note, /？|\?/u);
    }
    assert.ok(Array.isArray(period.materialDirectory));
    assert.equal(period.materialDirectory.length, 4);
    assert.ok(Array.isArray(period.materialPages));
    assert.equal(period.materialPages.length, 10);
    assert.equal(period.materialPages[0].slug, "teaching-guide");
    assert.equal(period.materialPages.at(-1).slug, "feedback");
  }
});

test("late-period home notes stay course-facing instead of exposing production-process language", () => {
  for (const slug of ["course-period-05", "course-period-06", "course-period-07", "course-period-08"]) {
    const period = getCoursePackagePeriodBySlug(slug);
    const notes = period.periodHome.materialNotes.join("\n");

    assert.equal(/章节配音稿与内容导图|配音稿|内容展开页|材料页|制作层文件|\.pptx/u.test(notes), false);
    assert.match(notes, /课程正文|课程主线|讲授主线|结构图|课堂目标/u);
  }
});

test("course package material pages can carry detailed period-level content blocks", () => {
  const period02 = getCoursePackagePeriodBySlug("course-period-02");
  const guidePage = period02.materialPages.find((item) => item.slug === "teaching-guide");
  const jurisprudencePage = period02.materialPages.find((item) => item.slug === "jurisprudence-guide");
  const observationPage = period02.materialPages.find((item) => item.slug === "classroom-observation");
  const reportPage = period02.materialPages.find((item) => item.slug === "study-report");

  assert.equal(typeof guidePage.lead, "string");
  assert.equal(Array.isArray(guidePage.sections), true);
  assert.equal(Array.isArray(jurisprudencePage.sections), true);
  assert.equal(Array.isArray(observationPage.sections), true);
  assert.equal(Array.isArray(reportPage.sections), true);

  assert.equal(
    guidePage.sections.some((section) => /课程概况|资料包内容清单/u.test(section.title)),
    true
  );
  assert.equal(
    jurisprudencePage.sections.some((section) => /法理|推演|思考题/u.test(section.title)),
    true
  );
  assert.equal(
    observationPage.sections.some((section) => /课堂|观察|评析/u.test(section.title)),
    true
  );
  assert.equal(
    reportPage.sections.some((section) => /研习报告|实质正义|受益者负担/u.test(section.title)),
    true
  );
});

test("course package exposes structured content profiles for rebuilt periods", () => {
  const period01 = getCoursePackagePeriodBySlug("course-period-01");
  const period08 = getCoursePackagePeriodBySlug("course-period-08");

  for (const period of [period01, period08]) {
    assert.ok(period.courseContentProfile);
    assert.equal(typeof period.courseContentProfile.periodSummary.lead, "string");
    assert.equal(Array.isArray(period.courseContentProfile.caseStudy.mainCases), true);
    assert.equal(Array.isArray(period.courseContentProfile.studentOutcomes.feedbackInsights), true);
  }
});

test("all periods expose complete mentor names with units", () => {
  for (const { slug } of getCoursePackageStaticParams()) {
    const period = getCoursePackagePeriodBySlug(slug);
    assert.match(period.guide.theoryMentor, /（.+）/u);
    assert.match(period.guide.practiceMentor, /（.+）/u);
  }
});

test("material display name normalization removes raw file noise", () => {
  assert.equal(
    normalizeCourseMaterialDisplayName("课件：类案检索与法律适用（0905）.pptx"),
    "课程课件：类案检索与法律适用"
  );
  assert.equal(
    normalizeCourseMaterialDisplayName("课件：类案检索与法律适用（0905）(1).pdf"),
    "课件讲义版：类案检索与法律适用"
  );
  assert.equal(
    normalizeCourseMaterialDisplayName("司法裁判的“同”与“不同”：当法官自由裁量遇上科技赋能(1).pdf"),
    "专题阅读：司法裁判的“同”与“不同”"
  );
});

test("course data source resolution avoids user-specific absolute paths", () => {
  const coursePackageSource = readFileSync(new URL("../../lib/course-package.js", import.meta.url), "utf8");
  const showcaseCasesSource = readFileSync(new URL("../../lib/showcase-cases.js", import.meta.url), "utf8");

  assert.doesNotMatch(coursePackageSource, /\/Users\/silent/u);
  assert.doesNotMatch(showcaseCasesSource, /\/Users\/silent/u);
  assert.match(coursePackageSource, /COURSE_PACKAGE_ROOT|homedir|COURSE_PACKAGE_ROOT/u);
  assert.match(showcaseCasesSource, /SHOWCASE_SOURCE_ROOT|homedir/u);
});

test("course detail route is exported as a static period home with a unified material entry matrix", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.match(source, /generateStaticParams/u);
  assert.match(source, /getCoursePackageStaticParams/u);
  assert.match(source, /getCoursePackagePeriodBySlug/u);
  assert.match(source, /materialDirectory/u);
  assert.match(source, /统一材料目录|本期材料/u);
  assert.doesNotMatch(source, /这一页只做引子/u);
  assert.doesNotMatch(source, /本期进入方式|网站结构|结构说明|页面结构/u);
  assert.doesNotMatch(source, /本期导读|重点问题|内容展开|材料与案例|学习成果|教学安排/u);
});

test("course detail route adopts the dense entry layout instead of the bridge scaffold", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /课程推进/u);
  assert.doesNotMatch(source, /course-period-card-grid/u);
  assert.doesNotMatch(source, /course-period-bridge/u);
  assert.doesNotMatch(source, /course-period-outline-list/u);
  assert.match(source, /course-period-entry-grid/u);
  assert.match(source, /course-period-entry-main/u);
  assert.match(source, /course-period-entry-side/u);
  assert.match(source, /course-period-entry-panel/u);
  assert.match(source, /course-period-material-notes/u);
  assert.match(source, /period\.periodHome\.entryPanels/u);
  assert.match(source, /period\.periodHome\.materialNotes/u);
});

test("course detail route does not repeat the hero summary inside the first content block", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /period\.periodHome\.summary/u);
  assert.match(source, /profile\.periodSummary\.position/u);
  assert.match(source, /profile\.periodSummary\.bridge/u);
});

test("courses page presents each period as a guide card instead of a metadata-only archive card", () => {
  const source = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.match(source, /archiveCard\.lead/u);
  assert.match(source, /archiveCard\.keyPoints/u);
  assert.match(source, /contentType/u);
  assert.match(source, /courses-page-body/u);
  assert.match(source, /course-archive-section/u);
  assert.equal(/每一期都保留主题、阶段定位和双入口/u.test(source), false);
});

test("late-period archive cards use issue-anchored copy without template labels", () => {
  const period05 = getCoursePackagePeriodBySlug("course-period-05");
  const period06 = getCoursePackagePeriodBySlug("course-period-06");
  const period07 = getCoursePackagePeriodBySlug("course-period-07");
  const period08 = getCoursePackagePeriodBySlug("course-period-08");

  assert.match(period05.archiveCard.lead, /非法证据/u);
  assert.match(period05.archiveCard.lead, /程序正义/u);
  assert.match(period05.archiveCard.lead, /取证权力/u);

  assert.match(period06.archiveCard.lead, /人脸识别/u);
  assert.match(period06.archiveCard.lead, /同意边界/u);
  assert.match(period06.archiveCard.lead, /人格权/u);

  assert.match(period07.archiveCard.lead, /平台/u);
  assert.match(period07.archiveCard.lead, /算法/u);
  assert.match(period07.archiveCard.lead, /劳动关系/u);

  assert.match(period08.archiveCard.lead, /生成式 AI/u);
  assert.match(period08.archiveCard.lead, /作品认定/u);
  assert.match(period08.archiveCard.lead, /责任边界/u);

  assert.match(period05.archiveCard.keyPoints.join(" "), /非法证据/u);
  assert.match(period05.archiveCard.keyPoints.join(" "), /程序正义/u);
  assert.match(period05.archiveCard.keyPoints.join(" "), /取证权力/u);

  assert.match(period06.archiveCard.keyPoints.join(" "), /人脸识别/u);
  assert.match(period06.archiveCard.keyPoints.join(" "), /同意边界/u);
  assert.match(period06.archiveCard.keyPoints.join(" "), /人格权/u);

  assert.match(period07.archiveCard.keyPoints.join(" "), /平台/u);
  assert.match(period07.archiveCard.keyPoints.join(" "), /算法/u);
  assert.match(period07.archiveCard.keyPoints.join(" "), /劳动关系/u);

  assert.match(period08.archiveCard.keyPoints.join(" "), /生成式 AI/u);
  assert.match(period08.archiveCard.keyPoints.join(" "), /作品认定/u);
  assert.match(period08.archiveCard.keyPoints.join(" "), /责任边界/u);

  const banned = /课程定位与双师设计页|学习目标页|内容导图页|示范课程视频展示|资源化表达的延展方向|阶段性收束/u;
  for (const period of [period05, period06, period07, period08]) {
    assert.doesNotMatch(period.archiveCard.lead, banned);
    for (const point of period.archiveCard.keyPoints) {
      assert.doesNotMatch(point, banned);
    }
  }
});

test("course archive builder shapes early-period copy", () => {
  const rawEarly = {
    summary: "以类案检索串联裁判文书阅读与表达训练。",
    theme: "类案检索与法律适用",
    guide: {
      coursePosition: "以案例检索为起点，进入争点识别。",
      highlights: ["  突出问题导读  ", null, 123, "明确表达收束"],
      goals: ["建立导读路径", "强化法理表达"],
    },
    outline: ["检索方法", "争点识别", "表达训练"],
    materialGroups: [
      {
        title: "课程资料",
        items: [
          { displayName: "课程课件：类案检索与法律适用", kind: "课件" },
          { displayName: "专题阅读：司法裁判", kind: "讲义" },
        ],
      },
    ],
  };

  const content = buildCourseArchiveContent("第一期", rawEarly);
  assert.ok(content.archiveCard);
  assert.equal(typeof content.archiveCard.lead, "string");
  assert.equal(content.archiveCard.keyPoints.length >= 2, true);
  assert.equal(content.archiveCard.keyPoints.length <= 3, true);
  assert.ok(content.archiveCard.keyPoints.every((point) => typeof point === "string" && point.trim().length > 0));
  assert.equal(typeof content.archiveCard.contentType, "string");

  assert.ok(content.detailContent);
  assert.ok(Array.isArray(content.detailContent.intro));
  assert.equal(content.detailContent.keyQuestions.length >= 3, true);
  assert.equal(content.detailContent.intro.length <= 2, true);
  assert.equal(content.detailContent.sections.length >= 3, true);
  assert.equal(content.detailContent.materialHighlights.length >= 1, true);
  assert.equal(content.detailContent.learningTakeaways.length >= 2, true);
  assert.equal(content.detailContent.teachingDesign.bullets.length <= 3, true);
  assert.ok(content.detailContent.teachingDesign.bullets.includes("突出问题导读"));
  assert.ok(content.detailContent.teachingDesign.bullets.every((bullet) => !/123/.test(bullet)));
});

test("course archive builder surfaces production-focused highlights for late periods", () => {
  const rawLate = {
    summary: "分享平台治理专题的视频化成果。",
    theme: "平台治理与劳动法理",
    guide: {
      coursePosition: "以资源化成果推进课程影响力。",
      highlights: ["视频化表达", "裁判经验沉淀"],
      goals: ["展示示范课程", "提炼可复用素材"],
    },
    outline: ["示范课导入", "材料线索", "资源化表达"],
    materialGroups: [
      {
        title: "视频制作材料",
        items: [
          { displayName: "章节配音稿", kind: "文稿" },
          { displayName: "资料包制作清单", kind: "清单" },
          { displayName: "逐页时长表", kind: "表格" },
        ],
      },
    ],
  };

  const content = buildCourseArchiveContent("第八期", rawLate);
  assert.ok(content.archiveCard.contentType);
  assert.equal(content.detailContent.keyQuestions.length, 3);
  assert.ok(content.detailContent.sections.length >= 3);
  assert.equal(content.detailContent.materialHighlights.length >= 2, true);
  assert.match(content.detailContent.materialHighlights[0].title, /章节配音稿|资料包制作清单/);
  const secondCall = buildCourseArchiveContent("第八期", rawLate);
  assert.notStrictEqual(content.detailContent.sections, secondCall.detailContent.sections);
  assert.notStrictEqual(content.detailContent.keyQuestions, secondCall.detailContent.keyQuestions);
});

test("course archive builder keeps qualified late-period lead and key points", () => {
  const rawQualified = {
    summary: "围绕生成式人工智能作品认定，讨论责任边界与权利归属。",
    guide: {
      coursePosition: "以生成式人工智能文本为例，检验作品认定的边界与责任分配。",
      highlights: [
        "生成式人工智能作品认定",
        "责任边界与权利归属",
        "作者资格与平台义务",
      ],
    },
    outline: [
      "生成式人工智能作品认定",
      "责任边界与权利归属",
      "作者资格与平台义务",
    ],
  };

  const content = buildCourseArchiveContent("第八期", rawQualified);
  assert.equal(
    content.archiveCard.lead,
    "围绕生成式人工智能作品认定，讨论责任边界与权利归属。"
  );
  assert.deepEqual(content.archiveCard.keyPoints, [
    "生成式人工智能作品认定",
    "责任边界与权利归属",
    "作者资格与平台义务",
  ]);
  assert.match(content.archiveCard.keyPoints.join(" "), /生成式人工智能|生成式 AI/u);
  assert.match(content.archiveCard.keyPoints.join(" "), /作品认定/u);
  assert.match(content.archiveCard.keyPoints.join(" "), /责任边界/u);
});

test("course archive builder skips generic outline labels when later points carry issues", () => {
  const rawWithGenericOutline = {
    outline: ["主题界定页", "第一部分章节页", "问题切入页"],
    guide: {
      highlights: ["人脸识别与同意边界", "人格权保护与技术治理", "同意边界与责任边界"],
    },
  };

  const content = buildCourseArchiveContent("第六期", rawWithGenericOutline);
  assert.deepEqual(content.archiveCard.keyPoints, [
    "人脸识别与同意边界",
    "人格权保护与技术治理",
    "同意边界与责任边界",
  ]);
  assert.match(content.archiveCard.keyPoints.join(" "), /人脸识别/u);
  assert.match(content.archiveCard.keyPoints.join(" "), /同意边界/u);
  assert.match(content.archiveCard.keyPoints.join(" "), /人格权/u);
  assert.ok(content.archiveCard.keyPoints.every((point) => !/主题界定页|章节页|问题切入页/u.test(point)));
});

test("course archive builder falls back for early periods without inputs", () => {
  const content = buildCourseArchiveContent("第一期", {});

  assert.ok(Array.isArray(content.archiveCard.keyPoints));
  assert.ok(content.archiveCard.keyPoints.length >= 2);
  assert.deepEqual(content.archiveCard.keyPoints, ["类案检索", "争点识别", "导读训练"]);
});
