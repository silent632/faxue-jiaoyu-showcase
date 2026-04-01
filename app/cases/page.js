import CaseLibraryShell from "@/components/case-library-shell";
import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { loadShowcaseCases } from "@/lib/showcase-cases";

export default async function CasesPage() {
  const [content, rows] = await Promise.all([buildShowcaseContent(), loadShowcaseCases()]);

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">案例检索库</p>
          <h1>案例检索库</h1>
          <p>基于真实裁判文书整理形成的教学化案例库，支持公开检索、预览与研习跳转。</p>
        </section>

        <ShowcaseSection
          title="公开案例入口"
          description="以下案例直接来自原始源数据，保留了案号、法院、裁判日期和研习导读信息。"
          className="showcase-section-compact"
        >
          <CaseLibraryShell rows={rows} />
        </ShowcaseSection>
      </div>
    </main>
  );
}
