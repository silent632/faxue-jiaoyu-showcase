export function getPublicStudyActionState() {
  return {
    canSubmit: false,
    canAutosave: false,
    submitMessage: "当前为公开展示模式，不开放真实提交。",
    autosaveMessage: "当前为公开展示模式，不启用自动保存。",
  };
}
