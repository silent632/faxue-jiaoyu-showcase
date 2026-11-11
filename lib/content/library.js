import data from '../../content/library.json' with { type: 'json' };
import { libraryCategories } from '../library-categories.js';

const isText = value => typeof value === 'string' && value.trim().length > 0;
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function validLibraryHref(value) {
  if (typeof value !== 'string') return false;
  if (/^\/library\/[A-Za-z0-9_./-]+$/.test(value)) return !value.slice(1).split('/').some(part => part === '.' || part === '..' || part === '');
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}

export function validateLibrary(input, topicIds = []) {
  if (!input || !Array.isArray(input.items)) return ['资料列表格式无效'];
  const errors = []; const ids = new Set(); const topics = new Set(topicIds);
  for (const item of input.items) {
    if (!item || typeof item !== 'object' || !/^[a-z0-9][a-z0-9-]*$/.test(item.id || '') || ids.has(item.id)) { errors.push('资料编号无效或重复'); continue; }
    ids.add(item.id);
    if (!['pending', 'published', 'withdrawn'].includes(item.status) || !Object.hasOwn(libraryCategories, item.category) || !isText(item.title)) errors.push(`${item.id}: 状态、类别或标题无效`);
    if (item.description != null && typeof item.description !== 'string') errors.push(`${item.id}: 简介必须是文本`);
    if (!Array.isArray(item.topicIds) || item.topicIds.some(id => !topics.has(id))) errors.push(`${item.id}: 知识点引用无效`);
    if (item.status === 'published' && (!isText(item.source) || !isText(item.permission) || !isText(item.reviewer) || !validDate(item.reviewedAt) || !validDate(item.sourceDate) || !validLibraryHref(item.href))) errors.push(`${item.id}: 已发布资料缺少来源、授权、日期、审阅信息或有效链接`);
  }
  return errors;
}

export function getPublicLibrary(input = data) {
  return input.items.filter(item => item.status === 'published').map(({ id, category, title, description, source, sourceDate, href, topicIds }) => ({ id, category, title, description, source, sourceDate, href, topicIds }));
}

export function getLibraryData() { return data; }
