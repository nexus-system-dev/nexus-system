import test from "node:test";
import assert from "node:assert/strict";

import { createPrivilegedActionAuthorityResolver } from "../src/core/privileged-action-authority-resolver.js";

test("privileged action authority resolver requires approval for privileged deploy", () => {
  const { privilegedAuthorityDecision } = createPrivilegedActionAuthorityResolver({
    projectAuthorizationDecision: {
      projectAction: "deploy",
      requiredCapability: "deploy",
      decision: "requires-approval",
      requiresApproval: true,
      isBlocked: false,
      reason: "Production deploy requires approval",
    },
    approvalStatus: {
      status: "pending",
      reason: "Awaiting production approval",
    },
    deployPolicyDecision: {
      decision: "requires-approval",
      requiresApproval: true,
      isBlocked: false,
      reason: "Production deploy requires approval",
    },
  });

  assert.equal(privilegedAuthorityDecision.isPrivilegedAction, true);
  assert.equal(privilegedAuthorityDecision.decision, "requires-approval");
  assert.equal(privilegedAuthorityDecision.requiresApproval, true);
  assert.equal(privilegedAuthorityDecision.checks.includes("deploy-policy-requires-approval"), true);
});

test("privileged action authority resolver blocks rejected credential usage", () => {
  const { privilegedAuthorityDecision } = createPrivilegedActionAuthorityResolver({
    projectAuthorizationDecision: {
      projectAction: "credential-use",
      requiredCapability: "manageCredentials",
      decision: "allowed",
      requiresApproval: false,
      isBlocked: false,
    },
    approvalStatus: {
      status: "rejected",
      reason: "User rejected credential usage",
    },
    credentialPolicyDecision: {
      decision: "blocked",
      requiresApproval: false,
      isBlocked: true,
      reason: "Credential policy blocked this action",
    },
  });

  assert.equal(privilegedAuthorityDecision.decision, "blocked");
  assert.equal(privilegedAuthorityDecision.isBlocked, true);
  assert.equal(privilegedAuthorityDecision.checks.includes("approval-rejected"), true);
  assert.equal(privilegedAuthorityDecision.reason, "Credential policy blocked this action");
});

test("privileged action authority resolver marks non-sensitive actions as not required", () => {
  const { privilegedAuthorityDecision } = createPrivilegedActionAuthorityResolver({
    projectAuthorizationDecision: {
      projectAction: "view",
      requiredCapability: "view",
      decision: "allowed",
      requiresApproval: false,
      isBlocked: false,
    },
    approvalStatus: {
      status: "approved",
    },
  });

  assert.equal(privilegedAuthorityDecision.decision, "not-required");
  assert.equal(privilegedAuthorityDecision.isPrivilegedAction, false);
  assert.equal(privilegedAuthorityDecision.isAllowed, true);
});
