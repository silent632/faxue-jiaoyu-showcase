import { getShowcaseCanonicalStudyHref } from "./showcase-cases.js";

export function buildShowcaseContent() {
  const studyDemoHref = getShowcaseCanonicalStudyHref();
  const canonicalCaseHref = studyDemoHref.replace(/\/study\/?$/u, "");

  return {
    site: {
      title: "裁判文书研习平台",
      subtitle: "面向法理学教学改革的双师协同、案例研习与成果展示平台",
      intro: "围绕裁判文书研习、双师课程、教学资源与实践成效，集中展示法理学教学改革的内容、方法与成果。",
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
        description: "查看案例导读、基本信息与原文入口。",
      },
      {
        label: "研习工作台",
        href: studyDemoHref,
        description: "进入研习页面，完成事实梳理、争议焦点和法理分析。",
      },
    ],
    homeFlow: [
      {
        id: "01",
        title: "先在案例检索库中筛选案例",
        description: "从案由、年份、法院层级和法条切入，快速缩小阅读范围。",
      },
      {
        id: "02",
        title: "再在案例详情页中阅读导读",
        description: "结合摘要、法院、案号、裁判结果与原文入口，判断是否继续精读。",
      },
      {
        id: "03",
        title: "最后进入研习工作台完成分析",
        description: "围绕同一份裁判文书完成事实梳理、争议焦点和法理分析。",
      },
    ],
    homePreview: {
      featuredCases: [
        "案例筛选与结果列表",
        "案例导读与原文入口",
        "研习页面与结构化输出",
      ],
      studyHighlights: [
        "阅读区与写作区并置",
        "三步研习卡片逐项推进",
        "草稿可保存在当前浏览器",
      ],
    },
    platformHighlights: [
      {
        eyebrow: "平台能力",
        title: "案例、详情与研习一体呈现",
        description: "从首页即可进入案例检索、案例详情和研习工作台，形成完整的学习链路。",
      },
      {
        eyebrow: "课程支撑",
        title: "让课程、资源与平台形成统一入口",
        description: "案例资源、八期课程与标准化材料组织在同一站点中，便于教学阅读与材料引用。",
      },
      {
        eyebrow: "申报适配",
        title: "兼顾平台体验与成果表达",
        description: "页面将建设成效、资源体系和教学价值前置呈现，适合直接浏览与截图。",
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
            "为后续案例扩展与场景更新提供了结构化内容底座。",
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
