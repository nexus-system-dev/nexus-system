import test from "node:test";
import assert from "node:assert/strict";

import { createStorageAndArtifactCostTracker } from "../src/core/storage-and-artifact-cost-tracker.js";
import { definePlatformUsageCostSchema } from "../src/core/platform-usage-cost-schema.js";

test("storage cost tracker calculates quantity from attachment volume and lifecycle window", () => {
  const { storageCostMetric } = createStorageAndArtifactCostTracker({
    storageRecord: {
      storageRecordId: "storage:giftwallet:project",
      projectId: "giftwallet",
      workspaceId: "workspace-1",
      retentionPolicy: "project-lifecycle",
      recordedAt: "2025-01-01T00:00:00.000Z",
      attachments: [
        { attachmentId: "a1", size: 1024 ** 3 },
      ],
    },
    retentionWindow: {
      deleteAfterDays: 60,
    },
  });

  assert.equal(storageCostMetric.usageType, "storage");
  assert.equal(storageCostMetric.unit, "gb-month");
  assert.equal(storageCostMetric.attachmentVolumeGb, 1);
  assert.equal(storageCostMetric.lifecycleWindowDays, 60);
  assert.equal(storageCostMetric.quantity, 2);
  assert.equal(storageCostMetric.source, "file-artifact-storage-module");
});

test("storage cost tracker keeps quantity null when attachments lack size", () => {
  const { storageCostMetric } = createStorageAndArtifactCostTracker({
    storageRecord: {
      storageRecordId: "storage:giftwallet:project",
      projectId: "giftwallet",
      attachments: [
        { attachmentId: "a1", size: null },
      ],
      artifacts: [
        { storageItemId: "artifact:1" },
      ],
      retentionPolicy: "project-lifecycle",
    },
    retentionWindow: {
      deleteAfterDays: 180,
    },
  });

  assert.equal(storageCostMetric.attachmentVolumeGb, null);
  assert.equal(storageCostMetric.quantity, null);
  assert.equal(storageCostMetric.artifactVolumeGb, null);
  assert.equal(storageCostMetric.logVolumeGb, null);
  assert.equal(storageCostMetric.snapshotVolumeGb, null);
  assert.match(storageCostMetric.summary, /could not resolve any billable storage volume/i);
});

test("storage cost tracker keeps quantity null when lifecycle window is missing", () => {
  const { storageCostMetric } = createStorageAndArtifactCostTracker({
    storageRecord: {
      storageRecordId: "storage:giftwallet:project",
      projectId: "giftwallet",
      attachments: [
        { attachmentId: "a1", size: 512 * 1024 * 1024 },
      ],
      retentionPolicy: "project-lifecycle",
    },
    retentionWindow: null,
  });

  assert.equal(storageCostMetric.attachmentVolumeGb, 0.5);
  assert.equal(storageCostMetric.lifecycleWindowDays, null);
  assert.equal(storageCostMetric.quantity, null);
  assert.match(storageCostMetric.summary, /attachment volume only/i);
});

test("storage cost tracker resolves source from manual context when no storage record exists", () => {
  const { storageCostMetric } = createStorageAndArtifactCostTracker({
    storageRecord: null,
    retentionWindow: null,
    manualContext: {
      attachments: [{ id: "attachment-1" }],
    },
  });

  assert.equal(storageCostMetric.source, "manual");
  assert.equal(storageCostMetric.quantity, null);
});

test("storage cost tracker falls back to derived when no storage sources exist", () => {
  const { storageCostMetric } = createStorageAndArtifactCostTracker();

  assert.equal(storageCostMetric.source, "derived");
  assert.equal(typeof storageCostMetric.recordedAt, "string");
});

test("storage cost tracker remains directly consumable by platform cost schema", () => {
  const { storageCostMetric } = createStorageAndArtifactCostTracker({
    storageRecord: {
      storageRecordId: "storage:giftwallet:project",
      projectId: "giftwallet",
      attachments: [
        { attachmentId: "a1", size: 1024 ** 3 },
      ],
      retentionPolicy: "project-lifecycle",
    },
    retentionWindow: {
      deleteAfterDays: 30,
    },
  });
  const { platformCostMetric } = definePlatformUsageCostSchema({
    usageEvent: {
      usageType: storageCostMetric.usageType,
      scopeType: "project",
      scopeId: storageCostMetric.projectId,
      quantity: storageCostMetric.quantity,
      unit: storageCostMetric.unit,
      sourceType: storageCostMetric.source,
      recordedAt: storageCostMetric.recordedAt,
    },
    pricingMetadata: {
      unitPrice: 2,
      currency: "usd",
      pricingModel: "per-unit",
    },
  });

  assert.equal(platformCostMetric.usageType, "storage");
  assert.equal(platformCostMetric.unit, "gb-month");
  assert.equal(platformCostMetric.totalCost, 2);
});
