import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

test("course system source includes one dynamic material route instead of six fixed child routes", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const dynamicRouteUrl = new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url);
  const retiredRoutes = [
    new URL("../../app/courses/[slug]/introduction/page.js", import.meta.url),
    new URL("../../app/courses/[slug]/questions/page.js", import.meta.url),
    new URL("../../app/courses/[slug]/content/page.js", import.meta.url),
    new URL("../../app/courses/[slug]/materials/page.js", import.meta.url),
    new URL("../../app/courses/[slug]/outcomes/page.js", import.meta.url),
    new URL("../../app/courses/[slug]/teaching/page.js", import.meta.url),
  ];

  assert.match(homeSource, /materialDirectory|materialPages/u);
  assert.equal(existsSync(dynamicRouteUrl), true);
  if (existsSync(dynamicRouteUrl)) {
    const dynamicRouteSource = readFileSync(dynamicRouteUrl, "utf8");
    assert.match(dynamicRouteSource, /materialSlug/u);
    assert.match(dynamicRouteSource, /materialPages/u);
  }

  for (const routeUrl of retiredRoutes) {
    assert.equal(existsSync(routeUrl), false, `retired route should be removed: ${routeUrl.pathname}`);
  }
});

test("public course copy avoids explainer wording after the material-archive rebuild", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const dynamicRouteUrl = new URL("../../app/courses/[slug]/[materialSlug]/page.js", import.meta.url);
  const dynamicSource = existsSync(dynamicRouteUrl) ? readFileSync(dynamicRouteUrl, "utf8") : "";

  assert.equal(existsSync(dynamicRouteUrl), true);

  for (const source of [homeSource, dynamicSource]) {
    assert.equal(/本页|在这里可以|继续进入|对应查看|系统梳理|页面说明/u.test(source), false);
  }
});
