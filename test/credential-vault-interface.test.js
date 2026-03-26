import test from "node:test";
import assert from "node:assert/strict";

import { createCredentialVaultInterface } from "../src/core/credential-vault-interface.js";

test("credential vault interface returns canonical secret reference", () => {
  const { credentialReference, credentialVaultRecord } = createCredentialVaultInterface({
    credentialKey: "Hosting Primary Key",
    credentialValue: "secret-value",
  });

  assert.equal(credentialReference, "credref_hosting-primary-key");
  assert.equal(credentialVaultRecord.status, "stored");
  assert.equal(credentialVaultRecord.secretReferenceLifecycle.created, true);
});

test("credential vault interface tracks pending lifecycle when value missing", () => {
  const { credentialVaultRecord } = createCredentialVaultInterface({
    credentialKey: "runtime-token",
    credentialValue: null,
  });

  assert.equal(credentialVaultRecord.status, "pending");
  assert.equal(credentialVaultRecord.secretReferenceLifecycle.resolved, false);
});
