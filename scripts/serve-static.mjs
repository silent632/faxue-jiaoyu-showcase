#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".png": "image/png", ".woff2": "font/woff2" };

function pdfByteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/u.exec(header || "");
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (start >= size || start > end) return false;
  return { start, end };
}

async function localExperienceCollection() {
  const ledger = JSON.parse(await readFile(path.join(repoRoot, "output/材料盘点/经验全文核验台账.json"), "utf8"));
  return ledger.filter(row => row["计为经验帖"] !== false && /^[a-f0-9]{16}$/.test(row.id)
    && row["校样文件"] === `${row.id}.pdf` && Number.isInteger(row["页数"]))
    .map(row => ({
      id: row.id,
      title: path.parse(row["本机原件路径"][0]).name,
      href: `/_local-experience/${row.id}.pdf`,
      reading: { pages: row["页数"] },
      localPreview: true,
    }));
}

export function createStaticServer(root = path.join(repoRoot, "out"), { experiencePreview = false } = {}) {
  const base = path.resolve(root);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      const localExperience = pathname.startsWith("/_local-experience/");
      let target = path.resolve(base, `.${pathname}`);
      if (target !== base && !target.startsWith(`${base}${path.sep}`)) { response.writeHead(403).end(); return; }
      if (localExperience) {
        if (!experiencePreview || request.socket.remoteAddress !== "127.0.0.1" ||
            !/^(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(request.headers.host || "") ||
            !["GET", "HEAD"].includes(request.method)) {
          response.writeHead(404).end(); return;
        }
        const collection = await localExperienceCollection();
        if (pathname === "/_local-experience/index.json") {
          response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" })
            .end(request.method === "HEAD" ? undefined : JSON.stringify(collection));
          return;
        }
        const entry = collection.find(item => item.href === pathname);
        if (!entry) { response.writeHead(404).end(); return; }
        target = path.join(repoRoot, "output/pdf/备考经验全文校样", `${entry.id}.pdf`);
      }
      const info = await stat(target);
      if (info.isDirectory()) target = path.join(target, "index.html");
      const file = await stat(target);
      if (!file.isFile()) throw new Error("not-file");
      const extension = path.extname(target);
      const headers = { "Content-Type": types[extension] || "application/octet-stream", "Content-Length": file.size };
      if (localExperience) headers["Cache-Control"] = "no-store";
      const isPdf = extension === ".pdf";
      const range = isPdf && request.method === "GET" ? pdfByteRange(request.headers.range, file.size) : null;
      if (isPdf) headers["Accept-Ranges"] = "bytes";
      if (range === false) {
        response.writeHead(416, { "Content-Range": `bytes */${file.size}` }).end();
        return;
      }
      if (range) {
        headers["Content-Range"] = `bytes ${range.start}-${range.end}/${file.size}`;
        headers["Content-Length"] = range.end - range.start + 1;
      }
      response.writeHead(range ? 206 : 200, headers);
      if (request.method === "HEAD") {
        response.end();
        return;
      }
      const stream = createReadStream(target, range || undefined);
      response.on("close", () => stream.destroy());
      stream.on("error", () => response.destroy()).pipe(response);
    } catch { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("页面或文件不存在"); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3011);
  const server = createStaticServer(undefined, { experiencePreview: process.env.FAXUE_EXPERIENCE_PREVIEW === "1" });
  server.listen(port, "127.0.0.1", () => console.log(`静态预览：http://127.0.0.1:${port}`));
}
