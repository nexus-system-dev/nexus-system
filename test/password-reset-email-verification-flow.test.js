import test from "node:test";
import assert from "node:assert/strict";

import { createPasswordResetAndEmailVerificationFlow } from "../src/core/password-reset-email-verification-flow.js";

test("password reset and email verification flow returns pending email verification state", () => {
  const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
    userIdentity: {
      userId: "user-1",
      email: "user@example.com",
      verificationStatus: "unverified",
    },
    verificationRequest: {
      flowType: "email-verification",
    },
  });

  assert.equal(verificationFlowState.flowType, "email-verification");
  assert.equal(verificationFlowState.status, "pending");
  assert.equal(typeof verificationFlowState.requestToken, "string");
  assert.equal(verificationFlowState.deliveryChannel, "email");
});

test("password reset and email verification flow returns completed password reset state", () => {
  const { verificationFlowState } = createPasswordResetAndEmailVerificationFlow({
    userIdentity: {
      userId: "user-2",
      email: "user@example.com",
      verificationStatus: "verified",
    },
    verificationRequest: {
      flowType: "password-reset",
      completed: true,
    },
  });

  assert.equal(verificationFlowState.flowType, "password-reset");
  assert.equal(verificationFlowState.status, "completed");
  assert.equal(verificationFlowState.requestToken, null);
});
