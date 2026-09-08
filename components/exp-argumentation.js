"use client";

import { useState } from "react";

const ROLES = [
  { id: "plaintiff", label: "原告/控方" },
  { id: "defendant", label: "被告/辩方" },
];

export default function ExpArgumentation({ caseItem, onChange, initialData }) {
  const [activeRole, setActiveRole] = useState("plaintiff");
  const [plaintiff, setPlaintiff] = useState(initialData?.plaintiff || "");
  const [defendant, setDefendant] = useState(initialData?.defendant || "");
  const [judgment, setJudgment] = useState(initialData?.judgment || "");
  const bothDone = plaintiff.trim().length >= 30 && defendant.trim().length >= 30;

  function notify(field, value) {
    const next = { plaintiff, defendant, judgment, [field]: value };
    onChange?.(Object.values(next).join("\n"), next);
  }

  const columns = [
    {
      id: "plaintiff",
      title: "原告/控方论证",
      value: plaintiff,
      setter: (value) => { setPlaintiff(value); notify("plaintiff", value); },
    },
    {
      id: "defendant",
      title: "被告/辩方论证",
      value: defendant,
      setter: (value) => { setDefendant(value); notify("defendant", value); },
    },
  ];

  return (
    <div className="exp-interaction exp-argumentation-interaction">
      {/* 移动端角色切换（桌面端 CSS 隐藏，双栏并排展示） */}
      <div className="exp-role-tabs">
        {ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`exp-role-tab${activeRole === role.id ? " active" : ""}`}
            onClick={() => setActiveRole(role.id)}
          >
            {role.label}
          </button>
        ))}
      </div>

      <div className="exp-split-panel">
        {columns.map((column) => (
          <div key={column.id} className={`exp-split-col${activeRole === column.id ? " active" : ""}`}>
            <h4 className="exp-split-col-head">{column.title}</h4>
            <textarea
              className="exp-task-textarea"
              rows={6}
              placeholder={`站在${column.title.slice(0, 5)}立场，围绕争点展开论证：规范依据、事实支撑、论证理由…`}
              aria-label={column.title} value={column.value}
              onChange={(event) => column.setter(event.target.value)}
            />
            <p className="exp-char-hint">{column.value.trim().length} 字{column.value.trim().length < 30 ? ` · 还需 ${30 - column.value.trim().length} 字解锁判断` : ""}</p>
          </div>
        ))}
      </div>

      <div className={`exp-judgment-panel${bothDone ? "" : " locked"}`}>
        <h4>我的判断</h4>
        {bothDone ? (
          <textarea
            className="exp-task-textarea"
            rows={4}
            placeholder="综合双方论证，写出你自己的判断和理由…"
            aria-label="我的判断" value={judgment}
            onChange={(event) => { setJudgment(event.target.value); notify("judgment", event.target.value); }}
          />
        ) : (
          <p className="exp-locked-hint">请先完成双方论证（各至少 30 字），才能解锁此面板。</p>
        )}
      </div>
    </div>
  );
}
