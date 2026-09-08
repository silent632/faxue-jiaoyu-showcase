import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { validateCaseEvidence, validateRepositoryCaseEvidence } from "../../lib/content/case-evidence.js";
import { getFilteredRows } from "../../lib/cases-workspace.js";

function fixture() {
  const rows = [{ case_id: "sample", case_number: "测试案号", pdf_file: "sample.pdf", judgment_date: "2022-04-01" }];
  const ledger = { version: 1, cases: { sample: {
    sourceFile: "sample.pdf", sourceSha256: createHash("sha256").update("source").digest("hex"), caseNumber: { value: "测试案号" },
    judgmentDate: { status: "verified", value: "2022-04-01", note: "测试来源", evidence: [{ value: "2022-04-01", page: 2, quote: "二〇二二年四月一日" }] },
  } } };
  return { rows, ledger };
}

test("仓库每篇日期都有对应核查结论且 PDF 指纹未漂移", () => {
  assert.deepEqual(validateRepositoryCaseEvidence(), []);
});
test("源文件、案号或展示日期变化会使证据校验失败", () => {
  const { rows, ledger } = fixture();
  assert.deepEqual(validateCaseEvidence(rows, ledger, () => Buffer.from("source")), []);
  assert.match(validateCaseEvidence(rows, ledger, () => Buffer.from("changed")).join(), /PDF 已变化/);
  rows[0].case_number = "另案";
  rows[0].judgment_date = "2022-04-02";
  const errors = validateCaseEvidence(rows, ledger).join();
  assert.match(errors, /案号变化/);
  assert.match(errors, /展示日期/);
});
test("无法确认的日期不能填值，确认值须有页码及完整日期", () => {
  const { rows, ledger } = fixture();
  const field = ledger.cases.sample.judgmentDate;
  field.status = "partial";
  assert.match(validateCaseEvidence(rows, ledger).join(), /不得写入推测值/);
  field.status = "verified";
  field.value = "2022-02-30";
  field.evidence[0].page = 0;
  const errors = validateCaseEvidence(rows, ledger).join();
  assert.match(errors, /日期值非法/);
  assert.match(errors, /页码/);
});
test("未知日期始终排在已知日期之后，已知值保持升降序", () => {
  const rows = [ { id: "unknown", judgmentDate: "" }, { id: "new", judgmentDate: "2023-01-01" }, { id: "old", judgmentDate: "2020-01-01" } ];
  const filters = { courtLevel: [], docType: [], procedure: [], province: [], result: [], lawName: [], lawArticle: [] };
  assert.deepEqual(getFilteredRows(rows, filters, "date-asc").map((row) => row.id), ["old", "new", "unknown"]);
  assert.deepEqual(getFilteredRows(rows, filters, "date-desc").map((row) => row.id), ["new", "old", "unknown"]);
});
