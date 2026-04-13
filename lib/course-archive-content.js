const PRODUCTION_MATERIAL_NAMES = new Set([
  "章节配音稿",
  "资料包制作清单",
  "逐页时长表",
  "时长审核结论",
]);

const PRODUCTION_MATERIAL_SUMMARIES = {
  "章节配音稿": "章节配音稿把课堂表达编排成可以落地录制的语音节奏，用于统一双师的讲述口径。",
  "资料包制作清单": "资料包制作清单记录素材、拍摄与剪辑的处理顺序，确保成果节奏一致。",
  "逐页时长表": "逐页时长表帮助梳理每段表达的时长，支持节奏与问题密度的微调。",
  "时长审核结论": "时长审核结论为视频化表达提供把控节奏与合规性的最终判断。",
};

const BANNED_ARCHIVE_LABELS = /课程定位与双师设计页|学习目标页|内容导图页|示范课程视频展示|资源化表达的延展方向|阶段性收束/u;

const REQUIRED_LEAD_KEYWORDS = {
  第五期: ["非法证据", "程序正义", "取证权力"],
  第六期: ["人脸识别", "同意边界", "人格权"],
  第七期: ["平台", "算法", "劳动关系"],
  第八期: ["生成式 AI", "作品认定", "责任边界"],
};

const PERIOD_CONTENT_FALLBACKS = {
  第一期: {
    archiveCard: {
      lead: "从类案检索进入裁判文书阅读，逐步建立争点识别与导读判断。",
      keyPoints: ["类案检索", "争点识别", "导读训练"],
      contentType: "课堂问题推进",
    },
  },
  第五期: {
    archiveCard: {
      lead: "围绕非法证据排除与取证权力边界，追问程序正义如何落到证据规则上。",
      keyPoints: ["非法证据", "程序正义", "取证权力"],
      contentType: "程序正义专题",
    },
  },
  第六期: {
    archiveCard: {
      lead: "从人脸识别的同意边界切入，讨论人格权保护与技术治理的张力。",
      keyPoints: ["人脸识别", "同意边界", "人格权"],
      contentType: "数字人格权专题",
    },
  },
  第七期: {
    archiveCard: {
      lead: "聚焦平台用工与算法管理，重新界定平台、算法与劳动关系。",
      keyPoints: ["平台", "算法", "劳动关系"],
      contentType: "平台劳动专题",
    },
  },
  第八期: {
    archiveCard: {
      lead: "以生成式 AI 的作品认定争议为轴，厘清责任边界与权利归属。",
      keyPoints: ["生成式 AI", "作品认定", "责任边界"],
      contentType: "生成式 AI 专题",
    },
  },
};

const DEFAULT_ARCHIVE_CARD = {
  lead: "课程以案例进入为主线，把检索、阅读与表达串联成可阅读的课堂内容。",
  keyPoints: ["问题导读", "案例阅读", "表达训练"],
  contentType: "课程问题导览",
};

const DEFAULT_DETAIL_CONTENT = {
  intro: [
    "第一期把抽象法律方法落到可操作的检索路径上。",
    "课程从真实争议切入，逐步进入案例导读与表达训练。",
  ],
  keyQuestions: [
    "为什么同类案件会出现不同裁判路径？",
    "类案检索如何帮助进入法律适用判断？",
    "导读判断应当抓住哪些争点？",
  ],
  sections: [
    {
      title: "从检索进入案例",
      body: "先通过真实争议搭建检索范围，再从类案结果中挑出具有比较价值的裁判文书。",
    },
    {
      title: "从阅读识别争点",
      body: "围绕事实认定、法律关系和裁判理由展开导读，训练学生在阅读中识别争点。",
    },
    {
      title: "从讨论转向表达",
      body: "把讨论结果转成课堂表达任务，让学生尝试用检索材料支撑自己的判断。",
    },
  ],
  materialHighlights: [
    {
      title: "课件内容",
      summary: "课件负责搭建类案检索、阅读路径和争点提炼的课堂主线。",
    },
    {
      title: "专题阅读",
      summary: "专题阅读补充了同案不同判背后的裁量空间与技术辅助问题。",
    },
  ],
  teachingDesign: {
    summary: "双师围绕案例进入、问题追问和表达训练分工推进。",
    bullets: [
      "理论教师负责方法框架和争点提炼。",
      "实务教师负责结合裁判经验补充检索与判断路径。",
    ],
  },
  learningTakeaways: [
    "能够建立类案检索到文书导读的基本路径。",
    "能够围绕具体争点组织初步的法理表达。",
  ],
};

const LATE_QUESTIONS = [
  "章节配音稿如何让双师表达保持一致的节奏与口径？",
  "制作清单如何确保素材、拍摄与剪辑顺序可控？",
  "时长表与审核结论如何帮助课程视频保持实践感与批判性？",
];

