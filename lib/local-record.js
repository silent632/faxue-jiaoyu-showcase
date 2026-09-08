// 同步记录写入集中处理失败、旧版备份与修订冲突，调用方不得吞掉结果。
export const RECORD_CHANGED_EVENT = "faxue-record-changed";
export const LEGACY_BACKUP_PREFIX = "faxue-backup-v1:";
export const IMPORT_VAULT_KEY = "faxue-import-v1";

// 一次导入只写一个快照，setItem 失败时旧快照原样保留，不存在逐条写入到一半。
// 普通编辑记录优先于导入快照，导入不能覆盖当前草稿。
export function listLocalRecordKeys() {
  if (typeof window === "undefined") return [];
  const keys = new Set();
  try {
    const storage = window.localStorage;
    for (let i = 0; i < storage.length; i += 1) keys.add(storage.key(i));
    const vault = readLocalRecord(IMPORT_VAULT_KEY);
    if (vault.ok) for (const key of Object.keys(vault.record?.records || {})) keys.add(key);
  } catch { /* 返回仍可读取的索引。 */ }
  return [...keys].filter(Boolean);
}

export function storageErrorCode(error) {
  return error?.name === "QuotaExceededError" ? "quota" : "unavailable";
}

export function storageErrorMessage(code) {
  return ({
    quota: "浏览器存储空间不足，内容仍在当前页面，请先导出备份。",
    conflict: "另一页面已更新这份记录。当前输入已保留，请导出后再读取最新记录。",
    corrupt: "本地记录无法读取，原数据已保留。请导出当前内容，勿覆盖旧记录。",
    unavailable: "浏览器未能保存内容。当前输入仍在，请导出备份。",
  })[code] || "保存未成功，请导出当前内容后重试。";
}

export function recordRevision(record) {
  return record == null ? null : record.revision || JSON.stringify(record);
}

export function readLocalRecord(key) {
  try {
    if (typeof window === "undefined") return { ok: true, record: null, raw: null };
    let raw = window.localStorage.getItem(key);
    if (raw === null && key !== IMPORT_VAULT_KEY) {
      const vault = readLocalRecord(IMPORT_VAULT_KEY);
      if (!vault.ok) return vault;
      const imported = vault.record?.records;
      if (imported && Object.hasOwn(imported, key)) raw = JSON.stringify(imported[key]);
    }
    if (raw === null) return { ok: true, record: null, raw: null };
    let record;
    try { record = JSON.parse(raw); } catch { return { ok: false, errorCode: "corrupt", raw }; }
    if (!record || typeof record !== "object" || Array.isArray(record)) return { ok: false, errorCode: "corrupt", raw };
    return { ok: true, record, raw };
  } catch (error) {
    return { ok: false, errorCode: storageErrorCode(error) };
  }
}

export function notifyRecordChanged(key) {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent !== "undefined") {
    window.dispatchEvent(new CustomEvent(RECORD_CHANGED_EVENT, { detail: { key } }));
  }
}

export function subscribeRecords(callback) {
  if (typeof window === "undefined") return () => {};
  const listener = (event) => {
    const key = event.key ?? event.detail?.key ?? null;
    callback(key === IMPORT_VAULT_KEY ? null : key);
  };
  window.addEventListener("storage", listener);
  window.addEventListener(RECORD_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(RECORD_CHANGED_EVENT, listener);
  };
}

export function writeLocalRecord(key, value, { expectedRevision, backupLegacy = true } = {}) {
  if (typeof window === "undefined") return { ok: false, errorCode: "unavailable" };
  const current = readLocalRecord(key);
  if (!current.ok) return current;
  if (expectedRevision !== undefined && recordRevision(current.record) !== expectedRevision) {
    return { ok: false, errorCode: "conflict" };
  }
  try {
    const storage = window.localStorage;
    if (backupLegacy && current.record && current.record.version !== 2) {
      const backupKey = `${LEGACY_BACKUP_PREFIX}${key}`;
      if (storage.getItem(backupKey) === null) storage.setItem(backupKey, current.raw);
    }
    const savedAt = Date.now();
    const record = { ...value, version: 2, revision: globalThis.crypto?.randomUUID?.() || `${savedAt}-${Math.random()}`, ts: savedAt, updatedAt: new Date(savedAt).toISOString() };
    const raw = JSON.stringify(record);
    storage.setItem(key, raw);
    if (storage.getItem(key) !== raw) return { ok: false, errorCode: "conflict" };
    // 异步通知同页订阅者，保证调用方先接收自己的新修订号。
    queueMicrotask(() => notifyRecordChanged(key));
    return { ok: true, savedAt, record };
  } catch (error) {
    return { ok: false, errorCode: storageErrorCode(error) };
  }
}
