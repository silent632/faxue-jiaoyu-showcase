"use client";
import { getCaseRubric } from '../lib/case-rubrics.js';

export default function CaseRubric({ rubric, caseId }) {
  const current = getCaseRubric(caseId, rubric.moduleId);
  const historical = current?.version !== rubric.version;
  const samePdf = current?.sourceSha256 === rubric.sourceSha256;
  const proofLabels = (ids) => ids.map((id) => {
    const proof = rubric.evidence.find((e) => e.id === id);
    return `原文第${proof.page}页`;
  }).join('、');
  return <section className="exp-case-rubric" aria-label="案例专属量规">
    <h4>{rubric.title}</h4>
    <p>{rubric.reviewStatus}。这是静态对照材料，不自动打分，也不是对你的作答已经作出的评价。</p>
    {historical && <p role="status">当前显示本次作答留存的旧量规。平台量规已更新，历史内容仍保留；{samePdf ? '原文文件未改变。' : '原文文件可能已变化，请以留存引文复核，不直接跳转当前 PDF。'}</p>}
    <p>{rubric.courseRelation}</p>
    <h5>具体检查点</h5>
    {rubric.checks.map((check) => <article key={check.id} className="exp-rubric-check">
      <h5>{check.perspective === 'theory' ? '理论' : '实务'} · {check.label}</h5>
      <p><strong>有依据的表现：</strong>{check.adequate}</p>
      <p><strong>仍需补充：</strong>{check.partial}</p>
      <p><strong>常见错误：</strong>{check.commonError}</p>
      <p>核对位置：{proofLabels(check.evidenceIds)}</p>
    </article>)}
    <details><summary>参考分析（基于本案原文，非标准答案）</summary>
      {rubric.referenceAnalysis.map((analysis, index) => <p key={index}>{analysis.text}（{proofLabels(analysis.evidenceIds)}）</p>)}
    </details>
    <details><summary>查看原文依据与页码</summary>
      {rubric.evidence.map((evidence) => <figure key={evidence.id}>
        <figcaption>{samePdf ? <a href={`/cases/${caseId}/#page=${evidence.page}`} target="_blank" rel="noreferrer">原文第 {evidence.page} 页 · {rubric.caseNumber}</a> : `留存原文第 ${evidence.page} 页`}</figcaption>
        <blockquote>{evidence.text}</blockquote>
      </figure>)}
    </details>
    <h5>本案修订要求</h5><p>{rubric.revisionRequirement}</p>
    <p>完成前请填写并确认下方修改说明；即使保留初稿，也要说明对照后的理由。</p>
  </section>;
}
