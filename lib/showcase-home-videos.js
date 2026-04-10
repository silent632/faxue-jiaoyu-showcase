const INTERNAL_VIDEO_PATH_PREFIX = "/resources/videos";

const FEATURED_VOD_MP4 =
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

function buildHostedVideo({ slug, label, title, summary, purpose, sourceHref }) {
  return {
    slug,
    label,
    title,
    summary,
    purpose,
    href: `${INTERNAL_VIDEO_PATH_PREFIX}/${slug}`,
    sourceHref,
    external: false,
  };
}

function buildExternalVideo({ slug, label, title, summary, purpose, href }) {
  return {
    slug,
    label,
    title,
    summary,
    purpose,
    href,
    sourceHref: href,
    external: true,
  };
}

const HOSTED_VIDEOS = [
  buildHostedVideo({
    slug: "course-period-08",
    label: "主视频",
    title: "第八期 生成式AI的作品认定与责任边界",
    summary: "围绕生成式 AI 场景中的作品认定与责任边界，展示课程如何回应前沿技术法理问题。",
    purpose: "适用于课程展示、教学观摩与前沿议题研习。",
    sourceHref: FEATURED_VOD_MP4,
  }),
  buildHostedVideo({
    slug: "course-period-07",
    label: "辅助视频",
    title: "第七期 平台劳动关系认定中的法理冲突",
    summary: "围绕平台劳动中的身份认定与权利保障，展示课程如何引导学生进入治理前沿议题。",
    purpose: "适用于课程展示、专题学习与课堂参考。",
    sourceHref: PERIOD_07_VOD_MP4,
  }),
  buildHostedVideo({
    slug: "course-period-06",
    label: "辅助视频",
    title: "第六期 人脸识别中的同意边界与法理回应",
    summary: "围绕数字技术使用中的同意边界问题，展示课程从现实案例进入法理辨析的方式。",
    purpose: "适用于课程展示、案例研习与课堂观摩。",
    sourceHref: PERIOD_06_VOD_MP4,
  }),
  buildHostedVideo({
    slug: "course-period-05",
    label: "辅助视频",
    title: "第五期 非法证据排除规则",
    summary: "围绕程序正义与权利保障问题，展示课程如何把规范理解与实务判断结合起来。",
    purpose: "适用于课程展示、专题学习与教学观摩。",
    sourceHref: PERIOD_05_VOD_MP4,
  }),
  buildHostedVideo({
    slug: "course-period-04",
    label: "辅助视频",
    title: "第四期 从“沉睡的权利”到正当救济的司法考量",
    summary: "围绕权利救济与规范适用展开讨论，展示课程如何推进稳定的法律表达训练。",
    purpose: "适用于课程展示、课堂参考与专题回看。",
    sourceHref: PERIOD_04_VOD_MP4,
  }),
  buildHostedVideo({
    slug: "course-period-03",
    label: "辅助视频",
    title: "第三期 多元纠纷解决机制与商事仲裁实务",
    summary: "围绕商事争议解决与程序选择问题，展示课程如何把事实识别与程序判断纳入课堂。",
    purpose: "适用于课程展示、案例导读与教学观摩。",
    sourceHref: PERIOD_03_VOD_MP4,
  }),
];

const SEGMENTED_VIDEOS = [
  buildExternalVideo({
    slug: "course-period-01-part-1",
    label: "分段视频",
    title: "第一期上（一） 类案检索与法律适用",
    summary: "围绕第一期课程的起始部分，展示如何从案例检索进入法理学习。",
    purpose: "适用于课程展示与教学观摩。",
    href: "https://llm2x7.58u.cn/a/OkJ17Qn/",
  }),
  buildExternalVideo({
    slug: "course-period-01-part-2",
    label: "分段视频",
    title: "第一期上（二） 检索方法与阅读路径",
    summary: "继续呈现从检索结果进入裁判文书阅读的课堂组织方式。",
    purpose: "适用于课堂参考与案例导读。",
    href: "https://llm2x7.58u.cn/a/b1PMnBj/",
  }),
  buildExternalVideo({
    slug: "course-period-01-part-3",
    label: "分段视频",
    title: "第一期上（三） 争点识别与导读示范",
    summary: "展示如何在真实案例中识别争点并建立导读判断。",
    purpose: "适用于案例教学与研习说明。",
    href: "https://llm2x7.58u.cn/a/AQy9W5M/",
  }),
  buildExternalVideo({
    slug: "course-period-01-part-4",
    label: "分段视频",
    title: "第一期上（四） 课堂研讨与表达训练",
    summary: "呈现课堂研讨如何转化为结构化表达与课堂输出。",
    purpose: "适用于教学观摩与课堂回看。",
    href: "https://llm2x7.58u.cn/a/bwX3kJQ/",
  }),
  buildExternalVideo({
    slug: "course-period-01-part-5",
    label: "分段视频",
    title: "第一期下 非法证据排除规则",
    summary: "围绕证据规则专题，呈现法理讨论与裁判理解的结合方式。",
    purpose: "适用于专题学习与课程回看。",
    href: "https://llm2x7.58u.cn/a/Rn83yvz/",
  }),
  buildExternalVideo({
    slug: "course-period-02-part-1",
    label: "分段视频",
    title: "第二期上 权利义务相一致原则",
    summary: "围绕第二期课堂内容，展示从理论原理进入规范讨论的路径。",
    purpose: "适用于课程展示与课堂复盘。",
    href: "https://llm2x7.58u.cn/a/Rj3Z7jX/",
  }),
  buildExternalVideo({
    slug: "course-period-02-part-2",
    label: "分段视频",
    title: "第二期下 理论回应与案例延展",
    summary: "延续第二期课程讨论，呈现理论回应与案例延展的课堂节奏。",
    purpose: "适用于教学观摩与学习参考。",
    href: "https://llm2x7.58u.cn/a/OzdXyrQ/",
  }),
];

export function getShowcaseVideoBySlug(slug) {
  return [...HOSTED_VIDEOS, ...SEGMENTED_VIDEOS].find((item) => item.slug === slug) || null;
}

export function getShowcaseVideoStaticParams() {
  return HOSTED_VIDEOS.map((item) => ({ slug: item.slug }));
}

export function buildShowcaseHomeVideoBlock() {
  return {
    title: "课程视频展示",
    description: "通过课程视频回看双师课堂组织、案例进入方式与研习引导过程。",
    featured: HOSTED_VIDEOS[0],
    supporting: HOSTED_VIDEOS.slice(1),
    segmented: {
      title: "第一期、第二期分段课程视频",
      description: "第一期和第二期保留了更细的分段课堂记录，适合回看前期课程的组织方式与问题展开过程。",
      items: SEGMENTED_VIDEOS,
    },
  };
}
