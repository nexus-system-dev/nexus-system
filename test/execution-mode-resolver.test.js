import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionModeResolver } from "../src/core/execution-mode-resolver.js";

test("execution mode resolver prefers remote mac for mobile release work", () => {
  const { executionModeDecision } = createExecutionModeResolver({
    executionTopology: {
      projectId: "mobile-app",
      defaultMode: "agent",
      topologies: [
        { mode: "agent", topologyType: "cloud" },
        { mode: "xcode", topologyType: "remote-specialized" },
      ],
    },
    taskType: "mobile",
    projectState: {
      domain: "mobile-app",
    },
    remoteMacRunner: {
      connection: {
        mode: "xcode",
      },
      summary: {
        isReady: true,
      },
    },
  });

  assert.equal(executionModeDecision.selectedMode, "xcode");
  assert.equal(executionModeDecision.selectedSource, "remote-mac-runner");
  assert.equal(executionModeDecision.summary.isControlled, true);
});

test("execution mode resolver prefers local bridge for iterative development work", () => {
  const { executionModeDecision } = createExecutionModeResolver({
    executionTopology: {
      projectId: "giftwallet",
      defaultMode: "agent",
      topologies: [
        { mode: "agent", topologyType: "cloud" },
        { mode: "local-terminal", topologyType: "local" },
      ],
    },
    taskType: "frontend",
    localDevelopmentBridge: {
      connection: {
        mode: "local-terminal",
      },
      capabilities: {
        supportsCommandExecution: true,
      },
      summary: {
        isReady: true,
      },
    },
  });

  assert.equal(executionModeDecision.selectedMode, "local-terminal");
  assert.equal(executionModeDecision.selectedSource, "local-development-bridge");
  assert.equal(executionModeDecision.summary.hasLocalOption, true);
});

test("execution mode resolver prefers branch mode for risky execution", () => {
  const { executionModeDecision } = createExecutionModeResolver({
    executionTopology: {
      projectId: "giftwallet",
      defaultMode: "agent",
      topologies: [
        { mode: "agent", topologyType: "cloud" },
        { mode: "temp-branch", topologyType: "branch" },
      ],
    },
    taskType: "backend",
    projectState: {
      riskFlags: ["migration-impact"],
    },
    cloudWorkspaceModel: {
      summary: {
        isReady: true,
      },
      surface: {
        surfaceId: "sandbox",
      },
    },
  });

  assert.equal(executionModeDecision.selectedMode, "temp-branch");
  assert.equal(executionModeDecision.selectedSource, "execution-topology");
  assert.equal(executionModeDecision.summary.isControlled, true);
});

test("execution mode resolver falls back to cloud workspace by default", () => {
  const { executionModeDecision } = createExecutionModeResolver({
    executionTopology: {
      projectId: "giftwallet",
      defaultMode: "agent",
      topologies: [
        { mode: "agent", topologyType: "cloud" },
      ],
    },
    cloudWorkspaceModel: {
      summary: {
        isReady: true,
      },
      surface: {
        surfaceId: "sandbox",
      },
    },
  });

  assert.equal(executionModeDecision.selectedMode, "sandbox");
  assert.equal(executionModeDecision.selectedSource, "cloud-workspace");
  assert.equal(executionModeDecision.summary.prefersPrimaryWorkspace, true);
});
