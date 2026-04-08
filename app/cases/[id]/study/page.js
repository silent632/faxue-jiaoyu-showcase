import Link from "next/link";
import { notFound } from "next/navigation";

import StudyGuideShell from "@/components/study-guide-shell";
import StudySplitShell from "@/components/study-split-shell";
import TopNav from "@/components/top-nav";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getPublicShowcaseCaseById } from "@/lib/public-showcase-cases.js";
import { getPublicStudyHeadNote } from "@/lib/public-showcase-study.js";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCaseStaticParams } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

function joinMetaParts(parts = [], fallback = "案例信息以原文为准") {
  const values = parts.map((item) => String(item || "").trim()).filter(Boolean);
  return values.length ? values.join(" · ") : fallback;
}

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams();
}

export default async function StudyPage({ params }) {
  const { id } = await params;
  const user = getPublicShowcaseUser();
  const navItems = buildShowcaseContent().nav;
  const caseItem = await getPublicShowcaseCaseById(id);

  if (!caseItem) notFound();
  const pdfFileName = normalizePublicFileName(caseItem.pdfFile);
  const hasPdf = await publicFileExists("pdfs", pdfFileName);
  const studyMetaLine = joinMetaParts([caseItem.caseNumber, caseItem.courtName, caseItem.judgmentDate]);
  const shell = hasPdf ? (
    <StudySplitShell caseItem={caseItem} userSid={user.sid} pdfFileName={pdfFileName} hasPdf={hasPdf} />
  ) : (
    <StudyGuideShell caseItem={caseItem} userSid={user.sid} />
  );

  return (
    <main className="study-page-main">
      <TopNav user={user} items={navItems} />

      <div className="study-head">
        <div className="study-head-main">
          <div className="study-head-top">
            <Link className="btn btn-ghost" href={`/cases/${id}`}>
              ← 返回详情
            </Link>
            <span className="tag">研习工作台</span>
            <span className="study-head-case-number">{studyMetaLine}</span>
          </div>

          <div className="study-head-copy">
            <h1 className="study-head-title">{caseItem.title}</h1>
            <p className="study-head-note">{getPublicStudyHeadNote({ hasPdf })}</p>
          </div>
        </div>

        <div className="study-head-side">
          {caseItem.courtName ? <span className="study-head-meta">{caseItem.courtName}</span> : null}
          {caseItem.judgmentDate ? <span className="study-head-meta">{caseItem.judgmentDate}</span> : null}
        </div>
      </div>

      {shell}
    </main>
  );
}
