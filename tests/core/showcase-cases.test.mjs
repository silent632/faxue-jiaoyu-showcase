import test from "node:test";
import assert from "node:assert/strict";

import {
  getShowcaseCanonicalDemoCaseId,
  getShowcaseCanonicalStudyHref,
  getShowcaseCaseById,
  getShowcaseCaseStudyById,
  getShowcaseCaseStaticParams,
  loadShowcaseCases,
  selectCanonicalDemoCaseId,
} from "../../lib/showcase-cases.js";
import { buildFilterOptions, buildStarterActions, normalizeCaseRows } from "../../lib/cases-workspace.js";
import {
  buildCaseReadingJudgment,
  buildCaseReadingRoadmap,
  buildMissingPdfNote,
  buildOutcomeHeadline,
  buildPrimaryContinuation,
} from "../../lib/case-presentation.mjs";
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

test("static params cover the full published case set including the canonical study case", async () => {
  const rows = await loadShowcaseCases();
  const canonicalId = getShowcaseCanonicalDemoCaseId();
  const params = await getShowcaseCaseStaticParams();

  assert.equal(params.length, rows.length);
  assert.ok(params.some((item) => item.id === canonicalId));
  assert.ok(params.some((item) => item.id === "case-0208"));
  assert.ok(params.some((item) => item.id === "case-0025"));
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

test("starter actions expose year quick actions with the correct field metadata", async () => {
  const rows = normalizeCaseRows(await loadShowcaseCases());
  const actions = buildStarterActions({
    rows,
    filtered: rows,
    filters: {
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
    },
  });

  const yearAction = actions.find((item) => item.field === "year");

  assert.ok(yearAction);
  assert.match(yearAction.value, /^\d{4}$/u);
  assert.equal(yearAction.key, `year:${yearAction.value}`);
  assert.equal(yearAction.label, yearAction.value);
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

test("case-route copy helpers avoid backstage instructional wording", async () => {
  const item = await getShowcaseCaseById("case-0001");
  const text = JSON.stringify(item);

  assert.ok(item);
  assert.equal(/用于组织课堂提问/u.test(text), false);
  assert.equal(/页面保留/u.test(text), false);
  assert.equal(/公开展示模式/u.test(text), false);
});

test("reading judgment copy frames the detail page as a study decision", async () => {
  const item = await getShowcaseCaseById("case-0001");
  const judgment = buildCaseReadingJudgment(item);
  const roadmap = buildCaseReadingRoadmap(item);
  const continuation = buildPrimaryContinuation(item);

  assert.ok(judgment.about.length > 0);
  assert.ok(judgment.whyRead.length > 0);
  assert.ok(judgment.shouldContinue.length > 0);
  assert.match(judgment.about, /争议|焦点|围绕/u);
  assert.match(judgment.whyRead, /裁判|结论|理由/u);
  assert.match(judgment.shouldContinue, /研习|继续/u);
  assert.equal(/详情页仅保留/u.test(JSON.stringify(judgment)), false);

  assert.equal(roadmap.length, 3);
  assert.match(roadmap[0].title, /先判断读什么/u);
  assert.match(roadmap[1].title, /再判断值不值得细读/u);
  assert.match(roadmap[2].title, /最后决定是否进入研习/u);

  assert.equal(continuation.label, "进入案例研习");
  assert.match(continuation.description, /先完成导读判断/u);
});

test("presentation helpers keep no-pdf messaging intentional", () => {
  const headline = buildOutcomeHeadline({
    resultText: "",
    result: "",
    summary: "本案争议在于借款关系是否成立。法院最终认定借款事实存在，并支持主要诉请。详情页仅保留导读信息，具体事实认定和裁判理由请结合 PDF 原文阅读。",
  });

  const note = buildMissingPdfNote({ hasPdf: false, hasWord: false });

  assert.equal(headline, "本案争议在于借款关系是否成立。");
  assert.match(note.title, /研习入口/u);
  assert.match(note.body, /不影响继续判断是否进入案例研习/u);
  assert.equal(/暂无|缺失|降级/u.test(`${note.title}${note.body}`), false);
});
