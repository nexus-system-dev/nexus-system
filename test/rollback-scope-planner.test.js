import test from "node:test";
import assert from "node:assert/strict";

import { createRollbackScopePlanner } from "../src/core/rollback-scope-planner.js";

test("rollback scope planner includes workspace, deployment and provider side effects", () => {
  const { rollbackPlan } = createRollbackScopePlanner({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:task-1",
      failureClass: "execution-failure",
      rollbackScope: {
        scope: "workspace",
        target: "task-1",
        requiresUserConfirmation: true,
      },
    },
    executionMetadata: {
      projectId: "project-1",
      storageRecord: {
        artifacts: [
          { artifactId: "artifact-1", path: "artifacts/build.zip", status: "stored" },
        ],
      },
      releaseTimeline: {
        releaseRunId: "release-run:project-1",
        currentStage: "publish",
        currentStatus: "published",
      },
      deploymentRequest: {
        requestId: "deployment-request-1",
        provider: "vercel",
        target: "web-deployment",
        environment: "production",
      },
      providerSideEffects: [
        { providerOperationId: "provider-op-1", provider: "vercel", status: "applied" },
      ],
    },
  });

  assert.equal(rollbackPlan.rollbackMode, "targeted");
  assert.equal(rollbackPlan.requiresConfirmation, true);
  assert.equal(rollbackPlan.scope.files.length, 1);
  assert.equal(rollbackPlan.scope.state[0].targetType, "workspace-state");
  assert.equal(rollbackPlan.scope.deploy[0].provider, "vercel");
  assert.equal(rollbackPlan.scope.releaseDrafts[0].targetType, "release-draft");
  assert.equal(rollbackPlan.scope.providerSideEffects[0].targetType, "provider-side-effect");
  assert.equal(rollbackPlan.summary.hasExternalEffects, true);
});

test("rollback scope planner returns none when there is no rollback target", () => {
  const { rollbackPlan } = createRollbackScopePlanner({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:task-2",
      failureClass: "policy-blocked",
      rollbackScope: {
        scope: "none",
        target: null,
        requiresUserConfirmation: false,
      },
    },
    executionMetadata: {},
  });

  assert.equal(rollbackPlan.rollbackMode, "none");
  assert.equal(rollbackPlan.summary.totalTargets, 0);
  assert.equal(rollbackPlan.summary.hasStateRollback, false);
  assert.equal(rollbackPlan.requiresConfirmation, false);
});
