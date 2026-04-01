import Link from "next/link";
import ShowcaseHomeHero from "@/components/showcase-home-hero";
import ShowcaseSection from "@/components/showcase-section";
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
  const featuredDetailHref = featuredCases[0] ? `/cases/${featuredCases[0].id}` : "/cases";

  return (
    <main className="showcase-page">
      <TopNav user={user} />

      <div className="showcase-page-body">
        <ShowcaseHomeHero content={content} featuredCases={featuredCases} canonicalStudyHref={studyHref} />

        <ShowcaseSection
          title="真实平台链路"
          eyebrow="使用路径"
          description="这不是抽象展示，而是把原站中的真实案例检索、案例详情与研习工作台公开化呈现，便于评审直接理解平台的教学闭环。"
        >
          <div className="showcase-flow-grid">
            {content.homeFlow.map((item) => (
              <article key={item.id} className="showcase-flow-card">
                <span className="showcase-flow-index">{item.id}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="showcase-chain-links">
            <Link href="/cases" className="showcase-chain-card">
              <span className="showcase-card-eyebrow">入口一</span>
              <strong>进入案例检索库</strong>
              <p>查看真实筛选、排序、分页与结果列表结构。</p>
            </Link>
            <Link href={featuredDetailHref} className="showcase-chain-card">
              <span className="showcase-card-eyebrow">入口二</span>
              <strong>查看案例详情页</strong>
              <p>沿着导读、元数据、法条与原文入口完成阅读判断。</p>
            </Link>
            <Link href={studyHref} className="showcase-chain-card">
              <span className="showcase-card-eyebrow">入口三</span>
              <strong>进入研习工作台</strong>
              <p>直接查看 split-shell 阅读区与三步输出区的真实布局。</p>
            </Link>
          </div>
        </ShowcaseSection>

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
          title="平台建设亮点"
          eyebrow="建设重点"
          description="首页不仅介绍成果，还主动承接真实工作区、课程资源与申报表达之间的关系。"
        >
          <div className="showcase-highlight-grid">
            {content.platformHighlights.map((item) => (
              <article key={item.title} className="showcase-highlight-card">
                <span className="showcase-card-eyebrow">{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="课程与资源总览"
          eyebrow="体系支撑"
          description="首页先做概览，进入内页再查看八期课程、标准化资源和建设成效的完整展开。"
        >
          <div className="showcase-summary-grid">
            <article className="showcase-summary-card">
              <span className="showcase-card-eyebrow">课程体系</span>
              <strong>八期递进式双师课程</strong>
              <p>{content.courses.timeline.slice(0, 4).map((item) => item.title).join("、")}等主题持续推进。</p>
              <Link href="/courses" className="showcase-inline-link">
                查看课程体系
              </Link>
            </article>

            <article className="showcase-summary-card">
              <span className="showcase-card-eyebrow">教学资源</span>
              <strong>标准化资源包与支撑材料</strong>
              <p>
                {content.resources.groups
                  .flatMap((group) => group.items)
                  .slice(0, 4)
                  .join("、")}
                等材料形成可复制的课程支持体系。
              </p>
              <Link href="/resources" className="showcase-inline-link">
                查看教学资源
              </Link>
            </article>

            <article className="showcase-summary-card">
              <span className="showcase-card-eyebrow">建设成效</span>
              <strong>平台、课程与推广三线并进</strong>
              <p>从教学建设、学生发展、平台运行到推广示范，形成可直接入申报材料的成效表达。</p>
              <Link href="/impact" className="showcase-inline-link">
                查看成效展示
              </Link>
            </article>
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
