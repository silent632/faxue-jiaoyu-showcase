import { readFileSync } from "node:fs";

export function loadJsonFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof SyntaxError
      ? `Invalid JSON in ${filePath}: ${error.message}`
      : `Unable to read JSON file ${filePath}: ${error.message}`;
    throw new Error(message);
  }
}
