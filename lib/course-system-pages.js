export const COURSE_PERIOD_SECTIONS = [
  { key: "introduction", label: "本期导读", hrefSegment: "introduction" },
  { key: "questions", label: "重点问题", hrefSegment: "questions" },
  { key: "content", label: "内容展开", hrefSegment: "content" },
  { key: "materials", label: "材料与案例", hrefSegment: "materials" },
  { key: "outcomes", label: "学习成果", hrefSegment: "outcomes" },
  { key: "teaching", label: "教学安排", hrefSegment: "teaching" },
];

const DEFAULT_CARD_COPY = {
  introduction: {
    summary: "交代本期主题、课程位置和进入线索。",
    detail: "先说明这期课为什么从这里切入，再进入后续内容。",
  },
  questions: {
    summary: "把真正需要判断的争议集中摆出来。",
    detail: "不堆概念，直接落到本期需要追问的核心问题。",
  },
  content: {
    summary: "按课程推进顺序展开本期主线。",
    detail: "从导入、分析到收束，完整交代这一期如何展开。",
  },
  materials: {
    summary: "把课件、导学、任务单和案例按用途归类。",
    detail: "材料不再按文件夹罗列，而是按课程作用组织。",
  },
  outcomes: {
    summary: "把学生产出、反馈和课堂回应集中展示。",
    detail: "重点看学生如何回应课程问题，而不是只看统计数量。",
  },
  teaching: {
    summary: "交代双师分工、课堂推进和训练重点。",
    detail: "把课堂怎么推进、重点练什么、为什么这样安排讲清楚。",
  },
};

function flattenMaterialItems(period) {
  return period.materialGroups
    .flatMap((group) => group.items)
    .reduce((items, item) => {
      if (!item?.displayName) return items;
      if (items.some((existing) => existing.displayName === item.displayName)) return items;
      items.push(item);
      return items;
    }, []);
}

function pickDisplayNames(items, matcher, limit = 4) {
  return items
    .filter((item) => matcher.test(item.displayName))
    .map((item) => item.displayName)
    .slice(0, limit);
}

function getPublicMaterialMap(period) {
  const items = flattenMaterialItems(period);

  return {
    courseware: pickDisplayNames(items, /课程课件|课件讲义版|专题阅读|教学材料指南/u),
    cases: pickDisplayNames(items, /裁判文书法理导学|裁判文书研习任务单/u),
    teaching: pickDisplayNames(items, /双师职责分工表|双师课堂记录观察表|双师合作互评问卷|学生综合能力评价指标体系/u),
    outcomes: pickDisplayNames(items, /学生研习报告|学生课后反馈/u),
  };
}

function buildSectionNavItems(period) {
  return COURSE_PERIOD_SECTIONS.map((item) => ({
    ...item,
    href: `/courses/${period.slug}/${item.hrefSegment}`,
  }));
}

function buildPeriodHomeCards(period, overrides = {}) {
  return COURSE_PERIOD_SECTIONS.map((section) => {
    const copy = overrides[section.key] ?? DEFAULT_CARD_COPY[section.key];

    return {
      key: section.key,
      label: section.label,
      summary: copy.summary,
      detail: copy.detail,
      href: `/courses/${period.slug}/${section.hrefSegment}`,
    };
  });
}

function buildFallbackQuestionItems(period) {
  const theme = period.guide.courseTheme || period.theme;
  const caseLead = period.guide.caseDirections?.[0] || `${theme}如何进入裁判材料`;
  const preStudyLead = period.guide.preStudy?.[0] || "学生进入课堂前需要完成哪些准备";
  const goalLead = period.guide.goals?.[0] || "这一期课程希望学生形成什么判断能力";

  return [
    {
      question: `${theme}在这一期首先要解决什么判断问题？`,
      detail: period.guide.coursePosition || period.summary,
    },
    {
      question: "从哪些案例线索进入，最能看出这一期的争议结构？",
      detail: caseLead,
    },
    {
      question: "学生进入课堂前需要带着什么阅读准备？",
      detail: preStudyLead,
    },
    {
      question: "这一期最终要把什么能力练出来？",
      detail: goalLead,
    },
  ];
}

function buildFallbackBlocks(period) {
  const outline = Array.isArray(period.outline) && period.outline.length > 0
    ? period.outline
    : ["主题导入", "问题分析", "课堂讨论", "表达收束"];

  return outline.slice(0, 4).map((title, index) => ({
    title,
    paragraphs: [
      index === 0
        ? period.guide.coursePosition || period.summary
        : period.guide.highlights?.[index - 1] || period.summary,
    ],
    bullets: index === 1 ? (period.guide.goals || []).slice(0, 3) : [],
  }));
}

