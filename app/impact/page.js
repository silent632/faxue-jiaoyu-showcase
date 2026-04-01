import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const impactNotes = {
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
      points: ["共享表单和流程便于跨班复用", "案例研习样板适合院系交流传播", "成果内容适合公开展示与材料引用"],
    },
  };

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">成效展示</p>
          <h1>成效展示</h1>
          <p>从教学建设、学生发展、平台运行与推广示范四个维度，集中呈现项目推进以来形成的主要成效。</p>
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
                    <span className="showcase-card-eyebrow">{item.title}</span>
                    <strong>{point}</strong>
                  </article>
                ))}
              </div>
              <article className="showcase-card impact-summary">
                <span className="showcase-card-eyebrow">成效概览</span>
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
