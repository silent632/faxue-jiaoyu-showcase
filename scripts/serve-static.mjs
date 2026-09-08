#!/usr/bin/env node
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const types = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".png": "image/png", ".woff2": "font/woff2" };

export function createStaticServer(root = path.join(repoRoot, "out")) {
  const base = path.resolve(root);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const filePath = path.resolve(base, `.${decodeURIComponent(url.pathname)}`);
      if (filePath !== base && !filePath.startsWith(`${base}${path.sep}`)) { response.writeHead(403).end(); return; }
      let target = filePath;
      const info = await stat(target);
      if (info.isDirectory()) target = path.join(target, "index.html");
      const file = await stat(target);
      if (!file.isFile()) throw new Error("not-file");
      response.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream", "Content-Length": file.size });
      if (request.method === "HEAD") response.end();
      else createReadStream(target).on("error", () => response.destroy()).pipe(response);
    } catch { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("页面或文件不存在"); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3011);
  const server = createStaticServer();
  server.listen(port, "127.0.0.1", () => console.log(`静态预览：http://127.0.0.1:${port}`));
}
