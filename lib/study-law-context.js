// 节点与案号只控制站内回程，不影响阅读权限或草稿归属。
function listedReturn(query) {
  const target = query.get("returnTo") || "";
  return target.startsWith("/cases/?") && target.length <= 2000 && !/[\u0000-\u001f\\#]/u.test(target)
    ? target
    : "";
}

const contextFields = {
  course: /^course-period-0[1-8]$/,
  topic: /^[a-z0-9-]{1,80}$/,
  origin: /^(course|topic|archive|study)$/,
};

export function studyContextHref(href, search) {
  const query = new URLSearchParams(search);
  const base = "https://learning.invalid";
  const url = new URL(href, base);
  if (url.origin !== base) return href;
  const previous = listedReturn(query);
  if (previous) url.searchParams.set("returnTo", previous);
  for (const [field, pattern] of Object.entries(contextFields)) {
    const value = query.get(field);
    if (!url.searchParams.has(field) && value && pattern.test(value)) url.searchParams.set(field, value);
  }
  return url.pathname + url.search + url.hash;
}

export function caseOrigin(search) {
  const query = new URLSearchParams(search);
  const course = query.get("course");
  const topic = query.get("topic");
  const origin = query.get("origin");
  if (origin === "course" && contextFields.course.test(course || "")) {
    return { href: `/courses/${course}/`, label: "← 返回本期课程" };
  }
  if (origin === "archive") return { href: "/archive/", label: "← 返回研习档案" };
  const previous = listedReturn(query);
  if (previous) return { href: previous, label: "← 返回案例检索" };
  if (contextFields.topic.test(topic || "")) return { href: `/knowledge/#${topic}`, label: "← 返回法理知识" };
  return { href: "/cases/", label: "← 返回案例检索" };
}

export function studyLawReturn(search, caseIds) {
  const caseId = new URLSearchParams(search).get("fromCase");
  if (!caseIds.includes(caseId)) return "";
  return studyContextHref(`/cases/${caseId}/study/`, search);
}
