import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

export function loadCourseArchiveSource() {
  return loadJsonFile(resolveContentPath("courses", "archive.json"));
}
