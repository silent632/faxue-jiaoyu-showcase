import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function CoursesPage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>课程体系</h1>
          <p>围绕裁判文书研习形成八期双师课程的递进式教学结构。</p>
        </section>

        <section className="timeline-grid" aria-label="课程体系时间线">
          {content.courses.timeline.map((item) => (
            <article key={item.period} className="showcase-card">
              <span className="showcase-card-eyebrow">{item.period}</span>
              <strong>{item.title}</strong>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
