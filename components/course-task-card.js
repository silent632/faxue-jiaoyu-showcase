"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readAllStudyRecords, readExperimentArchive } from '../lib/learning-loop.js';
import { subscribeRecords } from '../lib/local-record.js';
import { deriveCourseTaskState } from '../lib/course-tasks.js';
export default function CourseTaskCard({ task }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    const refresh = () => setState(deriveCourseTaskState(task, readAllStudyRecords('public-showcase'), readExperimentArchive()));
    refresh(); return subscribeRecords(refresh);
  }, [task]);
  return <section className="showcase-card course-task-card" aria-label="本期学习任务">
    <h2>本期学习任务 · {task.title}</h2><p>{task.goal}</p><p>{task.relation}</p>
    <p>{task.prerequisite}</p><p>{task.timeEstimate}</p><p><strong>交付产出：</strong>{task.output}</p>
    <p role="status">{!state ? '正在读取本地进度' : state.complete ? '本期任务已完成' : `三步研习：${state.studyDone ? '已完成' : '待完成'}；${task.moduleName}与反思：${state.experimentDone ? '已完成' : '待完成'}${state.experimentDone && !state.complete && state.studyDone ? '；请按当前任务要求重新存档' : ''}`}</p>
    {state?.hasHistory && <p>课程要求已更新，旧版任务记录保留；当前进度按新要求核验。</p>}
    <div className="course-task-actions"><Link className="btn btn-primary" href={state?.complete ? '/archive/' : state?.href || `/cases/${task.caseId}/study/`}>{state?.complete ? '查看学习档案' : '继续本期任务'}</Link><Link className="btn btn-outline" href={`/cases/${task.caseId}/`}>查看主案例</Link><Link className="btn btn-outline" href={`/experiments/${task.moduleId}/?case=${task.caseId}`}>进入{task.moduleName}与评价</Link></div>
    <p>观看视频或打开页面不会计为完成；进度来自本浏览器保存的学习产出。</p>
  </section>;
}
