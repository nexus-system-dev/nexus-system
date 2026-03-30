import test from "node:test";
import assert from "node:assert/strict";

import { createSnapshotRetentionGuard } from "../src/core/snapshot-retention-guard.js";

test("snapshot retention guard marks oldest snapshots for deletion when max is exceeded", () => {
  const now = new Date("2026-03-30T13:00:00.000Z");
  const { snapshotRetentionDecision } = createSnapshotRetentionGuard({
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:giftwallet:v4",
    },
    snapshotSchedule: {
      intervalSeconds: 300,
    },
    retentionPolicy: {
      enabled: true,
      maxSnapshots: 2,
    },
    snapshotRecords: [
      { snapshotRecordId: "snapshot-record:giftwallet:v1", storageMetadata: { storedAt: "2026-03-30T09:00:00.000Z" } },
      { snapshotRecordId: "snapshot-record:giftwallet:v2", storageMetadata: { storedAt: "2026-03-30T10:00:00.000Z" } },
      { snapshotRecordId: "snapshot-record:giftwallet:v3", storageMetadata: { storedAt: "2026-03-30T11:00:00.000Z" } },
      { snapshotRecordId: "snapshot-record:giftwallet:v4", storageMetadata: { storedAt: "2026-03-30T12:00:00.000Z" } },
    ],
    now,
  });

  assert.equal(snapshotRetentionDecision.maxSnapshots, 2);
  assert.equal(snapshotRetentionDecision.shouldPrune, true);
  assert.deepEqual(snapshotRetentionDecision.deletedSnapshotRecordIds, [
    "snapshot-record:giftwallet:v1",
    "snapshot-record:giftwallet:v2",
  ]);
  assert.equal(snapshotRetentionDecision.summary.pruneCount, 2);
  assert.equal(snapshotRetentionDecision.summary.totalAfterCleanup, 2);
});

test("snapshot retention guard keeps snapshots when policy is disabled", () => {
  const { snapshotRetentionDecision } = createSnapshotRetentionGuard({
    retentionPolicy: {
      enabled: false,
      maxSnapshots: 1,
    },
    snapshotRecords: [
      { snapshotRecordId: "snapshot-record:giftwallet:v1", storageMetadata: { storedAt: "2026-03-30T09:00:00.000Z" } },
      { snapshotRecordId: "snapshot-record:giftwallet:v2", storageMetadata: { storedAt: "2026-03-30T10:00:00.000Z" } },
    ],
  });

  assert.equal(snapshotRetentionDecision.retentionEnabled, false);
  assert.equal(snapshotRetentionDecision.shouldPrune, false);
  assert.equal(snapshotRetentionDecision.deletedSnapshotRecordIds.length, 0);
});
