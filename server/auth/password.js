import bcrypt from 'bcryptjs';
import { fail } from '../http.js';
export async function hashPassword(password) {
  // bcrypt最多处理72字节，明确拒绝截断，初始维护账号不使用可猜测口令。
  if (typeof password !== 'string' || password.length < 12 || new TextEncoder().encode(password).length > 72) fail(400, 'password_length', '密码须至少12个字符，且不超过72字节。');
  return bcrypt.hash(password, 12);
}
export async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || new TextEncoder().encode(password).length > 72) return false;
  return bcrypt.compare(password, hash);
}
export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), value => value.toString(16).padStart(2, '0')).join('');
}
export async function digest(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');
}
