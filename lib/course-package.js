import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { getShowcaseVideoPeriods } from "./showcase-home-videos.js";

const COURSE_PACKAGE_ROOT = "/Users/silent/Desktop/双师项目/课程资料包";

const COURSE_GUIDE_FALLBACKS = {
  第一期: {
    courseTheme: "类案检索与法律适用",
    teachingTitle: "类案检索与法律适用",
    coursePosition: "以类案检索为起点，引导学生从检索方法进入裁判文书阅读、争点识别与表达训练。",
    audience: "法学本科二、三年级学生",
    theoryMentor: "万娟娟",
    practiceMentor: "程秀建",
    caseDirections: [
      "围绕借名买房、优先承租权等典型争议建立类案检索范围。",
      "通过对比同类案件的裁判路径，训练学生识别法律适用差异。",
      "把检索结果转化为导读判断和课堂讨论材料。",
    ],
    preStudy: [
      "熟悉类案检索的基本入口、筛选维度和阅读顺序。",
      "尝试比较不同案件中事实认定、争点设置与裁判理由的差异。",
      "思考检索结果如何服务于课堂讨论与法理表达。",
    ],
    goals: [
      "掌握类案检索与法律适用的基本方法。",
      "能够从检索结果中提炼争议焦点并形成导读判断。",
      "为后续裁判文书研习建立统一的阅读起点。",
    ],
    highlights: [
      "把抽象法律方法落实到可操作的检索路径中。",
      "以真实案件为线索组织课堂进入和表达训练。",
      "突出从检索到导读再到研习的连续学习链路。",
    ],
  },
  第二期: {
    courseTheme: "权利义务相一致原则的理论与实践",
    teachingTitle: "权利义务相一致原则的理论与实践",
    coursePosition: "围绕权利义务相一致原则组织理论辨析与案例讨论，帮助学生把法理原理转化为规范判断。",
    audience: "法学本科二、三年级学生",
    caseDirections: [
      "围绕权利取得、义务承担与责任配置的典型争议展开课堂讨论。",
      "比较不同案件中权利义务是否保持结构对应。",
      "用裁判文书材料训练学生在规范与实践之间建立联结。",
    ],
    preStudy: [
      "复习权利义务相一致原则的基础理论与典型适用场景。",
      "结合裁判文书材料标出权利、义务与责任分配节点。",
      "思考法理原理如何回应现实争议中的不对称问题。",
    ],
    goals: [
      "理解权利义务相一致原则的基本内涵与法理价值。",
      "能够在裁判文书中识别权利、义务与责任的对应关系。",
      "形成从法理原理走向规范适用的分析路径。",
    ],
    highlights: [
      "把法理原理和裁判文书阅读结合在同一课堂任务中。",
      "通过案例延展提升学生对规范适用边界的判断能力。",
      "延续第一期的检索与导读方法，进入更完整的法理分析。",
    ],
  },
  第三期: {
    courseTheme: "多元纠纷解决机制与商事仲裁实务",
    teachingTitle: "多元纠纷解决机制与商事仲裁实务",
    coursePosition: "以程序路径选择为核心，帮助学生理解商事争议处理中诉讼、仲裁与其他纠纷解决机制的分工与衔接。",
    audience: "法学本科二、三年级学生",
    caseDirections: [
      "围绕商事争议中的程序选择和仲裁条款效力组织案例讨论。",
      "比较诉讼、仲裁与多元解纷路径在不同情境下的适用逻辑。",
      "从裁判文书中识别程序判断背后的法理基础。",
    ],
    preStudy: [
      "复习商事仲裁、多元解纷和程序选择的基本规范。",
      "通读课程案例材料，标出争议事实、程序节点和裁判理由。",
      "思考程序选择如何影响实体权利保护和商业效率。",
    ],
    goals: [
      "理解多元纠纷解决机制与商事仲裁的核心制度逻辑。",
      "能够分析典型商事案例中的程序路径选择。",
      "形成围绕程序正当性与争议解决效率的结构化判断。",
    ],
    highlights: [
      "把程序路径问题放回真实商事争议场景中讨论。",
      "强化诉讼、仲裁和调解等机制之间的比较视角。",
      "为后续程序正义专题建立方法基础。",
    ],
  },
};

const PERIOD_OUTLINE_FALLBACKS = {
  第一期: ["类案检索起点", "检索方法与阅读路径", "争点识别与导读示范", "课堂研讨与表达训练"],
  第二期: ["原理导入", "规范分析", "案例讨论", "理论回应与延展"],
  第三期: ["程序路径总览", "商事仲裁实务", "典型争议比较", "课堂讨论与表达输出"],
  第四期: ["权利沉睡与时效问题", "正当救济判断", "案例辨析", "课堂追问与表达收束"],
};

