import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { buildImpactSectionMeta, buildImpactSummary } from "@/lib/showcase-supporting-page-meta";

export default function ImpactPage() {
  const content = buildShowcaseContent();

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
          {content.impact.sections.map((item) => {
            const sectionMeta = buildImpactSectionMeta(item);
            const impactSummary = buildImpactSummary(item);

            return (
              <ShowcaseSection
                key={item.title}
                title={sectionMeta.title}
                eyebrow={sectionMeta.eyebrow}
                description={sectionMeta.description}
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
                  <strong>{impactSummary.lead}</strong>
                  <ul className="impact-summary-list">
                    {impactSummary.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              </ShowcaseSection>
            );
          })}
        </div>
      </div>
    </main>
  );
}
