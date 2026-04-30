#!/usr/bin/env node
import { existsSync } from "node:fs";

import { loadShowcaseCases } from "../lib/showcase-cases.js";
import { normalizePublicFileName, resolvePublicFilePath } from "../lib/data/public-files.js";
import { getShowcaseVideoPeriods } from "../lib/showcase-home-videos.js";

const errors = [];

const cases = await loadShowcaseCases();
for (const item of cases) {
  const pdfFileName = normalizePublicFileName(item.pdfFile);
  if (!pdfFileName) {
    errors.push(`${item.id} has no pdfFile`);
    continue;
  }
  const pdfPath = resolvePublicFilePath("pdfs", pdfFileName);
  if (!existsSync(pdfPath)) {
    errors.push(`${item.id} references missing PDF: ${pdfFileName}`);
  }
}

for (const video of getShowcaseVideoPeriods()) {
  if (video.playerMode === "video" && !/^https?:\/\//u.test(video.sourceHref || "")) {
    errors.push(`${video.slug} has invalid video source: ${video.sourceHref || ""}`);
  }
  if (video.playerMode === "segments") {
    for (const segment of video.segments || []) {
      if (!/^https?:\/\//u.test(segment.href || "")) {
        errors.push(`${video.slug} segment "${segment.label}" has invalid href: ${segment.href || ""}`);
      }
    }
  }
}

if (errors.length) {
  console.error("Asset audit failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Asset audit passed. Checked ${cases.length} cases and ${getShowcaseVideoPeriods().length} video entries.`);
