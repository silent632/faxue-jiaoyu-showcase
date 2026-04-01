import { getShowcaseCaseById, loadShowcaseCases, getShowcaseCanonicalStudyHref } from "./showcase-cases.js";

export async function listPublicShowcaseCases() {
  return loadShowcaseCases();
}

export async function getPublicShowcaseCaseById(id) {
  return getShowcaseCaseById(id);
}

export function getPublicShowcaseCanonicalStudyHref() {
  return getShowcaseCanonicalStudyHref();
}
