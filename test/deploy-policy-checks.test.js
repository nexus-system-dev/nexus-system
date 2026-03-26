import test from "node:test";
import assert from "node:assert/strict";

import { createDeployPolicyChecks } from "../src/core/deploy-policy-checks.js";

test("deploy policy checks require approval for production deploy without approval", () => {
  const { deployPolicyDecision } = createDeployPolicyChecks({
    deploymentRequest: {
      target: "web-deployment",
      environment: "production",
      buildArtifacts: ["app.tar.gz"],
    },
    projectState: {
      approvalStatus: {
        status: "missing",
        reason: "Approval record is missing",
      },
      guardResult: {
        isAllowed: true,
      },
      validationReport: {
        isReady: true,
      },
      credentialPolicyDecision: {
        isBlocked: false,
      },
    },
  });

  assert.equal(deployPolicyDecision.decision, "requires-approval");
  assert.equal(deployPolicyDecision.requiresApproval, true);
  assert.equal(deployPolicyDecision.checks.includes("production-approval-required"), true);
});

test("deploy policy checks block deploy when ownership or validation fails", () => {
  const { deployPolicyDecision } = createDeployPolicyChecks({
    deploymentRequest: {
      target: "app-store",
      environment: "staging",
      buildArtifacts: ["ios.ipa"],
    },
    projectState: {
      approvalStatus: {
        status: "approved",
      },
      guardResult: {
        isAllowed: false,
        reason: "release flow is not yet mapped to owned accounts or owned distribution targets",
      },
      validationReport: {
        isReady: false,
      },
      credentialPolicyDecision: {
        isBlocked: false,
      },
    },
  });

  assert.equal(deployPolicyDecision.decision, "blocked");
  assert.equal(deployPolicyDecision.isBlocked, true);
  assert.equal(deployPolicyDecision.checks.includes("ownership-guard-blocked"), true);
  assert.equal(deployPolicyDecision.checks.includes("release-validation-blocked"), true);
});
