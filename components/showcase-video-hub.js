import ShowcaseVideoLink from "@/components/showcase-video-link";
import ShowcaseSection from "@/components/showcase-section";

export default function ShowcaseVideoHub({ hub }) {
  const featured = hub?.featured;
  const playlist = Array.isArray(hub?.playlist) ? hub.playlist : [];

  if (!featured && playlist.length === 0) {
    return null;
  }

  return (
    <ShowcaseSection
      title={hub?.title || "课程视频"}
      eyebrow="课程视频"
      description={hub?.hero || "围绕双师课堂组织可回看的示范性教学视频。"}
      className="showcase-section-compact showcase-video-hub"
      aria-label="示范性教学视频"
    >
      <div className="showcase-video-hub-layout">
        {featured ? (
          <ShowcaseVideoLink className="showcase-video-featured" href={featured.href} external={featured.external}>
            <span className="showcase-card-eyebrow">示范性教学视频</span>
            <strong>{featured.title}</strong>
            <p>呈现双师课堂组织、案例进入方式与教学应用路径。</p>
          </ShowcaseVideoLink>
        ) : null}

        <div className="showcase-video-playlist">
          {playlist.map((item) => (
            <ShowcaseVideoLink
              key={item.slug}
              className="showcase-video-item"
              href={item.href}
              external={item.external}
            >
              <span>课程视频</span>
              <strong>{item.title}</strong>
            </ShowcaseVideoLink>
          ))}
        </div>
      </div>
    </ShowcaseSection>
  );
}
