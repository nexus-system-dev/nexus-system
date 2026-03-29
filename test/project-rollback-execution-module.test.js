import test from "node:test";
import assert from "node:assert/strict";

import { createProjectRollbackExecutionModule } from "../src/core/project-rollback-execution-module.js";

test("project rollback execution module executes full restore targets", () => {
  const { rollbackExecutionResult } = createProjectRollbackExecutionModule({
    restoreDecision: {
      restoreDecisionId: "restore-decision:project-1",
      canRestore: true,
      restoreMode: "full",
      restoreTargets: ["project-state", "execution-graph", "workspace-reference", "linked-metadata"],
    },
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:project-1:v3",
      versions: {
        stateVersion: 3,
        executionGraphVersion: 2,
      },
      workspaceReference: {
        workspaceId: "workspace-project-1",
        workspaceArea: "developer-workspace",
      },
      artifactSummary: {
        artifactCount: 4,
        packageFormat: "zip",
        verificationStatus: "verified",
      },
      restorePayload: {
        projectState: {
          projectId: "project-1",
          stateVersion: 3,
          lifecyclePhase: "execution",
        },
        executionGraph: {
          nodes: [{ id: "task-1", status: "done" }],
          edges: [],
        },
        workspaceReference: {
          workspaceId: "workspace-project-1",
          workspaceArea: "developer-workspace",
          workspaceVisibility: "workspace",
        },
        linkedMetadata: {
          artifactSummary: {
            artifactCount: 4,
            packageFormat: "zip",
            verificationStatus: "verified",
          },
        },
      },
    },
  });

  assert.equal(rollbackExecutionResult.executionStatus, "executed-full");
  assert.equal(rollbackExecutionResult.executed, true);
  assert.equal(rollbackExecutionResult.summary.restoredTargetCount, 4);
  assert.equal(rollbackExecutionResult.summary.restoredWorkspace, true);
  assert.equal(rollbackExecutionResult.summary.restoredStateApplied, true);
  assert.equal(rollbackExecutionResult.restoredProjectState.projectId, "project-1");
  assert.equal(Array.isArray(rollbackExecutionResult.restoredExecutionGraph.nodes), true);
  assert.equal(rollbackExecutionResult.linkedMetadataResults[0]?.artifactCount, 4);
});

test("project rollback execution module stays blocked when restore cannot run", () => {
  const { rollbackExecutionResult } = createProjectRollbackExecutionModule({
    restoreDecision: {
      restoreDecisionId: "restore-decision:project-1",
      canRestore: false,
      restoreMode: "blocked",
      blockedReason: "Snapshot cannot be restored safely",
      restoreTargets: [],
    },
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:project-1:v3",
      versions: {
        stateVersion: 3,
        executionGraphVersion: 2,
      },
    },
  });

  assert.equal(rollbackExecutionResult.executionStatus, "blocked");
  assert.equal(rollbackExecutionResult.executed, false);
  assert.equal(rollbackExecutionResult.blockedReason, "Snapshot cannot be restored safely");
  assert.equal(rollbackExecutionResult.summary.restoredTargetCount, 0);
});
