import { checkRevisionCompletion } from "./experiment-revision.js";
import { isAnnotationCurrent } from "./annotation.js";
import { isNormComparisonCurrent } from "./norm-comparison.js";
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

// 这里只验证产出齐备，不评价法律结论正确与否。
export function checkExperimentCompletion(moduleId, data = {}) {
  const value = data && typeof data === "object" ? data : {};
  const missing = [];
  const requireText = (key, label) => { if (!hasText(value[key])) missing.push(label); };
  switch (moduleId) {
    case "exp-reasoning":
      for (const [key, label] of [["majorPremise", "规范前提"], ["minorPremise", "事实对应"], ["conclusion", "裁判结论"], ["subsumption", "涵摄反思"]]) requireText(key, label);
      break;
    case "exp-argumentation":
      if (!hasText(value.plaintiff) || value.plaintiff.trim().length < 30) missing.push("原告/控方论证（至少30字）");
      if (!hasText(value.defendant) || value.defendant.trim().length < 30) missing.push("被告/辩方论证（至少30字）");
      requireText("judgment", "自己的判断");
      break;
    case "exp-norm-retrieval":
      if (!Array.isArray(value.selected) || !value.selected.length) missing.push("规范选择");
      requireText("reason", "选择理由");
      if (!isNormComparisonCurrent(value)) missing.push("有依据的规范对照（当前来源版本）");
      break;
    case "exp-interpretation":
      for (const [key, label] of [["literal", "文义解释"], ["systematic", "体系解释"], ["purposive", "目的解释"]]) {
        if (!hasText(value.columns?.[key])) missing.push(label);
      }
      if (!["literal", "systematic", "purposive"].includes(value.bestMethod)) missing.push("方法选择");
      requireText("bestReason", "选择理由");
      break;
    case "exp-value-balancing":
      for (const [key, label] of [["leftValue", "左侧价值"], ["rightValue", "右侧价值"], ["leftArg", "左侧论证"], ["rightArg", "右侧论证"], ["reason", "衡量结论"]]) requireText(key, label);
      break;
    case "exp-annotation":
      if (!isAnnotationCurrent(value)) missing.push("原文段落标注");
      requireText("evaluation", "整体评价");
      break;
    default:
      missing.push("可识别的实验模块");
  }
  return { complete: missing.length === 0, missing };
}

export function isExperimentComplete(moduleId, record) {
  if (!record || typeof record !== "object") return false;
  const wasCompleted = record.version === 2 ? record.status === "completed" : Boolean(record.completedAt);
  return wasCompleted && checkExperimentCompletion(moduleId, record.interactionData).complete && checkRevisionCompletion(record).complete;
}

export function normalizeExperimentRecord(moduleId, record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return null;
  return { ...record, status: isExperimentComplete(moduleId, record) ? "completed" : "draft" };
}
