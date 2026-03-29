import test from "node:test";
import assert from "node:assert/strict";

import { createAuthenticationRouteResolver } from "../src/core/authentication-route-resolver.js";

test("authentication route resolver sends active authenticated users to workspace", () => {
  const { authenticationRouteDecision } = createAuthenticationRouteResolver({
    authenticationState: {
      userId: "user-1",
      status: "authenticated",
      isAuthenticated: true,
    },
    sessionState: {
      userId: "user-1",
      status: "active",
      isRevoked: false,
    },
  });

  assert.equal(authenticationRouteDecision.route, "workspace");
  assert.equal(authenticationRouteDecision.isRedirect, true);
  assert.equal(authenticationRouteDecision.summary.canEnterWorkspaceDirectly, true);
});

test("authentication route resolver sends authenticated users without session to restore flow", () => {
  const { authenticationRouteDecision } = createAuthenticationRouteResolver({
    authenticationState: {
      status: "authenticated",
      isAuthenticated: true,
    },
    sessionState: {
      status: "inactive",
      isRevoked: false,
    },
  });

  assert.equal(authenticationRouteDecision.route, "session-restore");
  assert.equal(authenticationRouteDecision.nextAction, "restore-session");
  assert.equal(authenticationRouteDecision.summary.hasActiveSession, false);
});

test("authentication route resolver falls back to login for anonymous users", () => {
  const { authenticationRouteDecision } = createAuthenticationRouteResolver();

  assert.equal(authenticationRouteDecision.route, "login");
  assert.equal(Array.isArray(authenticationRouteDecision.availableRoutes), true);
  assert.equal(authenticationRouteDecision.summary.requiresAuthentication, true);
});
