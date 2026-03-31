import test from "node:test";
import assert from "node:assert/strict";

import { createWorkspaceComputeUsageTracker } from "../src/core/workspace-compute-usage-tracker.js";

test("workspace compute usage tracker uses durationMs when it exists", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      durationMs: 120000,
      startedAt: "2025-01-01T00:00:00.000Z",
      completedAt: "2025-01-01T00:02:00.000Z",
    },
  });

  assert.equal(workspaceComputeMetric.runtimeDurationMs, 120000);
  assert.equal(workspaceComputeMetric.quantity, 2);
  assert.equal(workspaceComputeMetric.unit, "workspace-minute");
  assert.equal(workspaceComputeMetric.usageType, "workspace");
  assert.equal(workspaceComputeMetric.source, "platform-observability");
});

test("workspace compute usage tracker falls back to startedAt and completedAt", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      startedAt: "2025-01-01T00:00:00.000Z",
      completedAt: "2025-01-01T00:03:00.000Z",
    },
  });

  assert.equal(workspaceComputeMetric.runtimeDurationMs, 180000);
  assert.equal(workspaceComputeMetric.quantity, 3);
  assert.equal(workspaceComputeMetric.source, "platform-observability");
});

test("workspace compute usage tracker falls back to null instead of zero when no runtime data exists", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
      commandRuntime: {
        commandCount: 4,
      },
      logs: [
        {
          message: "workspace activity observed",
        },
      ],
    },
  });

  assert.equal(workspaceComputeMetric.runtimeDurationMs, null);
  assert.equal(workspaceComputeMetric.quantity, null);
  assert.equal(workspaceComputeMetric.cpuUsage, null);
  assert.equal(workspaceComputeMetric.ramUsage, null);
  assert.equal(workspaceComputeMetric.activeWorkspaceWindows, null);
  assert.equal(workspaceComputeMetric.source, "cloud-workspace-model");
});

test("workspace compute usage tracker drops negative direct durations instead of returning invalid runtime", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      durationMs: -500,
      startedAt: "2025-01-01T00:00:00.000Z",
      completedAt: "2025-01-01T00:02:00.000Z",
    },
  });

  assert.equal(workspaceComputeMetric.runtimeDurationMs, 120000);
  assert.equal(workspaceComputeMetric.quantity, 2);
  assert.equal(workspaceComputeMetric.source, "platform-observability");
});

test("workspace compute usage tracker drops negative timestamp durations instead of returning invalid runtime", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      startedAt: "2025-01-01T00:03:00.000Z",
      completedAt: "2025-01-01T00:00:00.000Z",
    },
  });

  assert.equal(workspaceComputeMetric.runtimeDurationMs, null);
  assert.equal(workspaceComputeMetric.quantity, null);
  assert.equal(workspaceComputeMetric.source, "cloud-workspace-model");
});

test("workspace compute usage tracker does not treat invalid timestamps as observability-backed duration", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      startedAt: "abc",
      completedAt: "xyz",
    },
  });

  assert.equal(workspaceComputeMetric.runtimeDurationMs, null);
  assert.equal(workspaceComputeMetric.quantity, null);
  assert.notEqual(workspaceComputeMetric.source, "platform-observability");
  assert.equal(workspaceComputeMetric.source, "cloud-workspace-model");
});

test("workspace compute usage tracker uses derived fallback when no sources exist", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker();

  assert.equal(workspaceComputeMetric.source, "derived");
  assert.equal(typeof workspaceComputeMetric.recordedAt, "string");
});

test("workspace compute usage tracker applies full source precedence", () => {
  const durationBacked = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      durationMs: 30000,
    },
  }).workspaceComputeMetric;

  const timestampBacked = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      startedAt: "2025-01-01T00:00:00.000Z",
      completedAt: "2025-01-01T00:01:00.000Z",
    },
  }).workspaceComputeMetric;

  const workspaceBacked = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
  }).workspaceComputeMetric;

  const derived = createWorkspaceComputeUsageTracker().workspaceComputeMetric;

  assert.equal(durationBacked.source, "platform-observability");
  assert.equal(timestampBacked.source, "platform-observability");
  assert.equal(workspaceBacked.source, "cloud-workspace-model");
  assert.equal(derived.source, "derived");
});

test("workspace compute usage tracker remains directly consumable by platform cost schema", () => {
  const { workspaceComputeMetric } = createWorkspaceComputeUsageTracker({
    cloudWorkspaceModel: {
      workspaceId: "cloud-workspace:giftwallet",
      projectId: "giftwallet",
    },
    platformTrace: {
      durationMs: 60000,
    },
  });

  assert.equal(workspaceComputeMetric.usageType, "workspace");
  assert.equal(workspaceComputeMetric.unit, "workspace-minute");
  assert.equal(typeof workspaceComputeMetric.quantity, "number");
});
