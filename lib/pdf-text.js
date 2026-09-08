// PDF 文字经常把中文词组拆成多个片段；查找跨片段及换行匹配，并保留文字层索引。
export function findPdfText(strings, query) {
  const needle = String(query || "").replace(/\s+/gu, "").toLowerCase();
  const segments = [];
  let text = "";
  strings.forEach((value, index) => {
    const part = String(value || "").replace(/\s+/gu, "").toLowerCase();
    segments.push({ index, start: text.length, end: text.length + part.length });
    text += part;
  });
  const indexes = new Set();
  let count = 0;
  let first = -1;
  if (needle) {
    for (let start = text.indexOf(needle); start !== -1; start = text.indexOf(needle, start + needle.length)) {
      if (first === -1) first = start;
      count += 1;
      for (const item of segments) if (item.start < start + needle.length && item.end > start) indexes.add(item.index);
    }
  }
  return { count, indexes: [...indexes], snippet: first < 0 ? "" : text.slice(Math.max(0, first - 16), first + needle.length + 32) };
}

export function getPdfPageFromHash(hash, fallback = 1) {
  const raw = new URLSearchParams(String(hash || "").replace(/^#/, "")).get("page");
  return raw && /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : fallback;
}

export function formatPdfCitation(text, caseNumber, pageNumber) {
  return `${text}\n（${caseNumber || "PDF 原文"}，PDF 第 ${pageNumber} 页）`;
}
