const timelineDetailsByPeriod = {
  第一期: { phase: "案例进入", focus: "从类案检索与法律适用切入，建立课程起点。" },
  第二期: { phase: "理论展开", focus: "围绕权利义务一致原则展开法理辨析与实践讨论。" },
  第三期: { phase: "研讨推进", focus: "把商事争议中的事实识别、证据梳理与程序判断纳入课堂。" },
  第四期: { phase: "方法训练", focus: "围绕权利救济与规范适用，训练更稳定的法律表达。" },
  第五期: { phase: "规则专题", focus: "以非法证据排除为例，推进规则理解与课堂讨论。" },
  第六期: { phase: "数字议题", focus: "聚焦人脸识别中的同意边界与权利保护问题。" },
  第七期: { phase: "治理前沿", focus: "围绕平台劳动与算法治理，延展法理学视野。" },
  第八期: { phase: "前沿收束", focus: "以生成式 AI 的责任边界回应技术发展中的新问题。" },
};

const defaultTimelineDetail = {
  phase: "课程推进",
  focus: "围绕案例研习、规范适用与课堂讨论组织连续推进的法理学习。",
};

const resourceSectionMetaByTitle = {
  "教学资源与资源体系": {
    eyebrow: "实施材料",
    title: "课堂实施与研习材料",
    description: "围绕课堂组织、文书导读与研习流程配置基础材料，确保每次课程都能按统一逻辑进入案例学习。",
  },
  "标准材料与标准化支撑": {
    eyebrow: "协同支撑",
    title: "协同记录与评价支撑",
    description: "通过统一模板、观察表与评价指标，将双师协作、课堂记录和学生反馈纳入可持续的支撑体系。",
  },
};

const resourceNotesByItem = {
  "教学材料指南": "围绕课程组织、课堂引用与材料使用形成统一口径。",
  "裁判文书法理导学": "帮助学生从文书阅读进入法理问题的提炼与辨析。",
  "裁判文书研习任务单": "把课堂目标转化为可操作的研习步骤与学习要求。",
  "案例研习流程说明": "将案例进入、讨论、记录与回收组织为清晰的课堂流程。",
  "双师职责分工表": "明确双师协同中的分工关系，保障课堂推进的稳定性。",
  "双师课堂记录观察表": "记录课堂运行与教学细节，为复盘和改进提供依据。",
  "双师合作互评问卷": "围绕协同过程和课堂实施形成持续反馈。",
  "学生综合能力评价指标体系": "将案例研读、课堂参与和成果表达纳入统一评价框架。",
  "学生课后反馈与研习成果": "保存学生反馈与学习输出，呈现资源支撑下的研习成果。",
};

const impactSectionMetaByTitle = {
  "教学建设成效": {
    eyebrow: "建设成效",
    title: "教学建设与组织机制",
    description: "围绕课程结构、双师协同与过程评价三个方面，呈现项目在教学组织层面的持续建设成果。",
  },
  "学生发展成效": {
    eyebrow: "学生发展",
    title: "学生能力发展表现",
    description: "从检索、分析与表达三个层面观察学生学习能力的变化，回应案例研习导向下的培养目标。",
  },
  "平台运行成效": {
    eyebrow: "平台运行",
    title: "平台运行与内容沉淀",
    description: "平台运行成效主要体现在案例、课程与资源入口的统一组织，以及教学资料的持续沉淀能力。",
  },
  "推广示范成效": {
    eyebrow: "示范推广",
    title: "示范推广与交流价值",
    description: "标准化材料与平台展示形态共同提升了项目的复用性、交流性与对外展示完整度。",
  },
};

const impactSummariesByTitle = {
  "教学建设成效": {
    lead: "围绕课程组织、双师协同与过程评价，项目已形成较稳定的教学建设框架。",
    points: ["八期课程形成连续推进的结构", "双师协作与课堂任务单协同运行", "教学评价逐步形成过程性闭环"],
  },
  "学生发展成效": {
    lead: "学生在案例检索、文书研读与论证表达方面形成了更完整的学习能力。",
    points: ["提升裁判文书检索与提炼能力", "增强争点识别与论证表达能力", "课堂参与和成果输出更加完整"],
  },
  "平台运行成效": {
    lead: "平台将课程、案例与资源组织为统一入口，支撑持续运行与集中展示。",
    points: ["案例、课程与资源形成统一归档", "支持教学记录与学习成果沉淀", "平台结构具备持续扩展能力"],
  },
  "推广示范成效": {
    lead: "标准化材料和平台形态提升了项目的复用性、交流性与示范价值。",
    points: ["共享表单和流程覆盖跨班复用", "案例研习样板可直接进入院系交流场景", "成果内容已整理为站内展示与材料引用形态"],
  },
};

export function getCourseTimelineDetail(item) {
  return timelineDetailsByPeriod[item.period] ?? timelineDetailsByPeriod[item.title] ?? defaultTimelineDetail;
}

export function defaultResourceSectionMeta(group) {
  return {
    eyebrow: "资源配置",
    title: group.title,
    description: group.intro ?? "围绕课程实施、课堂协同与学习评价提供持续更新的教学支撑材料。",
  };
}

export function buildResourceSectionMeta(group) {
  return resourceSectionMetaByTitle[group.title] ?? defaultResourceSectionMeta(group);
}

export function defaultResourceNote(group) {
  return `${group.title}中的材料围绕课程实施、研习支持与成果回收提供稳定支撑。`;
}

export function buildResourceNote(group, item) {
  return resourceNotesByItem[item] ?? defaultResourceNote(group);
}

export function defaultImpactSectionMeta(item) {
  return {
    eyebrow: "项目成效",
    title: item.title,
    description: item.intro ?? "围绕教学建设、平台运行与学习成果持续呈现项目推进成效。",
  };
}

export function buildImpactSectionMeta(item) {
  return impactSectionMetaByTitle[item.title] ?? defaultImpactSectionMeta(item);
}

export function defaultImpactSummary(item) {
  const fallbackPoints =
    item.points?.length > 0
      ? item.points.slice(0, 3)
      : ["围绕课程实施、资源支撑与平台展示持续沉淀项目成效。"];

  return {
    lead: item.intro ?? "项目围绕课程实施、案例研习与平台支撑形成了持续推进的整体成效。",
    points: fallbackPoints,
  };
}

export function buildImpactSummary(item) {
  return impactSummariesByTitle[item.title] ?? defaultImpactSummary(item);
}
