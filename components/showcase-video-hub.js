import ShowcaseVideoLink from "@/components/showcase-video-link";
import ShowcaseSection from "@/components/showcase-section";

export default function ShowcaseVideoHub({ hub }) {
  const phaseGuide = Array.isArray(hub?.phaseGuide) ? hub.phaseGuide : [];
  const periods = Array.isArray(hub?.periods) ? hub.periods : [];

  if (phaseGuide.length === 0 && periods.length === 0) {
    return null;
  }

  return (
    <ShowcaseSection
      title={hub?.title || "课程视频"}
      eyebrow="课程视频"
      description={hub?.hero || "八期课程视频成果在此连续展示。"}
      className="showcase-section-compact showcase-video-hub"
      aria-label="课程视频成果"
    >
      <div className="showcase-video-phase-grid">
        {phaseGuide.map((item) => (
          <article key={item.slug} className="showcase-card showcase-video-phase-card">
            <span className="showcase-card-eyebrow">阶段说明</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <div className="showcase-video-period-grid">
        {periods.map((item, index) => (
          <ShowcaseVideoLink
            key={item.slug}
            className="showcase-video-period-card"
            href={item.href}
            external={item.external}
          >
            <span className="showcase-video-thumb" aria-hidden="true">
              <span className="showcase-video-thumb-num">{String(index + 1).padStart(2, "0")}</span>
              <span className="showcase-video-thumb-play" />
              <span className="showcase-video-thumb-label">{item.period}</span>
            </span>
            <span className="showcase-video-card-body">
              <strong>{item.theme || item.title}</strong>
              <p>{item.summary}</p>
            </span>
          </ShowcaseVideoLink>
        ))}
      </div>
    </ShowcaseSection>
  );
}
