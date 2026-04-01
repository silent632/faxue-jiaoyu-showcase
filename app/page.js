import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";
import Link from "next/link";

export default function HomePage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-hero">
          <div className="showcase-hero-copy">
            <p className="showcase-hero-kicker">教学成果展示</p>
            <h1>{content.site.title}</h1>
            <p className="showcase-hero-subtitle">{content.site.subtitle}</p>
            <p className="showcase-hero-intro">{content.site.intro}</p>
          </div>

          <div className="showcase-metrics" aria-label="平台概览指标">
            {Object.values(content.metrics).map((metric) => (
              <article key={metric.label} className="showcase-metric-card">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
        </section>

        <ShowcaseSection
          title="平台关注的真实问题"
          eyebrow="教学痛点"
          description="聚焦课堂、课后与实践环节中最常见的三类断点，把法理学教学改革的目标落到可感知的学习体验上。"
        >
          <div className="showcase-problems">
            {content.problems.map((item, index) => (
              <article key={item} className="showcase-problem-card">
                <span className="showcase-problem-index">{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="快速进入核心场景"
          eyebrow="功能入口"
          description="从首页即可进入案例检索库与研习工作台，按教学场景快速切换。"
        >
          <div className="showcase-entry-grid">
            {content.homeEntries.map((item) => (
              <Link key={item.href} href={item.href} className="showcase-entry-card">
                <span>{item.label}</span>
                <strong>{item.description}</strong>
              </Link>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
