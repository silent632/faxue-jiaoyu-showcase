import test from "node:test";
import assert from "node:assert/strict";

import {
  clampPdfPage,
  clampPdfScale,
  getNextPdfScale,
  normalizePdfAssetUrl,
} from "../../lib/pdf-viewer-state.js";

test("normalizePdfAssetUrl preserves query and encodes file names", () => {
  assert.equal(
    normalizePdfAssetUrl("/pdfs/示例 文书.pdf?download=1"),
    "/pdfs/%E7%A4%BA%E4%BE%8B%20%E6%96%87%E4%B9%A6.pdf?download=1"
  );
});

test("clampPdfPage keeps page index within valid bounds", () => {
  assert.equal(clampPdfPage(0, 12), 1);
  assert.equal(clampPdfPage(8, 12), 8);
  assert.equal(clampPdfPage(20, 12), 12);
  assert.equal(clampPdfPage(4, 0), 1);
});

test("clampPdfScale keeps zoom within readable bounds", () => {
  assert.equal(clampPdfScale(0.1), 0.75);
  assert.equal(clampPdfScale(1.3), 1.3);
  assert.equal(clampPdfScale(4.2), 2.4);
});

test("getNextPdfScale nudges zoom by step and respects bounds", () => {
  assert.equal(getNextPdfScale(1, 0.15), 1.15);
  assert.equal(getNextPdfScale(2.35, 0.2), 2.4);
  assert.equal(getNextPdfScale(0.8, -0.2), 0.75);
});
