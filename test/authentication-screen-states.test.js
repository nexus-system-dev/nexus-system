import test from "node:test";
import assert from "node:assert/strict";

import { buildAuthenticationScreenStates } from "../src/core/authentication-screen-states.js";

test("authentication screen states activates signup screen for identified users", () => {
  const { authenticationViewState } = buildAuthenticationScreenStates({
    authenticationRouteDecision: {
      decisionId: "decision-1",
      route: "signup",
      reason: "identified-user-needs-auth",
      nextAction: "complete-signup",
    },
    verificationFlowState: {
      status: "pending",
      nextActions: ["confirm-email-verification"],
    },
  });

  assert.equal(authenticationViewState.activeScreen, "signup");
  assert.equal(authenticationViewState.screens.signup.enabled, true);
  assert.equal(authenticationViewState.screens.login.enabled, false);
  assert.equal(authenticationViewState.summary.needsUserInput, true);
});

test("authentication screen states activates restore and loading states for session restore", () => {
  const { authenticationViewState } = buildAuthenticationScreenStates({
    authenticationRouteDecision: {
      decisionId: "decision-2",
      route: "session-restore",
      reason: "missing-active-session",
      nextAction: "restore-session",
    },
    verificationFlowState: {
      status: "verified",
      nextActions: [],
    },
  });

  assert.equal(authenticationViewState.activeScreen, "session-restore");
  assert.equal(authenticationViewState.screens.restoreSession.enabled, true);
  assert.equal(authenticationViewState.screens.loading.enabled, true);
  assert.equal(authenticationViewState.summary.needsUserInput, false);
});

test("authentication screen states exposes error state for expired verification", () => {
  const { authenticationViewState } = buildAuthenticationScreenStates({
    authenticationRouteDecision: {
      decisionId: "decision-3",
      route: "login",
      reason: "anonymous-entry",
      nextAction: "login",
    },
    verificationFlowState: {
      status: "expired",
      nextActions: ["request-new-verification-link"],
    },
  });

  assert.equal(authenticationViewState.activeScreen, "login");
  assert.equal(authenticationViewState.screens.error.enabled, true);
  assert.equal(authenticationViewState.screens.error.nextAction, "request-new-verification-link");
  assert.equal(authenticationViewState.summary.hasBlockingError, true);
});
