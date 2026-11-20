import sources from "../../content/case-reading-sources.json" with { type: "json" };

export const caseReadingIds = Object.keys(sources);

const titles = {
  article: "研究文章全文",
  release: "法院发布材料全文",
  collection: "案例汇编全文",
  decision: "裁判文书全文",
  document: "裁判文书全文",
};

export function getCaseReadingSource(caseId, file) {
  const source = sources[caseId];
  if (!source || source.file !== file) return { title: "来源材料全文", file };
  if (caseId === "case-0049") return { ...source, title: "收监执行决定全文" };
  return { ...source, title: titles[source.kind] || "来源材料全文" };
}
