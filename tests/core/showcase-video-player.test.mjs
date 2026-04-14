import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getShowcaseVideoBySlug, getShowcaseVideoStaticParams } from "../../lib/showcase-home-videos.js";

test("site player dataset exposes static params and hosted video entries", () => {
  const params = getShowcaseVideoStaticParams();
  const period01 = getShowcaseVideoBySlug("course-period-01");
  const period05 = getShowcaseVideoBySlug("course-period-05");
  const period08 = getShowcaseVideoBySlug("course-period-08");
  const period03 = getShowcaseVideoBySlug("course-period-03");

  assert.equal(params.length, 8);
  assert.ok(params.some((item) => item.slug === "course-period-01"));
  assert.ok(params.some((item) => item.slug === "course-period-08"));
  assert.ok(params.some((item) => item.slug === "course-period-03"));

  assert.ok(period01);
  assert.equal(period01.external, false);
  assert.equal(period01.href, "/resources/videos/course-period-01");
  assert.equal(period01.playerMode, "segments");
  assert.equal(Array.isArray(period01.segments), true);
  assert.equal(period01.segments.length, 5);
  assert.ok(period01.segments.some((item) => item.label === "第一期下"));
  assert.match(period01.segments.find((item) => item.label === "第一期下").title, /类案检索意义|优先承租权/u);
  assert.match(period01.segments.find((item) => item.label === "第一期下").note, /统一法律适用|司法公信|优先承租权/u);
  assert.equal(period01.segments.some((item) => /非法证据排除规则/u.test(item.title)), false);

  assert.ok(period05);
  assert.match(period05.title, /非法证据排除规则/u);
  assert.match(period05.summary, /程序正义|权利保障/u);

  assert.ok(period08);
  assert.equal(period08.external, false);
  assert.equal(period08.href, "/resources/videos/course-period-08");
  assert.equal(period08.playerMode, "video");
  assert.match(period08.sourceHref, /vod-qcloud\.com/u);

  assert.ok(period03);
  assert.equal(period03.external, false);
  assert.equal(period03.href, "/resources/videos/course-period-03");
  assert.equal(period03.playerMode, "video");
});

test("video player page is exported as a static route with an html5 video element", () => {
  const source = readFileSync(new URL("../../app/resources/videos/[slug]/page.js", import.meta.url), "utf8");

  assert.match(source, /generateStaticParams/u);
  assert.match(source, /getShowcaseVideoStaticParams/u);
  assert.match(source, /getShowcaseVideoBySlug/u);
  assert.match(source, /playerMode/u);
  assert.match(source, /segments/u);
  assert.match(source, /返回视频中心/u);
  assert.match(source, /课程视频成果/u);
});
