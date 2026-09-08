import test from "node:test";
import assert from "node:assert/strict";
import { normTasks, normRegistry, compareNormSelection, isNormComparisonCurrent } from "../../lib/norm-comparison.js";
import { checkExperimentCompletion } from "../../lib/experiment-completion.js";
import { validInteractions } from "../fixtures/experiment-records.mjs";

test("规范按完整名称区别刑法与刑诉法、各具体司法解释", () => {
  const id = (name) => normRegistry.find((item) => item.name === name).id;
  const result = compareNormSelection([id("中华人民共和国刑法")], [id("中华人民共和国刑事诉讼法")]);
  assert.equal(result.shared.length, 0);
  assert.equal(result.outside.length, 1);
  assert.equal(result.unselected.length, 1);
  assert.equal(normRegistry.some((item) => item.name === "最高人民法院司法解释"), false);
});
test("无依据、旧简称、过期版本及伪造对照不能完成；真实对照可以", () => {
  const valid = validInteractions['exp-norm-retrieval'];
  assert.equal(checkExperimentCompletion('exp-norm-retrieval', valid).complete, true);
  for (const change of [{ caseId: 'constructor', sourceVersion: undefined }, { caseId: 'case-0137' }, { selected: ['刑法'] }, { sourceVersion: 'old' }, { referenceIds: [] }, { compared: false }, { compared: 'true' }]) {
    assert.equal(isNormComparisonCurrent({ ...valid, ...change }), false);
  }
});
test("每个已核对段落的完整名称与参考清单一致", () => {
  for (const task of Object.values(normTasks)) {
    const names = [...task.quote.matchAll(/《([^》]+)》/gu)].map((match) => match[1].replaceAll('<', '〈').replaceAll('>', '〉'));
    assert.deepEqual(new Set(task.referenceIds.map((id) => normRegistry.find((item) => item.id === id).name)), new Set(names));
  }
});
