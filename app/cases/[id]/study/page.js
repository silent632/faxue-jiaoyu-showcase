import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import StudyDemoShell from "@/components/study-demo-shell";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getShowcaseCaseStaticParams, getShowcaseCaseStudyById } from "@/lib/showcase-cases";
import styles from "./study-demo.module.css";

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams(24);
}

export default async function StudyPage({ params }) {
  const { id } = await params;
  const caseItem = await getShowcaseCaseStudyById(id);

  if (!caseItem) notFound();

  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className={styles.head}>
          <p className="showcase-page-kicker">研习工作台</p>
          <h1 className={styles.headTitle}>{caseItem.title}</h1>
          <p className={styles.headDesc}>以真实案例为入口，展示摘要、事实、争议与法理分析的结构化研习路径。</p>
        </section>

        <ShowcaseSection
          title="研习示范"
          description="从真实案例出发，先阅读导读，再看结构化步骤，最后回到详情页继续展开。"
          className="showcase-section-compact"
        >
          <StudyDemoShell caseItem={caseItem} />
        </ShowcaseSection>
      </div>
    </main>
  );
}
