import test from "node:test";
import assert from "node:assert/strict";

import { createCredentialEncryptionModule } from "../src/core/credential-encryption-module.js";

test("credential encryption module returns encrypted credential payload", () => {
  const { encryptedCredential } = createCredentialEncryptionModule({
    plainCredential: "super-secret-value",
  });

  assert.equal(encryptedCredential.algorithm, "aes-256-cbc");
  assert.equal(typeof encryptedCredential.iv, "string");
  assert.equal(typeof encryptedCredential.ciphertext, "string");
});

test("credential encryption module returns null when value missing", () => {
  const { encryptedCredential } = createCredentialEncryptionModule({
    plainCredential: null,
  });

  assert.equal(encryptedCredential, null);
});
