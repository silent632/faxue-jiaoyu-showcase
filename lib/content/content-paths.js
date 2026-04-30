import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CONTENT_ROOT = path.join(REPO_ROOT, "content");

export function resolveContentPath(...segments) {
  return path.join(CONTENT_ROOT, ...segments);
}
