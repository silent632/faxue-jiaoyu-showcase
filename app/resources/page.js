import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ResourcesPage() {
  const content = buildShowcaseContent();
  const resourceNotes = {
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

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">教学资源</p>
          <h1>教学资源</h1>
          <p>围绕课程实施、案例研习与教学评价，平台逐步形成了结构清晰、可持续更新的教学资源体系。</p>
        </section>

        <div className="stack-grid">
          {content.resources.groups.map((group) => (
            <ShowcaseSection
              key={group.title}
              title={group.title}
              description={group.intro}
              className="showcase-section-compact"
              aria-label={group.title}
            >
              <div className="resource-grid">
                {group.items.map((item) => (
                  <article key={item} className="showcase-card resource-card">
                    <span className="showcase-card-eyebrow">{group.title}</span>
                    <strong>{item}</strong>
                    <p className="resource-card-note">{resourceNotes[item]}</p>
                  </article>
                ))}
              </div>
            </ShowcaseSection>
          ))}
        </div>
      </div>
    </main>
  );
}
