import test from "node:test";
import assert from "node:assert/strict";

import { createBootstrapDispatcher } from "../src/core/bootstrap-dispatcher.js";

test("bootstrap dispatcher assigns bootstrap tasks to agent runtime when capabilities match", () => {
  const { bootstrapAssignments } = createBootstrapDispatcher({
    bootstrapTasks: [
      {
        id: "bootstrap-saas-1",
        rule: "initialize-auth-core",
        summary: "Bootstrap: initialize-auth-core",
      },
      {
        id: "bootstrap-saas-2",
        rule: "initialize-billing-foundation",
        summary: "Bootstrap: initialize-billing-foundation",
      },
    ],
    executionCapabilities: [
      {
        type: "agent",
        id: "dev-agent",
        capabilities: ["backend", "security", "payments"],
      },
      {
        type: "surface",
        id: "temp-branch",
        mode: "temp-branch",
        capabilities: ["bootstrap", "backend"],
      },
    ],
  });

  assert.equal(bootstrapAssignments.length, 2);
  assert.equal(bootstrapAssignments[0].targetType, "agent");
  assert.equal(bootstrapAssignments[0].targetId, "dev-agent");
  assert.equal(bootstrapAssignments[0].dispatchMode, "agent-runtime");
  assert.equal(bootstrapAssignments[1].requiredCapabilities.includes("payments"), true);
});

test("bootstrap dispatcher falls back to execution surface when no agent matches", () => {
  const { bootstrapAssignments } = createBootstrapDispatcher({
    bootstrapTasks: [
      {
        id: "bootstrap-generic-1",
        rule: "create-initial-structure",
        summary: "Bootstrap: create-initial-structure",
      },
    ],
    executionCapabilities: [
      {
        type: "surface",
        id: "sandbox",
        mode: "sandbox",
        capabilities: ["bootstrap", "backend"],
      },
    ],
  });

  assert.equal(bootstrapAssignments[0].targetType, "surface");
  assert.equal(bootstrapAssignments[0].targetId, "sandbox");
  assert.equal(bootstrapAssignments[0].status, "assigned");
});
