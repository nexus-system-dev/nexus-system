import test from "node:test";
import assert from "node:assert/strict";

import { createProjectCreationAggregationModule } from "../src/core/project-creation-aggregation-module.js";

test("project creation aggregation module groups project creation events by day user and creation source", () => {
  const { projectCreationSummary } = createProjectCreationAggregationModule({
    projectCreationEvents: [
      {
        projectCreationEventId: "project-creation:alpha:2026-04-13T10:00:00.000Z",
        userId: "user-1",
        projectId: "alpha",
        creationSource: "project-creation",
        timestamp: "2026-04-13T10:00:00.000Z",
      },
      {
        projectCreationEventId: "project-creation:beta:2026-04-13T11:00:00.000Z",
        userId: "user-1",
        projectId: "beta",
        creationSource: "project-creation",
        timestamp: "2026-04-13T11:00:00.000Z",
      },
      {
        projectCreationEventId: "project-creation:gamma:2026-04-14T09:00:00.000Z",
        userId: "user-2",
        projectId: "gamma",
        creationSource: "assisted-import",
        timestamp: "2026-04-14T09:00:00.000Z",
      },
    ],
    projectCreationMetric: {
      totalProjectsCreated: 3,
    },
  });

  assert.deepEqual(projectCreationSummary, {
    totalProjectsCreated: 3,
    byDay: {
      "2026-04-13": 2,
      "2026-04-14": 1,
    },
    byUser: {
      "user-1": 2,
      "user-2": 1,
    },
    byCreationSource: {
      "project-creation": 2,
      "assisted-import": 1,
    },
  });
});

test("project creation aggregation module uses tracker total only as reference total", () => {
  const { projectCreationSummary } = createProjectCreationAggregationModule({
    projectCreationEvents: [
      {
        projectCreationEventId: "project-creation:alpha:2026-04-13T10:00:00.000Z",
        userId: "user-1",
        projectId: "alpha",
        creationSource: "project-creation",
        timestamp: "2026-04-13T10:00:00.000Z",
      },
    ],
    projectCreationMetric: {
      totalProjectsCreated: 5,
    },
  });

  assert.equal(projectCreationSummary.totalProjectsCreated, 5);
  assert.deepEqual(projectCreationSummary.byDay, {
    "2026-04-13": 1,
  });
  assert.deepEqual(projectCreationSummary.byUser, {
    "user-1": 1,
  });
  assert.deepEqual(projectCreationSummary.byCreationSource, {
    "project-creation": 1,
  });
});

test("project creation aggregation module returns empty grouped summaries when no events exist", () => {
  const { projectCreationSummary } = createProjectCreationAggregationModule({
    projectCreationEvents: [],
    projectCreationMetric: {
      totalProjectsCreated: 0,
    },
  });

  assert.deepEqual(projectCreationSummary, {
    totalProjectsCreated: 0,
    byDay: {},
    byUser: {},
    byCreationSource: {},
  });
});
