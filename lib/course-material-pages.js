const STANDARD_COURSE_MATERIALS = [
  { slug: "teaching-guide", label: "教学材料指南", shortLabel: "教学材料指南", group: "教学设计类", order: 1 },
  { slug: "jurisprudence-guide", label: "裁判文书法理导学", shortLabel: "法理导学", group: "教学设计类", order: 2 },
  { slug: "study-task-sheet", label: "裁判文书研习任务单", shortLabel: "研习任务单", group: "教学设计类", order: 3 },
  { slug: "mentor-role-plan", label: "双师职责分工表", shortLabel: "职责分工表", group: "课堂实施类", order: 4 },
  { slug: "classroom-observation", label: "双师课堂记录观察表", shortLabel: "课堂观察表", group: "课堂实施类", order: 5 },
  { slug: "peer-review-theory", label: "双师合作互评问卷（理论导师）", shortLabel: "互评问卷（理论）", group: "协同反思类", order: 6 },
  { slug: "peer-review-practice", label: "双师合作互评问卷（实务导师）", shortLabel: "互评问卷（实务）", group: "协同反思类", order: 7 },
  { slug: "evaluation-metrics", label: "学生综合能力评价指标体系", shortLabel: "能力指标体系", group: "学习成果类", order: 8 },
  { slug: "study-report", label: "学生研习报告", shortLabel: "研习报告", group: "学习成果类", order: 9 },
  { slug: "feedback", label: "学生课后反馈", shortLabel: "课后反馈", group: "学习成果类", order: 10 },
];

const COURSE_MATERIAL_SLUG_MAP = {
  "study-report-01": "study-report",
  "study-report-02": "study-report",
  "study-report-03": "study-report",
  "feedback-01": "feedback",
  "feedback-02": "feedback",
  "feedback-03": "feedback",
};

function resolveCourseMaterialSlug(slug) {
  return COURSE_MATERIAL_SLUG_MAP[slug] || slug;
}

function getCourseMaterialStaticSlugs() {
  const slugs = STANDARD_COURSE_MATERIALS.map((item) => item.slug);
  const legacySlugs = Object.keys(COURSE_MATERIAL_SLUG_MAP);
  return Array.from(new Set([...slugs, ...legacySlugs]));
}

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
    .replace(/配音稿/gu, "讲授主线")
    .replace(/内容导图/gu, "内容结构图")
    .replace(/内容展开页/gu, "课程正文")
    .replace(/材料页/gu, "材料说明")
    .replace(/制作层文件/gu, "原始文件名")
    .replace(/逐页时长表/gu, "内容节奏校准表")
    .replace(/时长审核结论/gu, "课堂节奏审阅结论")
    .replace(/资料包制作清单/gu, "课程资料配置表")
    .replace(/manifest/giu, "材料目录")
    .replace(/\.pptx/giu, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function sanitizePublicMaterialPayload(value) {
  if (typeof value === "string") {
    return sanitizePublicMaterialText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePublicMaterialPayload(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizePublicMaterialPayload(item)])
    );
  }

  return value;
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
    ? sanitizePublicMaterialPayload(period.courseContentProfile.sectionRichContent[key])
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

function buildMaterialInterpretationNotes(period) {
  const interpretation = period.courseContentProfile.materialsInterpretation || {};
  const items = [
    ...(interpretation.courseware || []),
    ...(interpretation.guideReading || []),
    ...(interpretation.taskDesign || []),
    ...(interpretation.supportingMaterials || []),
  ];

  return items
    .slice(0, 4)
    .map((item) =>
      uniqueTexts(
        [
          item.title && item.content
            ? `${sanitizePublicMaterialText(item.title)}：${sanitizePublicMaterialText(item.content)}`
            : item.title && item.role
              ? `${sanitizePublicMaterialText(item.title)}：${sanitizePublicMaterialText(item.role)}`
              : sanitizePublicMaterialText(item.content || item.role || item.title),
        ],
        1
      )[0]
    )
    .filter(Boolean);
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
  const materialNotes = buildMaterialInterpretationNotes(period);

  return ensureSections([
    {
      title: "课程基本信息",
      bullets: uniqueTexts(bullets),
    },
    {
      title: "学习目标与预习要求",
      bullets: uniqueTexts([...(period.guide.goals || []), ...(period.guide.preStudy || [])], 8),
    },
    {
      title: "材料如何进入课堂",
      paragraphs: materialNotes,
      bullets: uniqueTexts(period.guide.highlights || [], 4),
    },
  ]);
}

