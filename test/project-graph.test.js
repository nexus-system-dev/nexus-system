import test from "node:test";
import assert from "node:assert/strict";

import { buildExecutionGraph, reconcileRoadmap } from "../src/core/project-graph.js";
import { createTask, TaskStatus } from "../src/core/types.js";

function createTasks() {
  return [
    createTask({
      id: "setup",
      lane: "build",
      summary: "Setup",
      requiredCapabilities: ["backend"],
      successCriteria: [],
      context: {},
      lockKey: "setup",
    }),
    createTask({
      id: "auth",
      lane: "build",
      summary: "Auth",
      requiredCapabilities: ["backend"],
      successCriteria: [],
      context: {},
      dependencies: ["setup"],
      lockKey: "auth",
    }),
    createTask({
      id: "campaign",
      lane: "growth",
      summary: "Campaign",
      requiredCapabilities: ["marketing"],
      successCriteria: [],
      context: {},
      dependencies: ["auth"],
      lockKey: "campaign",
    }),
  ];
}

test("execution graph marks tasks as blocked ready running and done", () => {
  const tasks = createTasks();
  tasks[0].status = TaskStatus.READY;
  tasks[1].status = TaskStatus.READY;
  tasks[2].status = TaskStatus.BLOCKED;

  const graph = buildExecutionGraph(tasks, {
    completedTaskIds: new Set(["setup"]),
    activeTaskIds: new Set(["auth"]),
  });

  assert.deepEqual(
    graph.nodes.map((node) => ({ id: node.id, status: node.status })),
    [
      { id: "setup", status: "done" },
      { id: "auth", status: "running" },
      { id: "campaign", status: "blocked" },
    ],
  );
});

test("reconcileRoadmap unlocks dependent tasks after completion", () => {
  const tasks = createTasks();
  tasks[0].status = TaskStatus.DONE;
  tasks[1].status = TaskStatus.BLOCKED;
  tasks[2].status = TaskStatus.BLOCKED;

  const roadmap = reconcileRoadmap(tasks, {
    completedTaskIds: new Set(["setup"]),
  });

  assert.equal(roadmap.find((task) => task.id === "setup").status, TaskStatus.DONE);
  assert.equal(roadmap.find((task) => task.id === "auth").status, TaskStatus.BLOCKED);
  assert.equal(roadmap.find((task) => task.id === "campaign").status, TaskStatus.BLOCKED);
});
