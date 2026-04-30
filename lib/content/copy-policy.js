import { resolveContentPath } from "./content-paths.js";
import { loadJsonFile } from "./load-json.js";

const POLICY_PATH = resolveContentPath("copy-policy.json");

function asStringArray(value, fieldName) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`copy-policy.json field "${fieldName}" must be a non-empty string array`);
  }
  return value.map((item) => item.trim());
}

export function loadCopyPolicy() {
  const policy = loadJsonFile(POLICY_PATH);
  return {
    forbiddenPatterns: asStringArray(policy.forbiddenPatterns, "forbiddenPatterns"),
    forbiddenPublicReviewPatterns: asStringArray(policy.forbiddenPublicReviewPatterns, "forbiddenPublicReviewPatterns"),
    forbiddenIncompleteStatePhrases: asStringArray(policy.forbiddenIncompleteStatePhrases, "forbiddenIncompleteStatePhrases"),
    forbiddenProductionPhrases: asStringArray(policy.forbiddenProductionPhrases, "forbiddenProductionPhrases"),
    preferredTerms: policy.preferredTerms && typeof policy.preferredTerms === "object" ? policy.preferredTerms : {},
    pageRoleRules: policy.pageRoleRules && typeof policy.pageRoleRules === "object" ? policy.pageRoleRules : {},
  };
}

export function listForbiddenCopyMatches(text, policy = loadCopyPolicy()) {
  const source = String(text || "");
  const terms = [
    ...policy.forbiddenPatterns,
    ...policy.forbiddenPublicReviewPatterns,
    ...policy.forbiddenIncompleteStatePhrases,
    ...policy.forbiddenProductionPhrases,
  ];
  return terms.filter((term) => source.includes(term));
}
