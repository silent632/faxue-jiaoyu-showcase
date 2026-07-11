import { loadCourseArchiveSource } from "./content/course-archive-source.js";

const ARCHIVE_SOURCE = loadCourseArchiveSource();
const PRODUCTION_MATERIAL_NAMES = new Set(ARCHIVE_SOURCE.productionMaterialNames || []);
const PRODUCTION_MATERIAL_SUMMARIES = ARCHIVE_SOURCE.productionMaterialSummaries || {};
const REQUIRED_LEAD_KEYWORDS = ARCHIVE_SOURCE.requiredLeadKeywords || {};
const PERIOD_CONTENT_FALLBACKS = ARCHIVE_SOURCE.periodContentFallbacks || {};
const DEFAULT_ARCHIVE_CARD = ARCHIVE_SOURCE.defaultArchiveCard || {};
const DEFAULT_DETAIL_CONTENT = ARCHIVE_SOURCE.defaultDetailContent || {};
const LATE_QUESTIONS = ARCHIVE_SOURCE.lateQuestions || [];
const LATE_SECTIONS = ARCHIVE_SOURCE.lateSections || [];
const BANNED_ARCHIVE_LABELS = new RegExp(
  (ARCHIVE_SOURCE.bannedArchiveLabels || [])
    .map((item) => item.replace(/[.*+?^\${}()|[\]\\]/gu, "\\$&"))
    .join("|") || "(?!)",
  "u"
);
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

function normalizeArchiveText(value) {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/ai/gi, "ai")
    .replace(/人工智能/g, "ai");
}

function buildKeywordChecks(period) {
  if (period === "第八期") {
    return [
      ["生成式ai", "生成式人工智能", "生成式ai"],
      ["作品认定", "作品界定"],
      ["责任边界", "责任范围"],
    ];
  }
  if (period === "第五期") {
    return [
      ["非法证据"],
      ["程序正义"],
      ["取证权力", "取证权限"],
    ];
  }
  if (period === "第六期") {
    return [
      ["人脸识别"],
      ["同意边界", "同意范围"],
      ["人格权"],
    ];
  }
  if (period === "第七期") {
    return [
      ["平台"],
      ["算法"],
      ["劳动关系"],
    ];
  }
  return [];
}

function hasRequiredKeywords(period, text) {
  const keywords = REQUIRED_LEAD_KEYWORDS[period];
  if (!keywords) return true;
  const normalized = normalizeArchiveText(text);
  const checks = buildKeywordChecks(period);
  if (!checks.length) {
    return keywords.every((keyword) => normalized.includes(normalizeArchiveText(keyword)));
  }
  return checks.every((options) =>
    options.some((option) => normalized.includes(normalizeArchiveText(option)))
  );
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
  return hasRequiredKeywords(period, points.join(" "));
}

function getKeywordGroups(period) {
  const groups = buildKeywordChecks(period);
  if (groups.length) return groups;
  const keywords = REQUIRED_LEAD_KEYWORDS[period] ?? [];
  return keywords.map((keyword) => [keyword]);
}

function getPointCoverage(period, point) {
  const groups = getKeywordGroups(period);
  const normalized = normalizeArchiveText(point);
  return groups.map((options) =>
    options.some((option) => normalized.includes(normalizeArchiveText(option)))
  );
}

function buildArchiveKeyPoints(period, raw, fallback) {
  const hasKeywordConstraint = Boolean(REQUIRED_LEAD_KEYWORDS[period]);
  const outlinePoints = filterArchiveLabels(ensureArray(raw.outline));
  const highlightPoints = filterArchiveLabels(ensureArray(raw.guide?.highlights));
  const rawPoints = [];
  appendUnique(rawPoints, outlinePoints);
  appendUnique(rawPoints, highlightPoints);

  if (hasKeywordConstraint) {
    const groups = getKeywordGroups(period);
    const coverage = new Array(groups.length).fill(false);
    const selected = [];

    const candidates = [...highlightPoints, ...outlinePoints];
    for (const point of candidates) {
      if (selected.length >= 3) break;
      const pointCoverage = getPointCoverage(period, point);
      const addsCoverage = pointCoverage.some((hit, index) => hit && !coverage[index]);
      if (!addsCoverage) continue;
      selected.push(point);
      pointCoverage.forEach((hit, index) => {
        if (hit) coverage[index] = true;
      });
    }

    const coverageComplete = coverage.every(Boolean);
    if (coverageComplete) {
      for (const point of candidates) {
        if (selected.length >= 3) break;
        if (!selected.includes(point)) {
          selected.push(point);
        }
      }
      return selected.slice(0, 3);
    }
  } else if (rawPoints.length) {
    return rawPoints.slice(0, 3);
  }

  const fallbackPoints = [];
  appendUnique(fallbackPoints, fallback?.keyPoints ?? []);
  if (fallbackPoints.length < 2) {
    appendUnique(fallbackPoints, DEFAULT_ARCHIVE_CARD.keyPoints);
  }
  return filterArchiveLabels(fallbackPoints).slice(0, 3);
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
