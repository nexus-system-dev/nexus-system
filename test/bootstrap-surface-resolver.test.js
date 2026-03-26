import test from "node:test";
import assert from "node:assert/strict";

import { createBootstrapSurfaceResolver } from "../src/core/bootstrap-surface-resolver.js";

test("bootstrap surface resolver resolves agent runtime requests", () => {
  const { resolvedSurface } = createBootstrapSurfaceResolver({
    executionRequest: {
      requestId: "bootstrap-request-1",
      taskId: "bootstrap-task-1",
      targetType: "agent",
      targetId: "dev-agent",
      dispatchMode: "agent-runtime",
    },
  });

  assert.equal(resolvedSurface.surfaceId, "agent-runtime");
  assert.equal(resolvedSurface.surfaceType, "agent");
  assert.equal(resolvedSurface.targetId, "dev-agent");
  assert.equal(resolvedSurface.readiness, "ready");
});

test("bootstrap surface resolver resolves sandbox-like execution surfaces", () => {
  const { resolvedSurface } = createBootstrapSurfaceResolver({
    executionRequest: {
      requestId: "bootstrap-request-2",
      taskId: "bootstrap-task-2",
      targetType: "surface",
      targetId: "sandbox",
      dispatchMode: "sandbox",
    },
  });

  assert.equal(resolvedSurface.surfaceId, "sandbox");
  assert.equal(resolvedSurface.surfaceType, "execution-surface");
  assert.equal(resolvedSurface.supports.includes("isolated-run"), true);
  assert.equal(resolvedSurface.readiness, "partial");
});
