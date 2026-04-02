import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildPdfSyncCandidates, syncAvailablePdfs } from "../../lib/showcase-pdf-sync.mjs";

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

test("syncAvailablePdfs copies available pdfs", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-pdf-sync-"));
  const sourceDir = path.join(tempRoot, "source");
  const targetDir = path.join(tempRoot, "target");

  await fs.mkdir(sourceDir, { recursive: true });
  await fs.writeFile(path.join(sourceDir, "real-case.pdf"), "demo pdf");

  const result = await syncAvailablePdfs({
    sourceDir,
    targetDir,
    rows: [{ id: "case-1", pdfFile: "nested/path/real-case.pdf" }],
  });

  assert.deepEqual(result, {
    copied: 1,
    missing: 0,
    total: 1,
    copiedFiles: ["real-case.pdf"],
    missingFiles: [],
  });
  assert.equal(await fs.readFile(path.join(targetDir, "real-case.pdf"), "utf8"), "demo pdf");
});

test("syncAvailablePdfs counts missing source pdfs without throwing", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-pdf-sync-"));
  const sourceDir = path.join(tempRoot, "source");
  const targetDir = path.join(tempRoot, "target");

  await fs.mkdir(sourceDir, { recursive: true });

  const result = await syncAvailablePdfs({
    sourceDir,
    targetDir,
    rows: [{ id: "case-2", pdfFile: "nested/path/missing-case.pdf" }],
  });

  assert.deepEqual(result, {
    copied: 0,
    missing: 1,
    total: 1,
    copiedFiles: [],
    missingFiles: ["missing-case.pdf"],
  });
  await assert.rejects(fs.access(path.join(targetDir, "missing-case.pdf")));
});

test("syncAvailablePdfs surfaces operational copy failures", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "showcase-pdf-sync-"));
  const sourceDir = path.join(tempRoot, "source");
  const targetDir = path.join(tempRoot, "target");

  await fs.mkdir(path.join(sourceDir, "blocked-case.pdf"), { recursive: true });

  await assert.rejects(
    syncAvailablePdfs({
      sourceDir,
      targetDir,
      rows: [{ id: "case-3", pdfFile: "blocked-case.pdf" }],
    }),
    /Failed to copy PDF "blocked-case\.pdf"/u
  );
});
