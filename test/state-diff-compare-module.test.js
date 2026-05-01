import test from "node:test";
import assert from "node:assert/strict";

import { createStateDiffAndCompareModule } from "../src/core/state-diff-compare-module.js";

test("state diff compare module detects state graph and artifact changes between snapshots", () => {
  const { stateDiff } = createStateDiffAndCompareModule({
    snapshotRecord: {
      snapshotRecordId: "snapshot-record:project-1:v3",
      versions: {
        stateVersion: 3,
        executionGraphVersion: 4,
      },
      workspaceReference: {
        workspaceArea: "development-workspace",
        workspaceVisibility: "private",
      },
      executionGraphSummary: {
        runningNodes: 1,
        blockedNodes: 1,
      },
      artifactSummary: {
        artifactCount: 2,
        outputPaths: ["dist/build-output"],
        packageFormat: "static-bundle",
        packagedFileCount: 3,
        verificationStatus: "verified",
      },
    },
    comparisonTarget: {
      comparisonTargetId: "comparison-target:project-1",
      versions: {
        stateVersion: 4,
        executionGraphVersion: 5,
      },
      workspaceReference: {
        workspaceArea: "release-workspace",
        workspaceVisibility: "private",
      },
      executionGraphSummary: {
        runningNodes: 0,
        blockedNodes: 0,
      },
      artifactSummary: {
        artifactCount: 3,
        outputPaths: ["dist/build-output", "dist/report.json"],
        packageFormat: "deployment-package",
        packagedFileCount: 4,
        verificationStatus: "pending",
      },
    },
  });

  assert.equal(stateDiff.summary.hasStateChanges, true);
  assert.equal(stateDiff.summary.hasGraphChanges, true);
  assert.equal(stateDiff.summary.hasArtifactChanges, true);
  assert.equal(stateDiff.summary.totalChanges > 0, true);
});

test("state diff compare module falls back safely", () => {
  const { stateDiff } = createStateDiffAndCompareModule();

  assert.equal(typeof stateDiff.stateDiffId, "string");
  assert.equal(Array.isArray(stateDiff.stateChanges), true);
  assert.equal(Array.isArray(stateDiff.graphChanges), true);
  assert.equal(Array.isArray(stateDiff.artifactChanges), true);
});

test("state diff compare module normalizes malformed identifiers", () => {
  const { stateDiff } = createStateDiffAndCompareModule({
    snapshotRecord: {
      snapshotRecordId: "  ",
    },
    comparisonTarget: {
      comparisonTargetId: " comparison-target:project-1 ",
    },
  });

  assert.equal(stateDiff.stateDiffId, "state-diff:unknown-snapshot");
  assert.equal(stateDiff.snapshotRecordId, null);
  assert.equal(stateDiff.comparisonTargetId, "comparison-target:project-1");
});
