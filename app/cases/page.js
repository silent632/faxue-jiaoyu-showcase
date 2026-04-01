import TopNav from "@/components/top-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { listPublicShowcaseCases } from "@/lib/public-showcase-cases.js";

function firstParam(v) {
  if (Array.isArray(v)) return v[0] || "";
  return v || "";
}

function asParamList(v) {
  if (Array.isArray(v)) {
    return v
      .flatMap((item) => String(item || "").split(","))
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (!v) return [];
  return String(v)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default async function CasesPage({ searchParams }) {
  const user = getPublicShowcaseUser();
  const allCases = await listPublicShowcaseCases();
  const params = await searchParams;
  const sortParam = String(firstParam(params?.sort) || "").trim();
  const pageParam = Number(firstParam(params?.page) || "1");
  const initialFilters = {
    keyword: firstParam(params?.q),
    causeL1: firstParam(params?.causeL1),
    causeL2: firstParam(params?.causeL2),
    causeL3: firstParam(params?.causeL3),
    courtLevel: asParamList(params?.courtLevel),
    year: firstParam(params?.year),
    docType: asParamList(params?.docType),
    procedure: asParamList(params?.procedure),
    province: asParamList(params?.province),
    result: asParamList(params?.result),
    lawName: asParamList(params?.lawName),
    lawArticle: asParamList(params?.lawArticle),
  };
  const initialSort = ["date-desc", "date-asc", "relevance"].includes(sortParam) ? sortParam : "date-desc";
  const initialPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  return (
    <main className="showcase-page cases-page-shell">
      <TopNav user={user} />
      <CasesWorkspace cases={allCases} initialFilters={initialFilters} initialSort={initialSort} initialPage={initialPage} />
    </main>
  );
}
