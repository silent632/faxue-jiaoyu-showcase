import { mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// 在仓库锁定的 Wrangler 版本中编译 Functions，避免托管环境的旧版解析器不支持新语法。
const temp = mkdtempSync(join(tmpdir(), 'faxue-pages-worker-'));
try {
  execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'pages', 'functions', 'build', 'functions', '--outdir', temp, '--output-routes-path', 'out/_routes.json'], { stdio: 'inherit' });
  copyFileSync(join(temp, 'index.js'), 'out/_worker.js');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
