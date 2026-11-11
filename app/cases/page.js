import { normalizeCaseRows } from "@/lib/cases-workspace.js";
import ShowcaseNav from "@/components/showcase-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { loadShowcaseCases } from "@/lib/showcase-cases.js";
import { getPublicJurisprudenceLearning } from "@/lib/content/jurisprudence-learning.js";

export default async function CasesPage() {
  const allCases = await loadShowcaseCases();
  const learning = getPublicJurisprudenceLearning();
  const casesWithTopics = allCases.map(item => ({ ...item, learningTopics: learning.caseLinks.filter(link => link.caseId === item.id).map(link => link.topicId) }));

  return (
    <main className="showcase-page cases-page-shell">
      <ShowcaseNav />
      <CasesWorkspace cases={normalizeCaseRows(casesWithTopics)} learning={learning} initialFilters={{}} initialSort="date-desc" initialPage={1} />
    </main>
  );
}
