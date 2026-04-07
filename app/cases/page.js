import TopNav from "@/components/top-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { listPublicShowcaseCases } from "@/lib/public-showcase-cases.js";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function CasesPage() {
  const user = getPublicShowcaseUser();
  const navItems = buildShowcaseContent().nav;
  const allCases = await listPublicShowcaseCases();
  const briefingCards = [
    `当前案例库共 ${allCases.length} 条，可直接按案由、年份、法院层级和法条缩小范围。`,
    "检索结果可顺着“案例详情 -> 导读判断 -> 研习工作台 -> PDF 原文”继续抽查。",
    "本页不再承担宣传说明，重点回到可用的检索、筛选和案例进入效率。",
  ];

  return (
    <main className="showcase-page cases-page-shell">
      <TopNav user={user} items={navItems} />
      <section className="page-wrap cases-route-briefing">
        <div className="glass-sm cases-route-intro-card">
          <p className="section-eyebrow">检索简报</p>
          <h1>案例检索台</h1>
          <p>这一页只做一件事：让专家和评审能快速定位案件、抽查详情，并顺着原文链路验证平台是否真的可用。</p>
        </div>

        <div className="cases-route-review-grid">
          {briefingCards.map((item, index) => (
            <article key={item} className="cases-route-review-card">
              <span>{`0${index + 1}`}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>
      <CasesWorkspace cases={allCases} initialFilters={{}} initialSort="date-desc" initialPage={1} />
    </main>
  );
}
