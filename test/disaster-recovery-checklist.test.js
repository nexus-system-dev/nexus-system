import test from "node:test";
import assert from "node:assert/strict";

import { createDisasterRecoveryChecklist } from "../src/core/disaster-recovery-checklist.js";

test("disaster recovery checklist builds readiness summary and ordered recovery steps", () => {
  const { disasterRecoveryChecklist } = createDisasterRecoveryChecklist({
    backupStrategy: {
      backupStrategyId: "backup-strategy:giftwallet",
      projectId: "giftwallet",
    },
    restorePlan: {
      restorePlanId: "restore-plan:giftwallet",
      projectId: "giftwallet",
    },
    incidentAlert: {
      status: "active",
      severity: "high",
      incidentType: "runtime-outage",
    },
    platformTrace: {
      traceId: "trace:giftwallet",
    },
    platformLogs: [
      { logId: "log:giftwallet:1", level: "error" },
    ],
    observabilitySummary: {
      observabilityId: "observability:giftwallet",
      totalTraces: 1,
      totalLogs: 1,
      healthStatus: "active",
    },
    snapshotSchedule: {
      snapshotScheduleId: "snapshot-schedule:giftwallet",
      enabled: true,
    },
    snapshotBackupWorker: {
      workerId: "snapshot-worker:giftwallet",
      enabled: true,
    },
    snapshotRetentionPolicy: {
      retentionPolicyId: "snapshot-retention-policy:giftwallet",
      maxSnapshots: 5,
    },
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:giftwallet:latest",
    },
    restoreDecision: {
      restoreDecisionId: "restore-decision:giftwallet",
      summary: {
        isSafeToExecute: true,
      },
    },
    rollbackExecutionResult: {
      executed: true,
      executionStatus: "executed-full",
    },
  });

  assert.equal(disasterRecoveryChecklist.checklistId, "disaster-recovery:giftwallet");
  assert.equal(disasterRecoveryChecklist.summary.canExecuteRecovery, true);
  assert.equal(disasterRecoveryChecklist.summary.missingPrerequisites, 0);
  assert.equal(disasterRecoveryChecklist.prerequisites.length >= 6, true);
  assert.equal(disasterRecoveryChecklist.prerequisites.some((item) => item.key === "platform-observability" && item.status === "ready"), true);
  assert.equal(disasterRecoveryChecklist.steps[0].stepId, "assess-incident");
  assert.equal(disasterRecoveryChecklist.steps[2].stepId, "restore-state");
  assert.equal(disasterRecoveryChecklist.observability.traceId, "trace:giftwallet");
});

test("disaster recovery checklist reports missing prerequisites when strategy is incomplete", () => {
  const { disasterRecoveryChecklist } = createDisasterRecoveryChecklist({
    backupStrategy: {},
    restorePlan: {},
    snapshotSchedule: {
      enabled: false,
    },
    snapshotBackupWorker: {
      enabled: false,
    },
    restoreDecision: {
      blockedReason: "approval required",
      summary: {
        isSafeToExecute: false,
      },
    },
  });

  assert.equal(disasterRecoveryChecklist.summary.canExecuteRecovery, false);
  assert.equal(disasterRecoveryChecklist.summary.missingPrerequisites >= 1, true);
  assert.equal(
    disasterRecoveryChecklist.prerequisites.some((item) => item.key === "backup-strategy" && item.status === "missing"),
    true,
  );
  assert.equal(disasterRecoveryChecklist.steps[1].ready, false);
});

test("disaster recovery checklist normalizes malformed project and worker evidence fields", () => {
  const { disasterRecoveryChecklist } = createDisasterRecoveryChecklist({
    backupStrategy: {
      backupStrategyId: " backup-strategy:giftwallet ",
      projectId: " giftwallet ",
    },
    restorePlan: {
      restorePlanId: " restore-plan:giftwallet ",
      projectId: " giftwallet ",
    },
    snapshotBackupWorker: {
      workerId: " snapshot-worker:giftwallet ",
      enabled: true,
    },
  });

  assert.equal(disasterRecoveryChecklist.checklistId, "disaster-recovery:giftwallet");
  assert.equal(disasterRecoveryChecklist.projectId, "giftwallet");
  assert.equal(
    disasterRecoveryChecklist.prerequisites.find((item) => item.key === "snapshot-worker")?.evidence,
    "snapshot-worker:giftwallet",
  );
});
