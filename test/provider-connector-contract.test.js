import test from "node:test";
import assert from "node:assert/strict";

import { createProviderConnectorContract } from "../src/core/provider-connector-contract.js";

test("provider connector contract returns canonical provider session", () => {
  const { providerSession } = createProviderConnectorContract({
    providerType: "hosting",
    credentials: {
      credentialReference: "cred_ref_hosting",
      authMode: "api-key",
      scopes: ["deployments.write"],
      status: "connected",
    },
  });

  assert.equal(providerSession.providerType, "hosting");
  assert.equal(providerSession.credentialReference, "cred_ref_hosting");
  assert.equal(providerSession.authMode, "api-key");
  assert.equal(providerSession.capabilities.includes("deploy"), true);
  assert.equal(providerSession.operationTypes.includes("poll"), true);
});

test("provider connector contract falls back to generic provider session", () => {
  const { providerSession } = createProviderConnectorContract();

  assert.equal(providerSession.providerType, "generic");
  assert.equal(providerSession.authMode, "manual");
  assert.equal(providerSession.capabilities.includes("validate"), true);
});
