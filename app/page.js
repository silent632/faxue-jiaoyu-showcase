import Link from "next/link";
import ShowcaseHomeHero from "@/components/showcase-home-hero";
import ShowcaseOperationsBand from "@/components/showcase-operations-band";
import ShowcaseTrendPanel from "@/components/showcase-trend-panel";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const featuredCases = cases.slice(0, 3);
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const trendPanels = content.impactDashboard?.trendPanels ?? [];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <ShowcaseHomeHero
          content={content}
          dashboardHero={content.homeDashboard.hero}
          trendSnapshot={content.homeDashboard.trendSnapshot}
        />

        <ShowcaseOperationsBand kpis={content.homeDashboard.kpis} className="homepage-operations-kpis" />

        <ShowcaseTrendPanel
          trendSnapshot={content.homeDashboard.trendSnapshot}
          panels={trendPanels}
          className="homepage-trend-summary"
        />

        <section className="homepage-coverage-band showcase-card" aria-label="平台应用覆盖">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">应用覆盖</span>
            <h2>教学建设与推广应用均已形成覆盖成果</h2>
            <p>平台运行指标与课程资源协同推进，建设结果可直接用于展示、复用与外延推广。</p>
          </div>

          <div className="homepage-coverage-grid">
            {coverageCards.map((item) => (
              <article key={item.title} className="homepage-coverage-card">
                <span>{item.title}</span>
                <strong>{item.coverageValue}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="homepage-platform-entry-grid showcase-card" aria-label="平台入口总览">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">平台入口</span>
            <h2>核心入口仍然保留在首页后段，便于直接进入真实平台</h2>
            <p>在完成运营总览后，可继续进入案例检索、案例详情与研习工作台。</p>
          </div>

          <div className="homepage-platform-entry-list">
            {content.homeEntries.map((item) => (
              <Link key={item.href} href={item.href} className="homepage-platform-entry-card">
                <span className="showcase-card-eyebrow">{item.label}</span>
                <strong>{item.description}</strong>
              </Link>
            ))}
          </div>

          <div className="homepage-platform-live-list">
            {featuredCases.map((item) => (
              <Link key={item.id} href={`/cases/${item.id}`} className="homepage-platform-case-card">
                <span>{item.caseNumber || item.causeFocus || "典型案例"}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>

          <Link href={studyHref} className="showcase-home-panel-link">
            进入研习工作台
          </Link>
        </section>
      </div>
    </main>
  );
}
