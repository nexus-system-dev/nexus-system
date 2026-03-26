import test from "node:test";
import assert from "node:assert/strict";

import { createBootstrapCommandPlanner } from "../src/core/bootstrap-command-planner.js";

test("bootstrap command planner translates auth bootstrap request into commands", () => {
  const { plannedCommands } = createBootstrapCommandPlanner({
    executionRequest: {
      requestId: "bootstrap-request-1",
      taskId: "bootstrap-saas-1",
      targetType: "agent",
      dispatchMode: "agent-runtime",
      executionInput: {
        rule: "initialize-auth-core",
        inputs: {
          domain: "saas",
          recommendedDefaults: {
            stack: {
              backend: "node",
            },
          },
        },
        expectedArtifacts: ["auth-module"],
      },
    },
  });

  assert.equal(plannedCommands.length, 1);
  assert.equal(plannedCommands[0].command, "create-auth-module");
  assert.deepEqual(plannedCommands[0].args, ["saas", "node"]);
  assert.equal(plannedCommands[0].surfaceHint, "agent-runtime");
});

test("bootstrap command planner falls back to generic bootstrap command for unknown rules", () => {
  const { plannedCommands } = createBootstrapCommandPlanner({
    executionRequest: {
      requestId: "bootstrap-request-2",
      taskId: "bootstrap-generic-1",
      targetType: "surface",
      dispatchMode: "sandbox",
      executionInput: {
        rule: "initialize-custom-flow",
        inputs: {
          domain: "generic",
        },
        expectedArtifacts: ["custom-artifact"],
      },
    },
  });

  assert.equal(plannedCommands.length, 1);
  assert.equal(plannedCommands[0].command, "initialize-custom-flow");
  assert.equal(plannedCommands[0].surfaceHint, "sandbox");
  assert.equal(plannedCommands[0].produces.includes("custom-artifact"), true);
});
