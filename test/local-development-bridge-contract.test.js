import test from "node:test";
import assert from "node:assert/strict";

import { createLocalDevelopmentBridgeContract } from "../src/core/local-development-bridge-contract.js";

test("local development bridge contract returns canonical local IDE bridge", () => {
  const { localDevelopmentBridge } = createLocalDevelopmentBridgeContract({
    executionTopology: {
      topologyId: "execution-topology:giftwallet",
      projectId: "giftwallet",
      topologies: [
        {
          mode: "local-terminal",
          topologyType: "local",
          runnerType: "local-runner",
          readiness: "ready",
          capabilities: ["local-command-execution"],
        },
      ],
    },
    localEnvironmentMetadata: {
      isConnected: true,
      workspacePath: "/tmp/giftwallet",
      os: "macos",
      ide: {
        name: "VS Code",
        type: "editor",
      },
      runtime: {
        name: "node",
      },
      sync: {
        enabled: true,
        writeback: true,
      },
      handoffMode: "optional-bridge",
    },
  });

  assert.equal(localDevelopmentBridge.bridgeId, "local-bridge:giftwallet");
  assert.equal(localDevelopmentBridge.connection.mode, "local-terminal");
  assert.equal(localDevelopmentBridge.environment.ideName, "VS Code");
  assert.equal(localDevelopmentBridge.capabilities.supportsCommandExecution, true);
  assert.equal(localDevelopmentBridge.guardrails.isPrimaryWorkspace, false);
  assert.equal(localDevelopmentBridge.summary.isReady, true);
});

test("local development bridge contract falls back to canonical empty state", () => {
  const { localDevelopmentBridge } = createLocalDevelopmentBridgeContract();

  assert.equal(localDevelopmentBridge.bridgeId, "local-bridge:unknown-project");
  assert.equal(localDevelopmentBridge.connection.mode, "local-terminal");
  assert.equal(localDevelopmentBridge.guardrails.requiresNexusContext, true);
  assert.equal(localDevelopmentBridge.summary.isReady, false);
});
