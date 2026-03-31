import test from "node:test";
import assert from "node:assert/strict";

import { createSnapshotBackupWorkerJob } from "../src/core/snapshot-backup-worker-job.js";

test("snapshot backup worker job creates enabled worker state from schedule", () => {
  const now = new Date("2026-03-30T14:00:00.000Z");
  const { snapshotBackupWorker, snapshotJobState, workerRuntime } = createSnapshotBackupWorkerJob({
    projectId: "giftwallet",
    snapshotSchedule: {
      intervalSeconds: 300,
      intervalMs: 300000,
    },
    snapshotRetentionDecision: {
      retentionEnabled: true,
      maxSnapshots: 5,
    },
    now,
  });

  assert.equal(snapshotBackupWorker.enabled, true);
  assert.equal(snapshotBackupWorker.jobType, "snapshot-backup");
  assert.equal(snapshotBackupWorker.intervalSeconds, 300);
  assert.equal(snapshotBackupWorker.nextRunAt, "2026-03-30T14:05:00.000Z");
  assert.equal(snapshotBackupWorker.summary.lastExecutionStatus, "not-run");
  assert.equal(snapshotJobState.jobType, "snapshot-backup");
  assert.equal(snapshotJobState.nextRunAt, "2026-03-30T14:05:00.000Z");
  assert.equal(snapshotJobState.retention.maxSnapshots, 5);
  assert.equal(workerRuntime.queueName, "nexus-snapshot-backups");
});

test("snapshot backup worker job preserves previous counters and supports disable input", () => {
  const { snapshotBackupWorker, snapshotJobState } = createSnapshotBackupWorkerJob({
    projectId: "giftwallet",
    snapshotSchedule: {
      intervalSeconds: 120,
    },
    previousWorkerState: {
      workerJobId: "snapshot-backup-worker:giftwallet",
      runCount: 4,
      errorCount: 1,
      lastExecutionStatus: "success",
      lastRunAt: "2026-03-30T13:50:00.000Z",
    },
    workerInput: {
      enabled: false,
    },
  });

  assert.equal(snapshotBackupWorker.enabled, false);
  assert.equal(snapshotBackupWorker.status, "paused");
  assert.equal(snapshotBackupWorker.runCount, 4);
  assert.equal(snapshotBackupWorker.errorCount, 1);
  assert.equal(snapshotBackupWorker.summary.workerStatus, "disabled");
  assert.equal(snapshotJobState.status, "idle");
  assert.equal(snapshotJobState.enabled, false);
});
