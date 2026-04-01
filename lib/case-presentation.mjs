function compactText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u3000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatLawNameForDisplay(value) {
  return String(value || "").replace(/[（(].*?[)）]/g, "").trim();
}

export function buildOutcomeHeadline(caseItem = {}) {
  const resultText = compactText(caseItem.resultText);
  if (resultText) {
    const sentence = resultText.match(/[^。！？；!?;]+[。！？；!?;]?/u);
    return sentence ? sentence[0].trim() : resultText;
  }

  const result = compactText(caseItem.result);
  if (result) return result;

  const summary = compactText(caseItem.summary);
  const summarySentence = summary.match(/[^。！？；!?;]+[。！？；!?;]?/u);
  return summarySentence ? summarySentence[0].trim() : "";
}
