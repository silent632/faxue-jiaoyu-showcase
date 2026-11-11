export class HttpError extends Error {
  constructor(status, code, message, fields) { super(message); Object.assign(this, { status, code, fields }); }
}
export function fail(status, code, message) { throw new HttpError(status, code, message); }
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify({ data }), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN', ...headers } });
}
export async function body(request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) fail(400, 'invalid_body', '请使用有效的表单数据。');
  const reader = request.body?.getReader();
  if (!reader) fail(400, 'invalid_body', '缺少表单数据。');
  let length = 0; const chunks = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    length += value.byteLength;
    if (length > 128 * 1024) { await reader.cancel(); fail(400, 'body_too_large', '内容过长，请缩短后重试。'); }
    chunks.push(value);
  }
  try {
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const result = JSON.parse(new TextDecoder().decode(bytes));
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
    return result;
  } catch { fail(400, 'invalid_body', '无法读取表单数据。'); }
}
export function textField(value, name, min = 1, max = 100) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) fail(400, 'invalid_field', `${name}须为${min}至${max}个字符。`);
  return value.trim();
}
export function onlyFields(data, allowed) {
  if (Object.keys(data).some(key => !allowed.includes(key))) fail(400, 'unknown_field', '表单包含不支持的字段。');
}
export function sameOrigin(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) fail(403, 'origin', '请求来源无效，请刷新页面重试。');
}
export function pagination(url) {
  const page = Math.max(1, Math.floor(Number(url.searchParams.get('page')) || 1));
  const limit = Math.max(1, Math.min(100, Math.floor(Number(url.searchParams.get('limit')) || 20)));
  return { page, limit, offset: (page - 1) * limit };
}
