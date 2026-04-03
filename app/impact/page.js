import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();
  const sectionMeta = {
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
          <h1>项目成效呈现</h1>
          <p>页面从教学建设、学生发展、平台运行与推广示范四个维度归纳项目推进成果，集中展示平台建设完成度与教学改革的实际支撑效果。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">成效概览</span>
          <strong>项目成效不仅体现在课程数量，更体现在组织机制、学生能力与平台沉淀的同步提升。</strong>
          <ul className="supporting-list">
            <li>课程与双师协同机制逐步稳定，教学实施具有连续性与可复用性。</li>
            <li>学生能够在真实案例中完成更完整的检索、辨析与表达训练。</li>
            <li>平台为资源集中展示、过程留存与对外交流提供了统一载体。</li>
          </ul>
        </article>

        <div className="stack-grid">
          {content.impact.sections.map((item) => (
            <ShowcaseSection
              key={item.title}
              title={sectionMeta[item.title].title}
              eyebrow={sectionMeta[item.title].eyebrow}
              description={sectionMeta[item.title].description}
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
