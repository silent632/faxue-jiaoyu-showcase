import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const impactNotes = {
    "教学建设成效": {
      lead: "课程组织和双师协同更稳定，已形成可展示的建设框架。",
      points: ["八期课程形成递进式结构", "双师协作与课堂任务单联动", "教学评价形成过程性闭环"],
    },
    "学生发展成效": {
      lead: "学生从“听讲”转向“检索、研读、表达”三位一体的研习状态。",
      points: ["提升裁判文书检索与提炼能力", "增强争点识别与论证表达能力", "课堂参与和成果输出更完整"],
    },
    "平台运行成效": {
      lead: "平台把课程、案例和资源串成统一入口，便于持续运行。",
      points: ["案例、课程、资源统一归档展示", "支持教学记录与学习成果沉淀", "页面结构适合后续持续扩展"],
    },
    "推广示范成效": {
      lead: "标准化材料让成果更容易复用、交流和推广。",
      points: ["共享表单和流程便于跨班复用", "案例研习样板适合院系传播", "成果展示可直接用于申报截图"],
    },
  };

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">成效展示</p>
          <h1>成效展示</h1>
          <p>从教学建设、学生发展、平台运行与推广示范四个维度呈现项目成效。</p>
        </section>

        <div className="stack-grid">
          {content.impact.sections.map((item) => (
            <ShowcaseSection
              key={item.title}
              title={item.title}
              description={item.intro}
              className="showcase-section-compact"
              aria-label={item.title}
            >
              <div className="impact-grid">
                {item.points.map((point) => (
                  <article key={point} className="showcase-card impact-card">
                    <span className="showcase-card-eyebrow">价值维度</span>
                    <strong>{point}</strong>
                  </article>
                ))}
              </div>
              <article className="showcase-card impact-summary">
                <span className="showcase-card-eyebrow">补充说明</span>
                <strong>{impactNotes[item.title].lead}</strong>
                <ul className="impact-summary-list">
                  {impactNotes[item.title].points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            </ShowcaseSection>
          ))}
        </div>
      </div>
    </main>
  );
}
