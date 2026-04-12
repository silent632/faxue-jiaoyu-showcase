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

test("course detail page is exported as a static route with package-backed content", () => {
  const source = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");

  assert.match(source, /generateStaticParams/u);
  assert.match(source, /getCoursePackageStaticParams/u);
  assert.match(source, /getCoursePackagePeriodBySlug/u);
  assert.match(source, /本期导读/u);
  assert.match(source, /核心问题/u);
  assert.match(source, /内容展开/u);
  assert.match(source, /课程材料/u);
  assert.match(source, /教学设计/u);
  assert.match(source, /学习收获/u);
  assert.equal(/本期成果|课程信息|问题线索|课前准备/u.test(source), false);
  assert.equal(/课程概况/u.test(source), false);
});

test("courses page presents each period as a guide card instead of a metadata-only archive card", () => {
  const source = readFileSync(new URL("../../app/courses/page.js", import.meta.url), "utf8");

  assert.match(source, /archiveCard\.lead/u);
  assert.match(source, /archiveCard\.keyPoints/u);
  assert.match(source, /contentType/u);
  assert.equal(/每一期都保留主题、阶段定位和双入口/u.test(source), false);
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
