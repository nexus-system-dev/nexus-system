import test from "node:test";
import assert from "node:assert/strict";

import { createBusinessContinuityLifecycleManager } from "../src/core/business-continuity-lifecycle-manager.js";

test("business continuity lifecycle manager resolves recovery state from active incident and ready checklist", () => {
  const { businessContinuityState } = createBusinessContinuityLifecycleManager({
    backupStrategy: {
      backupStrategyId: "backup-strategy:giftwallet",
      projectId: "giftwallet",
    },
    continuityPlan: {},
    disasterRecoveryChecklist: {
      checklistId: "disaster-recovery:giftwallet",
      summary: {
        readinessScore: 92,
        canExecuteRecovery: true,
      },
      steps: [{ stepId: "restore-state" }],
    },
    incidentAlert: {
      status: "active",
      severity: "high",
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
      enabled: true,
    },
  });

  assert.equal(businessContinuityState.lifecycleState, "recovery");
  assert.equal(businessContinuityState.summary.readinessScore, 92);
  assert.equal(businessContinuityState.orchestration.failover.integrationStatus, "placeholder");
  assert.equal(Array.isArray(businessContinuityState.availableActions), true);
});

test("business continuity lifecycle manager resolves failover with missing planner as blocking placeholder", () => {
  const { businessContinuityState } = createBusinessContinuityLifecycleManager({
    backupStrategy: {
      backupStrategyId: "backup-strategy:giftwallet",
      projectId: "giftwallet",
    },
    continuityPlan: {
      forcedLifecycleState: "failover",
      failover: {
        enabled: true,
        hasPlanner: false,
      },
    },
    disasterRecoveryChecklist: {
      checklistId: "disaster-recovery:giftwallet",
      summary: {
        readinessScore: 40,
        canExecuteRecovery: false,
      },
      steps: [],
    },
    incidentAlert: {
      status: "active",
      severity: "critical",
    },
  });

  assert.equal(businessContinuityState.lifecycleState, "failover");
  assert.equal(businessContinuityState.continuityStatus, "at-risk");
  assert.equal(businessContinuityState.orchestration.failover.integrationStatus, "placeholder");
  assert.equal(businessContinuityState.orchestration.failover.isBlocking, true);
});
