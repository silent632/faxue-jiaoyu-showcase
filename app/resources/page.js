import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

const sectionMetaByTitle = {
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

function defaultSectionMeta(group) {
  return {
    eyebrow: "资源配置",
    title: group.title,
    description: group.intro ?? "围绕课程实施、课堂协同与学习评价提供持续更新的教学支撑材料。",
  };
}

function buildSectionMeta(group) {
  return sectionMetaByTitle[group.title] ?? defaultSectionMeta(group);
}

function defaultResourceNote(group) {
  return `${group.title}中的材料围绕课程实施、研习支持与成果回收提供稳定支撑。`;
}

function buildResourceNote(group, item) {
  return resourceNotesByItem[item] ?? defaultResourceNote(group);
}

export default function ResourcesPage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">教学资源</p>
          <h1>教学资源配置</h1>
          <p>平台围绕课程实施、案例研习与教学评价逐步沉淀资源材料，形成兼顾课堂使用、协同记录与成果回收的教学支撑体系。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">资源说明</span>
          <strong>资源配置服务于课程全过程，而非单一课堂环节。</strong>
          <ul className="supporting-list">
            <li>前端材料帮助教师与学生快速进入裁判文书阅读与法理问题辨析。</li>
            <li>过程性表单保障双师协同、课堂观察与课后回收具有统一依据。</li>
            <li>评价性材料将学生反馈与研习成果纳入连续改进的教学闭环。</li>
          </ul>
        </article>

        <div className="stack-grid">
          {content.resources.groups.map((group) => {
            const sectionMeta = buildSectionMeta(group);

            return (
              <ShowcaseSection
                key={group.title}
                title={sectionMeta.title}
                eyebrow={sectionMeta.eyebrow}
                description={sectionMeta.description}
                className="showcase-section-compact"
                aria-label={group.title}
              >
                <div className="resource-grid">
                  {group.items.map((item) => (
                    <article key={item} className="showcase-card resource-card">
                      <span className="showcase-card-eyebrow">{group.title}</span>
                      <strong>{item}</strong>
                      <p className="resource-card-note">{buildResourceNote(group, item)}</p>
                    </article>
                  ))}
                </div>
              </ShowcaseSection>
            );
          })}
        </div>
      </div>
    </main>
  );
}
