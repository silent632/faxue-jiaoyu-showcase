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

        <div className="stack-grid">
          {content.resources.groups.map((group) => (
            <section key={group.title} className="showcase-section showcase-section-compact" aria-label={group.title}>
              <div className="showcase-section-heading">
                <h2>{group.title}</h2>
                <p className="showcase-section-description">{group.intro}</p>
              </div>

              <div className="resource-grid">
                {group.items.map((item) => (
                  <article key={item} className="showcase-card">
                    <strong>{item}</strong>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