function buildJurisprudenceGuideSections(period) {
  const rich = findRichSections(period, "content");
  if (rich.length > 0) return rich;

  const profile = period.courseContentProfile;
  return ensureSections([
    {
      title: "核心案例与争点",
      bullets: uniqueTexts(
        [...profile.caseStudy.mainCases, ...profile.caseStudy.supportCases, ...profile.caseStudy.controversies],
        8
      ),
    },
    {
      title: "判断路径",
      paragraphs: uniqueTexts(profile.contentFlow.slice(0, 2).map((item) => `${item.title}：${item.goal}`), 2),
      bullets: uniqueTexts([...profile.caseStudy.comparisonPoints, ...profile.caseStudy.analysisPath], 8),
    },
  ]);
}

function buildTaskSheetSections(period) {
  const profile = period.courseContentProfile;
  const rich = findRichSections(period, "questions");
  if (rich.length > 0) return rich;

  return ensureSections([
    {
      title: "学生需要完成的问题",
      bullets: uniqueTexts(profile.coreQuestions.map((item) => item.question), 6),
    },
    {
      title: "分析路径与成果要求",
      paragraphs: uniqueTexts(period.guide.goals || [], 2),
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
      title: "双师如何分工",
      bullets: uniqueTexts(profile.teachingDesign.mentorRoles, 6),
    },
    {
      title: "课堂推进顺序",
      paragraphs: uniqueTexts(profile.teachingDesign.designHighlights, 2),
      bullets: uniqueTexts(profile.teachingDesign.sessionStructure, 6),
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
      title: "课堂运行与观察结论",
      paragraphs: uniqueTexts(
        [
          `${period.period}的课堂推进围绕“${profile.periodSummary.theme || period.theme}”展开，重点在于把课程主题压进可讨论、可验证的课堂动作中。`,
          `${period.period}的课堂观察围绕双师配合、学生追问与表达质量形成结构化记录，重点回到课堂判断如何真正生成。`,
        ],
        2
      ),
      bullets: uniqueTexts([...profile.studentOutcomes.learningShift, ...profile.teachingDesign.trainingFocus], 6),
    },
  ]);
}

