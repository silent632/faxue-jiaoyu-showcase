import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ResourcesPage() {
  const content = buildShowcaseContent();
  const resourceNotes = {
    "教学材料指南": "统一教学材料口径，方便课程组织与课堂引用。",
    "裁判文书法理导学": "提供从文书阅读到法理抽取的导读路径。",
    "裁判文书研习任务单": "把课堂目标拆成可操作的研习步骤与提交项。",
    "案例研习流程说明": "明确案例进入、讨论、记录和回收的教学流程。",
    "双师职责分工表": "用角色分工保障教师协同和课堂执行的一致性。",
    "双师课堂记录观察表": "沉淀课堂过程证据，便于复盘与申报展示。",
    "双师合作互评问卷": "用于教学改进与教师协作的反馈闭环。",
    "学生综合能力评价指标体系": "把学习过程和成果评价拉到同一标准。",
    "学生课后反馈与研习成果": "保留学生输出样本，呈现资源支撑下的学习结果。",
  };

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">教学资源</p>
          <h1>教学资源</h1>
          <p>以教学资源与标准化支撑两层结构，呈现课程运行的资料底座。</p>
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
                    <span className="showcase-card-eyebrow">资源单元</span>
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
