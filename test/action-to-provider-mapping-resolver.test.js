import test from "node:test";
import assert from "node:assert/strict";

import { createActionToProviderMappingResolver } from "../src/core/action-to-provider-mapping-resolver.js";

test("action-to-provider mapping resolver maps deploy routes to the active provider runtime", () => {
  const { actionToProviderMapping } = createActionToProviderMappingResolver({
    executionActionRouting: {
      executionActionRoutingId: "execution-action-routing:req-1",
      routeType: "provider-runtime",
      resolvedRoute: {
        providerType: "hosting",
        targetSurface: "sandbox",
        executionMode: "temp-branch",
        requestedOperation: "deploy",
      },
      blockedReasons: [],
    },
    providerAdapter: {
      provider: "hosting",
      target: "vercel-preview",
      executionModes: ["temp-branch"],
    },
    providerSession: {
      providerType: "hosting",
      status: "connected",
    },
    providerConnector: {
      status: "connected",
    },
    providerCapabilities: {
      capabilities: ["deploy", "validate"],
    },
    providerOperations: [{ operationType: "deploy" }, { operationType: "validate" }],
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    executionModeDecision: {
      selectedMode: "temp-branch",
    },
    sandboxDecision: {
      selectedSurface: "sandbox",
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "healthy",
      failover: {
        requested: false,
      },
    },
    credentialReference: "cred-ref",
  });

  assert.equal(actionToProviderMapping.status, "ready");
  assert.equal(actionToProviderMapping.providerType, "hosting");
  assert.equal(actionToProviderMapping.executionMode, "temp-branch");
  assert.equal(actionToProviderMapping.operationTypes.includes("deploy"), true);
  assert.equal(actionToProviderMapping.summary.isMapped, true);
});

test("action-to-provider mapping resolver preserves design import routes", () => {
  const { actionToProviderMapping } = createActionToProviderMappingResolver({
    executionActionRouting: {
      executionActionRoutingId: "execution-action-routing:req-2",
      routeType: "design-tool-import",
      resolvedRoute: {
        providerType: "figma",
        targetSurface: "manual",
        executionMode: "manual",
        requestedOperation: "import-design",
      },
      blockedReasons: [],
    },
    providerSession: {
      providerType: "figma",
      status: "connected",
    },
    providerConnector: {
      status: "connected",
    },
    providerCapabilities: {
      capabilities: ["import-design"],
    },
    providerOperations: [{ operationType: "import-design" }],
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    executionModeDecision: {
      selectedMode: "manual",
    },
    sandboxDecision: {
      selectedSurface: "manual",
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "healthy",
      failover: {
        requested: false,
      },
    },
  });

  assert.equal(actionToProviderMapping.status, "ready");
  assert.equal(actionToProviderMapping.routeType, "design-tool-import");
  assert.equal(actionToProviderMapping.operationTypes.includes("import-design"), true);
  assert.equal(actionToProviderMapping.summary.supportsRequestedOperation, true);
});

test("action-to-provider mapping resolver blocks unsafe runtime routes", () => {
  const { actionToProviderMapping } = createActionToProviderMappingResolver({
    executionActionRouting: {
      executionActionRoutingId: "execution-action-routing:req-3",
      routeType: "provider-runtime",
      resolvedRoute: {
        providerType: "hosting",
        targetSurface: "sandbox",
        executionMode: "temp-branch",
        requestedOperation: "deploy",
      },
      blockedReasons: ["provider-health-blocked"],
    },
    providerAdapter: {
      provider: "hosting",
    },
    providerSession: {
      providerType: "hosting",
      status: "connected",
    },
    providerConnector: {
      status: "connected",
    },
    providerOperations: [{ operationType: "deploy" }],
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: false,
      },
    },
    executionModeDecision: {
      selectedMode: "temp-branch",
    },
    sandboxDecision: {
      selectedSurface: "sandbox",
    },
    externalProviderHealthAndFailover: {
      lifecycleState: "failover",
      failover: {
        requested: true,
        target: "standby-runtime",
      },
    },
  });

  assert.equal(actionToProviderMapping.status, "blocked");
  assert.equal(actionToProviderMapping.blockedReasons.includes("connector-binding-unsafe"), true);
  assert.equal(actionToProviderMapping.summary.usesFallbackProvider, true);
});
