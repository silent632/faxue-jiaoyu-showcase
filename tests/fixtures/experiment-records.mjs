import { annotationTasks, createAnnotation } from "../../lib/annotation.js";
import { normTasks } from "../../lib/norm-comparison.js";
export const validInteractions = {
  "exp-reasoning": { majorPremise: "规范的适用条件", minorPremise: "逐项对应事实", conclusion: "据此形成结论", subsumption: "说明要件对应的疑点" },
  "exp-argumentation": { plaintiff: "原告以合同约定及履行凭证为依据，认为付款条件已经成就，请求支付剩余价款。", defendant: "被告以验收记录存在异议为依据，认为付款条件尚未成就，请求驳回原告的请求。", judgment: "先审查付款条件及其证明，再确定请求是否成立。" },
  "exp-norm-retrieval": { caseId: "case-0001", selected: [...normTasks["case-0001"].referenceIds], reason: "规范与本案争点相对应", compared: true, referenceIds: [...normTasks["case-0001"].referenceIds], sourceVersion: normTasks["case-0001"].sourceVersion },
  "exp-interpretation": { columns: { literal: "从文字界定范围", systematic: "结合相邻条款理解", purposive: "说明制度保护目标" }, bestMethod: "systematic", bestReason: "可以同时说明条款及例外" },
  "exp-value-balancing": { leftValue: "隐私", rightValue: "安全", leftArg: "保护个人信息", rightArg: "防范现实风险", reason: "优先采用侵害较小的替代方案", slider: 50 },
  "exp-annotation": { caseId: "case-0001", annotations: [createAnnotation(annotationTasks["case-0001"].paragraphs[0], "major-premise")], sourceVersion: annotationTasks["case-0001"].sourceVersion, evaluation: "检查规范与事实之间的推导是否完整" },
};
export function completedRecord(moduleId = "exp-reasoning", extra = {}) {
  return { version: 2, status: "completed", interactionData: structuredClone(validInteractions[moduleId]), completedAt: "2026-09-06T00:00:00Z", ...extra };
}
