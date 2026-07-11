export function isShowcaseNavItemActive(pathname, item) {
  if (item.matchKind === "cases") {
    return pathname === "/cases" || /^\/cases\/.+/u.test(pathname);
  }

  const prefix = item.matchPrefix ?? item.href;

  if (prefix === "/") {
    return pathname === "/";
  }

  if (prefix === "/courses") {
    return pathname.startsWith("/courses") || pathname.startsWith("/resources");
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
