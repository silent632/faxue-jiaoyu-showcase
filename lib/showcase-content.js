export function buildShowcaseContent() {
  const studyDemoHref = "/cases/demo/study";

  return {
    site: {
      title: "裁判文书研习平台",
      subtitle: "面向法理学教学改革的双师协同、案例研习与成果展示平台",
      intro:
        "以裁判文书研习为载体，联动课程建设、双师协同、资源整合与实践成效，构建服务法理学教学改革的数字化学习与展示空间。",
    },
    nav: [
      { label: "首页", href: "/" },
      { label: "课程体系", href: "/courses" },
      { label: "教学资源", href: "/resources" },
      { label: "案例检索库", href: "/cases" },
      { label: "研习工作台", href: studyDemoHref },
      { label: "成效展示", href: "/impact" },
    ],
    homeEntries: [
      {
        label: "案例检索库",
        href: "/cases",
        description: "查找、浏览并筛选教学所需的典型裁判文书。",
      },
      {
        label: "研习工作台",
        href: studyDemoHref,
        description: "进入案例研读与任务式学习的公共工作区。",
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
      categories: [
        "教学材料指南",
        "裁判文书法理导学",
        "裁判文书研习任务单",
        "双师职责分工表",
        "双师课堂记录观察表",
        "双师合作互评问卷",
        "学生综合能力评价指标体系",
        "学生课后反馈与研习成果",
      ],
    },
    impact: {
      sections: [
        { title: "教学建设成效" },
        { title: "学生发展成效" },
        { title: "平台运行成效" },
        { title: "推广示范成效" },
      ],
    },
  };
}
