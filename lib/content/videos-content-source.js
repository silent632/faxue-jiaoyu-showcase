import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

export function loadVideosContentSource() {
  return loadJsonFile(resolveContentPath("videos.json"));
}
