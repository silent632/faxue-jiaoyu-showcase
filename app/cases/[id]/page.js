import { notFound } from "next/navigation";
import evidence from "@/content/case-evidence.json";
import CaseReadingDetail from "@/components/case-reading-detail";
import ShowcaseNav from "@/components/showcase-nav";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getCaseReadingSource } from "@/lib/content/case-reading-source.js";
import { getShowcaseCaseById, getShowcaseCaseStaticParams } from "@/lib/showcase-cases";
import { getPublicJurisprudenceLearning } from "@/lib/content/jurisprudence-learning.js";

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams();
}

export default async function CaseDetailPage({ params }) {
  const { id } = await params;
  const caseItem = await getShowcaseCaseById(id);
  if (!caseItem) notFound();

  const { caseLinks, topics } = getPublicJurisprudenceLearning();
  const learningLinks = caseLinks.filter(link => link.caseId === id)
    .map(link => ({ ...link, topic: topics.find(topic => topic.id === link.topicId) }))
    .filter(link => link.topic);
  const file = normalizePublicFileName(caseItem.pdfFile);
  const source = getCaseReadingSource(id, file);
  const hasPdf = await publicFileExists("pdfs", file);
  const dateEvidence = evidence.cases[id]?.judgmentDate;
  return (
    <main className="showcase-page case-detail-page">
      <ShowcaseNav />
      <CaseReadingDetail caseItem={caseItem} source={source} hasPdf={hasPdf} learningLinks={learningLinks}
        sourceNote={dateEvidence?.status === "conflict" ? dateEvidence.note : ""} />
    </main>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getShowcaseCaseById(id);
  return item ? {
    title: `${item.title} · 裁判文书研习`,
    description: `${item.caseNumber}，${item.courtName}。阅读原文并记录你的分析。`,
    alternates: { canonical: `/cases/${id}/` },
  } : {};
}
