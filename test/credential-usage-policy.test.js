import test from "node:test";
import assert from "node:assert/strict";

import { createCredentialUsagePolicy } from "../src/core/credential-usage-policy.js";

test("credential usage policy allows approved user flow", () => {
  const { credentialPolicyDecision } = createCredentialUsagePolicy({
    credentialReference: "credref_hosting-primary",
    actorType: "user",
    flowType: "deploy",
    projectState: {
      approvalStatus: {
        status: "approved",
      },
      policyDecision: {
        decision: "allowed",
      },
    },
  });

  assert.equal(credentialPolicyDecision.decision, "allowed");
  assert.equal(credentialPolicyDecision.isAllowed, true);
});

test("credential usage policy requires approval for agent deploy without approval", () => {
  const { credentialPolicyDecision } = createCredentialUsagePolicy({
    credentialReference: "credref_hosting-primary",
    actorType: "agent-runtime",
    flowType: "deploy",
    projectState: {
      approvalStatus: {
        status: "missing",
      },
      policyDecision: {
        decision: "requires-approval",
        reason: "Valid approval is required before execution",
      },
    },
  });

  assert.equal(credentialPolicyDecision.decision, "requires-approval");
  assert.equal(credentialPolicyDecision.requiresApproval, true);
});

test("credential usage policy blocks missing credential reference", () => {
  const { credentialPolicyDecision } = createCredentialUsagePolicy({
    actorType: "agent-runtime",
    flowType: "deploy",
  });

  assert.equal(credentialPolicyDecision.decision, "blocked");
  assert.equal(credentialPolicyDecision.isBlocked, true);
});
