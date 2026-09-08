# 内容来源与维护

- `courses/course-period-01.json` 至 `08.json`：八期正文与 learningTask；任务关联专属量规、案例和实验。修改任务会产生新版本。
- `site.json`：公开叙事和指标；无原始统计证据的指标保持 unverified，不填演示数字。
- `experiments.json`、`videos.json`、`jurisprudence-tags.json`：模块、媒体与教学标签。
- `case-evidence.json`：210 篇日期核查。`case-field-corrections.json`：其他字段修正的旧值与原文证据。`case-field-audit.json`：首页显式元数据的核查范围与结果。
- `norm-availability.json`：75 个候选的启用或排除依据；不是全文法条已审核的证明。
- `copy-policy.json`：公开文案规则。必要的来源限制、存储失败提示应如实表达。

案例展示源为 `data/generated/cases-extracted.json`。规范、批注、量规的单一结构入口分别为 `lib/norm-evidence-data.js`、`lib/annotation-evidence-data.js`、`lib/case-rubric-data.js`，对应校验器在 `lib/content/`。

保留 ID、slug 和旧记录；PDF 改动须重新核对指纹、物理页、引文与版本。教学提炼不得冒充裁判原话或教师已审定意见。具体核验命令和剩余证据事项见根目录 PROGRESS.md。
