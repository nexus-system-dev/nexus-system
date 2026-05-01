import test from "node:test";
import assert from "node:assert/strict";

import { mapMaintenanceBacklogToRoadmapTasks } from "../src/core/maintenance-task-intake-mapper.js";

test("maintenance task intake mapper dedupes duplicate backlog items and preserves priority order", () => {
  const { maintenanceTasks, mergedTasks } = mapMaintenanceBacklogToRoadmapTasks({
    maintenanceBacklog: {
      maintenanceBacklogId: "maintenance-backlog:test",
      status: "ready",
      items: [
        {
          maintenanceTaskId: "maintenance-backlog:test:duplicate",
          taskType: "ops",
          summary: "Duplicate item",
          requiredCapabilities: ["devops"],
          priority: 50,
          dependencies: [],
        },
        {
          maintenanceTaskId: "maintenance-backlog:test:duplicate",
          taskType: "ops",
          summary: "Duplicate item second copy",
          requiredCapabilities: ["devops"],
          priority: 100,
          dependencies: [],
        },
        {
          maintenanceTaskId: "maintenance-backlog:test:follow-up",
          taskType: "analysis",
          summary: "Follow-up",
          requiredCapabilities: ["devops"],
          priority: 80,
          dependencies: ["maintenance-backlog:test:duplicate"],
        },
      ],
    },
    existingTasks: [],
  });

  assert.deepEqual(
    maintenanceTasks.map((task) => task.id),
    ["maintenance-backlog:test:follow-up", "maintenance-backlog:test:duplicate"],
  );
  assert.equal(maintenanceTasks[0].priority > maintenanceTasks[1].priority, true);
  assert.equal(maintenanceTasks[0].status, "pending");
  assert.equal(mergedTasks.length, 2);
});

test("maintenance task intake mapper skips items already present in roadmap state", () => {
  const { maintenanceTasks, mergedTasks } = mapMaintenanceBacklogToRoadmapTasks({
    maintenanceBacklog: {
      maintenanceBacklogId: "maintenance-backlog:test",
      status: "ready",
      items: [
        {
          maintenanceTaskId: "maintenance-backlog:test:stabilize",
          taskType: "ops",
          summary: "Stabilize",
          requiredCapabilities: ["devops"],
          priority: 100,
          dependencies: [],
        },
      ],
    },
    existingTasks: [
      {
        id: "maintenance-backlog:test:stabilize",
        taskType: "ops",
        lane: "maintenance",
        summary: "Existing task",
        requiredCapabilities: ["devops"],
        successCriteria: [],
        context: {},
        dependencies: [],
        lockKey: "maintenance-stabilize:test",
        assigneeType: "agent",
        status: "done",
        priority: 100,
      },
    ],
  });

  assert.deepEqual(maintenanceTasks, []);
  assert.equal(mergedTasks.length, 1);
});
