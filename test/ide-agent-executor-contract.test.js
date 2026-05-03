import test from "node:test";
import assert from "node:assert/strict";

import { defineIdeAgentExecutorContract } from "../src/core/ide-agent-executor-contract.js";

test("IDE agent executor contract becomes ready for local terminal execution when mapping and bridge are ready", () => {
  const { ideAgentExecutorContract } = defineIdeAgentExecutorContract({
    executionModeDecision: {
      selectedMode: "local-terminal",
    },
    localDevelopmentBridge: {
      summary: {
        isReady: true,
      },
      connection: {
        runnerType: "local-runner",
      },
      environment: {
        workspacePath: "/workspace/app",
      },
      capabilities: {
        supportsCommandExecution: true,
        supportedActions: ["local-command-execution"],
      },
      guardrails: {
        requiresNexusContext: true,
        handoffMode: "optional-bridge",
      },
    },
    remoteMacRunner: {
      summary: {
        isReady: false,
      },
      capabilities: {
        supportsAppleTooling: true,
      },
      signing: {
        requiresManualApproval: false,
      },
    },
    actionToProviderMapping: {
      actionToProviderMappingId: "action-to-provider:req-1",
      providerType: "hosting",
      targetSurface: "local-terminal",
      operationTypes: ["deploy"],
      summary: {
        isMapped: true,
      },
    },
    commandConsoleView: {
      commands: [{ command: "npm run build" }],
    },
  });

  assert.equal(ideAgentExecutorContract.status, "ready");
  assert.equal(ideAgentExecutorContract.executorType, "local-runner");
  assert.equal(ideAgentExecutorContract.handoff.workspacePath, "/workspace/app");
  assert.equal(ideAgentExecutorContract.summary.canExecuteInIde, true);
  assert.equal(ideAgentExecutorContract.summary.requiresLocalAdapter, true);
});

test("IDE agent executor contract becomes ready for Xcode execution when remote runner is ready", () => {
  const { ideAgentExecutorContract } = defineIdeAgentExecutorContract({
    executionModeDecision: {
      selectedMode: "xcode",
    },
    localDevelopmentBridge: {
      summary: {
        isReady: false,
      },
      guardrails: {
        requiresNexusContext: true,
        handoffMode: "optional-bridge",
      },
    },
    remoteMacRunner: {
      summary: {
        isReady: true,
      },
      connection: {
        runnerType: "remote-xcode-runner",
        host: "remote-mac-host",
      },
      capabilities: {
        supportsAppleTooling: true,
        supportedActions: ["archive", "sign"],
      },
      signing: {
        requiresManualApproval: true,
      },
    },
    actionToProviderMapping: {
      actionToProviderMappingId: "action-to-provider:req-2",
      providerType: "ios-build",
      targetSurface: "xcode",
      operationTypes: ["archive"],
      summary: {
        isMapped: true,
      },
    },
    commandConsoleView: {
      commands: [{ command: "xcodebuild archive" }],
    },
  });

  assert.equal(ideAgentExecutorContract.status, "ready");
  assert.equal(ideAgentExecutorContract.executorType, "remote-xcode-runner");
  assert.equal(ideAgentExecutorContract.handoff.host, "remote-mac-host");
  assert.equal(ideAgentExecutorContract.guardrails.requiresApproval, true);
  assert.equal(ideAgentExecutorContract.summary.requiresRemoteAdapter, true);
});

test("IDE agent executor contract blocks when action mapping is not ready", () => {
  const { ideAgentExecutorContract } = defineIdeAgentExecutorContract({
    executionModeDecision: {
      selectedMode: "local-terminal",
    },
    localDevelopmentBridge: {
      summary: {
        isReady: true,
      },
      connection: {
        runnerType: "local-runner",
      },
      capabilities: {
        supportsCommandExecution: true,
      },
      guardrails: {
        requiresNexusContext: true,
        handoffMode: "optional-bridge",
      },
    },
    actionToProviderMapping: {
      summary: {
        isMapped: false,
      },
      operationTypes: [],
    },
  });

  assert.equal(ideAgentExecutorContract.status, "blocked");
  assert.equal(ideAgentExecutorContract.blockedReasons.includes("action-provider-mapping-unready"), true);
  assert.equal(ideAgentExecutorContract.summary.canExecuteInIde, false);
});
