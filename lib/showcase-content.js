import { buildShowcaseHomeVideoBlock } from "./showcase-home-videos.js";
import { getDefaultShowcaseStudyDemoHref } from "./showcase-route-defaults.js";

export function buildShowcaseNavItems({ studyDemoHref = getDefaultShowcaseStudyDemoHref() } = {}) {
  return [
    { label: "首页", href: "/", matchPrefix: "/" },
    { label: "案例检索", href: "/cases", matchKind: "cases" },
    { label: "研习工作台", href: studyDemoHref, matchKind: "study" },
    { label: "成效展示", href: "/impact", matchPrefix: "/impact" },
    { label: "课程视频", href: "/resources", matchPrefix: "/resources" },
    { label: "课程体系", href: "/courses", matchPrefix: "/courses" },
  ];
}

export function buildShowcaseContent({ studyDemoHref = getDefaultShowcaseStudyDemoHref() } = {}) {
  const canonicalCaseHref = studyDemoHref.replace(/\/study\/?$/u, "");
  const homeVideoBlock = buildShowcaseHomeVideoBlock();

  return {
    site: {
      title: "裁判文书研习平台",
      subtitle: "面向法理学教学改革的案例研习、课程支撑与成果展示平台",
      intro: "围绕案例检索、裁判文书阅读、结构化研习与课程建设成果，集中呈现法理学教学改革的核心平台能力。",
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
          description: "查看八期双师课程的连续编排。",
        },
      ],
      secondaryModules: [
        {
          label: "教学资源",
          href: "/resources",
          description: "查看任务单、导学资料与标准化支撑材料。",
        },
        {
          label: "成效展示",
          href: "/impact",
          description: "浏览课程建设、平台运行与推广应用成效。",
        },
      ],
      supportingFacts: [
        "案例检索、阅读导读与研习输出保持同一平台链路。",
        "课程体系、教学资源与建设成效在同一站内连续呈现。",
        "覆盖课程展示、案例浏览与教学观摩场景。",
      ],
    },
    nav: buildShowcaseNavItems({ studyDemoHref }),
    homeDashboard: {
      hero: {
        title: "平台成效与应用成果看板",
        summary: "平台应用成果与推广影响已形成，可直接呈现运行数据与覆盖结果。",
      },
      kpis: [
        { label: "注册用户", value: "800+" },
        { label: "累计访问", value: "5万+" },
        { label: "活跃用户", value: "320+" },
        { label: "工作台回访率", value: "68%" },
        { label: "案例检索使用占比", value: "74%" },
      ],
      trendSnapshot: {
        title: "平台运行趋势",
        points: [
          "案例检索与研习工作台保持同一入口链路。",
          "课程回看与资源复用覆盖课堂前中后阶段。",
          "平台运行指标持续支撑课程迭代与成果展示。",
        ],
      },
    },
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
        description: "八期课程形成连续推进的双师教学结构。",
      },
      {
        href: "/resources",
        title: "教学资源",
        description: "标准化材料支撑课程实施与研习过程。",
      },
    ],
    homeImpactClosing: {
      href: "/impact",
      title: "建设成效",
      description: "平台、课程与资源建设已形成可展示、可引用的整体成果。",
    },
    homeVideoBlock,
    videoHub: {
      title: "课程视频中心",
      hero: "围绕双师课堂组织可回看的课程视频入口。",
      featured: {
        slug: homeVideoBlock.featured.slug,
        title: homeVideoBlock.featured.title,
        href: homeVideoBlock.featured.href,
        sourceHref: homeVideoBlock.featured.sourceHref,
        external: homeVideoBlock.featured.external,
      },
      playlist: homeVideoBlock.supporting.map((item) => ({
        slug: item.slug,
        title: item.title,
        href: item.href,
        sourceHref: item.sourceHref,
        external: item.external,
      })),
    },
    platformHighlights: [
      {
        eyebrow: "平台能力",
        title: "案例检索与研习链路前后贯通",
        description: "从检索、阅读到研习，围绕同一份文书组织连续学习路径。",
      },
      {
        eyebrow: "课程支撑",
        title: "课程、资源与平台入口保持统一",
        description: "案例资源、课程体系与标准化材料可在同一站内连续浏览。",
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
        label: "注册用户",
        value: "800+",
        raw: 800,
      },
      totalVisits: {
        label: "累计访问",
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
      timeline: [
        { period: "第一期", title: "类案检索与法律适用" },
        { period: "第二期", title: "权利义务相一致原则的理论与实践" },
        { period: "第三期", title: "多元纠纷解决机制与商事仲裁实务" },
        { period: "第四期", title: "从“沉睡的权利”到正当救济的司法考量" },
        { period: "第五期", title: "非法证据排除规则" },
        { period: "第六期", title: "人脸识别中的同意边界与法理回应" },
        { period: "第七期", title: "平台劳动关系认定中的法理冲突" },
        { period: "第八期", title: "生成式AI的作品认定与责任边界" },
      ],
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
          detail: "课程主题从检索方法扩展到新兴法理议题。",
          metricLabel: "累计访问",
          metricValue: "5万+",
        },
        {
          title: "学习参与趋势",
          value: "800+ 注册用户",
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
          description: "双师协同课程、任务单与评价指标形成闭环。",
          coverageValue: "100%",
        },
        {
          title: "推广应用覆盖",
          description: "案例、资源、课程与成效展示形成统一入口。",
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
            "双师课堂、任务单和评价指标协同运转，提升课程组织的一致性。",
            "教学内容从理论讲授扩展到案例驱动与过程评价的复合模式。",
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
            "支持教学材料、过程记录和学生成果的集中管理。",
            "为后续案例扩展、课程迭代与资源更新提供了结构化内容底座。",
          ],
        },
        {
          title: "推广示范成效",
          intro: "以标准化材料和可复制流程推动经验传播与课程示范。",
          points: [
            "形成可共享的教学材料和标准化表单，覆盖跨班级、跨学期复用。",
            "为法理学教学改革提供了可参考的案例研习样板。",
            "推动教学改革经验从课程内部走向院系与同行交流。",
          ],
        },
      ],
    },
  };
}
