import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function ResourcesPage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">教学资源</p>
          <h1>教学资源</h1>
          <p>以标准化材料体系支撑课程运行、案例研习与成果推广。</p>
        </section>

        <section className="resource-grid" aria-label="教学资源分类">
          {content.resources.categories.map((item) => (
            <article key={item} className="showcase-card">
              <strong>{item}</strong>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
