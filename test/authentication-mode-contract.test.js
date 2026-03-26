import test from "node:test";
import assert from "node:assert/strict";

import { createAuthenticationModeContract } from "../src/core/authentication-mode-contract.js";

test("authentication mode contract returns supported mode for provider", () => {
  const { authModeDefinition } = createAuthenticationModeContract({
    providerType: "hosting",
    credentials: {
      authMode: "api-key",
      credentialReference: "cred_ref_hosting",
      scopes: ["deployments.write"],
      status: "connected",
    },
  });

  assert.equal(authModeDefinition.providerType, "hosting");
  assert.equal(authModeDefinition.authMode, "api-key");
  assert.equal(authModeDefinition.supportedAuthModes.includes("oauth"), true);
  assert.equal(authModeDefinition.requiresCredentials, true);
});

test("authentication mode contract falls back to supported provider mode", () => {
  const { authModeDefinition } = createAuthenticationModeContract({
    providerType: "generic",
    credentials: {
      authMode: "oauth",
    },
  });

  assert.equal(authModeDefinition.providerType, "generic");
  assert.equal(authModeDefinition.authMode, "manual");
  assert.equal(authModeDefinition.requiresCredentials, false);
});
