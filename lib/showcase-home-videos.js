const INTERNAL_VIDEO_PATH_PREFIX = "/resources/videos";

const PERIOD_08_VOD_MP4 =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/2649892b5145403719779012489/v.f100040.mp4";
const PERIOD_07_VOD_MP4 =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/2d6d2ac55145403719779332226/v.f100040.mp4";
const PERIOD_06_VOD_MP4 =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/822f83f75145403722731517009/v.f100040.mp4";
const PERIOD_05_VOD_MP4 =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/9d30d0155145403719699843189/v.f100040.mp4";
const PERIOD_04_VOD_MP4 =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/445f55db5145403722795726100/v.f100040.mp4";
const PERIOD_03_VOD_MP4 =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/c9adbb0b5145403722718789805/v.f100040.mp4";

const PHASE_GUIDE = [
  {
    slug: "phase-classroom",
    title: "前四期：课堂实施与机制验证",
    description: "以案例进入、课堂互动和双师协作为主线。",
  },
  {
    slug: "phase-resource",
    title: "后四期：示范性课程视频与资源化成果",
    description: "以视频化表达和资源沉淀为主线。",
  },
];

function buildSegment(label, title, href, note) {
  return {
    label,
    title,
    href,
    external: true,
    note,
  };
}

function buildVideoPeriod({
  slug,
  period,
  title,
  theme,
  stageTag,
  phaseLabel,
  module,
  summary,
  purpose,
  sourceHref = null,
  segments = [],
}) {
  return {
    slug,
    period,
    title,
    theme,
    stageTag,
    phaseLabel,
    module,
    summary,
    purpose,
    href: `${INTERNAL_VIDEO_PATH_PREFIX}/${slug}`,
    sourceHref,
    external: false,
    playerMode: segments.length > 0 ? "segments" : "video",
    segments,
  };
}

