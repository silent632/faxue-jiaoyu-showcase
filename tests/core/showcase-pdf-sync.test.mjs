import test from "node:test";
import assert from "node:assert/strict";

import { buildPdfSyncCandidates } from "../../lib/showcase-pdf-sync.mjs";

test("buildPdfSyncCandidates normalizes nested pdf filenames", () => {
  const candidates = buildPdfSyncCandidates([
    { id: "case-1", pdfFile: "  demo/示例案例.pdf  " },
    { id: "case-2", pdfFile: "nested/path/另一份文书.pdf" },
  ]);

  assert.deepEqual(candidates, [
    { id: "case-1", fileName: "示例案例.pdf" },
    { id: "case-2", fileName: "另一份文书.pdf" },
  ]);
});
