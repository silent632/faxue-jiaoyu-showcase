const PUBLIC_SHOWCASE_USER = Object.freeze({
  sid: "public-showcase",
  name: "公开展示访客",
  roleLabel: "公开展示模式",
});

export function isPublicShowcaseMode() {
  return true;
}

export function getPublicShowcaseUser() {
  return PUBLIC_SHOWCASE_USER;
}
