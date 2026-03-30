import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ProjectService } from "../src/core/project-service.js";

function createService() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "nexus-project-rollback-"));
  return new ProjectService({
    eventLogPath: path.join(directory, "events.ndjson"),
  });
}

test("project service executes rollback and applies restored state payload", () => {
  const service = createService();
  service.seedDemoProject();

  const project = service.projects.get("giftwallet");
  project.state = {
    ...(project.state ?? {}),
    riskLevel: "high",
    lifecycle: "active",
  };
  project.context = {
    ...(project.context ?? {}),
    restoreDecision: {
      restoreDecisionId: "restore-decision:giftwallet",
      canRestore: true,
      restoreMode: "full",
      restoreTargets: ["project-state", "execution-graph", "workspace-reference"],
    },
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:giftwallet:v3",
      versions: {
        stateVersion: 3,
        executionGraphVersion: 9,
      },
      restorePayload: {
        projectState: {
          riskLevel: "low",
          lifecycle: "stable",
        },
        executionGraph: {
          nodes: [{ id: "restore-node" }],
          edges: [],
        },
        workspaceReference: {
          workspaceId: "workspace-giftwallet",
          workspacePath: "/restored/workspace",
          workspaceArea: "developer-workspace",
        },
      },
    },
  };

  const updated = service.executeProjectRollback({ projectId: "giftwallet" });

  assert.equal(updated.state.riskLevel, "low");
  assert.equal(updated.state.lifecycle, "stable");
  assert.equal(updated.path, "/restored/workspace");
  assert.equal(updated.context.rollbackExecutionResult.executed, true);
  assert.equal(updated.context.rollbackExecutionResult.executionStatus, "executed-full");
  assert.equal(updated.context.rollbackExecutionResult.summary.restoredTargetCount, 3);
});
