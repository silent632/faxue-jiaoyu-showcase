import ShowcaseNav from "@/components/showcase-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { loadShowcaseCases } from "@/lib/showcase-cases.js";

export default async function CasesPage() {
  const allCases = await loadShowcaseCases();

  return (
    <main className="showcase-page cases-page-shell">
      <ShowcaseNav />
      <CasesWorkspace cases={allCases} initialFilters={{}} initialSort="date-desc" initialPage={1} />
    </main>
  );
}
