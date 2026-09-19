'use client';
import { annotationTasks,annotationTags,createAnnotation } from '@/lib/annotation';
import { normRegistry,normTasks } from '@/lib/norm-comparison';
export default function EvidenceEditor({moduleId,caseId,data,onChange,disabled}){
 if(moduleId==='exp-annotation'){
  const task=annotationTasks[caseId];if(!task)return <p>此案例尚无可用于标注的已核对原文，请联系教师调整任务。</p>;
  function annotate(paragraph,tagId){const annotations=(data.annotations||[]).filter(row=>row.paragraphId!==paragraph.id);if(tagId)annotations.push(createAnnotation(paragraph,tagId));onChange({...data,caseId,sourceVersion:task.sourceVersion,annotations});}
  return <><p className="console-muted">以下段落来自已核对的裁判原文。选择标注类别，再说明整体评价。</p>{task.paragraphs.map(paragraph=><section key={paragraph.id}><blockquote>{paragraph.text}</blockquote><label>第{paragraph.page}页 · 标注类别<select disabled={disabled} value={data.annotations?.find(row=>row.paragraphId===paragraph.id)?.tagId||''} onChange={e=>annotate(paragraph,e.target.value)}><option value="">暂不标注</option>{annotationTags.map(tag=><option key={tag.id} value={tag.id}>{tag.label||tag.name}</option>)}</select></label></section>)}<label>整体评价<textarea value={data.evaluation||''} disabled={disabled} onChange={e=>onChange({...data,evaluation:e.target.value})}/></label></>;
 }
 if(moduleId==='exp-norm-retrieval'){
  const task=normTasks[caseId];if(!task)return <p>此案例尚无已核对的规范对照，请联系教师调整任务。</p>;
  function select(id,checked){const selected=new Set(data.selected||[]);if(checked)selected.add(id);else selected.delete(id);onChange({...data,caseId,selected:[...selected],compared:false});}
  return <><p>根据案例选择相关规范，并写出理由。对照范围仅限已核对的裁判援引段。</p><fieldset disabled={disabled}><legend>规范选择</legend>{normRegistry.map(norm=><label key={norm.id}><input type="checkbox" checked={data.selected?.includes(norm.id)||false} onChange={e=>select(norm.id,e.target.checked)}/>{norm.name}</label>)}</fieldset><label>选择理由<textarea value={data.reason||''} disabled={disabled} onChange={e=>onChange({...data,reason:e.target.value})}/></label><button className="btn btn-outline" disabled={disabled||!data.selected?.length} onClick={()=>onChange({...data,caseId,sourceVersion:task.sourceVersion,referenceIds:task.referenceIds,compared:true})}>查看已核对的规范对照</button>{data.compared&&<section><h3>原文援引对照</h3>{task.referenceIds.map(id=><p key={id}>{normRegistry.find(norm=>norm.id===id)?.name||id}</p>)}<p>此对照不表示其他论证路径必然错误。</p></section>}</>;
 }
 return null;
}
