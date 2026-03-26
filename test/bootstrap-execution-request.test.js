import test from "node:test";
import assert from "node:assert/strict";

import { defineBootstrapExecutionRequestSchema } from "../src/core/bootstrap-execution-request.js";

test("bootstrap execution request schema returns canonical execution request", () => {
  const executionRequest = defineBootstrapExecutionRequestSchema({
    bootstrapAssignment: {
      assignmentId: "bootstrap-assignment-1",
      taskId: "bootstrap-saas-1",
      targetType: "agent",
      targetId: "dev-agent",
      dispatchMode: "agent-runtime",
      status: "assigned",
      requiredCapabilities: ["backend", "security"],
      task: {
        id: "bootstrap-saas-1",
        rule: "initialize-auth-core",
        summary: "Bootstrap: initialize-auth-core",
        inputs: {
          domain: "saas",
        },
        expectedArtifacts: {
          structure: ["project-root", "readme"],
          stack: ["nextjs", "node"],
        },
      },
    },
  });

  assert.equal(executionRequest.requestId, "bootstrap-request-bootstrap-assignment-1");
  assert.equal(executionRequest.assignmentId, "bootstrap-assignment-1");
  assert.equal(executionRequest.taskId, "bootstrap-saas-1");
  assert.equal(executionRequest.targetType, "agent");
  assert.equal(executionRequest.targetId, "dev-agent");
  assert.equal(executionRequest.commandType, "bootstrap");
  assert.equal(executionRequest.executionInput.rule, "initialize-auth-core");
  assert.equal(executionRequest.executionInput.expectedArtifacts.includes("project-root"), true);
  assert.equal(executionRequest.executionMetadata.requiredCapabilities.includes("security"), true);
});
