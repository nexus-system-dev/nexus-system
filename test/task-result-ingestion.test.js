import test from "node:test";
import assert from "node:assert/strict";

import { ingestTaskResults } from "../src/core/task-result-ingestion.js";

test("task result ingestion produces canonical task results from supported runtime events", () => {
  const ingested = ingestTaskResults({
    runtimeResults: [
      null,
      {
        id: "evt-ignored",
        type: "task.assigned",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-0",
        },
      },
      {
        id: "evt-3",
        type: "task.failed",
        timestamp: "2026-01-01T00:03:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-2",
          taskType: "qa",
          agentId: "qa-agent",
          assignmentEventId: "assign-2",
          reason: "tests failed",
        },
      },
      {
        id: "evt-1",
        type: "task.completed",
        timestamp: "2026-01-01T00:01:00.000Z",
        payload: {
          projectId: "giftwallet",
          task: {
            id: "task-1",
            taskType: "backend",
          },
          taskId: "task-1",
          agentId: "dev-agent",
          assignmentEventId: "assign-1",
          output: {
            filesChanged: 2,
          },
        },
      },
      {
        id: "evt-2",
        type: "task.retried",
        timestamp: "2026-01-01T00:02:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-2",
          task: {
            taskType: "qa",
          },
          agentId: "qa-agent",
          assignmentEventId: "assign-2",
        },
      },
      {
        id: "evt-4",
        type: "task.blocked",
        timestamp: "2026-01-01T00:04:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-3",
          taskType: "release",
          agentId: "ops-agent",
          assignmentEventId: "assign-3",
          blockedBy: ["task-2"],
          reason: "waiting on qa",
        },
      },
    ],
  });

  assert.deepEqual(
    ingested.taskResults.map((result) => ({
      id: result.id,
      status: result.status,
      taskId: result.taskId,
      taskType: result.taskType,
    })),
    [
      {
        id: "evt-1",
        status: "completed",
        taskId: "task-1",
        taskType: "backend",
      },
      {
        id: "evt-2",
        status: "retried",
        taskId: "task-2",
        taskType: "qa",
      },
      {
        id: "evt-3",
        status: "failed",
        taskId: "task-2",
        taskType: "qa",
      },
      {
        id: "evt-4",
        status: "blocked",
        taskId: "task-3",
        taskType: "release",
      },
    ],
  );
  assert.deepEqual(
    ingested.transitionEvents.map((event) => ({
      eventId: event.eventId,
      status: event.status,
      taskId: event.taskId,
      assignmentEventId: event.assignmentEventId,
      blockedBy: event.blockedBy,
    })),
    [
      {
        eventId: "evt-1",
        status: "completed",
        taskId: "task-1",
        assignmentEventId: "assign-1",
        blockedBy: [],
      },
      {
        eventId: "evt-2",
        status: "retried",
        taskId: "task-2",
        assignmentEventId: "assign-2",
        blockedBy: [],
      },
      {
        eventId: "evt-3",
        status: "failed",
        taskId: "task-2",
        assignmentEventId: "assign-2",
        blockedBy: [],
      },
      {
        eventId: "evt-4",
        status: "blocked",
        taskId: "task-3",
        assignmentEventId: "assign-3",
        blockedBy: ["task-2"],
      },
    ],
  );
});

test("task result ingestion ignores malformed runtime results that cannot produce canonical task outputs", () => {
  const ingested = ingestTaskResults({
    runtimeResults: [
      {
        id: "evt-no-task-id",
        type: "task.completed",
        timestamp: "2026-01-01T00:00:00.000Z",
        payload: {
          projectId: "giftwallet",
        },
      },
      {
        id: "evt-no-project-id",
        type: "task.failed",
        timestamp: "2026-01-01T00:01:00.000Z",
        payload: {
          taskId: "task-1",
          reason: "missing project",
        },
      },
      {
        type: "task.retried",
        timestamp: "2026-01-01T00:02:00.000Z",
        payload: {
          projectId: "giftwallet",
          taskId: "task-2",
          taskType: "backend",
        },
      },
      "not-an-event",
    ],
  });

  assert.equal(ingested.taskResults.length, 1);
  assert.deepEqual(ingested.taskResults[0], {
    id: "task.retried:giftwallet:task-2",
    type: "task.retried",
    projectId: "giftwallet",
    taskId: "task-2",
    taskType: "backend",
    agentId: null,
    assignmentEventId: null,
    status: "retried",
    output: null,
    reason: null,
    blockedBy: [],
    timestamp: "2026-01-01T00:02:00.000Z",
  });
});
