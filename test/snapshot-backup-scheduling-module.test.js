import test from "node:test";
import assert from "node:assert/strict";

import { createSnapshotBackupSchedulingModule } from "../src/core/snapshot-backup-scheduling-module.js";

test("snapshot backup scheduling module returns canonical interval and pre-change schedule", () => {
  const now = new Date("2026-03-30T12:00:00.000Z");
  const { snapshotSchedule } = createSnapshotBackupSchedulingModule({
    backupStrategy: {
      backupStrategyId: "backup-strategy:giftwallet",
      backupMode: "state-and-artifacts",
    },
    projectState: {
      projectId: "giftwallet",
    },
    scheduleInput: {
      enabled: true,
      intervalSeconds: 900,
      preChangeTriggers: ["bootstrap", "migration", "deploy"],
    },
    now,
  });

  assert.equal(snapshotSchedule.projectId, "giftwallet");
  assert.equal(snapshotSchedule.enabled, true);
  assert.equal(snapshotSchedule.intervalSeconds, 900);
  assert.deepEqual(snapshotSchedule.preChangeTriggers, ["bootstrap", "migration", "deploy"]);
  assert.equal(snapshotSchedule.execution.nextRunAt, "2026-03-30T12:15:00.000Z");
  assert.equal(snapshotSchedule.summary.scheduleStatus, "scheduled");
});

test("snapshot backup scheduling module falls back safely to defaults", () => {
  const { snapshotSchedule } = createSnapshotBackupSchedulingModule();

  assert.equal(typeof snapshotSchedule.snapshotScheduleId, "string");
  assert.equal(snapshotSchedule.intervalSeconds, 300);
  assert.equal(Array.isArray(snapshotSchedule.preChangeTriggers), true);
  assert.equal(snapshotSchedule.preChangeTriggers.includes("bootstrap"), true);
  assert.equal(snapshotSchedule.summary.supportsIntervalBackups, true);
});
