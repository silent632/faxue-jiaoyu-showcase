export default function ShowcaseHomeHero({ content }) {
  const metrics = Object.values(content.metrics);

  return (
    <section className="showcase-hero">
      <div className="showcase-hero-copy">
        <p className="showcase-hero-kicker">Public Showcase</p>
        <h1>{content.site.title}</h1>
        <p className="showcase-hero-subtitle">{content.site.subtitle}</p>
        <p className="showcase-hero-intro">{content.site.intro}</p>
      </div>

      <div className="showcase-metrics" aria-label="平台概览指标">
        {metrics.map((metric) => (
          <article key={metric.label} className="showcase-metric-card">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
