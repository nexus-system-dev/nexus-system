import test from "node:test";
import assert from "node:assert/strict";

import { createLocalCodingAgentAdapter } from "../src/core/local-coding-agent-adapter.js";

test("local coding agent adapter becomes ready for local-terminal execution with workspace binding", () => {
  const { localCodingAgentAdapter } = createLocalCodingAgentAdapter({
    ideAgentExecutorContract: {
      selectedMode: "local-terminal",
      handoff: {
        workspacePath: "/workspace/app",
      },
      summary: {
        canExecuteInIde: true,
      },
    },
    localDevelopmentBridge: {
      capabilities: {
        supportsCommandExecution: true,
        supportsWriteback: true,
        supportedActions: ["local-command-execution", "write-file"],
      },
      guardrails: {
        requiresNexusContext: true,
        handoffMode: "optional-bridge",
        isPrimaryWorkspace: false,
      },
      environment: {
        workspacePath: "/workspace/app",
      },
    },
    actionToProviderMapping: {
      actionToProviderMappingId: "action-to-provider:req-1",
      providerType: "hosting",
      targetSurface: "local-terminal",
      operationTypes: ["deploy"],
    },
    commandConsoleView: {
      commands: [
        { commandId: "cmd-1", command: "npm run build", status: "running", executionMode: "local-terminal" },
      ],
    },
    fileEditorContract: {
      editor: {
        activeFilePath: "src/app.js",
      },
    },
    developmentWorkspace: {
      navigation: {
        focusedZone: "code-zone",
      },
    },
  });

  assert.equal(localCodingAgentAdapter.status, "ready");
  assert.equal(localCodingAgentAdapter.adapterMode, "local-terminal");
  assert.equal(localCodingAgentAdapter.handoff.activeFilePath, "src/app.js");
  assert.equal(localCodingAgentAdapter.summary.canRunLocalCodingAgent, true);
  assert.equal(localCodingAgentAdapter.capabilities.supportsWriteback, true);
});

test("local coding agent adapter blocks non-local executor modes", () => {
  const { localCodingAgentAdapter } = createLocalCodingAgentAdapter({
    ideAgentExecutorContract: {
      selectedMode: "xcode",
      summary: {
        canExecuteInIde: true,
      },
    },
    localDevelopmentBridge: {
      capabilities: {
        supportsCommandExecution: true,
      },
      guardrails: {
        requiresNexusContext: true,
      },
      environment: {
        workspacePath: "/workspace/app",
      },
    },
    actionToProviderMapping: {
      actionToProviderMappingId: "action-to-provider:req-2",
      providerType: "ios-build",
      targetSurface: "xcode",
      operationTypes: ["archive"],
    },
  });

  assert.equal(localCodingAgentAdapter.status, "blocked");
  assert.equal(localCodingAgentAdapter.blockedReasons.includes("non-local-executor-mode"), true);
  assert.equal(localCodingAgentAdapter.summary.canRunLocalCodingAgent, false);
});

test("local coding agent adapter blocks when local execution support is missing", () => {
  const { localCodingAgentAdapter } = createLocalCodingAgentAdapter({
    ideAgentExecutorContract: {
      selectedMode: "local-terminal",
      handoff: {
        workspacePath: null,
      },
      summary: {
        canExecuteInIde: false,
      },
    },
    localDevelopmentBridge: {
      capabilities: {
        supportsCommandExecution: false,
      },
      guardrails: {
        requiresNexusContext: true,
      },
      environment: {
        workspacePath: null,
      },
    },
    actionToProviderMapping: {
      actionToProviderMappingId: "action-to-provider:req-3",
      providerType: "hosting",
      targetSurface: "local-terminal",
      operationTypes: ["deploy"],
    },
  });

  assert.equal(localCodingAgentAdapter.status, "blocked");
  assert.equal(localCodingAgentAdapter.blockedReasons.includes("ide-executor-unready"), true);
  assert.equal(localCodingAgentAdapter.blockedReasons.includes("local-command-execution-unsupported"), true);
  assert.equal(localCodingAgentAdapter.blockedReasons.includes("workspace-path-missing"), true);
});
