import test from "node:test";
import assert from "node:assert/strict";

import { defineSystemCapabilityRegistrySchema } from "../src/core/system-capability-registry-schema.js";
import { createSystemCapabilityResolver } from "../src/core/system-capability-resolver.js";

test("system capability registry schema records supported workflows, limits, and execution modes", () => {
  const { systemCapabilityRegistry } = defineSystemCapabilityRegistrySchema({
    productBoundaryModel: {
      productBoundaryModelId: "product-boundary:nexus",
      automationClass: "governed-automation",
      supportedWorkflows: ["analyze-project", "action:view", "action:deploy"],
      unsupportedOperations: ["production-deploy"],
    },
    capabilityLimitMap: {
      capabilityLimitMapId: "capability-limit-map:nexus",
      limits: ["approval-required"],
    },
    executionModes: ["sandbox", "temp-branch"],
  });

  assert.equal(systemCapabilityRegistry.status, "ready");
  assert.equal(systemCapabilityRegistry.executionModes.includes("temp-branch"), true);
  assert.equal(systemCapabilityRegistry.summary.supportedCount >= 1, true);
  assert.equal(systemCapabilityRegistry.capabilities.some((entry) => entry.workflow === "action:deploy"), true);
});

test("system capability resolver returns supported, approval-gated, and unsupported decisions", () => {
  const { systemCapabilityRegistry } = defineSystemCapabilityRegistrySchema({
    productBoundaryModel: {
      productBoundaryModelId: "product-boundary:nexus",
      supportedWorkflows: ["action:view", "action:deploy"],
      unsupportedOperations: ["action:destroy"],
    },
    capabilityLimitMap: {
      capabilityLimitMapId: "capability-limit-map:nexus",
      limits: ["approval-required"],
    },
    executionModes: ["sandbox"],
  });

  const { capabilityDecision: supportedDecision } = createSystemCapabilityResolver({
    systemCapabilityRegistry,
    requestedAction: "view",
    workspaceModel: { workspaceId: "workspace-1" },
  });
  const { capabilityDecision: approvalDecision } = createSystemCapabilityResolver({
    systemCapabilityRegistry,
    requestedAction: "deploy",
    workspaceModel: { workspaceId: "workspace-1" },
  });
  const { capabilityDecision: unsupportedDecision } = createSystemCapabilityResolver({
    systemCapabilityRegistry,
    requestedAction: "destroy",
    workspaceModel: { workspaceId: "workspace-1" },
  });

  assert.equal(supportedDecision.decision, "requires-approval");
  assert.equal(approvalDecision.requiresApproval, true);
  assert.equal(unsupportedDecision.decision, "unsupported");
});
