import { normRegistry, normTasks } from "./norm-evidence-data.js";

export { normRegistry, normTasks };
const known = new Set(normRegistry.map((item) => item.id));
export function compareNormSelection(selected, referenceIds) {
  const selection = [...new Set(selected)].filter((id) => known.has(id));
  return {
    shared: selection.filter((id) => referenceIds.includes(id)),
    unselected: referenceIds.filter((id) => !selection.includes(id)),
    outside: selection.filter((id) => !referenceIds.includes(id)),
  };
}

export function isNormComparisonCurrent(data) {
  const task = Object.hasOwn(normTasks, data?.caseId) ? normTasks[data.caseId] : null;
  return Boolean(task && data.compared === true && data.sourceVersion === task.sourceVersion
    && Array.isArray(data.selected) && data.selected.length && data.selected.every((id) => known.has(id))
    && new Set(data.selected).size === data.selected.length
    && Array.isArray(data.referenceIds) && data.referenceIds.length === task.referenceIds.length
    && new Set(data.referenceIds).size === data.referenceIds.length
    && task.referenceIds.every((id) => data.referenceIds.includes(id)));
}
