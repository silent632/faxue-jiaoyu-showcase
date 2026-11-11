import test from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '../../app/sitemap.js';
import { getCoursePackagePeriods } from '../../lib/course-package.js';
import { getShowcaseVideoStaticParams } from '../../lib/showcase-home-videos.js';

test('站点地图覆盖实际课程材料和视频且不重复', async () => {
  const urls = (await sitemap()).map(item => new URL(item.url).pathname);
  assert.equal(new Set(urls).size, urls.length);
  for (const period of getCoursePackagePeriods()) for (const page of period.materialPages) assert.ok(urls.includes(`/courses/${period.slug}/${page.slug}/`));
  for (const video of getShowcaseVideoStaticParams()) assert.ok(urls.includes(`/resources/videos/${video.slug}/`));
});
