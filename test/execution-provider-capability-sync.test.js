import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionProviderCapabilitySync } from "../src/core/execution-provider-capability-sync.js";

test("execution provider capability sync returns ready synchronized capability state", () => {
  const { executionProviderCapabilitySync } = createExecutionProviderCapabilitySync({
    providerCapabilities: {
      providerType: "hosting",
      capabilities: ["deploy", "validate"],
      operationTypes: ["deploy", "validate", "poll"],
    },
    providerConnector: {
      providerType: "hosting",
      status: "connected",
      operations: [{ operationType: "deploy" }],
    },
    actionToProviderMapping: {
      providerType: "hosting",
      targetSurface: "local-terminal",
      operationTypes: ["deploy"],
      summary: {
        isMapped: true,
      },
    },
    localCodingAgentAdapter: {
      status: "ready",
      adapterMode: "local-terminal",
      capabilities: {
        supportsCommandExecution: true,
      },
    },
    ideAgentExecutorContract: {
      status: "ready",
      selectedMode: "local-terminal",
      capabilities: {
        supportsRemoteAppleTooling: false,
      },
    },
  });

  assert.equal(executionProviderCapabilitySync.status, "ready");
  assert.equal(executionProviderCapabilitySync.providerType, "hosting");
  assert.equal(executionProviderCapabilitySync.synchronizedCapabilities.includes("deploy"), true);
  assert.equal(executionProviderCapabilitySync.synchronizedCapabilities.includes("local-command-execution"), true);
  assert.equal(executionProviderCapabilitySync.executionSurfaces.includes("local-terminal"), true);
  assert.equal(executionProviderCapabilitySync.summary.isSynchronized, true);
});

test("execution provider capability sync carries remote tooling capability when IDE contract exposes it", () => {
  const { executionProviderCapabilitySync } = createExecutionProviderCapabilitySync({
    providerCapabilities: {
      providerType: "ios-build",
      capabilities: ["archive"],
      operationTypes: ["archive"],
    },
    providerConnector: {
      providerType: "ios-build",
      status: "connected",
      operations: [{ operationType: "archive" }],
    },
    actionToProviderMapping: {
      providerType: "ios-build",
      targetSurface: "xcode",
      operationTypes: ["archive"],
      summary: {
        isMapped: true,
      },
    },
    localCodingAgentAdapter: {
      status: "blocked",
      adapterMode: "local-terminal",
      capabilities: {
        supportsCommandExecution: false,
      },
    },
    ideAgentExecutorContract: {
      status: "ready",
      selectedMode: "xcode",
      capabilities: {
        supportsRemoteAppleTooling: true,
      },
    },
  });

  assert.equal(executionProviderCapabilitySync.synchronizedCapabilities.includes("remote-apple-tooling"), true);
  assert.equal(executionProviderCapabilitySync.executionSurfaces.includes("xcode"), true);
});

test("execution provider capability sync blocks when mapping and capability inputs are missing", () => {
  const { executionProviderCapabilitySync } = createExecutionProviderCapabilitySync({
    providerCapabilities: {
      providerType: "generic",
      capabilities: [],
      operationTypes: [],
    },
    providerConnector: {
      providerType: "generic",
      status: "planned",
      operations: [],
    },
    actionToProviderMapping: {
      providerType: "generic",
      targetSurface: "local-terminal",
      operationTypes: [],
      summary: {
        isMapped: false,
      },
    },
    localCodingAgentAdapter: {
      status: "blocked",
      adapterMode: "local-terminal",
    },
    ideAgentExecutorContract: {
      status: "planned",
      selectedMode: "local-terminal",
    },
  });

  assert.equal(executionProviderCapabilitySync.status, "blocked");
  assert.equal(executionProviderCapabilitySync.blockedReasons.includes("action-provider-mapping-unready"), true);
  assert.equal(executionProviderCapabilitySync.blockedReasons.includes("provider-capabilities-missing"), true);
  assert.equal(executionProviderCapabilitySync.blockedReasons.includes("provider-operations-missing"), true);
});
