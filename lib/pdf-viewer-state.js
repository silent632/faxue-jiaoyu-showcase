const MIN_SCALE = 0.75;
const MAX_SCALE = 2.4;

export function normalizePdfAssetUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  const hashIndex = value.indexOf("#");
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = withoutHash.indexOf("?");
  const basePath = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";

  const segments = basePath.split("/");
  const lastSegment = segments.pop() || "";

  let encodedSegment = lastSegment;
  try {
    encodedSegment = encodeURIComponent(decodeURIComponent(lastSegment));
  } catch (_error) {
    encodedSegment = encodeURIComponent(lastSegment);
  }

  return `${segments.join("/")}/${encodedSegment}${query}`;
}

export function clampPdfPage(pageNumber, totalPages) {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safePage = Number(pageNumber) || 1;
  return Math.min(safeTotal, Math.max(1, Math.round(safePage)));
}

export function clampPdfScale(scale) {
  const safeScale = Number(scale);
  if (!Number.isFinite(safeScale)) return 1;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(safeScale.toFixed(2))));
}

export function getNextPdfScale(currentScale, delta) {
  return clampPdfScale((Number(currentScale) || 1) + (Number(delta) || 0));
}

export function getPdfScaleBounds() {
  return {
    min: MIN_SCALE,
    max: MAX_SCALE,
  };
}
