import { annotationTasks } from './annotation-evidence-data.js';
export { annotationTasks };
export const annotationTags = [
  { id: 'major-premise', label: '大前提', color: '#3b5998' },
  { id: 'minor-premise', label: '小前提/涵摄', color: '#82542b' },
  { id: 'conclusion', label: '结论', color: '#2d8a50' },
  { id: 'interpretation', label: '解释方法', color: '#9b6a4a' },
  { id: 'reasoning-gap', label: '推理跳步/瑕疵', color: '#cc3333' },
];

export function isAnnotationCurrent(data, tasks = annotationTasks) {
  const task = Object.hasOwn(tasks, data?.caseId) ? tasks[data.caseId] : null;
  return Boolean(task && data.sourceVersion === task.sourceVersion
    && Array.isArray(data.annotations) && data.annotations.length > 0
    && new Set(data.annotations.map((item) => item?.paragraphId)).size === data.annotations.length
    && data.annotations.every((item) => {
      const paragraph = task.paragraphs.find((entry) => entry.id === item?.paragraphId);
      return paragraph && item.text === paragraph.text && item.page === paragraph.page
        && annotationTags.some((tag) => tag.id === item.tagId);
    }));
}

// 旧数组下标无法证明对应哪个原文段落，保留为历史，不猜测迁移目标。
export function restoreAnnotationDraft(data, caseId) {
  const current = data?.caseId === caseId && isAnnotationCurrent(data);
  const history = Array.isArray(data?.historicalAnnotations) ? [...data.historicalAnnotations] : [];
  if (!current && Array.isArray(data?.annotations) && data.annotations.length) {
    const { historicalAnnotations, ...previous } = data;
    history.push(previous);
  }
  return {
    annotations: current ? data.annotations : [],
    evaluation: typeof data?.evaluation === 'string' ? data.evaluation : '',
    historicalAnnotations: history,
  };
}

export function createAnnotation(paragraph, tagId) {
  return { paragraphId: paragraph.id, page: paragraph.page, text: paragraph.text, tagId };
}
