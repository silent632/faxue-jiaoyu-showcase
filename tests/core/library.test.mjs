import test from 'node:test';
import assert from 'node:assert/strict';
import { getPublicLibrary, validLibraryHref, validateLibrary } from '../../lib/content/library.js';

const item = { id: 'sample', status: 'published', category: 'legal_exam', title: '复习经验', description: '示例', source: '示例来源', sourceDate: '2025-06-01', permission: '已获许可', reviewer: '示例审阅', reviewedAt: '2026-11-01', href: '/library/sample.pdf', topicIds: ['topic-1'] };

test('资料发布需要完整来源、授权与审阅；公开列表不含内部审核字段', () => {
  assert.deepEqual(validateLibrary({ items: [item] }, ['topic-1']), []);
  const list = getPublicLibrary({ items: [item, { ...item, id: 'pending', status: 'pending' }, { ...item, id: 'withdrawn', status: 'withdrawn' }] });
  assert.equal(list.length, 1); assert.equal(list[0].id, 'sample');
  assert.equal('permission' in list[0], false); assert.equal('reviewer' in list[0], false);
  assert.ok(validateLibrary({ items: [{ ...item, permission: '', reviewedAt: '2026-02-30' }] }, ['topic-1']).length);
  assert.ok(validateLibrary({ items: [item, item] }, ['topic-1']).length);
  assert.ok(validateLibrary({ items: [item] }, []).length);
  assert.ok(validateLibrary({ items: [{ ...item, description: 42 }] }, ['topic-1']).length);
});

test('资料链接限制到安全的站内路径或无凭据的 HTTPS 地址', () => {
  for (const value of ['/library/sample.pdf', '/library/2026/sample-1.pdf', 'https://example.org/material']) assert.equal(validLibraryHref(value), true, value);
  for (const value of ['/library/../private.pdf', '/library/%2e%2e/private.pdf', '/library//file.pdf', '//evil.test', 'javascript:alert(1)', 'http://example.org/', 'https://u:p@example.org/']) assert.equal(validLibraryHref(value), false, value);
});
