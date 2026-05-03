import test from "node:test";
import assert from "node:assert/strict";

import { defineExecutionActionRoutingSchema } from "../src/core/execution-action-routing-schema.js";

test("execution action routing schema resolves provider runtime deploy routing when runtime path is healthy", () => {
  const { executionActionRouting } = defineExecutionActionRoutingSchema({
    executionRequest: {
      executionRequestId: "req-1",
      actionType: "deploy-release",
      workflow: "action:deploy-release",
      operationType: "deploy",
    },
    sourceControlIntegration: {
      status: "ready",
    },
    designToolImportAdapter: {
      status: "ready",
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    externalProviderHealthAndFailover: {
      integrationStatus: "connected",
    },
    providerSession: {
      providerType: "hosting",
    },
    providerAdapter: {
      provider: "hosting",
    },
    providerOperations: [{ operationType: "deploy" }, { operationType: "validate" }],
    executionModeDecision: {
      selectedMode: "temp-branch",
    },
    sandboxDecision: {
      selectedSurface: "sandbox",
    },
  });

  assert.equal(executionActionRouting.status, "ready");
  assert.equal(executionActionRouting.routeType, "provider-runtime");
  assert.equal(executionActionRouting.resolvedRoute.providerType, "hosting");
  assert.equal(executionActionRouting.resolvedRoute.requestedOperation, "deploy");
  assert.equal(executionActionRouting.summary.isRoutable, true);
});

test("execution action routing schema resolves design imports through the design tool adapter", () => {
  const { executionActionRouting } = defineExecutionActionRoutingSchema({
    executionRequest: {
      executionRequestId: "req-2",
      actionType: "import-design-proposal",
      workflow: "action:import-design-proposal",
      operationType: "validate",
    },
    designToolImportAdapter: {
      status: "ready",
    },
    sourceControlIntegration: {
      status: "ready",
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: true,
      },
    },
    externalProviderHealthAndFailover: {
      integrationStatus: "connected",
    },
    providerSession: {
      providerType: "figma",
    },
    providerAdapter: {
      provider: "figma",
    },
    providerOperations: [{ operationType: "validate" }],
    executionModeDecision: {
      selectedMode: "manual",
    },
    sandboxDecision: {
      selectedSurface: "manual",
    },
  });

  assert.equal(executionActionRouting.status, "ready");
  assert.equal(executionActionRouting.routeType, "design-tool-import");
  assert.equal(executionActionRouting.resolvedRoute.requestedOperation, "import-design");
  assert.equal(executionActionRouting.summary.usesDesignToolImport, true);
});

test("execution action routing schema blocks provider runtime routes when connector binding is unsafe", () => {
  const { executionActionRouting } = defineExecutionActionRoutingSchema({
    executionRequest: {
      executionRequestId: "req-3",
      actionType: "deploy-release",
      workflow: "action:deploy-release",
      operationType: "deploy",
    },
    connectorCredentialBinding: {
      summary: {
        safeForRuntimeUse: false,
      },
    },
    externalProviderHealthAndFailover: {
      integrationStatus: "blocked",
    },
    providerSession: {
      providerType: "hosting",
    },
    providerAdapter: {
      provider: "hosting",
    },
    providerOperations: [{ operationType: "deploy" }],
    executionModeDecision: {
      selectedMode: "temp-branch",
    },
    sandboxDecision: {
      selectedSurface: "sandbox",
    },
  });

  assert.equal(executionActionRouting.status, "blocked");
  assert.equal(executionActionRouting.blockedReasons.includes("connector-binding-unsafe"), true);
  assert.equal(executionActionRouting.blockedReasons.includes("provider-health-blocked"), true);
});
