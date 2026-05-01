import test from "node:test";
import assert from "node:assert/strict";

import { createProjectStateRestoreResolver } from "../src/core/project-state-restore-resolver.js";

test("project state restore resolver chooses partial restore when rollback has external effects", () => {
  const { restoreDecision } = createProjectStateRestoreResolver({
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:project-1:v3",
      restoreMetadata: {
        canRestoreFull: true,
        canRestorePartial: true,
        requiresApproval: false,
        restoreScope: ["project-state", "execution-graph", "workspace-reference"],
      },
    },
    rollbackPlan: {
      rollbackPlanId: "rollback-plan:project-1",
      requiresConfirmation: true,
      summary: {
        hasExternalEffects: true,
        hasStateRollback: true,
      },
      scope: {
        state: [{ targetId: "project-1" }],
        deploy: [{ targetId: "deploy-1" }],
      },
    },
  });

  assert.equal(restoreDecision.restoreMode, "partial");
  assert.equal(restoreDecision.canRestore, true);
  assert.equal(restoreDecision.requiresManualConfirmation, true);
  assert.equal(restoreDecision.summary.totalRollbackTargets, 2);
});

test("project state restore resolver blocks restore when snapshot is not restorable", () => {
  const { restoreDecision } = createProjectStateRestoreResolver({
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:project-1:v3",
      restoreMetadata: {
        canRestoreFull: false,
        canRestorePartial: false,
        requiresApproval: true,
      },
    },
    rollbackPlan: {
      rollbackPlanId: "rollback-plan:project-1",
      summary: {
        hasExternalEffects: false,
        hasStateRollback: true,
      },
      scope: {
        state: [{ targetId: "project-1" }],
      },
    },
  });

  assert.equal(restoreDecision.restoreMode, "blocked");
  assert.equal(restoreDecision.canRestore, false);
  assert.equal(typeof restoreDecision.blockedReason, "string");
});

test("project state restore resolver normalizes malformed identifiers", () => {
  const { restoreDecision } = createProjectStateRestoreResolver({
    snapshotRecord: {
      snapshotRecordId: "  ",
      restoreMetadata: {
        canRestoreFull: true,
        canRestorePartial: true,
        restoreScope: ["project-state"],
      },
    },
    rollbackPlan: {
      rollbackPlanId: " rollback-plan:project-1 ",
      summary: {
        hasExternalEffects: false,
        hasStateRollback: true,
      },
      scope: {
        state: [{ targetId: "project-1" }],
      },
    },
  });

  assert.equal(restoreDecision.restoreDecisionId, "restore-decision:unknown-snapshot");
  assert.equal(restoreDecision.snapshotRecordId, null);
  assert.equal(restoreDecision.rollbackPlanId, "rollback-plan:project-1");
  assert.equal(restoreDecision.restoreMode, "full");
});
