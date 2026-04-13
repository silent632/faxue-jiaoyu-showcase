export const COURSE_PERIOD_SECTIONS = [
  { key: "introduction", label: "本期导读", hrefSegment: "introduction" },
  { key: "questions", label: "重点问题", hrefSegment: "questions" },
  { key: "content", label: "内容展开", hrefSegment: "content" },
  { key: "materials", label: "材料与案例", hrefSegment: "materials" },
  { key: "outcomes", label: "学习成果", hrefSegment: "outcomes" },
  { key: "teaching", label: "教学安排", hrefSegment: "teaching" },
];

function compactText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueTexts(items, limit = Infinity) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const text = compactText(item);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
    if (result.length >= limit) break;
  }

  return result;
}

function mergeLines(...parts) {
  return parts.map((part) => compactText(part)).filter(Boolean).join(" ");
}

function renderMaterialEntries(entries) {
  return uniqueTexts(
    entries.map((entry) => {
      if (!entry) return "";
      return `${compactText(entry.title)}：${compactText(entry.content)}`;
    })
  );
}

function attachRichContent(section, profile, key) {
  const detailSections = profile.sectionRichContent?.[key];
  const replaceDefaultContent = profile.sectionPageMode?.[key] === "replace";

  if ((!Array.isArray(detailSections) || detailSections.length === 0) && !replaceDefaultContent) {
    return section;
  }

  return {
    ...section,
    detailSections: Array.isArray(detailSections) ? detailSections : [],
    replaceDefaultContent,
  };
}

function buildSectionNavItems(period) {
  return COURSE_PERIOD_SECTIONS.map((item) => ({
    ...item,
    href: `/courses/${period.slug}/${item.hrefSegment}`,
  }));
}

function buildPeriodHome(period) {
  const profile = period.courseContentProfile;
  const keySignals = uniqueTexts(profile.periodSummary.keySignals, 5);
  const questions = uniqueTexts(profile.coreQuestions.map((item) => item.question), 4);
  const controversies = uniqueTexts(profile.caseStudy.controversies, 4);
  const comparisonPoints = uniqueTexts(profile.caseStudy.comparisonPoints, 4);
  const analysisPath = uniqueTexts(profile.caseStudy.analysisPath, 4);
  const judgmentPaths = uniqueTexts(profile.coreQuestions.map((item) => item.judgmentPath), 4);

  const entryPanels = [
    {
      title: "核心冲突",
      summary: "先锁定争点分歧与裁判分化。",
      items: controversies.length > 0 ? controversies : questions,
    },
    {
      title: "判断路径",
      summary: "围绕事实进入规范与法理衡量。",
      items: analysisPath.length > 0 ? analysisPath : judgmentPaths,
    },
    {
      title: "比较抓手",
      summary: "对齐可比维度，再下结论。",
      items: comparisonPoints.length > 0 ? comparisonPoints : keySignals,
    },
  ];

  const materialNotes = uniqueTexts([
    ...renderMaterialEntries(profile.materialsInterpretation?.courseware || []),
    ...renderMaterialEntries(profile.materialsInterpretation?.guideReading || []),
    ...renderMaterialEntries(profile.materialsInterpretation?.taskDesign || []),
    ...renderMaterialEntries(profile.materialsInterpretation?.supportingMaterials || []),
  ], 6);

  return {
    summary: profile.periodSummary.lead,
    highlights: keySignals,
    entryPanels,
    materialNotes,
  };
}

function buildIntroductionPage(period) {
  const profile = period.courseContentProfile;

  return attachRichContent({
    title: "本期导读",
    lead: profile.sectionSummaries.introduction.detail,
    paragraphs: [profile.periodSummary.lead],
    blocks: [
      {
        title: "课程位置",
        paragraphs: [profile.periodSummary.position],
      },
      {
        title: "承接关系",
        paragraphs: [profile.periodSummary.bridge],
      },
      {
        title: "进入线索",
        bullets: uniqueTexts(profile.periodSummary.keySignals, 4),
      },
    ].filter((block) => (block.paragraphs && block.paragraphs.some(Boolean)) || (block.bullets && block.bullets.length > 0)),
  }, profile, "introduction");
}

function buildQuestionsPage(period) {
  const profile = period.courseContentProfile;

  return attachRichContent({
    title: "重点问题",
    lead: profile.sectionSummaries.questions.detail,
    questions: profile.coreQuestions.map((item) => ({
      question: item.question,
      detail: mergeLines(item.whyItMatters, item.judgmentPath),
    })),
  }, profile, "questions");
}

