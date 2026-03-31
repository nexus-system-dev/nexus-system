import test from "node:test";
import assert from "node:assert/strict";

import { createAuthMiddleware } from "../src/core/auth-middleware.js";

test("auth middleware returns authenticated request when session and access are valid", () => {
  const { authenticatedRequest } = createAuthMiddleware({
    requestContext: {
      requestId: "request-1",
      projectId: "project-1",
    },
    sessionState: {
      sessionId: "session-1",
      status: "active",
      userId: "user-1",
    },
    authenticationState: {
      isAuthenticated: true,
      userId: "user-1",
    },
    accessDecision: {
      canView: true,
      effectiveRole: "owner",
      allowedActions: ["view", "edit"],
    },
  });

  assert.equal(authenticatedRequest.authStatus, "authenticated");
  assert.equal(authenticatedRequest.hasWorkspaceAccess, true);
  assert.equal(authenticatedRequest.effectiveRole, "owner");
});

test("auth middleware returns forbidden request when workspace access is missing", () => {
  const { authenticatedRequest } = createAuthMiddleware({
    requestContext: {
      requestId: "request-2",
    },
    sessionState: {
      sessionId: "session-2",
      status: "active",
      userId: "user-2",
    },
    authenticationState: {
      isAuthenticated: true,
      userId: "user-2",
    },
    accessDecision: {
      canView: false,
      reason: "Workspace access denied",
    },
  });

  assert.equal(authenticatedRequest.authStatus, "forbidden");
  assert.equal(authenticatedRequest.hasWorkspaceAccess, false);
});

test("auth middleware rejects blocked sessions from session security controls", () => {
  const { authenticatedRequest } = createAuthMiddleware({
    requestContext: {
      requestId: "request-3",
    },
    sessionState: {
      sessionId: "session-3",
      status: "active",
      userId: "user-3",
      isRevoked: false,
    },
    authenticationState: {
      isAuthenticated: true,
      userId: "user-3",
    },
    accessDecision: {
      canView: true,
      effectiveRole: "owner",
    },
    sessionSecurityDecision: {
      decision: "suspicious",
      isBlocked: true,
      reason: "Suspicious session activity detected",
    },
  });

  assert.equal(authenticatedRequest.authStatus, "unauthenticated");
  assert.equal(authenticatedRequest.isAuthenticated, false);
  assert.equal(authenticatedRequest.reason, "Suspicious session activity detected");
});