const LATE_SECTIONS = [
  {
    title: "脚本与配音",
    body: "章节配音稿把课堂讲述、案例展示与问题追问串联成可录制的表达流程。",
  },
  {
    title: "资源与制作清单",
    body: "制作清单列出主讲、案例素材、示范片段与实践活动的处理顺序，保障视频化表达前的准备。",
  },
  {
    title: "节奏与审核",
    body: "逐页时长表和审核结论协助把控每段表达的节奏，确保法理与实践的强度均衡。",
  },
];

function ensureArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function trimText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function appendUnique(target, source) {
  for (const item of source) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!target.includes(trimmed)) {
      target.push(trimmed);
    }
  }
}

function filterArchiveLabels(items) {
  return items.filter((item) => !BANNED_ARCHIVE_LABELS.test(item));
}

function hasRequiredKeywords(period, text) {
  const keywords = REQUIRED_LEAD_KEYWORDS[period];
  if (!keywords) return true;
  return keywords.every((keyword) => text.includes(keyword));
}

function hasProductionMaterials(materialGroups) {
  if (!Array.isArray(materialGroups)) return false;
  for (const group of materialGroups) {
    const items = group?.items;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item || typeof item.displayName !== "string") continue;
      if (PRODUCTION_MATERIAL_NAMES.has(item.displayName)) {
        return true;
      }
    }
  }
  return false;
}

function keyPointsCoverKeywords(period, points) {
  const keywords = REQUIRED_LEAD_KEYWORDS[period];
  if (!keywords) return true;
  const text = points.join(" ");
  return keywords.every((keyword) => text.includes(keyword));
}

function buildArchiveKeyPoints(period, raw, fallback) {
  if (REQUIRED_LEAD_KEYWORDS[period] && Array.isArray(fallback?.keyPoints)) {
    return filterArchiveLabels(fallback.keyPoints).slice(0, 3);
  }
  const points = [];
  appendUnique(points, ensureArray(raw.outline));
  appendUnique(points, ensureArray(raw.guide?.highlights));
  let sanitized = filterArchiveLabels(points);
  appendUnique(sanitized, fallback?.keyPoints ?? []);
  if (sanitized.length < 2) {
    appendUnique(sanitized, DEFAULT_ARCHIVE_CARD.keyPoints);
  }
  sanitized = filterArchiveLabels(sanitized);
  if (!keyPointsCoverKeywords(period, sanitized)) {
    sanitized = filterArchiveLabels(fallback?.keyPoints ?? []);
  }
  return sanitized.slice(0, 3);
}

function buildArchiveCard(period, raw, isLate) {
  const fallback = PERIOD_CONTENT_FALLBACKS[period]?.archiveCard ?? DEFAULT_ARCHIVE_CARD;
  const summary = trimText(raw.summary);
  const coursePosition = trimText(raw.guide?.coursePosition);
  let lead = summary && !BANNED_ARCHIVE_LABELS.test(summary) ? summary : "";
  if (!lead && coursePosition && !BANNED_ARCHIVE_LABELS.test(coursePosition)) {
    lead = coursePosition;
  }
  if (!lead || !hasRequiredKeywords(period, lead)) {
    lead = fallback.lead;
  }
  const keyPoints = buildArchiveKeyPoints(period, raw, fallback);
  const contentType = fallback.contentType || (isLate ? "资源化成果呈现" : "课堂问题推进");
  return { lead, keyPoints, contentType };
}

function buildDetailIntro(raw, isLate) {
  const lines = [];
  const primary = trimText(raw.guide?.coursePosition);
  if (primary) lines.push(primary);
  const summary = trimText(raw.summary);
  if (summary && !lines.includes(summary)) lines.push(summary);
  const theme = trimText(raw.theme) || trimText(raw.title);
  if (theme) {
    lines.push(`本期聚焦“${theme}”，以案例与表达推进课堂研习。`);
  }
  if (isLate && theme) {
    lines.push(`以${theme}的资源化成果展示视频化表达的实践路径。`);
  }
  if (lines.length < 2) {
    appendUnique(lines, DEFAULT_DETAIL_CONTENT.intro);
  }
  return lines.slice(0, 2);
}

function buildDetailQuestions(raw, isLate) {
  if (isLate) {
    return [...LATE_QUESTIONS];
  }
  const theme = trimText(raw.theme) || "本期课程";
  return [
    `如何通过${theme}的案例进入争点判断？`,
    `类案检索在${theme}中如何支撑学生的法理表达？`,
    `导读判断应关注哪些事实与裁判理由？`,
  ];
}

function cloneSections(source) {
  return source.map((item) => ({
    title: item.title,
    body: item.body,
  }));
}

