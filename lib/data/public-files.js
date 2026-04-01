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

export async function publicFileExists(folderName, fileName) {
  const safeName = normalizePublicFileName(fileName);
  if (!safeName) return false;

  try {
    const fullPath = path.join(process.cwd(), "public", folderName, safeName);
    await fs.access(fullPath);
    return true;
  } catch (_error) {
    return false;
  }
}
