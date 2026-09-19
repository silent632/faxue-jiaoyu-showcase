export async function api(path, { method = 'GET', data, csrfToken, signal } = {}) {
  let response;
  try {
    response = await fetch('/api' + path, { method, credentials: 'same-origin', cache: 'no-store', signal, headers: { ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('连接中断，请保留输入并重试。');
  }
  let result;
  try { result = await response.json(); } catch { throw new Error('学习服务暂不可用，请稍后重试。'); }
  if (!response.ok) { const error = new Error(result.error?.message || '操作未完成，请重试。'); Object.assign(error, { status: response.status, code: result.error?.code }); throw error; }
  return result.data;
}
