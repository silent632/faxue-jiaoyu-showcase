import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildShowcaseVideoPeriod,
  getShowcaseVideoBySlug,
  getShowcaseVideoStaticParams,
} from "../../lib/showcase-home-videos.js";

const PERIOD_05_EXPECTED_SOURCE =
  "https://1409009022.vod-qcloud.com/83d5ffe5vodtranscq1409009022/2af44ff05145403719796872346/v.f100040.mp4";

function assertVideoDeliveryShape(item) {
  assert.ok(item);
  assert.ok(["segments", "video"].includes(item.playerMode));
  assert.equal(Array.isArray(item.segments), true);

  if (item.playerMode === "segments") {
    assert.equal(item.segments.length > 0, true);
    assert.equal(item.sourceHref, null);
    return;
  }

  assert.equal(item.segments.length, 0);
  assert.match(item.sourceHref, /^https?:\/\//u);
}

test("direct video source takes precedence over leftover segment links", () => {
  const item = buildShowcaseVideoPeriod({
    slug: "demo-period",
    period: "演示期次",
    title: "演示标题",
    theme: "演示主题",
    stageTag: "演示标签",
    phaseLabel: "演示阶段",
    module: "演示模块",
    summary: "演示摘要",
    purpose: "演示说明",
    sourceHref: "https://example.com/demo.mp4",
    segments: [{ label: "演示片段", title: "演示片段", href: "https://example.com/seg", external: true, note: "片段说明" }],
  });

  assert.equal(item.playerMode, "video");
  assert.equal(item.sourceHref, "https://example.com/demo.mp4");
  assert.deepEqual(item.segments, []);
});

test("site player dataset exposes static params and hosted video entries", () => {
  const params = getShowcaseVideoStaticParams();
  const period01 = getShowcaseVideoBySlug("course-period-01");
  const period02 = getShowcaseVideoBySlug("course-period-02");
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
  assertVideoDeliveryShape(period01);

  if (period01.playerMode === "segments") {
    assert.equal(period01.segments.length, 5);
    assert.ok(period01.segments.some((item) => item.label === "第一期下"));
    assert.match(period01.segments.find((item) => item.label === "第一期下").title, /类案检索意义|优先承租权/u);
    assert.match(period01.segments.find((item) => item.label === "第一期下").note, /统一法律适用|司法公信|优先承租权/u);
    assert.equal(period01.segments.some((item) => /非法证据排除规则/u.test(item.title)), false);
  }

  assert.equal(period02.href, "/resources/videos/course-period-02");
  assertVideoDeliveryShape(period02);

  assert.ok(period05);
  assert.match(period05.title, /非法证据排除规则/u);
  assert.match(period05.summary, /程序正义|权利保障/u);
  assertVideoDeliveryShape(period05);
  assert.equal(period05.sourceHref, PERIOD_05_EXPECTED_SOURCE);

  assert.ok(period08);
  assert.equal(period08.external, false);
  assert.equal(period08.href, "/resources/videos/course-period-08");
  assertVideoDeliveryShape(period08);

  assert.ok(period03);
  assert.equal(period03.external, false);
  assert.equal(period03.href, "/resources/videos/course-period-03");
  assertVideoDeliveryShape(period03);
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
