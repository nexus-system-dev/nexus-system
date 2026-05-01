import test from "node:test";
import assert from "node:assert/strict";

import { createOwnerMfaEnforcement } from "../src/core/owner-mfa-enforcement.js";

test("owner MFA enforcement requires enrollment for authenticated owner login without MFA", () => {
  const { ownerMfaDecision } = createOwnerMfaEnforcement({
    ownerAuthState: {
      userId: "owner-1",
      isOwner: true,
      hasMfa: false,
    },
    authenticationState: {
      isAuthenticated: true,
      authMetadata: {
        hasMfa: false,
      },
    },
    sessionSecurityDecision: {
      isBlocked: false,
    },
  });

  assert.equal(ownerMfaDecision.decision, "required");
  assert.equal(ownerMfaDecision.trigger, "login");
  assert.equal(ownerMfaDecision.requiresEnrollment, true);
  assert.equal(ownerMfaDecision.canProceed, false);
});

test("owner MFA enforcement requires challenge for privileged actions with enrolled MFA", () => {
  const { ownerMfaDecision } = createOwnerMfaEnforcement({
    ownerAuthState: {
      userId: "owner-2",
      isOwner: true,
      hasMfa: true,
    },
    authenticationState: {
      isAuthenticated: true,
      authMetadata: {
        hasMfa: true,
      },
    },
    sessionSecurityDecision: {
      isBlocked: false,
    },
    requestContext: {
      privilegedMode: true,
    },
  });

  assert.equal(ownerMfaDecision.decision, "challenge-required");
  assert.equal(ownerMfaDecision.requiresChallenge, true);
  assert.equal(ownerMfaDecision.canProceed, false);
});

test("owner MFA enforcement blocks when session security already blocked access", () => {
  const { ownerMfaDecision } = createOwnerMfaEnforcement({
    ownerAuthState: {
      userId: "owner-3",
      isOwner: true,
      hasMfa: true,
    },
    authenticationState: {
      isAuthenticated: true,
      authMetadata: {
        hasMfa: true,
      },
    },
    sessionSecurityDecision: {
      isBlocked: true,
      reason: "Suspicious session activity detected",
    },
  });

  assert.equal(ownerMfaDecision.decision, "blocked");
  assert.equal(ownerMfaDecision.canProceed, false);
  assert.equal(ownerMfaDecision.reason, "Suspicious session activity detected");
});