function buildFallbackMaterials(period) {
  const map = getPublicMaterialMap(period);

  return [
    {
      title: "课件与主题材料",
      summary: "先把本期主题、课程位置和阅读入口交代清楚。",
      items: map.courseware.length > 0 ? map.courseware : ["教学材料指南"],
    },
    {
      title: "案例导学与任务组织",
      summary: "围绕核心案例建立阅读顺序、争点识别和任务推进。",
      items: map.cases.length > 0 ? map.cases : ["裁判文书法理导学", "裁判文书研习任务单"],
    },
    {
      title: "课堂支持材料",
      summary: "把双师协同、课堂记录和评价线索放在同一组材料里理解。",
      items: map.teaching.length > 0 ? map.teaching : ["双师职责分工表", "双师课堂记录观察表"],
    },
  ];
}

function buildFallbackOutcomes(period) {
  const map = getPublicMaterialMap(period);

  return [
    {
      title: "学生输出",
      summary: "用学生的研习报告回应课程中的核心争议。",
      items: map.outcomes.filter((item) => /学生研习报告/u.test(item)).length > 0
        ? map.outcomes.filter((item) => /学生研习报告/u.test(item))
        : ["学生研习报告"],
    },
    {
      title: "课后反馈",
      summary: "看学生如何回顾本期的重点问题和阅读难点。",
      items: map.outcomes.filter((item) => /学生课后反馈/u.test(item)).length > 0
        ? map.outcomes.filter((item) => /学生课后反馈/u.test(item))
        : ["学生课后反馈"],
    },
  ];
}

function buildFallbackTeaching(period) {
  return [
    {
      title: "双师分工",
      paragraphs: [
        `${period.guide.theoryMentor || "理论导师"}负责法理框架与规范解释，${period.guide.practiceMentor || "实务导师"}负责把判断放回真实案件情境。`,
      ],
      bullets: [
        "先建立概念和规范入口，再进入案例判断。",
        "把课堂追问放在关键争议节点，而不是平均铺开。",
      ],
    },
    {
      title: "课堂推进",
      paragraphs: [
        period.guide.coursePosition || period.summary,
      ],
      bullets: (period.outline || []).slice(0, 4),
    },
    {
      title: "训练重点",
      paragraphs: [
        "这一期的训练重点不只在知道结论，更在于能把结论说清楚、论证完整。",
      ],
      bullets: (period.guide.goals || []).slice(0, 3),
    },
  ];
}

function buildFallbackCourseSystemPages(period) {
  const navItems = buildSectionNavItems(period);
  const map = getPublicMaterialMap(period);

  return {
    periodHome: {
      summary: period.guide.coursePosition || period.summary,
      highlights: (period.guide.highlights || period.archiveCard?.keyPoints || []).slice(0, 3),
      materialClues: [...map.courseware, ...map.cases].slice(0, 4),
      cards: buildPeriodHomeCards(period),
    },
    sectionNavItems: navItems,
    sectionPages: {
      introduction: {
        title: "本期导读",
        lead: period.guide.coursePosition || period.summary,
        paragraphs: [
          period.summary,
          `本期主题围绕${period.guide.courseTheme || period.theme}展开，重点不在堆砌概念，而在把课堂判断落回真实材料。`,
        ],
        blocks: [
          {
            title: "课程位置",
            paragraphs: [
              period.module,
              period.phaseLabel,
            ],
          },
        ],
      },
      questions: {
        title: "重点问题",
        lead: "这一期真正要回答的问题，决定了课堂如何进入、如何展开、如何收束。",
        questions: buildFallbackQuestionItems(period),
      },
      content: {
        title: "内容展开",
        lead: "课程主线按推进顺序展开，重点看每一步在解决什么问题。",
        blocks: buildFallbackBlocks(period),
      },
      materials: {
        title: "材料与案例",
        lead: "材料不按文件名堆放，而按它们在课堂中的作用归类。",
        groups: buildFallbackMaterials(period),
      },
      outcomes: {
        title: "学习成果",
        lead: "这一页重点看学生如何回应课程问题，以及课堂产出落在什么方向。",
        groups: buildFallbackOutcomes(period),
      },
      teaching: {
        title: "教学安排",
        lead: "双师分工、课堂推进和训练重点在这里集中呈现。",
        blocks: buildFallbackTeaching(period),
      },
    },
  };
}

