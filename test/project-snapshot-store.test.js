import test from "node:test";
import assert from "node:assert/strict";

import { createProjectSnapshotStore } from "../src/core/project-snapshot-store.js";

test("project snapshot store returns canonical stored snapshot record", () => {
  const { snapshotRecord } = createProjectSnapshotStore({
    projectStateSnapshot: {
      snapshotId: "project-state-snapshot:project-1:v3",
      projectId: "project-1",
      stateVersion: 3,
      executionGraphVersion: 4,
      workspaceReference: {
        workspaceId: "workspace-1",
        workspaceArea: "development-workspace",
        workspaceVisibility: "private",
      },
      restoreMetadata: {
        canRestoreFull: true,
        canRestorePartial: true,
        restoreScope: ["project-state", "execution-graph"],
      },
      artifactSummary: {
        artifactCount: 2,
        outputPaths: ["dist/build-output"],
        packageFormat: "static-bundle",
        packagedFileCount: 3,
        verificationStatus: "verified",
      },
      stateSummary: {
        lifecyclePhase: "execution",
      },
    },
  });

  assert.equal(snapshotRecord.projectId, "project-1");
  assert.equal(snapshotRecord.triggerType, "graph-sensitive-change");
  assert.equal(snapshotRecord.reason, "pre-execution-change");
  assert.equal(snapshotRecord.versions.stateVersion, 3);
  assert.equal(snapshotRecord.artifactSummary.packageFormat, "static-bundle");
  assert.equal(snapshotRecord.restoreMetadata.retentionPolicy, "pre-change-history");
  assert.equal(snapshotRecord.summary.isStored, true);
});

test("project snapshot store falls back safely", () => {
  const { snapshotRecord } = createProjectSnapshotStore();

  assert.equal(typeof snapshotRecord.snapshotRecordId, "string");
  assert.equal(typeof snapshotRecord.storageMetadata.checksum, "string");
  assert.equal(typeof snapshotRecord.summary.canRestoreFull, "boolean");
});
