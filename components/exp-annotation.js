"use client";

import { useState } from 'react';
import { annotationTasks, annotationTags, restoreAnnotationDraft, createAnnotation } from '../lib/annotation.js';

export default function ExpAnnotation({ caseItem, onChange, initialData }) {
  const task = annotationTasks[caseItem.id];
  const [draft, setDraft] = useState(() => restoreAnnotationDraft(initialData, caseItem.id));
  const [activeTag, setActiveTag] = useState(annotationTags[0].id);
  function emit(annotations, evaluation) {
    const next = { ...draft, annotations, evaluation };
    setDraft(next);
    const summary = annotations.map((item) => `[${annotationTags.find((tag) => tag.id === item.tagId)?.label}] 第${item.page}页：${item.text}`).join('\n');
    onChange?.(`${summary}\n\n${evaluation}`, { ...next, caseId: caseItem.id,
      sourceVersion: task?.sourceVersion || '', sourceFile: task?.sourceFile || '',
      sourceSha256: task?.sourceSha256 || '', caseNumber: task?.caseNumber || '' });
  }
  function toggle(paragraph) {
    const previous = draft.annotations.find((item) => item.paragraphId === paragraph.id);
    const next = draft.annotations.filter((item) => item.paragraphId !== paragraph.id);
    if (previous?.tagId !== activeTag) next.push(createAnnotation(paragraph, activeTag));
    emit(next, draft.evaluation);
  }
  return <div className="exp-interaction exp-annotation-interaction">
    <p>训练材料为裁判原文精选连续句段，分段仅供训练，不代表原文自然段或完整说理。请结合链接中的上下文评价；引文中的法律状态表述属于裁判当时的原文。</p>
    {draft.historicalAnnotations.length > 0 && <details className="exp-annotation-history" open>
      <summary>旧批注待复核（{draft.historicalAnnotations.length} 组）</summary>
      <p>旧版段落下标或旧材料版本不能直接对应当前原文，已保留历史内容。请重新标注当前摘录；历史内容会随实验记录一同导出。</p>
      {draft.historicalAnnotations.map((history, index) => <details key={index}><summary>查看历史记录 {index + 1}</summary><ul>{(Array.isArray(history.annotations) ? history.annotations : []).map((item, itemIndex) => <li key={itemIndex}>
        <strong>{annotationTags.find((tag) => tag.id === item?.tagId)?.label || "旧标记"}</strong>
        <p>{typeof item?.text === "string" ? item.text : `旧版第 ${Number.isInteger(item?.paraIndex) ? item.paraIndex + 1 : "未知"} 段（当时未保存原文，不能据此定位当前摘录）`}</p>
        {Number.isInteger(item?.page) && <p>当时记录的原文页码：{item.page}</p>}
      </li>)}</ul><p>{typeof history.evaluation === "string" ? history.evaluation : ""}</p></details>)}
    </details>}
    {!task ? <div className="exp-annotation-unavailable" role="status"><strong>本案原文摘录待核查</strong><p>当前可在张保林案、富兴公司案、雅安市商业银行案、北京人艺案进行原文批注。本案可以保留评价草稿，尚不能完成实验。</p></div> : <>
      <div className="exp-annotation-toolbar" role="group" aria-label="标注类型">
        {annotationTags.map((tag) => <button key={tag.id} type="button" aria-pressed={activeTag === tag.id} className={`exp-annotation-tag-btn${activeTag === tag.id ? ' active' : ''}`} style={{ '--tag-color': tag.color }} onClick={() => setActiveTag(tag.id)}>{tag.label}</button>)}
      </div>
      <p className="exp-annotation-hint">选择类型后，点击段落或用 Tab 定位并按 Enter/空格标注；再次使用同一类型可取消。</p>
      <div className="exp-annotation-text">
        {task.paragraphs.map((paragraph, index) => {
          const annotation = draft.annotations.find((item) => item.paragraphId === paragraph.id);
          const tag = annotationTags.find((item) => item.id === annotation?.tagId);
          return <div key={paragraph.id}>
            <p><a href={`/cases/${caseItem.id}/#page=${paragraph.page}`} target="_blank" rel="noreferrer">原文第 {paragraph.page} 页 · 摘录 {index + 1} · {task.caseNumber}</a></p>
            <button type="button" aria-label={`标注摘录 ${index + 1}${tag ? `，已标为${tag.label}` : ''}`} aria-pressed={Boolean(annotation)} className={`exp-annotation-para${annotation ? ' annotated' : ''}`} style={tag ? { borderLeftColor: tag.color } : undefined} onClick={() => toggle(paragraph)}>
              {tag && <span className="exp-annotation-mark" style={{ background: tag.color }}>{tag.label}</span>}{paragraph.text}
            </button>
          </div>;
        })}
      </div>
      <p className="exp-annotation-stats" role="status">已标注 {draft.annotations.length} 段</p>
    </>}
    <div className="exp-annotation-evaluation"><label htmlFor="annotation-evaluation">整体说理评价</label>
      <textarea id="annotation-evaluation" className="exp-task-textarea" rows={4} placeholder="结合原文与上下文，说明推导是否完整、哪些地方存在疑点。" value={draft.evaluation} onChange={(event) => emit(draft.annotations, event.target.value)} />
    </div>
    {caseItem.refLegal && <details><summary>教学整理（非裁判原文）</summary><p>{caseItem.refLegal}</p></details>}
  </div>;
}
