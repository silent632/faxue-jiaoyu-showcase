import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ImpactPage() {
  const content = buildShowcaseContent();

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
                  <article key={point} className="showcase-card">
                    <strong>{point}</strong>
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