function buildPeriod01Pages(period) {
  const materials = getPublicMaterialMap(period);

  return {
    periodHome: {
      summary: "第一期从类案检索切入，不是为了单独讲检索工具，而是为了给后续裁判文书研习建立统一的进入方式。",
      highlights: [
        "课程主线清楚落在类案检索、阅读路径、争点识别和表达训练四个环节。",
        "借名买房案与优先承租权案构成第一期的两组核心训练样本。",
        "这一期的重点不在检索数量，而在检索结果能否转成导读判断。",
      ],
      materialClues: [...materials.courseware, ...materials.cases].slice(0, 4),
      cards: buildPeriodHomeCards(period, {
        introduction: {
          summary: "先讲清为什么课程要从类案检索起步。",
          detail: "重点交代第一期在八期课程中的位置，以及检索如何服务后续阅读。",
        },
        questions: {
          summary: "把同类案件为何会出现不同裁判路径直接摆出来。",
          detail: "问题不止是“能否搜到”，更是“如何判断它是否可比”。",
        },
        content: {
          summary: "把检索、比较、争点识别和表达训练连成一条主线。",
          detail: "按课堂推进顺序完整看到这一期是怎样展开的。",
        },
        materials: {
          summary: "课件、专题阅读、导学和任务单分开呈现。",
          detail: "材料不再按原始文件堆放，而是按课程作用归类。",
        },
        outcomes: {
          summary: "学生报告、反馈和课堂回应放在同一页看。",
          detail: "重点看学生有没有把检索结果转成有理由的表达。",
        },
        teaching: {
          summary: "把双师分工和课堂推进方式交代清楚。",
          detail: "这一期的安排重点是先把方法起点搭稳，再推进后续讨论。",
        },
      }),
    },
    sectionNavItems: buildSectionNavItems(period),
    sectionPages: {
      introduction: {
        title: "本期导读",
        lead: "第一期不是把类案检索当成技术演示，而是把它放回裁判文书阅读的起点位置。",
        paragraphs: [
          "课程从类案检索切入，目的是让学生先学会怎样进入一个争议，而不是一开始就落在结论背诵上。",
          "检索只是起点，真正重要的是通过比较同类案件的事实结构和裁判理由，形成后续导读与讨论的判断基础。",
        ],
        blocks: [
          {
            title: "课程位置",
            paragraphs: [
              "第一期承担的是方法起点的作用，后续几期都会反复回到这一套“先检索、再比较、再判断”的进入方式。",
            ],
          },
          {
            title: "阅读价值",
            paragraphs: [
              "学生在这一期建立的不是零散检索技巧，而是一套能够把案例材料转成课堂表达的阅读路径。",
            ],
          },
        ],
      },
      questions: {
        title: "重点问题",
        lead: "第一期真正需要追问的，是类案检索如何服务法律适用判断，而不是停留在“找到多少案例”。",
        questions: [
          {
            question: "同类案件为什么会出现不同裁判路径？",
            detail: "第一期从这里进入，要求学生比较案件事实、争点设置和裁判理由，而不是只看结果是否一致。",
          },
          {
            question: "检索范围如何划定，才不会把不具可比性的案件混在一起？",
            detail: "借名买房案与优先承租权案分别提供了两种进入方式，帮助学生理解什么叫真正可比。",
          },
          {
            question: "找到案例之后，哪些事实差异足以影响法律适用？",
            detail: "课堂重点放在差异判断，而不是罗列相似点，训练学生把注意力放回裁判理由。",
          },
          {
            question: "检索结果怎样转成课堂导读与法理表达？",
            detail: "学生最终要能把材料整理为有顺序的发言，而不是停留在材料摘抄。",
          },
        ],
      },
      content: {
        title: "内容展开",
        lead: "第一期的推进顺序很清楚：先确立检索入口，再进入案例比较，随后提炼争点，最后回到课堂表达。",
        blocks: [
          {
            title: "类案检索起点",
            paragraphs: [
              "课堂先从什么叫类案、为什么需要检索类案进入，帮助学生建立面对争议时的第一步动作。",
            ],
          },
          {
            title: "检索方法与阅读路径",
            paragraphs: [
              "学生需要学会在检索结果里筛掉干扰项，把真正可比的案件留下来，再按事实、争点、说理的顺序阅读。",
            ],
          },
          {
            title: "争点识别与导读示范",
            paragraphs: [
              "借名买房案和优先承租权案被放在这里，目的是让学生看到同类案件中的关键差异究竟出现在哪里。",
            ],
          },
          {
            title: "课堂研讨与表达训练",
            paragraphs: [
              "课程最后回到表达训练，要求学生把检索与比较得出的判断整理成清楚、可讨论的课堂发言。",
            ],
          },
        ],
      },
      materials: {
        title: "材料与案例",
        lead: "第一期材料围绕检索入口、案例比较和表达训练三条线索组织。",
        groups: [
          {
            title: "课件与主题阅读",
            summary: "这一组材料先把类案检索的进入方式和阅读顺序交代清楚。",
            items: materials.courseware.length > 0
              ? materials.courseware
              : ["课程课件：类案检索与法律适用", "课件讲义版：类案检索与法律适用", "专题阅读：司法裁判的“同”与“不同”"],
          },
          {
            title: "案例导学",
            summary: "核心案例不只用于举例，而是用来训练学生比较事实、争点和裁判理由。",
            items: materials.cases.length > 0
              ? materials.cases
              : ["裁判文书法理导学：借名买房案", "裁判文书法理导学：优先承租权案", "裁判文书研习任务单"],
          },
          {
            title: "课堂支持材料",
            summary: "课堂记录、评价指标和双师协同材料共同支撑这一期的方法训练。",
            items: materials.teaching.length > 0
              ? materials.teaching
              : ["双师职责分工表", "双师课堂记录观察表", "学生综合能力评价指标体系"],
          },
        ],
      },
      outcomes: {
        title: "学习成果",
        lead: "第一期的学习成果主要体现在学生能否把检索结果转成有根据的比较和表达。",
        groups: [
          {
            title: "学生研习报告",
            summary: "学生需要围绕案件差异、争点提炼和裁判理由完成书面表达。",
            items: materials.outcomes.filter((item) => /学生研习报告/u.test(item)).length > 0
              ? materials.outcomes.filter((item) => /学生研习报告/u.test(item))
              : ["学生研习报告"],
          },
          {
            title: "课后反馈",
            summary: "反馈重点落在检索是否真正帮助理解案件，而不是停留在工具层面。",
            items: materials.outcomes.filter((item) => /学生课后反馈/u.test(item)).length > 0
              ? materials.outcomes.filter((item) => /学生课后反馈/u.test(item))
              : ["学生课后反馈"],
          },
          {
            title: "课堂观察",
            summary: "课堂记录与评价材料帮助回看学生是否完成了从检索到表达的转化。",
            items: materials.teaching.filter((item) => /课堂记录|评价指标/u.test(item)).length > 0
              ? materials.teaching.filter((item) => /课堂记录|评价指标/u.test(item))
              : ["双师课堂记录观察表", "学生综合能力评价指标体系"],
          },
        ],
      },
      teaching: {
        title: "教学安排",
        lead: "第一期的安排重点是把方法起点搭稳，让学生知道后续几期进入案例时该如何阅读、如何发言。",
        blocks: [
          {
            title: "双师分工",
            paragraphs: [
              "理论导师负责把类案检索、法律适用和争点识别的法理框架讲清楚，实务导师负责把这些方法放回真实案件阅读中落地。",
            ],
            bullets: [
              "理论导师：搭建检索与比较的判断框架。",
              "实务导师：示范如何把检索结果转成案例导读。",
            ],
          },
          {
            title: "课堂推进",
            paragraphs: [
              "课堂先解决“从哪里进入”，再解决“如何比较”，最后回到“怎样表达”，顺序不能颠倒。",
            ],
            bullets: [
              "类案检索起点",
              "检索方法与阅读路径",
              "争点识别与导读示范",
              "课堂研讨与表达训练",
            ],
          },
          {
            title: "训练重点",
            paragraphs: [
              "这一期练的不是资料搜集速度，而是比较能力、争点提炼能力和课堂表达能力。",
            ],
            bullets: [
              "识别哪些案件真正可比。",
              "把事实差异转成法律适用判断。",
              "形成简洁而有依据的课堂表达。",
            ],
          },
        ],
      },
    },
  };
}

