import test from "node:test";
import assert from "node:assert/strict";

import { createFeatureDefinitionsRegistry } from "../src/core/feature-definitions-registry.js";
import { defineFeatureFlagSchema } from "../src/core/feature-flag-schema.js";

test("feature flag schema builds canonical schema from registry defaults", () => {
  const { featureFlagSchema } = defineFeatureFlagSchema();

  assert.equal(typeof featureFlagSchema.featureFlagSchemaId, "string");
  assert.equal(featureFlagSchema.summary.totalFlags >= 4, true);
  assert.equal(featureFlagSchema.flags.some((flag) => flag.flagId === "live-updates"), true);
});

test("feature definitions registry merges overrides onto defaults", () => {
  const { featureDefinitionsRegistry } = createFeatureDefinitionsRegistry({
    featureDefinitions: [
      {
        flagId: "live-updates",
        enabled: false,
        rolloutScope: "workspace",
      },
    ],
  });

  const liveUpdates = featureDefinitionsRegistry.find((flag) => flag.flagId === "live-updates");
  assert.equal(liveUpdates.enabled, false);
  assert.equal(liveUpdates.rolloutScope, "workspace");
});

test("feature flag schema normalizes environment targeting", () => {
  const { featureFlagSchema } = defineFeatureFlagSchema({
    environmentConfig: {
      environment: "preview",
    },
    featureDefinitions: [
      {
        flagId: "custom-flag",
        environmentTargets: ["prod", "dev"],
      },
    ],
  });

  assert.equal(featureFlagSchema.environmentConfig.environment, "staging");
  const customFlag = featureFlagSchema.flags.find((flag) => flag.flagId === "custom-flag");
  assert.deepEqual(customFlag.environmentTargets, ["production", "development"]);
});

test("feature flag schema enforces kill switch override", () => {
  const { featureFlagSchema } = defineFeatureFlagSchema({
    featureDefinitions: [
      {
        flagId: "emergency-execution-stop",
        enabled: true,
        isKillSwitch: true,
      },
    ],
  });

  const killSwitch = featureFlagSchema.flags.find((flag) => flag.flagId === "emergency-execution-stop");
  assert.equal(killSwitch.isKillSwitch, true);
  assert.equal(killSwitch.enabled, false);
});

test("feature flag schema keeps default fallback for partially defined flags", () => {
  const { featureFlagSchema } = defineFeatureFlagSchema({
    featureDefinitions: [
      {
        flagId: "provider-runtime-execution",
        enabled: true,
      },
    ],
  });

  const providerExecution = featureFlagSchema.flags.find((flag) => flag.flagId === "provider-runtime-execution");
  assert.equal(providerExecution.defaultFallback, "queue-and-review");
});

test("feature flag schema computes summary values", () => {
  const { featureFlagSchema } = defineFeatureFlagSchema();

  assert.equal(typeof featureFlagSchema.summary.totalFlags, "number");
  assert.equal(typeof featureFlagSchema.summary.enabledFlags, "number");
  assert.equal(typeof featureFlagSchema.summary.killSwitchesActive, "number");
  assert.equal(Array.isArray(featureFlagSchema.summary.environmentsTargeted), true);
});

test("feature flag schema normalizes malformed environment config and defaults", () => {
  const { featureFlagSchema } = defineFeatureFlagSchema({
    environmentConfig: {
      projectId: " giftwallet ",
      environment: " prod ",
      defaultMode: " gradual ",
      provider: " vercel ",
      target: " edge ",
      runtimeSource: " request-context ",
    },
    featureDefinitions: [
      {
        flagId: "custom-flag",
        description: " Custom flag ",
        defaultFallback: " disabled ",
      },
    ],
  });

  const customFlag = featureFlagSchema.flags.find((flag) => flag.flagId === "custom-flag");
  assert.equal(featureFlagSchema.featureFlagSchemaId, "feature-flag-schema:giftwallet");
  assert.equal(featureFlagSchema.environmentConfig.projectId, "giftwallet");
  assert.equal(featureFlagSchema.environmentConfig.environment, "production");
  assert.equal(featureFlagSchema.environmentConfig.provider, "vercel");
  assert.equal(customFlag.description, "Custom flag");
  assert.equal(customFlag.defaultFallback, "disabled");
});
