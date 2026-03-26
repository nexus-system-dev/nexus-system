import test from "node:test";
import assert from "node:assert/strict";

import { defineBottleneckSchema } from "../src/core/bottleneck-schema.js";

test("bottleneck schema prioritizes failed task blockers", () => {
  const { bottleneckState } = defineBottleneckSchema({
    projectState: {
      projectId: "giftwallet",
    },
    executionGraph: {
      nodes: [{ id: "task-2", status: "blocked", blockedBy: ["task-1"] }],
    },
    taskResults: [
      { taskId: "task-9", status: "failed", reason: "Build failed" },
    ],
  });

  assert.equal(bottleneckState.blockerType, "failed-task");
  assert.equal(bottleneckState.severity, "high");
  assert.equal(bottleneckState.reason, "Build failed");
});

test("bottleneck schema falls back to graph blocker when no failure exists", () => {
  const { bottleneckState } = defineBottleneckSchema({
    projectState: {
      projectId: "giftwallet",
    },
    executionGraph: {
      nodes: [{ id: "task-2", lane: "release", status: "blocked", blockedBy: ["task-1"] }],
    },
    taskResults: [],
  });

  assert.equal(bottleneckState.blockerType, "graph-blocker");
  assert.equal(bottleneckState.affectedFlow, "release");
  assert.equal(bottleneckState.summary.blockerCount, 1);
});

test("bottleneck schema returns no blocker when project is clear", () => {
  const { bottleneckState } = defineBottleneckSchema({
    projectState: {
      projectId: "giftwallet",
      observed: {
        health: {
          blockers: [],
        },
      },
    },
    executionGraph: {
      nodes: [{ id: "task-1", status: "done" }],
    },
    taskResults: [],
  });

  assert.equal(bottleneckState.blockerType, "none");
  assert.equal(bottleneckState.summary.isBlocked, false);
});
