import assert from "node:assert/strict";
import test from "node:test";

import { createBootstrapExecutionInvoker } from "../src/core/bootstrap-execution-invoker.js";

test("createBootstrapExecutionInvoker invokes commands on ready surfaces", () => {
  const result = createBootstrapExecutionInvoker({
    resolvedSurface: {
      requestId: "request-1",
      taskId: "task-1",
      resolvedSurface: {
        surfaceId: "agent-runtime",
        surfaceType: "agent",
        readiness: "ready",
      },
    },
    plannedCommands: {
      plannedCommands: [
        {
          id: "command-1",
          order: 1,
          command: "create-app-shell",
          args: ["saas", "next"],
          produces: ["app-shell"],
        },
      ],
    },
  });

  assert.equal(result.requestId, "request-1");
  assert.equal(result.taskId, "task-1");
  assert.equal(result.rawExecutionResult.status, "invoked");
  assert.equal(result.rawExecutionResult.commandResults[0].status, "invoked");
  assert.equal(result.rawExecutionResult.commandResults[0].exitCode, 0);
});

test("createBootstrapExecutionInvoker stages commands on partial surfaces", () => {
  const result = createBootstrapExecutionInvoker({
    resolvedSurface: {
      resolvedSurface: {
        surfaceId: "sandbox",
        surfaceType: "execution-surface",
        readiness: "partial",
      },
    },
    plannedCommands: {
      plannedCommands: [
        {
          id: "command-1",
          order: 1,
          command: "create-billing-module",
          args: ["casino", "node"],
          produces: ["billing-module"],
        },
      ],
    },
  });

  assert.equal(result.rawExecutionResult.status, "staged");
  assert.equal(result.rawExecutionResult.commandResults[0].status, "staged");
  assert.equal(result.rawExecutionResult.commandResults[0].exitCode, null);
});
