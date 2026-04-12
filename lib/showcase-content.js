import {
  buildShowcaseHomeVideoBlock,
  getShowcaseVideoPeriods,
  getShowcaseVideoPhaseGuide,
} from "./showcase-home-videos.js";
import { getDefaultShowcaseStudyDemoHref } from "./showcase-route-defaults.js";

const COURSE_MATERIALS_BY_PERIOD = {
  第一期: [
    "课程课件：类案检索与法律适用",
    "课件讲义版：类案检索与法律适用",
    "专题阅读：司法裁判的“同”与“不同”",
  ],
  第二期: [
    "课程课件：权利义务相一致原则的理论与实践",
    "课件讲义版：权利义务相一致原则的理论与实践",
    "专题阅读：权利义务相一致原则的规范分析与实践应照",
  ],
  第三期: [
    "课程课件：多元纠纷解决机制与商事仲裁实务",
    "课件讲义版：多元纠纷解决机制与商事仲裁实务",
    "课堂导读与程序讨论记录",
  ],
  第四期: [
    "课程课件：从“沉睡的权利”到正当救济的司法考量",
    "课件讲义版：从“沉睡的权利”到正当救济的司法考量",
    "专题阅读：“沉睡的权利”与正当救济",
  ],
  第五期: [
    "教学材料指南",
    "裁判文书法理导学",
    "裁判文书研习任务单",
    "双师职责分工表",
    "学生综合能力评价指标体系",
    "双师课堂记录观察表",
  ],
  第六期: [
    "教学材料指南",
    "裁判文书法理导学",
    "裁判文书研习任务单",
    "双师职责分工表",
    "学生综合能力评价指标体系",
    "课件：看见你的脸，也看见你的权利——人脸识别中的同意边界与法理回应.pptx",
  ],
  第七期: [
    "教学材料指南",
    "裁判文书法理导学",
    "裁判文书研习任务单",
    "双师职责分工表",
    "学生综合能力评价指标体系",
    "课件：接单自由，还是算法控制——平台劳动关系认定中的法理冲突.pptx",
  ],
  第八期: [
    "教学材料指南",
    "裁判文书法理导学",
    "裁判文书研习任务单",
    "双师职责分工表",
    "学生综合能力评价指标体系",
    "课件：当机器开始“创作”——生成式AI的作品认定与责任边界.pptx",
  ],
};

function buildCourseArchivePeriods(videoPeriods) {
  return videoPeriods.map((item) => ({
    slug: item.slug,
    period: item.period,
    title: item.title,
    theme: item.theme,
    module: item.module,
    stageTag: item.stageTag,
    phaseLabel: item.phaseLabel,
    description: item.summary,
    materials: COURSE_MATERIALS_BY_PERIOD[item.period] ?? ["本期资料整理中"],
    detailHref: `/courses/${item.slug}`,
    videoHref: item.href,
    videoEntryLabel: item.playerMode === "segments" ? "进入本期分段内容" : "观看本期视频成果",
  }));
}

export function buildShowcaseNavItems({ studyDemoHref = getDefaultShowcaseStudyDemoHref() } = {}) {
  return [
    { label: "首页", href: "/", matchPrefix: "/" },
    { label: "案例检索", href: "/cases", matchKind: "cases" },
    { label: "研习工作台", href: studyDemoHref, matchKind: "study" },
    { label: "课程视频", href: "/resources", matchPrefix: "/resources" },
    { label: "课程体系", href: "/courses", matchPrefix: "/courses" },
    { label: "成效展示", href: "/impact", matchPrefix: "/impact" },
  ];
}

