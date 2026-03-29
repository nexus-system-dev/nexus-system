import test from "node:test";
import assert from "node:assert/strict";

import { createBackupAndRestoreStrategy } from "../src/core/backup-restore-strategy.js";

test("backup and restore strategy builds persistence and artifact protection plan", () => {
  const { backupStrategy, restorePlan } = createBackupAndRestoreStrategy({
    nexusPersistenceSchema: {
      entities: {
        projects: {
          entityName: "projects",
          storageType: "document",
          retentionPolicy: "project-lifecycle",
        },
        approvals: {
          entityName: "approvals",
          storageType: "document",
          retentionPolicy: "compliance-audit",
        },
      },
    },
    storageRecords: {
      projectId: "giftwallet",
      storageDriver: "filesystem",
      storagePath: "storage/projects/giftwallet",
      retentionPolicy: "project-lifecycle",
      artifacts: [{ storageItemId: "artifact:1", path: "dist/app.js", kind: "build-artifact" }],
      attachments: [{ storageItemId: "attachment:1", path: "attachments/spec.pdf", kind: "attachment" }],
    },
  });

  assert.equal(backupStrategy.projectId, "giftwallet");
  assert.equal(backupStrategy.backupMode, "state-and-artifacts");
  assert.equal(backupStrategy.summary.totalDatasets, 2);
  assert.equal(backupStrategy.summary.totalArtifactTargets, 2);
  assert.equal(restorePlan.restoreTargets.datasets.includes("projects"), true);
  assert.equal(restorePlan.summary.canRestoreArtifacts, true);
});

test("backup and restore strategy falls back safely without artifacts", () => {
  const { backupStrategy, restorePlan } = createBackupAndRestoreStrategy();

  assert.equal(backupStrategy.backupMode, "state-only");
  assert.equal(Array.isArray(backupStrategy.persistenceTargets), true);
  assert.equal(Array.isArray(restorePlan.restoreTargets.artifacts), true);
  assert.equal(restorePlan.summary.requiresSnapshotAlignment, true);
});