function buildPeerReviewSections(period, perspective) {
  const profile = period.courseContentProfile;
  const reviewerLabel = perspective === "theory" ? "理论导师视角" : "实务导师视角";
  return ensureSections([
    {
      title: `${reviewerLabel}下的协作亮点`,
      bullets: uniqueTexts([...profile.teachingDesign.designHighlights, ...profile.teachingDesign.mentorRoles], 6),
    },
    {
      title: "协作成效与下一轮改进",
      paragraphs: uniqueTexts(
        [
          `${period.period}的双师合作已经形成稳定分工，但仍需继续压实“理论概念如何进入案例细节”“实务难题如何回收为法理判断”这两条连接线。`,
          `协作的关键不在并列发言，而在围绕同一课程目标形成可复盘的推进机制和课堂收束路径。`,
        ],
        2
      ),
      bullets: uniqueTexts([...profile.studentOutcomes.classroomOutputs, ...profile.studentOutcomes.learningShift], 6),
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

function buildReportSections(period) {
  const profile = period.courseContentProfile;
  const questions = uniqueTexts(profile.coreQuestions.map((item) => item.question), 3);
  const fallbackFinding = profile.studentOutcomes.reportFindings[0] || `${period.period}围绕核心争点形成可论证的书面输出。`;
  const fallbackPath = profile.caseStudy.analysisPath[0] || `${period.period}要求学生把案例分析推进到可复盘结论。`;
  const findings = uniqueTexts([...profile.studentOutcomes.reportFindings, fallbackFinding], 3);
  const paths = uniqueTexts([...profile.caseStudy.analysisPath, fallbackPath], 3);
  const theme = profile.periodSummary.theme || period.theme || period.period;
  const headlineQuestion = questions[0] || `${period.period}核心问题`;
  const overviewFinding = findings[0] || `${period.period}围绕核心场景形成可复盘的书面判断。`;

  const sampleCount = Math.max(questions.length, findings.length, paths.length, 1);
  const sampleCards = Array.from({ length: sampleCount }, (_, index) => {
    const title = questions[index] || findings[index] || paths[index] || `${period.period}研习样本`;
    const paragraphs = uniqueTexts([findings[index] || findings[0], paths[index] || paths[0]], 2);
    return { title, paragraphs };
  }).filter((card) => Array.isArray(card.paragraphs) && card.paragraphs.length > 0);

  return ensureSections([
    {
      title: "研习报告的总体回应与问题定位",
      paragraphs: [
        `${period.period}研习报告围绕“${headlineQuestion}”展开，核心目标是把“${theme}”转成可论证的书面判断，而不是复述课堂观点。`,
      ],
      bullets: uniqueTexts([overviewFinding, ...profile.studentOutcomes.reportFindings], 3),
    },
    {
      title: "代表性书面样本",
      cards: sampleCards,
    },
    {
      title: "论证推进的共通路径",
      bullets: uniqueTexts(
        [...profile.caseStudy.analysisPath, ...profile.caseStudy.comparisonPoints, ...profile.teachingDesign.trainingFocus],
        8
      ),
    },
  ]);
}

function buildFeedbackSections(period) {
  const profile = period.courseContentProfile;
  const insights = uniqueTexts(profile.studentOutcomes.feedbackInsights, 4);
  const shifts = uniqueTexts(profile.studentOutcomes.learningShift, 3);

  return ensureSections([
    {
      title: "课后判断与共识",
      bullets: uniqueTexts([...insights, ...profile.studentOutcomes.classroomOutputs], 6),
    },
    {
      title: "课堂进入学生端的地方",
      paragraphs: uniqueTexts(shifts, 2),
      bullets: uniqueTexts(
        [...profile.teachingDesign.designHighlights, ...profile.teachingDesign.mentorRoles, ...profile.studentOutcomes.classroomOutputs],
        6
      ),
    },
    {
      title: "继续追问的问题",
      paragraphs: uniqueTexts(shifts.slice(0, 1), 1),
      bullets: uniqueTexts(profile.coreQuestions.map((item) => item.question), 6),
    },
  ]);
}

function buildOverrideLead(period, definition) {
  const theme = period.guide.courseTheme || period.courseContentProfile.periodSummary.theme || period.theme;

  switch (definition.slug) {
    case "teaching-guide":
      return `${period.period}围绕“${theme}”交代课程定位、学习目标和材料使用顺序，先把这一期课怎么进入正文说清楚。`;
    case "jurisprudence-guide":
      return `${period.period}把核心案例、关键法理和分析路径收束在同一页里，先建立判断框架，再进入课堂讨论。`;
    case "study-task-sheet":
      return `${period.period}把法理主题改写成学生必须完成的问题链、分析路径和输出要求。`;
    case "mentor-role-plan":
      return `${period.period}把理论导师与实务导师的分工、衔接节点和课堂推进顺序放在同一条线上展示。`;
    case "classroom-observation":
      return `${period.period}回看课堂真实运行，重点看双师配合、学生追问和讨论效果是否真正落地。`;
    case "peer-review-theory":
      return `${period.period}从理论导师视角回看双师合作，重点看法理讲授和案例推进是如何接上同一目标的。`;
    case "peer-review-practice":
      return `${period.period}从实务导师视角回看双师合作，重点看案例切入、课堂互动和后续改进该如何继续压实。`;
    case "evaluation-metrics":
      return `${period.period}说明课程怎样把学习目标改成可观察、可判断、可追踪的评价标准。`;
    case "study-report":
      return `${period.period}整合多组学生研习报告，集中呈现总体回应、代表性书面样本与共通论证路径。`;
    case "feedback":
      return `${period.period}汇集学生在课后留下的理解、保留意见和继续追问，直接反映课堂是否真正进入学生端。`;
    default:
      return `${period.period}围绕本组材料整理课程主题、判断路径与学习成果。`;
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
    case "study-report":
      return buildReportSections(period);
    case "feedback":
      return buildFeedbackSections(period);
    default:
      return [];
  }
}

function buildMaterialPage(period, definition) {
  return {
    ...definition,
    href: makeHref(period, definition.slug),
    lead: sanitizePublicMaterialPayload(buildOverrideLead(period, definition)),
    sections: sanitizePublicMaterialPayload(buildMaterialSections(period, definition)),
  };
}

export function buildCourseMaterialPages(period) {
  const pages = STANDARD_COURSE_MATERIALS.map((definition) => buildMaterialPage(period, definition));
  return {
    materialDirectory: buildMaterialDirectory(period),
    materialPages: withNavigation(period, pages),
  };
}

export { STANDARD_COURSE_MATERIALS, getCourseMaterialStaticSlugs, resolveCourseMaterialSlug };
