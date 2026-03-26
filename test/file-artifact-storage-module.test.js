import test from "node:test";
import assert from "node:assert/strict";

import { createFileAndArtifactStorageModule } from "../src/core/file-artifact-storage-module.js";

test("file and artifact storage module builds canonical storage record for artifacts and attachments", () => {
  const { storageRecord } = createFileAndArtifactStorageModule({
    artifactMetadata: {
      artifactRecord: {
        buildTarget: "web-build",
        artifacts: ["build-output", "static-assets"],
        outputPaths: ["dist/build-output", "dist/static-assets"],
        status: "registered",
      },
      packagedArtifact: {
        packageFormat: "static-bundle",
        files: ["packages/web/app.zip"],
        metadata: {
          verificationStatus: "verified",
        },
      },
    },
    storageRequest: {
      projectId: "nexus-web",
      workspaceId: "workspace:nexus-web",
      attachments: [
        {
          id: "brief-1",
          name: "brief.pdf",
          type: "application/pdf",
          size: 128,
        },
      ],
    },
  });

  assert.equal(storageRecord.projectId, "nexus-web");
  assert.equal(storageRecord.summary.artifactCount, 3);
  assert.equal(storageRecord.summary.attachmentCount, 1);
  assert.equal(storageRecord.artifacts[0].path, "dist/build-output");
  assert.equal(storageRecord.artifacts[2].kind, "packaged-file");
  assert.equal(storageRecord.attachments[0].attachmentId, "brief-1");
});

test("file and artifact storage module falls back to empty storage record", () => {
  const { storageRecord } = createFileAndArtifactStorageModule();

  assert.equal(storageRecord.projectId, "unknown-project");
  assert.equal(storageRecord.status, "empty");
  assert.equal(storageRecord.summary.totalStoredItems, 0);
});
