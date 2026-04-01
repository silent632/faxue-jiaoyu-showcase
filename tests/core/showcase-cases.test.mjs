import test from "node:test";
import assert from "node:assert/strict";

import {
  getShowcaseCanonicalDemoCaseId,
  getShowcaseCanonicalStudyHref,
  getShowcaseCaseById,
  getShowcaseCaseStudyById,
  loadShowcaseCases,
  selectCanonicalDemoCaseId,
} from "../../lib/showcase-cases.js";
import { buildFilterOptions, normalizeCaseRows } from "../../lib/cases-workspace.js";
import { normalizePublicFileName } from "../../lib/data/public-files.js";

test("showcase cases loader returns normalized source cases", async () => {
  const rows = await loadShowcaseCases();

  assert.ok(rows.length > 100);
  assert.ok(rows[0].id);
  assert.ok(rows[0].title);
  assert.ok(rows[0].caseNumber);
  assert.ok(rows[0].causePath);
  assert.ok(rows[0].causeFocus);
  assert.ok(Array.isArray(rows[0].laws));
});

test("showcase case lookup returns a matching case by id", async () => {
  const rows = await loadShowcaseCases();
  const caseId = selectCanonicalDemoCaseId([...rows].reverse());

  const caseItem = await getShowcaseCaseById(caseId);

  assert.ok(caseItem);
  assert.equal(caseItem.id, caseId);
  assert.ok(caseItem.title);
});

test("showcase study helper returns structured steps for a real case", async () => {
  const rows = await loadShowcaseCases();
  const demoId = selectCanonicalDemoCaseId([...rows].reverse());
  const caseItem = await getShowcaseCaseStudyById(demoId);

  assert.ok(caseItem);
  assert.equal(caseItem.id, demoId);
  assert.equal(caseItem.studySteps.length, 4);
  assert.equal(caseItem.studySteps[1].label, "事实梳理");
  assert.ok(caseItem.studySteps[1].content.length > 0);
});

test("showcase canonical study href is derived from a deterministic demo case", async () => {
  const rows = await loadShowcaseCases();
  const canonicalId = getShowcaseCanonicalDemoCaseId();

  assert.equal(canonicalId, selectCanonicalDemoCaseId([...rows].reverse()));
  assert.equal(getShowcaseCanonicalStudyHref(), `/cases/${canonicalId}/study`);
});

test("real showcase cases can build workspace filter options", async () => {
  const rows = normalizeCaseRows(await loadShowcaseCases());
  const options = buildFilterOptions(rows, {
    keyword: "",
    causeL1: "",
    causeL2: "",
    causeL3: "",
    courtLevel: [],
    year: "",
    docType: [],
    procedure: [],
    province: [],
    result: [],
    lawName: [],
    lawArticle: [],
  });

  assert.ok(rows.length > 100);
  assert.ok(Array.isArray(options.year));
  assert.ok(Array.isArray(options.courtLevel));
  assert.ok(Array.isArray(options.docType));
});

test("showcase case detail data exposes metadata needed by the real detail page", async () => {
  const item = await getShowcaseCaseById("case-0001");

  assert.ok(item);
  assert.equal(typeof item.title, "string");
  assert.equal(typeof item.caseNumber, "string");
  assert.equal(typeof item.courtName, "string");
  assert.equal(typeof item.summary, "string");
  assert.equal(typeof item.pdfFile, "string");
  assert.equal(typeof item.wordFile, "string");
  assert.ok(Array.isArray(item.laws));
});

test("public file normalization strips directory segments for detail-page links", () => {
  assert.equal(normalizePublicFileName("nested/demo/file.pdf"), "file.pdf");
  assert.equal(normalizePublicFileName("nested\\\\demo\\\\file.docx"), "file.docx");
  assert.equal(normalizePublicFileName("  sample.pdf  "), "sample.pdf");
});
