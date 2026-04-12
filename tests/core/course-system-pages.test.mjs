import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("course system source includes period home and six child routes", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const introSource = readFileSync(new URL("../../app/courses/[slug]/introduction/page.js", import.meta.url), "utf8");
  const materialsSource = readFileSync(new URL("../../app/courses/[slug]/materials/page.js", import.meta.url), "utf8");

  assert.match(homeSource, /periodHome\.cards/u);
  assert.match(homeSource, /本期导读|重点问题|内容展开|材料与案例|学习成果|教学安排/u);
  assert.match(introSource, /course-period-subnav|本期导读/u);
  assert.match(materialsSource, /材料与案例/u);
});

test("public course copy avoids explainer wording after the multi-page split", () => {
  const homeSource = readFileSync(new URL("../../app/courses/[slug]/page.js", import.meta.url), "utf8");
  const contentSource = readFileSync(new URL("../../app/courses/[slug]/content/page.js", import.meta.url), "utf8");

  for (const source of [homeSource, contentSource]) {
    assert.equal(/本页|在这里可以|继续进入|对应查看|系统梳理/u.test(source), false);
  }
});
