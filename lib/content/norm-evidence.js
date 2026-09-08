import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./content-paths.js";
import { normTasks, normRegistry } from "../norm-comparison.js";

export function validateRepositoryNormEvidence() {
  const errors = [];
  const rows = JSON.parse(readFileSync(path.join(REPO_ROOT, "data/generated/cases-extracted.json"), "utf8"));
  const availability = JSON.parse(readFileSync(path.join(REPO_ROOT, "content/norm-availability.json"), "utf8")).cases;
  if (Object.keys(availability).length !== 75) errors.push("规范候选覆盖必须为 75 篇");
  for (const [id, item] of Object.entries(availability)) {
    if ((item.status === "enabled") !== Boolean(normTasks[id]) || !item.reason) errors.push(`${id}: 规范可用性与任务不一致`);
    const row = rows.find(row => row.case_id === id);
    if (!row || createHash("sha256").update(readFileSync(path.join(REPO_ROOT, "public/pdfs", row.pdf_file))).digest("hex") !== item.sourceSha256) errors.push(`${id}: 可用性核查来源已变化`);
  }
  const ids = new Set(normRegistry.map((item) => item.id));
  for (const [id, task] of Object.entries(normTasks)) {
    const { sourceVersion, ...proof } = task;
    if (createHash("sha256").update(JSON.stringify(proof)).digest("hex") !== sourceVersion) errors.push(`${id}: 依据内容变化后必须更新对照版本`);
    const row = rows.find((item) => item.case_id === id);
    if (!row || row.pdf_file !== task.sourceFile || row.case_number !== task.caseNumber) errors.push(`${id}: 规范依据来源不匹配`);
    if (!task.quote || !Number.isInteger(task.page) || task.page < 1 || !task.referenceIds.length || task.referenceIds.some((ref) => !ids.has(ref))) errors.push(`${id}: 规范依据缺少页码、原文或完整名称`);
    try {
      const sha = createHash("sha256").update(readFileSync(path.join(REPO_ROOT, "public/pdfs", task.sourceFile))).digest("hex");
      if (sha !== task.sourceSha256) errors.push(`${id}: 原文已变化，必须重新核对规范依据`);
    } catch { errors.push(`${id}: 无法读取规范依据 PDF`); }
  }
  return errors;
}
