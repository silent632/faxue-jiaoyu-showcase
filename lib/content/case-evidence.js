import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./content-paths.js";

// 旁侧核查表不是第二份案例库；所有日期展示仍读取 cases-extracted.json。
export function validateCaseEvidence(rows, ledger, readSource) {
  const errors = [];
  if (ledger?.version !== 1 || !ledger.cases || typeof ledger.cases !== "object") return ["日期核查表格式不兼容"];
  const ids = new Set(rows.map((row) => row.case_id));
  for (const id of Object.keys(ledger.cases)) if (!ids.has(id)) errors.push(`${id}: 核查表存在未知案例`);
  for (const row of rows) {
    const item = ledger.cases[row.case_id];
    const prefix = `${row.case_id}: `;
    if (!item) { errors.push(prefix + "缺少日期核查结论"); continue; }
    if (item.sourceFile !== row.pdf_file || path.basename(item.sourceFile || "") !== item.sourceFile) errors.push(prefix + "来源文件不匹配");
    if (item.caseNumber?.value !== row.case_number) errors.push(prefix + "案号变化后必须重新核对日期");
    if (!/^[a-f0-9]{64}$/.test(item.sourceSha256 || "")) errors.push(prefix + "来源指纹无效");
    else if (readSource) {
      try {
        const digest = createHash("sha256").update(readSource(row.pdf_file)).digest("hex");
        if (digest !== item.sourceSha256) errors.push(prefix + "PDF 已变化，请重新核对引用");
      } catch { errors.push(prefix + "无法读取来源 PDF"); }
    }
    const field = item.judgmentDate;
    if (!field || !["verified", "missing", "partial", "conflict"].includes(field.status) || !field.note) {
      errors.push(prefix + "日期核查状态或说明缺失"); continue;
    }
    if (field.status === "verified") {
      const value = field.value;
      const date = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "") || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) errors.push(prefix + "日期值非法");
      if (!Array.isArray(field.evidence) || !field.evidence.length || field.evidence.some((proof) => !Number.isInteger(proof.page) || proof.page < 1 || !proof.quote || proof.value !== value)) errors.push(prefix + "已核对日期缺少一致的页码和原文证据");
    } else if (field.value !== "") errors.push(prefix + "未确认日期不得写入推测值");
    if (row.judgment_date !== field.value) errors.push(prefix + "展示日期与核查表不一致");
  }
  return errors;
}

export function validateRepositoryCaseEvidence() {
  try {
    const rows = JSON.parse(readFileSync(path.join(REPO_ROOT, "data/generated/cases-extracted.json"), "utf8"));
    const ledger = JSON.parse(readFileSync(path.join(REPO_ROOT, "content/case-evidence.json"), "utf8"));
    return validateCaseEvidence(rows, ledger, (name) => readFileSync(path.join(REPO_ROOT, "public/pdfs", name)));
  } catch (error) { return [`日期证据校验失败: ${error.message}`]; }
}
