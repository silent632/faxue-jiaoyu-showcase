const STANDARD_COURSE_MATERIALS = [
  { slug: "teaching-guide", label: "教学材料指南", shortLabel: "教学材料指南", group: "教学设计类", order: 1 },
  { slug: "jurisprudence-guide", label: "裁判文书法理导学", shortLabel: "法理导学", group: "教学设计类", order: 2 },
  { slug: "study-task-sheet", label: "裁判文书研习任务单", shortLabel: "研习任务单", group: "教学设计类", order: 3 },
  { slug: "mentor-role-plan", label: "双师职责分工表", shortLabel: "职责分工表", group: "课堂实施类", order: 4 },
  { slug: "classroom-observation", label: "双师课堂记录观察表", shortLabel: "课堂观察表", group: "课堂实施类", order: 5 },
  { slug: "peer-review-theory", label: "双师合作互评问卷（理论导师）", shortLabel: "互评问卷（理论）", group: "协同反思类", order: 6 },
  { slug: "peer-review-practice", label: "双师合作互评问卷（实务导师）", shortLabel: "互评问卷（实务）", group: "协同反思类", order: 7 },
  { slug: "evaluation-metrics", label: "学生综合能力评价指标体系", shortLabel: "能力指标体系", group: "学习成果类", order: 8 },
  { slug: "study-report-01", label: "学生研习报告（一）", shortLabel: "研习报告（一）", group: "学习成果类", order: 9 },
  { slug: "study-report-02", label: "学生研习报告（二）", shortLabel: "研习报告（二）", group: "学习成果类", order: 10 },
  { slug: "study-report-03", label: "学生研习报告（三）", shortLabel: "研习报告（三）", group: "学习成果类", order: 11 },
  { slug: "feedback-01", label: "学生课后反馈（一）", shortLabel: "课后反馈（一）", group: "学习成果类", order: 12 },
  { slug: "feedback-02", label: "学生课后反馈（二）", shortLabel: "课后反馈（二）", group: "学习成果类", order: 13 },
  { slug: "feedback-03", label: "学生课后反馈（三）", shortLabel: "课后反馈（三）", group: "学习成果类", order: 14 },
];

function uniqueTexts(items, limit = Infinity) {
  const seen = new Set();
  const result = [];

  for (const item of items || []) {
    if (typeof item !== "string") continue;
    const text = item.trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
    if (result.length >= limit) break;
  }

  return result;
}

function ensureSections(sections) {
  return sections.filter(
    (section) =>
      section &&
      section.title &&
      ((Array.isArray(section.paragraphs) && section.paragraphs.length > 0) ||
        (Array.isArray(section.bullets) && section.bullets.length > 0) ||
        (Array.isArray(section.cards) && section.cards.length > 0) ||
        (Array.isArray(section.scoreItems) && section.scoreItems.length > 0))
  );
}

function sanitizePublicMaterialText(value) {
  return String(value || "")
    .replace(/章节配音稿与内容导图/gu, "课程正文导引与内容结构")
    .replace(/章节配音稿/gu, "课程正文讲授稿")
    .replace(/配音稿/gu, "讲授稿")
    .replace(/内容导图/gu, "内容结构图")
    .replace(/逐页时长表/gu, "内容节奏校准表")
    .replace(/时长审核结论/gu, "课堂节奏审阅结论")
    .replace(/资料包制作清单/gu, "课程资料配置表")
    .replace(/manifest/giu, "材料目录");
}

function makeHref(period, slug) {
  return `/courses/${period.slug}/${slug}`;
}

function withNavigation(period, pages) {
  return pages.map((page, index) => ({
    ...page,
    previousPage: index > 0 ? { slug: pages[index - 1].slug, label: pages[index - 1].label, href: pages[index - 1].href } : null,
    nextPage: index < pages.length - 1 ? { slug: pages[index + 1].slug, label: pages[index + 1].label, href: pages[index + 1].href } : null,
  }));
}

function findRichSections(period, key) {
  return Array.isArray(period.courseContentProfile.sectionRichContent?.[key])
    ? period.courseContentProfile.sectionRichContent[key]
    : [];
}

function buildMaterialDirectory(period) {
  const grouped = new Map();

  for (const definition of STANDARD_COURSE_MATERIALS) {
    if (!grouped.has(definition.group)) {
      grouped.set(definition.group, []);
    }

    grouped.get(definition.group).push({
      slug: definition.slug,
      order: definition.order,
      label: definition.label,
      shortLabel: definition.shortLabel,
      href: makeHref(period, definition.slug),
    });
  }

  return Array.from(grouped.entries()).map(([title, items]) => ({ title, items }));
}

