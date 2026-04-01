import ShowcaseNav from "@/components/showcase-nav";
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

        <section className="impact-grid" aria-label="项目成效维度">
          {content.impact.sections.map((item) => (
            <article key={item.title} className="showcase-card">
              <strong>{item.title}</strong>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
