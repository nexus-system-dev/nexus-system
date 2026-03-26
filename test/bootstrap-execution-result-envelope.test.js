import assert from "node:assert/strict";
import test from "node:test";

import { createBootstrapExecutionResultEnvelope } from "../src/core/bootstrap-execution-result-envelope.js";

test("createBootstrapExecutionResultEnvelope returns canonical execution result with artifacts", () => {
  const result = createBootstrapExecutionResultEnvelope({
    rawExecutionResult: [
      {
        rawExecutionResult: {
          surfaceId: "agent-runtime",
          status: "invoked",
          commandResults: [{ commandId: "command-1" }, { commandId: "command-2" }],
        },
      },
    ],
    artifacts: ["app-shell", "project-root"],
  });

  assert.equal(result.executionResult.status, "invoked");
  assert.deepEqual(result.artifacts, ["app-shell", "project-root"]);
  assert.equal(result.executionResult.metadata.totalRuns, 1);
  assert.equal(result.executionResult.metadata.totalCommands, 2);
  assert.equal(result.executionResult.metadata.totalArtifacts, 2);
});

test("createBootstrapExecutionResultEnvelope falls back to unknown execution result", () => {
  const result = createBootstrapExecutionResultEnvelope();

  assert.equal(result.executionResult.status, "unknown");
  assert.deepEqual(result.artifacts, []);
  assert.equal(result.executionResult.metadata.totalRuns, 0);
});
