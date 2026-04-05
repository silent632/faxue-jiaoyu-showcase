import TopNav from "@/components/top-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { listPublicShowcaseCases } from "@/lib/public-showcase-cases.js";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function CasesPage() {
  const user = getPublicShowcaseUser();
  const navItems = buildShowcaseContent().nav;
  const allCases = await listPublicShowcaseCases();

  return (
    <main className="showcase-page cases-page-shell">
      <TopNav user={user} items={navItems} />
      <section className="page-wrap cases-route-intro">
        <div className="glass-sm cases-route-intro-card">
          <p className="section-eyebrow">平台案例检索入口</p>
          <h1>先检索，再导读，再进入研习</h1>
          <p>围绕真实裁判文书完成案例筛选与导读判断，按教学路径进入后续研习页面。</p>
        </div>
      </section>
      <CasesWorkspace cases={allCases} initialFilters={{}} initialSort="date-desc" initialPage={1} />
    </main>
  );
}
