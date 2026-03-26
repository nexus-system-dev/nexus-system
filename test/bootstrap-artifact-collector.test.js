import assert from "node:assert/strict";
import test from "node:test";

import { createBootstrapArtifactCollector } from "../src/core/bootstrap-artifact-collector.js";

test("createBootstrapArtifactCollector aggregates produced bootstrap artifacts", () => {
  const result = createBootstrapArtifactCollector({
    rawExecutionResult: [
      {
        rawExecutionResult: {
          requestId: "request-1",
          taskId: "task-1",
          surfaceId: "agent-runtime",
          surfaceType: "agent",
          readiness: "ready",
          status: "invoked",
          commandResults: [
            { producedArtifacts: ["app-shell", "project-root"] },
            { producedArtifacts: ["auth-module"] },
          ],
        },
      },
    ],
  });

  assert.deepEqual(result.artifacts, ["app-shell", "project-root", "auth-module"]);
  assert.equal(result.executionMetadata.totalRuns, 1);
  assert.equal(result.executionMetadata.totalArtifacts, 3);
  assert.equal(result.executionMetadata.runs[0].artifactCount, 3);
});

test("createBootstrapArtifactCollector falls back to empty metadata", () => {
  const result = createBootstrapArtifactCollector();

  assert.deepEqual(result.artifacts, []);
  assert.equal(result.executionMetadata.totalRuns, 0);
  assert.equal(result.executionMetadata.totalArtifacts, 0);
});
