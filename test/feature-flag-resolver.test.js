import test from "node:test";
import assert from "node:assert/strict";

import { defineFeatureFlagSchema } from "../src/core/feature-flag-schema.js";
import { createFeatureFlagResolver } from "../src/core/feature-flag-resolver.js";

function buildDecision({
  featureDefinitions,
  requestContext,
} = {}) {
  const { featureFlagSchema } = defineFeatureFlagSchema({
    featureDefinitions,
    environmentConfig: {
      projectId: "giftwallet",
      environment: requestContext?.environment ?? "production",
    },
  });

  return createFeatureFlagResolver({
    featureFlagSchema,
    requestContext,
  }).featureFlagDecision;
}

test("feature flag resolver enforces kill switch override", () => {
  const decision = buildDecision({
    requestContext: {
      workspaceId: "giftwallet",
      userId: "user-1",
      environment: "production",
    },
  });

  const killSwitch = decision.flagResults.find((flag) => flag.flagId === "emergency-execution-stop");
  assert.equal(killSwitch.enabled, false);
  assert.equal(killSwitch.reason, "kill-switch");
});

test("feature flag resolver blocks environment mismatch", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "staging-only-flag",
        enabled: true,
        rolloutScope: "global",
        environmentTargets: ["staging"],
        defaultFallback: "disabled",
      },
    ],
    requestContext: {
      workspaceId: "giftwallet",
      userId: "user-1",
      environment: "production",
    },
  });

  const flag = decision.flagResults.find((entry) => entry.flagId === "staging-only-flag");
  assert.equal(flag.enabled, false);
  assert.equal(flag.reason, "env-mismatch");
});

test("feature flag resolver enforces workspace scope", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "workspace-flag",
        enabled: true,
        rolloutScope: "workspace",
        workspaceTargets: ["workspace-allowed"],
        environmentTargets: ["production"],
        defaultFallback: "disabled",
      },
    ],
    requestContext: {
      workspaceId: "workspace-blocked",
      userId: "user-1",
      environment: "production",
    },
  });

  const flag = decision.flagResults.find((entry) => entry.flagId === "workspace-flag");
  assert.equal(flag.enabled, false);
  assert.equal(flag.reason, "scope-excluded");
});

test("feature flag resolver enforces user scope", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "user-flag",
        enabled: true,
        rolloutScope: "global",
        userTargets: ["user-allowed"],
        environmentTargets: ["production"],
        defaultFallback: "disabled",
      },
    ],
    requestContext: {
      workspaceId: "giftwallet",
      userId: "user-blocked",
      environment: "production",
    },
  });

  const flag = decision.flagResults.find((entry) => entry.flagId === "user-flag");
  assert.equal(flag.enabled, false);
  assert.equal(flag.reason, "scope-excluded");
});

test("feature flag resolver applies deterministic percentage rollout", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "percentage-flag",
        enabled: true,
        rolloutScope: "percentage",
        rolloutPercentage: 100,
        environmentTargets: ["production"],
        defaultFallback: "disabled",
      },
    ],
    requestContext: {
      workspaceId: "giftwallet",
      userId: "user-1",
      environment: "production",
    },
  });

  const flag = decision.flagResults.find((entry) => entry.flagId === "percentage-flag");
  assert.equal(flag.enabled, true);
  assert.equal(flag.reason, "enabled");
});

test("feature flag resolver blocks anonymous percentage rollout deterministically", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "percentage-anon-flag",
        enabled: true,
        rolloutScope: "percentage",
        rolloutPercentage: 100,
        environmentTargets: ["production"],
        defaultFallback: "disabled",
      },
    ],
    requestContext: {
      workspaceId: "giftwallet",
      environment: "production",
    },
  });

  const flag = decision.flagResults.find((entry) => entry.flagId === "percentage-anon-flag");
  assert.equal(flag.enabled, false);
  assert.equal(flag.reason, "percentage-excluded");
});

test("feature flag resolver blocks risk sensitive flags on high risk", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "risk-flag",
        enabled: true,
        rolloutScope: "global",
        riskSensitive: true,
        environmentTargets: ["production"],
        defaultFallback: "disabled",
      },
    ],
    requestContext: {
      workspaceId: "giftwallet",
      userId: "user-1",
      environment: "production",
      riskLevel: "high",
    },
  });

  const flag = decision.flagResults.find((entry) => entry.flagId === "risk-flag");
  assert.equal(flag.enabled, false);
  assert.equal(flag.reason, "risk-blocked");
});

test("feature flag resolver returns blocked routes and enabled capabilities", () => {
  const decision = buildDecision({
    featureDefinitions: [
      {
        flagId: "provider-runtime-execution",
        enabled: true,
        rolloutScope: "global",
        environmentTargets: ["production"],
        riskSensitive: false,
      },
    ],
    requestContext: {
      workspaceId: "giftwallet",
      userId: "user-1",
      environment: "production",
    },
  });

  assert.equal(decision.enabledCapabilities.includes("provider-runtime-execution"), true);
  assert.equal(decision.blockedRoutes.some((entry) => entry.flagId === "emergency-execution-stop"), true);
});
