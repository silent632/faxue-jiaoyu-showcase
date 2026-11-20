import documents from '@/content/law-library.json';
import { loadShowcaseCases } from '@/lib/showcase-cases';

export const dynamic = 'force-static';

export async function GET() {
  const laws = new Map();
  for (const item of await loadShowcaseCases()) {
    for (const law of item.laws) {
      const name = law.displayLaw || law.law;
      const key = JSON.stringify([name, law.article]);
      if (!laws.has(key)) laws.set(key, { name, fullName: law.law, article: law.article, cases: new Set() });
      const matches = laws.get(key).cases;
      matches.add(item.id);
    }
  }
  const entries = Array.from(laws.values(), ({ cases, ...law }) => ({ ...law, caseCount: cases.size })).sort((a, b) => b.caseCount - a.caseCount || a.name.localeCompare(b.name, 'zh-CN'));
  return Response.json({ entries, documents });
}
