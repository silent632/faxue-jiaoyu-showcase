import data from '../../content/jurisprudence-learning.json' with { type: 'json' };

const states = new Set(['candidate', 'pending', 'published', 'reviewed', 'withdrawn']);
const visible = status => status === 'published' || status === 'reviewed';

export function validateJurisprudenceLearning(input, caseIds = []) {
  const errors = [];
  const chapters = new Map();
  const topics = new Map();
  const cases = new Set(caseIds);
  const links = new Set();
  if (!input || !Array.isArray(input.chapters) || !Array.isArray(input.topics) || !Array.isArray(input.caseLinks)) return ['知识数据结构无效'];
  for (const item of input.chapters) {
    if (!item.id || chapters.has(item.id) || !item.title || !item.source || !Number.isInteger(item.order) || !states.has(item.status)) errors.push('章节字段无效或 ID 重复');
    chapters.set(item.id, item);
  }
  for (const item of input.topics) {
    if (!item.id || topics.has(item.id) || !chapters.has(item.chapterId) || !item.title || !item.source || !states.has(item.status)) errors.push('知识点字段无效、章节不存在或 ID 重复');
    if (item.status === 'reviewed' && (chapters.get(item.chapterId)?.status !== 'reviewed' || !item.description || !item.reviewer || !item.reviewedAt)) errors.push('已复核知识点缺少说明、审阅信息或已复核章节');
    if (item.status === 'published' && (!visible(chapters.get(item.chapterId)?.status) || !item.description)) errors.push('公开知识点缺少说明或公开章节');
    topics.set(item.id, item);
  }
  for (const item of input.topics) {
    if (item.parentId && (!topics.has(item.parentId) || topics.get(item.parentId).chapterId !== item.chapterId || item.parentId === item.id || (item.status === 'reviewed' && topics.get(item.parentId).status !== 'reviewed'))) errors.push('知识点父级无效');
    const seen = new Set([item.id]); let parent = item.parentId;
    while (parent && topics.has(parent)) { if (seen.has(parent)) { errors.push('知识点父级存在循环'); break; } seen.add(parent); parent = topics.get(parent).parentId; }
  }
  for (const link of input.caseLinks) {
    const key = `${link.caseId}:${link.topicId}`;
    if (links.has(key) || !topics.has(link.topicId) || !cases.has(link.caseId) || !states.has(link.status) || !['explicit', 'observation'].includes(link.type)) errors.push('案例关联无效或重复');
    if (visible(link.status) && (!link.reason || !link.question || !link.evidence || !link.sourceFile || !/^[a-f0-9]{64}$/.test(link.sourceSha256 || '') || !Array.isArray(link.pages) || !link.pages.length || link.pages.some(page => !Number.isInteger(page) || page < 1) || !visible(topics.get(link.topicId)?.status))) errors.push('公开关联缺少依据、来源指纹、页码或公开知识点');
    if (link.status === 'reviewed' && (!link.reviewer || !link.reviewedAt || topics.get(link.topicId)?.status !== 'reviewed')) errors.push('已复核关联缺少审阅信息或已复核知识点');
    links.add(key);
  }
  return errors;
}

export function filterPublicJurisprudenceLearning(input) {
  const chapters = input.chapters.filter(item => visible(item.status));
  const chapterIds = new Set(chapters.map(item => item.id));
  const topics = input.topics.filter(item => visible(item.status) && chapterIds.has(item.chapterId));
  const topicIds = new Set(topics.map(item => item.id));
  return { chapters, topics, caseLinks: input.caseLinks.filter(item => visible(item.status) && topicIds.has(item.topicId)) };
}

export function getPublicJurisprudenceLearning() { return filterPublicJurisprudenceLearning(data); }

export function getJurisprudenceLearningData() { return data; }
