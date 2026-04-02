import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadShowcaseCases } from "./showcase-cases.js";
import { normalizePublicFileName } from "./data/public-files.js";

export function normalizeSyncFileName(value) {
  return normalizePublicFileName(value);
}

export function buildPdfSyncCandidates(rows = []) {
  return rows
    .map((item) => ({
      id: String(item?.id || "").trim(),
      fileName: normalizeSyncFileName(item?.pdfFile),
    }))
    .filter((item) => item.id && item.fileName);
}

export async function syncAvailablePdfs({ sourceDir, targetDir, rows } = {}) {
  const sourceRoot = String(sourceDir || "").trim();
  const targetRoot = String(targetDir || "").trim();
  if (!sourceRoot) throw new Error("syncAvailablePdfs requires a sourceDir");
  if (!targetRoot) throw new Error("syncAvailablePdfs requires a targetDir");

  const sourceRows = Array.isArray(rows) ? rows : await loadShowcaseCases();
  const candidates = buildPdfSyncCandidates(sourceRows);

  await fs.mkdir(targetRoot, { recursive: true });

  let copied = 0;
  let missing = 0;
  const copiedFiles = [];
  const missingFiles = [];

  for (const candidate of candidates) {
    const sourcePath = path.join(sourceRoot, candidate.fileName);
    const targetPath = path.join(targetRoot, candidate.fileName);

    try {
      await fs.copyFile(sourcePath, targetPath);
      copied += 1;
      copiedFiles.push(candidate.fileName);
    } catch (_error) {
      missing += 1;
      missingFiles.push(candidate.fileName);
    }
  }

  return {
    copied,
    missing,
    total: candidates.length,
    copiedFiles,
    missingFiles,
  };
}

async function main() {
  const sourceDir = "/Users/silent/Projects/faxue-jiaoyu/public/pdfs";
  const targetDir = fileURLToPath(new URL("../public/pdfs/", import.meta.url));

  const result = await syncAvailablePdfs({ sourceDir, targetDir });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
