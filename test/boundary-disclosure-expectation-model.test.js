import test from "node:test";
import assert from "node:assert/strict";

import { createBoundaryDisclosureAndExpectationModel } from "../src/core/boundary-disclosure-expectation-model.js";

test("boundary disclosure model turns capability limits into user-facing expectation disclosures", () => {
  const { boundaryDisclosureModel } = createBoundaryDisclosureAndExpectationModel({
    capabilityLimitMap: {
      capabilityLimitMapId: "capability-limit-map:nexus",
      promises: ["Nexus keeps execution inside explicit governance boundaries."],
      limits: ["production-deploy", "approval-required"],
      disclaimers: ["High-risk actions may require explicit approval before execution."],
      nonGoals: ["Nexus does not replace final business judgment."],
    },
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus",
      headline: "Nexus executes scoped work with governed multi-agent flows",
    },
  });

  assert.equal(boundaryDisclosureModel.status, "ready");
  assert.equal(boundaryDisclosureModel.expectationFlags.requiresApprovalDisclosure, true);
  assert.equal(boundaryDisclosureModel.disclosureCards.length, 3);
  assert.equal(boundaryDisclosureModel.disclosureCards[0].bullets.includes("Nexus keeps execution inside explicit governance boundaries."), true);
  assert.equal(boundaryDisclosureModel.disclosureCards[2].bullets.includes("production-deploy"), true);
});
