import test from "node:test";
import assert from "node:assert/strict";

import { defineProviderDegradationSchema } from "../src/core/provider-degradation-schema.js";

test("provider degradation schema marks outage when provider incidents and failures accumulate", () => {
  const { providerDegradationState } = defineProviderDegradationSchema({
    providerSession: {
      providerType: "hosting",
      status: "degraded",
    },
    incidentAlert: {
      status: "active",
      incidents: [
        {
          type: "connector-outage",
          affectedComponents: ["hosting-connector"],
        },
        {
          type: "connector-timeout",
          affectedComponents: ["hosting-adapter"],
        },
      ],
    },
  });

  assert.equal(providerDegradationState.providerType, "hosting");
  assert.equal(providerDegradationState.health, "outage");
  assert.equal(providerDegradationState.consecutiveFailures >= 3, true);
  assert.equal(providerDegradationState.cooldownWindowMs, 300000);
  assert.equal(providerDegradationState.probeState, "cooldown");
  assert.equal(providerDegradationState.summary.requiresCircuitBreaker, true);
});

test("provider degradation schema falls back to healthy generic provider", () => {
  const { providerDegradationState } = defineProviderDegradationSchema();

  assert.equal(providerDegradationState.providerType, "generic");
  assert.equal(providerDegradationState.health, "unknown");
  assert.equal(typeof providerDegradationState.cooldownWindowMs, "number");
  assert.equal(Array.isArray(providerDegradationState.degradedServiceFlags), true);
});

test("provider degradation schema normalizes malformed provider identifiers and statuses", () => {
  const { providerDegradationState } = defineProviderDegradationSchema({
    providerSession: {
      providerType: " hosting ",
      status: " DEGRADED ",
    },
    incidentAlert: {
      status: " ACTIVE ",
      incidents: [
        {
          affectedComponents: ["hosting-connector"],
        },
      ],
    },
  });

  assert.equal(providerDegradationState.degradationStateId, "provider-degradation:hosting");
  assert.equal(providerDegradationState.providerType, "hosting");
  assert.equal(providerDegradationState.health, "degraded");
  assert.equal(providerDegradationState.degradedServiceFlags.includes("incident-active"), true);
});
