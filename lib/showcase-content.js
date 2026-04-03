import { getShowcaseCanonicalStudyHref } from "./showcase-cases.js";

export function buildShowcaseContent() {
  const studyDemoHref = getShowcaseCanonicalStudyHref();
  const canonicalCaseHref = studyDemoHref.replace(/\/study\/?$/u, "");

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
        "适用于课程展示、案例浏览与教学观摩。",
      ],
    },
    nav: [
      { label: "首页", href: "/", matchPrefix: "/" },
      { label: "课程体系", href: "/courses", matchPrefix: "/courses" },
      { label: "教学资源", href: "/resources", matchPrefix: "/resources" },
      { label: "案例检索库", href: "/cases", matchKind: "cases" },
      { label: "研习工作台", href: studyDemoHref, matchKind: "study" },
      { label: "成效展示", href: "/impact", matchPrefix: "/impact" },
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
    homeVideoBlock: {
      title: "课程视频展示",
      description: "通过课程视频回看双师课堂组织、案例进入方式与研习引导过程。",
      featured: {
        slug: "course-01-part-1",
        label: "主视频",
        title: "第一期上（一） 类案检索与法律适用",
        summary: "围绕第一期课程的起始部分，展示如何从案例检索进入法理学习。",
        purpose: "适用于课程展示与教学观摩。",
        href: "https://llm2x7.58u.cn/a/OkJ17Qn/",
      },
      supporting: [
        {
          slug: "course-01-part-2",
          label: "辅助视频",
          title: "第一期上（二） 检索方法与阅读路径",
          summary: "继续呈现从检索结果进入裁判文书阅读的课堂组织方式。",
          purpose: "适用于课堂参考与案例导读。",
          href: "https://llm2x7.58u.cn/a/b1PMnBj/",
        },
        {
          slug: "course-01-part-3",
          label: "辅助视频",
          title: "第一期上（三） 争点识别与导读示范",
          summary: "展示如何在真实案例中识别争点并建立导读判断。",
          purpose: "适用于案例教学与研习说明。",
          href: "https://llm2x7.58u.cn/a/AQy9W5M/",
        },
        {
          slug: "course-01-part-4",
          label: "辅助视频",
          title: "第一期上（四） 课堂研讨与表达训练",
          summary: "呈现课堂研讨如何转化为结构化表达与课堂输出。",
          purpose: "适用于教学观摩与课堂回看。",
          href: "https://llm2x7.58u.cn/a/bwX3kJQ/",
        },
        {
          slug: "course-01-part-5",
          label: "辅助视频",
          title: "第一期下 非法证据排除规则",
          summary: "围绕证据规则专题，呈现法理讨论与裁判理解的结合方式。",
          purpose: "适用于专题学习与课程回看。",
          href: "https://llm2x7.58u.cn/a/Rn83yvz/",
        },
        {
          slug: "course-02-part-1",
          label: "辅助视频",
          title: "第二期上 权利义务相一致原则",
          summary: "围绕第二期课堂内容，展示从理论原理进入规范讨论的路径。",
          purpose: "适用于课程展示与课堂复盘。",
          href: "https://llm2x7.58u.cn/a/Rj3Z7jX/",
        },
        {
          slug: "course-02-part-2",
          label: "辅助视频",
          title: "第二期下 理论回应与案例延展",
          summary: "延续第二期课程讨论，呈现理论回应与案例延展的课堂节奏。",
          purpose: "适用于教学观摩与学习参考。",
          href: "https://llm2x7.58u.cn/a/OzdXyrQ/",
        },
      ],
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
        value: "2万+",
        raw: 20000,
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
            "形成可共享的教学材料和标准化表单，便于跨班级、跨学期复用。",
            "为法理学教学改革提供了可参考的案例研习样板。",
            "推动教学改革经验从课程内部走向院系与同行交流。",
          ],
        },
      ],
    },
  };
}