function walkFiles(dir) {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === ".DS_Store") continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function stripTags(value) {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&ldquo;/gu, "“")
    .replace(/&rdquo;/gu, "”")
    .replace(/&mdash;/gu, "—")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&amp;/gu, "&")
    .replace(/\s+/gu, " ")
    .trim();
}

function readGuideSections(filePath) {
  if (!filePath || !existsSync(filePath)) return null;

  const html = readFileSync(filePath, "utf8");

  const extractMeta = (label) => {
    const match = html.match(new RegExp(`<strong>${label}：</strong>(.*?)</div>`, "u"));
    return stripTags(match?.[1] || "");
  };

  const extractSection = (title) => {
    const match = html.match(new RegExp(`<section class="section">[\\s\\S]*?<h3>${title}</h3>([\\s\\S]*?)</section>`, "u"));
    const body = match?.[1] || "";
    const listMatches = [...body.matchAll(/<li>([\s\S]*?)<\/li>/gu)].map((item) => stripTags(item[1])).filter(Boolean);
    const paragraphMatches = [...body.matchAll(/<p>([\s\S]*?)<\/p>/gu)].map((item) => stripTags(item[1])).filter(Boolean);

    return {
      items: listMatches,
      paragraphs: paragraphMatches,
    };
  };

  const materialSection = extractSection("材料构成与使用说明");
  const guide = {
    courseTheme: extractMeta("课程主题"),
    teachingTitle: extractMeta("建议讲授标题"),
    coursePosition: extractMeta("课程定位"),
    audience: extractMeta("授课对象"),
    theoryMentor: extractMeta("理论导师"),
    practiceMentor: extractMeta("实务导师"),
    caseDirections: extractSection("推荐裁判文书方向").items,
    preStudy: extractSection("课前学习要求").items,
    goals: extractSection("本期学习目标").items,
    highlights: extractSection("教学设计亮点").items,
    materialNote: materialSection.paragraphs[0] || "",
  };

  return guide;
}

function readOutlineFromManifest(filePath, period) {
  if (!filePath || !existsSync(filePath)) {
    return PERIOD_OUTLINE_FALLBACKS[period] ?? [];
  }

  try {
    const raw = JSON.parse(readFileSync(filePath, "utf8"));
    return raw
      .map((item) => String(item?.title || "").trim())
      .filter(Boolean)
      .filter((title) => !/封面页|结尾页/u.test(title));
  } catch {
    return PERIOD_OUTLINE_FALLBACKS[period] ?? [];
  }
}

function cleanStem(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .replace(/^1223/u, "")
    .replace(/_[^_]+$/u, "")
    .replace(/（\d{3,4}）/gu, "")
    .replace(/\(\d+\)$/u, "")
    .replace(/第[一二三四五六七八]期_/u, "")
    .replace(/第[一二三四五六七八]期-/u, "")
    .replace(/第[一二三四五六七八]期/u, "")
    .replace(/^\s+|\s+$/gu, "")
    .replace(/\s+/gu, " ");
}

export function normalizeCourseMaterialDisplayName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const stem = cleanStem(fileName);

  if (!stem) {
    return "";
  }

  if (/^课件：/u.test(stem)) {
    const title = stem.replace(/^课件：/u, "").trim();
    return ext === ".pptx" ? `课程课件：${title}` : `课件讲义版：${title}`;
  }

  if (/司法裁判的/u.test(stem)) {
    const lead = stem.split("：")[0]?.trim() || stem;
    return `专题阅读：${lead}`;
  }

  if (/^“沉睡的权利”与正当救济/u.test(stem)) {
    const lead = stem.split("：")[0]?.trim() || stem;
    return `专题阅读：${lead}`;
  }

  if (/教学材料指南/u.test(stem)) return "教学材料指南";
  if (/裁判文书法理导学/u.test(stem)) {
    const suffix = stem.match(/：(.+)$/u)?.[1]?.trim();
    return suffix ? `裁判文书法理导学：${suffix}` : "裁判文书法理导学";
  }
  if (/裁判文书研习任务单/u.test(stem)) return "裁判文书研习任务单";
  if (/双师职责分工表/u.test(stem)) return "双师职责分工表";
  if (/双师课堂记录观察表/u.test(stem)) return "双师课堂记录观察表";
  if (/双师合作互评问卷/u.test(stem)) return "双师合作互评问卷";
  if (/学生综合能力评价指标体系/u.test(stem)) return "学生综合能力评价指标体系";
  if (/学生课后反馈/u.test(stem)) {
    const suffix = stem.match(/（[一二三四五六七八]）/u)?.[0] || "";
    return suffix ? `学生课后反馈${suffix}` : "学生课后反馈";
  }
  if (/学生研习报告|裁判文书学生研习报告/u.test(stem)) {
    const suffix = stem.match(/（[一二三四五六七八]）/u)?.[0] || "";
    return suffix ? `学生研习报告${suffix}` : "学生研习报告";
  }
  if (/剪映.*配音稿/u.test(stem)) return "章节配音稿";
  if (/逐页时长表/u.test(stem)) return "逐页时长表";
  if (/时长审核结论/u.test(stem)) return "时长审核结论";
  if (/资料包制作清单/u.test(stem)) return "资料包制作清单";

  if (ext === ".pdf" || ext === ".docx") {
    const lead = stem.split("：")[0]?.trim() || stem;
    return `专题阅读：${lead}`;
  }

  return stem;
}

function summarizeFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pptx") return "课件";
  if (ext === ".pdf") return "讲义";
  if (ext === ".docx") return "文稿";
  if (ext === ".md") return "文稿";
  if (ext === ".html") return "页面";
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") return "图像";
  return "资料";
}

function buildMaterialGroups(periodDir) {
  const files = walkFiles(periodDir);
  const groups = [
    { title: "课程资料", items: [] },
    { title: "佐证材料", items: [] },
    { title: "视频制作材料", items: [] },
  ];

  for (const filePath of files) {
    const relPath = path.relative(periodDir, filePath);
    const fileName = path.basename(filePath);

    if (/manifest\.json$/u.test(fileName) || /\.(jpg|jpeg|png|json)$/iu.test(fileName) && /API生图/u.test(relPath)) {
      continue;
    }

    const item = {
      sourceName: fileName,
      displayName: normalizeCourseMaterialDisplayName(fileName),
      kind: summarizeFileType(filePath),
    };

    if (!item.displayName) continue;

    if (/API生图/u.test(relPath) || /\.(md)$/iu.test(fileName)) {
      groups[2].items.push(item);
      continue;
    }

    if (/佐证性佐证材料|实操性佐证材料|佐证性材料/u.test(relPath)) {
      groups[1].items.push(item);
      continue;
    }

    groups[0].items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
}

function buildGuideForPeriod(period, periodDir) {
  const guideFile = walkFiles(periodDir).find((filePath) => /教学材料指南\.html$/u.test(filePath));
  return readGuideSections(guideFile) || COURSE_GUIDE_FALLBACKS[period] || {
    courseTheme: "",
    teachingTitle: "",
    coursePosition: "",
    audience: "法学本科二、三年级学生",
    theoryMentor: "",
    practiceMentor: "",
    caseDirections: [],
    preStudy: [],
    goals: [],
    highlights: [],
    materialNote: "",
  };
}

function buildPeriodOutline(period, periodDir) {
  const manifestPath = walkFiles(periodDir).find((filePath) => /manifest\.json$/u.test(filePath));
  return readOutlineFromManifest(manifestPath, period);
}

function buildPeriodLookup() {
  return getShowcaseVideoPeriods().map((video) => {
    const periodDir = path.join(COURSE_PACKAGE_ROOT, video.period);
    const materialGroups = buildMaterialGroups(periodDir);
    const guide = buildGuideForPeriod(video.period, periodDir);
    const outline = buildPeriodOutline(video.period, periodDir);

    return {
      slug: video.slug,
      period: video.period,
      title: video.title,
      theme: video.theme,
      module: video.module,
      stageTag: video.stageTag,
      phaseLabel: video.phaseLabel,
      summary: video.summary,
      description: video.purpose,
      videoHref: video.href,
      playerMode: video.playerMode,
      detailHref: `/courses/${video.slug}`,
      guide,
      outline,
      materialGroups,
      stats: {
        materialCount: materialGroups.find((group) => group.title === "课程资料")?.items.length ?? 0,
        evidenceCount: materialGroups.find((group) => group.title === "佐证材料")?.items.length ?? 0,
        productionCount: materialGroups.find((group) => group.title === "视频制作材料")?.items.length ?? 0,
        outlineCount: outline.length,
      },
    };
  });
}

export function getCoursePackageStaticParams() {
  return buildPeriodLookup().map((item) => ({ slug: item.slug }));
}

export function getCoursePackagePeriods() {
  return buildPeriodLookup();
}

export function getCoursePackagePeriodBySlug(slug) {
  return getCoursePackagePeriods().find((item) => item.slug === slug) || null;
}
