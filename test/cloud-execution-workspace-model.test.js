import test from "node:test";
import assert from "node:assert/strict";

import { createCloudExecutionWorkspaceModel } from "../src/core/cloud-execution-workspace-model.js";

test("cloud execution workspace model returns canonical isolated cloud workspace state", () => {
  const { cloudWorkspaceModel } = createCloudExecutionWorkspaceModel({
    executionTopology: {
      topologyId: "execution-topology:giftwallet",
      projectId: "giftwallet",
      topologies: [
        {
          mode: "sandbox",
          topologyType: "cloud",
          runnerType: "sandbox",
          surfaceId: "sandbox",
          surfaceType: "execution-surface",
          readiness: "partial",
          capabilities: ["isolated-run", "command-execution"],
        },
      ],
    },
    projectState: {
      projectId: "giftwallet",
      storageRecord: {
        storageRecordId: "storage:giftwallet:project",
        storagePath: "storage/projects/giftwallet",
        storageDriver: "filesystem",
        storageScope: "project",
        retentionPolicy: "project-lifecycle",
        summary: {
          totalStoredItems: 3,
          artifactCount: 2,
        },
      },
      bootstrapExecutionResult: {
        status: "completed",
        executedAt: "2026-01-01T00:00:00.000Z",
      },
      bootstrapExecutionMetadata: {
        commandCount: 4,
      },
      bootstrapArtifacts: [
        { artifactId: "artifact-1" },
        { artifactId: "artifact-2" },
      ],
    },
  });

  assert.equal(cloudWorkspaceModel.workspaceId, "cloud-workspace:giftwallet");
  assert.equal(cloudWorkspaceModel.surface.topologyType, "cloud");
  assert.equal(cloudWorkspaceModel.filesystem.fileCount, 3);
  assert.equal(cloudWorkspaceModel.commandRuntime.commandCount, 4);
  assert.equal(cloudWorkspaceModel.summary.isReady, true);
  assert.equal(cloudWorkspaceModel.summary.isWritable, true);
});

test("cloud execution workspace model falls back to canonical empty state", () => {
  const { cloudWorkspaceModel } = createCloudExecutionWorkspaceModel();

  assert.equal(cloudWorkspaceModel.workspaceId, "cloud-workspace:unknown-project");
  assert.equal(cloudWorkspaceModel.surface.topologyType, "cloud");
  assert.equal(cloudWorkspaceModel.commandRuntime.status, "idle");
  assert.equal(cloudWorkspaceModel.summary.hasArtifacts, false);
});
