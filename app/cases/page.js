import TopNav from "@/components/top-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { listPublicShowcaseCases } from "@/lib/public-showcase-cases.js";

export default async function CasesPage() {
  const user = getPublicShowcaseUser();
  const allCases = await listPublicShowcaseCases();

  return (
    <main className="showcase-page cases-page-shell">
      <TopNav user={user} />
      <CasesWorkspace cases={allCases} initialFilters={{}} initialSort="date-desc" initialPage={1} />
    </main>
  );
}
