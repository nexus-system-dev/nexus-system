import test from "node:test";
import assert from "node:assert/strict";

import { createBuildPreviewSandboxBoundary } from "../src/core/build-preview-sandbox-boundary.js";

test("RUNTIME-001 — runtime preview is bounded as internal sandbox, not production", () => {
  const boundary = createBuildPreviewSandboxBoundary({
    project: {
      id: "runtime-ready-project",
      runtimeSkeletonTruth: {
        runtimeSkeletonId: "runtime-skeleton:runtime-ready-project:internal-tool",
        artifactBuildId: "runtime-build:runtime-ready-project:first-skeleton",
      },
    },
    buildMutationTruth: {
      lastMutationId: "mutation-1",
      lastOperationId: "record.create",
    },
    buildAgentTurn: {
      status: "applied",
      intent: "small-safe-change",
    },
  });

  assert.equal(boundary.taskId, "RUNTIME-001");
  assert.equal(boundary.status, "ready");
  assert.equal(boundary.buildStatus, "ready");
  assert.equal(boundary.previewStatus, "sandbox-preview-ready");
  assert.equal(boundary.sandboxBoundary, "nexus-internal-sandbox-not-production");
  assert.equal(boundary.retryPolicy.canRetry, false);
  assert.equal(boundary.noFakeLiveProductClaim, true);
  assert.equal(boundary.trace.runtimeSkeletonId, "runtime-skeleton:runtime-ready-project:internal-tool");
  assert.equal(boundary.trace.mutationId, "mutation-1");
});

test("RUNTIME-001 — missing artifact returns visible retry-safe fallback", () => {
  const boundary = createBuildPreviewSandboxBoundary({
    project: {
      id: "runtime-missing-project",
    },
  });

  assert.equal(boundary.status, "artifact-not-created");
  assert.equal(boundary.buildStatus, "not-created");
  assert.equal(boundary.previewStatus, "preview-unavailable");
  assert.equal(boundary.artifactFallback, "show-empty-artifact-recovery");
  assert.equal(boundary.retryPolicy.canRetry, true);
  assert.equal(boundary.retryPolicy.retryAction, "retry-build-preview");
  assert.match(boundary.userFacing.body, /לא נוצר שלד/u);
});

test("RUNTIME-001 — failed and timed-out builds cannot claim visible success", () => {
  const failed = createBuildPreviewSandboxBoundary({
    project: {
      id: "runtime-failed-project",
      buildPreviewState: {
        buildStatus: "failed",
        error: "visual build provider failed",
      },
    },
  });
  const timedOut = createBuildPreviewSandboxBoundary({
    project: {
      id: "runtime-timeout-project",
      buildPreviewState: {
        buildStatus: "working",
        startedAt: "2026-06-12T10:00:00.000Z",
      },
    },
    now: Date.parse("2026-06-12T10:02:00.000Z"),
    timeoutMs: 45000,
  });

  assert.equal(failed.status, "failed");
  assert.equal(failed.retryPolicy.canRetry, true);
  assert.match(failed.userFacing.body, /visual build provider failed/);
  assert.equal(timedOut.status, "timed-out");
  assert.equal(timedOut.timeoutPolicy.status, "expired");
  assert.equal(timedOut.noFakeLiveProductClaim, true);
});