const COURSE_VIDEO_PERIODS = [
  buildVideoPeriod({
    slug: "course-period-01",
    period: "第一期",
    title: "第一期 类案检索与法律适用",
    theme: "类案检索与法律适用",
    stageTag: "课堂实施成果",
    phaseLabel: PHASE_GUIDE[0].title,
    module: "第一模块：案例进入与法律方法",
    summary: "从类案检索进入裁判文书阅读，逐步建立案例进入、争点识别与表达训练的课堂起点。",
    purpose: "保留分段课堂记录，可直接查看各段内容。",
    segments: [
      buildSegment("第一期上（一）", "类案检索与法律适用", "https://llm2x7.58u.cn/a/OkJ17Qn/", "从检索起点进入案例研习。"),
      buildSegment("第一期上（二）", "检索方法与阅读路径", "https://llm2x7.58u.cn/a/b1PMnBj/", "围绕检索结果进入裁判文书阅读。"),
      buildSegment("第一期上（三）", "争点识别与导读示范", "https://llm2x7.58u.cn/a/AQy9W5M/", "把案例导读与争点判断组织起来。"),
      buildSegment("第一期上（四）", "课堂研讨与表达训练", "https://llm2x7.58u.cn/a/bwX3kJQ/", "围绕课堂讨论推进表达训练。"),
    ],
  }),
  buildVideoPeriod({
    slug: "course-period-02",
    period: "第二期",
    title: "第二期 权利义务相一致原则的理论与实践",
    theme: "权利义务相一致原则的理论与实践",
    stageTag: "课堂实施成果",
    phaseLabel: PHASE_GUIDE[0].title,
    module: "第一模块：法理原理与规范回应",
    summary: "围绕权利义务相一致原则展开法理辨析，把课堂讨论从检索方法推进到规范理解与实践回应。",
    purpose: "保留上下两段课堂记录，可直接查看。",
    segments: [
      buildSegment("第二期上", "权利义务相一致原则", "https://llm2x7.58u.cn/a/Rj3Z7jX/", "从原理进入规范分析与课堂讨论。"),
      buildSegment("第二期下", "理论回应与案例延展", "https://llm2x7.58u.cn/a/OzdXyrQ/", "延续原理辨析并进入案例延展。"),
    ],
  }),
  buildVideoPeriod({
    slug: "course-period-03",
    period: "第三期",
    title: "第三期 多元纠纷解决机制与商事仲裁实务",
    theme: "多元纠纷解决机制与商事仲裁实务",
    stageTag: "课堂实施成果",
    phaseLabel: PHASE_GUIDE[0].title,
    module: "第一模块：程序路径与争议解决",
    summary: "围绕商事争议中的程序选择与纠纷解决路径，呈现课堂实施阶段的案例进入与程序判断训练。",
    purpose: "本期可直接在站内观看，并结合课程档案页继续查看配套资料。",
    sourceHref: PERIOD_03_VOD_MP4,
  }),
  buildVideoPeriod({
    slug: "course-period-04",
    period: "第四期",
    title: "第四期 从“沉睡的权利”到正当救济的司法考量",
    theme: "从“沉睡的权利”到正当救济的司法考量",
    stageTag: "课堂实施成果",
    phaseLabel: PHASE_GUIDE[0].title,
    module: "第一模块：权利救济与表达训练",
    summary: "围绕权利救济与规范适用，收束前四期课堂实施的重点问题与方法训练。",
    purpose: "本期可直接在站内观看，并从课程档案页查看本期课件与主题说明。",
    sourceHref: PERIOD_04_VOD_MP4,
  }),
  buildVideoPeriod({
    slug: "course-period-05",
    period: "第五期",
    title: "第五期 非法证据排除规则",
    theme: "为什么非法证据必须排除",
    stageTag: "示范性课程视频",
    phaseLabel: PHASE_GUIDE[1].title,
    module: "第二模块：程序正义与权利保障",
    summary: "围绕程序正义与权利保障展开非法证据排除规则讨论，作为示范课程视频展示。",
    purpose: "本期视频承接程序正义与权利保障议题，可在站内直接观看。",
    sourceHref: PERIOD_05_VOD_MP4,
  }),
  buildVideoPeriod({
    slug: "course-period-06",
    period: "第六期",
    title: "第六期 人脸识别中的同意边界与法理回应",
    theme: "人脸识别中的同意边界与法理回应",
    stageTag: "示范性课程视频",
    phaseLabel: PHASE_GUIDE[1].title,
    module: "第二模块：数字治理与人格权保护",
    summary: "围绕人脸识别中的同意边界与人格权问题，呈现后四期资源化表达的延展方向。",
    purpose: "本期视频延续后四期资源化成果线索，可在站内直接观看。",
    sourceHref: PERIOD_06_VOD_MP4,
  }),
  buildVideoPeriod({
    slug: "course-period-07",
    period: "第七期",
    title: "第七期 平台劳动关系认定中的法理冲突",
    theme: "平台劳动关系认定中的法理冲突",
    stageTag: "示范性课程视频",
    phaseLabel: PHASE_GUIDE[1].title,
    module: "第二模块：平台治理与劳动法理",
    summary: "围绕平台用工与算法控制问题，呈现课程如何从数字治理进一步推进到平台治理议题。",
    purpose: "本期视频可在站内直接观看，并与课程档案页中的配套资料一起查看。",
    sourceHref: PERIOD_07_VOD_MP4,
  }),
  buildVideoPeriod({
    slug: "course-period-08",
    period: "第八期",
    title: "第八期 生成式AI的作品认定与责任边界",
    theme: "生成式AI的作品认定与责任边界",
    stageTag: "资源化成果",
    phaseLabel: PHASE_GUIDE[1].title,
    module: "第二模块：智能治理与法理回应",
    summary: "围绕生成式 AI 场景中的作品认定与责任边界，作为八期课程视频成果的阶段性收束。",
    purpose: "本期视频可在站内直接观看，并继续进入课程档案页查看本期资料归档。",
    sourceHref: PERIOD_08_VOD_MP4,
  }),
];

export function getShowcaseVideoPeriods() {
  return COURSE_VIDEO_PERIODS.map((item) => ({ ...item, segments: item.segments.map((segment) => ({ ...segment })) }));
}

export function getShowcaseVideoPhaseGuide() {
  return PHASE_GUIDE.map((item) => ({ ...item }));
}

export function getShowcaseVideoBySlug(slug) {
  return getShowcaseVideoPeriods().find((item) => item.slug === slug) || null;
}

export function getShowcaseVideoStaticParams() {
  return COURSE_VIDEO_PERIODS.map((item) => ({ slug: item.slug }));
}

export function buildShowcaseHomeVideoBlock() {
  return {
    title: "八期课程视频成果",
    description: "八期课程视频按期次展示。",
    phaseGuide: getShowcaseVideoPhaseGuide(),
    periods: getShowcaseVideoPeriods(),
  };
}
