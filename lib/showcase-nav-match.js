export function isShowcaseNavItemActive(pathname, item) {
  if (item.matchKind === "study") {
    return /^\/cases\/[^/]+\/study\/?$/u.test(pathname);
  }

  if (item.matchKind === "cases") {
    return pathname === "/cases" || /^\/cases\/[^/]+\/?$/u.test(pathname);
  }

  const prefix = item.matchPrefix ?? item.href;

  if (prefix === "/") {
    return pathname === "/";
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