function buildMaterialInterpretationCards(period) {
  const interpretation = period.courseContentProfile.materialsInterpretation || {};
  const items = [
    ...(interpretation.courseware || []),
    ...(interpretation.guideReading || []),
    ...(interpretation.taskDesign || []),
    ...(interpretation.supportingMaterials || []),
  ];

  return items.slice(0, 4).map((item) => ({
    title: sanitizePublicMaterialText(item.title),
    meta: item.role ? [{ label: "课堂作用", value: sanitizePublicMaterialText(item.role) }] : [],
    paragraphs: item.content ? [sanitizePublicMaterialText(item.content)] : [],
  }));
}

function buildTeachingGuideSections(period) {
  const rich = findRichSections(period, "introduction");
  if (rich.length > 0) return rich;

  const bullets = [
    `课程主题：${period.guide.courseTheme || period.courseContentProfile.periodSummary.theme || period.theme}。`,
    period.guide.audience ? `授课对象：${period.guide.audience}。` : "",
    period.guide.theoryMentor ? `理论导师：${period.guide.theoryMentor}。` : "",
    period.guide.practiceMentor ? `实务导师：${period.guide.practiceMentor}。` : "",
  ];
  const materialCards = buildMaterialInterpretationCards(period);

  return ensureSections([
    {
      title: "本期课程概况",
      bullets: uniqueTexts(bullets),
    },
    {
      title: "学习目标与前置要求",
      bullets: uniqueTexts([...(period.guide.goals || []), ...(period.guide.preStudy || [])], 8),
    },
    {
      title: "材料结构与课堂任务",
      intro: `${period.period}统一沿用教学设计、课堂实施、协同反思、学习成果四类材料，具体内容围绕本期主题分别展开。`,
      bullets: uniqueTexts(period.guide.highlights || [], 3),
      cards: materialCards,
    },
  ]);
}

function buildJurisprudenceGuideSections(period) {
  const rich = findRichSections(period, "content");
  if (rich.length > 0) return rich;

  const profile = period.courseContentProfile;
  return ensureSections([
    {
      title: "核心案例与争议焦点",
      bullets: uniqueTexts(
        [...profile.caseStudy.mainCases, ...profile.caseStudy.supportCases, ...profile.caseStudy.controversies],
        8
      ),
    },
    {
      title: "法理提炼",
      bullets: uniqueTexts([...profile.caseStudy.comparisonPoints, ...profile.caseStudy.analysisPath], 8),
    },
    {
      title: "内容推进",
      bullets: uniqueTexts(profile.contentFlow.map((item) => `${item.title}：${item.goal}`), 6),
    },
  ]);
}

function buildTaskSheetSections(period) {
  const profile = period.courseContentProfile;
  const rich = findRichSections(period, "questions");
  if (rich.length > 0) return rich;

  return ensureSections([
    {
      title: "学习目标",
      bullets: uniqueTexts(period.guide.goals || [], 6),
    },
    {
      title: "研习指引",
      bullets: uniqueTexts(profile.coreQuestions.map((item) => item.question), 6),
    },
    {
      title: "分析路径与成果要求",
      bullets: uniqueTexts(
        [...profile.caseStudy.analysisPath, ...profile.teachingDesign.trainingFocus, ...profile.studentOutcomes.reportFindings],
        8
      ),
    },
  ]);
}

function buildMentorRoleSections(period) {
  const profile = period.courseContentProfile;
  return ensureSections([
    {
      title: "双师职责",
      bullets: uniqueTexts(profile.teachingDesign.mentorRoles, 6),
    },
    {
      title: "课堂推进顺序",
      bullets: uniqueTexts(profile.teachingDesign.sessionStructure, 6),
    },
    {
      title: "设计重点",
      bullets: uniqueTexts(profile.teachingDesign.designHighlights, 6),
    },
  ]);
}

function buildObservationSections(period) {
  const profile = period.courseContentProfile;
  return ensureSections([
    {
      title: "课堂观察重点",
      bullets: uniqueTexts(
        [...profile.contentFlow.map((item) => item.title), ...profile.studentOutcomes.classroomOutputs],
        8
      ),
    },
    {
      title: "课堂运行反馈",
      bullets: uniqueTexts([...profile.studentOutcomes.learningShift, ...profile.teachingDesign.trainingFocus], 6),
    },
    {
      title: "观察结论",
      paragraphs: uniqueTexts(
        [
          `${period.period}的课堂推进围绕“${profile.periodSummary.theme || period.theme}”展开，重点在于把课程主题压进可讨论、可验证的课堂动作中。`,
          `${period.period}的课堂观察围绕双师配合、学生追问与表达质量形成结构化记录，重点回到课堂判断如何真正生成。`,
        ],
        2
      ),
    },
  ]);
}

