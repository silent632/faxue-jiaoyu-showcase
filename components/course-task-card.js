"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readAllStudyRecords, readExperimentArchive } from "@/lib/learning-loop.js";
import { subscribeRecords } from "@/lib/local-record.js";
import { deriveCourseTaskState } from "@/lib/course-tasks.js";
import { studyContextHref } from "@/lib/study-law-context.js";

export default function CourseTaskCard({ task }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const refresh = () => setState(deriveCourseTaskState(task, readAllStudyRecords("public-showcase"), readExperimentArchive()));
    refresh();
    return subscribeRecords(refresh);
  }, [task]);

  const fromCourse = (href) => studyContextHref(href, { course: task.slug, origin: "course" });
  const studyHref = `/cases/${task.caseId}/study/`;
  const practiceHref = `/experiments/${task.moduleId}/?case=${task.caseId}`;
  const question = task.caseId === "case-0012"
    ? "商铺的登记面积比约定面积少，合同正文和附件规定了两种结算办法。法院依据哪项约定结算？当事人提交的类案对解释合同有什么帮助？"
    : task.goal;
  const status = !state ? "正在读取本机学习记录" : state.complete ? "本期任务已完成" :
    `案例研习${state.studyDone ? "已完成" : "待完成"} · ${task.moduleName}${state.experimentDone ? "已完成" : "待完成"}`;

  return (
    <section className="showcase-card course-task-card" aria-label="本期学习任务">
      <p className="section-eyebrow">本期学习任务</p>
      <h2>{task.title}</h2>
      <p>{question}</p>
      <ol className="course-task-sequence">
        <li>读主案例原文，找出当事人各自主张和法院回应的问题。</li>
        <li>写下事实、争议焦点和法理分析。记录判断依据所在的文书页码。</li>
        <li>完成{task.moduleName}练习，参照原文补充或修订自己的理由，并保存结论。</li>
      </ol>
      <p role="status">{status}</p>
      {state?.hasHistory && <p>已保留旧版任务记录。请按这期页面列出的任务继续研习。</p>}
      <div className="course-task-actions">
        <Link className="btn btn-primary" href={state?.complete ? "/archive/" : fromCourse(state?.href || studyHref)}>
          {state?.complete ? "查看学习档案" : "继续本期任务"}
        </Link>
        <Link className="btn btn-outline" href={fromCourse(`/cases/${task.caseId}/study/`)}>阅读主案例原文</Link>
        <Link className="btn btn-outline" href={fromCourse(practiceHref)}>打开{task.moduleName}练习</Link>
      </div>
    </section>
  );
}
