import fs from 'node:fs';
const config = {
  name: 'faxue-local-only',
  compatibility_date: '2026-09-14',
  pages_build_output_dir: './out',
  d1_databases: [{ binding: 'DB', database_name: 'faxue-local', database_id: '00000000-0000-0000-0000-000000000001', migrations_dir: 'migrations' }],
};
// 本文件只生成忽略的本地配置，不覆盖尚未核对的线上 Pages 设置。
if (fs.existsSync('wrangler.jsonc')) {const existing=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'));if(existing.name!=='faxue-local-only')throw new Error('现有配置并非本地专用配置，请使用独立工作目录运行本地准备命令，勿覆盖线上配置。');}
if (!fs.existsSync('wrangler.jsonc')) fs.writeFileSync('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n');
console.log('本地配置已准备；此配置不能用于发布。');