function buildContentPage(period) {
  const profile = period.courseContentProfile;

  return attachRichContent({
    title: "内容展开",
    lead: profile.sectionSummaries.content.detail,
    blocks: profile.contentFlow.map((item) => ({
      title: item.title,
      paragraphs: uniqueTexts([item.goal, item.body]),
      bullets: uniqueTexts(item.anchors || [], 4),
    })),
  }, profile, "content");
}

function buildMaterialsPage(period) {
  const profile = period.courseContentProfile;

  return attachRichContent({
    title: "材料与案例",
    lead: profile.sectionSummaries.materials.detail,
    groups: [
      {
        title: "核心案例",
        summary: "先看本期围绕哪些案件和争议进入课堂。",
        items: uniqueTexts([...profile.caseStudy.mainCases, ...profile.caseStudy.supportCases], 6),
      },
      {
        title: "比较焦点",
        summary: "这些争点决定案例阅读和课堂讨论往哪里推进。",
        items: uniqueTexts([...profile.caseStudy.controversies, ...profile.caseStudy.comparisonPoints], 6),
      },
      {
        title: "课程材料",
        summary: "把课件、导学和阅读材料放回课程功能里理解。",
        items: uniqueTexts([
          ...renderMaterialEntries(profile.materialsInterpretation.courseware),
          ...renderMaterialEntries(profile.materialsInterpretation.guideReading),
        ], 6),
      },
      {
        title: "任务与支撑",
        summary: "任务单和课堂支撑材料负责把问题转成真实输出。",
        items: uniqueTexts([
          ...renderMaterialEntries(profile.materialsInterpretation.taskDesign),
          ...renderMaterialEntries(profile.materialsInterpretation.supportingMaterials),
        ], 6),
      },
    ].filter((group) => group.items.length > 0),
  }, profile, "materials");
}

function buildOutcomesPage(period) {
  const profile = period.courseContentProfile;

  return attachRichContent({
    title: "学习成果",
    lead: profile.sectionSummaries.outcomes.detail,
    groups: [
      {
        title: "报告与书面输出",
        summary: "重点看学生是否把事实、规范和法理理由真正串起来。",
        items: uniqueTexts(profile.studentOutcomes.reportFindings, 6),
      },
      {
        title: "课堂讨论与反馈",
        summary: "把课堂回应和课后反馈放在一起看，才能看出理解到底落没落地。",
        items: uniqueTexts([
          ...profile.studentOutcomes.classroomOutputs,
          ...profile.studentOutcomes.feedbackInsights,
        ], 6),
      },
      {
        title: "学习转变",
        summary: "这一组内容直接对应本期希望学生发生的判断转变。",
        items: uniqueTexts(profile.studentOutcomes.learningShift, 4),
      },
    ].filter((group) => group.items.length > 0),
  }, profile, "outcomes");
}

function buildTeachingPage(period) {
  const profile = period.courseContentProfile;

  return attachRichContent({
    title: "教学安排",
    lead: profile.sectionSummaries.teaching.detail,
    blocks: [
      {
        title: "双师分工",
        paragraphs: uniqueTexts(profile.teachingDesign.mentorRoles, 4),
      },
      {
        title: "课堂推进",
        paragraphs: [profile.periodSummary.lead],
        bullets: uniqueTexts(profile.teachingDesign.sessionStructure, 6),
      },
      {
        title: "训练重点",
        bullets: uniqueTexts(profile.teachingDesign.trainingFocus, 6),
      },
      {
        title: "设计重点",
        bullets: uniqueTexts(profile.teachingDesign.designHighlights, 6),
      },
    ].filter((block) => (block.paragraphs && block.paragraphs.some(Boolean)) || (block.bullets && block.bullets.length > 0)),
  }, profile, "teaching");
}

export function buildCourseSystemPages(period) {
  return {
    periodHome: buildPeriodHome(period),
    sectionNavItems: buildSectionNavItems(period),
    sectionPages: {
      introduction: buildIntroductionPage(period),
      questions: buildQuestionsPage(period),
      content: buildContentPage(period),
      materials: buildMaterialsPage(period),
      outcomes: buildOutcomesPage(period),
      teaching: buildTeachingPage(period),
    },
  };
}
