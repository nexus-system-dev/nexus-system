import test from "node:test";
import assert from "node:assert/strict";

import { createCapabilityPromiseAndLimitMap } from "../src/core/capability-promise-limit-map.js";

test("capability promise and limit map derives promises, limits, and disclaimers from boundary and governance truth", () => {
  const { capabilityLimitMap } = createCapabilityPromiseAndLimitMap({
    productBoundaryModel: {
      productBoundaryModelId: "product-boundary:nexus",
      automationClass: "governed-automation",
      supportedWorkflows: ["analyze-project", "action:deploy", "run-governed-execution"],
      unsupportedOperations: ["production-deploy"],
      automationPolicy: {
        requiresApproval: true,
      },
    },
    agentGovernancePolicy: {
      agentGovernancePolicyId: "agent-governance:operator",
      sandboxLevel: "controlled-write",
      allowedTools: ["read-project-state", "run-local-command", "request-approval"],
    },
  });

  assert.equal(capabilityLimitMap.status, "ready");
  assert.equal(capabilityLimitMap.workflowAreas.includes("execution"), true);
  assert.equal(capabilityLimitMap.workflowAreas.includes("approval"), true);
  assert.equal(capabilityLimitMap.promises.some((item) => item.includes("governance boundaries")), true);
  assert.equal(capabilityLimitMap.limits.includes("production-deploy"), true);
  assert.equal(capabilityLimitMap.limits.includes("approval-required"), true);
  assert.equal(capabilityLimitMap.disclaimers.some((item) => item.includes("approval")), true);
});
