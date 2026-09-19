export function isShowcaseNavItemActive(pathname, item) {
  if (item.matchKind === "cases") {
    return pathname === "/cases" || /^\/cases\/.+/u.test(pathname);
  }

  const prefix = item.matchPrefix ?? item.href;

  if (prefix === "/") {
    return pathname === "/";
  }

  if (prefix === "/courses") {
    return pathname.startsWith("/courses") || (pathname === "/resources" || pathname.startsWith("/resources/videos"));
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
