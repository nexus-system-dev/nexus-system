import test from "node:test";
import assert from "node:assert/strict";

import { createSecuritySignals } from "../src/core/security-signals-schema.js";
import { createSessionSecurityControls } from "../src/core/session-security-controls.js";

test("session security controls block revoked sessions", () => {
  const { sessionSecurityDecision } = createSessionSecurityControls({
    sessionState: {
      status: "active",
      isRevoked: true,
    },
    securitySignals: {},
  });

  assert.equal(sessionSecurityDecision.decision, "invalidated");
  assert.equal(sessionSecurityDecision.isBlocked, true);
});

test("session security controls block expired sessions", () => {
  const { sessionSecurityDecision } = createSessionSecurityControls({
    sessionState: {
      status: "active",
      isRevoked: false,
      expiresAt: "2025-01-01T00:00:00.000Z",
      now: "2025-01-01T00:00:01.000Z",
    },
    securitySignals: {},
  });

  assert.equal(sessionSecurityDecision.decision, "expired");
  assert.equal(sessionSecurityDecision.isBlocked, true);
});

test("session security controls block suspicious sessions", () => {
  const { securitySignals } = createSecuritySignals({
    authSignals: {
      authFailures: 4,
    },
    anomalySignals: {
      suspiciousActivity: true,
    },
  });
  const { sessionSecurityDecision } = createSessionSecurityControls({
    sessionState: {
      status: "active",
      isRevoked: false,
      expiresAt: "2025-01-01T02:00:00.000Z",
      now: "2025-01-01T01:00:00.000Z",
    },
    securitySignals,
  });

  assert.equal(sessionSecurityDecision.decision, "suspicious");
  assert.equal(sessionSecurityDecision.isBlocked, true);
  assert.equal(sessionSecurityDecision.triggeredControls.includes("auth-failure-threshold"), true);
});

test("session security controls require rotation for long-lived sessions without blocking", () => {
  const { sessionSecurityDecision } = createSessionSecurityControls({
    sessionState: {
      status: "active",
      isRevoked: false,
      issuedAt: "2025-01-01T00:00:00.000Z",
      expiresAt: "2025-01-02T00:00:00.000Z",
      now: "2025-01-01T12:30:00.000Z",
    },
    securitySignals: {},
  });

  assert.equal(sessionSecurityDecision.decision, "rotation-required");
  assert.equal(sessionSecurityDecision.isBlocked, false);
  assert.equal(sessionSecurityDecision.requiresRotation, true);
});

test("session security controls keep valid sessions allowed", () => {
  const { securitySignals } = createSecuritySignals();
  const { sessionSecurityDecision } = createSessionSecurityControls({
    sessionState: {
      status: "active",
      isRevoked: false,
      issuedAt: "2025-01-01T00:00:00.000Z",
      expiresAt: "2025-01-01T04:00:00.000Z",
      now: "2025-01-01T01:00:00.000Z",
    },
    securitySignals,
  });

  assert.equal(sessionSecurityDecision.decision, "valid");
  assert.equal(sessionSecurityDecision.isBlocked, false);
  assert.equal(sessionSecurityDecision.requiresRotation, false);
});

test("session security controls normalizes custom revoke and rotation reasons", () => {
  const revoked = createSessionSecurityControls({
    sessionState: {
      isRevoked: true,
      revocationReason: " Manual revoke ",
    },
    securitySignals: {},
  }).sessionSecurityDecision;

  const rotation = createSessionSecurityControls({
    sessionState: {
      issuedAt: "2025-01-01T00:00:00.000Z",
      now: "2025-01-01T12:30:00.000Z",
      rotationReason: " Age threshold exceeded ",
    },
    securitySignals: {},
  }).sessionSecurityDecision;

  assert.equal(revoked.reason, "Manual revoke");
  assert.equal(rotation.reason, "Age threshold exceeded");
});
