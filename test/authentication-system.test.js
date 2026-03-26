import test from "node:test";
import assert from "node:assert/strict";

import { createAuthenticationSystem } from "../src/core/authentication-system.js";

test("authentication system returns authenticated state for verified user with password credentials", () => {
  const { authenticationState } = createAuthenticationSystem({
    userIdentity: {
      userId: "user-1",
      email: "user@example.com",
      verificationStatus: "verified",
      authMetadata: {
        provider: "password",
        sessionStatus: "authenticated",
        hasMfa: true,
      },
    },
    credentials: {
      password: "secret",
    },
  });

  assert.equal(authenticationState.status, "authenticated");
  assert.equal(authenticationState.isAuthenticated, true);
  assert.equal(authenticationState.requiresVerification, false);
  assert.equal(authenticationState.authMethod, "password");
});

test("authentication system returns anonymous state when no user identity exists", () => {
  const { authenticationState } = createAuthenticationSystem();

  assert.equal(authenticationState.status, "anonymous");
  assert.equal(authenticationState.isAuthenticated, false);
  assert.equal(authenticationState.loginState, "idle");
});