function buildPeerReviewSections(period, perspective) {
  const profile = period.courseContentProfile;
  const reviewerLabel = perspective === "theory" ? "理论导师视角" : "实务导师视角";
  return ensureSections([
    {
      title: `${reviewerLabel}下的合作亮点`,
      bullets: uniqueTexts([...profile.teachingDesign.designHighlights, ...profile.teachingDesign.mentorRoles], 6),
    },
    {
      title: "协作成效",
      bullets: uniqueTexts([...profile.studentOutcomes.classroomOutputs, ...profile.studentOutcomes.learningShift], 6),
    },
    {
      title: "下一轮改进方向",
      paragraphs: uniqueTexts(
        [
          `${period.period}的双师合作已经形成稳定分工，但仍需继续压实“理论概念如何进入案例细节”“实务难题如何回收为法理判断”这两条连接线。`,
          `协作的关键不在并列发言，而在围绕同一课程目标形成可复盘的推进机制和课堂收束路径。`,
        ],
        2
      ),
    },
  ]);
}

function buildEvaluationSections(period) {
  const profile = period.courseContentProfile;
  return ensureSections([
    {
      title: "评价维度",
      bullets: uniqueTexts(
        [
          ...period.guide.goals,
          ...profile.teachingDesign.trainingFocus,
          ...profile.studentOutcomes.learningShift,
        ],
        8
      ),
    },
    {
      title: "评价指标对应的课程目标",
      bullets: uniqueTexts(
        [
          `${period.period}要求学生把“${profile.periodSummary.theme || period.theme}”转成结构化判断。`,
          ...profile.studentOutcomes.reportFindings,
          ...profile.studentOutcomes.feedbackInsights,
        ],
        8
      ),
    },
  ]);
}

function buildReportSections(period, order) {
  const profile = period.courseContentProfile;
  const question = profile.coreQuestions[order - 1]?.question || profile.coreQuestions[0]?.question || `${period.period}核心问题`;
  const finding = profile.studentOutcomes.reportFindings[order - 1] || profile.studentOutcomes.reportFindings[0] || `${period.period}围绕核心案例形成结构化研习输出。`;
  const path = profile.caseStudy.analysisPath[order - 1] || profile.caseStudy.analysisPath[0] || `${period.period}要求学生把案例分析推进到可论证结论。`;

  return ensureSections([
    {
      title: `研习报告视角${order}`,
      paragraphs: [
        `${period.period}的这一份代表性研习输出围绕“${question}”展开，重点展示学生如何把课堂主题推成完整论证。`,
      ],
    },
    {
      title: "代表性判断",
      bullets: uniqueTexts([finding, ...profile.caseStudy.comparisonPoints], 6),
    },
    {
      title: "论证路径",
      bullets: uniqueTexts([path, ...profile.teachingDesign.trainingFocus], 6),
    },
  ]);
}

function buildFeedbackSections(period, order) {
  const profile = period.courseContentProfile;
  const insight = profile.studentOutcomes.feedbackInsights[order - 1] || profile.studentOutcomes.feedbackInsights[0] || `${period.period}反馈集中讨论课程主题如何进入真实判断。`;
  const shift = profile.studentOutcomes.learningShift[order - 1] || profile.studentOutcomes.learningShift[0] || `${period.period}希望学生从材料阅读走向结构化判断。`;

  return ensureSections([
    {
      title: `反馈焦点${order}`,
      paragraphs: [
        `${period.period}的这一组课后反馈集中反映学生对课堂主题、案例难点与法理方法的真实理解和继续追问。`,
      ],
    },
    {
      title: "学生感受到的课堂收获",
      bullets: uniqueTexts([insight, ...profile.studentOutcomes.classroomOutputs], 6),
    },
    {
      title: "学习转变与遗留问题",
      bullets: uniqueTexts([shift, ...profile.coreQuestions.map((item) => item.question)], 6),
    },
  ]);
}

