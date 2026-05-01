import test from "node:test";
import assert from "node:assert/strict";

import { createProjectCreationTracker } from "../src/core/project-creation-tracker.js";

test("project creation tracker increments cumulative total from a single event plus previous state", () => {
  const { projectCreationMetric } = createProjectCreationTracker({
    projectCreationEvent: {
      projectCreationEventId: "project-creation:launch-studio:2026-04-13T10:00:00.000Z",
      userId: "user-1",
      projectId: "launch-studio",
      creationSource: "project-creation",
      timestamp: "2026-04-13T10:00:00.000Z",
    },
    previousProjectCreationMetric: {
      totalProjectsCreated: 2,
    },
  });

  assert.deepEqual(projectCreationMetric, {
    totalProjectsCreated: 3,
  });
});

test("project creation tracker keeps only cumulative total and does not add grouping dimensions", () => {
  const { projectCreationMetric } = createProjectCreationTracker({
    projectCreationEvent: {
      projectCreationEventId: "project-creation:creator-app:2026-04-13T10:05:00.000Z",
      userId: "user-2",
      projectId: "creator-app",
      creationSource: "project-creation",
      timestamp: "2026-04-13T10:05:00.000Z",
    },
    previousProjectCreationMetric: null,
  });

  assert.deepEqual(Object.keys(projectCreationMetric), ["totalProjectsCreated"]);
  assert.equal(Object.hasOwn(projectCreationMetric, "byCreationSource"), false);
  assert.equal(Object.hasOwn(projectCreationMetric, "uniqueCreators"), false);
  assert.equal(projectCreationMetric.totalProjectsCreated, 1);
});
