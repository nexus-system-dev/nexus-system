import test from "node:test";
import assert from "node:assert/strict";

import { defineUserIdentitySchema } from "../src/core/user-identity-schema.js";

test("user identity schema returns canonical user identity", () => {
  const { userIdentity } = defineUserIdentitySchema({
    userProfile: {
      userId: "user-1",
      email: "user@example.com",
      displayName: "User One",
      status: "active",
      verificationStatus: "verified",
    },
    authMetadata: {
      provider: "github",
      sessionStatus: "authenticated",
      hasMfa: true,
      lastLoginAt: "2025-01-01T10:00:00.000Z",
    },
  });

  assert.equal(userIdentity.userId, "user-1");
  assert.equal(userIdentity.email, "user@example.com");
  assert.equal(userIdentity.displayName, "User One");
  assert.equal(userIdentity.verificationStatus, "verified");
  assert.equal(userIdentity.authMetadata.provider, "github");
  assert.equal(userIdentity.authMetadata.hasMfa, true);
});

test("user identity schema falls back to canonical defaults", () => {
  const { userIdentity } = defineUserIdentitySchema();

  assert.equal(userIdentity.userId, null);
  assert.equal(userIdentity.displayName, "anonymous-user");
  assert.equal(userIdentity.status, "active");
  assert.equal(userIdentity.authMetadata.provider, "password");
});