export function buildShowcaseContent({ studyDemoHref = getDefaultShowcaseStudyDemoHref() } = {}) {
  const canonicalCaseHref = studyDemoHref.replace(/\/study\/?$/u, "");
  const videoPeriods = getShowcaseVideoPeriods();
  const phaseGuide = getShowcaseVideoPhaseGuide();
  const homeVideoBlock = buildShowcaseHomeVideoBlock();
  const courseArchivePeriods = buildCourseArchivePeriods(videoPeriods);

  return {
    site: {
      title: "裁判文书研习平台",
      subtitle: "面向法理学教学改革的案例研习、课程支撑与成果展示平台",
      intro: "案例检索、课程建设与成果展示在同一站内保持连通。",
    },
    homeHero: {
      kicker: "平台首页",
      brief: "围绕真实裁判文书组织案例检索、导读阅读与结构化研习，形成面向法理学教学改革的持续学习入口。",
      metricsIntro: "从案例、课程与平台运行三条线索快速进入平台。",
      primaryModules: [
        {
          label: "案例检索库",
          href: "/cases",
          description: "围绕真实案例建立稳定的检索起点。",
        },
        {
          label: "研习工作台",
          href: studyDemoHref,
          description: "围绕文书完成结构化研习与法理分析。",
        },
        {
          label: "课程体系",
          href: "/courses",
          description: "查看八期课程档案与配套资料。",
        },
      ],
      secondaryModules: [
        {
          label: "课程视频",
          href: "/resources",
          description: "查看八期课程视频成果与阶段说明。",
        },
        {
          label: "成效展示",
          href: "/impact",
          description: "浏览课程建设、平台运行与推广应用成效。",
        },
      ],
      supportingFacts: [
        "案例检索、阅读导读与研习输出保持同一平台链路。",
        "课程视频、课程档案与成效展示在站内连续衔接。",
        "覆盖课程展示、案例浏览与教学观摩场景。",
      ],
    },
    nav: buildShowcaseNavItems({ studyDemoHref }),
    homeDashboard: {
      hero: {
        title: "裁判文书研习平台",
        summary: "进入案例检索、课程视频、课程体系和成效展示。",
      },
      kpis: [
        { label: "平台使用者", value: "800+" },
        { label: "累计访问量", value: "5万+" },
        { label: "视频播放", value: "5万+" },
        { label: "活跃用户", value: "320+" },
        { label: "工作台回访率", value: "68%" },
      ],
      trendSnapshot: {
        title: "核心结果",
        points: [
          "案例检索、详情页与研习工作台保持连通。",
          "八期课程对应课程视频与课程档案两条展示线。",
          "视频播放、活跃用户和回访率能够直接说明运行状态。",
        ],
      },
    },
    homeResultTracks: [
      {
        title: "平台运行",
        value: "800+ 使用者",
        detail: "案例检索、详情页和研习工作台保持同一路径。",
        href: "/cases",
        actionLabel: "进入案例检索",
      },
      {
        title: "课程建设",
        value: "8期课程",
        detail: "前四期聚焦课堂实施，后四期沉淀为视频与资源成果。",
        href: "/courses",
        actionLabel: "查看课程体系",
      },
      {
        title: "传播成效",
        value: "5万+ 播放",
        detail: "课程视频播放超过 5 万次。",
        href: "/impact",
        actionLabel: "查看成效展示",
      },
    ],
    homeEntries: [
      {
        label: "案例检索库",
        href: "/cases",
        description: "按案由、年份、层级与法条检索典型案例。",
      },
      {
        label: "案例详情",
        href: canonicalCaseHref,
        description: "查看摘要、基本信息与文书入口。",
      },
      {
        label: "课程体系",
        href: "/courses",
        description: "逐期阅读课程主题、视频与配套资料。",
      },
      {
        label: "研习工作台",
        href: studyDemoHref,
        description: "围绕同一份文书完成事实梳理、争议焦点和法理分析。",
      },
    ],
    homeFlow: [
      {
        id: "01",
        title: "先确定案例检索范围",
        description: "从案由、年份与法条快速缩小范围。",
      },
      {
        id: "02",
        title: "再阅读案例详情与导读",
        description: "结合摘要、案号与裁判结果判断精读价值。",
      },
      {
        id: "03",
        title: "最后进入研习工作台",
        description: "围绕文书完成结构化分析与研习输出。",
      },
    ],
    homePreview: {
      featuredCases: [
        "案例筛选与结果列表",
        "案例导读与原文入口",
        "结构化研习页面",
      ],
      studyHighlights: [
        "阅读区与写作区并置",
        "三步研习卡片逐项推进",
        "研习草稿可保存在当前浏览器",
      ],
    },
    homeCasePreview: [
      {
        id: "case-0001",
        href: canonicalCaseHref,
        title: "从类案检索进入裁判文书阅读",
        meta: "案例导读",
        description: "从摘要、案号与裁判结论判断是否进入进一步研习。",
      },
      {
        id: "case-0002",
        href: "/cases",
        title: "围绕真实案例建立检索边界",
        meta: "案例检索",
        description: "通过案由、年份、法院层级与法条快速定位同类案例。",
      },
      {
        id: "case-0003",
        href: studyDemoHref,
        title: "在研习工作台中完成结构化表达",
        meta: "研习实践",
        description: "围绕同一份文书推进事实梳理、争议焦点与法理分析。",
      },
    ],
    homeOverview: [
      {
        href: "/courses",
        title: "课程体系",
        description: "八期课程档案形成连续推进的主题序列。",
      },
      {
        href: "/resources",
        title: "课程视频",
        description: "八期课程视频按期次连续展开。",
      },
    ],
    homeImpactClosing: {
      href: "/impact",
      title: "建设成效",
      description: "查看平台、课程与视频成果。",
    },
    homeVideoBlock,
    videoHub: {
      title: "八期课程视频成果",
      hero: "八期视频成果中，前四期为课堂实施记录，后四期为示范视频与资源成果。",
      phaseGuide,
      periods: videoPeriods,
    },
    platformHighlights: [
      {
        eyebrow: "平台能力",
        title: "案例检索与研习链路前后贯通",
        description: "从检索、阅读到研习，围绕同一份文书组织连续学习路径。",
      },
      {
        eyebrow: "课程支撑",
        title: "课程视频、课程档案与平台入口保持衔接",
        description: "八期视频成果、课程档案与案例研习在同一站内连续浏览。",
      },
      {
        eyebrow: "成果呈现",
        title: "建设成果能够在平台中直接呈现",
        description: "课程建设、资源支撑与运行成效形成可观摩的展示结构。",
      },
    ],
    metrics: {
      caseCount: {
        label: "典型案例",
        value: "210+",
        raw: 210,
      },
      coursePeriods: {
        label: "双师课程",
        value: "8期",
        raw: 8,
      },
      registeredUsers: {
        label: "平台使用者",
        value: "800+",
        raw: 800,
      },
      totalVisits: {
        label: "累计访问",
        value: "5万+",
        raw: 50000,
      },
      totalVideoPlays: {
        label: "视频播放",
        value: "5万+",
        raw: 50000,
      },
    },
    problems: [
      "抽象法理知识与真实司法实践之间存在脱节。",
      "学生会学理论，但不会检索、研读和运用裁判文书。",
      "传统课堂难以持续支撑案例研习、过程评价与课后延展。",
    ],
    courses: {
      timeline: courseArchivePeriods.map((item) => ({ period: item.period, title: item.theme })),
      bands: phaseGuide,
      periods: courseArchivePeriods,
    },
    resources: {
      groups: [
        {
          title: "教学资源与资源体系",
          intro: "围绕课程实施、案例研习与教学评价，形成持续更新的资源体系。",
          items: [
            "教学材料指南",
            "裁判文书法理导学",
            "裁判文书研习任务单",
            "案例研习流程说明",
          ],
        },
        {
          title: "标准材料与标准化支撑",
          intro: "通过统一模板、表单和指标，保障双师协同、过程记录与成果沉淀可复制、可对照。",
          items: [
            "双师职责分工表",
            "双师课堂记录观察表",
            "双师合作互评问卷",
            "学生综合能力评价指标体系",
            "学生课后反馈与研习成果",
          ],
        },
      ],
    },
    impactDashboard: {
      trendPanels: [
        {
          title: "课程建设趋势",
          value: "8期课程持续迭代",
          detail: "课程主题从检索方法扩展到程序正义、数字治理与智能治理议题。",
          metricLabel: "视频播放",
          metricValue: "5万+",
        },
        {
          title: "学习参与趋势",
          value: "800+ 平台使用者",
          detail: "案例检索、研习工作台与课程回看形成连续学习路径。",
          metricLabel: "活跃用户",
          metricValue: "320+",
        },
        {
          title: "研习留存趋势",
          value: "工作台回访率持续稳定",
          detail: "工作台复访和检索联动使用保持较高水平。",
          metricLabel: "工作台回访率",
          metricValue: "68%",
        },
      ],
      coverageCards: [
        {
          title: "教学建设覆盖",
          description: "课程、任务单与评价指标形成相互支撑的教学建设结构。",
          coverageValue: "100%",
        },
        {
          title: "推广应用覆盖",
          description: "案例、课程视频、课程档案与成效展示形成统一入口。",
          coverageValue: "85%",
        },
      ],
    },
    impact: {
      sections: [
        {
          title: "教学建设成效",
          intro: "课程体系与教学组织逐步形成稳定的双师协同机制。",
          points: [
            "形成八期递进式课程结构，覆盖检索、研读与法理分析的关键环节。",
            "课堂实施成果与后续视频化成果相互衔接，课程主线更加完整。",
            "课程组织从前期课堂实施延展至后期资源沉淀与展示共享。",
          ],
        },
        {
          title: "学生发展成效",
          intro: "学生从“会听课”转向“会检索、会分析、会表达”。",
          points: [
            "增强了裁判文书检索、问题提炼和论证表达能力。",
            "通过任务式研习提升了学生参与度和课堂反馈质量。",
            "学生能够在真实案例中练习法理判断与规范适用。",
          ],
        },
        {
          title: "平台运行成效",
          intro: "平台将课程、资源和案例组织为可持续的数字化学习空间。",
          points: [
            "实现课程、资源、案例与研习工作台的统一入口与统一展示。",
            "课程视频页与课程档案页分工清晰，观看与归档关系更加明确。",
            "为后续案例扩展、课程迭代与资源更新提供了结构化内容底座。",
          ],
        },
        {
          title: "推广示范成效",
          intro: "以标准化材料和可复制流程推动经验传播与课程示范。",
          points: [
            "形成可共享的教学材料和标准化表单，覆盖跨班级、跨学期复用。",
            "八期课程视频成果与课程档案页共同提升项目的展示完整度。",
            "课程视频累计播放超过 5 万次，形成了较强的传播与示范支撑。",
            "推动教学改革经验从课程内部走向院系与同行交流。",
          ],
        },
      ],
    },
  };
}
