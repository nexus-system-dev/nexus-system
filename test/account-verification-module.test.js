import test from "node:test";
import assert from "node:assert/strict";

import { createAccountVerificationModule } from "../src/core/account-verification-module.js";

test("account verification module verifies usable provider session", () => {
  const { verificationResult } = createAccountVerificationModule({
    providerSession: {
      providerType: "hosting",
      authMode: "manual",
      capabilities: ["deploy", "validate"],
    },
  });

  assert.equal(verificationResult.isVerified, true);
  assert.equal(verificationResult.status, "verified");
});

test("account verification module reports missing credential reference", () => {
  const { verificationResult } = createAccountVerificationModule({
    providerSession: {
      providerType: "hosting",
      authMode: "api-key",
      credentialReference: null,
      capabilities: ["deploy"],
    },
  });

  assert.equal(verificationResult.isVerified, false);
  assert.equal(verificationResult.status, "missing-credentials");
  assert.equal(verificationResult.blockingIssues.includes("missing-credential-reference"), true);
});
