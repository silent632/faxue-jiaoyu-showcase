// 初稿只在首次进入对照时冻结，不把迁移后的旧记录冒充首次作答。
export function createReviewPatch(record, capturedAt = new Date().toISOString()) {
  return {
    initialDraft: record.initialDraft || JSON.parse(JSON.stringify({
      output: record.output || '', interactionData: record.interactionData || {}, capturedAt,
    })),
    workflowStage: 'review',
  };
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  return value;
}
export function hasExperimentRevision(record) {
  if (!record?.initialDraft) return false;
  return (record.output || '') !== record.initialDraft.output
    || JSON.stringify(stable(record.interactionData)) !== JSON.stringify(stable(record.initialDraft.interactionData));
}
export function checkRevisionCompletion(record) {
  const missing = (hasExperimentRevision(record) || Boolean(record?.feedbackReference)) && !(typeof record.revisionNote === 'string' && record.revisionNote.trim() && record.revisionNoteConfirmed === true) ? ['修改说明与依据'] : [];
  return { complete: missing.length === 0, missing };
}
