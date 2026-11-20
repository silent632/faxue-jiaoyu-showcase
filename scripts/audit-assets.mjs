#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import readingSources from "../content/case-reading-sources.json" with { type: "json" };

import { loadShowcaseCases } from "../lib/showcase-cases.js";
import { normalizePublicFileName, resolvePublicFilePath } from "../lib/data/public-files.js";
import { getShowcaseVideoPeriods } from "../lib/showcase-home-videos.js";

const errors = [];

const cases = await loadShowcaseCases();
const caseIds = new Set(cases.map(item => item.id));
for (const id of Object.keys(readingSources)) {
  if (!caseIds.has(id)) errors.push(`${id} has a reading source but no case record`);
}
const knownKinds = new Set(["article", "collection", "decision", "document", "release"]);
for (const item of cases) {
  const pdfFileName = normalizePublicFileName(item.pdfFile);
  if (!pdfFileName) {
    errors.push(`${item.id} has no pdfFile`);
    continue;
  }
  const pdfPath = resolvePublicFilePath("pdfs", pdfFileName);
  if (!existsSync(pdfPath)) {
    errors.push(`${item.id} references missing PDF: ${pdfFileName}`);
    continue;
  }
  const source = readingSources[item.id];
  if (source?.file !== pdfFileName || !Number.isInteger(source.pages) || source.pages < 1 || !knownKinds.has(source.kind)) {
    errors.push(`${item.id} has invalid PDF reading metadata`);
    continue;
  }
  if (createHash("sha256").update(readFileSync(pdfPath)).digest("hex") !== source.sha256) {
    errors.push(`${item.id} PDF fingerprint differs from the reading source`);
  }
  const transcriptPath = resolvePublicFilePath("case-text", `${item.id}.json`);
  try {
    const transcript = JSON.parse(readFileSync(transcriptPath, "utf8"));
    if (transcript.sha256 !== source.sha256 || !Array.isArray(transcript.pages) ||
        transcript.pages.length !== source.pages || transcript.pages.some(page => typeof page !== "string")) {
      errors.push(`${item.id} has invalid text transcript metadata`);
      continue;
    }
    transcript.pages.forEach((page, index) => {
      if (!page.trim() && !existsSync(resolvePublicFilePath("case-text", `${item.id}-${index + 1}.png`))) {
        errors.push(`${item.id} page ${index + 1} has neither text nor an image`);
      }
    });
  } catch {
    errors.push(`${item.id} has no readable text transcript`);
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
