import test from "node:test";
import assert from "node:assert/strict";

import { defineProductBoundarySchema } from "../src/core/product-boundary-schema.js";

test("product boundary schema derives governed execution boundaries from product and authorization truth", () => {
  const { productBoundaryModel } = defineProductBoundarySchema({
    productVision: {
      statement: "Help teams ship governed product changes",
      problem: "Teams lose track of safe execution boundaries",
      promise: "Nexus keeps execution moving under governance",
      audience: "product operators",
    },
    projectIdentity: {
      identityId: "project-identity:nexus",
      vision: "Help teams ship governed product changes",
      audience: "product operators",
    },
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning-product-operators",
      promise: "Nexus keeps execution moving under governance",
      audience: "product operators",
    },
    projectAuthorizationDecision: {
      decision: "requires-approval",
      requiresApproval: true,
      isBlocked: false,
      requiredCapability: "deploy",
      allowedActions: ["view", "edit", "deploy"],
      checks: ["privileged-deploy-action"],
    },
    decisionIntelligence: {
      summary: {
        canAutoExecute: false,
        requiresApproval: true,
      },
      autoExecutable: [{ decisionType: "analyze-project" }],
      uncertain: [{ decisionType: "production-deploy" }],
    },
  });

  assert.equal(productBoundaryModel.status, "ready");
  assert.equal(productBoundaryModel.automationClass, "governed-automation");
  assert.equal(productBoundaryModel.automationPolicy.requiresApproval, true);
  assert.equal(productBoundaryModel.supportedWorkflows.includes("action:deploy"), true);
  assert.equal(productBoundaryModel.unsupportedOperations.includes("production-deploy"), true);
  assert.equal(productBoundaryModel.userResponsibilities.includes("approve high-risk or privileged actions"), true);
});
