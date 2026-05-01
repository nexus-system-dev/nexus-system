import test from "node:test";
import assert from "node:assert/strict";

import { defineProjectStateSnapshotSchema } from "../src/core/project-state-snapshot-schema.js";

test("project state snapshot schema returns canonical snapshot with state and graph versions", () => {
  const { projectStateSnapshot } = defineProjectStateSnapshotSchema({
    projectState: {
      projectId: "project-1",
      workspaceId: "workspace-1",
      workspaceArea: "development-workspace",
      workspaceVisibility: "private",
      stateVersion: 3,
      lifecyclePhase: "execution",
      hasArtifacts: true,
      hasBlockers: true,
      approvalStatus: "pending",
      updatedAt: "2025-01-01T10:00:00.000Z",
    },
    executionGraph: {
      nodes: [
        { id: "task-1", status: "done" },
        { id: "task-2", status: "running" },
        { id: "task-3", status: "blocked" },
      ],
      edges: [{ from: "task-1", to: "task-2" }],
    },
  });

  assert.equal(projectStateSnapshot.projectId, "project-1");
  assert.equal(projectStateSnapshot.stateVersion, 3);
  assert.equal(projectStateSnapshot.executionGraphVersion, 4);
  assert.equal(projectStateSnapshot.workspaceReference.workspaceId, "workspace-1");
  assert.equal(projectStateSnapshot.restoreMetadata.requiresApproval, true);
  assert.equal(projectStateSnapshot.artifactSummary.artifactCount, 0);
  assert.equal(projectStateSnapshot.executionGraphSummary.runningNodes, 1);
  assert.equal(projectStateSnapshot.executionGraphSummary.blockedNodes, 1);
  assert.equal(projectStateSnapshot.restorePayload.projectState.projectId, "project-1");
  assert.equal(projectStateSnapshot.restorePayload.workspaceReference.workspaceId, "workspace-1");
  assert.equal(Array.isArray(projectStateSnapshot.restorePayload.executionGraph.nodes), true);
});

test("project state snapshot schema falls back safely", () => {
  const { projectStateSnapshot } = defineProjectStateSnapshotSchema();

  assert.equal(typeof projectStateSnapshot.snapshotId, "string");
  assert.equal(typeof projectStateSnapshot.stateVersion, "number");
  assert.equal(Array.isArray(projectStateSnapshot.restoreMetadata.restoreScope), true);
  assert.equal(typeof projectStateSnapshot.summary.isRestorable, "boolean");
});

test("project state snapshot schema normalizes malformed identifiers and metadata strings", () => {
  const { projectStateSnapshot } = defineProjectStateSnapshotSchema({
    projectState: {
      projectId: "  ",
      workspaceId: "  ",
      workspaceArea: " release-workspace ",
      workspaceVisibility: " private ",
      lifecyclePhase: "execution",
      updatedAt: " 2026-04-20T12:00:00.000Z ",
      outputPaths: [" dist/build-output ", "   "],
      packageFormat: " static-bundle ",
      verificationStatus: " verified ",
    },
  });

  assert.equal(projectStateSnapshot.snapshotId, "project-state-snapshot:unknown-project:v1");
  assert.equal(projectStateSnapshot.projectId, "unknown-project");
  assert.equal(projectStateSnapshot.workspaceReference.workspaceId, null);
  assert.equal(projectStateSnapshot.workspaceReference.workspaceArea, "release-workspace");
  assert.equal(projectStateSnapshot.workspaceReference.workspaceVisibility, "private");
  assert.equal(projectStateSnapshot.stateSummary.updatedAt, "2026-04-20T12:00:00.000Z");
  assert.deepEqual(projectStateSnapshot.artifactSummary.outputPaths, ["dist/build-output"]);
  assert.equal(projectStateSnapshot.artifactSummary.packageFormat, "static-bundle");
  assert.equal(projectStateSnapshot.artifactSummary.verificationStatus, "verified");
});
