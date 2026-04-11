import Link from "next/link";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const quickKpis = (content.homeDashboard?.kpis ?? []).slice(0, 4);
  const featuredCases = cases.slice(0, 3);
  const homeVideoBlock = content.homeVideoBlock;
  const resultTracks = content.homeResultTracks ?? [];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <section className="homepage-review-console" aria-label="首页总览">
          <div className="homepage-console-main showcase-card">
            <div className="homepage-console-status">
              <p className="showcase-hero-kicker">平台首页</p>
              <h1>{content.homeDashboard.hero.title}</h1>
              <p className="showcase-hero-subtitle">{content.homeDashboard.hero.summary}</p>
              <p className="showcase-hero-brief">案例检索、课程视频、课程体系和成效展示都从这里进入。</p>
            </div>

            <div className="homepage-console-kpis" aria-label="首页关键结果">
              {quickKpis.map((item) => (
                <article key={item.label} className="homepage-console-kpi">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <aside className="homepage-validation-rail showcase-card">
            <div className="homepage-validation-head">
              <span className="showcase-section-eyebrow">快速入口</span>
              <h2>直接进入核心页面</h2>
              <p>案例检索、研习工作台和成效展示都在同一层级。</p>
            </div>

            <div className="homepage-validation-links">
              <Link href="/cases" className="homepage-validation-link">
                <span>案例检索</span>
                <strong>打开案例检索工作台</strong>
              </Link>
              <Link href={studyHref} className="homepage-validation-link">
                <span>研习工作台</span>
                <strong>查看结构化研习页面</strong>
              </Link>
              <Link href="/impact" className="homepage-validation-link">
                <span>成效展示</span>
                <strong>查看项目成果</strong>
              </Link>
            </div>
          </aside>
        </section>

        <section className="homepage-results-grid" aria-label="成果总览">
          {resultTracks.map((item) => (
            <article key={item.title} className="homepage-result-card showcase-card">
              <span className="showcase-card-eyebrow">{item.title}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
              <Link href={item.href} className="homepage-video-link">
                {item.actionLabel}
              </Link>
            </article>
          ))}
        </section>

        <section className="homepage-video-block showcase-card" aria-label="课程视频展示">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">课程视频</span>
            <h2>{homeVideoBlock.title}</h2>
            <p>{homeVideoBlock.description}</p>
          </div>

          <div className="homepage-video-stage-grid">
            {homeVideoBlock.phaseGuide.map((item) => (
              <article key={item.slug} className="homepage-video-stage-card">
                <span className="showcase-card-eyebrow">阶段</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="homepage-video-period-grid">
            {homeVideoBlock.periods.map((item) => (
              <article key={item.slug} className="homepage-video-period-card">
                <span className="showcase-card-eyebrow">{item.period}</span>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <small>{item.stageTag}</small>
                <Link href={item.href} className="homepage-video-link">
                  进入本期
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="homepage-audit-entry-grid showcase-card" aria-label="核心入口">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">更多入口</span>
            <h2>继续进入案例与研习</h2>
            <p>从首页可继续进入案例检索、代表样本和研习工作台。</p>
          </div>

          <div className="homepage-audit-entry-shell">
            <div className="homepage-audit-entry-list">
              {content.homeEntries.map((item) => (
                <Link key={item.href} href={item.href} className="homepage-audit-entry-card">
                  <span className="showcase-card-eyebrow">{item.label}</span>
                  <strong>{item.description}</strong>
                </Link>
              ))}
            </div>

            <div className="homepage-audit-case-list">
              {featuredCases.map((item) => (
                <Link key={item.id} href={`/cases/${item.id}`} className="homepage-audit-case-card">
                  <span>{item.caseNumber || item.causeFocus || "典型案例"}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}

              <Link href={studyHref} className="homepage-audit-case-card is-action">
                <span>直接进入</span>
                <strong>直接进入研习工作台</strong>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
