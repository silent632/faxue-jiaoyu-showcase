import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
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
                  <article key={item} className="showcase-card">
                    <strong>{item}</strong>
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
