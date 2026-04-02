const PUBLIC_SHOWCASE_USER = Object.freeze({
  sid: "public-showcase",
  name: "开放浏览",
  roleLabel: "案例研习平台",
});

export function isPublicShowcaseMode() {
  return true;
}

export function getPublicShowcaseUser() {
  return PUBLIC_SHOWCASE_USER;
}
