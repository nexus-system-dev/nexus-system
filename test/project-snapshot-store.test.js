import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createPersistentProjectSnapshotStore, createProjectSnapshotStore } from "../src/core/project-snapshot-store.js";

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

test("project snapshot store persists and queries snapshot records", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "project-snapshot-store-"));
  const filePath = path.join(tempDir, "project-snapshots.ndjson");
  const snapshotStore = createPersistentProjectSnapshotStore({ filePath });

  const { snapshotRecord } = createProjectSnapshotStore({
    projectStateSnapshot: {
      snapshotId: "project-state-snapshot:project-2:v5",
      projectId: "project-2",
      stateVersion: 5,
      executionGraphVersion: 8,
      workspaceReference: {
        workspaceId: "workspace-2",
      },
      restoreMetadata: {
        restoreScope: ["project-state"],
      },
      stateSummary: {
        lifecyclePhase: "release",
      },
    },
    snapshotStore,
  });

  const reloadedStore = createPersistentProjectSnapshotStore({ filePath });
  const projectSnapshots = reloadedStore.query({ projectId: "project-2" });

  assert.equal(snapshotRecord.reason, "pre-release-change");
  assert.equal(projectSnapshots.length, 1);
  assert.equal(projectSnapshots[0].snapshotRecordId, snapshotRecord.snapshotRecordId);
  assert.equal(reloadedStore.getBySnapshotRecordId(snapshotRecord.snapshotRecordId)?.projectId, "project-2");
});

test("project snapshot store deletes snapshot records and rewrites persistent file", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "project-snapshot-store-prune-"));
  const filePath = path.join(tempDir, "project-snapshots.ndjson");
  const snapshotStore = createPersistentProjectSnapshotStore({ filePath });

  const first = createProjectSnapshotStore({
    projectStateSnapshot: {
      snapshotId: "project-state-snapshot:project-3:v1",
      projectId: "project-3",
      stateVersion: 1,
      executionGraphVersion: 1,
    },
    snapshotStore,
  }).snapshotRecord;
  const second = createProjectSnapshotStore({
    projectStateSnapshot: {
      snapshotId: "project-state-snapshot:project-3:v2",
      projectId: "project-3",
      stateVersion: 2,
      executionGraphVersion: 2,
    },
    snapshotStore,
  }).snapshotRecord;

  const deleted = snapshotStore.deleteBySnapshotRecordIds([first.snapshotRecordId]);
  const reloadedStore = createPersistentProjectSnapshotStore({ filePath });
  const remaining = reloadedStore.query({ projectId: "project-3", limit: 10 });

  assert.equal(deleted.length, 1);
  assert.equal(deleted[0].snapshotRecordId, first.snapshotRecordId);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].snapshotRecordId, second.snapshotRecordId);
});
