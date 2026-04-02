import fs from "node:fs/promises";
import path from "node:path";

function basenamePortable(fileName) {
  const raw = String(fileName || "").trim();
  if (!raw) return "";
  return raw.split(/[/\\]/).pop() || "";
}

export function normalizePublicFileName(fileName) {
  return basenamePortable(fileName);
}

export function resolvePublicFilePath(folderName, fileName) {
  const safeFolder = basenamePortable(folderName);
  const safeName = normalizePublicFileName(fileName);
  if (!safeFolder || !safeName) return "";

  return path.join(process.cwd(), "public", safeFolder, safeName);
}

export async function publicFileExists(folderName, fileName) {
  const fullPath = resolvePublicFilePath(folderName, fileName);
  if (!fullPath) return false;

  try {
    await fs.access(fullPath);
    return true;
  } catch (_error) {
    return false;
  }
}
