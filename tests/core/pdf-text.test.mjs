import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { findPdfText, formatPdfCitation, getPdfPageFromHash } from "../../lib/pdf-text.js";

test("PDF 查找能跨文字片段和换行，且返回原文字层索引", () => {
  const result = findPdfText(["依照中华", "人民共和 国", "刑法。", "中华人民共和国", "刑法"], "中华人民共和国刑法");
  assert.equal(result.count, 2);
  assert.deepEqual(result.indexes, [0, 1, 2, 3, 4]);
  assert.equal(findPdfText(["任意文本"], "   ").count, 0);
  assert.equal(findPdfText(["ABC", "def"], "cD").count, 1);
});
test("引用页码不接受其他锚点，复制包含案号及物理页", () => {
  assert.equal(getPdfPageFromHash("#page=14"), 14);
  assert.equal(getPdfPageFromHash("#case-preview", 3), 3);
  assert.equal(getPdfPageFromHash("#page=-2"), 1);
  assert.equal(formatPdfCitation("原文", "(2020)测试1号", 14), "原文\n（(2020)测试1号，PDF 第 14 页）");
});
test("公开 PDF worker 与当前安装的 PDF.js 完全一致", () => {
  const digest = (name) => createHash("sha256").update(readFileSync(new URL(name, import.meta.url))).digest("hex");
  // 仓库使用同版本的标准 worker，阅读端使用带兼容补丁的 legacy API。
  assert.equal(digest("../../public/pdf.worker.min.mjs"), digest("../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs"));
});
