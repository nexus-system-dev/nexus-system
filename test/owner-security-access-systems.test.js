import test from "node:test";
import assert from "node:assert/strict";

import { createDeviceTrustSystem } from "../src/core/device-trust-system.js";
import { createSensitiveActionConfirmationSystem } from "../src/core/sensitive-action-confirmation-system.js";
import { createStepUpAuthenticationSystem } from "../src/core/step-up-authentication-system.js";
import { createPrivilegedModeSystem } from "../src/core/privileged-mode-system.js";
import { createAdminOnlyAccessLayer } from "../src/core/admin-only-access-layer.js";
import { createCriticalOperationGuardrails } from "../src/core/critical-operation-guardrails.js";

test("device trust system marks trusted owner device as trusted", () => {
  const { deviceTrustDecision } = createDeviceTrustSystem({
    ownerAuthState: { userId: "owner-1", isOwner: true },
    requestContext: {
      deviceId: "device-1",
      trustedDeviceIds: ["device-1"],
      deviceRiskLevel: "low",
      sessionPosture: "standard",
    },
  });

  assert.equal(deviceTrustDecision.decision, "trusted");
  assert.equal(deviceTrustDecision.isTrustedDevice, true);
});

test("sensitive action confirmation and privileged mode chain block until confirmation is satisfied", () => {
  const { sensitiveActionConfirmation } = createSensitiveActionConfirmationSystem({
    ownerMfaDecision: {
      decision: "challenge-required",
      requiresChallenge: true,
      hasEnrollment: true,
    },
    privilegedAuthorityDecision: {
      isPrivilegedAction: true,
      projectAction: "billing-change",
    },
  });
  const { stepUpAuthDecision } = createStepUpAuthenticationSystem({
    deviceTrustDecision: {
      deviceTrustDecisionId: "device-trust:1",
      decision: "trusted",
      deviceRiskLevel: "low",
      sessionPosture: "standard",
    },
    securitySignals: {
      suspiciousActivity: false,
      authFailures: 0,
    },
  });
  const { privilegedModeState } = createPrivilegedModeSystem({
    stepUpAuthDecision,
    sensitiveActionConfirmation,
  });

  assert.equal(sensitiveActionConfirmation.decision, "pending-confirmation");
  assert.equal(privilegedModeState.decision, "pending-step-up");
  assert.equal(privilegedModeState.canEnterPrivilegedMode, false);
});

test("admin-only access layer and critical operation guardrails allow confirmed owner operations", () => {
  const { privilegedModeState } = createPrivilegedModeSystem({
    stepUpAuthDecision: { stepUpAuthDecisionId: "step-up:1", decision: "not-required" },
    sensitiveActionConfirmation: { decision: "confirmed", isBlocked: false, requiresConfirmation: false },
    requestContext: { activatePrivilegedMode: true },
  });
  const { ownerAccessDecision } = createAdminOnlyAccessLayer({
    privilegedModeState,
    ownerControlPlane: { ownerRole: "owner" },
    requestContext: { route: "owner-dashboard" },
  });
  const { criticalOperationDecision } = createCriticalOperationGuardrails({
    ownerAccessDecision,
    sensitiveActionConfirmation: { decision: "confirmed" },
    requestContext: {
      operationType: "global-toggle",
      operationSensitivity: "critical",
    },
  });

  assert.equal(ownerAccessDecision.isAllowed, true);
  assert.equal(criticalOperationDecision.decision, "allow");
});
