import { loadCourseContentProfileSource } from "./content/course-content-source.js";

function buildSectionSummaries(overrides = {}) {
  return {
    introduction: {
      summary: "先把本期课程的切入点、课程位置和阅读价值讲清楚。",
      detail: "这一栏解释这期课为什么从这里进入，以及它和前后期的关系。",
      ...overrides.introduction,
    },
    questions: {
      summary: "把本期真正需要判断的问题集中摆出来。",
      detail: "每个问题后都带判断线索，避免只有问句没有内容。",
      ...overrides.questions,
    },
    content: {
      summary: "按课程推进顺序展开本期主线。",
      detail: "这一栏是课程正文，负责把导入、分析、比较和收束完整写出来。",
      ...overrides.content,
    },
    materials: {
      summary: "解释课件、导学、任务单和案例各自承担什么课程功能。",
      detail: "不再列文件名，而是说明这些材料如何进入课堂和阅读。",
      ...overrides.materials,
    },
    outcomes: {
      summary: "整理学生输出、课堂讨论和反馈聚焦点。",
      detail: "重点看学生围绕本期问题形成了什么判断，而不是只看材料标签。",
      ...overrides.outcomes,
    },
    teaching: {
      summary: "把双师分工、课堂推进和训练重点交代清楚。",
      detail: "这一栏解释为什么课程要按这样的顺序推进，以及每一步在练什么。",
      ...overrides.teaching,
    },
  };
}

function buildStructuredFallbackProfile(period) {
  const keyPoints = period.detailContent?.keyQuestions || [];
  const sections = period.detailContent?.sections || [];
  const materialHighlights = period.detailContent?.materialHighlights || [];
  const teachingDesign = period.detailContent?.teachingDesign || {};

  return {
    periodSummary: {
      theme: period.guide.courseTheme || period.theme,
      position: period.module,
      bridge: period.phaseLabel,
      lead: period.guide.coursePosition || period.summary,
      keySignals: period.archiveCard?.keyPoints || [],
    },
    coreQuestions: keyPoints.map((question) => ({
      question,
      whyItMatters: "这一问题用于连接课程主题、案例研读和课堂讨论。",
      judgmentPath: "先回到案例事实，再结合课程主题判断争点如何展开。",
    })),
    contentFlow: sections.map((section) => ({
      title: section.title,
      goal: section.body,
      body: section.body,
      anchors: [section.title],
    })),
    caseStudy: {
      mainCases: period.guide.caseDirections || [],
      supportCases: [],
      controversies: keyPoints,
      comparisonPoints: sections.map((section) => section.title),
      analysisPath: sections.map((section) => section.body),
    },
    materialsInterpretation: {
      courseware: materialHighlights,
      guideReading: materialHighlights,
      taskDesign: materialHighlights,
      supportingMaterials: materialHighlights,
    },
    studentOutcomes: {
      reportFindings: period.detailContent?.learningTakeaways || [],
      feedbackInsights: period.guide.goals || [],
      classroomOutputs: period.archiveCard?.keyPoints || [],
      learningShift: period.detailContent?.learningTakeaways || [],
    },
    teachingDesign: {
      mentorRoles: period.guide.highlights || [],
      sessionStructure: teachingDesign.bullets || [],
      trainingFocus: period.guide.goals || [],
      designHighlights: (period.guide.highlights || []).slice(0, 3),
    },
    sectionSummaries: buildSectionSummaries(),
  };
}

export function buildCourseContentProfile(period) {
  return loadCourseContentProfileSource(period.slug) || buildStructuredFallbackProfile(period);
}
