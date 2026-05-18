import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

export function loadSiteContentSource() {
  return loadJsonFile(resolveContentPath("site.json"));
}