function cloneHighlights(source) {
  return source.map((item) => ({
    title: item.title,
    summary: item.summary,
  }));
}

function buildOutlineSections(raw) {
  const outline = ensureArray(raw.outline);
  const sections = [];
  for (const title of outline.slice(0, 3)) {
    if (!title) continue;
    sections.push({
      title,
      body: `围绕${title}，本期从素材引入、争点阅读和课堂讨论多个维度展开。`,
    });
  }
  if (sections.length < 3) {
    const needed = 3 - sections.length;
    sections.push(...cloneSections(DEFAULT_DETAIL_CONTENT.sections.slice(0, needed)));
  }
  return sections;
}

function buildDetailSections(raw, isLate) {
  if (isLate) {
    return cloneSections(LATE_SECTIONS);
  }
  return buildOutlineSections(raw);
}

function describeMaterialHighlight(item, theme) {
  const title = item.displayName;
  const kind = item.kind ? `（${item.kind}）` : "";
  return `“${title}”${kind}用于支撑${theme || "本期"}的阅读与表达研习。`;
}

function findMaterialItem(materialGroups, displayName) {
  if (!Array.isArray(materialGroups)) return null;
  for (const group of materialGroups) {
    const items = group?.items;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item && typeof item.displayName === "string" && item.displayName === displayName) {
        return item;
      }
    }
  }
  return null;
}

function buildMaterialHighlights(raw, isLate) {
  const theme = trimText(raw.theme);
  if (isLate) {
    const highlights = [];
    for (const name of PRODUCTION_MATERIAL_NAMES) {
      const item = findMaterialItem(raw.materialGroups, name);
      if (item) {
        highlights.push({
          title: name,
          summary: PRODUCTION_MATERIAL_SUMMARIES[name],
        });
      }
    }
    if (highlights.length >= 2) {
      return highlights;
    }
    return [...highlights, ...cloneHighlights(DEFAULT_DETAIL_CONTENT.materialHighlights)].slice(0, 2);
  }
  const courseGroup = (raw.materialGroups || []).find((group) => group.title === "课程资料");
  if (Array.isArray(courseGroup?.items)) {
    const items = courseGroup.items.filter((item) => item && typeof item.displayName === "string");
    if (items.length) {
      return items.slice(0, 2).map((item) => ({
        title: item.displayName,
        summary: describeMaterialHighlight(item, theme),
      }));
    }
  }
  return cloneHighlights(DEFAULT_DETAIL_CONTENT.materialHighlights);
}

function buildTeachingDesign(raw, isLate) {
  const summary = trimText(raw.guide?.coursePosition)
    ? `双师围绕${trimText(raw.guide.coursePosition)}协同推进课堂。`
    : raw.module
    ? `本期模块“${raw.module}”贯穿案例与表达。`
    : DEFAULT_DETAIL_CONTENT.teachingDesign.summary;

  const bullets = [];
  const pushBullet = (text) => {
    const trimmed = trimText(text);
    if (!trimmed || bullets.includes(trimmed) || bullets.length >= 3) return;
    bullets.push(trimmed);
  };

  for (const highlight of ensureArray(raw.guide?.highlights)) {
    pushBullet(highlight);
  }
  if (raw.guide?.theoryMentor) {
    pushBullet(`理论导师 ${raw.guide.theoryMentor} 负责方法与争点框架。`);
  }
  if (raw.guide?.practiceMentor) {
    pushBullet(`实务导师 ${raw.guide.practiceMentor} 结合裁判经验补充路径。`);
  }
  while (bullets.length < 2) {
    const fallback = DEFAULT_DETAIL_CONTENT.teachingDesign.bullets[bullets.length] ??
      DEFAULT_DETAIL_CONTENT.teachingDesign.bullets[0];
    pushBullet(fallback);
  }

  return { summary, bullets };
}

function buildLearningTakeaways(raw, isLate) {
  const takeaways = ensureArray(raw.guide?.goals);
  if (takeaways.length >= 2) {
    return takeaways.slice(0, 2);
  }
  return [...DEFAULT_DETAIL_CONTENT.learningTakeaways];
}

export function buildCourseArchiveContent(period, raw = {}) {
  const isLate = hasProductionMaterials(raw.materialGroups);
  const archiveCard = buildArchiveCard(period, raw, isLate);
  const detailContent = {
    intro: buildDetailIntro(raw, isLate),
    keyQuestions: buildDetailQuestions(raw, isLate),
    sections: buildDetailSections(raw, isLate),
    materialHighlights: buildMaterialHighlights(raw, isLate),
    teachingDesign: buildTeachingDesign(raw, isLate),
    learningTakeaways: buildLearningTakeaways(raw, isLate),
  };

  return { archiveCard, detailContent };
}
