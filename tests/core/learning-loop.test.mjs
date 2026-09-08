import { completedRecord } from "../fixtures/experiment-records.mjs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveCaseLoopState,
  recommendModulesForCase,
  recommendNextAction,
  summarizeAbilities,
} from "../../lib/learning-loop.js";

const completeDraft = {
  fact: "事".repeat(50),
  issue: "争".repeat(50),
  analysis: "理".repeat(50),
};

test("deriveCaseLoopState covers empty, partial, and closed states", () => {
  assert.deepEqual(deriveCaseLoopState(), {
    studyDone: false,
    studySteps: 0,
    experimentsDone: 0,
    closed: false,
  });

  assert.deepEqual(deriveCaseLoopState({
    studyDraft: { fact: "事".repeat(50), issue: "短", analysis: "" },
    experimentRecords: {},
  }), {
    studyDone: false,
    studySteps: 1,
    experimentsDone: 0,
    closed: false,
  });

  assert.deepEqual(deriveCaseLoopState({
    studyDraft: completeDraft,
    experimentRecords: { "exp-reasoning": completedRecord() },
  }), {
    studyDone: true,
    studySteps: 3,
    experimentsDone: 1,
    closed: true,
  });
});

test("recommendModulesForCase sorts by tag hits and removes zero-hit modules", () => {
  const modules = [
    { id: "a", shortName: "甲", primaryTags: ["x"] },
    { id: "b", shortName: "乙", primaryTags: ["x", "y"] },
    { id: "c", shortName: "丙", primaryTags: ["z"] },
  ];

  assert.deepEqual(
    recommendModulesForCase(["x", "y"], modules).map((item) => [item.id, item.hits]),
    [["b", 2], ["a", 1]],
  );
});

test("summarizeAbilities calculates self-score averages and keeps empty modules", () => {
  const modules = [
    { id: "exp-reasoning", shortName: "甲", skill: "能力甲" },
    { id: "b", shortName: "乙", skill: "能力乙" },
  ];
  const archive = {
    "exp-reasoning": {
      "case-1": completedRecord("exp-reasoning", { selfScores: { one: 3, two: 5 } }),
      "case-2": completedRecord("exp-reasoning", { selfScores: { one: 4, two: 4 } }),
    },
  };

  assert.deepEqual(summarizeAbilities(archive, modules), [
    {
      moduleId: "exp-reasoning",
      shortName: "甲",
      skill: "能力甲",
      completedCount: 2,
      averageScore: 4,
    },
    {
      moduleId: "b",
      shortName: "乙",
      skill: "能力乙",
      completedCount: 0,
      averageScore: null,
    },
  ]);
});

test("recommendNextAction honors the three stated priorities", () => {
  const modules = [{ id: "a" }, { id: "b" }];

  assert.deepEqual(recommendNextAction({
    loopStates: {
      "case-1": {
        studyDone: true,
        experimentsDone: 0,
        recommendedModuleIds: ["b"],
      },
    },
    modules,
  }), {
    kind: "experiment",
    caseId: "case-1",
    moduleId: "b",
  });

  assert.deepEqual(recommendNextAction({
    loopStates: {
      "case-2": {
        studyDone: false,
        experimentsDone: 1,
      },
    },
    modules,
  }), {
    kind: "study",
    caseId: "case-2",
  });

  assert.deepEqual(recommendNextAction({
    loopStates: {
      "case-3": {
        studyDone: true,
        experimentsDone: 1,
        completedModuleIds: ["a"],
      },
    },
    modules,
  }), {
    kind: "module",
    moduleId: "b",
    completedCount: 0,
  });
});
