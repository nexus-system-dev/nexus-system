import test from "node:test";
import assert from "node:assert/strict";

import { createOwnerSecureAuthenticationSystem } from "../src/core/owner-secure-authentication-system.js";

test("owner secure authentication system marks authenticated owners as elevated trust", () => {
  const { ownerAuthState } = createOwnerSecureAuthenticationSystem({
    userIdentity: {
      userId: "owner-1",
    },
    authenticationState: {
      isAuthenticated: true,
      authMetadata: {
        hasMfa: true,
      },
    },
    sessionSecurityDecision: {
      decision: "valid",
      isBlocked: false,
    },
    membershipRecord: {
      role: "owner",
      roles: ["owner"],
    },
    workspaceModel: {
      workspaceId: "workspace-1",
    },
  });

  assert.equal(ownerAuthState.isOwner, true);
  assert.equal(ownerAuthState.isAuthenticated, true);
  assert.equal(ownerAuthState.trustLevel, "elevated");
  assert.equal(ownerAuthState.privilegedModeEligible, true);
  assert.equal(ownerAuthState.summary.sessionBlocked, false);
});

test("owner secure authentication system restricts blocked owner sessions", () => {
  const { ownerAuthState } = createOwnerSecureAuthenticationSystem({
    userIdentity: {
      userId: "owner-2",
    },
    authenticationState: {
      isAuthenticated: true,
      authMetadata: {
        hasMfa: false,
      },
    },
    sessionSecurityDecision: {
      decision: "suspicious",
      isBlocked: true,
    },
    membershipRecord: {
      role: "owner",
    },
  });

  assert.equal(ownerAuthState.trustLevel, "restricted");
  assert.equal(ownerAuthState.privilegedModeEligible, false);
  assert.equal(ownerAuthState.summary.sessionBlocked, true);
});
