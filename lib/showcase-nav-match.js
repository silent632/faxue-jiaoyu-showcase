export function isShowcaseNavItemActive(pathname, item) {
  pathname = pathname.replace(/\/+$/, "") || "/";
  if (item.matchKind === "cases") {
    return pathname === "/cases" || /^\/cases\/.+/u.test(pathname);
  }

  const prefix = item.matchPrefix ?? item.href;

  if (prefix === "/") {
    return pathname === "/";
  }

  if (prefix === "/courses") {
    return /^\/(courses|experiments)(\/|$)/u.test(pathname) || (pathname === "/resources" || /^\/resources\/videos(\/|$)/u.test(pathname));
  }

  if (prefix === "/resources/learning") {
    return /^\/(community|help|resources\/(learning|library))(\/|$)/u.test(pathname);
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
