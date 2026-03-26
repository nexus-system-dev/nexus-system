import test from "node:test";
import assert from "node:assert/strict";

import { createProviderSessionFactory } from "../src/core/provider-session-factory.js";

test("provider session factory returns canonical provider session", () => {
  const { providerSession } = createProviderSessionFactory({
    providerType: "hosting",
    credentials: {
      authMode: "api-key",
      credentialReference: "cred_ref_hosting",
      scopes: ["deployments.write"],
      status: "connected",
    },
  });

  assert.equal(providerSession.providerType, "hosting");
  assert.equal(providerSession.credentialReference, "cred_ref_hosting");
  assert.equal(providerSession.authMode, "api-key");
  assert.equal(providerSession.capabilities.includes("deploy"), true);
});

test("provider session factory falls back to generic provider session", () => {
  const { providerSession } = createProviderSessionFactory();

  assert.equal(providerSession.providerType, "generic");
  assert.equal(providerSession.authMode, "manual");
  assert.equal(providerSession.operationTypes.includes("validate"), true);
});
