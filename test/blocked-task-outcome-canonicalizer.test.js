import test from "node:test";
import assert from "node:assert/strict";

import { createBlockedTaskOutcomeCanonicalizer } from "../src/core/blocked-task-outcome-canonicalizer.js";

test("blocked task outcome canonicalizer derives canonical blocked outcomes from execution graph and assignment context", () => {
  const { blockedTaskOutcomes } = createBlockedTaskOutcomeCanonicalizer({
    projectId: "giftwallet",
    roadmap: [
      { id: "task-3", lane: "release", taskType: "deploy" },
    ],
    executionGraph: {
      nodes: [
        { id: "task-3", lane: "release", status: "blocked", blockedBy: ["task-2"] },
      ],
    },
    taskAssignments: [
      {
        taskId: "task-3",
        taskType: "deploy",
        agentId: "ops-agent",
        assignmentEventId: "assign-3",
        timestamp: "2026-01-01T00:03:00.000Z",
      },
    ],
  });

  assert.deepEqual(blockedTaskOutcomes, [
    {
      id: "task.blocked:giftwallet:task-3",
      type: "task.blocked",
      projectId: "giftwallet",
      taskId: "task-3",
      taskType: "deploy",
      lane: "release",
      agentId: "ops-agent",
      assignmentEventId: "assign-3",
      status: "blocked",
      output: null,
      reason: "Task task-3 is blocked by task-2.",
      blockedBy: ["task-2"],
      timestamp: "2026-01-01T00:03:00.000Z",
    },
  ]);
});

test("blocked task outcome canonicalizer preserves explicit runtime blocked events", () => {
  const { blockedTaskOutcomes } = createBlockedTaskOutcomeCanonicalizer({
    runtimeResults: [
      {
        id: "evt-blocked-1",
        type: "task.blocked",
        timestamp: "2026-01-01T00:04:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-4",
          taskType: "qa",
          agentId: "qa-agent",
          assignmentEventId: "assign-4",
          blockedBy: ["task-3"],
          reason: "Waiting for release candidate",
        },
      },
    ],
  });

  assert.equal(blockedTaskOutcomes.length, 1);
  assert.equal(blockedTaskOutcomes[0].id, "evt-blocked-1");
  assert.equal(blockedTaskOutcomes[0].reason, "Waiting for release candidate");
  assert.deepEqual(blockedTaskOutcomes[0].blockedBy, ["task-3"]);
});
