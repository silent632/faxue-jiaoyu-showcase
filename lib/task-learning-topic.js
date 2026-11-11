// 教师任务只能引用当前案例已公开的知识点关联。
export function resolveTaskLearningTopic(topicId, caseId, learning) {
  if (!topicId) return null;
  const topic = learning.topics.find(item => item.id === topicId);
  const link = learning.caseLinks.find(item => item.caseId === caseId && item.topicId === topicId);
  if (!topic || !caseId || !link) return null;
  return { id: topic.id, title: topic.title, reason: link.reason, question: link.question, evidence: link.evidence };
}