function buildOverrideLead(period, definition) {
  const theme = period.guide.courseTheme || period.courseContentProfile.periodSummary.theme || period.theme;

  switch (definition.slug) {
    case "teaching-guide":
      return `${period.period}围绕“${theme}”组织整期课程设计，交代课程定位、目标、材料结构与使用顺序。`;
    case "jurisprudence-guide":
      return `${period.period}的法理导学页负责把核心案例、关键法理和分析路径压成可阅读的判断框架。`;
    case "study-task-sheet":
      return `${period.period}的研习任务单页负责把法理主题转成学生必须完成的分析任务与成果要求。`;
    case "mentor-role-plan":
      return `${period.period}通过职责分工表展示理论导师与实务导师如何围绕同一课程目标分工协作。`;
    case "classroom-observation":
      return `${period.period}的课堂观察页聚焦课堂推进、互动效果与学生响应，展示课程实施如何真正落地。`;
    case "peer-review-theory":
      return `${period.period}从理论导师视角回看双师合作，重点呈现协作亮点、课堂衔接与后续改进方向。`;
    case "peer-review-practice":
      return `${period.period}从实务导师视角回看双师合作，重点呈现案例进入、课堂互动与改进建议。`;
    case "evaluation-metrics":
      return `${period.period}的能力评价页说明课程如何把学习目标转成可观察、可判断的评价标准。`;
    case "study-report-01":
    case "study-report-02":
    case "study-report-03":
      return `${period.period}的研习报告页展示学生如何围绕本期主题形成结构化判断，而不是停留在材料摘抄。`;
    case "feedback-01":
    case "feedback-02":
    case "feedback-03":
      return `${period.period}的课后反馈页整理学生对课堂主题、案例难点与法理方法的真实回应。`;
    default:
      return `${period.period}材料页`;
  }
}

function buildPurpose(period, definition) {
  switch (definition.slug) {
    case "teaching-guide":
      return `证明${period.period}的课程主题、目标和材料组织是如何形成完整教学设计的。`;
    case "jurisprudence-guide":
      return `证明${period.period}如何把核心案例压缩为可教学、可讨论的法理判断框架。`;
    case "study-task-sheet":
      return `证明${period.period}如何把课程主题转成清晰的学生任务与课堂输出要求。`;
    case "mentor-role-plan":
      return `证明${period.period}的双师课堂并非并列授课，而是存在明确分工与推进顺序。`;
    case "classroom-observation":
      return `证明${period.period}的课堂实施并非停留在设计层，而是形成了真实的互动与观察结论。`;
    case "peer-review-theory":
    case "peer-review-practice":
      return `证明${period.period}在课后具有可复盘的协作反思机制。`;
    case "evaluation-metrics":
      return `证明${period.period}对学生学习成果具有明确评价逻辑，而不是只展示结果样本。`;
    case "study-report-01":
    case "study-report-02":
    case "study-report-03":
      return `证明${period.period}的学生输出能够回应核心案例与法理问题。`;
    case "feedback-01":
    case "feedback-02":
    case "feedback-03":
      return `证明${period.period}的课堂理解确实在学生端留下了可追踪的反馈和追问。`;
    default:
      return `${period.period}课程材料页。`;
  }
}

function buildMaterialSections(period, definition) {
  switch (definition.slug) {
    case "teaching-guide":
      return buildTeachingGuideSections(period);
    case "jurisprudence-guide":
      return buildJurisprudenceGuideSections(period);
    case "study-task-sheet":
      return buildTaskSheetSections(period);
    case "mentor-role-plan":
      return buildMentorRoleSections(period);
    case "classroom-observation":
      return buildObservationSections(period);
    case "peer-review-theory":
      return buildPeerReviewSections(period, "theory");
    case "peer-review-practice":
      return buildPeerReviewSections(period, "practice");
    case "evaluation-metrics":
      return buildEvaluationSections(period);
    case "study-report-01":
      return buildReportSections(period, 1);
    case "study-report-02":
      return buildReportSections(period, 2);
    case "study-report-03":
      return buildReportSections(period, 3);
    case "feedback-01":
      return buildFeedbackSections(period, 1);
    case "feedback-02":
      return buildFeedbackSections(period, 2);
    case "feedback-03":
      return buildFeedbackSections(period, 3);
    default:
      return [];
  }
}

function buildMaterialPage(period, definition) {
  return {
    ...definition,
    href: makeHref(period, definition.slug),
    lead: buildOverrideLead(period, definition),
    purpose: buildPurpose(period, definition),
    sections: buildMaterialSections(period, definition),
  };
}

export function buildCourseMaterialPages(period) {
  const pages = STANDARD_COURSE_MATERIALS.map((definition) => buildMaterialPage(period, definition));
  return {
    materialDirectory: buildMaterialDirectory(period),
    materialPages: withNavigation(period, pages),
  };
}

export { STANDARD_COURSE_MATERIALS };
