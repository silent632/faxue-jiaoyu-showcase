import Link from "next/link";
import { notFound } from "next/navigation";

import StudySplitShell from "@/components/study-split-shell";
import TopNav from "@/components/top-nav";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getPublicShowcaseCaseById } from "@/lib/public-showcase-cases.js";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCaseStaticParams } from "@/lib/showcase-cases";

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams(24);
}

export default async function StudyPage({ params }) {
  const { id } = await params;
  const user = getPublicShowcaseUser();
  const caseItem = await getPublicShowcaseCaseById(id);

  if (!caseItem) notFound();
  const pdfFileName = normalizePublicFileName(caseItem.pdfFile);
  const hasPdf = await publicFileExists("pdfs", pdfFileName);

  return (
    <main className="study-page-main">
      <TopNav user={user} />

      <div className="study-head">
        <div className="study-head-main">
          <div className="study-head-top">
            <Link className="btn btn-ghost" href={`/cases/${id}`}>
              ← 返回详情
            </Link>
            <span className="tag">研习模式</span>
            <span className="study-head-case-number">{caseItem.caseNumber || "案号待补充"}</span>
          </div>

          <div className="study-head-copy">
            <h1 className="study-head-title">{caseItem.title}</h1>
            <p className="study-head-note">
              这是公开展示模式下的真实研习工作台。页面保留阅读区、三步输出区和参考要点结构；草稿仅保存在当前浏览器，不执行真实提交。
            </p>
          </div>
        </div>

        <div className="study-head-side">
          <span className="study-head-meta">{caseItem.courtName || "法院待补充"}</span>
          <span className="study-head-meta">{caseItem.judgmentDate || "日期待补充"}</span>
        </div>
      </div>

      <StudySplitShell caseItem={caseItem} userSid={user.sid} pdfFileName={pdfFileName} hasPdf={hasPdf} />
    </main>
  );
}
