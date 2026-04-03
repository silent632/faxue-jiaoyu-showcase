import Link from "next/link";
import ShowcaseHomeHero from "@/components/showcase-home-hero";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const featuredCases = cases.slice(0, 4);
  const previewCases = featuredCases.slice(0, 3);
  const featuredDetailHref = featuredCases[0] ? `/cases/${featuredCases[0].id}` : "/cases";

  return (
    <main className="showcase-page">
      <TopNav user={user} />

      <div className="showcase-page-body">
        <ShowcaseHomeHero content={content} featuredCases={featuredCases} canonicalStudyHref={studyHref} />

        <section className="homepage-path-band showcase-card" aria-label="平台学习链路">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">平台链路</span>
            <h2>从检索、导读到研习，围绕同一份文书完成连续学习</h2>
            <p>首页保留真实平台的浏览顺序，让访客能够快速理解裁判文书研习的进入方式与使用路径。</p>
          </div>

          <div className="homepage-path-grid">
            {content.homeFlow.map((item) => (
              <article key={item.id} className="homepage-path-card">
                <span className="homepage-path-index">{item.id}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="homepage-path-links">
            <Link href="/cases" className="homepage-path-link">
              <span className="showcase-card-eyebrow">案例检索</span>
              <strong>先缩小阅读范围</strong>
              <p>围绕案由、年份、法院层级与法条建立检索边界。</p>
            </Link>
            <Link href={featuredDetailHref} className="homepage-path-link">
              <span className="showcase-card-eyebrow">案例导读</span>
              <strong>再判断是否进入精读</strong>
              <p>结合摘要、案号与裁判结论确定后续阅读重点。</p>
            </Link>
            <Link href={studyHref} className="homepage-path-link">
              <span className="showcase-card-eyebrow">研习实践</span>
              <strong>最后进入结构化研习</strong>
              <p>围绕同一份文书完成事实梳理、争议焦点与法理分析。</p>
            </Link>
          </div>
        </section>

        <section className="homepage-case-preview showcase-card" aria-label="真实案例预览">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">真实案例</span>
            <h2>从典型案例直接进入阅读与研习</h2>
            <p>案例预览保留真实案例标题与案号信息，用于建立平台内容真实存在的第一印象。</p>
          </div>

          <div className="homepage-case-preview-list">
            {previewCases.map((item) => (
              <Link key={item.id} href={`/cases/${item.id}`} className="homepage-case-card">
                <span>{item.caseNumber || item.causeFocus || "典型案例"}</span>
                <strong>{item.title}</strong>
                <p>{item.summary || item.resultText || "进入案例详情页查看导读、基本信息与原文入口。"}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="homepage-overview-grid" aria-label="课程与资源概览">
          {content.homeOverview.map((item) => (
            <Link key={item.href} href={item.href} className="homepage-overview-card showcase-card">
              <span className="showcase-card-eyebrow">{item.title}</span>
              <strong>{item.description}</strong>
              <p>
                {item.href === "/courses"
                  ? `${content.courses.timeline.slice(0, 3).map((entry) => entry.title).join("、")}等主题依次展开，形成连续课程脉络。`
                  : `${content.resources.groups
                      .flatMap((group) => group.items)
                      .slice(0, 3)
                      .join("、")}等材料共同构成课程实施与研习支持的资源基础。`}
              </p>
            </Link>
          ))}
        </section>

        <section className="homepage-video-block showcase-card" aria-label="课程视频展示">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">课程视频</span>
            <h2>{content.homeVideoBlock.title}</h2>
            <p>{content.homeVideoBlock.description}</p>
          </div>

          <div className="homepage-video-featured">
            <div className="homepage-video-cover homepage-video-cover-featured">
              <span className="homepage-video-cover-label">{content.homeVideoBlock.featured.label}</span>
              <strong>{content.homeVideoBlock.featured.title}</strong>
              <p>{content.homeVideoBlock.featured.summary}</p>
            </div>

            <article className="homepage-video-featured-card">
              <span className="showcase-card-eyebrow">重点观看</span>
              <strong>{content.homeVideoBlock.featured.title}</strong>
              <p>{content.homeVideoBlock.featured.summary}</p>
              <p className="homepage-video-purpose">{content.homeVideoBlock.featured.purpose}</p>
              <a href={content.homeVideoBlock.featured.href} target="_blank" rel="noreferrer" className="homepage-video-link">
                点击观看
              </a>
            </article>
          </div>

          <div className="homepage-video-grid">
            {content.homeVideoBlock.supporting.map((item) => (
              <article key={item.slug} className="homepage-video-card">
                <div className="homepage-video-cover">
                  <span className="homepage-video-cover-label">{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                <div className="homepage-video-card-copy">
                  <span className="showcase-card-eyebrow">课程视频</span>
                  <strong>{item.title}</strong>
                  <p>{item.purpose}</p>
                  <a href={item.href} target="_blank" rel="noreferrer" className="homepage-video-link">
                    点击观看
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="homepage-impact-closing showcase-card" aria-label="建设成效收束">
          <div className="homepage-impact-copy">
            <span className="showcase-section-eyebrow">建设成效</span>
            <h2>{content.homeImpactClosing.title}</h2>
            <p>{content.homeImpactClosing.description}</p>
          </div>

          <div className="homepage-impact-points">
            {content.platformHighlights.map((item) => (
              <article key={item.title} className="homepage-impact-point">
                <span className="showcase-card-eyebrow">{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <Link href={content.homeImpactClosing.href} className="showcase-home-panel-link">
            查看成效展示
          </Link>
        </section>
      </div>
    </main>
  );
}
