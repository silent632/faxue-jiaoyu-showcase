import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import StudyGuideShell from "@/components/study-guide-shell";
import StudySplitShell from "@/components/study-split-shell";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getExperimentModules } from "@/lib/experiments.js";
import { recommendModulesForCase } from "@/lib/learning-loop.js";
import { buildShowcaseContent } from "@/lib/showcase-content.js";
import { getShowcaseCaseById, getShowcaseCaseStaticParams } from "@/lib/showcase-cases";

function joinMetaParts(parts = [], fallback = "案例信息以原文为准") {
  const values = parts.map((item) => String(item || "").trim()).filter(Boolean);
  return values.length ? values.join(" · ") : fallback;
}

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams();
}

export default async function StudyPage({ params }) {
  const { id } = await params;
  const caseItem = await getShowcaseCaseById(id);

  if (!caseItem) notFound();
  const pdfFileName = normalizePublicFileName(caseItem.pdfFile);
  const hasPdf = await publicFileExists("pdfs", pdfFileName);
  const studyMetaLine = joinMetaParts([caseItem.caseNumber, caseItem.courtName, caseItem.judgmentDate]);
  const userSid = "public-showcase";
  const recommendedModules = recommendModulesForCase(caseItem.jurisprudenceTags, getExperimentModules());
  const loopCopy = buildShowcaseContent().learningLoop;
  const shell = hasPdf ? (
    <StudySplitShell
      caseItem={caseItem}
      userSid={userSid}
      pdfFileName={pdfFileName}
      hasPdf={hasPdf}
      recommendedModules={recommendedModules}
      loopCopy={loopCopy}
    />
  ) : (
    <StudyGuideShell
      caseItem={caseItem}
      userSid={userSid}
      recommendedModules={recommendedModules}
      loopCopy={loopCopy}
    />
  );

  return (
    <main className="study-page-main">
      <ShowcaseNav />

      <div className="exp-ws3-topbar study-topbar">
        <div className="exp-ws3-topbar-left">
          <Link className="exp-ws3-back" href={`/cases/${id}`}>← 返回详情</Link>
          <span className="exp-ws3-module-badge">研习工作台</span>
          <div className="exp-ws3-case">
            <strong>{caseItem.title}</strong>
            <span>{studyMetaLine}</span>
          </div>
        </div>
      </div>

      {shell}
    </main>
  );
}