function buildPeriod05Pages(period) {
  const materials = getPublicMaterialMap(period);

  return {
    periodHome: {
      summary: "第五期围绕非法证据排除规则展开，核心不是讲证据技术，而是让学生理解程序正义如何约束国家取证权力。",
      highlights: [
        "课程从“为什么真实证据仍可能被排除”这个问题进入，先建立程序正义的价值张力。",
        "言词证据、搜查扣押与电子数据三类场景构成第五期的分析主线。",
        "双师协同的重点在于把规范解释与真实办案经验放在同一个判断框架里。",
      ],
      materialClues: [...materials.courseware, ...materials.cases].slice(0, 4),
      cards: buildPeriodHomeCards(period, {
        introduction: {
          summary: "先讲清第五期为什么从程序正义进入。",
          detail: "重点不是证据技术分类，而是国家取证权力边界应如何判断。",
        },
        questions: {
          summary: "把真实发现与程序合法之间的张力直接摆出来。",
          detail: "这一页集中追问哪些瑕疵必须排除，哪些只影响证明力。",
        },
        content: {
          summary: "把法理基础、争议场景和裁判分析路径串成一条主线。",
          detail: "按课堂推进顺序理解第五期如何从抽象法理进入具体案件。",
        },
        materials: {
          summary: "课件、导学、任务单与核心案例按用途归类。",
          detail: "不再把制作层文件原样摆到页面上，而是转成课程材料结构。",
        },
        outcomes: {
          summary: "把学生报告、课堂讨论和反馈放在一起看。",
          detail: "重点看学生是否能在权利保障与犯罪控制之间提出有理由的判断。",
        },
        teaching: {
          summary: "展示双师分工、课堂追问和训练重点。",
          detail: "看第五期怎样把程序正义讲成可判断、可讨论的课堂内容。",
        },
      }),
    },
    sectionNavItems: buildSectionNavItems(period),
    sectionPages: {
      introduction: {
        title: "本期导读",
        lead: "第五期从非法证据排除规则切入，真正要讲的是程序正义如何约束国家取证权力，而不是证据条文的机械罗列。",
        paragraphs: [
          "这一期把学生带入刑事诉讼中的核心张力：即便某项证据可能接近真实，只要取证过程严重违法，它仍可能失去进入裁判的资格。",
          "课程因此从程序正义和正当程序进入，再回到言词证据、搜查扣押、电子数据等具体争议场景，让学生看到制度价值怎样落在具体案件里。",
        ],
        blocks: [
          {
            title: "课程位置",
            paragraphs: [
              "第五期进入后四期的专题深化阶段，课堂重心从前四期的案例进入与方法训练，转向更完整的制度价值判断。",
            ],
          },
          {
            title: "阅读价值",
            paragraphs: [
              "学生在这一期需要建立的，是在发现真实与权利保障之间提出有理由判断的能力，而不是只背诵排除规则条文。",
            ],
          },
        ],
      },
      questions: {
        title: "重点问题",
        lead: "第五期的核心不在于记住哪些程序有瑕疵，而在于理解这些瑕疵为何会影响证据能否进入裁判。",
        questions: [
          {
            question: "为什么一项已经接近真实的证据仍可能被排除？",
            detail: "课程先从这个问题进入，让学生理解程序正义不是真实发现的附属条件，而是国家取证权力的边界。",
          },
          {
            question: "证据能力与证明力应怎样区分？",
            detail: "第五期强调先判断证据有没有进入裁判的资格，再判断它在裁判中究竟有多大分量。",
          },
          {
            question: "哪些程序瑕疵必须触发排除，哪些只会削弱证明力？",
            detail: "言词证据、搜查扣押和电子数据三个场景被放在一起比较，就是为了把边界看清楚。",
          },
          {
            question: "法院如何在犯罪控制与权利保障之间提出有说服力的理由？",
            detail: "这一期最终要求学生把价值衡量写进案例分析，而不是只停留在态度表达。",
          },
        ],
      },
      content: {
        title: "内容展开",
        lead: "第五期从价值问题进入，再到具体场景比较，最后回到裁判分析路径和课堂表达。",
        blocks: [
          {
            title: "问题与法理基础",
            paragraphs: [
              "课程先回答一个基础问题：为什么非法证据排除不是技术细节，而是程序正义、正当程序和刑事法治秩序的集中体现。",
            ],
          },
          {
            title: "争议场景展开",
            paragraphs: [
              "言词证据中的疲劳审讯与诱导供述、搜查扣押中的程序违法、电子数据中的提取瑕疵，被放在同一套分析框架下比较。",
            ],
          },
          {
            title: "裁判分析路径",
            paragraphs: [
              "课程要求学生先重建取证经过，再辨别程序瑕疵的性质，最后判断它对证据能力和证明力分别造成什么影响。",
            ],
          },
          {
            title: "课堂讨论与收束",
            paragraphs: [
              "双师课堂在最后回到讨论题与学生输出，要求学生把制度价值、规范条文和案件事实连成完整论证。",
            ],
          },
        ],
      },
      materials: {
        title: "材料与案例",
        lead: "第五期不再把制作层文件直接暴露出来，而是把真正服务课堂判断的材料按作用归类。",
        groups: [
          {
            title: "主题导入材料",
            summary: "这一组材料负责建立程序正义与非法证据排除的进入问题。",
            items: materials.courseware.length > 0
              ? materials.courseware
              : ["教学材料指南", "裁判文书法理导学", "裁判文书研习任务单"],
          },
          {
            title: "案例分析材料",
            summary: "围绕疲劳审讯、搜查扣押、电子数据三类场景组织案例比较和裁判理由分析。",
            items: materials.cases.length > 0
              ? materials.cases
              : ["裁判文书法理导学", "裁判文书研习任务单"],
          },
          {
            title: "课堂支持材料",
            summary: "双师职责、课堂记录和评价材料共同支撑课堂追问与学生输出。",
            items: materials.teaching.length > 0
              ? materials.teaching
              : ["双师职责分工表", "双师课堂记录观察表", "双师合作互评问卷"],
          },
        ],
      },
      outcomes: {
        title: "学习成果",
        lead: "第五期的学习成果重点看学生能否把程序正义、证据能力和权利保障之间的关系讲清楚。",
        groups: [
          {
            title: "学生报告",
            summary: "学生需要围绕非法证据排除的边界问题形成书面判断，而不是只重复条文。",
            items: materials.outcomes.filter((item) => /学生研习报告/u.test(item)).length > 0
              ? materials.outcomes.filter((item) => /学生研习报告/u.test(item))
              : ["学生研习报告"],
          },
          {
            title: "课后反馈",
            summary: "反馈重点落在学生如何理解真实发现与程序合法之间的关系，以及课堂难点落在哪里。",
            items: materials.outcomes.filter((item) => /学生课后反馈/u.test(item)).length > 0
              ? materials.outcomes.filter((item) => /学生课后反馈/u.test(item))
              : ["学生课后反馈"],
          },
          {
            title: "课堂回应",
            summary: "课堂观察与评价材料帮助回看学生是否真正完成了价值衡量与案例分析。",
            items: materials.teaching.filter((item) => /课堂记录|评价指标/u.test(item)).length > 0
              ? materials.teaching.filter((item) => /课堂记录|评价指标/u.test(item))
              : ["双师课堂记录观察表", "学生综合能力评价指标体系"],
          },
        ],
      },
      teaching: {
        title: "教学安排",
        lead: "第五期的课堂安排重在把抽象法理和真实办案经验放在同一个判断框架里，让学生看到规则背后的制度理由。",
        blocks: [
          {
            title: "双师分工",
            paragraphs: [
              "理论导师负责程序正义、正当程序和非法证据排除规则的规范解释，实务导师负责把这些规则放回具体取证过程和裁判理由中理解。",
            ],
            bullets: [
              "理论导师：搭建规范与价值判断框架。",
              "实务导师：补足真实办案中的取证细节与争议点。",
            ],
          },
          {
            title: "课堂推进",
            paragraphs: [
              "课堂先从价值冲突进入，再分别处理三类争议场景，最后回到裁判分析路径和学生表达。",
            ],
            bullets: [
              "问题与法理基础",
              "争议场景展开",
              "裁判分析路径",
              "课堂讨论与收束",
            ],
          },
          {
            title: "训练重点",
            paragraphs: [
              "这一期的训练重点是把制度价值、规范条文和案件事实连成完整论证，避免只给出态度而不给出理由。",
            ],
            bullets: [
              "区分证据能力与证明力。",
              "辨别一般瑕疵与必须排除的边界。",
              "在权利保障与犯罪控制之间提出可论证的判断。",
            ],
          },
        ],
      },
    },
  };
}

const SAMPLE_BUILDERS = {
  "course-period-01": buildPeriod01Pages,
  "course-period-05": buildPeriod05Pages,
};

export function buildCourseSystemPages(period) {
  const builder = SAMPLE_BUILDERS[period.slug];

  if (!builder) {
    return buildFallbackCourseSystemPages(period);
  }

  return builder(period);
}
