import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getShowcaseVideoBySlug, getShowcaseVideoStaticParams } from "../../lib/showcase-home-videos.js";

test("site player dataset exposes static params and hosted video entries", () => {
  const params = getShowcaseVideoStaticParams();
  const period08 = getShowcaseVideoBySlug("course-period-08");
  const period03 = getShowcaseVideoBySlug("course-period-03");

  assert.equal(params.length, 6);
  assert.ok(params.some((item) => item.slug === "course-period-08"));
  assert.ok(params.some((item) => item.slug === "course-period-03"));

  assert.ok(period08);
  assert.equal(period08.external, false);
  assert.equal(period08.href, "/resources/videos/course-period-08");
  assert.match(period08.sourceHref, /vod-qcloud\.com/u);

  assert.ok(period03);
  assert.equal(period03.external, false);
  assert.equal(period03.href, "/resources/videos/course-period-03");
});

test("video player page is exported as a static route with an html5 video element", () => {
  const source = readFileSync(new URL("../../app/resources/videos/[slug]/page.js", import.meta.url), "utf8");

  assert.match(source, /generateStaticParams/u);
  assert.match(source, /getShowcaseVideoStaticParams/u);
  assert.match(source, /getShowcaseVideoBySlug/u);
  assert.match(source, /<video/u);
  assert.match(source, /sourceHref/u);
  assert.match(source, /返回视频中心/u);
});
